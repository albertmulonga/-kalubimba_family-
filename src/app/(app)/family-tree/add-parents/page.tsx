import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMainMember, getMember, getParentsOf } from "@/lib/data";
import { canUpdateMember } from "@/lib/permissions";
import { fullName } from "@/lib/format";
import { Alert } from "@/components/Alert";
import { ParentsForm } from "@/components/ParentsForm";
import { readFlash, withMessage } from "@/lib/flash";

export const metadata = { title: "Ajouter les parents" };

export default async function AddParentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const flash = await readFlash(params);
  const requestedId = Number(Array.isArray(params.member_id) ? params.member_id[0] : params.member_id);
  const target = requestedId ? await getMember(requestedId) : await getMainMember(session.id);

  if (!target) {
    redirect(withMessage("/family-tree", "error", "Aucun membre cible. Créez d'abord un membre."));
  }
  if (!(await canUpdateMember(session, target.id))) {
    redirect(withMessage(`/members/${target.id}`, "error", "Vous n'avez pas la permission de modifier ce membre."));
  }

  const parents = await getParentsOf(target);
  const father = parents.find((parent) => parent.id === target.pere_id) ?? null;
  const mother = parents.find((parent) => parent.id === target.mere_id) ?? null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ajouter les parents</h1>
          <p>
            Complétez les parents de <strong>{fullName(target)}</strong>. Vous pouvez renseigner
            le père, la mère ou les deux.
          </p>
        </div>
        <Link href={`/members/${target.id}`} className="btn btn-ghost">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <ParentsForm target={target} father={father} mother={mother} />
    </>
  );
}
