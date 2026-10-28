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
    <div style={{ position: "relative" }}>
      {/* Miniature */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          background: "#0f172a",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onClick={() => setOpen(true)}
      >
        <video
          src={src}
          muted
          playsInline
          preload="none"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <Play size={36} fill="white" color="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "min(860px, 100%)",
              background: "#0f172a",
              borderRadius: 20,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.12)",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={20} />
            </button>

            <video
              src={src}
              controls
              autoPlay
              playsInline
              style={{ width: "100%", aspectRatio: "16/9", display: "block", background: "#000" }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#0f172a",
                gap: 12,
              }}
            >
              <strong style={{ color: "white", fontSize: "0.9rem" }}>{title}</strong>
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
                  <button
                    type="submit"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      background: "#fee2e2",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={13} /> Supprimer
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
