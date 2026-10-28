import { Eraser, RotateCcw, Trash2 } from "lucide-react";
import type { UserRow } from "@/lib/data";
import { formatDate, fullName } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { ConfirmForm } from "@/components/ConfirmForm";
import { forceDeleteUserAction, restoreUserAction, softDeleteUserAction } from "@/lib/actions/admin";

type AdminUser = UserRow & { member_photo: string | null; member_count: number };

export function AdminUsersTable({
  users,
  trashed,
  currentUserId,
}: {
  users: AdminUser[];
  trashed: boolean;
  currentUserId: number;
}) {
  if (users.length === 0) {
    return <p className="muted small">Aucun utilisateur dans cette liste.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Matricule</th>
            <th>Email</th>
            <th>Fiches</th>
            <th>Inscription</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="row" style={{ gap: 10 }}>
                  <Avatar
                    nom={user.nom}
                    prenom={user.prenom}
                    photo={user.member_photo ?? user.photo}
                    size="sm"
                  />
                  <div>
                    <strong>{fullName(user)}</strong>
                    {user.id === currentUserId && <span className="badge badge-blue">Moi</span>}
                  </div>
                </div>
              </td>
              <td>
                <code className="tiny">{user.matricule || "—"}</code>
              </td>
              <td className="small">{user.email || "—"}</td>
              <td>{user.member_count}</td>
              <td className="small">{formatDate(user.date_creation ?? user.created_at)}</td>
              <td>
                <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                  {trashed ? (
                    <>
                      <ConfirmForm
                        action={restoreUserAction.bind(null, user.id)}
                        message={`Restaurer le compte de ${fullName(user)} ?`}
                      >
                        <button type="submit" className="btn btn-ghost btn-sm">
                          <RotateCcw size={14} /> Restaurer
                        </button>
                      </ConfirmForm>
                      <ConfirmForm
                        action={forceDeleteUserAction.bind(null, user.id)}
                        message={`Supprimer définitivement le compte de ${fullName(user)} ? Cette action est irréversible.`}
                      >
                        <button type="submit" className="btn btn-danger-soft btn-sm">
                          <Eraser size={14} /> Effacer
                        </button>
                      </ConfirmForm>
                    </>
                  ) : (
                    <ConfirmForm
                      action={softDeleteUserAction.bind(null, user.id)}
                      message={`Désactiver le compte de ${fullName(user)} ? Il pourra être restauré depuis la corbeille.`}
                    >
                      <button
                        type="submit"
                        className="btn btn-danger-soft btn-sm"
                        disabled={user.id === currentUserId}
                      >
                        <Trash2 size={14} /> Désactiver
                      </button>
                    </ConfirmForm>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
