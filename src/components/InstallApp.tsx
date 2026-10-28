"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Monitor,
  Share2,
  Smartphone,
  X,
} from "lucide-react";

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/win|mac|linux/.test(ua)) return "desktop";
  return "unknown";
}

// BeforeInstallPromptEvent (Chrome/Edge)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallApp() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());

    // Déjà installée ?
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Enregistrer le Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Écouter l'événement d'installation Chrome/Edge
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Déjà installée → ne rien afficher
  if (installed || dismissed) return null;

  // Bouton Chrome/Edge desktop & Android avec prompt natif
  async function handleInstallChrome() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setShowGuide(true);
    }
  }

  return (
    <>
      {/* Bandeau d'installation */}
      <div className="install-banner">
        <div className="install-banner-icon">
          {platform === "ios" ? <Smartphone size={22} /> :
           platform === "desktop" ? <Monitor size={22} /> :
           <Smartphone size={22} />}
        </div>
        <div className="install-banner-text">
          <strong>Installer l&apos;application</strong>
          <span>Accédez à Kalubimba Family comme une vraie app — gratuit, sans Play Store.</span>
        </div>
        <div className="install-banner-actions">
          {/* Bouton principal */}
          {platform === "ios" ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowGuide(true)}
            >
              <Download size={14} /> Installer
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleInstallChrome}
            >
              <Download size={14} /> Installer
            </button>
          )}
          {/* Fermer */}
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Guide modal iOS / manuel */}
      {showGuide && (
        <div
          className="install-modal-backdrop"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="install-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="install-modal-head">
              <h2>Installer Kalubimba Family</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowGuide(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="install-modal-body">
              {platform === "ios" && (
                <>
                  <div className="install-step">
                    <span className="install-step-num">1</span>
                    <div>
                      <strong>Ouvrez Safari</strong>
                      <p>L&apos;installation ne fonctionne qu&apos;avec le navigateur Safari sur iPhone/iPad.</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <span className="install-step-num">2</span>
                    <div>
                      <strong>Appuyez sur l&apos;icône Partager</strong>
                      <p>Le carré avec une flèche vers le haut, en bas de l&apos;écran.</p>
                      <Share2 size={28} color="#2563eb" style={{ margin: "8px 0" }} />
                    </div>
                  </div>
                  <div className="install-step">
                    <span className="install-step-num">3</span>
                    <div>
                      <strong>Appuyez sur &quot;Sur l&apos;écran d&apos;accueil&quot;</strong>
                      <p>Faites défiler les options vers le bas et appuyez sur cette option.</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <span className="install-step-num">4</span>
                    <div>
                      <strong>Appuyez sur &quot;Ajouter&quot;</strong>
                      <p>L&apos;icône Kalubimba Family apparaîtra sur votre écran d&apos;accueil ✅</p>
                    </div>
                  </div>
                </>
              )}

              {platform === "android" && (
                <>
                  <div className="install-step">
                    <span className="install-step-num">1</span>
                    <div>
                      <strong>Ouvrez Chrome</strong>
                      <p>Assurez-vous d&apos;utiliser Google Chrome sur Android.</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <span className="install-step-num">2</span>
                    <div>
                      <strong>Appuyez sur les 3 points ⋮</strong>
                      <p>En haut à droite du navigateur.</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <span className="install-step-num">3</span>
                    <div>
                      <strong>Appuyez sur &quot;Ajouter à l&apos;écran d&apos;accueil&quot;</strong>
                      <p>Confirmez en appuyant sur &quot;Ajouter&quot; ✅</p>
                    </div>
                  </div>
                </>
              )}

              {platform === "desktop" && (
                <>
                  <div className="install-step">
                    <span className="install-step-num">1</span>
                    <div>
                      <strong>Ouvrez Chrome ou Edge</strong>
                      <p>L&apos;installation fonctionne avec Google Chrome et Microsoft Edge.</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <span className="install-step-num">2</span>
                    <div>
                      <strong>Cliquez sur l&apos;icône ⊕ dans la barre d&apos;adresse</strong>
                      <p>À droite de la barre d&apos;adresse, une icône d&apos;installation apparaît.</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <span className="install-step-num">3</span>
                    <div>
                      <strong>Cliquez sur &quot;Installer&quot;</strong>
                      <p>L&apos;application s&apos;ouvre comme un programme indépendant ✅</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="install-modal-foot">
              <p className="small muted">
                L&apos;installation est <strong>100% gratuite</strong>. Aucun Play Store requis.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowGuide(false)}
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
