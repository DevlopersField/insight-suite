import { ExternalLink } from "lucide-react";
import { FontsTab } from "./FontsTab";
import type { FontInfo } from "@/analysis/types";

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
  { name: "Schema.org Validator", description: "Validate structured data markup", url: "https://validator.schema.org/", category: "Validation" },
  { name: "JSON-LD Playground", description: "Test & visualize JSON-LD schemas", url: "https://json-ld.org/playground/", category: "Validation" },
  { name: "Mobile-Friendly Test", description: "Mobile rendering check", url: "https://search.google.com/test/mobile-friendly", category: "SEO" },
  { name: "Security Headers", description: "HTTP security analysis", url: "https://securityheaders.com/", category: "Security" },
  { name: "SSL Labs", description: "SSL/TLS configuration", url: "https://www.ssllabs.com/ssltest/", category: "Security" },
  { name: "Lighthouse", description: "Full audit via Chrome DevTools", url: "https://developer.chrome.com/docs/lighthouse/", category: "Performance" },
];

interface ToolsTabProps {
  fonts?: FontInfo[];
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ fonts }) => {
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="space-y-6">
      {fonts && fonts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider ml-1">Detected Fonts</p>
          <FontsTab fonts={fonts} />
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider ml-1">{cat}</p>
          <div className="grid grid-cols-2 gap-2">
            {tools.filter(t => t.category === cat).map(tool => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card rounded border border-border p-2 flex items-center gap-2 hover:border-primary/50 hover:bg-accent/50 transition-all group min-h-[48px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">{tool.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight">{tool.description}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
