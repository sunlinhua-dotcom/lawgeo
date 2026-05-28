import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Search, Sparkles, Bot, Database, Users, LogOut, Building2, BellRing, Share2, CreditCard } from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="grid lg:grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-200 bg-slate-50/50 px-4 py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6 text-xs uppercase tracking-wider text-slate-500">控制台</div>
        <nav className="space-y-1 text-sm">
          {[
            { href: "/dashboard", label: "概览", icon: LayoutDashboard },
            { href: "/dashboard/projects", label: "项目管理", icon: Building2 },
            { href: "/dashboard/audits", label: "诊断历史", icon: Search },
            { href: "/dashboard/generate", label: "AI 内容生成", icon: Sparkles },
            { href: "/dashboard/monitor", label: "AI 引用监测", icon: Bot },
            { href: "/dashboard/keywords", label: "关键词矩阵", icon: Database },
            { href: "/dashboard/publish", label: "多平台发布", icon: Share2 },
            { href: "/dashboard/alerts", label: "邮件告警", icon: BellRing },
            { href: "/dashboard/leads", label: "线索", icon: Users },
            { href: "/dashboard/billing", label: "套餐 / 用量", icon: CreditCard },
          ].map((it) => {
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="text-xs text-slate-500">已登录</div>
          <div className="mt-1 truncate text-sm font-medium">{session.email}</div>
          <form action="/api/auth/logout" method="POST" className="mt-3">
            <button
              type="submit"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <LogOut className="h-3 w-3" /> 退出
            </button>
          </form>
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
