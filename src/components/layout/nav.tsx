"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Scale,
  Search,
  Command,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";

export function Nav({ user }: { user: { email: string } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac/.test(navigator.platform));
    }
  }, []);

  function openCommand() {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      ctrlKey: !isMac,
    });
    document.dispatchEvent(event);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <Scale className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">lawGEO</span>
          <span className="hidden text-xs text-slate-500 sm:inline-block">律所 GEO 平台</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {siteConfig.nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            if ("highlight" in item && item.highlight) {
              return (
                <Button key={item.href} asChild size="sm" variant="primary" className="ml-2">
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {active && <span className="absolute inset-0 rounded-lg bg-slate-100" />}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={openCommand}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/60 px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label="打开搜索菜单"
          >
            <Search className="h-3 w-3" />
            <span>搜索</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1 py-px text-[10px] font-mono text-slate-500 sm:inline-flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {user ? (
            <UserMenu email={user.email} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild size="sm" variant="primary">
                <Link href="/contact">预约诊断</Link>
              </Button>
            </>
          )}
        </div>

        <button
          aria-label="菜单"
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white p-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/dashboard">进入控制台</Link>
                  </Button>
                  <form action="/api/auth/logout" method="POST" className="flex-1">
                    <Button type="submit" variant="ghost" size="sm" className="w-full">
                      退出
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/login">登录</Link>
                  </Button>
                  <Button asChild variant="primary" size="sm" className="flex-1">
                    <Link href="/contact">预约诊断</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const initial = email.charAt(0).toUpperCase();
  const shortName = email.split("@")[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <>
      <Button asChild size="sm" variant="primary">
        <Link href="/dashboard">
          <LayoutDashboard className="mr-1 h-3.5 w-3.5" /> 进入控制台
        </Link>
      </Button>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/60 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="用户菜单"
        >
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-semibold text-white">
            {initial}
          </span>
          <span className="max-w-[6rem] truncate">{shortName}</span>
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">已登录</div>
              <div className="mt-0.5 truncate text-sm font-medium text-slate-900">{email}</div>
            </div>
            <div className="p-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> 控制台概览
              </Link>
              <Link
                href="/dashboard/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
              >
                套餐 / 用量
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" /> 退出账户
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
