import { query, queryOne, transaction } from "@/lib/db";

export type CallParticipant = {
  id: number;
  nom: string;
  prenom: string;
  photo: string | null;
  joined_at: string | null;
};

export type ActiveCall = {
  id: number;
  type: "audio" | "video";
  status: string;
  initiated_by: number;
  initiator_name: string;
  started_at: string | null;
  duration: string;
  participants: CallParticipant[];
  is_joined: boolean;
};

type CallRow = {
  id: number;
  type: "audio" | "video";
  status: string;
  initiated_by: number;
  started_at: string | null;
  ended_at: string | null;
  initiator_nom: string | null;
  initiator_prenom: string | null;
};

function formatDuration(startedAt: string | null) {
  if (!startedAt) return "00:00";
  const started = new Date(startedAt).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const base = `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  return hours > 0 ? `${String(hours).padStart(2, "0")}:${base}` : base;
}

async function participantsFor(callId: number): Promise<CallParticipant[]> {
  return query<CallParticipant>(
    `SELECT u.id, u.nom, u.prenom, u.photo, cp.joined_at
     FROM call_participants cp
     JOIN users u ON u.id = cp.user_id
     WHERE cp.call_id = $1 AND cp.left_at IS NULL
     ORDER BY cp.joined_at ASC NULLS LAST, u.prenom ASC`,
    [callId],
  );
}

async function formatCall(row: CallRow, userId: number): Promise<ActiveCall> {
  const participants = await participantsFor(row.id);
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    initiated_by: row.initiated_by,
    initiator_name:
      [row.initiator_prenom, row.initiator_nom].filter(Boolean).join(" ").trim() ||
      "Un membre",
    started_at: row.started_at,
    duration: formatDuration(row.started_at),
    participants,
    is_joined: participants.some((participant) => participant.id === userId),
  };
}

const CALL_SELECT = `
  SELECT c.*, u.nom AS initiator_nom, u.prenom AS initiator_prenom
  FROM calls c
  LEFT JOIN users u ON u.id = c.initiated_by
`;

export async function getActiveCall(userId: number): Promise<ActiveCall | null> {
  const row = await queryOne<CallRow>(
    `${CALL_SELECT} WHERE c.status = 'active' ORDER BY c.id DESC LIMIT 1`,
  );
  return row ? formatCall(row, userId) : null;
}

export async function getCall(
  callId: number,
  userId: number,
): Promise<ActiveCall | null> {
  const row = await queryOne<CallRow>(`${CALL_SELECT} WHERE c.id = $1`, [callId]);
  return row ? formatCall(row, userId) : null;
}

async function joinExistingCall(callId: number, userId: number) {
  await query(
    `INSERT INTO call_participants
       (call_id, user_id, joined_at, left_at, created_at, updated_at)
     VALUES ($1, $2, now(), NULL, now(), now())
     ON CONFLICT (call_id, user_id)
     DO UPDATE SET joined_at = now(), left_at = NULL, updated_at = now()`,
    [callId, userId],
  );
}

export async function startOrJoinCall(
  userId: number,
  type: "audio" | "video",
): Promise<ActiveCall> {
  const callId = await transaction(async (client) => {
    const active = await client.query<{ id: number }>(
      `SELECT id FROM calls WHERE status = 'active' ORDER BY id DESC LIMIT 1 FOR UPDATE`,
    );

    if (active.rows[0]) {
      return active.rows[0].id;
    }

    const inserted = await client.query<{ id: number }>(
      `INSERT INTO calls
         (initiated_by, type, status, started_at, created_at, updated_at)
       VALUES ($1, $2, 'active', now(), now(), now())
       RETURNING id`,
      [userId, type],
    );
    return inserted.rows[0].id;
  });

  await joinExistingCall(callId, userId);
  const call = await getCall(callId, userId);
  if (!call) throw new Error("Appel introuvable.");
  return call;
}

export async function joinCall(callId: number, userId: number) {
  const call = await getCall(callId, userId);
  if (!call) return null;
  if (call.status !== "active") throw new Error("Cet appel est déjà terminé.");
  await joinExistingCall(callId, userId);
  return getCall(callId, userId);
}

export async function leaveCall(callId: number, userId: number) {
  await query(
    `UPDATE call_participants
     SET left_at = now(), updated_at = now()
     WHERE call_id = $1 AND user_id = $2 AND left_at IS NULL`,
    [callId, userId],
  );
  return getCall(callId, userId);
}

export async function endCall(
  callId: number,
  userId: number,
  isAdmin: boolean,
) {
  const row = await queryOne<{ initiated_by: number; status: string }>(
    "SELECT initiated_by, status FROM calls WHERE id = $1",
    [callId],
  );
  if (!row) return { error: "Appel introuvable.", status: 404 as const };
  if (row.status !== "active") {
    return { error: "Cet appel est déjà terminé.", status: 400 as const };
  }
  if (!isAdmin && Number(row.initiated_by) !== userId) {
    return { error: "Vous ne pouvez pas terminer cet appel.", status: 403 as const };
  }

  await transaction(async (client) => {
    await client.query(
      `UPDATE call_participants
       SET left_at = now(), updated_at = now()
       WHERE call_id = $1 AND left_at IS NULL`,
      [callId],
    );
    await client.query(
      `UPDATE calls SET status = 'ended', ended_at = now(), updated_at = now()
       WHERE id = $1`,
      [callId],
    );
  });

  return { call: await getCall(callId, userId) };
}
