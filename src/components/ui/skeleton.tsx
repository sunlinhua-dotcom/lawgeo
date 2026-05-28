import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
      <Skeleton className="h-5 w-1/3" />
      <SkeletonText lines={3} className="mt-4" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
  );
}
