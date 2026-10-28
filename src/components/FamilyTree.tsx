import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar } from "./Avatar";
import { age, fullName } from "@/lib/format";
import type { CoupleRow, MemberRow } from "@/lib/data";

type Relationship = { parent_id: number; child_id: number };

function buildLevels(members: MemberRow[], relationships: Relationship[]) {
  const byId = new Map(members.map((member) => [member.id, member]));
  const parentsByChild = new Map<number, Set<number>>();

  const addParent = (childId: number, parentId: number | null) => {
    if (!parentId || !byId.has(parentId) || childId === parentId) return;
    const set = parentsByChild.get(childId) ?? new Set<number>();
    set.add(parentId);
    parentsByChild.set(childId, set);
  };

  for (const member of members) {
    addParent(member.id, member.pere_id);
    addParent(member.id, member.mere_id);
  }
  for (const link of relationships) {
    addParent(link.child_id, link.parent_id);
  }

  const levels = new Map<number, number>();

  const compute = (id: number, stack: Set<number>): number => {
    if (levels.has(id)) return levels.get(id) as number;
    if (stack.has(id)) return 0;
    const parents = parentsByChild.get(id);
    if (!parents || parents.size === 0) {
      levels.set(id, 0);
      return 0;
    }
    const nextStack = new Set(stack);
    nextStack.add(id);
    const level = 1 + Math.max(...[...parents].map((parent) => compute(parent, nextStack)));
    levels.set(id, level);
    return level;
  };

  for (const member of members) compute(member.id, new Set());

  const groups = new Map<number, MemberRow[]>();
  for (const member of members) {
    const level = levels.get(member.id) ?? 0;
    const list = groups.get(level) ?? [];
    list.push(member);
    groups.set(level, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([level, list]) => ({
      level,
      members: list.sort((a, b) => {
        const dateA = a.date_naissance ?? "9999-12-31";
        const dateB = b.date_naissance ?? "9999-12-31";
        return dateA.localeCompare(dateB) || a.id - b.id;
      }),
    }));
}

export function FamilyTree({
  members,
  couples,
  relationships,
  canEdit = false,
}: {
  members: MemberRow[];
  couples: CoupleRow[];
  relationships: Relationship[];
  canEdit?: boolean;
}) {
  const byId = new Map(members.map((member) => [member.id, member]));
  const spouseOf = new Map<number, number>();
  for (const couple of couples) {
    spouseOf.set(couple.member1_id, couple.member2_id);
    spouseOf.set(couple.member2_id, couple.member1_id);
  }
  for (const member of members) {
    if (member.conjoint_id) {
      spouseOf.set(member.id, member.conjoint_id);
      spouseOf.set(member.conjoint_id, member.id);
    }
  }

  const groups = buildLevels(members, relationships);

  return (
    <div className="tree-canvas">
      {groups.map((group) => (
        <section key={group.level}>
          <div className="generation-label">Génération {group.level + 1}</div>
          <div className="grid-3">
            {group.members.map((member) => {
              const spouse = byId.get(spouseOf.get(member.id) ?? -1);
              const years = age(member.date_naissance, member.date_deces);
              return (
                <div key={member.id} className="family-unit">
                  <Link href={`/members/${member.id}`} className="person-chip">
                    <Avatar
                      nom={member.nom}
                      prenom={member.prenom}
                      nomComplet={member.nom_complet}
                      photo={member.photo}
                    />
                    <div>
                      <strong>{fullName(member)}</strong>
                      <span>
                        {member.profession || (years !== null ? `${years} ans` : "Membre")}
                      </span>
                    </div>
                  </Link>
                  {spouse && member.id < spouse.id && (
                    <>
                      <div className="row" style={{ margin: "10px 0 4px" }}>
                        <Heart size={14} className="heart" />
                        <span className="tiny muted">Union avec</span>
                      </div>
                      <Link href={`/members/${spouse.id}`} className="person-chip">
                        <Avatar
                          nom={spouse.nom}
                          prenom={spouse.prenom}
                          nomComplet={spouse.nom_complet}
                          photo={spouse.photo}
                        />
                        <div>
                          <strong>{fullName(spouse)}</strong>
                          <span>{spouse.profession || "Conjoint(e)"}</span>
                        </div>
                      </Link>
                    </>
                  )}
                  {canEdit && (
                    <div className="row wrap" style={{ marginTop: 12, gap: 6 }}>
                      <Link
                        href={`/family-tree/add-children?member_id=${member.id}`}
                        className="btn btn-soft btn-sm"
                      >
                        Enfant
                      </Link>
                      <Link
                        href={`/family-tree/add-spouse?member_id=${member.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Conjoint
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
