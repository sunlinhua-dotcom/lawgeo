export type CheckStatus = "pass" | "warn" | "fail";

export interface AuditCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
}

export interface AuditResult {
  domain: string;
  url: string;
  score: number;
  verdict: string;
  summary: string;
  checks: AuditCheck[];
  suggestions: string[];
  scannedAt: string;
  elapsedMs: number;
  meta: {
    title?: string;
    description?: string;
    titleLength?: number;
    descLength?: number;
    hasH1: boolean;
    h1Count: number;
    wordCount: number;
    lang?: string;
    favicon?: boolean;
    canonical?: string;
    ogTags: number;
    twitterTags: number;
  };
  schemas: {
    found: string[];
    missing: string[];
  };
  geoSignals: {
    llmsTxt: boolean;
    llmsFullTxt: boolean;
    markdownTwin: boolean;
    aiIndex: boolean;
    aiDiscovery: boolean;
    robotsTxt: boolean;
    sitemap: boolean;
    faqSchema: boolean;
    articleSchema: boolean;
    organizationSchema: boolean;
    firstParaIsAnswer: boolean;
    hasFaqSection: boolean;
    hasTableOfContents: boolean;
  };
}
