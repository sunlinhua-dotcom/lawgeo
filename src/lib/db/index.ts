import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

const DB_PATH =
  process.env.DATABASE_URL?.replace(/^file:/, "") ?? path.join(process.cwd(), "data", "lawgeo.db");

declare global {
  // eslint-disable-next-line no-var
  var __lawgeo_sqlite: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __lawgeo_drizzle: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function ensureDir(p: string) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function open() {
  ensureDir(DB_PATH);
  const conn = new Database(DB_PATH, { timeout: 5000 });
  conn.pragma("journal_mode = WAL");
  conn.pragma("foreign_keys = ON");
  conn.pragma("synchronous = NORMAL");
  conn.pragma("busy_timeout = 5000");
  return conn;
}

function getDb() {
  if (!globalThis.__lawgeo_drizzle) {
    const sqlite = globalThis.__lawgeo_sqlite ?? open();
    if (process.env.NODE_ENV !== "production") globalThis.__lawgeo_sqlite = sqlite;
    globalThis.__lawgeo_drizzle = drizzle(sqlite, { schema });
  }
  return globalThis.__lawgeo_drizzle;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...args: unknown[]) => unknown).bind(real) : v;
  },
});

export { schema };
export type DB = ReturnType<typeof drizzle<typeof schema>>;
