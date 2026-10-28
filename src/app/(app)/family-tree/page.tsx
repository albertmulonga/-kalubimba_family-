import Link from "next/link";
import { Download, Plus, TreePine, UserPlus, Users } from "lucide-react";
import { requireSession } from "@/lib/auth";
import {
  getChildrenOf,
  getMainMember,
  getMemberPlainPassword,
  getParentsOf,
  getSpousesOf,
} from "@/lib/data";
import { canViewCredentials } from "@/lib/permissions";
import { fullName } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { FamilyCore } from "@/components/FamilyCore";

export const metadata = { title: "Arbre généalogique" };

export default async function FamilyTreePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const mainMember = await getMainMember(session.id);

  if (!mainMember) {
    return (
      <>
        <Alert success={flash.success} error={flash.error} info={flash.info} />
        <div className="page-head">
          <div>
            <h1>Mon arbre généalogique</h1>
            <p>Votre foyer et vos liens familiaux directs.</p>
          </div>
        </div>
        <div className="card empty-state">
          <div className="icon">
            <TreePine />
          </div>
          <h3>Votre arbre est encore vide</h3>
          <p>Créez votre profil familial pour commencer votre arbre.</p>
          <Link href="/family-tree/add-parents" className="btn btn-primary">
            Créer mon profil familial
          </Link>
        </div>
      </>
    );
  }

  const [parents, spouses, children] = await Promise.all([
    getParentsOf(mainMember),
    getSpousesOf(mainMember.id),
    getChildrenOf(mainMember.id),
  ]);

  const spouse = spouses[0] ?? null;
  const canEdit = session.isAdmin || mainMember.utilisateur_id === session.id;

  const [mainShowCredentials, spouseShowCredentials, childEntries] = await Promise.all([
    canViewCredentials(session, mainMember),
    spouse ? canViewCredentials(session, spouse) : Promise.resolve(false),
    Promise.all(
      children.map(async (child) => {
        const [childSpouses, showCredentials] = await Promise.all([
          getSpousesOf(child.id),
          canViewCredentials(session, child),
        ]);
        const childSpouse = childSpouses[0] ?? null;
        const spouseShowCredentials = childSpouse
          ? await canViewCredentials(session, childSpouse)
          : false;
        const [password, spousePassword] = await Promise.all([
          showCredentials ? getMemberPlainPassword(child.id) : Promise.resolve(null),
          spouseShowCredentials && childSpouse
            ? getMemberPlainPassword(childSpouse.id)
            : Promise.resolve(null),
        ]);
        return {
          member: child,
          spouse: childSpouse,
          showCredentials,
          spouseShowCredentials,
          password,
          spousePassword,
        };
      }),
    ),
  ]);

  const [mainPassword, spousePassword] = await Promise.all([
    mainShowCredentials ? getMemberPlainPassword(mainMember.id) : Promise.resolve(null),
    spouseShowCredentials && spouse
      ? getMemberPlainPassword(spouse.id)
      : Promise.resolve(null),
  ]);

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <div className="page-head">
        <div>
          <span className="welcome-eyebrow tree-page-eyebrow">
            <TreePine size={13} /> Mon arbre familial
          </span>
          <h1>Mon arbre généalogique</h1>
          <p>
            {fullName(mainMember)} · {parents.length} parent
            {parents.length > 1 ? "s" : ""} · {spouses.length} conjoint
            {spouses.length > 1 ? "s" : ""} · {children.length} enfant
            {children.length > 1 ? "s" : ""}.
          </p>
        </div>
        <div className="head-actions">
          <Link href={`/members/${mainMember.id}`} className="btn btn-ghost">
            <Users size={16} /> Mon profil
          </Link>
          <Link href="/family-tree/export/pdf" className="btn btn-ghost">
            <Download size={16} /> Export PDF
          </Link>
          {canEdit && (
            <Link
              href={`/family-tree/add-children?member_id=${mainMember.id}`}
              className="btn btn-primary"
            >
              <UserPlus size={16} /> Ajouter un enfant
            </Link>
          )}
        </div>
      </div>

      <div className="tree-guide no-print">
        <div>
          <span>1</span>
          <strong>Mes parents</strong>
          <small>La génération qui vous précède.</small>
        </div>
        <div>
          <span>2</span>
          <strong>Mon couple</strong>
          <small>Le foyer responsable et ses identifiants.</small>
        </div>
        <div>
          <span>3</span>
          <strong>Mes enfants</strong>
          <small>Leurs comptes sont créés automatiquement.</small>
        </div>
        {canEdit && (
          <Link
            href={`/family-tree/add-parents?member_id=${mainMember.id}`}
            className="btn btn-ghost btn-sm"
          >
            <Plus size={14} /> Compléter l&apos;arbre
          </Link>
        )}
      </div>

      <FamilyCore
        mainMember={mainMember}
        parents={parents}
        spouse={spouse}
        mainShowCredentials={mainShowCredentials}
        spouseShowCredentials={spouseShowCredentials}
        mainPassword={mainPassword}
        spousePassword={spousePassword}
        children={childEntries}
        canEdit={canEdit}
      />
    </>
  );
}
