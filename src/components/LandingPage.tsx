import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Globe, Code2, Type, Share2, Wrench, ChevronRight, Layout, Zap, CheckCircle2, ArrowRight, Download, FileText, ExternalLink, Terminal } from "lucide-react";

interface LandingPageProps {
  onAnalyze: (url?: string) => void;
  onAnalyzeHTML: (html: string, url: string) => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  isLoading: boolean;
}

export const LandingPage = ({ onAnalyze, onAnalyzeHTML, urlInput, setUrlInput, isLoading }: LandingPageProps) => {
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [htmlCode, setHtmlCode] = useState("");

  const handleAnalyzeClick = () => {
    if (mode === "url") {
      onAnalyze(urlInput);
    } else {
      onAnalyzeHTML(htmlCode, urlInput || "https://manual-audit.local");
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <Zap className="w-3 h-3" />
            <span>Introducing AuditLens v1.0.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            The Professional <span className="text-primary">SEO & Web Audit</span> Companion
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            Analyze any website for SEO issues, detect technologies, inspect fonts, and audit security headers. Fast, thorough, and ready for your next project.
          </p>

          <div className="flex flex-col items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            {/* Mode Switcher */}
            <div className="flex p-1 bg-muted rounded-xl border border-border w-fit">
              <button
                onClick={() => setMode("url")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Globe className="w-4 h-4" />
                Analyze URL
              </button>
              <button
                onClick={() => setMode("paste")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "paste" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Terminal className="w-4 h-4" />
                Paste Source
              </button>
            </div>

            <div className="w-full max-w-2xl space-y-4">
              {mode === "url" ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Enter website URL (e.g. google.com)"
                      className="w-full h-12 bg-card border border-border rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm group-hover:border-border/80"
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyzeClick()}
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isLoading || !urlInput.trim()}
                    className="w-full sm:w-auto h-12 bg-primary text-primary-foreground px-8 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Layout className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Analyze
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative group">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Context URL (optional, for relative links)"
                      className="w-full h-10 bg-card border border-border rounded-lg pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="relative">
                    <textarea
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      placeholder="Paste <html> source code here..."
                      className="w-full h-48 bg-card border border-border rounded-lg p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isLoading || !htmlCode.trim()}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Layout className="w-4 h-4 animate-spin" />
                    ) : (
                      <Code2 className="w-4 h-4" />
                    )}
                    Perform Direct Audit
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {mode === "url"
                ? "We use a CORS proxy to fetch the page content. Some sites may block this access."
                : "Perfect for local files or sites protected by firewall/CORS."}
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to audit</h2>
            <p className="text-muted-foreground max-w-md mx-auto">A comprehensive suite of tools designed for developers and SEO specialists.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "On-Page SEO", desc: "Check titles, descriptions, and header hierarchy in seconds.", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Code2, title: "Tech Detection", desc: "Identify frameworks, CMS, analytics, and more behind any site.", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Type, title: "Font Analysis", desc: "Analyze typography, weights, and styles used on the page.", color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: Shield, title: "Security Audit", desc: "Check for essential security headers like CSP and HSTS.", color: "text-green-500", bg: "bg-green-500/10" },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extension Promo */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto p-8 md:p-12 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2 transform transition-transform" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3" />
                <span>Better with Extension</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">Install AuditLens Extension for the full experience</h2>
              <ul className="space-y-4 text-primary-foreground/90">
                {[
                  "Real-time analysis as you browse",
                  "Private scanning without server requests",
                  "Deeper link and image crawling",
                  "Direct access from your browser bar"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white/50 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="h-12 bg-white text-primary px-6 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg">
                  <Download className="w-4 h-4" />
                  Add to Chrome
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="aspect-video bg-black/20 rounded-2xl border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-inner group transition-transform hover:scale-105">
                <div className="text-center p-8">
                  <Layout className="w-20 h-20 mx-auto text-white/20 mb-4" />
                  <p className="text-white/40 text-sm font-medium">Interactive Demo Interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight leading-none mb-1">AuditLens</h1>
              <p className="text-xs text-muted-foreground leading-none">Built for modern web developers</p>
            </div>
          </div>

          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
            <a href="https://github.com/DevlopersField/insight-suite" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Documentation</a>
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AuditLens. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
