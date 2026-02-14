import { useState, useEffect } from "react";
import { Search, Globe, FileText, Code2, Share2, Wrench, Type, ChevronRight, Shield, Loader2, AlertCircle, Download } from "lucide-react";
import { usePageAnalysis } from "@/hooks/use-page-analysis";
import { SummaryTab } from "@/components/diagnostic/SummaryTab";
import { HeadersTab } from "@/components/diagnostic/HeadersTab";
import { DevCheckTab } from "@/components/diagnostic/DevCheckTab";
import { SocialTab } from "@/components/diagnostic/SocialTab";
import { ToolsTab } from "@/components/diagnostic/ToolsTab";
import { FontsTab } from "@/components/diagnostic/FontsTab";

const tabs = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "headers", label: "Headers", icon: ChevronRight },
  { id: "devcheck", label: "Dev Check", icon: Code2 },
  { id: "fonts", label: "Fonts", icon: Type },
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

  const handleAnalyze = () => {
    analyze(urlInput);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-primary/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">Dev & SEO Insight Suite</h1>
              <p className="text-xs text-muted-foreground">On-page diagnostics • Tech detection • Font analysis • Security audit</p>
            </div>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={isExtension ? "Current tab URL..." : "Enter URL to analyze..."}
                className="w-full bg-muted border border-border rounded pl-9 pr-4 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                readOnly={isExtension}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {/* Extension mode badge */}
          {!isExtension && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              <span>Website mode — analyzing current page. Install the Chrome Extension for full analysis on any site.</span>
            </div>
          )}
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="bg-destructive/10 border border-destructive/30 rounded p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Scanning page...</p>
        </div>
      )}

      {/* Results */}
      {data && !isLoading && (
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Quick Stats Bar */}
          <div className="flex gap-4 mb-4 text-xs font-mono text-muted-foreground overflow-x-auto pb-1">
            <span>Title: <span className={data.titleLength > 60 ? "text-warning" : "text-success"}>{data.titleLength}ch</span></span>
            <span>Desc: <span className={data.descriptionLength >= 150 && data.descriptionLength <= 160 ? "text-success" : "text-warning"}>{data.descriptionLength}ch</span></span>
            <span>H1: <span className="text-success">{data.headers.filter((h) => h.tag === "H1").length}</span></span>
            <span>Images: <span className="text-foreground">{data.images.length}</span></span>
            <span>Links: <span className="text-foreground">{data.links.length}</span></span>
            <span>Security: <span className={securityPass === securityTotal ? "text-success" : "text-warning"}>{securityPass}/{securityTotal}</span></span>
            <span>Tech: <span className="text-foreground">{data.tech.length} detected</span></span>
            <span>Fonts: <span className="text-foreground">{data.fonts.length}</span></span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            {activeTab === "summary" && <SummaryTab data={data} />}
            {activeTab === "headers" && <HeadersTab data={data} />}
            {activeTab === "devcheck" && <DevCheckTab data={data} />}
            {activeTab === "fonts" && <FontsTab fonts={data.fonts} />}
            {activeTab === "social" && <SocialTab data={data} />}
            {activeTab === "tools" && <ToolsTab />}
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
