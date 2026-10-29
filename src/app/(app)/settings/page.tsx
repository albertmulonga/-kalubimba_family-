import Link from "next/link";
import { KeyRound, Shield, Smartphone, UserRound } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getCurrentUser } from "@/lib/data";
import { dateInputValue, mediaUrl } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { SafeImage } from "@/components/SafeImage";
import { changePasswordAction, updateProfileAction } from "@/lib/actions/account";
import { CloudinaryFileInput } from "@/components/CloudinaryFileInput";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const user = await getCurrentUser(session.id);
  const photo = mediaUrl(user?.photo);

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <h1>Paramètres</h1>
          <p>Gérez vos informations personnelles et votre sécurité.</p>
        </div>
        <Link href="/profile" className="btn btn-ghost">
          <UserRound size={16} /> Voir mon profil
        </Link>
      </div>

      <div className="detail-layout">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Informations personnelles</h2>
                <p>Ces informations apparaissent sur votre profil.</p>
              </div>
              <UserRound size={18} color="#2563eb" />
            </div>
            <form action={updateProfileAction} className="card-body">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="prenom">Prénom *</label>
                  <input id="prenom" name="prenom" className="input" defaultValue={user?.prenom ?? ""} required />
                </div>
                <div className="field">
                  <label htmlFor="nom">Nom *</label>
                  <input id="nom" name="nom" className="input" defaultValue={user?.nom ?? ""} required />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" className="input" defaultValue={user?.email ?? ""} />
                </div>
                <div className="field">
                  <label htmlFor="telephone">Téléphone</label>
                  <input id="telephone" name="telephone" className="input" defaultValue={user?.telephone ?? ""} />
                </div>
                <div className="field">
                  <label htmlFor="pays">Pays</label>
                  <input id="pays" name="pays" className="input" defaultValue={user?.pays ?? ""} />
                </div>
                <div className="field">
                  <label htmlFor="ville">Ville</label>
                  <input id="ville" name="ville" className="input" defaultValue={user?.ville ?? ""} />
                </div>
                <div className="field">
                  <label htmlFor="date_naissance">Date de naissance</label>
                  <input
                    id="date_naissance"
                    name="date_naissance"
                    type="date"
                    className="input"
                    defaultValue={dateInputValue(user?.date_naissance)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="photo">Photo de profil</label>
                  <CloudinaryFileInput
                    name="photo_url"
                    accept="image/*"
                    cloudName={process.env.CLOUDINARY_CLOUD_NAME ?? ""}
                    uploadPreset={process.env.CLOUDINARY_UPLOAD_PRESET ?? ""}
                    folder="kalubimba/members"
                  />
                </div>
                <div className="field">
                  <label>Photo actuelle</label>
                  {photo ? (
                    <SafeImage src={photo} alt="Profil" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 18 }} />
                  ) : (
                    <span className="muted small">Aucune photo.</span>
                  )}
                </div>
                <div className="form-actions span-2">
                  <button type="submit" className="btn btn-primary">
                    Enregistrer les informations
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Mot de passe</h2>
                <p>Choisissez un mot de passe d&apos;au moins 6 caractères.</p>
              </div>
              <KeyRound size={18} color="#2563eb" />
            </div>
            <form action={changePasswordAction} className="card-body">
              <div className="form-grid">
                <div className="field span-2">
                  <label htmlFor="mot_de_passe_actuel">Mot de passe actuel *</label>
                  <input
                    id="mot_de_passe_actuel"
                    name="mot_de_passe_actuel"
                    type="password"
                    className="input"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="nouveau_mot_de_passe">Nouveau mot de passe *</label>
                  <input
                    id="nouveau_mot_de_passe"
                    name="nouveau_mot_de_passe"
                    type="password"
                    className="input"
                    minLength={6}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="confirmation">Confirmation *</label>
                  <input
                    id="confirmation"
                    name="confirmation"
                    type="password"
                    className="input"
                    minLength={6}
                    required
                  />
                </div>
                <div className="form-actions span-2">
                  <button type="submit" className="btn btn-primary">
                    Modifier le mot de passe
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Mon compte</h2>
                <p>Identifiants et accès.</p>
              </div>
            </div>
            <div className="card-body stack" style={{ gap: 12 }}>
              <div className="info-item">
                <span>Matricule</span>
                <strong>{user?.matricule || "Non attribué"}</strong>
              </div>
              <div className="info-item">
                <span>Rôle</span>
                <strong>{session.isAdmin ? "Administrateur" : "Membre"}</strong>
              </div>
              <div className="info-item">
                <span>Compte créé le</span>
                <strong>{user?.date_creation ? new Date(user.date_creation).toLocaleDateString("fr-FR") : "—"}</strong>
              </div>
              {session.isAdmin && (
                <Link href="/admin/users" className="btn btn-ghost btn-block">
                  <Shield size={16} /> Gestion des utilisateurs
                </Link>
              )}
              <Link href="/mobile" className="btn btn-ghost btn-block">
                <Smartphone size={16} /> Version mobile
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
