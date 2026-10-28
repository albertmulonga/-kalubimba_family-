import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getFamilyBooks, getReunions } from "@/lib/data";
import { formatDate, mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { ConfirmForm } from "@/components/ConfirmForm";
import { createBookAction, deleteBookAction } from "@/lib/actions/memories";

export const metadata = { title: "Histoire de la famille" };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const [books, reunions] = await Promise.all([getFamilyBooks(), getReunions()]);

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />

      {/* ── HERO ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #6d28d9 100%)",
          borderRadius: 20,
          padding: "32px 36px",
          color: "white",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Décoration */}
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -60,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <Sparkles size={12} /> Patrimoine familial
          </span>
          <h1
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Histoire de la famille Kalubimba
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.78)", fontSize: "0.9rem" }}>
            Récits, archives et mémoire collective de notre lignée.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "Récits", value: books.length },
              { label: "Réunions", value: reunions.length },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <strong
                  style={{
                    display: "block",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </strong>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "rgba(255,255,255,0.65)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE ÉCRIRE ── */}
      <details className="card" style={{ marginBottom: 24 }}>
        <summary
          className="card-head"
          style={{ cursor: "pointer", listStyle: "none" }}
        >
          <div>
            <h2>Écrire une histoire</h2>
            <p>Partagez un récit, un souvenir ou un document familial.</p>
          </div>
          <span className="btn btn-primary btn-sm">
            <Plus size={14} /> Nouvelle histoire
          </span>
        </summary>
        <form action={createBookAction} className="card-body">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="titre">Titre *</label>
              <input id="titre" name="titre" className="input" placeholder="Titre de l'histoire..." required />
            </div>
            <div className="field">
              <label htmlFor="date_histoire">Date de l&apos;histoire</label>
              <input id="date_histoire" name="date_histoire" type="date" className="input" />
            </div>
            <div className="field">
              <label htmlFor="file">Document joint (PDF, Word...)</label>
              <input id="file" name="file" type="file" className="input" />
            </div>
            <div className="field span-2">
              <label htmlFor="description">Résumé</label>
              <input id="description" name="description" className="input" placeholder="Un bref résumé..." />
            </div>
            <div className="field span-2">
              <label htmlFor="contenu">Récit complet</label>
              <textarea
                id="contenu"
                name="contenu"
                className="textarea"
                rows={8}
                placeholder="Écrivez l'histoire ici..."
              />
            </div>
            <div className="form-actions span-2">
              <button type="submit" className="btn btn-primary">
                <BookOpen size={16} /> Publier l&apos;histoire
              </button>
            </div>
          </div>
        </form>
      </details>

      {/* ── GRILLE CONTENU ── */}
      <div className="history-layout">
        {/* Colonne gauche — Récits */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#0f172a",
              }}
            >
              <BookOpen size={18} color="#7c3aed" />
              Récits de famille
              <span
                style={{
                  background: "#ede9fe",
                  color: "#6d28d9",
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                {books.length}
              </span>
            </h2>
          </div>

          {books.length === 0 ? (
            <div className="card empty-state">
              <div className="icon"><BookOpen /></div>
              <h3>Aucune histoire publiée</h3>
              <p>Soyez le premier à partager un souvenir de famille.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {books.map((book) => {
                const canDelete =
                  session.isAdmin || book.utilisateur_id === session.id;
                const file = mediaUrl(book.file_path);
                return (
                  <article
                    key={book.id}
                    className="history-book-card"
                  >
                    {/* Bande colorée gauche */}
                    <div className="history-book-accent" />

                    <div className="history-book-body">
                      <div className="history-book-top">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 className="history-book-title">
                            {book.titre || "Souvenir de famille"}
                          </h3>
                          <div className="history-book-meta">
                            <span>
                              <CalendarDays size={12} />
                              {formatDate(book.date_histoire ?? book.date_publication)}
                            </span>
                            {(book.auteur_prenom || book.auteur_nom) && (
                              <span>
                                <User size={12} />
                                {book.auteur_prenom} {book.auteur_nom}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          {file && (
                            <a
                              href={file}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-btn"
                              title="Télécharger"
                            >
                              <Download size={14} />
                            </a>
                          )}
                          {canDelete && (
                            <ConfirmForm
                              action={deleteBookAction.bind(null, book.id)}
                              message="Supprimer cette histoire ?"
                            >
                              <button
                                type="submit"
                                className="icon-btn danger"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </ConfirmForm>
                          )}
                        </div>
                      </div>

                      {book.description && (
                        <p className="history-book-desc">{book.description}</p>
                      )}

                      {book.contenu && (
                        <p className="history-book-excerpt">
                          {book.contenu.length > 300
                            ? `${book.contenu.slice(0, 300)}…`
                            : book.contenu}
                        </p>
                      )}

                      <Link
                        href={`/history/${book.id}`}
                        className="history-book-link"
                      >
                        Lire l&apos;histoire complète →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne droite — Réunions */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#0f172a",
              }}
            >
              <Calendar size={18} color="#2563eb" />
              Retrouvailles
              <span
                style={{
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                {reunions.length}
              </span>
            </h2>
          </div>

          {reunions.length === 0 ? (
            <div className="card empty-state">
              <div className="icon"><Calendar /></div>
              <h3>Aucune réunion enregistrée</h3>
              <p>Les réunions de famille apparaîtront ici.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {reunions.map((reunion) => (
                <div key={reunion.id} className="history-reunion-card">
                  <div className="history-reunion-date">
                    <strong>
                      {new Date(reunion.date_reunion + "T12:00:00")
                        .getDate()
                        .toString()
                        .padStart(2, "0")}
                    </strong>
                    <span>
                      {new Date(reunion.date_reunion + "T12:00:00").toLocaleDateString(
                        "fr-FR",
                        { month: "short" },
                      )}
                    </span>
                    <small>
                      {new Date(reunion.date_reunion + "T12:00:00").getFullYear()}
                    </small>
                  </div>
                  <div className="history-reunion-info">
                    <strong className="history-reunion-title">{reunion.titre}</strong>
                    <div className="history-reunion-meta">
                      {reunion.heure && (
                        <span>
                          <Clock3 size={11} /> {reunion.heure.slice(0, 5)}
                        </span>
                      )}
                      {reunion.lieu && (
                        <span>
                          <MapPin size={11} /> {reunion.lieu}
                        </span>
                      )}
                    </div>
                    {reunion.resume && (
                      <p className="history-reunion-resume">
                        {reunion.resume.length > 120
                          ? `${reunion.resume.slice(0, 120)}…`
                          : reunion.resume}
                      </p>
                    )}
                    {reunion.fichier_pdf && (
                      <a
                        href={mediaUrl(reunion.fichier_pdf) ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.74rem",
                          color: "#2563eb",
                          marginTop: 6,
                        }}
                      >
                        <FileText size={12} /> Compte rendu PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
