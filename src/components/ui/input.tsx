"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────
   Base Input
   ────────────────────────────────────────────────────────────────── */

const inputVariants = cva(
  [
    "flex w-full text-sm transition-all duration-200 ease-[var(--ease-out-soft)]",
    "placeholder:text-slate-400/80",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "dark:placeholder:text-slate-500/80",
    "focus-visible:outline-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "rounded-xl border border-slate-200 bg-white/80",
          "shadow-[inset_0_1px_2px_rgb(15_23_42/_0.03)]",
          "hover:border-slate-300",
          "focus-visible:border-indigo-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-indigo-500/15 focus-visible:shadow-[0_0_0_4px_rgb(99_102_241/_0.12)]",
          "dark:border-slate-700 dark:bg-slate-900/60 dark:focus-visible:border-indigo-400 dark:focus-visible:bg-slate-900",
        ].join(" "),
        ghost:
          "rounded-md border-0 bg-transparent focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800",
      },
      sizing: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-3.5",
        lg: "h-11 px-4",
        xl: "h-12 px-4 text-base",
      },
      state: {
        default: "",
        error:
          "border-rose-300 bg-rose-50/30 focus-visible:border-rose-400 focus-visible:ring-rose-500/15 dark:border-rose-900 dark:bg-rose-950/30",
        success:
          "border-emerald-300 bg-emerald-50/30 focus-visible:border-emerald-400 focus-visible:ring-emerald-500/15 dark:border-emerald-900 dark:bg-emerald-950/30",
      },
    },
    defaultVariants: { variant: "default", sizing: "default", state: "default" },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** 显示在 input 上方的 label */
  label?: string;
  /** 必填标记 */
  required?: boolean;
  /** input 左侧图标 */
  leftIcon?: React.ReactNode;
  /** input 右侧图标 / 按钮 */
  rightIcon?: React.ReactNode;
  /** 灰底辅助文字（提示如何填） */
  hint?: React.ReactNode;
  /** 红色错误提示，传入即视为错误态 */
  error?: string;
  /** 绿色成功提示 */
  success?: string;
  /** 显示「N / max」字数计数 */
  showCount?: boolean;
  /** 当 value 非空显示清空按钮（受控时） */
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant,
      sizing,
      state,
      label,
      required,
      leftIcon,
      rightIcon,
      hint,
      error,
      success,
      showCount,
      clearable,
      onClear,
      id,
      maxLength,
      value,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? React.useId();
    const computedState = error ? "error" : success ? "success" : state;
    const valueStr = typeof value === "string" ? value : value != null ? String(value) : "";
    const hasValue = valueStr.length > 0;
    const charCount = valueStr.length;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            value={value}
            maxLength={maxLength}
            className={cn(
              inputVariants({ variant, sizing, state: computedState }),
              leftIcon && "pl-9",
              (rightIcon || (clearable && hasValue)) && "pr-9",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {!rightIcon && clearable && hasValue && (
            <button
              type="button"
              onClick={onClear}
              aria-label="清空"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {error ? (
              <p id={`${inputId}-err`} className="flex items-start gap-1 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                {error}
              </p>
            ) : success ? (
              <p className="flex items-start gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0" />
                {success}
              </p>
            ) : hint ? (
              <p id={`${inputId}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
                {hint}
              </p>
            ) : null}
          </div>
          {showCount && maxLength != null && (
            <div className="num flex-shrink-0 text-xs text-slate-400">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  },
);
Input.displayName = "Input";

/* ──────────────────────────────────────────────────────────────────
   Textarea
   ────────────────────────────────────────────────────────────────── */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  showCount?: boolean;
  /** 自动按内容增高 */
  autoGrow?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      required,
      hint,
      error,
      showCount,
      autoGrow,
      id,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? React.useId();
    const valueStr = typeof value === "string" ? value : value != null ? String(value) : "";
    const charCount = valueStr.length;
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current!);

    React.useEffect(() => {
      if (!autoGrow || !innerRef.current) return;
      const el = innerRef.current;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 600) + "px";
    }, [value, autoGrow]);

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={innerRef}
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          className={cn(
            "flex w-full min-h-[80px] resize-y rounded-xl border bg-white/80 px-3.5 py-2.5 text-sm",
            "transition-all duration-200 ease-[var(--ease-out-soft)]",
            "placeholder:text-slate-400/80",
            "shadow-[inset_0_1px_2px_rgb(15_23_42/_0.03)]",
            "hover:border-slate-300",
            "focus-visible:outline-none focus-visible:border-indigo-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-indigo-500/15",
            "disabled:opacity-50",
            "dark:border-slate-700 dark:bg-slate-900/60 dark:placeholder:text-slate-500/80 dark:focus-visible:bg-slate-900",
            error
              ? "border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-500/15"
              : "border-slate-200",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {error ? (
              <p className="flex items-start gap-1 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                {error}
              </p>
            ) : hint ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
            ) : null}
          </div>
          {showCount && (
            <div className="num flex-shrink-0 text-xs text-slate-400">
              {maxLength != null ? `${charCount}/${maxLength}` : charCount}
            </div>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
