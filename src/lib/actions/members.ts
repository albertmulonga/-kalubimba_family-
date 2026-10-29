"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query, queryOne, transaction } from "../db";
import { requireSession } from "../auth";
import { canDeleteMember, canUpdateMember } from "../permissions";
import { withMessage } from "../flash";
import { saveUpload, stringValue } from "../storage";
import { genderValue } from "../format";

function memberLink(id: number) {
  return `/members/${id}`;
}

async function refreshMemberPaths(id: number) {
  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath(memberLink(id));
  revalidatePath("/family-tree");
}

export async function createMemberAction(formData: FormData) {
  const session = await requireSession();
  const nom = stringValue(formData.get("nom"));
  const prenom = stringValue(formData.get("prenom"));

  if (!nom || !prenom) {
    redirect(withMessage("/members/new", "error", "Le nom et le prénom sont obligatoires."));
  }

  const genre = genderValue(stringValue(formData.get("genre")));
  const dateNaissance = stringValue(formData.get("date_naissance"));
  const dateDeces = stringValue(formData.get("date_deces"));
  const lieu = stringValue(formData.get("lieu"));
  const profession = stringValue(formData.get("profession"));
  const adresse = stringValue(formData.get("adresse"));
  const biographie = stringValue(formData.get("biographie"));
  const nomPere = stringValue(formData.get("nom_pere"));
  const nomMere = stringValue(formData.get("nom_mere"));
  const pereId = Number(formData.get("pere_id")) || null;
  const mereId = Number(formData.get("mere_id")) || null;
  const isBloodline = formData.get("is_bloodline") === "1";

  const photo = await saveUpload(formData.get("photo"), "photos").catch(() => null)
    ?? (stringValue(formData.get("photo_url")) || null);

  const created = await queryOne<{ id: number }>(
    `INSERT INTO members
       (nom, prenom, nom_complet, genre, is_bloodline, date_naissance, date_deces,
        lieu, profession, adresse, biographie, nom_pere, nom_mere, photo,
        pere_id, mere_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, now(), now())
     RETURNING id`,
    [
      nom,
      prenom,
      `${prenom} ${nom}`.trim(),
      genre,
      isBloodline,
      dateNaissance,
      dateDeces,
      lieu,
      profession,
      adresse,
      biographie,
      nomPere,
      nomMere,
      photo,
      pereId,
      mereId,
    ],
  );

  const id = created?.id;
  if (!id) {
    redirect(withMessage("/members/new", "error", "Impossible de créer le membre."));
  }

  if (pereId) {
    await query(
      "INSERT INTO relationships (parent_id, child_id, relationship_type) VALUES ($1,$2,'parent-child') ON CONFLICT DO NOTHING",
      [pereId, id],
    );
  }
  if (mereId) {
    await query(
      "INSERT INTO relationships (parent_id, child_id, relationship_type) VALUES ($1,$2,'parent-child') ON CONFLICT DO NOTHING",
      [mereId, id],
    );
  }

  await refreshMemberPaths(id);
  redirect(withMessage(memberLink(id), "success", "Membre ajouté avec succès."));
}

export async function updateMemberAction(memberId: number, formData: FormData) {
  const session = await requireSession();
  if (!(await canUpdateMember(session, memberId))) {
    redirect(withMessage(memberLink(memberId), "error", "Vous n'avez pas la permission de modifier ce membre."));
  }

  const nom = stringValue(formData.get("nom"));
  const prenom = stringValue(formData.get("prenom"));
  if (!nom || !prenom) {
    redirect(withMessage(`/members/${memberId}/edit`, "error", "Le nom et le prénom sont obligatoires."));
  }

  const genre = genderValue(stringValue(formData.get("genre")));
  const dateNaissance = stringValue(formData.get("date_naissance"));
  const dateDeces = stringValue(formData.get("date_deces"));
  const lieu = stringValue(formData.get("lieu"));
  const profession = stringValue(formData.get("profession"));
  const adresse = stringValue(formData.get("adresse"));
  const biographie = stringValue(formData.get("biographie"));
  const nomPere = stringValue(formData.get("nom_pere"));
  const nomMere = stringValue(formData.get("nom_mere"));
  const pereId = Number(formData.get("pere_id")) || null;
  const mereId = Number(formData.get("mere_id")) || null;
  const isBloodline = formData.get("is_bloodline") === "1";
  const removePhoto = formData.get("remove_photo") === "1";

  const newPhoto = await saveUpload(formData.get("photo"), "photos").catch(() => null)
    ?? (stringValue(formData.get("photo_url")) || null);

  const current = await queryOne<{ photo: string | null }>(
    "SELECT photo FROM members WHERE id = $1",
    [memberId],
  );

  await query(
    `UPDATE members SET
       nom = $1, prenom = $2, nom_complet = $3, genre = $4, is_bloodline = $5,
       date_naissance = $6, date_deces = $7, lieu = $8, profession = $9,
       adresse = $10, biographie = $11, nom_pere = $12, nom_mere = $13,
       photo = $14, pere_id = $15, mere_id = $16, updated_at = now()
     WHERE id = $17`,
    [
      nom,
      prenom,
      `${prenom} ${nom}`.trim(),
      genre,
      isBloodline,
      dateNaissance,
      dateDeces,
      lieu,
      profession,
      adresse,
      biographie,
      nomPere,
      nomMere,
      newPhoto ?? (removePhoto ? null : current?.photo ?? null),
      pereId,
      mereId,
      memberId,
    ],
  );

  if (pereId) {
    await query(
      "INSERT INTO relationships (parent_id, child_id, relationship_type) VALUES ($1,$2,'parent-child') ON CONFLICT DO NOTHING",
      [pereId, memberId],
    );
  }
  if (mereId) {
    await query(
      "INSERT INTO relationships (parent_id, child_id, relationship_type) VALUES ($1,$2,'parent-child') ON CONFLICT DO NOTHING",
      [mereId, memberId],
    );
  }

  await refreshMemberPaths(memberId);
  redirect(withMessage(memberLink(memberId), "success", "Profil mis à jour avec succès."));
}

export async function deleteMemberAction(memberId: number) {
  const session = await requireSession();
  if (!(await canDeleteMember(session, memberId))) {
    redirect(withMessage(memberLink(memberId), "error", "Seul le propriétaire peut supprimer ce membre."));
  }

  await transaction(async (client) => {
    await client.query(
      "UPDATE members SET conjoint_id = NULL WHERE conjoint_id = $1",
      [memberId],
    );
    await client.query(
      "UPDATE members SET pere_id = NULL WHERE pere_id = $1",
      [memberId],
    );
    await client.query(
      "UPDATE members SET mere_id = NULL WHERE mere_id = $1",
      [memberId],
    );
    await client.query("DELETE FROM members WHERE id = $1", [memberId]);
  });

  revalidatePath("/members");
  revalidatePath("/family-tree");
  revalidatePath("/dashboard");
  redirect(withMessage("/members", "success", "Membre supprimé."));
}
