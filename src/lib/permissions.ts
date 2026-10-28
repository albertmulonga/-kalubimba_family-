import { queryOne } from "./db";
import type { SessionUser } from "./auth";

export async function canUpdateMember(
  session: SessionUser,
  memberId: number,
): Promise<boolean> {
  if (session.isAdmin) return true;

  const target = await queryOne<{
    id: number;
    utilisateur_id: number | null;
    conjoint_id: number | null;
  }>(
    "SELECT id, utilisateur_id, conjoint_id FROM members WHERE id = $1",
    [memberId],
  );
  if (!target) return false;
  if (target.utilisateur_id === session.id) return true;

  const current = await queryOne<{
    id: number;
    conjoint_id: number | null;
  }>(
    "SELECT id, conjoint_id FROM members WHERE utilisateur_id = $1 ORDER BY id ASC LIMIT 1",
    [session.id],
  );
  if (!current) return false;

  if (target.id === current.conjoint_id) return true;

  const couple = await queryOne<{ id: number }>(
    `SELECT id FROM couples
     WHERE (member1_id = $1 AND member2_id = $2)
        OR (member2_id = $1 AND member1_id = $2)
     LIMIT 1`,
    [current.id, target.id],
  );
  return !!couple;
}

export async function canDeleteMember(
  session: SessionUser,
  memberId: number,
): Promise<boolean> {
  if (session.isAdmin) return true;
  const target = await queryOne<{ utilisateur_id: number | null }>(
    "SELECT utilisateur_id FROM members WHERE id = $1",
    [memberId],
  );
  return target?.utilisateur_id === session.id;
}

export async function canViewCredentials(
  session: SessionUser,
  member: { id: number; utilisateur_id: number | null },
) {
  if (member.utilisateur_id === null) return false;
  if (session.isAdmin) return true;
  if (member.utilisateur_id === session.id) return true;

  const link = await queryOne<{ id: number }>(
    `SELECT child.id
     FROM members child
     JOIN members parent ON parent.id IN (child.pere_id, child.mere_id)
     WHERE child.id = $1 AND parent.utilisateur_id = $2
     LIMIT 1`,
    [member.id, session.id],
  );

  return !!link;
}
