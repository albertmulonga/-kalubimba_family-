"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { saveVideoUrlAction } from "@/lib/actions/memories";

export function VideoUploadForm({
  cloudName,
  uploadPreset,
  members,
}: {
  cloudName: string;
  uploadPreset: string;
  members: { id: number; name: string }[];
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[name="video"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      setError("Sélectionnez une vidéo.");
      return;
    }

    if (!cloudName || !uploadPreset) {
      setError("Configuration Cloudinary manquante. Contactez l'administrateur.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Upload direct vers Cloudinary depuis le navigateur
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      fd.append("folder", "kalubimba/videos");
      fd.append("resource_type", "video");

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 90));
        }
      };

      const url = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url as string);
          } else {
            reject(new Error(`Cloudinary error ${xhr.status}: ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Erreur réseau lors de l'upload."));
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
        xhr.send(fd);
      });

      setProgress(95);

      // 2. Sauvegarder l'URL en base via Server Action
      const formData = new FormData(form);
      formData.set("video_url", url);
      await saveVideoUrlAction(formData);

      setProgress(100);
      setSuccess(true);
      formRef.current?.reset();
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-head">
        <div>
          <h2>Ajouter une vidéo</h2>
          <p>Upload direct vers Cloudinary — pas de limite de taille.</p>
        </div>
      </div>
      <form ref={formRef} className="card-body" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            <CheckCircle2 size={16} /> Vidéo publiée avec succès !
          </div>
        )}
        <div className="form-grid">
          <div className="field span-2">
            <label htmlFor="video">Vidéo *</label>
            <input
              id="video"
              name="video"
              type="file"
              accept="video/*"
              className="input"
              required
              disabled={uploading}
            />
            <span className="tiny muted">MP4, MOV, AVI... Taille illimitée.</span>
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              className="input"
              disabled={uploading}
            />
          </div>
          <div className="field">
            <label htmlFor="duree">Durée</label>
            <input
              id="duree"
              name="duree"
              className="input"
              placeholder="Ex. 03:45"
              disabled={uploading}
            />
          </div>
          <div className="field span-2">
            <label htmlFor="membre_id">Membre associé</label>
            <select
              id="membre_id"
              name="membre_id"
              className="select"
              defaultValue=""
              disabled={uploading}
            >
              <option value="">Aucun membre</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {uploading && (
            <div className="field span-2">
              <div
                style={{
                  background: "#e2e8f0",
                  borderRadius: 999,
                  height: 8,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span className="tiny muted">
                <Loader2 size={12} style={{ display: "inline", marginRight: 4 }} />
                Upload en cours... {progress}%
              </span>
            </div>
          )}

          <div className="form-actions span-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} /> Upload en cours...
                </>
              ) : (
                <>
                  <Upload size={16} /> Publier la vidéo
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
