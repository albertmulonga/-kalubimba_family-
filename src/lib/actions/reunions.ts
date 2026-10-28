"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { deleteStoredFile, saveUpload, stringValue } from "@/lib/storage";
import { withMessage } from "@/lib/flash";

function refreshReports() {
  revalidatePath("/reunions");
  revalidatePath("/dashboard");
}

export async function createReunionReportAction(formData: FormData) {
  const session = await requireAdmin();
  const titre = stringValue(formData.get("titre"));
  const dateReunion = stringValue(formData.get("date_reunion"));
  const heure = stringValue(formData.get("heure"));
  const lieu = stringValue(formData.get("lieu"));
  const resume = stringValue(formData.get("resume"));
  const rawFile = formData.get("fichier");
  const hasFile = rawFile instanceof File && rawFile.size > 0;

  if (!titre || !dateReunion) {
    redirect(withMessage("/reunions", "error", "Le titre et la date sont obligatoires."));
  }
  if (!resume && !hasFile) {
    redirect(
      withMessage(
        "/reunions",
        "error",
        "Écrivez le compte rendu ou importez un fichier.",
      ),
    );
  }

  const fichier = hasFile
    ? await saveUpload(rawFile, "reunions").catch(() => null)
    : null;
  if (hasFile && !fichier) {
    redirect(withMessage("/reunions", "error", "Impossible d'importer ce fichier."));
  }

  await query(
    `INSERT INTO reunions
       (titre, date_reunion, heure, lieu, resume, fichier_pdf,
        nombre_telechargements, created_by, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,0,$7,now(),now())`,
    [titre, dateReunion, heure, lieu, resume, fichier, session.id],
  );

  refreshReports();
  redirect(withMessage("/reunions", "success", "Compte rendu publié."));
}

export async function deleteReunionReportAction(reportId: number) {
  await requireAdmin();
  const row = await queryOne<{ fichier_pdf: string | null }>(
    "SELECT fichier_pdf FROM reunions WHERE id = $1",
    [reportId],
  );
  if (!row) {
    redirect(withMessage("/reunions", "error", "Compte rendu introuvable."));
  }

  await deleteStoredFile(row.fichier_pdf);
  await query("DELETE FROM reunions WHERE id = $1", [reportId]);

  refreshReports();
  redirect(withMessage("/reunions", "success", "Compte rendu supprimé."));
}
