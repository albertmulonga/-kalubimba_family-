import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  FileText,
  HeartHandshake,
  Images,
  Sparkles,
  Users,
} from "lucide-react";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Accueil" };

export default async function WelcomePage() {
  const session = await getSession();

  return (
    <main className="kf-welcome">
      <header className="kf-header">
        <div className="kf-header-content">
          <div className="kf-logo-header">
            <img src="/images/logo.png" alt="Kalubimba Family" />
            <h2>Kalubimba Family</h2>
          </div>
          <div className="kf-header-actions">
            <div className="kf-lang" aria-hidden="true">
              <span className="is-active">FR</span>
              <span>EN</span>
              <span>SW</span>
              <span>LN</span>
              <span>KR</span>
            </div>
            {session ? (
              <Link href="/dashboard" className="kf-btn-header kf-btn-register">
                Mon tableau de bord
              </Link>
            ) : (
              <>
                <Link href="/login" className="kf-btn-header kf-btn-login">
                  Se connecter
                </Link>
                <Link href="/register" className="kf-btn-header kf-btn-register">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="kf-hero">
        <div className="kf-hero-content">
          <h1 className="kf-hero-title">
            Bienvenue dans l&apos;application officielle de la Famille Kalubimba
          </h1>
          <p className="kf-hero-subtitle">
            Cette application a été créée afin de renforcer les liens entre les membres de la
            grande famille Kalubimba, préserver notre histoire et faciliter la communication entre
            les différentes générations.
          </p>
          <div className="kf-hero-buttons">
            {session ? (
              <Link href="/dashboard" className="kf-btn-hero kf-btn-hero-primary">
                Ouvrir mon espace
              </Link>
            ) : (
              <Link href="/login" className="kf-btn-hero kf-btn-hero-primary">
                Se connecter
              </Link>
            )}
            <Link href="/register" className="kf-btn-hero kf-btn-hero-secondary">
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      <section className="kf-section kf-about">
        <h2 className="kf-section-title">Qui sommes-nous ?</h2>
        <div className="kf-about-content">
          <div className="kf-about-text">
            <p>
              La famille Kalubimba représente un héritage riche transmis de génération en
              génération. Depuis nos ancêtres fondateurs jusqu&apos;aux jeunes générations
              d&apos;aujourd&apos;hui, notre famille a toujours été fondée sur des valeurs fortes :
              l&apos;unité, le respect, la solidarité et la transmission du savoir.
            </p>
            <p>
              Grâce à cette application, chaque membre peut rester connecté à la famille, découvrir
              l&apos;histoire de ses ancêtres et participer activement à la vie familiale.
            </p>
          </div>
          <div className="kf-about-image">
            <img src="/images/logo.png" alt="Famille Kalubimba" />
          </div>
        </div>
      </section>

      <section className="kf-section kf-values">
        <h2 className="kf-section-title">Les valeurs de la famille Kalubimba</h2>
        <div className="kf-values-grid">
          <div className="kf-value-card">
            <div className="kf-value-icon">
              <Users />
            </div>
            <h3 className="kf-value-title">Unité</h3>
            <p className="kf-value-description">
              La famille est notre première force. Nous croyons profondément que l&apos;unité
              renforce notre avenir.
            </p>
          </div>
          <div className="kf-value-card">
            <div className="kf-value-icon">
              <HeartHandshake />
            </div>
            <h3 className="kf-value-title">Respect</h3>
            <p className="kf-value-description">
              Le respect des anciens et la considération des jeunes générations sont au cœur de
              notre culture.
            </p>
          </div>
          <div className="kf-value-card">
            <div className="kf-value-icon">
              <BookOpen />
            </div>
            <h3 className="kf-value-title">Transmission</h3>
            <p className="kf-value-description">
              Notre histoire et nos traditions doivent être transmises afin que chaque génération
              sache d&apos;où elle vient.
            </p>
          </div>
          <div className="kf-value-card">
            <div className="kf-value-icon">
              <HeartHandshake />
            </div>
            <h3 className="kf-value-title">Solidarité</h3>
            <p className="kf-value-description">
              Dans les moments de joie comme dans les moments difficiles, la famille reste un
              soutien indéfectible.
            </p>
          </div>
        </div>
      </section>

      <section className="kf-section kf-ancestors">
        <h2 className="kf-section-title">Nos ancêtres et notre histoire</h2>
        <p className="kf-section-description">
          Nos ancêtres ont posé les fondations de la famille Kalubimba. Leur sagesse, leur courage
          et leurs valeurs continuent d&apos;inspirer les générations actuelles.
        </p>
        <div className="kf-ancestors-grid">
          <div className="kf-ancestor-card">
            <div className="kf-ancestor-photo">
              <img src="/images/ancestors/pere-kalubimba.jpg" alt="Père Kalubimba" />
            </div>
            <h3 className="kf-ancestor-name">Père Kalubimba</h3>
            <p className="kf-ancestor-role">Première génération de la famille</p>
          </div>
          <div className="kf-ancestor-card">
            <div className="kf-ancestor-photo">
              <img
                src="/images/ancestors/jules-mupenda-kalubimba.jpg"
                alt="Jules Mupenda Kalubimba"
              />
            </div>
            <h3 className="kf-ancestor-name">Jules Mupenda Kalubimba</h3>
            <p className="kf-ancestor-role">Fondateur de la lignée familiale</p>
          </div>
          <div className="kf-ancestor-card">
            <div className="kf-ancestor-photo">
              <img src="/images/ancestors/les-parents.jpg" alt="Les Parents" />
            </div>
            <h3 className="kf-ancestor-name">Les Parents</h3>
            <p className="kf-ancestor-role">
              Gardiens des traditions et des valeurs familiales
            </p>
          </div>
        </div>
      </section>

      <section className="kf-section kf-why">
        <h2 className="kf-section-title">Pourquoi l&apos;application Kalubimba Family ?</h2>
        <p className="kf-section-description">
          Dans un monde où les familles sont souvent dispersées dans plusieurs villes et pays, il
          est essentiel de garder un lien fort entre tous les membres.
        </p>
        <div className="kf-features-list">
          <div className="kf-feature-item">
            <div className="kf-feature-icon">
              <FileText />
            </div>
            <span>Consulter les comptes rendus de réunion</span>
          </div>
          <div className="kf-feature-item">
            <div className="kf-feature-icon">
              <CalendarDays />
            </div>
            <span>Partager les événements familiaux</span>
          </div>
          <div className="kf-feature-item">
            <div className="kf-feature-icon">
              <Images />
            </div>
            <span>Conserver l&apos;histoire de la famille</span>
          </div>
          <div className="kf-feature-item">
            <div className="kf-feature-icon">
              <Sparkles />
            </div>
            <span>Transmettre les valeurs aux jeunes générations</span>
          </div>
        </div>
      </section>

      <section className="kf-cta">
        <h2 className="kf-cta-title">Rejoignez la communauté Kalubimba</h2>
        <p className="kf-cta-text">
          Si vous êtes membre de la famille Kalubimba, créez votre compte et rejoignez la
          plateforme pour rester connecté avec toute la famille.
        </p>
        <div className="kf-hero-buttons">
          <Link href="/register" className="kf-btn-hero kf-btn-hero-primary">
            Créer un compte
          </Link>
          <Link href="/login" className="kf-btn-hero kf-btn-hero-secondary">
            Se connecter
          </Link>
        </div>
      </section>

      <footer className="kf-footer">
        <p className="kf-footer-message">
          La famille Kalubimba n&apos;est pas seulement un nom, mais une histoire vivante portée par
          chaque génération. Ensemble, préservons notre héritage et construisons l&apos;avenir de
          notre famille.
        </p>
        <p className="kf-footer-copy">© 2024 Kalubimba Family. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
