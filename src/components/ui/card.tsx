import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative overflow-hidden transition-shadow duration-300 ease-[var(--ease-out-soft)]",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl border border-slate-200/70 bg-white shadow-[var(--shadow-xs)] dark:border-slate-800 dark:bg-slate-900",
        elevated:
          "rounded-2xl bg-white shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] dark:bg-slate-900",
        glass:
          "rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[var(--shadow-sm)] dark:border-slate-800/60 dark:bg-slate-900/60",
        flat: "rounded-2xl bg-slate-50 dark:bg-slate-900/40",
        outline: "rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800",
        gradient:
          "rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:border-indigo-900/60 dark:from-indigo-950 dark:via-slate-900 dark:to-violet-950",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "",
        lg: "p-8",
      },
    },
    defaultVariants: { variant: "default", padding: "default" },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6 pb-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm leading-relaxed text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 p-6 pt-0", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";
