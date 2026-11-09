import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDb>;

function createDb(url: string) {
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Returns a Drizzle client when DATABASE_URL is set; otherwise null. */
export function getDb(): Database | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  return createDb(url);
}

/** Use in server code that must talk to Neon. */
export function requireDb(): Database {
  const db = getDb();
  if (!db) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
    );
  }
  return db;
}
