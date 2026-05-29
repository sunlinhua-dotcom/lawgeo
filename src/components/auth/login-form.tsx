"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AtSign, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "登录失败");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Input
        label="账号"
        required
        type="text"
        autoComplete="username"
        leftIcon={<AtSign className="h-3.5 w-3.5" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱或 admin"
        hint="邮箱或任意用户名都可以，例如 admin"
      />
      <Input
        label="密码"
        required
        type="password"
        autoComplete="current-password"
        leftIcon={<KeyRound className="h-3.5 w-3.5" />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="任意密码（首次登录即注册）"
      />
      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {err}
        </div>
      )}
      <Button type="submit" size="lg" variant="primary" className="w-full" loading={loading} loadingText="登录中…">
        登录 / 注册
      </Button>
      <p className="text-center text-xs text-slate-500">
        首次输入即自动注册。试试 <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">admin</code> /{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">admin</code>
      </p>
    </form>
  );
}
