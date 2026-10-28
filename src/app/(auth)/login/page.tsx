import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Images,
  LogIn,
  Users,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { loginAction } from "@/lib/actions/auth";
import { readFlash } from "@/lib/flash";
import { PasswordField } from "@/components/PasswordField";

export const metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const flash = await readFlash(searchParams);

  return (
    <div className="kf-auth-card">
      <section className="kf-auth-brand">
        <img src="/images/logo.png" alt="Logo Kalubimba Family" />
        <h1>Kalubimba Family</h1>
        <p>Le réseau familial qui rapproche</p>
        <div className="kf-auth-features">
          <div className="kf-auth-feature">
            <Users size={20} />
            <span>Retrouvez tous les membres de la famille</span>
          </div>
          <div className="kf-auth-feature">
            <Images size={20} />
            <span>Partagez vos photos et vos souvenirs</span>
          </div>
          <div className="kf-auth-feature">
            <FileText size={20} />
            <span>Consultez les comptes rendus familiaux</span>
          </div>
        </div>
      </section>

      <section className="kf-auth-form">
        <h2>Bienvenue</h2>
        <p className="kf-auth-subtitle">Connectez-vous à votre compte</p>

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

        <form action={loginAction}>
          <div className="kf-auth-group">
            <label htmlFor="identifiant">Email ou Matricule</label>
            <input
              type="text"
              id="identifiant"
              name="identifiant"
              placeholder="Email ou Matricule (ex: KALUBIMBA00001)"
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div className="kf-auth-group">
            <label htmlFor="password">Mot de passe</label>
            <PasswordField
              id="password"
              name="mot_de_passe"
              placeholder="Votre mot de passe"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="kf-auth-submit">
            <LogIn size={18} />
            Connexion
          </button>
        </form>

        <div className="kf-auth-footer">
          <p>
            Vous n&apos;avez pas de compte ? <Link href="/register">Créer un compte</Link>
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
