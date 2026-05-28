import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authenticate, createUser, setSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email: string; password: string };
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "邮箱或密码格式错误" }, { status: 400 });
  }
  const exists = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1);

  if (exists.length === 0) {
    // 自动注册
    await createUser({ email, password });
  }
  const session = await authenticate(email, password);
  if (!session) {
    return NextResponse.json({ error: "邮箱已存在但密码错误" }, { status: 401 });
  }
  await setSession(session);
  return NextResponse.json({ ok: true });
}
