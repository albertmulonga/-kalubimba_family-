import { getSession } from "@/lib/auth";
import { AutoRedirect } from "@/components/AutoRedirect";

export const metadata = { title: "Chargement" };

export default async function LoaderPage() {
  const session = await getSession();

  return (
    <main className="kf-loader-page">
      <AutoRedirect href={session ? "/dashboard" : "/splash"} delay={2200} />
      <div className="kf-loader-inner">
        <div className="kf-loader-logo">
          <div className="kf-loader-ring" />
          <img src="/images/logo.png" alt="Kalubimba Family" />
        </div>
        <h1 className="kf-loader-title">Kalubimba Family</h1>
        <p className="kf-loader-subtitle">Chargement en cours...</p>
        <div className="kf-loader-bar">
          <div className="kf-loader-fill" />
        </div>
      </div>
    </main>
  );
}
