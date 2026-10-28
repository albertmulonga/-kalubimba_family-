import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./legacy.css";
import { InstallApp } from "@/components/InstallApp";

export const metadata: Metadata = {
  title: {
    default: "Kalubimba Family",
    template: "%s · Kalubimba Family",
  },
  description:
    "La plateforme numérique de la famille Kalubimba : arbre généalogique, membres, photos, vidéos, histoires et comptes rendus.",
  applicationName: "Kalubimba Family",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Kalubimba Family",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/images/logo.png", sizes: "512x512", type: "image/png" }],
    apple: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <InstallApp />
        {children}
      </body>
    </html>
  );
}
