import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Images,
  UserPlus,
  Users,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { registerAction } from "@/lib/actions/auth";
import { readFlash } from "@/lib/flash";
import { PasswordField } from "@/components/PasswordField";

export const metadata = { title: "Créer un compte" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const flash = await readFlash(searchParams);

  return (
    <div className="kf-auth-card is-register">
      <section className="kf-auth-brand">
        <img src="/images/logo.png" alt="Logo Kalubimba Family" />
        <h1>Kalubimba Family</h1>
        <p>Rejoignez la famille</p>
        <div className="kf-auth-features">
          <div className="kf-auth-feature">
            <Users size={20} />
            <span>Connectez-vous avec votre famille</span>
          </div>
          <div className="kf-auth-feature">
            <Images size={20} />
            <span>Partagez vos souvenirs</span>
          </div>
          <div className="kf-auth-feature">
            <BookOpen size={20} />
            <span>Découvrez votre histoire</span>
          </div>
        </div>
      </section>

      <section className="kf-auth-form">
        <h2>Créer un compte</h2>
        <p className="kf-auth-subtitle">Rejoignez la famille Kalubimba</p>

        {flash.error ? (
          <div className="kf-auth-alert" role="alert">
            <AlertCircle size={18} />
            <span>{flash.error}</span>
          </div>
        ) : null}
        {flash.success ? (
          <div className="kf-auth-alert is-success" role="status">
            <CheckCircle2 size={18} />
            <span>{flash.success}</span>
          </div>
        ) : null}
        {flash.info ? (
          <div className="kf-auth-alert is-info" role="status">
            <AlertCircle size={18} />
            <span>{flash.info}</span>
          </div>
        ) : null}

        <form action={registerAction}>
          <div className="kf-auth-row">
            <div className="kf-auth-group">
              <label htmlFor="nom">Nom *</label>
              <input type="text" id="nom" name="nom" placeholder="Votre nom" required />
            </div>
            <div className="kf-auth-group">
              <label htmlFor="prenom">Prénom *</label>
              <input type="text" id="prenom" name="prenom" placeholder="Votre prénom" required />
            </div>
          </div>

          <div className="kf-auth-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" placeholder="votre@email.com" required />
          </div>

          <div className="kf-auth-row">
            <div className="kf-auth-group">
              <label htmlFor="genre">Genre *</label>
              <select id="genre" name="genre" defaultValue="M" required>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            <div className="kf-auth-group">
              <label htmlFor="date_naissance">Date de naissance</label>
              <input type="date" id="date_naissance" name="date_naissance" />
            </div>
          </div>

          <div className="kf-auth-group">
            <label htmlFor="password">Mot de passe *</label>
            <PasswordField
              id="password"
              name="mot_de_passe"
              placeholder="Choisissez un mot de passe"
              autoComplete="new-password"
              minLength={6}
            />
            <span className="kf-auth-hint">6 caractères minimum.</span>
          </div>

          <div className="kf-auth-row">
            <div className="kf-auth-group">
              <label htmlFor="telephone">Téléphone</label>
              <input type="tel" id="telephone" name="telephone" placeholder="+243..." />
            </div>
            <div className="kf-auth-group">
              <label htmlFor="pays">Pays</label>
              <input type="text" id="pays" name="pays" defaultValue="RDC" />
            </div>
          </div>

          <div className="kf-auth-row">
            <div className="kf-auth-group">
              <label htmlFor="ville">Ville</label>
              <input type="text" id="ville" name="ville" placeholder="Votre ville" />
            </div>
            <div className="kf-auth-group">
              <label htmlFor="lieu_naissance">Lieu de naissance</label>
              <input
                type="text"
                id="lieu_naissance"
                name="lieu_naissance"
                placeholder="Lieu de naissance"
              />
            </div>
          </div>

          <div className="kf-auth-group">
            <label htmlFor="profession">Profession</label>
            <input type="text" id="profession" name="profession" placeholder="Votre profession" />
          </div>

          <button type="submit" className="kf-auth-submit">
            <UserPlus size={18} />
            Créer mon compte
          </button>
        </form>

        <div className="kf-auth-footer">
          <p>
            Vous avez déjà un compte ? <Link href="/login">Se connecter</Link>
          </p>
        </div>
        <div className="kf-auth-back">
          <Link href="/welcome">
            <ArrowLeft size={14} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
