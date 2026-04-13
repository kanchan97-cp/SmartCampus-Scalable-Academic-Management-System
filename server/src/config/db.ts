import { env } from "./env";
import { Database } from "../shared/database/Database";

export const database = new Database({
  connectionString: env.databaseUrl,
  max: env.databasePoolMax,
  idleTimeoutMillis: env.databaseIdleTimeoutMs,
  connectionTimeoutMillis: env.databaseConnectionTimeoutMs,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
});
