import Link from "next/link";
import { Film, UserRound, Users } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMembers, getVideos } from "@/lib/data";
import { formatDate, fullName, mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoUploadForm } from "@/components/VideoUploadForm";
import { deleteVideoAction } from "@/lib/actions/memories";

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

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? "";

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
            {members.map((m) => (
              <option key={m.id} value={m.id}>{fullName(m)}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-ghost">Filtrer</button>
          {memberId && <Link href="/videos" className="btn btn-ghost">Réinitialiser</Link>}
        </form>
      </div>

      {/* Upload côté client — évite la limite 4.5MB de Vercel */}
      <VideoUploadForm
        cloudName={cloudName}
        uploadPreset={uploadPreset}
        members={members.map((m) => ({ id: m.id, name: fullName(m) }))}
      />

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
              .filter(Boolean).join(" ").trim() || null;
            const associated = [video.member_prenom, video.member_nom]
              .filter(Boolean).join(" ").trim() || null;
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
                      {uploader && <span><UserRound size={12} /> {uploader}</span>}
                      {associated && <span><Users size={12} /> {associated}</span>}
                      {video.duree && <span className="badge badge-blue">{video.duree}</span>}
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
