import pg from "pg";

const { Pool, types } = pg;

// bigint -> number (les IDs de cette application restent petits)
types.setTypeParser(20, (value) => Number(value));
// date / timestamp -> chaînes ISO pour éviter les décalages de fuseau
types.setTypeParser(1082, (value) => value);
types.setTypeParser(1114, (value) => value);
types.setTypeParser(1184, (value) => value);

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/kalubimba_family";

const isLocal = /(^|@)(localhost|127\.0\.0\.1|\[::1\])/.test(connectionString);
const ssl =
  process.env.DATABASE_SSL === "false" || isLocal
    ? undefined
    : { rejectUnauthorized: false };

const globalForDb = globalThis as unknown as { kalubimbaPool?: pg.Pool };

export const pool =
  globalForDb.kalubimbaPool ??
  new Pool({
    connectionString,
    ssl,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.kalubimbaPool = pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function transaction<T>(
  work: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
