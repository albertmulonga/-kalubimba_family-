import { query, queryOne } from "./db";

export type UserRow = {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  matricule: string | null;
  photo: string | null;
  telephone: string | null;
  pays: string | null;
  ville: string | null;
  date_naissance: string | null;
  date_creation: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type MemberRow = {
  id: number;
  nom: string;
  prenom: string | null;
  nom_complet: string | null;
  genre: string | null;
  is_bloodline: boolean;
  date_naissance: string | null;
  date_deces: string | null;
  lieu: string | null;
  profession: string | null;
  adresse: string | null;
  nom_pere: string | null;
  nom_mere: string | null;
  photo: string | null;
  biographie: string | null;
  pere_id: number | null;
  mere_id: number | null;
  conjoint_id: number | null;
  utilisateur_id: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type MemberWithAccount = MemberRow & {
  user_email: string | null;
  user_matricule: string | null;
};

export type PhotoRow = {
  id: number;
  description: string | null;
  image: string;
  membre_id: number | null;
  utilisateur_id: number | null;
  date_publication: string;
  uploader_nom: string | null;
  uploader_prenom: string | null;
  member_nom: string | null;
  member_prenom: string | null;
};

export type VideoRow = {
  id: number;
  description: string | null;
  video: string;
  membre_id: number | null;
  utilisateur_id: number | null;
  date_publication: string;
  duree: string | null;
  uploader_nom: string | null;
  uploader_prenom: string | null;
  member_nom: string | null;
  member_prenom: string | null;
};

export type BookRow = {
  id: number;
  titre: string | null;
  description: string | null;
  contenu: string | null;
  file_path: string | null;
  date_publication: string | null;
  date_histoire: string | null;
  utilisateur_id: number | null;
  auteur_nom: string | null;
  auteur_prenom: string | null;
};

export type AncestorRow = {
  id: number;
  nom_complet: string;
  genre: string;
  role: string | null;
  photo: string | null;
  description: string | null;
  ordre: number;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type MessageRow = {
  id: number;
  expediteur_id: number;
  destinataire_id: number | null;
  reply_to_id: number | null;
  sujet: string | null;
  contenu: string;
  attachment_path: string | null;
  attachment_mime: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  type_message: string;
  lu: boolean;
  date_envoi: string;
  edited_at: string | null;
  sender_nom: string | null;
  sender_prenom: string | null;
  sender_photo: string | null;
  reply_contenu: string | null;
  reply_sender_nom: string | null;
  reply_sender_prenom: string | null;
};

export type DashboardStats = {
  members: number;
  living: number;
  deceased: number;
  users: number;
  photos: number;
  videos: number;
  books: number;
  reunions: number;
  relationships: number;
};

export async function getStats(): Promise<DashboardStats> {
  const row = await queryOne<DashboardStats>(`
    SELECT
      (SELECT count(*) FROM members)::int AS members,
      (SELECT count(*) FROM members WHERE date_deces IS NULL)::int AS living,
      (SELECT count(*) FROM members WHERE date_deces IS NOT NULL)::int AS deceased,
      (SELECT count(*) FROM users WHERE deleted_at IS NULL)::int AS users,
      (SELECT count(*) FROM photos)::int AS photos,
      (SELECT count(*) FROM videos)::int AS videos,
      (SELECT count(*) FROM family_books)::int AS books,
      (SELECT count(*) FROM reunions)::int AS reunions,
      (SELECT count(*) FROM relationships)::int AS relationships
  `);

  return (
    row ?? {
      members: 0,
      living: 0,
      deceased: 0,
      users: 0,
      photos: 0,
      videos: 0,
      books: 0,
      reunions: 0,
      relationships: 0,
    }
  );
}

const memberColumns = `
  m.id, m.nom, m.prenom, m.nom_complet, m.genre, m.is_bloodline,
  m.date_naissance, m.date_deces, m.lieu, m.profession, m.adresse,
  m.nom_pere, m.nom_mere, m.photo, m.biographie,
  m.pere_id, m.mere_id, m.conjoint_id, m.utilisateur_id,
  m.created_at, m.updated_at
`;

const memberSelect = `
  SELECT ${memberColumns}, u.email AS user_email, u.matricule AS user_matricule
  FROM members m
  LEFT JOIN users u ON u.id = m.utilisateur_id
`;

export async function getMemberPlainPassword(memberId: number): Promise<string | null> {
  const row = await queryOne<{ plain_password: string | null }>(
    "SELECT plain_password FROM members WHERE id = $1 AND utilisateur_id IS NOT NULL",
    [memberId],
  );
  return row?.plain_password ?? null;
}

export async function getRecentMembers(limit = 5): Promise<MemberWithAccount[]> {
  return query<MemberWithAccount>(
    `${memberSelect} ORDER BY m.created_at DESC NULLS LAST, m.id DESC LIMIT $1`,
    [limit],
  );
}

export async function getMembers(search?: string): Promise<MemberWithAccount[]> {
  const term = search?.trim();
  if (!term) {
    return query<MemberWithAccount>(
      `${memberSelect} WHERE m.utilisateur_id IS NOT NULL ORDER BY m.nom ASC, m.prenom ASC NULLS LAST, m.id ASC`,
    );
  }
  const like = `%${term}%`;
  return query<MemberWithAccount>(
    `${memberSelect}
     WHERE m.utilisateur_id IS NOT NULL
       AND (m.nom ILIKE $1 OR m.prenom ILIKE $1 OR m.nom_complet ILIKE $1
        OR m.profession ILIKE $1 OR m.lieu ILIKE $1)
     ORDER BY m.nom ASC, m.prenom ASC NULLS LAST, m.id ASC`,
    [like],
  );
}

export async function getMember(id: number): Promise<MemberWithAccount | null> {
  return queryOne<MemberWithAccount>(`${memberSelect} WHERE m.id = $1`, [id]);
}

export async function getMainMember(userId: number): Promise<MemberWithAccount | null> {
  const prioritized = await queryOne<MemberWithAccount>(
    `${memberSelect}
     WHERE m.utilisateur_id = $1
     ORDER BY
       (m.pere_id IS NOT NULL AND m.mere_id IS NOT NULL) DESC,
       (m.conjoint_id IS NOT NULL) DESC,
       m.id DESC
     LIMIT 1`,
    [userId],
  );
  if (prioritized) return prioritized;

  return queryOne<MemberWithAccount>(
    `${memberSelect} WHERE m.utilisateur_id = $1 ORDER BY m.id ASC LIMIT 1`,
    [userId],
  );
}

export async function getParentsOf(member: MemberRow): Promise<MemberRow[]> {
  const ids = [member.pere_id, member.mere_id].filter(
    (value): value is number => typeof value === "number",
  );
  if (ids.length === 0) return [];
  return query<MemberRow>(
    `SELECT ${memberColumns} FROM members m
     WHERE m.id = ANY($1::bigint[]) ORDER BY m.genre DESC`,
    [ids],
  );
}

export async function getChildrenOf(memberId: number): Promise<MemberWithAccount[]> {
  return query<MemberWithAccount>(
    `${memberSelect}
     WHERE m.pere_id = $1
        OR m.mere_id = $1
        OR m.id IN (SELECT r.child_id FROM relationships r WHERE r.parent_id = $1)
     ORDER BY m.date_naissance ASC NULLS LAST, m.id ASC`,
    [memberId],
  );
}

export async function getSpousesOf(memberId: number): Promise<MemberWithAccount[]> {
  return query<MemberWithAccount>(
    `${memberSelect}
     WHERE m.conjoint_id = $1
        OR m.id IN (
          SELECT CASE WHEN c.member1_id = $1 THEN c.member2_id ELSE c.member1_id END
          FROM couples c
          WHERE c.member1_id = $1 OR c.member2_id = $1
        )
     ORDER BY m.id ASC`,
    [memberId],
  );
}

export async function getAllMembers(): Promise<MemberRow[]> {
  return query<MemberRow>(
    `SELECT ${memberColumns} FROM members m
     ORDER BY COALESCE(m.date_naissance, DATE '1900-01-01') ASC, m.id ASC`,
  );
}

export type CoupleRow = {
  id: number;
  member1_id: number;
  member2_id: number;
  marriage_date: string | null;
  end_date: string | null;
  status: string;
};

export async function getCouples(): Promise<CoupleRow[]> {
  return query<CoupleRow>("SELECT * FROM couples ORDER BY id ASC");
}

export async function getRelationships() {
  return query<{
    id: number;
    parent_id: number;
    child_id: number;
    relationship_type: string;
  }>("SELECT * FROM relationships ORDER BY id ASC");
}

export async function getDeceasedMembers(): Promise<MemberWithAccount[]> {
  return query<MemberWithAccount>(
    `${memberSelect} WHERE m.date_deces IS NOT NULL ORDER BY m.date_deces DESC, m.id DESC`,
  );
}

export async function getAncestors(): Promise<AncestorRow[]> {
  return query<AncestorRow>(
    "SELECT * FROM ancestors ORDER BY ordre ASC, nom_complet ASC",
  );
}

export async function getAncestor(id: number): Promise<AncestorRow | null> {
  return queryOne<AncestorRow>("SELECT * FROM ancestors WHERE id = $1", [id]);
}

export async function getPhotos(memberId?: number): Promise<PhotoRow[]> {
  if (memberId) {
    return query<PhotoRow>(
      `SELECT p.*, u.nom AS uploader_nom, u.prenom AS uploader_prenom,
              m.nom AS member_nom, m.prenom AS member_prenom
       FROM photos p
       LEFT JOIN users u ON u.id = p.utilisateur_id
       LEFT JOIN members m ON m.id = p.membre_id
       WHERE p.membre_id = $1
       ORDER BY p.date_publication DESC, p.id DESC`,
      [memberId],
    );
  }
  return query<PhotoRow>(
    `SELECT p.*, u.nom AS uploader_nom, u.prenom AS uploader_prenom,
            m.nom AS member_nom, m.prenom AS member_prenom
     FROM photos p
     LEFT JOIN users u ON u.id = p.utilisateur_id
     LEFT JOIN members m ON m.id = p.membre_id
     ORDER BY p.date_publication DESC, p.id DESC`,
  );
}

export async function getVideos(memberId?: number, uploaderId?: number): Promise<VideoRow[]> {
  const params: unknown[] = [];
  let sql = `SELECT v.*, u.nom AS uploader_nom, u.prenom AS uploader_prenom, m.prenom AS member_prenom, m.nom AS member_nom
     FROM videos v
     LEFT JOIN users u ON u.id = v.utilisateur_id
     LEFT JOIN members m ON m.id = v.membre_id`;
  const clauses: string[] = [];
  if (memberId) {
    params.push(memberId);
    clauses.push(`v.membre_id = $${params.length}`);
  }
  if (uploaderId) {
    params.push(uploaderId);
    clauses.push(`v.utilisateur_id = $${params.length}`);
  }
  if (clauses.length) {
    sql += ` WHERE ${clauses.join(" AND ")}`;
  }
  sql += ` ORDER BY v.date_publication DESC, v.id DESC`;
  return query<VideoRow>(sql, params);
}

export async function getFamilyBooks(): Promise<BookRow[]> {
  return query<BookRow>(
    `SELECT b.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
     FROM family_books b
     LEFT JOIN users u ON u.id = b.utilisateur_id
     ORDER BY b.date_publication DESC NULLS LAST, b.id DESC`,
  );
}

export async function getFamilyBook(id: number): Promise<BookRow | null> {
  return queryOne<BookRow>(
    `SELECT b.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
     FROM family_books b
     LEFT JOIN users u ON u.id = b.utilisateur_id
     WHERE b.id = $1`,
    [id],
  );
}

export type ReunionRow = {
  id: number;
  titre: string;
  date_reunion: string;
  heure: string | null;
  lieu: string | null;
  resume: string | null;
  fichier_pdf: string | null;
  nombre_telechargements: number;
};

export async function getReunions(): Promise<ReunionRow[]> {
  return query<ReunionRow>(
    "SELECT * FROM reunions ORDER BY date_reunion DESC, id DESC",
  );
}

export async function getGroupMessages(afterId = 0, limit = 200): Promise<MessageRow[]> {
  return query<MessageRow>(
    `SELECT msg.*,
            sender.nom AS sender_nom, sender.prenom AS sender_prenom,
            sender.photo AS sender_photo,
            reply.contenu AS reply_contenu,
            reply_sender.nom AS reply_sender_nom,
            reply_sender.prenom AS reply_sender_prenom
     FROM messages msg
     LEFT JOIN users sender ON sender.id = msg.expediteur_id
     LEFT JOIN messages reply ON reply.id = msg.reply_to_id
     LEFT JOIN users reply_sender ON reply_sender.id = reply.expediteur_id
     WHERE msg.type_message = 'groupe' AND msg.id > $1
     ORDER BY msg.date_envoi ASC, msg.id ASC
     LIMIT $2`,
    [afterId, limit],
  );
}

export async function getChatThreads(userId: number) {
  return query<{
    other_id: number;
    nom: string;
    prenom: string;
    photo: string | null;
    last_message: string;
    last_date: string;
    unread: number;
  }>(
    `WITH conversation AS (
       SELECT
         CASE WHEN m.expediteur_id = $1 THEN m.destinataire_id ELSE m.expediteur_id END AS other_id,
         m.contenu,
         m.date_envoi,
         m.lu,
         m.expediteur_id,
         ROW_NUMBER() OVER (
           PARTITION BY CASE WHEN m.expediteur_id = $1 THEN m.destinataire_id ELSE m.expediteur_id END
           ORDER BY m.date_envoi DESC, m.id DESC
         ) AS rn
       FROM messages m
       WHERE m.type_message <> 'groupe'
         AND (m.expediteur_id = $1 OR m.destinataire_id = $1)
     )
     SELECT c.other_id, u.nom, u.prenom, u.photo,
            c.contenu AS last_message, c.date_envoi AS last_date,
            (
              SELECT count(*)::int FROM messages unread
              WHERE unread.expediteur_id = c.other_id
                AND unread.destinataire_id = $1
                AND unread.lu = FALSE
            ) AS unread
     FROM conversation c
     JOIN users u ON u.id = c.other_id
     WHERE c.rn = 1
     ORDER BY c.date_envoi DESC`,
    [userId],
  );
}

export async function getConversation(userId: number, otherId: number) {
  return query<MessageRow>(
    `SELECT msg.*,
            sender.nom AS sender_nom, sender.prenom AS sender_prenom,
            sender.photo AS sender_photo,
            reply.contenu AS reply_contenu,
            reply_sender.nom AS reply_sender_nom,
            reply_sender.prenom AS reply_sender_prenom
     FROM messages msg
     LEFT JOIN users sender ON sender.id = msg.expediteur_id
     LEFT JOIN messages reply ON reply.id = msg.reply_to_id
     LEFT JOIN users reply_sender ON reply_sender.id = reply.expediteur_id
     WHERE (msg.expediteur_id = $1 AND msg.destinataire_id = $2)
        OR (msg.expediteur_id = $2 AND msg.destinataire_id = $1)
     ORDER BY msg.date_envoi ASC, msg.id ASC`,
    [userId, otherId],
  );
}

export async function getUnreadMessages(userId: number) {
  const row = await queryOne<{ total: number }>(
    `SELECT count(*)::int AS total FROM messages
     WHERE destinataire_id = $1 AND lu = FALSE`,
    [userId],
  );
  return row?.total ?? 0;
}

export async function getAdminUsers(search?: string, trashed = false) {
  const term = search?.trim();
  const params: unknown[] = [];
  const clauses: string[] = [trashed ? "u.deleted_at IS NOT NULL" : "u.deleted_at IS NULL"];

  if (term) {
    params.push(`%${term}%`);
    clauses.push(
      `(u.nom ILIKE $${params.length} OR u.prenom ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.matricule ILIKE $${params.length})`,
    );
  }

  return query<
    UserRow & { member_photo: string | null; member_count: number }
  >(
    `SELECT u.*,
            photo.photo AS member_photo,
            (SELECT count(*)::int FROM members m2 WHERE m2.utilisateur_id = u.id) AS member_count
     FROM users u
     LEFT JOIN LATERAL (
       SELECT m.photo FROM members m
       WHERE m.utilisateur_id = u.id AND m.photo IS NOT NULL AND m.photo <> ''
       ORDER BY m.id ASC LIMIT 1
     ) photo ON TRUE
     WHERE ${clauses.join(" AND ")}
     ORDER BY ${trashed ? "u.deleted_at" : "u.date_creation"} DESC NULLS LAST, u.id DESC`,
    params,
  );
}

export async function getCurrentUser(id: number): Promise<UserRow | null> {
  return queryOne<UserRow>("SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL", [
    id,
  ]);
}

export async function getNextBirthdays() {
  const members = await query<MemberRow>(
    `SELECT ${memberColumns} FROM members m
     WHERE m.date_naissance IS NOT NULL AND m.date_deces IS NULL`,
  );
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return members
    .map((member) => {
      const birth = new Date(`${member.date_naissance}T12:00:00`);
      const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate(), 12);
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return {
        member,
        days: Math.round((next.getTime() - today.getTime()) / 86_400_000),
      };
    })
    .filter((item) => item.days <= 30)
    .sort((a, b) => a.days - b.days);
}
