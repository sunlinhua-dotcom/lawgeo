"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  User,
  Trash2,
  Eye,
  FileText,
  Rocket,
  BookOpen,
  CheckCircle2,
  Wand2,
  Hash,
  Briefcase,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StepFlow, StepPanel } from "@/components/ui/step-flow";
import { DashSection } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import type { Author, BlogPost, BulkJob } from "@/lib/db/schema";

interface IndustryLite {
  slug: string;
  name: string;
  pillars: ReadonlyArray<{ slug: string; name: string; description: string }>;
}

export function BlogManager({
  industries,
  authors: initialAuthors,
  posts: initialPosts,
  jobs: initialJobs,
}: {
  industries: IndustryLite[];
  authors: Author[];
  posts: BlogPost[];
  jobs: BulkJob[];
}) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [posts, setPosts] = useState(initialPosts);
  const [jobs, setJobs] = useState(initialJobs);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeJobId) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/posts/jobs/${activeJobId}`);
        if (!r.ok) return;
        const d = await r.json();
        setJobs((js) => js.map((j) => (j.id === activeJobId ? { ...j, ...d.job } : j)));
        if (d.job.status === "done" || d.job.status === "failed") {
          setActiveJobId(null);
          const pr = await fetch("/api/posts");
          if (pr.ok) setPosts((await pr.json()).posts ?? []);
          if (d.job.status === "done") {
            toast.success(`已完成生成 ${d.job.completedCount} 篇文章`, {
              description: `点击「已生成文章」查看，或直接访问 /i/${d.job.industry} 浏览公开博客`,
            });
          }
          router.refresh();
        }
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [activeJobId, router]);

  return (
    <div className="space-y-6">
      <BulkWizard
        industries={industries}
        authors={authors}
        onAuthorCreated={(a) => setAuthors((all) => [a, ...all])}
        onJobStarted={(job) => {
          setJobs((js) => [job, ...js]);
          setActiveJobId(job.id);
        }}
      />

      {jobs.length > 0 && <JobsSection jobs={jobs} industries={industries} />}

      <PostsSection
        posts={posts}
        industries={industries}
        onDelete={(id) => setPosts((ps) => ps.filter((x) => x.id !== id))}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   3-step wizard for bulk generation
   ────────────────────────────────────────────────────────────────── */

interface FormState {
  industry: string;
  pillarSlug: string;
  authorId: string;
  newAuthor: { name: string; title: string; bio: string } | null;
  keywords: string;
  perKeyword: 1 | 2 | 3;
  autoPublish: boolean;
}

function BulkWizard({
  industries,
  authors,
  onAuthorCreated,
  onJobStarted,
}: {
  industries: IndustryLite[];
  authors: Author[];
  onAuthorCreated: (a: Author) => void;
  onJobStarted: (j: BulkJob) => void;
}) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    industry: industries[0]?.slug ?? "",
    pillarSlug: "",
    authorId: authors[0]?.id ?? "",
    newAuthor: null,
    keywords: "",
    perKeyword: 1,
    autoPublish: true,
  });
  const [busy, setBusy] = useState(false);

  const industry = industries.find((i) => i.slug === form.industry);
  const author =
    form.authorId === "__NEW__"
      ? null
      : authors.find((a) => a.id === form.authorId);
  const keywords = form.keywords
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const total = keywords.length * form.perKeyword;

  async function ensureAuthor(): Promise<string | null> {
    if (form.authorId && form.authorId !== "__NEW__") return form.authorId;
    if (form.authorId === "__NEW__" && form.newAuthor?.name) {
      const res = await fetch("/api/authors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.newAuthor.name,
          title: form.newAuthor.title || undefined,
          bio: form.newAuthor.bio || undefined,
          industry: form.industry,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const a: Author = {
          id: data.id,
          userId: "",
          name: form.newAuthor.name,
          slug: form.newAuthor.name,
          title: form.newAuthor.title || null,
          bio: form.newAuthor.bio || null,
          expertise: null,
          avatarUrl: null,
          industry: form.industry,
          socialLinks: null,
          createdAt: new Date(),
        };
        onAuthorCreated(a);
        return a.id;
      }
    }
    return null;
  }

  async function startBulk() {
    setBusy(true);
    try {
      const authorId = await ensureAuthor();
      const res = await fetch("/api/posts/bulk-generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          industry: form.industry,
          authorId: authorId || undefined,
          keywords,
          perKeyword: form.perKeyword,
          autoPublish: form.autoPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "启动失败");
      onJobStarted({
        id: data.jobId,
        userId: "",
        industry: form.industry,
        authorId: authorId ?? null,
        keywords: JSON.stringify(keywords),
        perKeyword: form.perKeyword,
        totalCount: data.totalCount,
        completedCount: 0,
        failedCount: 0,
        autoPublish: form.autoPublish,
        status: "queued",
        error: null,
        startedAt: null,
        finishedAt: null,
        createdAt: new Date(),
      });
      toast.success(`已启动 ${data.totalCount} 篇文章的批量生成`, {
        description: "生成进度会在下方实时显示",
      });
      // reset + close
      setForm((f) => ({ ...f, keywords: "" }));
      setStep(0);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "启动失败");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <CTACard
        onClick={() => setOpen(true)}
        title="批量生成 AI 友好文章"
        description="填作者 + 关键词清单 → 自动按 GEO 标准产出 → 直接发布到对应行业博客"
      />
    );
  }

  return (
    <Card variant="elevated" className="border-indigo-100 dark:border-indigo-950/40">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>批量生成向导</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">3 步完成，AI 自动按 GEO 标准产出</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            关闭
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <StepFlow
          steps={[
            {
              id: "context",
              title: "选行业与作者",
              description: "决定文章发到哪里、署谁的名",
              canProceed: () =>
                !form.industry
                  ? "请选择一个行业"
                  : !form.authorId
                    ? "请选择或新建作者"
                    : form.authorId === "__NEW__" && !form.newAuthor?.name
                      ? "新作者需要填姓名"
                      : true,
            },
            {
              id: "keywords",
              title: "粘贴关键词",
              description: "每行一个，最多 100 个",
              canProceed: () =>
                keywords.length === 0
                  ? "至少填一个关键词"
                  : total > 100
                    ? `当前合计 ${total} 篇，超出上限 100`
                    : true,
            },
            { id: "confirm", title: "确认并启动", description: "最后检查一下" },
          ]}
          current={step}
          onCurrentChange={setStep}
          onCancel={() => setOpen(false)}
          onFinish={startBulk}
          finishLabel={`启动生成（${total} 篇）`}
          busy={busy}
        >
          {/* Step 1 — context */}
          <StepPanel>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  行业 <span className="text-rose-500">*</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {industries.map((i) => (
                    <SelectableCard
                      key={i.slug}
                      selected={form.industry === i.slug}
                      onClick={() =>
                        setForm({ ...form, industry: i.slug, pillarSlug: "" })
                      }
                      icon={Briefcase}
                      title={i.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  支柱主题（可选）
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SelectableCard
                    selected={!form.pillarSlug}
                    onClick={() => setForm({ ...form, pillarSlug: "" })}
                    icon={Globe}
                    title="不限"
                  />
                  {industry?.pillars.map((p) => (
                    <SelectableCard
                      key={p.slug}
                      selected={form.pillarSlug === p.slug}
                      onClick={() => setForm({ ...form, pillarSlug: p.slug })}
                      icon={Hash}
                      title={p.name}
                      subtitle={p.description}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                作者署名 <span className="text-rose-500">*</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {authors.map((a) => (
                  <SelectableCard
                    key={a.id}
                    selected={form.authorId === a.id}
                    onClick={() => setForm({ ...form, authorId: a.id })}
                    icon={User}
                    title={a.name}
                    subtitle={a.title ?? "—"}
                  />
                ))}
                <SelectableCard
                  selected={form.authorId === "__NEW__"}
                  onClick={() =>
                    setForm({
                      ...form,
                      authorId: "__NEW__",
                      newAuthor: form.newAuthor ?? { name: "", title: "", bio: "" },
                    })
                  }
                  icon={Plus}
                  title="新建作者"
                  subtitle="只需填姓名"
                  dashed
                />
              </div>
              <AnimatePresence>
                {form.authorId === "__NEW__" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3 dark:bg-slate-800/60">
                      <Input
                        label="姓名"
                        required
                        value={form.newAuthor?.name ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            newAuthor: { ...(form.newAuthor ?? { name: "", title: "", bio: "" }), name: e.target.value },
                          })
                        }
                        placeholder="如：林研究员"
                        maxLength={20}
                        showCount
                      />
                      <Input
                        label="头衔（可选）"
                        value={form.newAuthor?.title ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            newAuthor: { ...(form.newAuthor ?? { name: "", title: "", bio: "" }), title: e.target.value },
                          })
                        }
                        placeholder="如：成分研究员 / 护肤专家"
                        maxLength={30}
                        showCount
                      />
                      <Input
                        label="简介（可选）"
                        value={form.newAuthor?.bio ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            newAuthor: { ...(form.newAuthor ?? { name: "", title: "", bio: "" }), bio: e.target.value },
                          })
                        }
                        placeholder="一句话介绍专业背景"
                        maxLength={80}
                        showCount
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </StepPanel>

          {/* Step 2 — keywords */}
          <StepPanel>
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              <div>
                <Textarea
                  label="关键词清单"
                  required
                  hint={
                    <>
                      每行一个，最多 100 个。建议长尾、问句形式（如：「敏感肌精华液哪个好用」），转化更好。
                    </>
                  }
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder={"敏感肌精华液哪个好用\n烟酰胺美白有用吗\n视黄醇敏感肌能用吗\n油痘肌怎么护肤"}
                  rows={12}
                  showCount
                  className="font-mono"
                />
                <KeywordSuggestions
                  industry={form.industry}
                  onPick={(kw) =>
                    setForm((f) => ({
                      ...f,
                      keywords: (f.keywords.trim() ? f.keywords.trim() + "\n" : "") + kw,
                    }))
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">每个关键词生成</div>
                  <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, perKeyword: n as 1 | 2 | 3 })}
                        className={cn(
                          "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                          form.perKeyword === n
                            ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                            : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                        )}
                      >
                        <span className="num">{n}</span> 篇
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">多版本 = 同一关键词不同角度</div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <input
                    type="checkbox"
                    checked={form.autoPublish}
                    onChange={(e) => setForm({ ...form, autoPublish: e.target.checked })}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <div>
                    <div className="text-xs font-medium">自动发布到公开博客</div>
                    <div className="text-[10px] text-slate-500">关闭则只存草稿</div>
                  </div>
                </label>

                <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-900/60 dark:from-indigo-950 dark:to-violet-950">
                  <div className="text-xs text-indigo-900 dark:text-indigo-200">即将生成</div>
                  <div className="num mt-1 text-3xl font-semibold text-indigo-700 dark:text-indigo-100">
                    {total}
                  </div>
                  <div className="text-[10px] text-indigo-800/70 dark:text-indigo-300/70">
                    篇 GEO 友好文章，每篇 1500-2500 字
                  </div>
                  <div className="mt-2 text-[10px] text-indigo-800/70 dark:text-indigo-300/70">
                    ≈ 总耗时 <span className="num">{Math.ceil((total * 45) / 60)}</span> 分钟
                  </div>
                </div>
              </div>
            </div>
          </StepPanel>

          {/* Step 3 — confirm */}
          <StepPanel>
            <Card variant="flat">
              <div className="p-6">
                <div className="text-xs uppercase tracking-wider text-slate-500">即将启动</div>
                <div className="num mt-1 text-3xl font-semibold">{total} 篇文章</div>
                <p className="mt-1 text-sm text-slate-500">{form.autoPublish ? "生成后直接发布到公开博客" : "仅保存草稿，需手动发布"}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ConfirmItem icon={Briefcase} label="行业" value={industry?.name ?? "—"} />
                  <ConfirmItem icon={Hash} label="支柱主题" value={industry?.pillars.find((p) => p.slug === form.pillarSlug)?.name ?? "不限"} />
                  <ConfirmItem
                    icon={User}
                    label="作者"
                    value={
                      form.authorId === "__NEW__"
                        ? `${form.newAuthor?.name ?? "—"}${form.newAuthor?.title ? ` · ${form.newAuthor.title}` : ""}（即将新建）`
                        : `${author?.name ?? "—"}${author?.title ? ` · ${author.title}` : ""}`
                    }
                  />
                  <ConfirmItem icon={FileText} label="关键词数" value={`${keywords.length} 个`} />
                  <ConfirmItem icon={Sparkles} label="每词生成" value={`${form.perKeyword} 篇`} />
                  <ConfirmItem icon={Rocket} label="发布策略" value={form.autoPublish ? "自动发布" : "存为草稿"} />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-slate-900 text-slate-100 dark:bg-slate-950">
              <div className="p-6">
                <div className="text-xs uppercase tracking-wider text-slate-400">将生成的部分关键词预览（前 6 个）</div>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {keywords.slice(0, 6).map((k) => (
                    <div key={k} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 font-mono text-xs">
                      <Hash className="h-3 w-3 text-slate-400" />
                      {k}
                    </div>
                  ))}
                  {keywords.length > 6 && (
                    <div className="col-span-full text-center text-[10px] text-slate-500">⋯ 还有 <span className="num">{keywords.length - 6}</span> 个</div>
                  )}
                </div>
              </div>
            </Card>
          </StepPanel>
        </StepFlow>
      </CardContent>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Subcomponents
   ────────────────────────────────────────────────────────────────── */

function CTACard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 p-8 text-left transition-all hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 dark:hover:border-indigo-700"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="dotgrid absolute inset-0 opacity-30" />
      <div className="relative flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Wand2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 transition-transform group-hover:translate-x-1 dark:text-indigo-400">
          开始
          <Sparkles className="h-4 w-4" />
        </div>
      </div>
    </motion.button>
  );
}

function SelectableCard({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
  dashed,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
        dashed && !selected
          ? "border-dashed border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700"
          : selected
            ? "border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-200/60 dark:border-indigo-400 dark:bg-indigo-950/40 dark:ring-indigo-900/60"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50",
      )}
    >
      {Icon && (
        <div
          className={cn(
            "grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg transition-colors",
            selected
              ? "bg-indigo-600 text-white dark:bg-indigo-500"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{title}</div>
        {subtitle && <div className="truncate text-[10px] text-slate-500">{subtitle}</div>}
      </div>
      {selected && (
        <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      )}
    </button>
  );
}

function KeywordSuggestions({
  industry,
  onPick,
}: {
  industry: string;
  onPick: (kw: string) => void;
}) {
  // 简单本地建议词，不调用 API。生产可调真实关键词工具。
  const samples: Record<string, string[]> = {
    beauty: [
      "敏感肌精华液哪个好用",
      "烟酰胺美白有用吗",
      "视黄醇敏感肌能用吗",
      "玻尿酸精华怎么用",
      "油皮用什么防晒不闷痘",
      "油痘肌怎么护肤",
    ],
    lawyer: [
      "上海离婚律师怎么收费",
      "深圳劳动仲裁找哪家律所",
      "北京合同纠纷律师推荐",
      "杭州知识产权律师哪家好",
      "广州交通事故律师免费咨询",
      "成都刑事辩护律师推荐",
    ],
    education: [
      "国家电网考试培训机构推荐",
      "CPA 培训哪家通过率高",
      "雅思 7 分培训班多少钱",
      "高三冲刺辅导班怎么选",
    ],
    fmcg: ["走亲访友送什么礼品好", "六个核桃的营养价值", "春节礼品推荐"],
    finance: ["上海银行理财产品推荐", "经营贷利率怎么算", "信用卡分期手续费"],
  };
  const list = samples[industry] ?? [];
  if (list.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">推荐试试这些</div>
      <div className="flex flex-wrap gap-1.5">
        {list.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onPick(k)}
            className="group rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
          >
            <Plus className="mr-0.5 inline h-2.5 w-2.5 transition-transform group-hover:scale-125" />
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfirmItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Jobs section
   ────────────────────────────────────────────────────────────────── */

function JobsSection({ jobs, industries }: { jobs: BulkJob[]; industries: IndustryLite[] }) {
  return (
    <DashSection title="📋 批量任务历史" description="实时显示生成进度">
      <div className="space-y-2">
        {jobs.map((j) => {
          const ind = industries.find((i) => i.slug === j.industry);
          const pct = j.totalCount > 0 ? Math.round((j.completedCount / j.totalCount) * 100) : 0;
          return (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <Badge
                    dot
                    variant={
                      j.status === "done"
                        ? "success"
                        : j.status === "running"
                          ? "primary"
                          : j.status === "failed"
                            ? "danger"
                            : "default"
                    }
                  >
                    {j.status === "running" ? "运行中" : j.status === "done" ? "已完成" : j.status === "failed" ? "失败" : j.status}
                  </Badge>
                  <Badge variant="outline">{ind?.name ?? j.industry}</Badge>
                  <span className="truncate text-xs text-slate-500">{new Date(j.createdAt).toLocaleString("zh-CN")}</span>
                </div>
                <div className="text-xs num">
                  <span className="font-semibold">{j.completedCount}</span>
                  <span className="text-slate-400"> / {j.totalCount}</span>
                </div>
              </div>
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "h-full rounded-full",
                    j.status === "done"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500",
                  )}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashSection>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Posts section
   ────────────────────────────────────────────────────────────────── */

function PostsSection({
  posts,
  industries,
  onDelete,
}: {
  posts: BlogPost[];
  industries: IndustryLite[];
  onDelete: (id: string) => void;
}) {
  return (
    <DashSection
      title="📝 已生成文章"
      description={`最近 ${Math.min(posts.length, 200)} 篇，含已发布与草稿`}
      action={
        <Link
          href="/i"
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <BookOpen className="h-3 w-3" /> 浏览公开博客
        </Link>
      }
    >
      {posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="还没有生成文章"
          description={<>填上面的向导一键生成。每个行业有专属博客，AI 友好结构 + 自动 schema.org。</>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="bg-slate-50/60 dark:bg-slate-800/40">
                <th className="px-4 py-2.5 text-left font-medium">标题</th>
                <th className="px-3 py-2.5 text-left font-medium">行业</th>
                <th className="px-3 py-2.5 text-left font-medium">状态</th>
                <th className="px-3 py-2.5 text-right font-medium">字数</th>
                <th className="px-3 py-2.5 text-right font-medium">浏览</th>
                <th className="px-3 py-2.5 text-right font-medium">日期</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {posts.slice(0, 200).map((p) => {
                const ind = industries.find((i) => i.slug === p.industry);
                return (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="max-w-md truncate px-4 py-2.5 font-medium">{p.title}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{ind?.name ?? p.industry}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={p.status === "published" ? "success" : "outline"} dot>
                        {p.status === "published" ? "已发布" : "草稿"}
                      </Badge>
                    </td>
                    <td className="num px-3 py-2.5 text-right text-xs">{p.wordCount ?? 0}</td>
                    <td className="num px-3 py-2.5 text-right text-xs">{p.viewCount}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {p.status === "published" && (
                        <a
                          href={`/i/${p.industry}/${encodeURIComponent(p.slug)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          if (!confirm("删除该文章？此操作不可撤销。")) return;
                          await fetch("/api/posts", {
                            method: "DELETE",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ id: p.id }),
                          });
                          onDelete(p.id);
                          toast.success("已删除");
                        }}
                        className="ml-1 rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashSection>
  );
}
