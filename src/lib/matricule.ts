import { queryOne } from "./db";

const PREFIX = "KALUBIMBA";
const SEQUENCE_LENGTH = 5;

export async function generateMatricule(): Promise<string> {
  const last = await queryOne<{ matricule: string | null }>(
    `SELECT matricule FROM users
     WHERE matricule LIKE $1
     ORDER BY matricule DESC
     LIMIT 1`,
    [`${PREFIX}%`],
  );

  let sequence = 1;
  if (last?.matricule) {
    const numeric = Number.parseInt(last.matricule.slice(PREFIX.length), 10);
    if (Number.isFinite(numeric)) sequence = numeric + 1;
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = `${PREFIX}${String(sequence).padStart(SEQUENCE_LENGTH, "0")}`;
    const exists = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE matricule = $1",
      [candidate],
    );
    if (!exists) return candidate;
    sequence += 1;
  }

  throw new Error("Impossible de générer un matricule unique.");
}
