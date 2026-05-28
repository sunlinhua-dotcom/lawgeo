import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        primary:
          "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200/60 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900",
        success:
          "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
        warning:
          "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/60 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
        danger:
          "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/60 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
        outline: "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
        solid:
          "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
        gradient:
          "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        default: "px-2 py-0.5 text-[11px]",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "danger" && "bg-rose-500",
            variant === "primary" && "bg-indigo-500",
            (!variant || variant === "default" || variant === "outline") && "bg-slate-400",
            variant === "solid" && "bg-white/80",
          )}
        />
      )}
      {children}
    </span>
  );
}
