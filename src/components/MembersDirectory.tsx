"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Baby,
  Heart,
  KeyRound,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { ProfilePhoto } from "./ProfilePhoto";
import { age, fullName, genderLabel } from "@/lib/format";
import type { HouseholdPerson, HouseholdSummary } from "@/lib/households";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function identifier(person: HouseholdPerson) {
  return person.user_matricule || person.user_email || "Sans identifiant";
}

function spouseRole(person: HouseholdPerson) {
  if (person.genre === "male") return "Époux";
  if (person.genre === "female") return "Épouse";
  return "Conjoint(e)";
}

function statusLabel(unit: HouseholdSummary) {
  if (unit.kind === "couple") return "Couple & foyer";
  if (unit.kind === "single-parent") return "Responsable sans couple";
  return "Célibataire";
}

function statusIcon(unit: HouseholdSummary) {
  if (unit.kind === "couple") return <Heart size={12} />;
  if (unit.kind === "single-parent") return <Users size={12} />;
  return <UserRound size={12} />;
}

function CouplePerson({
  person,
  role,
}: {
  person: HouseholdPerson;
  role: string;
}) {
  const years = age(person.date_naissance, person.date_deces);
  return (
    <div className="couple-person">
      <ProfilePhoto
        nom={person.nom}
        prenom={person.prenom}
        nomComplet={person.nom_complet}
        photo={person.photo}
        size="lg"
        shape="square"
        className="couple-person-photo"
      />
      <span className="couple-person-role">{role}</span>
      <strong>{fullName(person)}</strong>
      <span className="couple-person-meta">
        {person.profession || genderLabel(person.genre)}
        {years !== null ? ` · ${years} ans` : ""}
      </span>
      <span className="couple-person-id">
        <KeyRound size={11} /> {identifier(person)}
      </span>
    </div>
  );
}

function SinglePerson({ person }: { person: HouseholdPerson }) {
  const years = age(person.date_naissance, person.date_deces);
  return (
    <div className="single-person">
      <ProfilePhoto
        nom={person.nom}
        prenom={person.prenom}
        nomComplet={person.nom_complet}
        photo={person.photo}
        size="lg"
        shape="square"
        className="single-person-photo"
      />
      <div className="single-person-copy">
        <strong>{fullName(person)}</strong>
        <span className="couple-person-meta">
          {person.profession || genderLabel(person.genre)}
          {years !== null ? ` · ${years} ans` : ""}
        </span>
        {person.lieu && <span className="couple-person-meta">{person.lieu}</span>}
        <span className="couple-person-id">
          <KeyRound size={11} /> {identifier(person)}
        </span>
      </div>
    </div>
  );
}

function HouseholdCard({ unit }: { unit: HouseholdSummary }) {
  const childrenCount = unit.childrenCount;
  const title =
    unit.kind === "couple" && unit.spouse
      ? `le foyer de ${fullName(unit.primary)} et ${fullName(unit.spouse)}`
      : `le foyer de ${fullName(unit.primary)}`;

  return (
    <article className={`household-card household-card-${unit.kind}`}>
      <Link
        href={`/households/${unit.primary.id}`}
        className="household-card-hitbox"
        aria-label={`Voir ${title}`}
      />
      <div className="household-card-inner">
        <div className="household-card-top">
          <span className={`household-status household-status-${unit.kind}`}>
            {statusIcon(unit)} {statusLabel(unit)}
          </span>
          {childrenCount > 0 && (
            <span className="household-children">
              <Baby size={12} /> {childrenCount} enfant{childrenCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {unit.kind === "couple" && unit.spouse ? (
          <div className="couple-row">
            <CouplePerson person={unit.primary} role={spouseRole(unit.primary)} />
            <div className="couple-heart" aria-hidden="true">
              <Heart size={17} />
            </div>
            <CouplePerson person={unit.spouse} role={spouseRole(unit.spouse)} />
          </div>
        ) : (
          <SinglePerson person={unit.primary} />
        )}

        <div className="household-card-foot">
          <span>
            {unit.kind === "couple"
              ? childrenCount > 0
                ? "Couple responsable avec enfants"
                : "Couple sans enfant"
              : unit.kind === "single-parent"
                ? "Chef de foyer, sans conjoint"
                : "Membre seul, sans conjoint ni enfant"}
          </span>
          <span className="household-card-cta">
            Voir le foyer <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}

export function MembersDirectory({ units }: { units: HouseholdSummary[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const term = normalize(deferredQuery);
    if (!term) return units;
    return units.filter((unit) => {
      const haystack = [
        unit.primary.nom,
        unit.primary.prenom,
        unit.primary.nom_complet,
        unit.spouse?.nom,
        unit.spouse?.prenom,
        unit.spouse?.nom_complet,
        statusLabel(unit),
      ]
        .filter(Boolean)
        .join(" ");
      return normalize(haystack).includes(term);
    });
  }, [deferredQuery, units]);

  return (
    <>
      <div className="members-search-card">
        <div className="members-search-copy">
          <span className="members-search-eyebrow">
            <Users size={13} /> Répertoire familial
          </span>
          <h2>Rechercher un membre, un couple ou un foyer</h2>
          <p>Les résultats se filtrent directement pendant la saisie.</p>
        </div>
        <div className="members-search-field topbar-search">
          <Search size={17} color="#94a3b8" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tapez un nom..."
            aria-label="Rechercher un membre ou un couple"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="members-search-clear"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <span className="members-search-result" aria-live="polite">
          {filtered.length} foyer{filtered.length > 1 ? "s" : ""} affiché
          {filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">
            <Search />
          </div>
          <h3>Aucun résultat</h3>
          <p>Aucun membre, couple ou foyer ne correspond à « {query} ».</p>
          <button type="button" className="btn btn-ghost" onClick={() => setQuery("")}>
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="households-grid">
          {filtered.map((unit) => (
            <HouseholdCard key={unit.key} unit={unit} />
          ))}
        </div>
      )}
    </>
  );
}
