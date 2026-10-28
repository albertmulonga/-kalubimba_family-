import Link from "next/link";
import { FileText, Images, TreePine } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AutoRedirect } from "@/components/AutoRedirect";

export const metadata = { title: "Bienvenue" };

export default async function SplashPage() {
  const session = await getSession();
  const target = session ? "/dashboard" : "/welcome";

  return (
    <main className="kf-splash-page">
      <AutoRedirect href={target} delay={session ? 800 : 4200} />
      <div className="kf-splash-pattern" />
      <div className="kf-splash-blob is-one" />
      <div className="kf-splash-blob is-two" />
      <div className="kf-splash-blob is-three" />

      <div className="kf-splash-top">
        <Link href={target} className="kf-splash-skip">
          Passer
        </Link>
      </div>

      <div className="kf-splash-inner">
        <div className="kf-splash-logo-ring">
          <img src="/images/logo.png" alt="Kalubimba Family" />
        </div>

        <h1 className="kf-splash-title">Kalubimba Family</h1>
        <p className="kf-splash-subtitle">
          Une plateforme dédiée à l&apos;unité, la mémoire et la transmission de notre héritage
          familial.
        </p>
        <p className="kf-splash-description">
          Préserver notre histoire. Renforcer nos liens. Construire notre avenir ensemble.
        </p>

        <div className="kf-splash-features">
          <div className="kf-splash-feature">
            <TreePine aria-hidden="true" />
            <span>Arbre Généalogique</span>
          </div>
          <div className="kf-splash-feature">
            <Images aria-hidden="true" />
            <span>Albums Photos</span>
          </div>
          <div className="kf-splash-feature">
            <FileText aria-hidden="true" />
            <span>Comptes rendus</span>
          </div>
        </div>

        <div className="kf-splash-actions">
          <Link className="kf-splash-primary" href={target}>
            Continuer
          </Link>
          <Link className="kf-splash-secondary" href="/login">
            Se connecter
          </Link>
        </div>

        <div className="kf-splash-dots">
          <div className="kf-splash-dot" />
          <div className="kf-splash-dot" />
          <div className="kf-splash-dot" />
        </div>
      </div>
    </main>
  );
}
