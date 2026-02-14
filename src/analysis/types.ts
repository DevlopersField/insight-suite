// ─── Font Information ────────────────────────────────────────────────
export interface FontInfo {
  family: string;
  source: "google" | "typekit" | "custom" | "system";
  weights: string[];
  styles: string[];
  url: string | null;       // Specimen link (e.g. Google Fonts page)
  cssUrl: string | null;    // The <link> or @import URL that loads the font
}

// ─── Technology Detection ────────────────────────────────────────────
export interface TechInfo {
  name: string;
  category: string;
  confidence: number;
  icon: string;
}

// ─── Security Header Audit ───────────────────────────────────────────
export interface SecurityHeaderResult {
  header: string;
  value: string | null;
  status: "pass" | "warn" | "fail";
  recommendation: string;
}

// ─── Video Data ─────────────────────────────────────────────────────
export interface VideoData {
  type: "youtube" | "vimeo" | "other";
  id: string;
  url: string;
  hasSchema: boolean;
}

// ─── Schema Markup ───────────────────────────────────────────────────
export interface SchemaInfo {
  type: string;
  data: any;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Social / OG Tags ───────────────────────────────────────────────
export interface SocialData {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
}

// ─── Page Header (H1–H6) ────────────────────────────────────────────
export interface HeaderInfo {
  tag: string;
  text: string;
  order: number;
}

// ─── Image Info ──────────────────────────────────────────────────────
export interface ImageInfo {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  type: string;
}

// ─── Link Info ───────────────────────────────────────────────────────
export interface LinkInfo {
  href: string;
  text: string;
  rel: string;
  isExternal: boolean;
  status?: number;
  statusText?: string;
  isBroken?: boolean;
}

// ─── Full Audit Data (returned by the analysis engine) ───────────────
export interface AuditData {
  url: string;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  author: string;
  language: string;
  charset: string;
  viewport: string;
  headers: HeaderInfo[];
  images: ImageInfo[];
  links: LinkInfo[];
  social: SocialData;
  tech: TechInfo[];
  security: SecurityHeaderResult[];
  fonts: FontInfo[];
  videos: VideoData[];
  schemas: SchemaInfo[];
}

// ─── DOM Scan Result (subset returned by content script) ─────────────
export interface DomScanResult {
  url: string;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  author: string;
  language: string;
  charset: string;
  viewport: string;
  headers: HeaderInfo[];
  images: ImageInfo[];
  links: LinkInfo[];
  social: SocialData;
  tech: TechInfo[];
  fonts: FontInfo[];
  videos: VideoData[];
  schemas: SchemaInfo[];
}

// ─── Chrome Extension Messaging ──────────────────────────────────────
export type MessageType = "ANALYZE_PAGE" | "ANALYSIS_RESULT" | "ANALYSIS_ERROR";

export interface AnalyzePageMessage {
  type: "ANALYZE_PAGE";
  tabId?: number;
}

export interface AnalysisResultMessage {
  type: "ANALYSIS_RESULT";
  data: AuditData;
}

export interface AnalysisErrorMessage {
  type: "ANALYSIS_ERROR";
  error: string;
}

export type ExtensionMessage =
  | AnalyzePageMessage
  | AnalysisResultMessage
  | AnalysisErrorMessage;
