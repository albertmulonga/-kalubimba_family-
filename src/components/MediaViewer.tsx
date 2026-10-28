"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Download, Maximize2, Play, Trash2, X } from "lucide-react";
import { SafeImage } from "./SafeImage";
import { downloadMedia } from "@/lib/download";

export function MediaViewer({
  kind,
  src,
  title,
  className,
  children,
  canDelete = false,
  deleteAction,
}: {
  kind: "image" | "video";
  src: string;
  title: string;
  className?: string;
  children: ReactNode;
  canDelete?: boolean;
  deleteAction?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <button
        type="button"
        className={`media-viewer-trigger ${className ?? ""}`}
        onClick={() => setOpen(true)}
        aria-label={`Ouvrir ${title}`}
      >
        {children}
        <span className="media-open-hint">
          {kind === "video" ? <Play size={14} /> : <Maximize2 size={14} />}
          {kind === "video" ? "Ouvrir la vidéo" : "Agrandir"}
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={title}
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
              className="photo-lightbox-content media-lightbox-content"
              onClick={(event) => event.stopPropagation()}
            >
              {kind === "video" ? (
                src ? (
                  <video src={src} controls autoPlay playsInline />
                ) : (
                  <p style={{ color: "white", padding: "20px" }}>Vidéo indisponible</p>
                )
              ) : (
                <SafeImage src={src} alt={title} loading="eager" />
              )}
              <div className="photo-lightbox-actions">
                <strong>{title}</strong>
                <div className="media-lightbox-buttons">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => downloadMedia(src, title)}
                  >
                    <Download size={14} /> Télécharger
                  </button>
                  {canDelete && deleteAction && (
                    <form
                      action={deleteAction}
                      onSubmit={(event) => {
                        if (!window.confirm("Supprimer définitivement ce média ?")) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <button type="submit" className="btn btn-danger-soft btn-sm">
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
