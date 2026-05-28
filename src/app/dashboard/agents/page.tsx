import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AGENTS, PIPELINES } from "@/lib/agents";
import { AgentsConsole } from "@/components/dashboard/agents-console";

export const metadata = { title: "AI Agent 编排", robots: { index: false } };

export default async function AgentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // 序列化给 client 用
  const agentsList = Object.values(AGENTS);
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">AI Agent 编排</h1>
        <p className="mt-1 text-sm text-slate-500">
          15 个数字员工，可单独调用，也可编排成 pipeline 一键跑全链路。
        </p>
      </div>
      <AgentsConsole agents={agentsList} pipelines={PIPELINES} />
    </div>
  );
}
