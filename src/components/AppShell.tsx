"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  FileText,
  Heart,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Smartphone,
  Star,
  TreePine,
  Users,
  Video,
  X,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { ProfilePhoto } from "./ProfilePhoto";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  color: string;      // classe CSS data-color
  iconBg: string;     // background de l'icône dans le sidebar
};

const navigation: NavItem[] = [
  { href: "/dashboard",   label: "Tableau de bord",    icon: LayoutDashboard, color: "blue",   iconBg: "#1e3a5f" },
  { href: "/family-tree", label: "Arbre généalogique", icon: TreePine,         color: "green",  iconBg: "#14362a" },
  { href: "/members",     label: "Membres",            icon: Users,            color: "cyan",   iconBg: "#0c2f38" },
  { href: "/photos",      label: "Photos",             icon: Images,           color: "amber",  iconBg: "#3b2a0a" },
  { href: "/videos",      label: "Vidéos",             icon: Video,            color: "rose",   iconBg: "#3a0f1f" },
  { href: "/reunions",    label: "Comptes rendus",      icon: FileText,         color: "violet", iconBg: "#28174a" },
  { href: "/history",     label: "Histoire",           icon: BookOpen,         color: "orange", iconBg: "#3a1e08" },
  { href: "/memorial",    label: "Mémorial",           icon: Heart,            color: "rose",   iconBg: "#3a0f1f" },
  { href: "/ancestors",   label: "Ancêtres",           icon: Star,             color: "amber",  iconBg: "#3b2a0a" },
  { href: "/mobile",      label: "Version mobile",     icon: Smartphone,       color: "cyan",   iconBg: "#0c2f38" },
  { href: "/settings",    label: "Paramètres",         icon: Settings,         color: "blue",   iconBg: "#1e3a5f" },
];

const titles: Record<string, string> = {
  "/dashboard":         "Tableau de bord",
  "/family-tree":       "Arbre généalogique",
  "/members":           "Membres de la famille",
  "/photos":            "Photos de famille",
  "/videos":            "Vidéos de famille",
  "/reunions":          "Comptes rendus de réunion",
  "/history":           "Histoire de la famille",
  "/memorial":          "Mémorial",
  "/ancestors":         "Ancêtres",
  "/settings":          "Paramètres",
  "/profile":           "Mon profil",
  "/mobile":            "Version mobile",
  "/admin/users":       "Gestion des utilisateurs",
  "/admin/users/trash": "Corbeille des utilisateurs",
};

function titleFor(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/members/"))    return "Fiche du membre";
  if (pathname.startsWith("/family-tree/")) return "Compléter l'arbre";
  if (pathname.startsWith("/history"))     return "Histoire de la famille";
  if (pathname.startsWith("/admin/users/trash")) return "Corbeille";
  return "Kalubimba Family";
}

/* Couleurs d'icônes pour les liens actifs */
const activeIconColor: Record<string, string> = {
  blue:   "#60a5fa",
  green:  "#34d399",
  amber:  "#fbbf24",
  rose:   "#fb7185",
  violet: "#a78bfa",
  cyan:   "#22d3ee",
  orange: "#fb923c",
};

export function AppShell({
  user,
  photo,
  children,
}: {
  user: SessionUser;
  photo: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const displayName = `${user.prenom} ${user.nom}`.trim();

  return (
    <div className="app-shell">
      {/* ── SIDEBAR DARK ── */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="logo">
            <img src="/images/logo.png" alt="Kalubimba Family" />
          </span>
          <div>
            <strong>Kalubimba Family</strong>
            <span>Espace familial</span>
          </div>
        </div>

        {/* Utilisateur connecté */}
        <div className="sidebar-user">
          <ProfilePhoto
            nom={user.nom}
            prenom={user.prenom}
            photo={photo}
            size="md"
            shape="square"
            className="sidebar-user-photo"
          />
          <div style={{ minWidth: 0 }}>
            <Link href="/profile" className="sidebar-user-name" onClick={() => setOpen(false)}>
              {displayName}
            </Link>
            <span>{user.isAdmin ? "Administrateur" : "Membre"}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav">
          <div className="nav-title">Menu principal</div>
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const color = active ? activeIconColor[item.color] : "#5d7a99";
            return (
              <Link
                key={item.href}
                href={item.href}
                data-color={item.color}
                className={`nav-link ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
                style={active ? {} : undefined}
              >
                <span
                  className="nav-icon-badge"
                  style={{ background: active ? item.iconBg : "transparent" }}
                >
                  <item.icon style={{ width: 16, height: 16, color }} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {user.isAdmin && (
            <>
              <div className="nav-title" style={{ marginTop: 12 }}>
                Administration
              </div>
              <Link
                href="/admin/users"
                data-color="rose"
                className={`nav-link ${pathname.startsWith("/admin/users") ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span
                  className="nav-icon-badge"
                  style={{
                    background: pathname.startsWith("/admin/users") ? "#3a0f1f" : "transparent",
                  }}
                >
                  <Shield
                    style={{
                      width: 16,
                      height: 16,
                      color: pathname.startsWith("/admin/users") ? "#fb7185" : "#5d7a99",
                    }}
                  />
                </span>
                <span>Utilisateurs</span>
              </Link>
            </>
          )}
        </nav>

        {/* Déconnexion */}
        <div className="sidebar-foot">
          <form action={logoutAction}>
            <button
              type="submit"
              className="nav-link"
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "#5d7a99",
              }}
            >
              <span className="nav-icon-badge">
                <LogOut style={{ width: 16, height: 16, color: "#ef4444" }} />
              </span>
              <span style={{ color: "#c8d6e5" }}>Déconnexion</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* ── MAIN ── */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Ouvrir le menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1>{titleFor(pathname)}</h1>
          </div>

          <div className="row" style={{ gap: 14 }}>
            <form className="topbar-search" action="/members" method="get">
              <Search size={14} color="#94a3b8" />
              <input
                name="search"
                placeholder="Rechercher un membre..."
                aria-label="Rechercher un membre"
              />
            </form>
            <div className="row" style={{ gap: 9 }}>
              <ProfilePhoto
                nom={user.nom}
                prenom={user.prenom}
                photo={photo}
                size="sm"
                shape="square"
              />
              <Link href="/profile" className="user-meta">
                <strong style={{ display: "block", fontSize: "0.82rem" }}>{displayName}</strong>
                <span className="tiny muted">{user.isAdmin ? "Administrateur" : "Membre"}</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="page">{children}</div>
      </div>
    </div>
  );
}
