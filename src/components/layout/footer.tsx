import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Scale className="h-4 w-4" />
              </div>
              <span className="text-lg">BrandGEO</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              面向美妆个护、消费品与各行业品牌的 GEO 生成式引擎优化平台。让你的内容成为 AI 优先引用的权威信源。
            </p>
            <div className="mt-6 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <div>邮箱：{siteConfig.contact.email}</div>
              <div>微信：{siteConfig.contact.wechat}</div>
              <div>电话：{siteConfig.contact.phone}</div>
            </div>
          </div>

          {siteConfig.footerNav.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-slate-200 pt-8 text-xs text-slate-500 md:flex-row dark:border-slate-800">
          <div>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300">
              隐私政策
            </Link>
            <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300">
              服务条款
            </Link>
            <a href="/llms.txt" className="hover:text-slate-700 dark:hover:text-slate-300">
              llms.txt
            </a>
            <a href="/sitemap.xml" className="hover:text-slate-700 dark:hover:text-slate-300">
              sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
