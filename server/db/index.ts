import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

export { schema };
export type AppDb = NodePgDatabase<typeof schema>;

export interface DbConnection {
  db: AppDb;
  cleanup: () => Promise<void>;
}

/**
 * Creates a Drizzle instance connected to the local Docker Postgres.
 * Uses environment variables with the same defaults as docker-compose.yml.
 */
export function getLocalDb(): DbConnection {
  const pool = new pg.Pool({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DB ?? 'postgres',
  });
  return {
    db: drizzle({ client: pool, schema }),
    cleanup: () => pool.end(),
  };
}

/**
 * Creates a Drizzle instance connected to Aurora DSQL.
 * Uses the SST-linked `dsql` resource for the endpoint and IAM token auth.
 * Must be called inside an SST-aware runtime (Lambda / `sst dev`).
 */
export async function getDsqlDb(): Promise<DbConnection> {
  const { AuroraDSQLClient } = await import('@aws/aurora-dsql-node-postgres-connector');

  const client = new AuroraDSQLClient({
    host: `${process.env.DSQL_ENDPOINT_NAME}.dsql.ap-northeast-1.on.aws`,
    user: 'admin',
    database: 'postgres',
    connectionTimeoutMillis: 5000,
  });
  await client.connect();

  // AuroraDSQLClient is structurally compatible with pg.Client
  return {
    db: drizzle({ client: client as unknown as pg.Client, schema }),
    cleanup: () => client.end().catch(() => {}),
  };
}
