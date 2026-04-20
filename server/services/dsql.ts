import { Resource } from "sst";
import pg from "pg";

export async function testLocalPgConnection() {
  const host = process.env.POSTGRES_HOST ?? "localhost";
  const port = Number(process.env.POSTGRES_PORT ?? 5432);
  const user = process.env.POSTGRES_USER ?? "postgres";
  const password = process.env.POSTGRES_PASSWORD ?? "postgres";
  const database = process.env.POSTGRES_DB ?? "postgres";

  const client = new pg.Client({ host, port, user, password, database, connectionTimeoutMillis: 5000 });
  const startedAt = Date.now();

  console.log(`Testing local PostgreSQL connection to ${host}:${port}/${database}...`);

  try {
    await client.connect();
    const result = await client.query(
      "select now() as now, current_user as current_user, current_database() as current_database",
    );
    return {
      ok: true,
      endpoint: `${host}:${port}/${database}`,
      durationMs: Date.now() - startedAt,
      rowCount: result.rowCount,
      rows: result.rows,
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function testDsqlConnection() {
  const dsqlResource = Resource.dsql;

  if (!dsqlResource?.endpoint) {
    throw createError({
      statusCode: 500,
      statusMessage: "DSQL resource is not linked to the Nuxt server",
    });
  }

  const { AuroraDSQLClient } = await import("@aws/aurora-dsql-node-postgres-connector");
  const startedAt = Date.now();
  const client = new AuroraDSQLClient({
    host: dsqlResource.endpoint,
    user: "admin",
    database: "postgres",
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    const result = await client.query(
      "select now() as now, current_user as current_user, current_database() as current_database",
    );

    return {
      ok: true,
      endpoint: dsqlResource.endpoint,
      durationMs: Date.now() - startedAt,
      rowCount: result.rowCount,
      rows: result.rows,
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}
