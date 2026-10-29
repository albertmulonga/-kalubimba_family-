import Link from "next/link";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMembers, getPhotos } from "@/lib/data";
import { formatDate, fullName, mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { ConfirmForm } from "@/components/ConfirmForm";
import { MediaViewer } from "@/components/MediaViewer";
import { SafeImage } from "@/components/SafeImage";
import { CloudinaryFileInput } from "@/components/CloudinaryFileInput";
import { deletePhotoAction, uploadPhotoAction } from "@/lib/actions/memories";

export const metadata = { title: "Photos de famille" };

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const flash = await readFlash(params);
  const memberParam = Array.isArray(params.member) ? params.member[0] : params.member;
  const memberId = Number(memberParam) || undefined;
  const [photos, members] = await Promise.all([getPhotos(memberId), getMembers()]);

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <h1>Photos de famille</h1>
          <p>{photos.length} souvenir{photos.length > 1 ? "s" : ""} partagé{photos.length > 1 ? "s" : ""}.</p>
        </div>
        <form action="/photos" method="get" className="row" style={{ gap: 8 }}>
          <select name="member" className="select" defaultValue={memberId ?? ""} style={{ minWidth: 220 }}>
            <option value="">Tous les membres</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {fullName(member)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-ghost">Filtrer</button>
          {memberId && (
            <Link href="/photos" className="btn btn-ghost">
              Réinitialiser
            </Link>
          )}
        </form>
      </div>

      <details className="card" style={{ marginBottom: 20 }}>
        <summary className="card-head" style={{ cursor: "pointer", listStyle: "none" }}>
          <div>
            <h2>Ajouter une photo</h2>
            <p>Partagez un souvenir avec la famille.</p>
          </div>
          <span className="btn btn-primary btn-sm">
            <Upload size={14} /> Choisir une image
          </span>
        </summary>
        <form action={uploadPhotoAction} className="card-body">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="image">Image *</label>
              <input id="image" name="image" type="file" accept="image/*" className="input" required />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <input id="description" name="description" className="input" placeholder="Vacances, mariage..." />
            </div>
            <div className="field">
              <label htmlFor="membre_id">Membre associé</label>
              <select id="membre_id" name="membre_id" className="select" defaultValue={memberId ?? ""}>
                <option value="">Aucun membre</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {fullName(member)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions span-2">
              <button type="submit" className="btn btn-primary">
                <Upload size={16} /> Publier la photo
              </button>
            </div>
          </div>
        </form>
      </details>

      {photos.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">
            <ImageIcon />
          </div>
          <h3>Aucune photo pour le moment</h3>
          <p>Ajoutez la première image de la famille Kalubimba.</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => {
            const canDelete = session.isAdmin || photo.utilisateur_id === session.id;
            return (
              <article key={photo.id} className="photo-card">
                <MediaViewer
                  kind="image"
                  src={mediaUrl(photo.image) ?? ""}
                  title={photo.description || "Photo de famille"}
                  className="frame"
                  canDelete={canDelete}
                  deleteAction={deletePhotoAction.bind(null, photo.id)}
                >
                  <SafeImage
                    src={mediaUrl(photo.image) ?? ""}
                    alt={photo.description ?? "Photo de famille"}
                  />
                </MediaViewer>
                <div className="caption">
                  <div>
                    <strong>{photo.description || "Souvenir de famille"}</strong>
                    <span>
                      {formatDate(photo.date_publication)}
                      {photo.uploader_prenom
                        ? ` · Publiée par ${photo.uploader_prenom} ${photo.uploader_nom ?? ""}`.trim()
                        : ""}
                    </span>
                    {photo.membre_id && (
                      <Link href={`/members/${photo.membre_id}`} className="tiny" style={{ color: "#2563eb" }}>
                        Associée à {photo.member_prenom} {photo.member_nom}
                      </Link>
                    )}
                  </div>
                  {canDelete && (
                    <ConfirmForm
                      action={deletePhotoAction.bind(null, photo.id)}
                      message="Supprimer cette photo ?"
                    >
                      <button type="submit" className="icon-btn danger" title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </ConfirmForm>
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
