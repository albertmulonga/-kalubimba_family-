"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Send, Trash2, User } from "lucide-react";
import type { VideoCommentRow } from "@/lib/data";
import {
  addVideoCommentAction,
  deleteVideoCommentAction,
} from "@/lib/actions/memories";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(nom: string | null, prenom: string | null) {
  return [prenom?.[0], nom?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";
}

export function VideoComments({
  videoId,
  comments: initial,
  currentUserId,
  isAdmin,
}: {
  videoId: number;
  comments: VideoCommentRow[];
  currentUserId: number;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const fd = new FormData();
    fd.set("contenu", text.trim());
    startTransition(async () => {
      await addVideoCommentAction(videoId, fd);
      // Optimistic update — on recharge la page pour avoir les vrais données
      window.location.reload();
    });
    setText("");
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    startTransition(async () => {
      await deleteVideoCommentAction(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    });
  }

  return (
    <div className="video-comments">
      {/* Bouton toggle */}
      <button
        type="button"
        className="video-comments-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle size={16} />
        <span>
          {comments.length > 0
            ? `${comments.length} commentaire${comments.length > 1 ? "s" : ""}`
            : "Commenter"}
        </span>
        <span className="video-comments-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="video-comments-body">
          {/* Liste des commentaires */}
          {comments.length === 0 ? (
            <p className="video-comments-empty">
              Aucun commentaire. Soyez le premier !
            </p>
          ) : (
            <div className="video-comments-list">
              {comments.map((c) => (
                <div key={c.id} className="video-comment-item">
                  {/* Avatar */}
                  <div className="video-comment-avatar">
                    {c.user_photo ? (
                      <img src={c.user_photo} alt="" />
                    ) : (
                      <span>{initials(c.user_nom, c.user_prenom)}</span>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="video-comment-content">
                    <div className="video-comment-meta">
                      <strong>
                        {c.user_prenom} {c.user_nom}
                      </strong>
                      <span className="video-comment-time">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="video-comment-text">{c.contenu}</p>
                  </div>

                  {/* Supprimer (propriétaire ou admin) */}
                  {(isAdmin || c.user_id === currentUserId) && (
                    <button
                      type="button"
                      className="video-comment-delete"
                      onClick={() => handleDelete(c.id)}
                      disabled={pending}
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Formulaire ajout commentaire */}
          <form className="video-comment-form" onSubmit={handleAdd}>
            <div className="video-comment-input-wrap">
              <span className="video-comment-icon">
                <User size={14} />
              </span>
              <input
                type="text"
                className="video-comment-input"
                placeholder="Écrire un commentaire..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                disabled={pending}
              />
              <button
                type="submit"
                className="video-comment-send"
                disabled={!text.trim() || pending}
                title="Envoyer"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
