import {
  getChildrenOf,
  getMember,
  getMembers,
  getSpousesOf,
  type MemberWithAccount,
} from "./data";

export type HouseholdKind = "couple" | "single-parent" | "single";

export type HouseholdPerson = Pick<
  MemberWithAccount,
  | "id"
  | "nom"
  | "prenom"
  | "nom_complet"
  | "genre"
  | "photo"
  | "profession"
  | "lieu"
  | "date_naissance"
  | "date_deces"
  | "utilisateur_id"
  | "user_email"
  | "user_matricule"
>;

export type HouseholdSummary = {
  key: string;
  kind: HouseholdKind;
  primary: HouseholdPerson;
  spouse: HouseholdPerson | null;
  childrenCount: number;
};

export type HouseholdDetail = {
  kind: HouseholdKind;
  head: MemberWithAccount;
  spouse: MemberWithAccount | null;
  children: MemberWithAccount[];
};

export function toHouseholdPerson(member: MemberWithAccount): HouseholdPerson {
  return {
    id: member.id,
    nom: member.nom,
    prenom: member.prenom,
    nom_complet: member.nom_complet,
    genre: member.genre,
    photo: member.photo,
    profession: member.profession,
    lieu: member.lieu,
    date_naissance: member.date_naissance,
    date_deces: member.date_deces,
    utilisateur_id: member.utilisateur_id,
    user_email: member.user_email,
    user_matricule: member.user_matricule,
  };
}

function chooseHead(
  member: MemberWithAccount,
  spouse: MemberWithAccount,
): MemberWithAccount {
  if (member.genre === "male" && spouse.genre !== "male") return member;
  if (spouse.genre === "male" && member.genre !== "male") return spouse;
  return member.id <= spouse.id ? member : spouse;
}

async function getChildrenFor(
  member: MemberWithAccount,
  spouse: MemberWithAccount | null,
) {
  const children = new Map<number, MemberWithAccount>();
  for (const child of await getChildrenOf(member.id)) {
    children.set(child.id, child);
  }
  if (spouse) {
    for (const child of await getChildrenOf(spouse.id)) {
      children.set(child.id, child);
    }
  }
  return [...children.values()].sort((left, right) => {
    if (!left.date_naissance) return 1;
    if (!right.date_naissance) return -1;
    return left.date_naissance.localeCompare(right.date_naissance);
  });
}

export async function getHouseholds(): Promise<HouseholdSummary[]> {
  const members = await getMembers();
  const units: HouseholdSummary[] = [];
  const coupled = new Set<number>();

  for (const member of members) {
    if (coupled.has(member.id)) continue;

    const spouse = (await getSpousesOf(member.id))[0] ?? null;
    if (spouse) {
      coupled.add(member.id);
      coupled.add(spouse.id);
      const children = await getChildrenFor(member, spouse);
      const head = chooseHead(member, spouse);
      const partner = head.id === member.id ? spouse : member;
      units.push({
        key: `${Math.min(member.id, spouse.id)}-${Math.max(member.id, spouse.id)}`,
        kind: "couple",
        primary: toHouseholdPerson(head),
        spouse: toHouseholdPerson(partner),
        childrenCount: children.length,
      });
      continue;
    }

    const children = await getChildrenFor(member, null);
    if (children.length > 0) {
      coupled.add(member.id);
      units.push({
        key: `single-${member.id}`,
        kind: "single-parent",
        primary: toHouseholdPerson(member),
        spouse: null,
        childrenCount: children.length,
      });
      continue;
    }

    if (member.pere_id === null && member.mere_id === null) {
      coupled.add(member.id);
      units.push({
        key: `single-${member.id}`,
        kind: "single",
        primary: toHouseholdPerson(member),
        spouse: null,
        childrenCount: children.length,
      });
      continue;
    }
  }

  const order: Record<HouseholdKind, number> = {
    couple: 0,
    "single-parent": 1,
    single: 2,
  };

  return units.sort((left, right) => {
    const byKind = order[left.kind] - order[right.kind];
    if (byKind !== 0) return byKind;
    const leftName = left.primary.nom_complet || left.primary.nom;
    const rightName = right.primary.nom_complet || right.primary.nom;
    return leftName.localeCompare(rightName, "fr");
  });
}

export async function getHousehold(memberId: number): Promise<HouseholdDetail | null> {
  const head = await getMember(memberId);
  if (!head) return null;

  const spouse = (await getSpousesOf(head.id))[0] ?? null;
  const children = await getChildrenFor(head, spouse);

  return {
    kind: spouse ? "couple" : children.length > 0 ? "single-parent" : "single",
    head,
    spouse,
    children,
  };
}

