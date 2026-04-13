import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sqlFileArg = process.argv[2];

if (!sqlFileArg) {
  console.error("Usage: npm run db:schema OR npm run db:seed");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add your Neon connection string in server/.env");
  process.exit(1);
}

const sqlFilePath = path.resolve(process.cwd(), sqlFileArg);
const sql = fs.readFileSync(sqlFilePath, "utf8");

const pool = new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS ?? 10000),
  connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? 10000),
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

async function run(): Promise<void> {
  try {
    console.log(`Running SQL file: ${sqlFilePath}`);
    await pool.query(sql);
    console.log("SQL executed successfully.");
  } finally {
    await pool.end();
  }
}

run().catch((error: unknown) => {
  console.error("SQL execution failed.");
  console.error(error);
  process.exit(1);
});
