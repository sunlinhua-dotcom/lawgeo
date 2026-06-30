"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Send, CheckCircle2, AlertCircle, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  waitForWechatsync,
  syncToWechatsync,
  WECHATSYNC_PLATFORMS,
} from "@/lib/wechatsync";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/%E5%85%AC%E4%BC%97%E5%8F%B7%E5%90%8C%E6%AD%A5%E5%8A%A9%E6%89%8B/onpoadmkhcefogpdneghihaegkilfcgg";

export function WechatsyncPublishButton({
  title,
  desc,
  content,
  thumb,
  origin,
  tags,
  variant = "default",
}: {
  title: string;
  desc?: string;
  content: string;
  thumb?: string;
  origin?: string;
  tags?: string[];
  variant?: "default" | "inline";
}) {
  const [status, setStatus] = useState<"checking" | "installed" | "missing">("checking");
  const [sending, setSending] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    waitForWechatsync(1500).then((ok) => {
      if (mounted) setStatus(ok ? "installed" : "missing");
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function send() {
    setSending(true);
    setHint(null);
    try {
      const ok = syncToWechatsync({
        title: title.slice(0, 64),
        desc: (desc ?? content.slice(0, 120)).replace(/[#*`>\n]/g, " ").trim().slice(0, 120),
        content,
        thumb,
        origin,
        tags,
      });
      if (ok) {
        setHint("✅ 已唤起 Wechatsync 同步对话框，请在浏览器右上角扩展窗口选择目标平台");
      } else {
        setHint("⚠️ 扩展未响应，请刷新页面后重试");
      }
    } catch (e) {
      setHint("发送失败：" + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setSending(false);
    }
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        {status === "installed" ? (
          <Button onClick={send} disabled={sending} variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            <span className="ml-1">同步到 29+ 平台</span>
          </Button>
        ) : (
          <a href={CHROME_STORE_URL} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-3 w-3" /> 装 Wechatsync 扩展
            </Button>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold">📡 一键同步到 29+ 中文平台</h3>
            <Badge variant="success" className="text-[10px]">由 Wechatsync 提供</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            通过开源 Chrome 扩展 <code className="rounded bg-white/60 px-1 dark:bg-slate-800/60">Wechatsync</code> 把内容同步到公众号 / 知乎 / 头条 / 百家号 / CSDN / 简书 / 掘金 / SegmentFault / 小红书 / WordPress 等。
          </p>
        </div>
        <div>
          {status === "checking" && (
            <Badge variant="outline">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 检测扩展…
            </Badge>
          )}
          {status === "installed" && (
            <Badge variant="success">
              <CheckCircle2 className="mr-1 h-3 w-3" /> 扩展已安装
            </Badge>
          )}
          {status === "missing" && (
            <Badge variant="warning">
              <AlertCircle className="mr-1 h-3 w-3" /> 未检测到扩展
            </Badge>
          )}
        </div>
      </div>

      {status === "installed" && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button onClick={send} disabled={sending} variant="primary" size="lg" className="bg-emerald-600 hover:bg-emerald-700 flex-1">
            {sending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 唤起对话框…</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> 调用 Wechatsync 同步</>
            )}
          </Button>
          <Link
            href="/dashboard/integrations#wechatsync"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800"
          >
            查看支持的平台
          </Link>
        </div>
      )}

      {status === "missing" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            未检测到 Wechatsync。这是一个 <strong>开源、免费、本地运行</strong> 的 Chrome 扩展，
            利用你已登录的平台 cookie 实现同步，<strong>无需 OAuth 也无需企业资质</strong>。
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={CHROME_STORE_URL} target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="primary" size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full">
                <Download className="mr-2 h-4 w-4" /> 从 Chrome 商店安装（推荐）
              </Button>
            </a>
            <a
              href="https://github.com/wechatsync/Wechatsync"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ExternalLink className="mr-1 h-3 w-3" /> GitHub 源码
            </a>
          </div>
          <div className="text-xs text-slate-500">安装完毕后刷新本页面，按钮会自动可用。</div>
        </div>
      )}

      {hint && (
        <div className="mt-3 rounded-lg bg-white/60 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          {hint}
        </div>
      )}

      <div className="mt-4 border-t border-emerald-200 pt-3 dark:border-emerald-900">
        <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200 mb-2">
          ✨ 支持的平台（{WECHATSYNC_PLATFORMS.length}+）
        </div>
        <div className="flex flex-wrap gap-1">
          {WECHATSYNC_PLATFORMS.slice(0, 14).map((p) => (
            <Badge key={p.id} variant="outline" className="text-[10px]">
              {p.name}
            </Badge>
          ))}
          <Badge variant="outline" className="text-[10px]">⋯ 等 {WECHATSYNC_PLATFORMS.length}+</Badge>
        </div>
      </div>
    </div>
  );
}
