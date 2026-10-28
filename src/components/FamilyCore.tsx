import Link from "next/link";
import {
  Baby,
  Heart,
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { age, fullName } from "@/lib/format";
import type { MemberRow, MemberWithAccount } from "@/lib/data";
import { ProfilePhoto } from "./ProfilePhoto";
import { ConfirmForm } from "./ConfirmForm";
import {
  removeChildLinkAction,
  removeParentLinkAction,
} from "@/lib/actions/family";

export type TreeChild = {
  member: MemberWithAccount;
  spouse: MemberWithAccount | null;
  showCredentials: boolean;
  spouseShowCredentials: boolean;
  password: string | null;
  spousePassword: string | null;
};

type FamilyCoreProps = {
  mainMember: MemberWithAccount;
  parents: MemberRow[];
  spouse: MemberWithAccount | null;
  mainShowCredentials: boolean;
  spouseShowCredentials: boolean;
  mainPassword: string | null;
  spousePassword: string | null;
  children: TreeChild[];
  canEdit: boolean;
};

function roleFor(genre: string | null | undefined, fallback: string) {
  if (genre === "male") return "Homme";
  if (genre === "female") return "Femme";
  return fallback;
}

function parentRole(genre: string | null | undefined) {
  if (genre === "male") return "Père";
  if (genre === "female") return "Mère";
  return "Parent";
}

function childRole(genre: string | null | undefined) {
  if (genre === "male") return "Fils";
  if (genre === "female") return "Fille";
  return "Enfant";
}

function spouseRole(genre: string | null | undefined) {
  if (genre === "male") return "Époux";
  if (genre === "female") return "Épouse";
  return "Conjoint(e)";
}

function Credentials({
  person,
  password,
}: {
  person: MemberWithAccount;
  password: string | null;
}) {
  return (
    <div className="tree-credentials">
      <div className="tree-credentials-title">
        <KeyRound size={13} />
        <span>Identifiants</span>
        <ShieldCheck size={13} />
      </div>
      <div className="tree-credential-row">
        <span>Matricule</span>
        <code>{person.user_matricule || "Non attribué"}</code>
      </div>
      <div className="tree-credential-row">
        <span>Email</span>
        <code>{person.user_email || "Aucun"}</code>
      </div>
      <div className="tree-credential-row">
        <span>Mot de passe</span>
        <code>{password || "••••••••"}</code>
      </div>
    </div>
  );
}

function PersonCard({
  person,
  role,
  showCredentials,
  password,
  highlight,
}: {
  person: MemberWithAccount;
  role: string;
  showCredentials: boolean;
  password: string | null;
  highlight?: boolean;
}) {
  const years = age(person.date_naissance, person.date_deces);
  return (
    <div className={`tree-person-card ${highlight ? "is-highlight" : ""}`}>
      <ProfilePhoto
        nom={person.nom}
        prenom={person.prenom}
        nomComplet={person.nom_complet}
        photo={person.photo}
        size="xl"
      />
      <div className="tree-person-copy">
        <span className="tree-role">{role}</span>
        <Link href={`/members/${person.id}`} className="tree-person-name">
          {fullName(person)}
        </Link>
        <span className="tree-person-meta">
          {person.profession || roleFor(person.genre, "Membre")}
          {years !== null ? ` · ${years} ans` : ""}
        </span>
        {person.lieu && <span className="tree-person-place">{person.lieu}</span>}
      </div>
      {showCredentials && <Credentials person={person} password={password} />}
    </div>
  );
}

function ParentCard({
  parent,
  memberId,
  canEdit,
}: {
  parent: MemberRow;
  memberId: number;
  canEdit: boolean;
}) {
  const years = age(parent.date_naissance, parent.date_deces);
  return (
    <div className="tree-parent-card">
      <ProfilePhoto
        nom={parent.nom}
        prenom={parent.prenom}
        nomComplet={parent.nom_complet}
        photo={parent.photo}
        size="lg"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="tree-role">{parentRole(parent.genre)}</span>
        <Link href={`/members/${parent.id}`} className="tree-person-name">
          {fullName(parent)}
        </Link>
        <span className="tree-person-meta">
          {parent.profession || "Membre de la famille"}
          {years !== null ? ` · ${years} ans` : ""}
        </span>
      </div>
      {canEdit && (
        <ConfirmForm
          action={removeParentLinkAction.bind(null, memberId, parent.id)}
          message={`Retirer ${fullName(parent)} comme parent ?`}
        >
          <button
            type="submit"
            className="icon-btn danger"
            title="Retirer ce parent"
            style={{ flexShrink: 0 }}
          >
            <Trash2 size={14} />
          </button>
        </ConfirmForm>
      )}
    </div>
  );
}

export function FamilyCore({
  mainMember,
  parents,
  spouse,
  mainShowCredentials,
  spouseShowCredentials,
  mainPassword,
  spousePassword,
  children,
  canEdit,
}: FamilyCoreProps) {
  return (
    <div className="family-tree-grid">
      {/* ── PARENTS ── */}
      <section className="tree-panel tree-panel-parents">
        <div className="tree-panel-head">
          <div>
            <span className="tree-panel-eyebrow">Génération au-dessus</span>
            <h2>Mes parents</h2>
          </div>
          <Users size={19} />
        </div>

        {parents.length > 0 ? (
          <div className="tree-parent-list">
            {parents.map((parent) => (
              <ParentCard
                key={parent.id}
                parent={parent}
                memberId={mainMember.id}
                canEdit={canEdit}
              />
            ))}
          </div>
        ) : (
          <div className="tree-empty">
            <Users size={28} />
            <strong>Parents non renseignés</strong>
            <span>Ajoutez votre père et votre mère pour compléter l&apos;arbre.</span>
          </div>
        )}

        {canEdit && (
          <Link
            href={`/family-tree/add-parents?member_id=${mainMember.id}`}
            className="btn btn-ghost btn-sm tree-panel-action"
          >
            <Plus size={14} /> Compléter mes parents
          </Link>
        )}
      </section>

      {/* ── COUPLE ── */}
      <section className="tree-panel tree-panel-couple">
        <div className="tree-panel-head">
          <div>
            <span className="tree-panel-eyebrow">Foyer responsable</span>
            <h2>Mon couple</h2>
          </div>
          <Heart size={19} />
        </div>

        <div className="tree-couple">
          <PersonCard
            person={mainMember}
            role="Vous · responsable"
            showCredentials={mainShowCredentials}
            password={mainPassword}
            highlight
          />

          <div className="tree-couple-link">
            <Heart size={18} />
            <span>Union</span>
          </div>

          {spouse ? (
            <PersonCard
              person={spouse}
              role={spouseRole(spouse.genre)}
              showCredentials={spouseShowCredentials}
              password={spousePassword}
            />
          ) : (
            <div className="tree-spouse-empty">
              <Heart size={26} />
              <strong>Conjoint(e) non renseigné(e)</strong>
              <span>Ajoutez votre époux ou épouse pour former le couple responsable.</span>
            </div>
          )}
        </div>

        <div className="tree-panel-actions">
          {canEdit && (
            <>
              <Link
                href={`/members/${mainMember.id}/edit`}
                className="btn btn-ghost btn-sm"
              >
                <Pencil size={14} /> Mon profil
              </Link>
              <Link
                href={`/family-tree/add-spouse?member_id=${mainMember.id}`}
                className="btn btn-soft btn-sm"
              >
                <Heart size={14} /> {spouse ? "Modifier le conjoint" : "Ajouter le conjoint"}
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── ENFANTS ── */}
      <section className="tree-panel tree-panel-children">
        <div className="tree-panel-head">
          <div>
            <span className="tree-panel-eyebrow">Génération suivante</span>
            <h2>Mes enfants</h2>
          </div>
          <Baby size={19} />
        </div>

        {children.length > 0 ? (
          <div className="tree-child-list">
            {children.map((entry) => (
              <div key={entry.member.id} className="tree-child-card">
                <div className="tree-child-main">
                  <PersonCard
                    person={entry.member}
                    role={childRole(entry.member.genre)}
                    showCredentials={entry.showCredentials}
                    password={entry.password}
                  />
                </div>

                {entry.spouse && (
                  <div className="tree-child-spouse">
                    <span className="tree-couple-mini">
                      <Heart size={12} /> Conjoint(e)
                    </span>
                    <PersonCard
                      person={entry.spouse}
                      role={spouseRole(entry.spouse.genre)}
                      showCredentials={entry.spouseShowCredentials}
                      password={entry.spousePassword}
                    />
                  </div>
                )}

                <div className="tree-child-actions">
                  <Link href={`/members/${entry.member.id}`} className="btn btn-ghost btn-sm">
                    Voir le profil
                  </Link>
                  {entry.showCredentials && (
                    <span className="tree-private-note">
                      <ShieldCheck size={13} /> Identifiants visibles
                    </span>
                  )}
                  {canEdit && (
                    <ConfirmForm
                      action={removeChildLinkAction.bind(
                        null,
                        entry.member.id,
                        mainMember.id,
                      )}
                      message={`Retirer ${fullName(entry.member)} de vos enfants ?`}
                    >
                      <button
                        type="submit"
                        className="btn btn-danger-soft btn-sm"
                        title="Retirer cet enfant"
                      >
                        <Trash2 size={13} /> Retirer
                      </button>
                    </ConfirmForm>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tree-empty">
            <Baby size={28} />
            <strong>Aucun enfant enregistré</strong>
            <span>Ajoutez vos enfants : leur matricule sera généré automatiquement.</span>
          </div>
        )}

        {canEdit && (
          <Link
            href={`/family-tree/add-children?member_id=${mainMember.id}`}
            className="btn btn-primary btn-sm tree-panel-action"
          >
            <UserPlus size={14} /> Ajouter un enfant
          </Link>
        )}
      </section>
    </div>
  );
}
