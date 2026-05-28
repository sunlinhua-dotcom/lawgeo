"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface StepDef {
  id: string;
  title: string;
  description?: string;
  /** 是否可以下一步：返回 true 才允许进入下一步。若返回字符串视作错误信息。 */
  canProceed?: () => boolean | string;
}

interface StepFlowProps {
  steps: StepDef[];
  /** 当前步索引（受控） */
  current: number;
  onCurrentChange: (next: number) => void;
  children: React.ReactNode | React.ReactNode[];
  /** 全部完成时回调 */
  onFinish?: () => void;
  /** 取消整个流程 */
  onCancel?: () => void;
  /** 最后一步按钮文案 */
  finishLabel?: string;
  /** 是否禁用底部按钮（如最后一步在异步处理中） */
  busy?: boolean;
  /** 顶部进度条 ARIA label */
  ariaLabel?: string;
}

/**
 * 苹果风格多步骤向导。
 * - 顶部步骤指示器
 * - 内容区淡入 / 滑动切换
 * - 底部「上一步 / 下一步 / 完成」固定按钮区
 * - 键盘 ←/→ 切换
 */
export function StepFlow({
  steps,
  current,
  onCurrentChange,
  children,
  onFinish,
  onCancel,
  finishLabel = "完成",
  busy = false,
  ariaLabel = "操作向导",
}: StepFlowProps) {
  const safeCurrent = Math.max(0, Math.min(current, steps.length - 1));
  const childArr = React.Children.toArray(children);
  const currentChild = childArr[safeCurrent];
  const isLast = safeCurrent === steps.length - 1;
  const isFirst = safeCurrent === 0;

  const [error, setError] = React.useState<string | null>(null);

  function next() {
    setError(null);
    const can = steps[safeCurrent].canProceed?.();
    if (can === false) {
      setError("请先完成当前步骤");
      return;
    }
    if (typeof can === "string") {
      setError(can);
      return;
    }
    if (isLast) {
      onFinish?.();
    } else {
      onCurrentChange(safeCurrent + 1);
    }
  }
  function prev() {
    setError(null);
    if (!isFirst) onCurrentChange(safeCurrent - 1);
  }

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeCurrent]);

  return (
    <div className="relative" role="region" aria-label={ariaLabel}>
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-1.5 overflow-x-auto pb-1">
        {steps.map((s, i) => {
          const done = i < safeCurrent;
          const active = i === safeCurrent;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => done && onCurrentChange(i)}
                disabled={!done}
                className={cn(
                  "flex flex-1 items-center gap-2.5 rounded-2xl px-3 py-2 transition-all",
                  done && "hover:bg-slate-50 cursor-pointer dark:hover:bg-slate-800",
                  active && "bg-indigo-50/70 dark:bg-indigo-950/40",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-xs font-semibold transition-all",
                    done && "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30",
                    active && "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900",
                    !done && !active && "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div
                    className={cn(
                      "truncate text-xs font-medium",
                      active && "text-slate-900 dark:text-slate-100",
                      done && "text-slate-600 dark:text-slate-300",
                      !active && !done && "text-slate-400",
                    )}
                  >
                    {s.title}
                  </div>
                  {s.description && (active || done) && (
                    <div className="truncate text-[10px] text-slate-500">{s.description}</div>
                  )}
                </div>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    done ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-slate-200 dark:bg-slate-800",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step content with animation */}
      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeCurrent}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentChild}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} leftIcon={<X className="h-3.5 w-3.5" />}>
              取消
            </Button>
          )}
          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={prev}
            disabled={isFirst || busy}
            leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
          >
            上一步
          </Button>
          <Button
            variant="primary"
            onClick={next}
            loading={busy}
            rightIcon={!isLast ? <ChevronRight className="h-3.5 w-3.5" /> : undefined}
          >
            {isLast ? finishLabel : "下一步"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 单个步骤面板的容器 */
export function StepPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
