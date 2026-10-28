import Link from "next/link";
import { Film, Upload, UserRound, Users } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMembers, getVideos } from "@/lib/data";
import { formatDate, fullName, mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { VideoPlayer } from "@/components/VideoPlayer";
import { deleteVideoAction, uploadVideoAction } from "@/lib/actions/memories";

export const metadata = { title: "Vidéos de famille" };

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const flash = await readFlash(params);
  const memberParam = Array.isArray(params.member) ? params.member[0] : params.member;
  const memberId = Number(memberParam) || undefined;
  const [videos, members] = await Promise.all([getVideos(memberId), getMembers()]);

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <div className="page-head">
        <div>
          <h1>Vidéos de famille</h1>
          <p>
            {videos.length} vidéo{videos.length > 1 ? "s" : ""} partagée
            {videos.length > 1 ? "s" : ""}.
          </p>
        </div>
        <form action="/videos" method="get" className="row" style={{ gap: 8 }}>
          <select
            name="member"
            className="select"
            defaultValue={memberId ?? ""}
            style={{ minWidth: 220 }}
          >
            <option value="">Tous les membres</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {fullName(member)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-ghost">Filtrer</button>
          {memberId && (
            <Link href="/videos" className="btn btn-ghost">Réinitialiser</Link>
          )}
        </form>
      </div>

      {/* Formulaire upload */}
      <details className="card" style={{ marginBottom: 20 }}>
        <summary className="card-head" style={{ cursor: "pointer", listStyle: "none" }}>
          <div>
            <h2>Ajouter une vidéo</h2>
            <p>Partagez un moment filmé de la famille.</p>
          </div>
          <span className="btn btn-primary btn-sm">
            <Upload size={14} /> Choisir une vidéo
          </span>
        </summary>
        <form action={uploadVideoAction} className="card-body">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="video">Vidéo *</label>
              <input
                id="video"
                name="video"
                type="file"
                accept="video/*"
                className="input"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <input id="description" name="description" className="input" />
            </div>
            <div className="field">
              <label htmlFor="duree">Durée</label>
              <input id="duree" name="duree" className="input" placeholder="Ex. 03:45" />
            </div>
            <div className="field span-2">
              <label htmlFor="membre_id">Membre associé</label>
              <select id="membre_id" name="membre_id" className="select" defaultValue="">
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
                <Upload size={16} /> Publier la vidéo
              </button>
            </div>
          </div>
        </form>
      </details>

      {/* Liste des vidéos */}
      {videos.length === 0 ? (
        <div className="card empty-state">
          <div className="icon"><Film /></div>
          <h3>Aucune vidéo pour le moment</h3>
          <p>Ajoutez le premier film de famille.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => {
            const videoSrc = mediaUrl(video.video);
            if (!videoSrc) return null;

            const canDelete = session.isAdmin || video.utilisateur_id === session.id;
            const uploader = [video.uploader_prenom, video.uploader_nom]
              .filter(Boolean)
              .join(" ")
              .trim() || null;
            const associated = [video.member_prenom, video.member_nom]
              .filter(Boolean)
              .join(" ")
              .trim() || null;

            return (
              <article key={video.id} className="video-card">
                <VideoPlayer
                  src={videoSrc}
                  title={video.description || "Vidéo de famille"}
                  canDelete={canDelete}
                  deleteAction={deleteVideoAction.bind(null, video.id)}
                />
                <div className="video-card-caption">
                  <div>
                    <strong>{video.description || "Vidéo de famille"}</strong>
                    <div className="video-card-meta">
                      <span>{formatDate(video.date_publication)}</span>
                      {uploader && (
                        <span>
                          <UserRound size={12} /> {uploader}
                        </span>
                      )}
                      {associated && (
                        <span>
                          <Users size={12} /> {associated}
                        </span>
                      )}
                      {video.duree && (
                        <span className="badge badge-blue">{video.duree}</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
