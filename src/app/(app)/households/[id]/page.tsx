import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Baby,
  Cake,
  Heart,
  KeyRound,
  MapPin,
  Plus,
  ShieldCheck,
  TreePine,
  UserRound,
  Users,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMemberPlainPassword, getSpousesOf } from "@/lib/data";
import { getHousehold } from "@/lib/households";
import { canUpdateMember, canViewCredentials } from "@/lib/permissions";
import { age, formatDate, fullName, genderLabel } from "@/lib/format";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { ProfilePhoto } from "@/components/ProfilePhoto";

export const metadata = { title: "Foyer familial" };

function roleLabel(genre: string | null) {
  if (genre === "male") return "Ã‰poux";
  if (genre === "female") return "Ã‰pouse";
  return "Conjoint(e)";
}

function statusLabel(kind: "couple" | "single-parent" | "single") {
  if (kind === "couple") return "Couple & foyer";
  if (kind === "single-parent") return "Responsable sans couple";
  return "CÃ©libataire";
}

function identifier(person: {
  user_matricule: string | null;
  user_email: string | null;
}) {
  return person.user_matricule || person.user_email || "Sans identifiant";
}

export default async function HouseholdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isFinite(memberId)) notFound();

  const session = await requireSession();
  const flash = await readFlash(searchParams);
  const household = await getHousehold(memberId);
  if (!household) notFound();

  const { kind, head, spouse, children } = household;
  const people =
    spouse && head.genre !== "male" && spouse.genre === "male"
      ? [spouse, head]
      : spouse
        ? [head, spouse]
        : [head];

  const canEdit = await canUpdateMember(session, head.id);
  const [peopleCredentials, childEntries] = await Promise.all([
    Promise.all(people.map((person) => canViewCredentials(session, person))),
    Promise.all(
      children.map(async (child) => {
        const [showCredentials, childSpouses] = await Promise.all([
          canViewCredentials(session, child),
          getSpousesOf(child.id),
        ]);
        const password =
          showCredentials && child.utilisateur_id !== null
            ? await getMemberPlainPassword(child.id)
            : null;
        return {
          child,
          showCredentials,
          spouse: childSpouses[0] ?? null,
          password,
        };
      }),
    ),
  ]);

  const peoplePasswords = await Promise.all(
    people.map((person, index) =>
      peopleCredentials[index] && person.utilisateur_id !== null
        ? getMemberPlainPassword(person.id)
        : Promise.resolve(null),
    ),
  );

  const accountCount =
    people.filter((person) => person.utilisateur_id !== null).length +
    childEntries.filter((entry) => entry.child.utilisateur_id !== null).length;

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <div className="page-head">
        <div>
          <Link href="/members" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
            <ArrowLeft size={15} /> Tous les foyers
          </Link>
          <h1>Foyer familial</h1>
          <p>Le couple, les enfants et les identifiants du foyer.</p>
        </div>
        <div className="head-actions">
          <Link href="/family-tree" className="btn btn-ghost">
            <TreePine size={16} /> Mon arbre
          </Link>
          {canEdit && (
            <Link
              href={`/family-tree/add-children?member_id=${head.id}`}
              className="btn btn-primary"
            >
              <Plus size={16} /> Ajouter un enfant
            </Link>
          )}
        </div>
      </div>

      <section className={`household-hero household-hero-${kind}`}>
        <div className="household-hero-people">
          {people.map((person, index) => (
            <div key={person.id} className="household-hero-person">
              <ProfilePhoto
                nom={person.nom}
                prenom={person.prenom}
                nomComplet={person.nom_complet}
                photo={person.photo}
                size="xl"
                shape="square"
              />
              <span>{roleLabel(person.genre)}</span>
              <strong>{fullName(person)}</strong>
              {spouse && index === 0 && (
                <span className="household-hero-heart" aria-hidden="true">
                  <Heart size={17} />
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="household-hero-copy">
          <span className={`household-status household-status-${kind}`}>
            <Heart size={12} /> {statusLabel(kind)}
          </span>
          <h2>
            {spouse
              ? `${fullName(people[0])} & ${fullName(people[1])}`
              : fullName(head)}
          </h2>
          <p>
            {kind === "couple"
              ? "Un couple responsable, son foyer et ses enfants."
              : kind === "single-parent"
                ? "Un responsable de foyer qui Ã©lÃ¨ve ses enfants sans conjoint."
                : "Un membre de la famille encore cÃ©libataire, sans conjoint ni enfant."}
          </p>
          <div className="household-hero-meta">
            <span>
              <Baby size={14} /> {children.length} enfant
              {children.length > 1 ? "s" : ""}
            </span>
            <span>
              <Users size={14} /> {accountCount} compte
              {accountCount > 1 ? "s" : ""}
            </span>
            {head.lieu && (
              <span>
                <MapPin size={14} /> {head.lieu}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="household-layout">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>{spouse ? "Les Ã©poux" : "Le responsable"}</h2>
                <p>
                  {spouse
                    ? "Les deux membres du couple responsable."
                    : "La personne qui reprÃ©sente ce foyer."}
                </p>
              </div>
              <Users size={18} color="#2563eb" />
            </div>
            <div className="card-body">
              <div className={`household-people-grid ${spouse ? "" : "is-single"}`}>
                {people.map((person, index) => (
                  <article key={person.id} className="household-person-card">
                    <div className="household-person-head">
                      <ProfilePhoto
                        nom={person.nom}
                        prenom={person.prenom}
                        nomComplet={person.nom_complet}
                        photo={person.photo}
                        size="lg"
                        shape="square"
                      />
                      <div>
                        <span className="household-role">{roleLabel(person.genre)}</span>
                        <Link href={`/members/${person.id}`} className="household-person-name">
                          {fullName(person)}
                        </Link>
                        <span className="household-person-meta">
                          {person.profession || genderLabel(person.genre)}
                          {age(person.date_naissance, person.date_deces) !== null
                            ? ` Â· ${age(person.date_naissance, person.date_deces)} ans`
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div className="household-facts">
                      {person.date_naissance && (
                        <span>
                          <Cake size={13} /> {formatDate(person.date_naissance)}
                        </span>
                      )}
                      {person.lieu && (
                        <span>
                          <MapPin size={13} /> {person.lieu}
                        </span>
                      )}
                      <span>
                        <KeyRound size={13} /> {identifier(person)}
                      </span>
                    </div>

                    {peopleCredentials[index] && person.utilisateur_id !== null ? (
                      <div className="household-credentials">
                        <div className="household-credentials-title">
                          <ShieldCheck size={13} /> Identifiants
                        </div>
                        <div className="tree-credential-row">
                          <span>Matricule</span>
                          <code>{person.user_matricule || "Non attribuÃ©"}</code>
                        </div>
                        <div className="tree-credential-row">
                          <span>Email</span>
                          <code>{person.user_email || "Aucun"}</code>
                        </div>
                        <div className="tree-credential-row">
                          <span>Mot de passe</span>
                          <code>{peoplePasswords[index] || "Non disponible"}</code>
                        </div>
                      </div>
                    ) : (
                      <span className="household-no-credentials">
                        <UserRound size={13} />
                        {person.utilisateur_id === null
                          ? "Membre sans compte de connexion"
                          : "Identifiants privÃ©s"}
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Les enfants du foyer</h2>
                <p>
                  {children.length > 0
                    ? "Les enfants rattachÃ©s Ã  ce couple ou Ã  ce responsable."
                    : "Aucun enfant rattachÃ© Ã  ce foyer pour le moment."}
                </p>
              </div>
              <Baby size={18} color="#d97706" />
            </div>
            <div className="card-body">
              {childEntries.length === 0 ? (
                <div className="tree-empty">
                  <Baby size={28} />
                  <strong>Aucun enfant enregistrÃ©</strong>
                  <span>Ajoutez un enfant pour agrandir ce foyer.</span>
                </div>
              ) : (
                <div className="household-children-grid">
                  {childEntries.map(({ child, showCredentials, spouse: childSpouse, password }) => (
                    <article key={child.id} className="household-child-card">
                      <div className="household-child-head">
                        <ProfilePhoto
                          nom={child.nom}
                          prenom={child.prenom}
                          nomComplet={child.nom_complet}
                          photo={child.photo}
                          size="md"
                          shape="square"
                        />
                        <div>
                          <Link href={`/members/${child.id}`}>
                            <strong>{fullName(child)}</strong>
                          </Link>
                          <span>
                            {child.profession || genderLabel(child.genre)}
                            {age(child.date_naissance, child.date_deces) !== null
                              ? ` Â· ${age(child.date_naissance, child.date_deces)} ans`
                              : ""}
                          </span>
                          {childSpouse && (
                            <span className="household-child-spouse">
                              <Heart size={11} /> Avec {fullName(childSpouse)}
                            </span>
                          )}
                        </div>
                      </div>

                      {showCredentials && child.utilisateur_id !== null && (
                        <div className="household-child-credentials">
                          <span>
                            <KeyRound size={12} /> {child.user_matricule || child.user_email}
                          </span>
                          {password && <code>{password}</code>}
                        </div>
                      )}

                      <Link href={`/members/${child.id}`} className="household-child-link">
                        Voir le profil <ArrowUpRight size={13} />
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>RÃ©sumÃ© du foyer</h2>
                <p>Les informations utiles en un coup dâ€™Å“il.</p>
              </div>
            </div>
            <div className="card-body stack" style={{ gap: 12 }}>
              <div className="household-summary-row">
                <span>Statut</span>
                <strong>{statusLabel(kind)}</strong>
              </div>
              <div className="household-summary-row">
                <span>Conjoint</span>
                <strong>{spouse ? fullName(spouse) : "Aucun"}</strong>
              </div>
              <div className="household-summary-row">
                <span>Enfants</span>
                <strong>{children.length}</strong>
              </div>
              <div className="household-summary-row">
                <span>Comptes actifs</span>
                <strong>{accountCount}</strong>
              </div>
              <div className="household-summary-row">
                <span>Adresse</span>
                <strong>{head.adresse || "Non renseignÃ©e"}</strong>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Aller plus loin</h2>
                <p>Retrouvez ce foyer dans lâ€™arbre.</p>
              </div>
            </div>
            <div className="card-body stack" style={{ gap: 8 }}>
              <Link href="/family-tree" className="btn btn-ghost btn-block">
                <TreePine size={16} /> Ouvrir lâ€™arbre gÃ©nÃ©alogique
              </Link>
              <Link href="/members" className="btn btn-ghost btn-block">
                <Users size={16} /> Tous les foyers
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

