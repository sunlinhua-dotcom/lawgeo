import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listBrands, getCurrentBrand } from "@/lib/brand";
import { DashSidebar } from "@/components/dashboard/sidebar";

const NAV_GROUPS = [
  {
    label: "概览",
    items: [{ href: "/dashboard", label: "概览", icon: "LayoutDashboard" as const }],
  },
  {
    label: "GEO 全链路",
    items: [
      { href: "/dashboard/insight", label: "洞察与诊断", icon: "Lightbulb" as const },
      { href: "/dashboard/intent", label: "定位搜索意图", icon: "Target" as const },
      { href: "/dashboard/content", label: "内容创作及发布", icon: "PenTool" as const, badge: "7维" },
      { href: "/dashboard/realtime", label: "实时查询", icon: "Zap" as const, badge: "转化" },
      { href: "/dashboard/monitor", label: "数据监测追踪", icon: "Activity" as const },
      { href: "/dashboard/brand-assets", label: "AI 品牌资产", icon: "Sparkles" as const },
      { href: "/dashboard/geo-citation", label: "GEO 引用工程", icon: "Network" as const, badge: "PRD" },
    ],
  },
  {
    label: "内容生产",
    items: [
      { href: "/dashboard/blog", label: "行业博客 / 批量发布", icon: "FileText" as const },
      { href: "/dashboard/generate", label: "AI 内容生成", icon: "Sparkles" as const },
      { href: "/dashboard/knowledge", label: "品牌知识库", icon: "BookOpen" as const },
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
    label: "工具",
    items: [
      { href: "/dashboard/audits", label: "诊断历史", icon: "Search" as const },
      { href: "/dashboard/keywords", label: "关键词矩阵", icon: "Database" as const },
      { href: "/dashboard/agents", label: "AI Agent 编排", icon: "Workflow" as const },
      { href: "/dashboard/reports", label: "月度报告", icon: "FileBarChart" as const },
      { href: "/dashboard/alerts", label: "邮件告警", icon: "BellRing" as const },
    ],
  },
  {
    label: "账户",
    items: [
      { href: "/dashboard/leads", label: "线索", icon: "Users" as const },
      { href: "/dashboard/billing", label: "套餐 / Token", icon: "CreditCard" as const },
    ],
  },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const [brands, current] = await Promise.all([listBrands(session.userId), getCurrentBrand(session.userId)]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-slate-950/30">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <DashSidebar
          email={session.email}
          groups={NAV_GROUPS}
          brands={brands}
          currentBrandId={current?.id ?? null}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
