import Link from "next/link";
import { redirect } from "next/navigation";
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
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { DashSidebar } from "@/components/dashboard/sidebar";

const NAV_GROUPS = [
  {
    label: "概览",
    items: [
      { href: "/dashboard", label: "概览", icon: "LayoutDashboard" as const },
      { href: "/dashboard/projects", label: "项目管理", icon: "Building2" as const },
    ],
  },
  {
    label: "内容生产",
    items: [
      { href: "/dashboard/blog", label: "行业博客 / 批量发布", icon: "FileText" as const, badge: "推荐" },
      { href: "/dashboard/generate", label: "AI 内容生成", icon: "Sparkles" as const },
      { href: "/dashboard/knowledge", label: "品牌知识库", icon: "BookOpen" as const },
    ],
  },
  {
    label: "GEO 监测",
    items: [
      { href: "/dashboard/audits", label: "诊断历史", icon: "Search" as const },
      { href: "/dashboard/monitor", label: "AI 引用监测", icon: "Bot" as const },
      { href: "/dashboard/keywords", label: "关键词矩阵", icon: "Database" as const },
    ],
  },
  {
    label: "发布与转化",
    items: [
      { href: "/dashboard/publish", label: "多平台发布", icon: "Share2" as const },
      { href: "/dashboard/integrations", label: "海外平台 API", icon: "Plug" as const },
      { href: "/dashboard/conversion", label: "转化追踪", icon: "Link2" as const },
    ],
  },
  {
    label: "自动化与报告",
    items: [
      { href: "/dashboard/agents", label: "AI Agent 编排", icon: "Workflow" as const },
      { href: "/dashboard/reports", label: "月度报告", icon: "FileBarChart" as const },
      { href: "/dashboard/alerts", label: "邮件告警", icon: "BellRing" as const },
    ],
  },
  {
    label: "账户",
    items: [
      { href: "/dashboard/leads", label: "线索", icon: "Users" as const },
      { href: "/dashboard/billing", label: "套餐 / 用量", icon: "CreditCard" as const },
    ],
  },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-slate-950/30">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <DashSidebar email={session.email} groups={NAV_GROUPS} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
