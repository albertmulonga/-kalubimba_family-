"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { withMessage } from "@/lib/flash";

export async function softDeleteUserAction(userId: number) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    redirect(withMessage("/admin/users", "error", "Vous ne pouvez pas désactiver votre propre compte."));
  }

  await query("UPDATE users SET deleted_at = now(), updated_at = now() WHERE id = $1", [userId]);
  revalidatePath("/admin/users");
  revalidatePath("/admin/users/trash");
  redirect(withMessage("/admin/users", "success", "Utilisateur déplacé dans la corbeille."));
}

export async function restoreUserAction(userId: number) {
  await requireAdmin();
  await query("UPDATE users SET deleted_at = NULL, updated_at = now() WHERE id = $1", [userId]);
  revalidatePath("/admin/users");
  revalidatePath("/admin/users/trash");
  redirect(withMessage("/admin/users", "success", "Utilisateur restauré."));
}

export async function forceDeleteUserAction(userId: number) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    redirect(withMessage("/admin/users/trash", "error", "Vous ne pouvez pas supprimer définitivement votre propre compte."));
  }

  await query("DELETE FROM users WHERE id = $1 AND deleted_at IS NOT NULL", [userId]);
  revalidatePath("/admin/users");
  revalidatePath("/admin/users/trash");
  redirect(withMessage("/admin/users/trash", "success", "Utilisateur supprimé définitivement."));
}
