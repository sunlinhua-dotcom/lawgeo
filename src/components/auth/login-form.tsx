"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
        body: JSON.stringify({ email, password }),
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
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">邮箱</label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">密码</label>
        <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 6 位" />
      </div>
      {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">{err}</div>}
      <Button type="submit" size="lg" variant="primary" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 登录中…
          </>
        ) : (
          "登录 / 注册"
        )}
      </Button>
      <p className="text-center text-xs text-slate-500">
        密码长度 ≥ 6 位即可。首次登录会自动创建账户。
      </p>
    </form>
  );
}
