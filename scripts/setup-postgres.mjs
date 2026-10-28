import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match) continue;
    if (process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
}

loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/kalubimba_family";
const url = new URL(connectionString);
const database = decodeURIComponent(url.pathname.replace(/^\//, "")) || "kalubimba_family";
const isLocal = ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
const ssl = process.env.DATABASE_SSL === "false" || isLocal ? false : { rejectUnauthorized: false };

const adminUrl = new URL(connectionString);
adminUrl.pathname = "/postgres";

const admin = new pg.Client({
  connectionString: adminUrl.toString(),
  ssl: adminUrl.hostname === url.hostname ? ssl : false,
});

try {
  await admin.connect();
  const existing = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);
  if (existing.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${database.replace(/"/g, '""')}"`);
    console.log(`Base "${database}" créée.`);
  } else {
    console.log(`Base "${database}" déjà présente.`);
  }
} finally {
  await admin.end();
}

const client = new pg.Client({ connectionString, ssl });
await client.connect();

try {
  const schema = readFileSync(resolve(root, "database/postgres/01_schema.sql"), "utf8");
  const data = readFileSync(resolve(root, "database/postgres/02_data.sql"), "utf8");
  await client.query(schema);
  console.log("Schéma PostgreSQL créé (15 tables).");
  await client.query(data);
  console.log("Données importées et séquences réinitialisées.");
  const tables = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );
  const counts = [];
  for (const { tablename } of tables.rows) {
    const count = await client.query(`SELECT count(*)::int AS rows FROM "${tablename}"`);
    counts.push({ table: tablename, rows: count.rows[0].rows });
  }
  console.table(counts);
} catch (error) {
  console.error("Échec de l'installation PostgreSQL :", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
