import Link from "next/link";
import { Calendar, Edit3, Mail, MapPin, Phone, Settings, UserRound } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getCurrentUser, getMainMember } from "@/lib/data";
import { formatDate, fullName, mediaUrl } from "@/lib/format";
import { Alert } from "@/components/Alert";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { readFlash } from "@/lib/flash";

export const metadata = { title: "Mon profil" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const [user, member] = await Promise.all([
    getCurrentUser(session.id),
    getMainMember(session.id),
  ]);

  const photo = mediaUrl(user?.photo) ?? mediaUrl(member?.photo);
  const displayName = fullName({ nom: user?.nom, prenom: user?.prenom });

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <h1>Mon profil</h1>
          <p>Votre présence dans la famille Kalubimba.</p>
        </div>
        <div className="head-actions">
          <Link href="/settings" className="btn btn-ghost">
            <Settings size={16} /> Paramètres
          </Link>
          {member && (
            <Link href={`/members/${member.id}/edit`} className="btn btn-primary">
              <Edit3 size={16} /> Modifier ma fiche
            </Link>
          )}
        </div>
      </div>

      <section className="profile-hero">
        <ProfilePhoto
          nom={user?.nom}
          prenom={user?.prenom}
          photo={photo}
          size="xl"
          shape="square"
        />
        <div className="identity">
          <div className="row wrap" style={{ gap: 8, marginBottom: 6 }}>
            <h1>{displayName}</h1>
            {session.isAdmin && <span className="badge badge-blue">Administrateur</span>}
            {member?.is_bloodline && <span className="badge badge-green">Lignée Kalubimba</span>}
          </div>
          <div className="meta">
            <span>
              <UserRound size={14} /> {user?.matricule || "Matricule non attribué"}
            </span>
            {user?.email && (
              <span>
                <Mail size={14} /> {user.email}
              </span>
            )}
            {user?.telephone && (
              <span>
                <Phone size={14} /> {user.telephone}
              </span>
            )}
            {(user?.ville || user?.pays) && (
              <span>
                <MapPin size={14} /> {[user.ville, user.pays].filter(Boolean).join(", ")}
              </span>
            )}
            {user?.date_naissance && (
              <span>
                <Calendar size={14} /> {formatDate(user.date_naissance)}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="detail-layout">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Ma fiche familiale</h2>
                <p>Les informations visibles par la famille.</p>
              </div>
            </div>
            <div className="card-body">
              {member ? (
                <div className="info-grid">
                  <div className="info-item">
                    <span>Nom complet</span>
                    <strong>{fullName(member)}</strong>
                  </div>
                  <div className="info-item">
                    <span>Profession</span>
                    <strong>{member.profession || "—"}</strong>
                  </div>
                  <div className="info-item">
                    <span>Lieu</span>
                    <strong>{member.lieu || "—"}</strong>
                  </div>
                  <div className="info-item">
                    <span>Adresse</span>
                    <strong>{member.adresse || "—"}</strong>
                  </div>
                  {member.biographie && (
                    <div className="info-item span-2">
                      <span>Biographie</span>
                      <strong style={{ fontWeight: 400 }}>{member.biographie}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <p className="muted small">
                  Aucune fiche membre n&apos;est encore liée à votre compte.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Accès rapides</h2>
              </div>
            </div>
            <div className="card-body stack" style={{ gap: 8 }}>
              <Link href="/family-tree" className="btn btn-ghost btn-block">
                Mon arbre généalogique
              </Link>
              <Link href="/reunions" className="btn btn-ghost btn-block">
                Comptes rendus
              </Link>
              <Link href="/photos" className="btn btn-ghost btn-block">
                Mes photos
              </Link>
              <Link href="/settings" className="btn btn-primary btn-block">
                Modifier mes informations
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
