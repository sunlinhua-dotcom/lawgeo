import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  /** 主操作 */
  action?: React.ReactNode;
  /** 次要操作 / 提示 */
  secondary?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, secondary, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-slate-800",
        className,
      )}
    >
      {/* Decorative grid */}
      <div className="dotgrid absolute inset-0 opacity-40" />
      <div className="relative max-w-sm">
        {Icon && (
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner ring-1 ring-slate-200/60 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">
            <Icon className="h-6 w-6 text-slate-400" />
          </div>
        )}
        <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {description && (
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
        {(action || secondary) && (
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            {action}
            {secondary}
          </div>
        )}
      </div>
    </div>
  );
}
