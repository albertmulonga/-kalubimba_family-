"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { withMessage } from "@/lib/flash";
import { saveUpload, stringValue } from "@/lib/storage";

export async function updateProfileAction(formData: FormData) {
  const session = await requireSession();
  const nom = stringValue(formData.get("nom"));
  const prenom = stringValue(formData.get("prenom"));
  const email = stringValue(formData.get("email"));

  if (!nom || !prenom) {
    redirect(withMessage("/settings", "error", "Le nom et le prénom sont obligatoires."));
  }

  if (email) {
    const duplicate = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE lower(email) = lower($1) AND id <> $2 LIMIT 1",
      [email, session.id],
    );
    if (duplicate) {
      redirect(withMessage("/settings", "error", "Cette adresse email est déjà utilisée."));
    }
  }

  const photo = await saveUpload(formData.get("photo"), "members").catch(() => null)
    ?? (stringValue(formData.get("photo_url")) || null);

  await query(
    `UPDATE users SET nom=$1, prenom=$2, email=$3, telephone=$4, pays=$5, ville=$6,
       date_naissance=$7, photo=COALESCE($8, photo), updated_at=now()
     WHERE id=$9`,
    [
      nom,
      prenom,
      email,
      stringValue(formData.get("telephone")),
      stringValue(formData.get("pays")),
      stringValue(formData.get("ville")),
      stringValue(formData.get("date_naissance")),
      photo,
      session.id,
    ],
  );

  await createSession({
    id: session.id,
    nom,
    prenom,
    email,
    matricule: session.matricule,
  });

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect(withMessage("/settings", "success", "Profil mis à jour avec succès."));
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireSession();
  const current = stringValue(formData.get("mot_de_passe_actuel"));
  const next = stringValue(formData.get("nouveau_mot_de_passe"));
  const confirmation = stringValue(formData.get("confirmation"));

  if (!current || !next || !confirmation) {
    redirect(withMessage("/settings", "error", "Remplissez tous les champs du mot de passe."));
  }
  if (next.length < 6) {
    redirect(withMessage("/settings", "error", "Le nouveau mot de passe doit contenir au moins 6 caractères."));
  }
  if (next !== confirmation) {
    redirect(withMessage("/settings", "error", "Les deux mots de passe ne correspondent pas."));
  }

  const user = await queryOne<{ mot_de_passe: string }>(
    "SELECT mot_de_passe FROM users WHERE id = $1 AND deleted_at IS NULL",
    [session.id],
  );
  if (!user || !(await compare(current, user.mot_de_passe))) {
    redirect(withMessage("/settings", "error", "Le mot de passe actuel est incorrect."));
  }

  const hashed = await hash(next, 12);
  await query("UPDATE users SET mot_de_passe=$1, updated_at=now() WHERE id=$2", [hashed, session.id]);
  redirect(withMessage("/settings", "success", "Mot de passe modifié avec succès."));
}
