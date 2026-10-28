import Link from "next/link";
import { Heart, TreePine, UserPlus, UserRound, Users } from "lucide-react";
import { getHouseholds } from "@/lib/households";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { MembersDirectory } from "@/components/MembersDirectory";

export const metadata = { title: "Membres" };

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const flash = await readFlash(params);
  const units = await getHouseholds();

  const couples = units.filter((unit) => unit.kind === "couple").length;
  const singleParents = units.filter((unit) => unit.kind === "single-parent").length;
  const singles = units.filter((unit) => unit.kind === "single").length;

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />
      <div className="page-head">
        <div>
          <h1>Les foyers de la famille</h1>
          <p>
            {units.length} foyer{units.length > 1 ? "s" : ""} familial
            {units.length > 1 ? "aux" : ""} · les couples sont réunis sur une seule carte.
          </p>
          <div className="directory-summary">
            <span>
              <Heart size={13} /> {couples} couple{couples > 1 ? "s" : ""}
            </span>
            <span>
              <Users size={13} /> {singleParents} responsable
              {singleParents > 1 ? "s" : ""} sans couple
            </span>
            <span>
              <UserRound size={13} /> {singles} célibataire{singles > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="head-actions">
          <Link href="/family-tree" className="btn btn-ghost">
            <TreePine size={16} /> Arbre généalogique
          </Link>
          <Link href="/members/new" className="btn btn-primary">
            <UserPlus size={16} /> Ajouter un membre
          </Link>
        </div>
      </div>

      <MembersDirectory units={units} />
    </>
  );
}
