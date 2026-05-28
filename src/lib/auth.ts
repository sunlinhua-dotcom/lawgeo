import "server-only";
import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "./db";

const COOKIE_NAME = "lawgeo_session";
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 天

export interface Session {
  userId: string;
  email: string;
  role: "admin" | "user";
}

export async function hash(password: string) {
  return bcrypt.hash(password, 10);
}
export async function verify(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export async function createUser(opts: { email: string; password: string; name?: string }) {
  const passwordHash = await hash(opts.password);
  const id = randomUUID();
  await db.insert(schema.users).values({
    id,
    email: opts.email.toLowerCase().trim(),
    name: opts.name,
    passwordHash,
    role: "user",
  });
  return id;
}

export async function authenticate(email: string, password: string): Promise<Session | null> {
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1);
  const user = rows[0];
  if (!user || !user.passwordHash) return null;
  const ok = await verify(password, user.passwordHash);
  if (!ok) return null;
  return { userId: user.id, email: user.email, role: user.role };
}

async function sign(session: Session) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function setSession(session: Session) {
  const token = await sign(session);
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "admin" | "user",
    };
  } catch {
    return null;
  }
}
