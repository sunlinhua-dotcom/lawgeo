import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Scale } from "lucide-react";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "登录", robots: { index: false } };

function safeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next?.startsWith("/") || next.startsWith("//")) return "/dashboard";
  if (next.startsWith("/login")) return "/dashboard";
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const nextPath = safeNext(params?.next);
  if (session) redirect(nextPath);
  return (
    <section className="grid min-h-[calc(100vh-12rem)] place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Scale className="h-4 w-4" />
          </div>
          <span className="text-xl">BrandGEO</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-indigo-100/40 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-center text-2xl font-semibold">登录 / 注册</h1>
          <p className="mt-2 text-center text-sm text-slate-500">首次输入邮箱与密码即自动注册</p>
          <Suspense fallback={null}>
            <LoginForm nextPath={nextPath} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
