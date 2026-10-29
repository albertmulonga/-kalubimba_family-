import { Crown, Plus, Trash2 } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getAncestors } from "@/lib/data";
import { mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { Avatar } from "@/components/Avatar";
import { ConfirmForm } from "@/components/ConfirmForm";
import { createAncestorAction, deleteAncestorAction } from "@/lib/actions/memories";
import { CloudinaryFileInput } from "@/components/CloudinaryFileInput";

export const metadata = { title: "Ancêtres" };

export default async function AncestorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const ancestors = await getAncestors();

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <h1>Les ancêtres</h1>
          <p>Ceux qui ont bâti l&apos;histoire de la lignée Kalubimba.</p>
        </div>
      </div>

      {session.isAdmin && (
        <details className="card" style={{ marginBottom: 20 }}>
          <summary className="card-head" style={{ cursor: "pointer", listStyle: "none" }}>
            <div>
              <h2>Ajouter un ancêtre</h2>
              <p>Honorez la mémoire d&apos;un aïeul.</p>
            </div>
            <span className="btn btn-primary btn-sm">
              <Plus size={14} /> Nouvel ancêtre
            </span>
          </summary>
          <form action={createAncestorAction} className="card-body">
            <div className="form-grid">
              <div className="field span-2">
                <label htmlFor="nom_complet">Nom complet *</label>
                <input id="nom_complet" name="nom_complet" className="input" required />
              </div>
              <div className="field">
                <label htmlFor="genre">Genre</label>
                <select id="genre" name="genre" className="select" defaultValue="male">
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="role">Rôle dans la famille</label>
                <input id="role" name="role" className="input" placeholder="Fondateur, patriarche..." />
              </div>
              <div className="field">
                <label htmlFor="ordre">Ordre d&apos;affichage</label>
                <input id="ordre" name="ordre" type="number" className="input" defaultValue={0} />
              </div>
                <div className="field">
                <label htmlFor="photo">Photo</label>
                <CloudinaryFileInput
                  name="photo_url"
                  accept="image/*"
                  cloudName={process.env.CLOUDINARY_CLOUD_NAME ?? ""}
                  uploadPreset={process.env.CLOUDINARY_UPLOAD_PRESET ?? ""}
                  folder="kalubimba/ancestors"
                />
                </div>
              <div className="field span-2">
                <label htmlFor="description">Histoire / description</label>
                <textarea id="description" name="description" className="textarea" />
              </div>
              <div className="form-actions span-2">
                <button type="submit" className="btn btn-primary">
                  <Crown size={16} /> Ajouter l&apos;ancêtre
                </button>
              </div>
            </div>
          </form>
        </details>
      )}

      {ancestors.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">
            <Crown />
          </div>
          <h3>Aucun ancêtre enregistré</h3>
          <p>Ajoutez les fondateurs et aïeuls de la famille.</p>
        </div>
      ) : (
        <div className="ancestor-grid">
          {ancestors.map((ancestor) => {
            const canDelete = session.isAdmin;
            return (
              <article key={ancestor.id} className="ancestor-card">
                <Avatar
                  nom={ancestor.nom_complet}
                  prenom={null}
                  nomComplet={ancestor.nom_complet}
                  photo={ancestor.photo}
                  size="xl"
                />
                <h3>{ancestor.nom_complet}</h3>
                {ancestor.role && <span className="badge badge-violet">{ancestor.role}</span>}
                {ancestor.description && <p className="small muted">{ancestor.description}</p>}
                {canDelete && (
                  <ConfirmForm
                    action={deleteAncestorAction.bind(null, ancestor.id)}
                    message="Supprimer cet ancêtre ?"
                  >
                    <button type="submit" className="btn btn-danger-soft btn-sm">
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </ConfirmForm>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
