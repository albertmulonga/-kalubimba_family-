"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";

interface Props {
  name: string;         // nom du champ hidden qui contiendra l'URL
  accept?: string;      // ex: "image/*" ou "video/*"
  label?: string;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  required?: boolean;
  resourceType?: "image" | "video" | "auto";
}

export function CloudinaryFileInput({
  name,
  accept = "image/*",
  label = "Fichier",
  cloudName,
  uploadPreset,
  folder = "kalubimba/uploads",
  required = false,
  resourceType = "auto",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);
    setUrl(null);

    // Si pas de config Cloudinary → on stocke juste le fichier localement
    // (le serveur Next.js le traitera via saveUpload)
    if (!cloudName || !uploadPreset) {
      setUploading(false);
      // On laisse le fichier dans l'input natif — la Server Action le lira
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      fd.append("folder", folder);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 95));
        }
      };

      const resultUrl = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url as string);
          } else {
            // Afficher l'erreur exacte de Cloudinary
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(`Cloudinary: ${errData?.error?.message ?? xhr.status}`));
            } catch {
              reject(new Error(`Erreur Cloudinary ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Erreur réseau."));
        // Forcer "image" pour les photos (évite erreur 400 avec "auto")
        const type = accept?.includes("video") ? "video" : "image";
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`);
        xhr.send(fd);
      });

      setProgress(100);
      setUrl(resultUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setUrl(null);
    setProgress(0);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {/* Champ caché qui contient l'URL pour la Server Action */}
      <input type="hidden" name={name} value={url ?? ""} />

      {!url ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="input"
            onChange={handleChange}
            disabled={uploading}
            required={required}
            style={{ opacity: uploading ? 0.6 : 1 }}
          />
          {uploading && (
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ height: 5, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg,#3b82f6,#1d4ed8)",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span className="tiny muted" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Loader2 size={11} /> Upload en cours... {progress}%
              </span>
            </div>
          )}
          {error && (
            <span className="tiny" style={{ color: "#dc2626" }}>{error}</span>
          )}
        </>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span className="small" style={{ flex: 1, color: "#059669", fontWeight: 600 }}>
            Fichier uploadé avec succès
          </span>
          <button
            type="button"
            onClick={handleClear}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
            }}
            title="Changer le fichier"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
