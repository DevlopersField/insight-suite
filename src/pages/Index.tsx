import { useState, useEffect, useCallback } from "react";
import { Search, Globe, FileText, Code2, Share2, Wrench, Type, ChevronRight, Shield, Loader2, AlertCircle, Download, FileJson, Image as ImageIcon, ExternalLink, Maximize2, Terminal } from "lucide-react";
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
import { LandingPage } from "@/components/LandingPage";
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
  const { data, isLoading, error, isExtension, currentUrl, analyze, analyzeHTML } = usePageAnalysis();
  const [urlInput, setUrlInput] = useState("");

  const isFullView = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has("tabId");
  const isWebMode = !isExtension;

  const [hasStartedAudit, setHasStartedAudit] = useState(false);

  useEffect(() => {
    if (isExtension) {
      analyze();
    }
  }, [isExtension, analyze]);

  useEffect(() => {
    if (currentUrl) setUrlInput(currentUrl);
  }, [currentUrl]);

  const securityPass = data ? data.security.filter((s) => s.status === "pass").length : 0;
  const securityTotal = data ? data.security.length : 0;

  const missingAltCount = data ? data.images.filter(img => !img.alt.trim()).length : 0;
  const h1Count = data ? data.headers.filter(h => h.tag === "H1").length : 0;
  const hasSkippedLevels = data ? data.headers.some((h, i) => {
    if (i === 0) return false;
    const prevText = data.headers[i - 1].tag.replace("H", "");
    const currText = h.tag.replace("H", "");
    const prev = parseInt(prevText);
    const curr = parseInt(currText);
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

  const handleAnalyze = (url?: string) => {
    setHasStartedAudit(true);
    analyze(url || urlInput);
  };

  const handleAnalyzeHTML = (html: string, url: string) => {
    setHasStartedAudit(true);
    analyzeHTML(html, url);
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

  if (isWebMode && !data && !isLoading && !hasStartedAudit) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <LandingPage
          onAnalyze={handleAnalyze}
          onAnalyzeHTML={handleAnalyzeHTML}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${!isFullView && isExtension ? 'extension-popup' : ''} ${isFullView ? 'is-full-view' : ''}`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
        <div className={`${isFullView || isWebMode ? 'max-w-[1200px]' : 'max-w-5xl'} mx-auto px-4 py-2.5`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => isWebMode && setHasStartedAudit(false)}>
              <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors p-1.5">
                <img src="/icons/icon.svg" alt="AuditLens Logo" className="w-full h-full object-contain" />
              </div>
              <div className="shrink-0">
                <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none mb-0.5">AuditLens</h1>
                <p className="text-[10px] text-muted-foreground leading-none">Professional Audit Companion</p>
              </div>
            </div>

            {/* URL Input - Compact Inline */}
            <div className="flex-1 max-w-md flex gap-2">
              <div className="relative flex-1 group">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={isExtension ? "URL..." : "Enter URL..."}
                  className="w-full h-8 bg-muted border border-border rounded pl-8 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  readOnly={isExtension && !isFullView}
                />
              </div>
              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading}
                className="h-8 bg-primary text-primary-foreground px-3 rounded text-xs font-medium hover:bg-primary/90 transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-sm"
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
              {isWebMode && (
                <button
                  onClick={() => window.open("#", "_blank")}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  Install Extension
                </button>
              )}
              <div className="flex items-center gap-1.5 border-l border-border pl-2">
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
              </div>
              <div className="text-[10px] font-mono whitespace-nowrap hidden sm:block opacity-40">
                v1.0.3
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 py-4 animate-in fade-in slide-in-from-top-2">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-destructive">Analysis Failed</p>
              <p className="text-[11px] text-destructive/80 leading-relaxed">{error}</p>
            </div>
          </div>
          {isWebMode && (
            <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border text-center space-y-3">
              <p className="text-xs text-muted-foreground">Try pasting the HTML source code if automated fetching is blocked.</p>
              <button onClick={() => setHasStartedAudit(false)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">Start Manual Audit</button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={`${isFullView || isWebMode ? 'max-w-[1200px]' : 'max-w-5xl'} mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500`}>
          <div className="flex flex-wrap gap-4 justify-between">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-24 rounded-full" />
            ))}
          </div>

          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-2 border-b border-border pb-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-80 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !isLoading && (
        <div className={`${isFullView || isWebMode ? 'max-w-[1200px]' : 'max-w-5xl'} mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
          {isWebMode && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Audit Report</h2>
                <p className="text-sm text-muted-foreground font-mono truncate max-w-md">{data.url}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          )}

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
            {[
              { label: "Title", value: `${data.titleLength}ch`, color: data.titleLength > 60 ? "text-warning" : "text-success" },
              { label: "Desc", value: `${data.descriptionLength}ch`, color: data.descriptionLength >= 150 && data.descriptionLength <= 160 ? "text-success" : "text-warning" },
              { label: "H1s", value: h1Count, color: h1Count === 1 ? "text-success" : "text-destructive" },
              { label: "Images", value: data.images.length, color: "text-foreground" },
              { label: "Links", value: data.links.length, color: "text-foreground" },
              { label: "Security", value: `${securityPass}/${securityTotal}`, color: securityPass === securityTotal ? "text-success" : "text-warning" },
              { label: "Tech", value: data.tech.length, color: "text-foreground" },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">{stat.label}</span>
                <span className={`text-sm font-mono font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-6 border-b border-border sticky top-14 bg-background/80 backdrop-blur-md z-10 py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasHeadersIssue = tab.id === "headers" && headerIssueCount > 0;
              const hasImagesIssue = tab.id === "images" && missingAltCount > 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {hasHeadersIssue && (
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  )}
                  {hasImagesIssue && tab.id === "images" && (
                    <span className="bg-destructive text-white text-[9px] px-1.5 rounded-full min-w-[14px] h-3.5 flex items-center justify-center font-bold">
                      {missingAltCount}
                    </span>
                  )}
                  {tab.id === "images-seo" && imageIssueCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  )}
                  {tab.id === "schema" && schemaErrorCount > 0 && (
                    <span className="bg-destructive text-white text-[9px] px-1.5 rounded-full min-w-[14px] h-3.5 flex items-center justify-center font-bold">
                      {schemaErrorCount}
                    </span>
                  )}
                  {tab.id === "links" && brokenLinkCount > 0 && (
                    <span className="bg-destructive text-white text-[9px] px-1.5 rounded-full min-w-[14px] h-3.5 flex items-center justify-center font-bold">
                      {brokenLinkCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="pb-12 min-h-[400px]">
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

      {/* Initial State */}
      {!data && !isLoading && !error && isExtension && !isFullView && (
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center animate-in fade-in duration-1000">
          <div className="w-24 h-24 rounded-2xl bg-primary/5 flex items-center justify-center shadow-inner p-4">
            <img src="/icons/icon.svg" alt="AuditLens Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Analyze Any Website</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              AuditLens is ready. Click <strong>Analyze</strong> to scan this page for SEO issues, detect technologies, and audit security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
