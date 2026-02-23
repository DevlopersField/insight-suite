import { useState, useEffect, useCallback } from "react";
import { Search, Globe, FileText, Code2, Share2, Wrench, Type, ChevronRight, Shield, Loader2, AlertCircle, Download, FileJson, Image as ImageIcon, ExternalLink, Maximize2 } from "lucide-react";
import { usePageAnalysis } from "@/hooks/use-page-analysis";
import { SummaryTab } from "@/components/diagnostic/SummaryTab";
import { HeadersTab } from "@/components/diagnostic/HeadersTab";
import { DevCheckTab } from "@/components/diagnostic/DevCheckTab";
import { SocialTab } from "@/components/diagnostic/SocialTab";
import { ToolsTab } from "@/components/diagnostic/ToolsTab";
import { FontsTab } from "@/components/diagnostic/FontsTab";
import { ImagesTab } from "@/components/diagnostic/ImagesTab";
import { SchemaTab } from "@/components/diagnostic/SchemaTab";
import { ImagesSEOTab } from "@/components/diagnostic/ImagesSEOTab";
import { LinksAuditTab } from "@/components/diagnostic/LinksAuditTab";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

const tabs = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "headers", label: "Headers", icon: ChevronRight },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "images-seo", label: "Image SEO", icon: ImageIcon },
  { id: "links", label: "Links", icon: Globe },
  { id: "schema", label: "Schema", icon: FileJson },
  { id: "devcheck", label: "Dev Check", icon: Code2 },
  { id: "social", label: "Social", icon: Share2 },
  { id: "tools", label: "Tools", icon: Wrench },
] as const;

type TabId = typeof tabs[number]["id"];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const { data, isLoading, error, isExtension, currentUrl, analyze } = usePageAnalysis();
  const [urlInput, setUrlInput] = useState("");

  // In extension mode, auto-analyze the current tab on popup open
  useEffect(() => {
    if (isExtension) {
      analyze();
    }
  }, [isExtension]);

  // Sync URL input with detected URL
  useEffect(() => {
    if (currentUrl) setUrlInput(currentUrl);
  }, [currentUrl]);

  const securityPass = data ? data.security.filter((s) => s.status === "pass").length : 0;
  const securityTotal = data ? data.security.length : 0;

  const missingAltCount = data ? data.images.filter(img => !img.alt.trim()).length : 0;
  const h1Count = data ? data.headers.filter(h => h.tag === "H1").length : 0;
  const hasSkippedLevels = data ? data.headers.some((h, i) => {
    if (i === 0) return false;
    const prev = parseInt(data.headers[i - 1].tag.replace("H", ""));
    const curr = parseInt(h.tag.replace("H", ""));
    return curr > prev + 1;
  }) : false;
  const headerIssueCount = (h1Count !== 1 ? 1 : 0) + (hasSkippedLevels ? 1 : 0);

  const schemaErrorCount = data ? data.schemas.filter(s => !s.isValid).length : 0;
  const brokenLinkCount = data ? data.links.filter(l => l.isBroken).length : 0;

  const getFileName = (url: string) => {
    try {
      const last = url.split('/').pop() || "image";
      return last.split('?')[0].split('#')[0];
    } catch { return "image"; }
  };
  const poorAltCount = data ? data.images.filter(img => {
    const fn = getFileName(img.src).toLowerCase().split('.')[0];
    return img.alt && (img.alt.toLowerCase().trim() === fn || img.alt.toLowerCase().trim() === getFileName(img.src).toLowerCase());
  }).length : 0;
  const imageIssueCount = missingAltCount + poorAltCount;

  const handleAnalyze = () => {
    analyze(urlInput);
  };

  const handleOpenFullView = async () => {
    if (!isExtension) return;
    try {
      const { getActiveTab } = await import("@/extension/messaging");
      const tab = await getActiveTab();
      if (tab) {
        const fullViewUrl = chrome.runtime.getURL(`index.html?tabId=${tab.tabId}&url=${encodeURIComponent(tab.url)}`);
        chrome.tabs.create({ url: fullViewUrl });
      }
    } catch (err) {
      console.error("Failed to open full view:", err);
    }
  };

  const isFullView = new URLSearchParams(window.location.search).has("tabId");

  return (
    <div className={`min-h-screen bg-background ${!isFullView && isExtension ? 'extension-popup' : ''} ${isFullView ? 'is-full-view' : ''}`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className={`${isFullView ? 'max-w-[1200px]' : 'max-w-5xl'} mx-auto px-4 py-2.5`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-primary/15 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="shrink-0">
                <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none mb-0.5">AuditLens</h1>
                <p className="text-[10px] text-muted-foreground leading-none">Professional Audit Companion</p>
              </div>
            </div>

            {/* URL Input - Compact Inline */}
            <div className="flex-1 max-w-md flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={isExtension ? "URL..." : "Enter URL..."}
                  className="w-full h-8 bg-muted border border-border rounded pl-8 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  readOnly={isExtension && !isFullView}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="h-8 bg-primary text-primary-foreground px-3 rounded text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                {isLoading ? "..." : "Analyze"}
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-border pl-4">
              <ThemeToggle />
              {isExtension && !isFullView && (
                <button
                  onClick={handleOpenFullView}
                  title="Open in Full View"
                  className="w-8 h-8 flex items-center justify-center rounded border border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-primary transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="text-[10px] font-mono whitespace-nowrap hidden sm:block">
                <span className="opacity-40">v</span>1.0.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 py-2">
          <div className="bg-destructive/10 border border-destructive/30 rounded p-2 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={`${isFullView ? 'max-w-[1200px]' : 'max-w-5xl'} mx-auto px-4 py-3 space-y-4`}>
          {/* Skeleton Stats Bar */}
          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-2.5 w-16" />
            ))}
          </div>

          {/* Skeleton Tabs */}
          <div className="flex gap-2 border-b border-border pb-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>

          {/* Skeleton Content */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !isLoading && (
        <div className={`${isFullView ? 'max-w-[1200px]' : 'max-w-5xl'} mx-auto px-4 py-3`}>
          {/* Quick Stats Bar */}
          <div className="flex gap-4 mb-3 text-[10px] font-mono text-muted-foreground overflow-x-auto pb-1 whitespace-nowrap">
            <span>Title: <span className={data.titleLength > 60 ? "text-warning" : "text-success"}>{data.titleLength}ch</span></span>
            <span>Desc: <span className={data.descriptionLength >= 150 && data.descriptionLength <= 160 ? "text-success" : "text-warning"}>{data.descriptionLength}ch</span></span>
            <span>H1: <span className={h1Count === 1 ? "text-success" : "text-destructive"}>{h1Count}</span></span>
            <span>Images: <span className="text-foreground">{data.images.length}</span></span>
            <span>Links: <span className="text-foreground">{data.links.length}</span></span>
            <span>Security: <span className={securityPass === securityTotal ? "text-success" : "text-warning"}>{securityPass}/{securityTotal}</span></span>
            <span>Tech: <span className="text-foreground">{data.tech.length}</span></span>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-4 border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasHeadersIssue = tab.id === "headers" && headerIssueCount > 0;
              const hasImagesIssue = tab.id === "images" && missingAltCount > 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                  {hasHeadersIssue && (
                    <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  )}
                  {hasImagesIssue && tab.id === "images" && (
                    <span className="bg-destructive text-white text-[8px] px-1 rounded-full min-w-[12px] h-3 flex items-center justify-center font-bold">
                      {missingAltCount}
                    </span>
                  )}
                  {tab.id === "images-seo" && imageIssueCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  )}
                  {tab.id === "schema" && schemaErrorCount > 0 && (
                    <span className="bg-destructive text-white text-[8px] px-1 rounded-full min-w-[12px] h-3 flex items-center justify-center font-bold">
                      {schemaErrorCount}
                    </span>
                  )}
                  {tab.id === "links" && brokenLinkCount > 0 && (
                    <span className="bg-destructive text-white text-[8px] px-1 rounded-full min-w-[12px] h-3 flex items-center justify-center font-bold">
                      {brokenLinkCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            {activeTab === "summary" && <SummaryTab data={data} />}
            {activeTab === "headers" && <HeadersTab data={data} />}
            {activeTab === "images" && <ImagesTab data={data} />}
            {activeTab === "images-seo" && <ImagesSEOTab images={data.images} />}
            {activeTab === "links" && <LinksAuditTab links={data.links} />}
            {activeTab === "schema" && <SchemaTab schemas={data.schemas} url={data.url} />}
            {activeTab === "devcheck" && <DevCheckTab data={data} />}
            {activeTab === "social" && <SocialTab data={data} />}
            {activeTab === "tools" && <ToolsTab fonts={data.fonts} />}
          </div>
        </div>
      )}

      {/* Initial State (no data, no loading, no error) */}
      {!data && !isLoading && !error && !isExtension && (
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Analyze Any Website</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Click <strong>Analyze</strong> to scan this page for SEO issues, detect technologies, inspect fonts, and audit security headers.
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
