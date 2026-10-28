import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  MapPin,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getReunions } from "@/lib/data";
import { formatDate, mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { ConfirmForm } from "@/components/ConfirmForm";
import {
  createReunionReportAction,
  deleteReunionReportAction,
} from "@/lib/actions/reunions";

export const metadata = { title: "Comptes rendus" };

export default async function ReunionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const reports = await getReunions();

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />

      {/* ── EN-TÊTE HERO ── */}
      <section
        className="reunion-hero"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #1d4ed8 100%)",
          borderRadius: 20,
          padding: "32px 36px",
          color: "white",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: 8,
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <FileText size={13} /> Famille Kalubimba
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
            Comptes rendus de réunion
          </h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>
            Les décisions et informations importantes de la famille.
          </p>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <strong style={{ display: "block", fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
              {reports.length}
            </strong>
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.72)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Réunion{reports.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ── FORMULAIRE ADMIN ── */}
      {session.isAdmin && (
        <details className="card" style={{ marginBottom: 24 }}>
          <summary
            className="card-head"
            style={{ cursor: "pointer", listStyle: "none" }}
          >
            <div>
              <h2>Publier un compte rendu</h2>
              <p>Rédigez le contenu ou importez un fichier.</p>
            </div>
            <span className="btn btn-primary btn-sm">
              <Plus size={14} /> Nouveau compte rendu
            </span>
          </summary>
          <form action={createReunionReportAction} className="card-body">
            <div className="form-grid">
              <div className="field span-2">
                <label htmlFor="titre">Titre *</label>
                <input
                  id="titre"
                  name="titre"
                  className="input"
                  placeholder="Réunion familiale du..."
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="date_reunion">Date *</label>
                <input id="date_reunion" name="date_reunion" type="date" className="input" required />
              </div>
              <div className="field">
                <label htmlFor="heure">Heure</label>
                <input id="heure" name="heure" type="time" className="input" />
              </div>
              <div className="field span-2">
                <label htmlFor="lieu">Lieu</label>
                <input id="lieu" name="lieu" className="input" placeholder="Kinshasa, en ligne..." />
              </div>
              <div className="field span-2">
                <label htmlFor="resume">Compte rendu écrit</label>
                <textarea
                  id="resume"
                  name="resume"
                  className="input"
                  rows={6}
                  placeholder="Décisions, points discutés, prochaines étapes..."
                />
              </div>
              <div className="field span-2">
                <label htmlFor="fichier">Importer un fichier</label>
                <input
                  id="fichier"
                  name="fichier"
                  type="file"
                  className="input"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.odt"
                />
                <span className="tiny muted">PDF, Word, Excel, PowerPoint. 50 Mo maximum.</span>
              </div>
              <div className="form-actions span-2">
                <button type="submit" className="btn btn-primary">
                  <Upload size={16} /> Publier le compte rendu
                </button>
              </div>
            </div>
          </form>
        </details>
      )}

      {/* ── LISTE ── */}
      {reports.length === 0 ? (
        <div className="card empty-state">
          <div className="icon"><FileText /></div>
          <h3>Aucun compte rendu pour le moment</h3>
          <p>Les comptes rendus publiés par l&apos;administrateur apparaîtront ici.</p>
        </div>
      ) : (
        <div className="reunion-list">
          {reports.map((report, index) => {
            const fileUrl = mediaUrl(report.fichier_pdf);
            return (
              <article key={report.id} className="reunion-card">
                {/* Numéro */}
                <div className="reunion-number">
                  <span>{String(reports.length - index).padStart(2, "0")}</span>
                </div>

                {/* Contenu */}
                <div className="reunion-body">
                  <div className="reunion-card-top">
                    <div>
                      <div className="reunion-badge">
                        <CheckCircle2 size={12} />
                        <span>Compte rendu officiel</span>
                      </div>
                      <h2 className="reunion-title">{report.titre}</h2>
                    </div>
                    {session.isAdmin && (
                      <ConfirmForm
                        action={deleteReunionReportAction.bind(null, report.id)}
                        message="Supprimer ce compte rendu ?"
                      >
                        <button type="submit" className="btn btn-danger-soft btn-sm">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </ConfirmForm>
                    )}
                  </div>

                  {/* Méta */}
                  <div className="reunion-meta">
                    <span className="reunion-meta-item">
                      <CalendarDays size={14} />
                      {formatDate(report.date_reunion)}
                    </span>
                    {report.heure && (
                      <span className="reunion-meta-item">
                        <Clock3 size={14} />
                        {report.heure.slice(0, 5)}
                      </span>
                    )}
                    {report.lieu && (
                      <span className="reunion-meta-item">
                        <MapPin size={14} />
                        {report.lieu}
                      </span>
                    )}
                    <span className="reunion-meta-item">
                      <Users size={14} />
                      Famille Kalubimba
                    </span>
                  </div>

                  {/* Résumé */}
                  {report.resume && (
                    <div className="reunion-resume">
                      <p>{report.resume}</p>
                    </div>
                  )}

                  {/* Fichier */}
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      className="reunion-file-btn"
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      <Paperclip size={15} />
                      <span>Télécharger le document joint</span>
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
