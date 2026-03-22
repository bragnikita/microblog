import { testDsqlConnection, testLocalPgConnection } from "~~/server/services/dsql";

export default defineEventHandler(async (event) => {
  try {
    return import.meta.dev ? await testLocalPgConnection() : await testDsqlConnection();
  } catch (error: any) {
    const statusCode = error?.statusCode || 500;
    setResponseStatus(event, statusCode);
    return {
      ok: false,
      message: error?.statusMessage || error?.message || "DSQL connection test failed",
      details: error?.stack || String(error),
    };
  }
});
