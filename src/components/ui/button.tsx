"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
    "font-medium tracking-tight",
    "ring-focus press select-none",
    "transition-[background,box-shadow,color] duration-200 ease-[var(--ease-out-soft)]",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-800 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
        primary:
          "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_1px_0_rgb(255_255_255/_0.15)_inset,0_4px_10px_-2px_rgb(79_70_229/_0.5)] hover:from-indigo-400 hover:to-indigo-500 hover:shadow-[0_1px_0_rgb(255_255_255/_0.2)_inset,0_6px_14px_-2px_rgb(79_70_229/_0.55)]",
        outline:
          "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[var(--shadow-xs)] dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-800",
        ghost:
          "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
        link: "text-indigo-600 underline-offset-4 hover:underline px-0 dark:text-indigo-400",
        destructive:
          "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_4px_10px_-2px_rgb(225_29_72/_0.5)] hover:from-rose-400 hover:to-rose-500",
        soft:
          "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-4 text-sm rounded-xl",
        lg: "h-11 px-5 text-sm rounded-xl",
        xl: "h-12 px-6 text-base font-semibold rounded-2xl",
        icon: "h-9 w-9 rounded-lg",
        "icon-sm": "h-7 w-7 rounded-md",
        "icon-lg": "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        <span className="flex items-center gap-1.5">
          {loading && loadingText ? loadingText : children}
        </span>
        {!loading && rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
      </>
    );

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={loading ? true : undefined}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
