import { AlertTriangle, Hash, Info } from "lucide-react";
import type { AuditData } from "@/analysis/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface Props {
  data: AuditData;
}

export const HeadersTab = ({ data }: Props) => {
  const tagColors: Record<string, string> = {
    H1: "text-primary font-bold",
    H2: "text-info font-semibold",
    H3: "text-foreground",
    H4: "text-muted-foreground",
    H5: "text-muted-foreground",
    H6: "text-muted-foreground",
  };

  const indents: Record<string, string> = {
    H1: "ml-0",
    H2: "ml-3",
    H3: "ml-6",
    H4: "ml-9",
    H5: "ml-12",
    H6: "ml-15",
  };

  const h1Count = data.headers.filter(h => h.tag === "H1").length;

  // Validation logic
  const issues = data.headers.map((h, i) => {
    if (i === 0) {
      if (h.tag !== "H1") return "Does not start with H1";
      return null;
    }
    const prevLevel = parseInt(data.headers[i - 1].tag.replace("H", ""));
    const currLevel = parseInt(h.tag.replace("H", ""));
    if (currLevel > prevLevel + 1) return `Skipped level (from H${prevLevel} to H${currLevel})`;
    return null;
  });

  const hasIssues = issues.some(issue => issue !== null) || h1Count !== 1;

  const tagCounts = data.headers.reduce((acc, h) => {
    acc[h.tag] = (acc[h.tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Alerts */}
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={h1Count === 1 ? "pass" : "fail"} label={h1Count === 0 ? "Missing H1" : h1Count === 1 ? "1 H1 tag" : `${h1Count} H1 tags`} />
        <StatusBadge status={issues.some(id => id?.includes("Skipped")) ? "warn" : "pass"} label={issues.some(id => id?.includes("Skipped")) ? "Hierarchy skipped" : "Valid hierarchy"} />
        <StatusBadge status="info" label={`${data.headers.length} total headings`} />
      </div>

      {/* Tag Distribution */}
      <div className="bg-card rounded border border-border p-2.5">
        <div className="flex gap-2 flex-wrap">
          {["H1", "H2", "H3", "H4", "H5", "H6"].map(tag => tagCounts[tag] ? (
            <div key={tag} className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded border border-border/50">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">{tag}</span>
              <span className="text-xs font-bold text-foreground">{tagCounts[tag]}</span>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Header Tree */}
      <div className="bg-card rounded border border-border overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Heading Structure</span>
          {hasIssues && <span className="text-[10px] font-medium text-warning flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Issues Detected</span>}
        </div>
        <div className="divide-y divide-border">
          {data.headers.map((header, i) => {
            const issue = issues[i];
            return (
              <div key={i} className={cn(
                "group flex items-start gap-3 px-3 py-2 transition-colors",
                issue ? "bg-warning/5 hover:bg-warning/10" : "hover:bg-accent/50"
              )}>
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <span className="font-mono text-[9px] bg-secondary px-1 py-0.5 rounded text-secondary-foreground w-7 text-center shrink-0 border border-border">
                    {header.tag}
                  </span>
                </div>

                <div className={cn("flex-1 min-w-0 pr-4", indents[header.tag])}>
                  <p className={cn("text-xs leading-relaxed break-words", tagColors[header.tag])}>
                    {header.text || <span className="italic opacity-50 text-[10px]">Empty Heading</span>}
                  </p>
                  {issue && (
                    <div className="mt-1 flex items-center gap-1.5 text-warning">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[10px] font-medium italic">{issue}</span>
                    </div>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1.5">
                  <span className="font-mono text-[9px] text-muted-foreground">#{header.order}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
