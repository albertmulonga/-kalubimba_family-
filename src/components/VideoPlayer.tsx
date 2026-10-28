"use client";

import { useState } from "react";
import { Play, Trash2, X } from "lucide-react";

export function VideoPlayer({
  src,
  title,
  canDelete,
  deleteAction,
}: {
  src: string;
  title: string;
  canDelete?: boolean;
  deleteAction?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Miniature cliquable */}
      <div className="video-thumb-wrap" onClick={() => setOpen(true)}>
        <video
          src={src}
          muted
          playsInline
          preload="none"
          className="video-thumb-preview"
        />
        <div className="video-play-btn">
          <Play size={28} fill="white" color="white" />
        </div>
      </div>

      {/* Lecteur plein écran — dialog natif HTML, pas de portail React */}
      {open && (
        <div
          className="video-modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <X size={22} />
            </button>
            <video
              src={src}
              controls
              autoPlay
              playsInline
              className="video-modal-player"
            />
            <div className="video-modal-footer">
              <strong>{title}</strong>
              {canDelete && deleteAction && (
                <form
                  action={deleteAction}
                  onSubmit={(e) => {
                    if (!window.confirm("Supprimer définitivement cette vidéo ?")) {
                      e.preventDefault();
                    } else {
                      setOpen(false);
                    }
                  }}
                >
                  <button type="submit" className="btn btn-danger-soft btn-sm">
                    <Trash2 size={13} /> Supprimer
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
