export const AI_BOT_USER_AGENT_RE =
  /GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Google-Extended|GoogleOther|Bytespider|Applebot|OAI-SearchBot|CCBot/i;

export function normalizeRoutePath(path: string): string {
  const clean = path.split("?")[0]?.split("#")[0] ?? "/";
  if (!clean || clean === "/" || clean === "/index") return "/";
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

export function markdownPathForRoute(path: string): string {
  const normalized = normalizeRoutePath(path);
  return normalized === "/" ? "/index.md" : `${normalized}.md`;
}

export function routePathFromMarkdownSegments(segments: string[]): string {
  const joined = segments.join("/").replace(/\.md$/, "");
  if (!joined || joined === "index") return "/";
  return normalizeRoutePath(`/${joined}`);
}

export function shouldExposeMarkdown(path: string): boolean {
  const normalized = normalizeRoutePath(path);
  if (
    normalized.startsWith("/api") ||
    normalized.startsWith("/dashboard") ||
    normalized.startsWith("/login") ||
    normalized.startsWith("/r/") ||
    normalized.startsWith("/md") ||
    normalized === "/robots.txt" ||
    normalized === "/sitemap.xml" ||
    normalized === "/llms.txt" ||
    normalized === "/llms-full.txt" ||
    normalized === "/ai-index.json"
  ) {
    return false;
  }
  return !/\.(?:png|jpe?g|gif|svg|webp|ico|css|js|map|xml|txt|json|pdf|zip)$/i.test(normalized);
}
