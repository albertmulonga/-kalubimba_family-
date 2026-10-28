import {
  CalendarDays,
  Clock3,
  Download,
  FileText,
  MapPin,
  Paperclip,
  Plus,
  Trash2,
  Upload,
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

      <div className="page-head">
        <div>
          <h1>Comptes rendus de réunion</h1>
          <p>
            Les décisions et informations importantes de la famille, publiées par
            l&apos;administrateur.
          </p>
        </div>
      </div>

      {session.isAdmin && (
        <details className="card" style={{ marginBottom: 20 }}>
          <summary className="card-head" style={{ cursor: "pointer", listStyle: "none" }}>
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
                <input
                  id="date_reunion"
                  name="date_reunion"
                  type="date"
                  className="input"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="heure">Heure</label>
                <input id="heure" name="heure" type="time" className="input" />
              </div>
              <div className="field span-2">
                <label htmlFor="lieu">Lieu</label>
                <input
                  id="lieu"
                  name="lieu"
                  className="input"
                  placeholder="Kinshasa, en ligne..."
                />
              </div>
              <div className="field span-2">
                <label htmlFor="resume">Compte rendu écrit</label>
                <textarea
                  id="resume"
                  name="resume"
                  className="input"
                  rows={8}
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
                <span className="tiny muted">
                  PDF, Word, Excel, PowerPoint ou texte. 50 Mo maximum.
                </span>
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

      {reports.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">
            <FileText />
          </div>
          <h3>Aucun compte rendu pour le moment</h3>
          <p>Les comptes rendus publiés par l&apos;administrateur apparaîtront ici.</p>
        </div>
      ) : (
        <div className="stack">
          {reports.map((report) => {
            const fileUrl = mediaUrl(report.fichier_pdf);
            return (
              <article key={report.id} className="card">
                <div className="card-body report-card">
                  <div className="report-card-head">
                    <div>
                      <span className="report-eyebrow">
                        <FileText size={12} /> Compte rendu de réunion
                      </span>
                      <h2>{report.titre}</h2>
                    </div>
                    {session.isAdmin && (
                      <ConfirmForm
                        action={deleteReunionReportAction.bind(null, report.id)}
                        message="Supprimer ce compte rendu ?"
                      >
                        <button type="submit" className="btn btn-danger-soft btn-sm">
                          <Trash2 size={14} /> Supprimer
                        </button>
                      </ConfirmForm>
                    )}
                  </div>

                  <div className="report-meta">
                    <span>
                      <CalendarDays size={13} /> {formatDate(report.date_reunion)}
                    </span>
                    {report.heure && (
                      <span>
                        <Clock3 size={13} /> {report.heure.slice(0, 5)}
                      </span>
                    )}
                    {report.lieu && (
                      <span>
                        <MapPin size={13} /> {report.lieu}
                      </span>
                    )}
                  </div>

                  {report.resume && <p className="report-content">{report.resume}</p>}

                  {fileUrl && (
                    <a
                      href={fileUrl}
                      className="btn btn-ghost btn-sm report-file"
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      <Paperclip size={14} /> Télécharger le fichier joint
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
