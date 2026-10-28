import Link from "next/link";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminUsers } from "@/lib/data";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { AdminUsersTable } from "@/components/AdminUsersTable";

export const metadata = { title: "Corbeille des utilisateurs" };

export default async function AdminTrashPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const rawSearch = params.search;
  const search = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;
  const flash = await readFlash(params);
  const users = await getAdminUsers(search, true);

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <Link href="/admin/users" className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }}>
            <ArrowLeft size={15} /> Utilisateurs actifs
          </Link>
          <h1>Corbeille</h1>
          <p>{users.length} compte{users.length > 1 ? "s" : ""} désactivé{users.length > 1 ? "s" : ""}.</p>
        </div>
        <span className="badge badge-rose"><Trash2 size={13} /> Zone de récupération</span>
      </div>

      <form className="toolbar" action="/admin/users/trash" method="get">
        <div className="row" style={{ flex: 1, maxWidth: 440 }}>
          <div className="topbar-search" style={{ display: "flex", minWidth: 0, flex: 1 }}>
            <Search size={15} color="#94a3b8" />
            <input name="search" defaultValue={search ?? ""} placeholder="Rechercher dans la corbeille..." />
          </div>
          <button type="submit" className="btn btn-primary">Rechercher</button>
        </div>
        {search && (
          <Link href="/admin/users/trash" className="btn btn-ghost btn-sm">Réinitialiser</Link>
        )}
      </form>

      <section className="card">
        <div className="card-body">
          <AdminUsersTable users={users} trashed currentUserId={admin.id} />
        </div>
      </section>
    </>
  );
}
