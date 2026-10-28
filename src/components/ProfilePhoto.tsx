"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { downloadMedia } from "@/lib/download";
import { initials, mediaUrl } from "@/lib/format";

export function ProfilePhoto({
  nom,
  prenom,
  nomComplet,
  photo,
  size = "lg",
  shape = "circle",
  className,
}: {
  nom?: string | null;
  prenom?: string | null;
  nomComplet?: string | null;
  photo?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  className?: string;
}) {
  const url = mediaUrl(photo);
  const [broken, setBroken] = useState(false);
  const [open, setOpen] = useState(false);
  const label = nomComplet || `${prenom ?? ""} ${nom ?? ""}`.trim() || "Membre";

  useEffect(() => {
    setBroken(false);
  }, [url]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const classes = ["profile-photo", `profile-photo-${size}`, `profile-photo-${shape}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        type="button"
        className={classes}
        onClick={() => {
          if (url && !broken) setOpen(true);
        }}
        aria-label={url && !broken ? `Agrandir la photo de ${label}` : label}
      >
        {url && !broken ? (
          <img src={url} alt={label} onError={() => setBroken(true)} />
        ) : (
          <span>{initials(prenom, nom ?? nomComplet ?? "M")}</span>
        )}
      </button>

      {open &&
        url &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Photo de ${label}`}
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <X size={22} />
            </button>
          <div
            className="photo-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={url} alt={label} />
            <div className="photo-lightbox-actions">
              <strong>{label}</strong>
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  void downloadMedia(url, label);
                }}
              >
                <Download size={14} /> Télécharger
              </button>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}
