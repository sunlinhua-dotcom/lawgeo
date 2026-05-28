import type { Metadata } from "next";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "联系 lawGEO — 预约 1v1 GEO 诊断",
  description: `预约 60 分钟 1v1 GEO 诊断，免费获得律所 GEO 路线图。邮箱 ${siteConfig.contact.email} · 微信 ${siteConfig.contact.wechat}`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "首页", path: "/" }, { name: "联系", path: "/contact" }])} />
      <PageHero
        badge="联系 lawGEO"
        title={<>预约一次 <span className="gradient-text">1v1 GEO 诊断</span></>}
        description="60 分钟在线沟通，给你一份可落地的 GEO 路线图。完全免费。"
      />
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">直接联系</h2>
            <div className="mt-6 space-y-4">
              <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <Mail className="h-5 w-5 text-indigo-600" />
                <div>
                  <div className="text-xs text-slate-500">邮箱</div>
                  <div className="font-medium">{siteConfig.contact.email}</div>
                </div>
              </a>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-xs text-slate-500">微信</div>
                  <div className="num font-medium">{siteConfig.contact.wechat}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <Phone className="h-5 w-5 text-slate-600" />
                <div>
                  <div className="text-xs text-slate-500">电话</div>
                  <div className="num font-medium">{siteConfig.contact.phone}</div>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
              工作时间：周一至周五 10:00–19:00（节假日除外）。
              我们会在 1 个工作日内联系你。
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">在线留资</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
