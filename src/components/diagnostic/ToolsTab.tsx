import { ExternalLink } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  url: string;
  category: string;
}

const tools: Tool[] = [
  { name: "PageSpeed Insights", description: "Performance & Core Web Vitals", url: "https://pagespeed.web.dev/", category: "Performance" },
  { name: "GTmetrix", description: "Page speed analysis", url: "https://gtmetrix.com/", category: "Performance" },
  { name: "W3C Validator", description: "HTML markup validation", url: "https://validator.w3.org/", category: "Validation" },
  { name: "CSS Validator", description: "CSS stylesheet validation", url: "https://jigsaw.w3.org/css-validator/", category: "Validation" },
  { name: "Rich Results Test", description: "Structured data validation", url: "https://search.google.com/test/rich-results", category: "SEO" },
  { name: "Mobile-Friendly Test", description: "Mobile rendering check", url: "https://search.google.com/test/mobile-friendly", category: "SEO" },
  { name: "Security Headers", description: "HTTP security analysis", url: "https://securityheaders.com/", category: "Security" },
  { name: "SSL Labs", description: "SSL/TLS configuration", url: "https://www.ssllabs.com/ssltest/", category: "Security" },
  { name: "Lighthouse", description: "Full audit via Chrome DevTools", url: "https://developer.chrome.com/docs/lighthouse/", category: "Performance" },
];

export const ToolsTab = () => {
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tools.filter(t => t.category === cat).map(tool => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card rounded border border-border p-3 flex items-center gap-3 hover:border-primary/50 hover:bg-accent/50 transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
