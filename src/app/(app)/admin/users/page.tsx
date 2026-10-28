import Link from "next/link";
import { Search, Shield, Trash2, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminUsers } from "@/lib/data";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { AdminUsersTable } from "@/components/AdminUsersTable";

export const metadata = { title: "Gestion des utilisateurs" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const rawSearch = params.search;
  const search = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;
  const flash = await readFlash(params);
  const users = await getAdminUsers(search);
  const admins = users.filter((user) => user.email?.toLowerCase() === (process.env.ADMIN_EMAIL ?? "adminkalubimba@gmail.com").toLowerCase()).length;

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>{users.length} compte{users.length > 1 ? "s" : ""} actif{users.length > 1 ? "s" : ""} · {admins} administrateur{admins > 1 ? "s" : ""}.</p>
        </div>
        <div className="head-actions">
          <Link href="/admin/users/trash" className="btn btn-ghost">
            <Trash2 size={16} /> Corbeille
          </Link>
        </div>
      </div>

      <section className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <span className="stat-icon blue"><Users size={18} /></span>
          <div>
            <span>Comptes actifs</span>
            <strong>{users.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon violet"><Shield size={18} /></span>
          <div>
            <span>Administrateurs</span>
            <strong>{admins}</strong>
          </div>
        </div>
      </section>

      <form className="toolbar" action="/admin/users" method="get">
        <div className="row" style={{ flex: 1, maxWidth: 440 }}>
          <div className="topbar-search" style={{ display: "flex", minWidth: 0, flex: 1 }}>
            <Search size={15} color="#94a3b8" />
            <input name="search" defaultValue={search ?? ""} placeholder="Nom, email, matricule..." />
          </div>
          <button type="submit" className="btn btn-primary">Rechercher</button>
        </div>
        {search && (
          <Link href="/admin/users" className="btn btn-ghost btn-sm">Réinitialiser</Link>
        )}
      </form>

      <section className="card">
        <div className="card-body">
          <AdminUsersTable users={users} trashed={false} currentUserId={admin.id} />
        </div>
      </section>
    </>
  );
}
