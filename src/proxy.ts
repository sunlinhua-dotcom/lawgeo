import { NextResponse, type NextRequest } from "next/server";
import {
  AI_BOT_USER_AGENT_RE,
  markdownPathForRoute,
  normalizeRoutePath,
  shouldExposeMarkdown,
} from "@/lib/geo-paths";

function markdownRewritePath(pathname: string) {
  if (pathname === "/index.md") return "/md/index";
  return `/md${pathname.replace(/\.md$/, "")}`;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalized = normalizeRoutePath(pathname);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  if (pathname.endsWith(".md")) {
    const url = request.nextUrl.clone();
    url.pathname = markdownRewritePath(pathname);
    return NextResponse.rewrite(url);
  }

  if (!shouldExposeMarkdown(normalized)) {
    return NextResponse.next();
  }

  const accept = request.headers.get("accept") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  if (accept.includes("text/markdown") || AI_BOT_USER_AGENT_RE.test(userAgent)) {
    const url = request.nextUrl.clone();
    url.pathname = markdownRewritePath(markdownPathForRoute(normalized));
    return NextResponse.rewrite(url);
  }

  const response = NextResponse.next();
  response.headers.set(
    "Link",
    `<${new URL(markdownPathForRoute(normalized), request.url).toString()}>; rel="alternate"; type="text/markdown"`,
  );
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
