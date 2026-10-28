"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { saveUpload, stringValue } from "@/lib/storage";
import { withMessage } from "@/lib/flash";

function refreshMedia() {
  revalidatePath("/photos");
  revalidatePath("/videos");
  revalidatePath("/history");
  revalidatePath("/memorial");
  revalidatePath("/ancestors");
  revalidatePath("/dashboard");
}

async function assertOwner(table: "photos" | "videos" | "family_books", id: number, userId: number, isAdmin: boolean) {
  const row = await queryOne<{ utilisateur_id: number | null }>(
    `SELECT utilisateur_id FROM ${table} WHERE id = $1`,
    [id],
  );
  if (!row) return false;
  return isAdmin || row.utilisateur_id === userId;
}

export async function uploadPhotoAction(formData: FormData) {
  const session = await requireSession();
  const image = await saveUpload(formData.get("image"), "photos").catch(() => null);
  if (!image) {
    redirect(withMessage("/photos", "error", "Sélectionnez une image à ajouter."));
  }

  const description = stringValue(formData.get("description"));
  const memberId = Number(stringValue(formData.get("membre_id"))) || null;

  await query(
    `INSERT INTO photos (description, image, membre_id, utilisateur_id, date_publication, created_at, updated_at)
     VALUES ($1,$2,$3,$4, now(), now(), now())`,
    [description, image, memberId, session.id],
  );

  refreshMedia();
  redirect(withMessage("/photos", "success", "Photo ajoutée avec succès."));
}

export async function deletePhotoAction(photoId: number) {
  const session = await requireSession();
  if (!(await assertOwner("photos", photoId, session.id, session.isAdmin))) {
    redirect(withMessage("/photos", "error", "Vous ne pouvez pas supprimer cette photo."));
  }
  await query("DELETE FROM photos WHERE id = $1", [photoId]);
  refreshMedia();
  redirect(withMessage("/photos", "success", "Photo supprimée."));
}

export async function uploadVideoAction(formData: FormData) {
  const session = await requireSession();
  const video = await saveUpload(formData.get("video"), "videos").catch(() => null);
  if (!video) {
    redirect(withMessage("/videos", "error", "Sélectionnez une vidéo à ajouter."));
  }

  await query(
    `INSERT INTO videos (description, video, membre_id, utilisateur_id, date_publication, duree, created_at, updated_at)
     VALUES ($1,$2,$3,$4, now(), $5, now(), now())`,
    [
      stringValue(formData.get("description")),
      video,
      Number(stringValue(formData.get("membre_id"))) || null,
      session.id,
      stringValue(formData.get("duree")),
    ],
  );

  refreshMedia();
  redirect(withMessage("/videos", "success", "Vidéo ajoutée avec succès."));
}

export async function deleteVideoAction(videoId: number) {
  const session = await requireSession();
  if (!(await assertOwner("videos", videoId, session.id, session.isAdmin))) {
    redirect(withMessage("/videos", "error", "Vous ne pouvez pas supprimer cette vidéo."));
  }
  await query("DELETE FROM videos WHERE id = $1", [videoId]);
  refreshMedia();
  redirect(withMessage("/videos", "success", "Vidéo supprimée."));
}

export async function createBookAction(formData: FormData) {
  const session = await requireSession();
  const titre = stringValue(formData.get("titre"));
  const contenu = stringValue(formData.get("contenu"));
  if (!titre) {
    redirect(withMessage("/history", "error", "Le titre de l'histoire est obligatoire."));
  }
  if (!contenu && !formData.get("file")) {
    redirect(withMessage("/history", "error", "Ajoutez un récit ou un fichier."));
  }

  const filePath = await saveUpload(formData.get("file"), "family_books").catch(() => null);

  await query(
    `INSERT INTO family_books
       (titre, description, contenu, file_path, date_publication, date_histoire, utilisateur_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4, now(), $5, $6, now(), now())`,
    [
      titre,
      stringValue(formData.get("description")),
      contenu,
      filePath,
      stringValue(formData.get("date_histoire")),
      session.id,
    ],
  );

  refreshMedia();
  redirect(withMessage("/history", "success", "Histoire de famille publiée."));
}

export async function deleteBookAction(bookId: number) {
  const session = await requireSession();
  if (!(await assertOwner("family_books", bookId, session.id, session.isAdmin))) {
    redirect(withMessage("/history", "error", "Vous ne pouvez pas supprimer cette histoire."));
  }
  await query("DELETE FROM family_books WHERE id = $1", [bookId]);
  refreshMedia();
  redirect(withMessage("/history", "success", "Histoire supprimée."));
}

export async function createAncestorAction(formData: FormData) {
  const session = await requireAdmin();
  const nomComplet = stringValue(formData.get("nom_complet"));
  if (!nomComplet) {
    redirect(withMessage("/ancestors", "error", "Le nom de l'ancêtre est obligatoire."));
  }

  const photo = await saveUpload(formData.get("photo"), "ancestors").catch(() => null);

  await query(
    `INSERT INTO ancestors (nom_complet, genre, role, photo, description, ordre, created_by, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7, now(), now())`,
    [
      nomComplet,
      stringValue(formData.get("genre")) ?? "other",
      stringValue(formData.get("role")),
      photo,
      stringValue(formData.get("description")),
      Number(stringValue(formData.get("ordre"))) || 0,
      session.id,
    ],
  );

  revalidatePath("/ancestors");
  redirect(withMessage("/ancestors", "success", "Ancêtre ajouté."));
}

export async function deleteAncestorAction(ancestorId: number) {
  const session = await requireSession();
  const row = await queryOne<{ created_by: number | null }>(
    "SELECT created_by FROM ancestors WHERE id = $1",
    [ancestorId],
  );
  if (!row || (!session.isAdmin && row.created_by !== session.id)) {
    redirect(withMessage("/ancestors", "error", "Vous ne pouvez pas supprimer cet ancêtre."));
  }
  await query("DELETE FROM ancestors WHERE id = $1", [ancestorId]);
  revalidatePath("/ancestors");
  redirect(withMessage("/ancestors", "success", "Ancêtre supprimé."));
}

export async function saveVideoUrlAction(formData: FormData) {
  const session = await requireSession();
  const videoUrl = stringValue(formData.get("video_url"));

  if (!videoUrl || !videoUrl.startsWith("http")) {
    redirect(withMessage("/videos", "error", "URL de vidéo invalide."));
  }

  await query(
    `INSERT INTO videos (description, video, membre_id, utilisateur_id, date_publication, duree, created_at, updated_at)
     VALUES ($1,$2,$3,$4, now(), $5, now(), now())`,
    [
      stringValue(formData.get("description")),
      videoUrl,
      Number(stringValue(formData.get("membre_id"))) || null,
      session.id,
      stringValue(formData.get("duree")),
    ],
  );

  refreshMedia();
}
