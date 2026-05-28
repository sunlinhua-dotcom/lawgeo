import * as React from "react";
import { cn } from "@/lib/utils";

/** Dashboard 子页通用「卡片式 section」 with Apple-style heading. */
export function DashSection({
  title,
  description,
  action,
  children,
  className,
  inset = false,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** 不要外层卡片，仅作分组 */
  inset?: boolean;
}) {
  const body = (
    <>
      {(title || description || action) && (
        <header className={cn("flex items-start justify-between gap-3", inset ? "mb-4" : "px-6 pt-6")}>
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      <div className={inset ? "" : "p-6"}>{children}</div>
    </>
  );

  if (inset) return <section className={cn(className)}>{body}</section>;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white shadow-[var(--shadow-xs)] dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      {body}
    </section>
  );
}

/** Dashboard 子页页头 */
export function DashHeader({
  title,
  description,
  breadcrumb,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8", className)}>
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}
