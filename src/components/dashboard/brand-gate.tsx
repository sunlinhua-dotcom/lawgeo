import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

/** GEO 模块在无品牌时显示的引导（点左上角品牌切换器新建） */
export function BrandGate({ moduleName }: { moduleName: string }) {
  return (
    <div className="px-6 py-8 lg:px-10">
      <EmptyState
        icon={Building2}
        title={`${moduleName} 需要先选择一个品牌`}
        description={
          <>
            GEO 全链路模块都围绕「品牌」运转。点左侧栏顶部的<strong>「当前品牌」</strong>切换器 →
            「新建品牌」，填品牌名 + 官网 + 行业即可开始。
          </>
        }
      />
    </div>
  );
}
