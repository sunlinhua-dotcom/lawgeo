"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Bot,
  Database,
  BookOpen,
  Share2,
  Plug,
  Link2,
  Workflow,
  FileBarChart,
  BellRing,
  Users,
  CreditCard,
  FileText,
  Building2,
  Home,
  Briefcase,
  Target,
  TrendingUp,
  GraduationCap,
  Coffee,
  Smartphone,
  Megaphone,
  Store,
  Landmark,
  Globe,
  Scale,
  type LucideIcon,
} from "lucide-react";

interface CmdItem {
  title: string;
  href: string;
  icon: LucideIcon;
  group: string;
  keywords?: string[];
}

const items: CmdItem[] = [
  // 控制台
  { title: "控制台 · 概览", href: "/dashboard", icon: LayoutDashboard, group: "控制台" },
  { title: "项目管理", href: "/dashboard/projects", icon: Building2, group: "控制台" },
  { title: "诊断历史", href: "/dashboard/audits", icon: Search, group: "控制台" },
  { title: "AI 内容生成", href: "/dashboard/generate", icon: Sparkles, group: "控制台" },
  { title: "AI 引用监测", href: "/dashboard/monitor", icon: Bot, group: "控制台" },
  { title: "关键词矩阵", href: "/dashboard/keywords", icon: Database, group: "控制台" },
  { title: "品牌知识库", href: "/dashboard/knowledge", icon: BookOpen, group: "控制台" },
  { title: "行业博客 / 批量发布", href: "/dashboard/blog", icon: FileText, group: "控制台" },
  { title: "多平台发布", href: "/dashboard/publish", icon: Share2, group: "控制台" },
  { title: "海外平台 API", href: "/dashboard/integrations", icon: Plug, group: "控制台" },
  { title: "转化追踪", href: "/dashboard/conversion", icon: Link2, group: "控制台" },
  { title: "AI Agent 编排", href: "/dashboard/agents", icon: Workflow, group: "控制台" },
  { title: "月度报告", href: "/dashboard/reports", icon: FileBarChart, group: "控制台" },
  { title: "邮件告警", href: "/dashboard/alerts", icon: BellRing, group: "控制台" },
  { title: "线索", href: "/dashboard/leads", icon: Users, group: "控制台" },
  { title: "套餐 / 用量", href: "/dashboard/billing", icon: CreditCard, group: "控制台" },

  // 工具
  { title: "免费 GEO 诊断", href: "/tools/audit", icon: Search, group: "工具", keywords: ["audit", "诊断", "score"] },
  { title: "AI 内容生成", href: "/tools/generate", icon: Sparkles, group: "工具" },
  { title: "意图聚类", href: "/tools/intent", icon: Target, group: "工具" },
  { title: "律所案由地域矩阵", href: "/tools/matrix", icon: Database, group: "工具" },
  { title: "12 平台 AI 对比", href: "/tools/compare", icon: Bot, group: "工具" },

  // 行业博客
  { title: "行业博客总览", href: "/i", icon: BookOpen, group: "行业博客" },
  { title: "律师 / 律所", href: "/i/lawyer", icon: Scale, group: "行业博客" },
  { title: "教育培训", href: "/i/education", icon: GraduationCap, group: "行业博客" },
  { title: "快消食品", href: "/i/fmcg", icon: Coffee, group: "行业博客" },
  { title: "消费电子", href: "/i/consumer-electronics", icon: Smartphone, group: "行业博客" },
  { title: "金融银行", href: "/i/finance", icon: Landmark, group: "行业博客" },
  { title: "招商加盟", href: "/i/franchise", icon: Store, group: "行业博客" },
  { title: "广告媒体", href: "/i/adtech", icon: Megaphone, group: "行业博客" },
  { title: "AI 出海", href: "/i/ai-saas-overseas", icon: Globe, group: "行业博客" },

  // 产品页
  { title: "GEO 洞察", href: "/insight", icon: TrendingUp, group: "产品" },
  { title: "AI 内容生成（介绍）", href: "/generate", icon: Sparkles, group: "产品" },
  { title: "多平台发布（介绍）", href: "/publish", icon: Share2, group: "产品" },
  { title: "AI 引用监测（介绍）", href: "/monitor", icon: Bot, group: "产品" },
  { title: "定价", href: "/pricing", icon: CreditCard, group: "产品" },

  // 行业方案
  { title: "律所方案", href: "/cases/lawyer", icon: Scale, group: "方案" },
  { title: "教育案例", href: "/cases/education", icon: GraduationCap, group: "方案" },
  { title: "金融案例", href: "/cases/finance", icon: Landmark, group: "方案" },
  { title: "出海方案", href: "/cases/overseas", icon: Globe, group: "方案" },
  { title: "全部行业案例", href: "/cases", icon: Briefcase, group: "方案" },

  // 资源
  { title: "FAQ", href: "/faq", icon: BookOpen, group: "资源" },
  { title: "GEO vs SEO", href: "/geo-vs-seo", icon: TrendingUp, group: "资源" },
  { title: "行业洞察", href: "/market-insights", icon: TrendingUp, group: "资源" },
  { title: "服务流程", href: "/process", icon: Workflow, group: "资源" },
  { title: "核心团队", href: "/team", icon: Users, group: "资源" },
  { title: "知识库", href: "/blog", icon: BookOpen, group: "资源" },
  { title: "联系我们", href: "/contact", icon: Users, group: "资源" },
  { title: "首页", href: "/", icon: Home, group: "资源" },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  // Group items
  const grouped = items.reduce<Record<string, CmdItem[]>>((acc, it) => {
    (acc[it.group] ??= []).push(it);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-xl -translate-x-1/2 px-4"
          >
            <Command
              label="Command Menu"
              loop
              className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-800">
                <Search className="h-4 w-4 text-slate-400" />
                <Command.Input
                  placeholder="搜索功能、页面、工具…"
                  className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline dark:border-slate-700">
                  esc
                </kbd>
              </div>
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-slate-400">
                  没有匹配的结果
                </Command.Empty>
                {Object.entries(grouped).map(([group, list]) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="text-[10px] uppercase tracking-wider text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                  >
                    {list.map((it) => {
                      const Icon = it.icon;
                      return (
                        <Command.Item
                          key={it.href}
                          value={`${it.title} ${it.keywords?.join(" ") ?? ""}`}
                          onSelect={() => go(it.href)}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-indigo-50 aria-selected:text-indigo-900 dark:text-slate-200 dark:aria-selected:bg-indigo-950 dark:aria-selected:text-indigo-100"
                        >
                          <div className="grid h-7 w-7 place-items-center rounded-md bg-slate-100 text-slate-500 group-aria-selected:bg-indigo-100 group-aria-selected:text-indigo-600 dark:bg-slate-800 dark:text-slate-400">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1">{it.title}</span>
                          <span className="text-[10px] text-slate-400">{it.href}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-slate-200 px-1 py-px dark:border-slate-700">↑</kbd>
                    <kbd className="rounded border border-slate-200 px-1 py-px dark:border-slate-700">↓</kbd>
                    导航
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-slate-200 px-1 py-px dark:border-slate-700">↵</kbd>
                    打开
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 px-1 py-px dark:border-slate-700">⌘K</kbd>
                  随时呼出
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
