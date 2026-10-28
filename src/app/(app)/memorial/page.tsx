import Link from "next/link";
import { Flower2, Plus } from "lucide-react";
import { getDeceasedMembers } from "@/lib/data";
import { formatDate, fullName } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { Avatar } from "@/components/Avatar";

export const metadata = { title: "Mémorial" };

export default async function MemorialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await readFlash(searchParams);
  const members = await getDeceasedMembers();

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <h1>Mémorial</h1>
          <p>En souvenir des membres de la famille disparus.</p>
        </div>
        <Link href="/family-tree/add-deceased" className="btn btn-primary">
          <Plus size={16} /> Ajouter un proche
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">
            <Flower2 />
          </div>
          <h3>Aucun souvenir enregistré</h3>
          <p>Ajoutez un proche disparu pour honorer sa mémoire.</p>
        </div>
      ) : (
        <div className="memory-grid">
          {members.map((member) => (
            <Link key={member.id} href={`/members/${member.id}`} className="memory-card">
              <Avatar
                nom={member.nom}
                prenom={member.prenom}
                nomComplet={member.nom_complet}
                photo={member.photo}
                size="xl"
              />
              <h3>{fullName(member)}</h3>
              <p className="small muted">
                {formatDate(member.date_naissance)} — {formatDate(member.date_deces)}
              </p>
              {member.biographie && <p className="small memory-text">{member.biographie}</p>}
              <span className="badge badge-violet">En mémoire</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
