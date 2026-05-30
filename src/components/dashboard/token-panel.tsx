"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wallet, TrendingDown, TrendingUp, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TokenWallet, TokenLedger } from "@/lib/db/schema";

const SOURCE_LABEL: Record<string, string> = {
  realtime: "实时查询",
  generate: "内容生成",
  content: "内容创作",
  insight: "洞察诊断",
  intent: "意图指数",
  compare: "平台对比",
};

export function TokenPanel({ wallet, ledgers }: { wallet: TokenWallet; ledgers: TokenLedger[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function recharge(amount: number) {
    setBusy(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`已充值 ${amount.toLocaleString()} token`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "充值失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card variant="gradient">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Wallet className="h-4 w-4" /> Token 余额
          </div>
          <div className="num mt-2 text-4xl font-bold text-indigo-700 dark:text-indigo-200">
            {wallet.balance.toLocaleString()}
          </div>
          <div className="mt-1 flex gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" />累计充值 {wallet.totalRecharged.toLocaleString()}</span>
            <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-rose-500" />累计消耗 {wallet.totalConsumed.toLocaleString()}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {[100000, 500000].map((amt) => (
              <Button key={amt} size="sm" variant="primary" disabled={busy} onClick={() => recharge(amt)}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
                +{(amt / 10000).toFixed(0)}万
              </Button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">演示充值。每次 AI 调用按消耗 token 实时扣费。</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Token 流水</CardTitle>
        </CardHeader>
        <CardContent>
          {ledgers.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">还没有消耗记录。用任意 AI 功能后这里会出现。</div>
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {ledgers.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Badge variant={l.type === "recharge" ? "success" : "outline"} className="text-[10px]">
                      {l.type === "recharge" ? "充值" : SOURCE_LABEL[l.source ?? ""] ?? l.source ?? "消耗"}
                    </Badge>
                    <span className="text-slate-500">{l.note}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`num font-medium ${l.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {l.amount > 0 ? "+" : ""}{l.amount.toLocaleString()}
                    </span>
                    <span className="num text-slate-400">余 {l.balanceAfter.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
