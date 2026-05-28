"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Bot,
  Database,
  Users,
  LogOut,
  Building2,
  BellRing,
  Share2,
  CreditCard,
  BookOpen,
  Link2,
  FileBarChart,
  Workflow,
  Plug,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Search,
  Sparkles,
  Bot,
  Database,
  Users,
  LogOut,
  Building2,
  BellRing,
  Share2,
  CreditCard,
  BookOpen,
  Link2,
  FileBarChart,
  Workflow,
  Plug,
  FileText,
};

export interface NavGroup {
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: string;
    badge?: string;
  }>;
}

export function DashSidebar({ email, groups }: { email: string; groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] flex-col gap-1 border-r border-slate-200/60 bg-white/40 px-3 py-6 backdrop-blur-xl lg:flex dark:border-slate-800/60 dark:bg-slate-950/40">
      <div className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        控制台
      </div>
      <nav className="flex-1 overflow-y-auto pr-1">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = ICONS[it.icon] ?? LayoutDashboard;
                const active = pathname === it.href;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150",
                      active
                        ? "bg-gradient-to-r from-indigo-500/10 to-violet-500/5 text-slate-900 shadow-[inset_0_0_0_1px_rgb(99_102_241_/_0.18)] dark:from-indigo-500/15 dark:to-violet-500/10 dark:text-slate-100"
                        : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors",
                        active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400",
                      )}
                    />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge && (
                      <Badge variant="gradient" size="sm" className="text-[9px]">
                        {it.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="rounded-xl border border-slate-200/60 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">已登录</div>
        <div className="mt-0.5 truncate text-xs font-medium">{email}</div>
        <form action="/api/auth/logout" method="POST" className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-50 hover:text-rose-600 dark:hover:bg-slate-800"
          >
            <LogOut className="h-3 w-3" /> 退出账户
          </button>
        </form>
      </div>
    </aside>
  );
}
