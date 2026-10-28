import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Cake,
  Calendar,
  Edit3,
  Heart,
  Home,
  Image as ImageIcon,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import {
  getChildrenOf,
  getMember,
  getMemberPlainPassword,
  getParentsOf,
  getPhotos,
  getSpousesOf,
} from "@/lib/data";
import { requireSession } from "@/lib/auth";
import { canDeleteMember, canUpdateMember, canViewCredentials } from "@/lib/permissions";
import { age, formatDate, fullName, genderLabel, mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { Avatar } from "@/components/Avatar";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { ConfirmForm } from "@/components/ConfirmForm";
import { MediaViewer } from "@/components/MediaViewer";
import { SafeImage } from "@/components/SafeImage";
import { deleteMemberAction } from "@/lib/actions/members";

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isFinite(memberId)) notFound();

  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const member = await getMember(memberId);
  if (!member) notFound();

  const [parents, spouses, children, photos, canEdit, canDelete, canCredentials] =
    await Promise.all([
      getParentsOf(member),
      getSpousesOf(member.id),
      getChildrenOf(member.id),
      getPhotos(member.id),
      canUpdateMember(session, member.id),
      canDeleteMember(session, member.id),
      canViewCredentials(session, member),
    ]);

  const years = age(member.date_naissance, member.date_deces);
  const linkedUser = member.utilisateur_id !== null;
  const plainPassword =
    canCredentials && linkedUser ? await getMemberPlainPassword(member.id) : null;

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <div className="row-between wrap" style={{ marginBottom: 16 }}>
        <Link href="/members" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> Tous les membres
        </Link>
        <div className="row wrap" style={{ gap: 8 }}>
          {canEdit && (
            <>
              <Link
                href={`/family-tree/add-parents?member_id=${member.id}`}
                className="btn btn-ghost btn-sm"
              >
                <Plus size={14} /> Parents
              </Link>
              <Link
                href={`/family-tree/add-children?member_id=${member.id}`}
                className="btn btn-ghost btn-sm"
              >
                <Plus size={14} /> Enfant
              </Link>
              <Link
                href={`/family-tree/add-spouse?member_id=${member.id}`}
                className="btn btn-ghost btn-sm"
              >
                <Heart size={14} /> Conjoint
              </Link>
              <Link href={`/members/${member.id}/edit`} className="btn btn-primary btn-sm">
                <Edit3 size={14} /> Modifier
              </Link>
            </>
          )}
          {canDelete && (
            <ConfirmForm
              action={deleteMemberAction.bind(null, member.id)}
              message={`Supprimer définitivement ${fullName(member)} ? Cette action est irréversible.`}
            >
              <button type="submit" className="btn btn-danger-soft btn-sm">
                <Trash2 size={14} /> Supprimer
              </button>
            </ConfirmForm>
          )}
        </div>
      </div>

      <section className="profile-hero">
        <ProfilePhoto
          nom={member.nom}
          prenom={member.prenom}
          nomComplet={member.nom_complet}
          photo={member.photo}
          size="xl"
          className="profile-hero-photo"
        />
        <div className="identity">
          <div className="row wrap" style={{ gap: 8, marginBottom: 6 }}>
            <h1>{fullName(member)}</h1>
            {member.date_deces ? (
              <span className="badge badge-rose">En mémoire</span>
            ) : (
              <span className="badge badge-green">Vivant</span>
            )}
            {member.is_bloodline && <span className="badge badge-blue">Lignée Kalubimba</span>}
          </div>
          <div className="meta">
            <span>
              <UserRound size={14} /> {genderLabel(member.genre)}
            </span>
            {member.date_naissance && (
              <span>
                <Cake size={14} /> {formatDate(member.date_naissance)}
                {years !== null ? ` · ${years} ans` : ""}
              </span>
            )}
            {member.lieu && (
              <span>
                <MapPin size={14} /> {member.lieu}
              </span>
            )}
            {member.profession && (
              <span>
                <Calendar size={14} /> {member.profession}
              </span>
            )}
          </div>
          {member.biographie && (
            <p className="muted small" style={{ marginTop: 12, maxWidth: 700 }}>
              {member.biographie}
            </p>
          )}
        </div>
      </section>

      <div className="detail-layout">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Informations personnelles</h2>
                <p>Les détails du profil familial.</p>
              </div>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <span>Nom complet</span>
                  <strong>{fullName(member)}</strong>
                </div>
                <div className="info-item">
                  <span>Genre</span>
                  <strong>{genderLabel(member.genre)}</strong>
                </div>
                <div className="info-item">
                  <span>Date de naissance</span>
                  <strong>{formatDate(member.date_naissance)}</strong>
                </div>
                <div className="info-item">
                  <span>Date de décès</span>
                  <strong>{formatDate(member.date_deces)}</strong>
                </div>
                <div className="info-item">
                  <span>Lieu</span>
                  <strong>{member.lieu || "—"}</strong>
                </div>
                <div className="info-item">
                  <span>Profession</span>
                  <strong>{member.profession || "—"}</strong>
                </div>
                <div className="info-item">
                  <span>Adresse</span>
                  <strong>{member.adresse || "—"}</strong>
                </div>
                <div className="info-item">
                  <span>Nom du père (texte)</span>
                  <strong>{member.nom_pere || "—"}</strong>
                </div>
                <div className="info-item">
                  <span>Nom de la mère (texte)</span>
                  <strong>{member.nom_mere || "—"}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Liens familiaux</h2>
                <p>Parents et conjoint(s) enregistrés.</p>
              </div>
              <Users size={18} color="#2563eb" />
            </div>
            <div className="card-body stack" style={{ gap: 22 }}>
              <div>
                <div className="section-head">
                  <h2 style={{ fontSize: "0.92rem" }}>Parents</h2>
                </div>
                {parents.length === 0 ? (
                  <p className="muted small">Aucun parent enregistré.</p>
                ) : (
                  <div className="row wrap">
                    {parents.map((parent) => (
                      <Link key={parent.id} href={`/members/${parent.id}`} className="person-chip">
                        <Avatar nom={parent.nom} prenom={parent.prenom} nomComplet={parent.nom_complet} photo={parent.photo} />
                        <div>
                          <strong>{fullName(parent)}</strong>
                          <span>{genderLabel(parent.genre)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="section-head">
                  <h2 style={{ fontSize: "0.92rem" }}>Conjoint(s)</h2>
                </div>
                {spouses.length === 0 ? (
                  <p className="muted small">Aucun conjoint enregistré.</p>
                ) : (
                  <div className="row wrap">
                    {spouses.map((spouse) => (
                      <Link key={spouse.id} href={`/members/${spouse.id}`} className="person-chip">
                        <Avatar nom={spouse.nom} prenom={spouse.prenom} nomComplet={spouse.nom_complet} photo={spouse.photo} />
                        <div>
                          <strong>{fullName(spouse)}</strong>
                          <span>{genderLabel(spouse.genre)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="section-head">
                  <h2 style={{ fontSize: "0.92rem" }}>Foyer</h2>
                </div>
                <div className="member-household-callout">
                  <span className="member-household-icon">
                    <Home size={20} />
                  </span>
                  <div>
                    <strong>
                      {children.length} enfant{children.length > 1 ? "s" : ""}
                      {spouses.length > 0 ? " · couple responsable" : " · responsable du foyer"}
                    </strong>
                    <span>
                      Les enfants ne sont plus listés ici : ouvrez le foyer pour voir tout
                      le monde.
                    </span>
                  </div>
                  <Link href={`/households/${member.id}`} className="btn btn-soft btn-sm">
                    Voir le foyer
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Photos</h2>
                <p>Les souvenirs associés à ce membre.</p>
              </div>
              <ImageIcon size={18} color="#2563eb" />
            </div>
            <div className="card-body">
              {photos.length === 0 ? (
                <p className="muted small">Aucune photo associée pour le moment.</p>
              ) : (
                <div className="photo-grid">
                  {photos.map((photo) => (
                    <div key={photo.id} className="photo-card">
                      <MediaViewer
                        kind="image"
                        src={mediaUrl(photo.image) ?? ""}
                        title={photo.description || "Souvenir de famille"}
                        className="frame"
                      >
                        <SafeImage
                          src={mediaUrl(photo.image) ?? ""}
                          alt={photo.description ?? "Photo"}
                        />
                      </MediaViewer>
                      <div className="caption">
                        <div>
                          <strong>{photo.description || "Souvenir de famille"}</strong>
                          <span>{formatDate(photo.date_publication)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          {canCredentials && linkedUser && (
            <section className="card">
              <div className="card-head">
                <div>
                  <h2>Identifiants de connexion</h2>
                  <p>Informations du compte lié à ce membre.</p>
                </div>
              </div>
              <div className="card-body">
                <div className="credential-box">
                  <div className="row-between">
                    <span>Matricule</span>
                    <code>{member.user_matricule || "Non attribué"}</code>
                  </div>
                  <div className="row-between">
                    <span>Email</span>
                    <code>{member.user_email || "Aucun"}</code>
                  </div>
                  <div className="row-between">
                    <span>Mot de passe</span>
                    <code>{plainPassword || "••••••••"}</code>
                  </div>
                </div>
                {plainPassword && (
                  <p className="tiny muted" style={{ marginTop: 10 }}>
                    Mot de passe conservé pour permettre aux parents de retrouver les identifiants
                    du compte enfant.
                  </p>
                )}
              </div>
            </section>
          )}

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Actions</h2>
                <p>Compléter ou mettre à jour la fiche.</p>
              </div>
            </div>
            <div className="card-body stack" style={{ gap: 8 }}>
              {canEdit && (
                <>
                  <Link href={`/members/${member.id}/edit`} className="btn btn-primary btn-block">
                    <Edit3 size={16} /> Modifier le profil
                  </Link>
                  <Link
                    href={`/family-tree/add-spouse?member_id=${member.id}`}
                    className="btn btn-ghost btn-block"
                  >
                    <Heart size={16} /> Ajouter un conjoint
                  </Link>
                  <Link
                    href={`/family-tree/add-children?member_id=${member.id}`}
                    className="btn btn-ghost btn-block"
                  >
                    <Plus size={16} /> Ajouter un enfant
                  </Link>
                </>
              )}
              <Link href="/family-tree" className="btn btn-ghost btn-block">
                <BookOpen size={16} /> Voir l&apos;arbre complet
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
