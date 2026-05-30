import { and, desc, eq, gte, count } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentBrand, getConversionProfile } from "@/lib/brand";
import { redirect } from "next/navigation";
import { BrandGate } from "@/components/dashboard/brand-gate";
import { DashHeader } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConversionProfileForm } from "@/components/dashboard/conversion-profile-form";
import { Sparkles, FileText, Target, Database } from "lucide-react";

export const metadata = { title: "AI 品牌资产", robots: { index: false } };

export default async function BrandAssetsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const brand = await getCurrentBrand(session.userId);
  if (!brand) return <BrandGate moduleName="AI 品牌资产" />;

  const profile = await getConversionProfile(brand.id);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [queries, intents, articles, docs] = await Promise.all([
    db.select().from(schema.aiQueries).where(and(eq(schema.aiQueries.userId, session.userId), gte(schema.aiQueries.queriedAt, since))).limit(2000),
    db.select({ n: count() }).from(schema.intents).where(eq(schema.intents.brandId, brand.id)),
    db.select({ n: count() }).from(schema.contentArticles).where(eq(schema.contentArticles.brandId, brand.id)),
    db.select({ n: count() }).from(schema.knowledgeDocs).where(eq(schema.knowledgeDocs.userId, session.userId)),
  ]);

  const total = queries.length;
  const mentioned = queries.filter((q) => q.cited).length;
  const top1 = queries.filter((q) => q.rank === 1).length;
  const mentionRate = total ? Math.round((mentioned / total) * 100) : 0;

  // 热词资产：从被引用的查询里聚合关键词
  const heatKeywords = new Map<string, number>();
  for (const q of queries) {
    if (!q.question) continue;
    heatKeywords.set(q.question, (heatKeywords.get(q.question) ?? 0) + (q.cited ? 1 : 0));
  }
  const topKeywords = Array.from(heatKeywords.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="px-6 py-8 lg:px-10">
      <DashHeader
        title={<>AI 品牌资产 · <span className="gradient-text">{brand.name}</span></>}
        description="品牌在 AI 搜索里的核心资产指标、热词资产、内容资产，以及转化画像配置。"
      />

      {/* 核心资产指标 */}
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        <AssetStat label="AI 提及率" value={`${mentionRate}%`} icon={Sparkles} color="text-indigo-600" />
        <AssetStat label="意图词资产" value={intents[0]?.n ?? 0} icon={Target} color="text-violet-600" />
        <AssetStat label="内容资产" value={articles[0]?.n ?? 0} icon={FileText} color="text-cyan-600" />
        <AssetStat label="知识库文档" value={docs[0]?.n ?? 0} icon={Database} color="text-emerald-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 热词资产 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔥 热词资产（近 30 天被引用）</CardTitle>
          </CardHeader>
          <CardContent>
            {topKeywords.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">还没有数据。去「实时查询」或「数据监测」积累。</div>
            ) : (
              <div className="space-y-2">
                {topKeywords.map(([kw, n]) => (
                  <div key={kw} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800">
                    <span className="truncate">{kw}</span>
                    <Badge variant={n > 0 ? "success" : "outline"}>被引用 <span className="num ml-1">{n}</span></Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 转化画像 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🎯 转化画像</CardTitle>
            <p className="text-xs text-slate-500">配置品牌的转化目标（电话/微信）。实时查询会追问 AI，看它会不会吐出这些 = 转化命中。</p>
          </CardHeader>
          <CardContent>
            <ConversionProfileForm brandId={brand.id} initial={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AssetStat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <Icon className={`h-5 w-5 ${color}`} />
        <div className="num mt-2 text-3xl font-semibold">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </CardContent>
    </Card>
  );
}
