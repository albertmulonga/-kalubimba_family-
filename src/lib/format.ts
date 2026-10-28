export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const value = String(path).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;

  let cleaned = value.replace(/\\/g, "/").replace(/^\/+/, "");
  cleaned = cleaned
    .replace(/^storage\/app\/public\//, "")
    .replace(/^app\/public\//, "")
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  if (cleaned.startsWith("media/")) return `/${cleaned}`;
  return `/media/${cleaned}`;
}

export function fullName(person: {
  nom?: string | null;
  prenom?: string | null;
  nom_complet?: string | null;
}) {
  const composed = [person.prenom, person.nom].filter(Boolean).join(" ").trim();
  return person.nom_complet?.trim() || composed || "Membre";
}

export function initials(...parts: (string | null | undefined)[]) {
  return parts
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const dateOnly = /^\d{4}-\d{2}-\d{2}/.exec(value);
  if (dateOnly) return new Date(`${dateOnly[0]}T12:00:00`);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTime(value: string | Date | null | undefined) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function dateInputValue(value: string | Date | null | undefined) {
  if (!value) return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
  if (match) return match[1];
  const date = parseDate(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function age(
  birth: string | Date | null | undefined,
  death?: string | Date | null,
) {
  const start = parseDate(birth);
  if (!start) return null;
  const end = parseDate(death) ?? new Date();
  let years = end.getFullYear() - start.getFullYear();
  const beforeBirthday =
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate());
  if (beforeBirthday) years -= 1;
  return years >= 0 ? years : null;
}

export function genderLabel(genre: string | null | undefined) {
  if (!genre) return "Non renseigné";
  const normalized = genre.toLowerCase();
  if (["male", "m", "masculin", "homme"].includes(normalized)) return "Homme";
  if (["female", "f", "feminin", "féminin", "femme"].includes(normalized)) {
    return "Femme";
  }
  return "Autre";
}

export function genderValue(input: string | null | undefined): "male" | "female" | "other" {
  const value = (input ?? "").toLowerCase();
  if (["male", "m", "masculin", "homme"].includes(value)) return "male";
  if (["female", "f", "feminin", "féminin", "femme"].includes(value)) return "female";
  return "other";
}

export function fileSize(bytes: number | string | null | undefined) {
  const value = Number(bytes ?? 0);
  if (!value) return "";
  if (value < 1024) return `${value} o`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;
  return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
}

export function birthdayInfo(
  value: string | Date | null | undefined,
  isDeceased = false,
) {
  if (isDeceased) return null;
  const birth = parseDate(value);
  if (!birth) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate(), 12);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return "Anniversaire aujourd'hui";
  if (days === 1) return "Anniversaire demain";
  if (days <= 30) return `Anniversaire dans ${days} jours`;
  return null;
}
