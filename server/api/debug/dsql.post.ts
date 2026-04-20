import { testDsqlConnection, testLocalPgConnection } from "~~/server/services/dsql";
import { getLocalDb, getDsqlDb } from "~~/server/db/index";
import { sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  let isConOk = false;
  try {
    // 1. Raw connection test
    const connResult = import.meta.dev
      ? await testLocalPgConnection()
      : await testDsqlConnection();
    isConOk = connResult.ok;
    // 2. Drizzle ORM test: insert → select → delete a row
    const conn = import.meta.dev ? getLocalDb() : await getDsqlDb();
    const drizzleResult = await (async () => {
      try {
        const startedAt = Date.now();
        await conn.db.execute(sql`SELECT 1`);
        return {
          ok: true,
          durationMs: Date.now() - startedAt,
        };
      } finally {
        await conn.cleanup();
      }
    })();

    return { rawConnection: connResult, drizzle: drizzleResult };
  } catch (error: any) {
    const statusCode = error?.statusCode || 500;
    setResponseStatus(event, statusCode);
    return {
      ok: false,
      isConnectionOk: isConOk,
      message: error?.statusMessage || error?.message || "DB connection test failed",
      details: error?.stack || String(error),
    };
  }
});
