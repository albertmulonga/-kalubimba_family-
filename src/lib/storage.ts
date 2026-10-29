import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_SIZE = 50 * 1024 * 1024;

function safeName(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "fichier"
  );
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET!;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  fd.append("folder", `kalubimba/${folder}`);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: fd },
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary: ${res.status} ${txt}`);
  }
  const json = (await res.json()) as { secure_url: string };
  return json.secure_url;
}

export async function saveUpload(
  file: FormDataEntryValue | null,
  folder: string,
): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_SIZE) throw new Error("Fichier trop volumineux (max 50 Mo).");

  // Si le fichier dépasse 4MB sur Vercel serverless → on ne peut pas l'envoyer
  // via Server Action (limite 4.5MB). On retourne null silencieusement.
  // L'URL doit être fournie via un champ caché (upload client-side Cloudinary).
  const IS_VERCEL = !!process.env.VERCEL;
  if (IS_VERCEL && file.size > 4 * 1024 * 1024) {
    console.warn("[storage] Fichier trop grand pour Vercel Server Action, ignoré:", file.name, file.size);
    return null;
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET) {
    const url = await uploadToCloudinary(file as File, folder);
    console.log("[Cloudinary] OK:", url);
    return url;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName((file as File).name)}`;
    const blob = await put(`${folder}/${filename}`, file as File, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName((file as File).name)}`;
  const dir = path.join(process.cwd(), "public", "media", folder);
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await (file as File).arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);
  return `/media/${folder}/${filename}`;
}

export async function deleteStoredFile(filePath: string | null | undefined) {
  if (!filePath) return;
  try {
    if (/^https?:\/\//i.test(filePath)) {
      if (process.env.BLOB_READ_WRITE_TOKEN && filePath.includes("vercel-storage")) {
        const { del } = await import("@vercel/blob");
        await del(filePath, { token: process.env.BLOB_READ_WRITE_TOKEN });
      }
      return;
    }
    const safeRelative = filePath
      .replace(/\\/g, "/")
      .replace(/^https?:\/\/[^/]+\//, "")
      .replace(/^\/+/, "")
      .replace(/^media\//, "");
    const localPath = path.join(process.cwd(), "public", "media", safeRelative);
    const mediaRoot = path.join(process.cwd(), "public", "media");
    if (!localPath.startsWith(mediaRoot)) return;
    await unlink(localPath);
  } catch { /* ignoré */ }
}

export function stringValue(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
