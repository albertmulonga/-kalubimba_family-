import Link from "next/link";
import { BookOpen, Calendar, Download, FileText, Plus, Trash2 } from "lucide-react";
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
      <div className="page-head">
        <div>
          <h1>Histoire de la famille</h1>
          <p>Récits, archives et comptes rendus des retrouvailles Kalubimba.</p>
        </div>
      </div>

      <details className="card" style={{ marginBottom: 20 }}>
        <summary className="card-head" style={{ cursor: "pointer", listStyle: "none" }}>
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
              <input id="titre" name="titre" className="input" required />
            </div>
            <div className="field">
              <label htmlFor="date_histoire">Date de l&apos;histoire</label>
              <input id="date_histoire" name="date_histoire" type="date" className="input" />
            </div>
            <div className="field">
              <label htmlFor="file">Document joint</label>
              <input id="file" name="file" type="file" className="input" />
            </div>
            <div className="field span-2">
              <label htmlFor="description">Résumé</label>
              <input id="description" name="description" className="input" />
            </div>
            <div className="field span-2">
              <label htmlFor="contenu">Récit</label>
              <textarea id="contenu" name="contenu" className="textarea" rows={8} />
            </div>
            <div className="form-actions span-2">
              <button type="submit" className="btn btn-primary">
                <BookOpen size={16} /> Publier l&apos;histoire
              </button>
            </div>
          </div>
        </form>
      </details>

      <div className="detail-layout">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Récits de famille</h2>
                <p>{books.length} histoire{books.length > 1 ? "s" : ""} publiée{books.length > 1 ? "s" : ""}.</p>
              </div>
              <BookOpen size={18} color="#2563eb" />
            </div>
            <div className="card-body stack">
              {books.length === 0 ? (
                <p className="muted small">Aucune histoire publiée pour le moment.</p>
              ) : (
                books.map((book) => {
                  const canDelete = session.isAdmin || book.utilisateur_id === session.id;
                  const file = mediaUrl(book.file_path);
                  return (
                    <article key={book.id} className="story-card">
                      <div className="story-head">
                        <div>
                          <h3>{book.titre || "Souvenir de famille"}</h3>
                          <p className="tiny muted">
                            {formatDate(book.date_histoire ?? book.date_publication)}
                            {book.auteur_prenom ? ` · ${book.auteur_prenom} ${book.auteur_nom ?? ""}` : ""}
                          </p>
                        </div>
                        <div className="row" style={{ gap: 6 }}>
                          {file && (
                            <a href={file} target="_blank" rel="noreferrer" className="icon-btn" title="Télécharger">
                              <Download size={15} />
                            </a>
                          )}
                          {canDelete && (
                            <ConfirmForm
                              action={deleteBookAction.bind(null, book.id)}
                              message="Supprimer cette histoire ?"
                            >
                              <button type="submit" className="icon-btn danger" title="Supprimer">
                                <Trash2 size={15} />
                              </button>
                            </ConfirmForm>
                          )}
                        </div>
                      </div>
                      {book.description && <p className="small">{book.description}</p>}
                      {book.contenu && (
                        <p className="small muted" style={{ whiteSpace: "pre-line" }}>
                          {book.contenu.length > 420 ? `${book.contenu.slice(0, 420)}…` : book.contenu}
                        </p>
                      )}
                      <Link href={`/history/${book.id}`} className="tiny" style={{ color: "#2563eb" }}>
                        Lire l&apos;histoire complète
                      </Link>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Retrouvailles</h2>
                <p>Les réunions de la famille.</p>
              </div>
              <Calendar size={18} color="#2563eb" />
            </div>
            <div className="card-body stack">
              {reunions.length === 0 ? (
                <p className="muted small">Aucune réunion enregistrée.</p>
              ) : (
                reunions.map((reunion) => (
                  <div key={reunion.id} className="timeline-item">
                    <strong>{reunion.titre}</strong>
                    <span className="tiny muted">
                      {formatDate(reunion.date_reunion)}
                      {reunion.heure ? ` · ${reunion.heure.slice(0, 5)}` : ""}
                    </span>
                    {reunion.lieu && <span className="small">{reunion.lieu}</span>}
                    {reunion.resume && <p className="small muted">{reunion.resume}</p>}
                    {reunion.fichier_pdf && (
                      <a
                        href={mediaUrl(reunion.fichier_pdf) ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="tiny"
                        style={{ color: "#2563eb" }}
                      >
                        <FileText size={12} /> Compte rendu PDF
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
