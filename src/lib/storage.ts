import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

const MAX_SIZE = 50 * 1024 * 1024;

function safeName(name: string) {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "fichier";
}

export async function saveUpload(
  file: FormDataEntryValue | null,
  folder: string,
): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_SIZE) {
    throw new Error("Le fichier dépasse la taille maximale autorisée (50 Mo).");
  }

  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName(file.name)}`;
  const key = `${folder}/${filename}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const directory = path.join(process.cwd(), "public", "media", folder);
  await mkdir(directory, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(directory, filename), bytes);
  return key;
}

export async function deleteStoredFile(filePath: string | null | undefined) {
  if (!filePath) return;
  try {
    if (/^https?:\/\//i.test(filePath)) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        await del(filePath, { token: process.env.BLOB_READ_WRITE_TOKEN });
      }
      return;
    }
    const safeRelative = filePath
      .replace(/\\/g, "/")
      .replace(/^https?:\/\/[^/]+\//, "")
      .replace(/^\/+/, "")
      .replace(/^media\//, "")
      .replace(/^storage\//, "");
    const localPath = path.join(process.cwd(), "public", "media", safeRelative);
    const mediaRoot = path.join(process.cwd(), "public", "media");
    if (!localPath.startsWith(mediaRoot)) return;
    await unlink(localPath);
  } catch {
    // Le fichier peut déjà avoir été supprimé.
  }
}

export function stringValue(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
