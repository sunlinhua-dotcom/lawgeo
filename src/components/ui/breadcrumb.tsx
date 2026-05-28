import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="breadcrumb" className={cn("flex items-center text-xs", className)}>
      <Link
        href="/"
        className="flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <Home className="h-3 w-3" />
      </Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <ChevronRight className="mx-1.5 h-3 w-3 text-slate-300 dark:text-slate-700" />
          {it.href && i < items.length - 1 ? (
            <Link href={it.href} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-900 dark:text-slate-100">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
