import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function PageHero({
  badge,
  title,
  description,
  children,
}: {
  badge?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-900">
      <div className="dotgrid absolute inset-0 opacity-50" />
      <div className="absolute inset-x-0 -top-40 z-0 h-[300px] bg-gradient-to-b from-indigo-100/40 via-violet-50/20 to-transparent dark:from-indigo-950/20 dark:via-violet-950/10" />
      <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-12 lg:px-8 lg:pt-28">
        {badge && (
          <div className="mb-4 flex justify-center">
            <Badge variant="primary">{badge}</Badge>
          </div>
        )}
        <h1 className="mx-auto max-w-3xl text-center text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
        {children && <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">{children}</div>}
      </div>
    </section>
  );
}
