"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query, queryOne, transaction } from "../db";
import { createSession, destroySession } from "../auth";
import { withMessage } from "../flash";
import { stringValue } from "../storage";
import { genderValue } from "../format";

type LoginUser = {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  matricule: string | null;
  mot_de_passe: string;
  deleted_at: string | null;
};

export async function loginAction(formData: FormData) {
  const identifiant = stringValue(formData.get("identifiant"));
  const password = stringValue(formData.get("mot_de_passe"));

  if (!identifiant || !password) {
    redirect(withMessage("/login", "error", "Renseignez votre identifiant et votre mot de passe."));
  }

  const user = await queryOne<LoginUser>(
    `SELECT id, nom, prenom, email, matricule, mot_de_passe, deleted_at
     FROM users
     WHERE lower(email) = lower($1) OR matricule = $1
     LIMIT 1`,
    [identifiant],
  );

  if (!user) {
    redirect(withMessage("/login", "error", "Identifiant ou mot de passe incorrect."));
  }

  if (user.deleted_at) {
    redirect(withMessage("/login", "error", "Ce compte a été désactivé. Contactez l'administrateur."));
  }

  let valid = false;
  try {
    valid = await compare(password, user.mot_de_passe);
  } catch {
    valid = false;
  }

  if (!valid && user.mot_de_passe === password) {
    valid = true;
    const upgraded = await hash(password, 12);
    await query("UPDATE users SET mot_de_passe = $1, updated_at = now() WHERE id = $2", [
      upgraded,
      user.id,
    ]);
  }

  if (!valid) {
    redirect(withMessage("/login", "error", "Identifiant ou mot de passe incorrect."));
  }

  await createSession(user);
  redirect(withMessage("/dashboard", "success", `Bienvenue ${user.prenom} ${user.nom} !`));
}

export async function registerAction(formData: FormData) {
  const nom = stringValue(formData.get("nom"));
  const prenom = stringValue(formData.get("prenom"));
  const email = stringValue(formData.get("email"))?.toLowerCase() ?? null;
  const password = stringValue(formData.get("mot_de_passe"));
  const genre = genderValue(stringValue(formData.get("genre")));
  const telephone = stringValue(formData.get("telephone"));
  const pays = stringValue(formData.get("pays")) ?? "RDC";
  const ville = stringValue(formData.get("ville"));
  const dateNaissance = stringValue(formData.get("date_naissance"));
  const lieuNaissance = stringValue(formData.get("lieu_naissance"));
  const profession = stringValue(formData.get("profession"));

  if (!nom || !prenom || !email || !password) {
    redirect(withMessage("/register", "error", "Le nom, le prénom, l'email et le mot de passe sont obligatoires."));
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(withMessage("/register", "error", "L'adresse email n'est pas valide."));
  }

  if (password.length < 6) {
    redirect(withMessage("/register", "error", "Le mot de passe doit contenir au moins 6 caractères."));
  }

  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM users WHERE lower(email) = lower($1)",
    [email],
  );
  if (existing) {
    redirect(withMessage("/register", "error", "Un compte existe déjà avec cette adresse email."));
  }

  try {
    const hashed = await hash(password, 12);
    await transaction(async (client) => {
      const userResult = await client.query<{ id: number }>(
        `INSERT INTO users
           (nom, prenom, email, mot_de_passe, telephone, pays, ville,
            date_naissance, date_creation, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
         RETURNING id`,
        [nom, prenom, email, hashed, telephone, pays, ville, dateNaissance],
      );
      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO members
           (nom, prenom, nom_complet, genre, is_bloodline, date_naissance,
            lieu, profession, utilisateur_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7, $8, now(), now())`,
        [nom, prenom, `${prenom} ${nom}`.trim(), genre, dateNaissance, lieuNaissance, profession, userId],
      );
    });
  } catch (error) {
    console.error("registerAction", error);
    redirect(withMessage("/register", "error", "Impossible de créer le compte pour le moment."));
  }

  revalidatePath("/dashboard");
  redirect(
    withMessage(
      "/login",
      "success",
      "Votre compte a été créé et vous avez été ajouté comme membre de la famille. Vous pouvez vous connecter.",
    ),
  );
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect(withMessage("/welcome", "success", "Vous êtes déconnecté. À bientôt !"));
}
