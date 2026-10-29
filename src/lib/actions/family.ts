"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PoolClient } from "pg";
import { query, queryOne, transaction } from "../db";
import { requireSession } from "../auth";
import { canUpdateMember } from "../permissions";
import { withMessage } from "../flash";
import { saveUpload, stringValue } from "../storage";
import { genderValue } from "../format";
import { generateMatricule } from "../matricule";
import { getMainMember } from "../data";
import { shouldCreateChildAccount } from "../family-rules";

function splitFullName(input: string) {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nom: "", prenom: "" };
  if (parts.length === 1) return { nom: parts[0], prenom: parts[0] };
  const nom = parts.pop() as string;
  return { nom, prenom: parts.join(" ") };
}

function revalidateFamily(memberId?: number) {
  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/family-tree");
  if (memberId) revalidatePath(`/members/${memberId}`);
}

async function upsertRelationship(
  client: PoolClient,
  parentId: number,
  childId: number,
) {
  if (parentId === childId) return;
  await client.query(
    `INSERT INTO relationships (parent_id, child_id, relationship_type, created_at, updated_at)
     VALUES ($1, $2, 'parent-child', now(), now())
     ON CONFLICT (parent_id, child_id) DO NOTHING`,
    [parentId, childId],
  );
}

async function resolveTargetId(formData: FormData, sessionId: number) {
  const requested = Number(formData.get("member_id"));
  if (Number.isFinite(requested) && requested > 0) return requested;
  const main = await getMainMember(sessionId);
  return main?.id ?? null;
}

export async function addParentsAction(formData: FormData) {
  const session = await requireSession();
  const targetId = await resolveTargetId(formData, session.id);

  if (!targetId) {
    redirect(withMessage("/family-tree/add-parents", "error", "Aucun membre cible trouvé."));
  }
  if (!(await canUpdateMember(session, targetId))) {
    redirect(withMessage(`/members/${targetId}`, "error", "Vous n'avez pas la permission de modifier ce membre."));
  }

  const target = await queryOne<{ id: number; pere_id: number | null; mere_id: number | null }>(
    "SELECT id, pere_id, mere_id FROM members WHERE id = $1",
    [targetId],
  );
  if (!target) {
    redirect(withMessage("/family-tree/add-parents", "error", "Membre introuvable."));
  }

  const fatherName = stringValue(formData.get("pere_nom_complet"));
  const motherName = stringValue(formData.get("mere_nom_complet"));

  if (!fatherName && !motherName) {
    redirect(withMessage(`/family-tree/add-parents?member_id=${targetId}`, "error", "Renseignez au moins un parent."));
  }

  const fatherPhoto = await saveUpload(formData.get("pere_photo"), "photos").catch(() => null)
    ?? (stringValue(formData.get("pere_photo_url")) || null);
  const motherPhoto = await saveUpload(formData.get("mere_photo"), "photos").catch(() => null)
    ?? (stringValue(formData.get("mere_photo_url")) || null);

  try {
    await transaction(async (client) => {
      let fatherId: number | null = null;
      let motherId: number | null = null;

      if (fatherName) {
        const { nom, prenom } = splitFullName(fatherName);
        const values = [
          nom,
          prenom,
          fatherName,
          stringValue(formData.get("pere_date_naissance")),
          stringValue(formData.get("pere_lieu")),
          stringValue(formData.get("pere_profession")),
          fatherPhoto,
        ];

        if (target.pere_id) {
          fatherId = target.pere_id;
          await client.query(
            `UPDATE members SET nom=$1, prenom=$2, nom_complet=$3, date_naissance=$4,
               lieu=$5, profession=$6, photo=COALESCE($7, photo), genre='male',
               is_bloodline=TRUE, updated_at=now()
             WHERE id=$8`,
            [...values, fatherId],
          );
        } else {
          const inserted = await client.query<{ id: number }>(
            `INSERT INTO members
               (nom, prenom, nom_complet, date_naissance, lieu, profession, photo,
                genre, is_bloodline, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,'male',TRUE, now(), now())
             RETURNING id`,
            values,
          );
          fatherId = inserted.rows[0].id;
          await client.query("UPDATE members SET pere_id=$1, updated_at=now() WHERE id=$2", [
            fatherId,
            targetId,
          ]);
        }
        await upsertRelationship(client, fatherId, targetId);
      }

      if (motherName) {
        const { nom, prenom } = splitFullName(motherName);
        const values = [
          nom,
          prenom,
          motherName,
          stringValue(formData.get("mere_date_naissance")),
          stringValue(formData.get("mere_lieu")),
          stringValue(formData.get("mere_profession")),
          motherPhoto,
        ];

        if (target.mere_id) {
          motherId = target.mere_id;
          await client.query(
            `UPDATE members SET nom=$1, prenom=$2, nom_complet=$3, date_naissance=$4,
               lieu=$5, profession=$6, photo=COALESCE($7, photo), genre='female',
               is_bloodline=TRUE, updated_at=now()
             WHERE id=$8`,
            [...values, motherId],
          );
        } else {
          const inserted = await client.query<{ id: number }>(
            `INSERT INTO members
               (nom, prenom, nom_complet, date_naissance, lieu, profession, photo,
                genre, is_bloodline, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,'female',TRUE, now(), now())
             RETURNING id`,
            values,
          );
          motherId = inserted.rows[0].id;
          await client.query("UPDATE members SET mere_id=$1, updated_at=now() WHERE id=$2", [
            motherId,
            targetId,
          ]);
        }
        await upsertRelationship(client, motherId, targetId);
      }

      if (fatherId && motherId) {
        await client.query("UPDATE members SET conjoint_id=$1 WHERE id=$2", [
          motherId,
          fatherId,
        ]);
        await client.query("UPDATE members SET conjoint_id=$1 WHERE id=$2", [
          fatherId,
          motherId,
        ]);
        await client.query(
          `INSERT INTO couples (member1_id, member2_id, status, created_at, updated_at)
           VALUES ($1, $2, 'active', now(), now())
           ON CONFLICT (member1_id, member2_id) DO NOTHING`,
          [fatherId, motherId],
        );
      }
    });
  } catch (error) {
    console.error("addParentsAction", error);
    redirect(withMessage(`/family-tree/add-parents?member_id=${targetId}`, "error", "Impossible d'enregistrer les parents."));
  }

  revalidateFamily(targetId);
  redirect(withMessage(`/members/${targetId}`, "success", "Parents enregistrés avec succès."));
}

export async function addChildAction(formData: FormData) {
  const session = await requireSession();
  const parentId = await resolveTargetId(formData, session.id);

  if (!parentId) {
    redirect(withMessage("/family-tree/add-children", "error", "Aucun parent cible trouvé."));
  }
  if (!(await canUpdateMember(session, parentId))) {
    redirect(withMessage(`/members/${parentId}`, "error", "Vous n'avez pas la permission d'ajouter un enfant à ce membre."));
  }

  const parent = await queryOne<{
    id: number;
    genre: string | null;
    is_bloodline: boolean;
    utilisateur_id: number | null;
    conjoint_id: number | null;
  }>(
    "SELECT id, genre, is_bloodline, utilisateur_id, conjoint_id FROM members WHERE id = $1",
    [parentId],
  );
  if (!parent) {
    redirect(withMessage("/family-tree/add-children", "error", "Parent introuvable."));
  }

  const fullName = stringValue(formData.get("nom_complet"));
  if (!fullName) {
    redirect(withMessage(`/family-tree/add-children?member_id=${parentId}`, "error", "Le nom complet de l'enfant est obligatoire."));
  }

  const { nom, prenom } = splitFullName(fullName);
  const genre = genderValue(stringValue(formData.get("genre")));
  const dateNaissance = stringValue(formData.get("date_naissance"));
  const lieu = stringValue(formData.get("lieu"));
  const profession = stringValue(formData.get("profession"));
  const nomPere = stringValue(formData.get("nom_pere"));
  const nomMere = stringValue(formData.get("nom_mere"));
  const photo = await saveUpload(formData.get("photo"), "photos").catch(() => null)
    ?? (stringValue(formData.get("photo_url")) || null);

  const requestedPassword = stringValue(formData.get("mot_de_passe_enfant"));
  const passwordConfirmation = stringValue(
    formData.get("mot_de_passe_enfant_confirmation"),
  );

  const spouse = parent.conjoint_id
    ? await queryOne<{ id: number; genre: string | null }>(
        "SELECT id, genre FROM members WHERE id = $1",
        [parent.conjoint_id],
      )
    : null;

  let fatherId: number | null = null;
  let motherId: number | null = null;
  if (parent.genre === "male") {
    fatherId = parent.id;
    motherId = spouse?.id ?? null;
  } else if (parent.genre === "female") {
    motherId = parent.id;
    fatherId = spouse?.id ?? null;
  }

  const childIsBloodline = parent.genre === "male" && parent.is_bloodline;
  const shouldCreateAccount = await shouldCreateChildAccount(session, parent);

  if (shouldCreateAccount) {
    if (!requestedPassword || requestedPassword.length < 6) {
      redirect(
        withMessage(
          `/family-tree/add-children?member_id=${parentId}`,
          "error",
          "Le mot de passe du compte enfant doit contenir au moins 6 caractères.",
        ),
      );
    }
    if (requestedPassword !== passwordConfirmation) {
      redirect(
        withMessage(
          `/family-tree/add-children?member_id=${parentId}`,
          "error",
          "Les deux mots de passe de l'enfant ne correspondent pas.",
        ),
      );
    }
  }

  const plainPassword = shouldCreateAccount ? requestedPassword : null;

  let matricule: string | null = null;

  try {
    await transaction(async (client) => {
      let childUserId: number | null = null;

      if (shouldCreateAccount) {
        matricule = await generateMatricule();
        const hashed = await hash(plainPassword as string, 12);
        const userResult = await client.query<{ id: number }>(
          `INSERT INTO users
             (nom, prenom, matricule, email, mot_de_passe, date_naissance,
              date_creation, updated_at)
           VALUES ($1,$2,$3,NULL,$4,$5, now(), now())
           RETURNING id`,
          [nom, prenom, matricule, hashed, dateNaissance],
        );
        childUserId = userResult.rows[0].id;
      }

      const childResult = await client.query<{ id: number }>(
        `INSERT INTO members
           (nom, prenom, nom_complet, genre, is_bloodline, date_naissance, lieu,
            profession, nom_pere, nom_mere, photo, pere_id, mere_id,
            utilisateur_id, plain_password, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, now(), now())
         RETURNING id`,
        [
          nom,
          prenom,
          fullName,
          genre,
          childIsBloodline,
          dateNaissance,
          lieu,
          profession,
          nomPere,
          nomMere,
          photo,
          fatherId,
          motherId,
          childUserId,
          plainPassword,
        ],
      );

      const childId = childResult.rows[0].id;
      await upsertRelationship(client, parent.id, childId);
      if (spouse) await upsertRelationship(client, spouse.id, childId);
    });
  } catch (error) {
    console.error("addChildAction", error);
    redirect(withMessage(`/family-tree/add-children?member_id=${parentId}`, "error", "Impossible d'ajouter l'enfant."));
  }

  revalidateFamily(parentId);
  const message = matricule
    ? `Enfant ajouté. Compte créé — Matricule : ${matricule} · Mot de passe : ${plainPassword}`
    : "Enfant ajouté avec succès.";
  redirect(withMessage(`/members/${parentId}`, "success", message));
}

export async function addSpouseAction(formData: FormData) {
  const session = await requireSession();
  const targetId = await resolveTargetId(formData, session.id);

  if (!targetId) {
    redirect(withMessage("/family-tree/add-spouse", "error", "Aucun membre cible trouvé."));
  }
  if (!(await canUpdateMember(session, targetId))) {
    redirect(withMessage(`/members/${targetId}`, "error", "Vous n'avez pas la permission de modifier ce membre."));
  }

  const target = await queryOne<{
    id: number;
    genre: string | null;
    is_bloodline: boolean;
    conjoint_id: number | null;
  }>("SELECT id, genre, is_bloodline, conjoint_id FROM members WHERE id = $1", [
    targetId,
  ]);
  if (!target) {
    redirect(withMessage("/family-tree/add-spouse", "error", "Membre introuvable."));
  }

  const fullName = stringValue(formData.get("spouse_nom_complet"));
  if (!fullName) {
    redirect(withMessage(`/family-tree/add-spouse?member_id=${targetId}`, "error", "Le nom complet du conjoint est obligatoire."));
  }

  const { nom, prenom } = splitFullName(fullName);
  const genre = genderValue(stringValue(formData.get("spouse_genre")));
  const dateNaissance = stringValue(formData.get("spouse_date_naissance"));
  const lieu = stringValue(formData.get("spouse_lieu"));
  const profession = stringValue(formData.get("spouse_profession"));
  const adresse = stringValue(formData.get("spouse_adresse"));
  const nomPere = stringValue(formData.get("spouse_nom_pere"));
  const nomMere = stringValue(formData.get("spouse_nom_mere"));
  const photo = await saveUpload(formData.get("spouse_photo"), "photos").catch(() => null)
    ?? (stringValue(formData.get("spouse_photo_url")) || null);

  const spouseBloodline = target.genre === "male" && target.is_bloodline;

  try {
    await transaction(async (client) => {
      let spouseId = target.conjoint_id;

      if (spouseId) {
        await client.query(
          `UPDATE members SET nom=$1, prenom=$2, nom_complet=$3, genre=$4,
             date_naissance=$5, lieu=$6, profession=$7, adresse=$8,
             nom_pere=$9, nom_mere=$10, photo=COALESCE($11, photo),
             is_bloodline=$12, updated_at=now()
           WHERE id=$13`,
          [
            nom,
            prenom,
            fullName,
            genre,
            dateNaissance,
            lieu,
            profession,
            adresse,
            nomPere,
            nomMere,
            photo,
            spouseBloodline,
            spouseId,
          ],
        );
      } else {
        const inserted = await client.query<{ id: number }>(
          `INSERT INTO members
             (nom, prenom, nom_complet, genre, date_naissance, lieu, profession,
              adresse, nom_pere, nom_mere, photo, is_bloodline, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now(), now())
           RETURNING id`,
          [
            nom,
            prenom,
            fullName,
            genre,
            dateNaissance,
            lieu,
            profession,
            adresse,
            nomPere,
            nomMere,
            photo,
            spouseBloodline,
          ],
        );
        spouseId = inserted.rows[0].id;
      }

      await client.query("UPDATE members SET conjoint_id=$1, updated_at=now() WHERE id=$2", [
        spouseId,
        targetId,
      ]);
      await client.query("UPDATE members SET conjoint_id=$1, updated_at=now() WHERE id=$2", [
        targetId,
        spouseId,
      ]);

      const existing = await client.query<{ id: number }>(
        `SELECT id FROM couples
         WHERE (member1_id=$1 AND member2_id=$2) OR (member1_id=$2 AND member2_id=$1)
         LIMIT 1`,
        [targetId, spouseId],
      );
      if (existing.rowCount === 0) {
        await client.query(
          `INSERT INTO couples (member1_id, member2_id, status, created_at, updated_at)
           VALUES ($1,$2,'active', now(), now())`,
          [targetId, spouseId],
        );
      }
    });
  } catch (error) {
    console.error("addSpouseAction", error);
    redirect(withMessage(`/family-tree/add-spouse?member_id=${targetId}`, "error", "Impossible d'enregistrer le conjoint."));
  }

  revalidateFamily(targetId);
  redirect(withMessage(`/members/${targetId}`, "success", "Conjoint enregistré avec succès."));
}

export async function addDeceasedAction(formData: FormData) {
  const session = await requireSession();
  const targetId = await resolveTargetId(formData, session.id);
  const fullName = stringValue(formData.get("nom_complet"));
  const dateDeces = stringValue(formData.get("date_deces"));

  if (!fullName || !dateDeces) {
    redirect(withMessage("/family-tree/add-deceased", "error", "Le nom complet et la date de décès sont obligatoires."));
  }

  const { nom, prenom } = splitFullName(fullName);
  const genre = genderValue(stringValue(formData.get("genre")));
  const photo = await saveUpload(formData.get("photo"), "photos").catch(() => null);

  const created = await queryOne<{ id: number }>(
    `INSERT INTO members
       (nom, prenom, nom_complet, genre, is_bloodline, date_naissance, date_deces,
        lieu, profession, adresse, nom_pere, nom_mere, photo, biographie,
        created_at, updated_at)
     VALUES ($1,$2,$3,$4,TRUE,$5,$6,$7,$8,$9,$10,$11,$12,$13, now(), now())
     RETURNING id`,
    [
      nom,
      prenom,
      fullName,
      genre,
      stringValue(formData.get("date_naissance")),
      dateDeces,
      stringValue(formData.get("lieu")),
      stringValue(formData.get("profession")),
      stringValue(formData.get("adresse")),
      stringValue(formData.get("nom_pere")),
      stringValue(formData.get("nom_mere")),
      photo,
      stringValue(formData.get("biographie")),
    ],
  );

  revalidateFamily(targetId ?? created?.id);

  const redirectTo = targetId ? `/members/${targetId}` : "/memorial";
  redirect(withMessage(redirectTo, "success", "Personne décédée ajoutée. Elle apparaît désormais dans le mémorial."));
}

export async function removeChildLinkAction(childId: number, parentId: number) {
  const session = await requireSession();
  if (!(await canUpdateMember(session, parentId))) {
    redirect(withMessage(`/family-tree`, "error", "Permission refusée."));
  }

  await transaction(async (client) => {
    // Détacher le père ou la mère selon le parent
    await client.query(
      `UPDATE members SET pere_id = CASE WHEN pere_id = $1 THEN NULL ELSE pere_id END,
         mere_id = CASE WHEN mere_id = $1 THEN NULL ELSE mere_id END,
         updated_at = now()
       WHERE id = $2`,
      [parentId, childId],
    );
    // Supprimer le lien dans relationships
    await client.query(
      `DELETE FROM relationships WHERE parent_id = $1 AND child_id = $2`,
      [parentId, childId],
    );
  });

  revalidateFamily(parentId);
  redirect(withMessage("/family-tree", "success", "Lien enfant supprimé."));
}

export async function removeParentLinkAction(memberId: number, parentId: number) {
  const session = await requireSession();
  if (!(await canUpdateMember(session, memberId))) {
    redirect(withMessage(`/family-tree`, "error", "Permission refusée."));
  }

  await transaction(async (client) => {
    // Détacher le parent (père ou mère)
    await client.query(
      `UPDATE members SET
         pere_id = CASE WHEN pere_id = $1 THEN NULL ELSE pere_id END,
         mere_id = CASE WHEN mere_id = $1 THEN NULL ELSE mere_id END,
         updated_at = now()
       WHERE id = $2`,
      [parentId, memberId],
    );
    // Supprimer dans relationships
    await client.query(
      `DELETE FROM relationships WHERE parent_id = $1 AND child_id = $2`,
      [parentId, memberId],
    );
  });

  revalidateFamily(memberId);
  redirect(withMessage("/family-tree", "success", "Lien parent supprimé."));
}
