import { Resource } from "sst";

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
