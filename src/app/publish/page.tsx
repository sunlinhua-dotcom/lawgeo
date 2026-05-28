import type { Metadata } from "next";
import Link from "next/link";
import { Share2, Link2, RefreshCw, Layers } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "多平台发布 — 知乎 / 百家号 / 公众号 / 小红书 / 今日头条 / 视频号",
  description:
    "把官网事实源同步到 7 大主流平台，自动适配字数、标题、封面、引用回链。提升 AI 多平台共现概率。",
  alternates: { canonical: "/publish" },
};

const channels = [
  { name: "知乎", tone: "深度问答型", words: "1500–3000 字" },
  { name: "百家号", tone: "百度生态偏好", words: "800–2000 字" },
  { name: "公众号", tone: "口语化深度", words: "1200–2500 字" },
  { name: "小红书", tone: "种草 + 标签", words: "500–800 字 + 9 图" },
  { name: "今日头条", tone: "信息流偏好", words: "600–1500 字" },
  { name: "视频号", tone: "口播脚本", words: "60–180 秒" },
  { name: "B 站专栏", tone: "深度科普", words: "1500–4000 字" },
];

export default function PublishPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "多平台发布", path: "/publish" }])} />
      <PageHero
        badge="产品 · 多平台发布"
        title={<>一次写作，<span className="gradient-text">七处共现</span></>}
        description="官网作为最完整事实源，自动改写到 7 大主流平台。多平台共现是 AI 优先引用的关键信号。"
      />

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => (
            <Card key={c.name} className="lift">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {c.name}
                  <Badge variant="primary">支持</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 dark:text-slate-400">风格：{c.tone}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">字数：{c.words}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Share2, title: "一稿多发", desc: "上传一次官网原文，自动改写到所有渠道" },
            { icon: Link2, title: "回链官网", desc: "每个站外版本自动加官网原始页面链接" },
            { icon: RefreshCw, title: "事实同步", desc: "官网更新时，所有平台稿件可一键同步刷新" },
            { icon: Layers, title: "封面/标签自动", desc: "按平台规范生成标题、封面、Hashtag" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title}>
                <CardHeader>
                  <Icon className="h-6 w-6 text-indigo-600" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" variant="primary">
            <Link href="/contact">了解发布工作流</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
