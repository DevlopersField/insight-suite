import type { AuditData } from "@/analysis/types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  data: AuditData;
}

export const HeadersTab = ({ data }: Props) => {
  const tagColors: Record<string, string> = {
    H1: "text-primary font-bold",
    H2: "text-info",
    H3: "text-foreground",
    H4: "text-muted-foreground",
    H5: "text-muted-foreground",
    H6: "text-muted-foreground",
  };

  const indents: Record<string, string> = {
    H1: "ml-0",
    H2: "ml-4",
    H3: "ml-8",
    H4: "ml-12",
    H5: "ml-16",
    H6: "ml-20",
  };

  const h1Count = data.headers.filter(h => h.tag === "H1").length;
  const hasSkippedLevels = data.headers.some((h, i) => {
    if (i === 0) return false;
    const prev = parseInt(data.headers[i - 1].tag.replace("H", ""));
    const curr = parseInt(h.tag.replace("H", ""));
    return curr > prev + 1;
  });

  const tagCounts = data.headers.reduce((acc, h) => {
    acc[h.tag] = (acc[h.tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Alerts */}
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={h1Count === 1 ? "pass" : "fail"} label={`${h1Count} H1 tag${h1Count !== 1 ? "s" : ""}`} />
        <StatusBadge status={hasSkippedLevels ? "warn" : "pass"} label={hasSkippedLevels ? "Hierarchy skipped" : "Valid hierarchy"} />
        <StatusBadge status="info" label={`${data.headers.length} total headings`} />
      </div>

      {/* Tag Distribution */}
      <div className="bg-card rounded border border-border p-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Distribution</p>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(tagCounts).map(([tag, count]) => (
            <div key={tag} className="flex items-center gap-1.5">
              <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{tag}</span>
              <span className="text-xs text-muted-foreground">×{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header Tree */}
      <div className="bg-card rounded border border-border divide-y divide-border">
        {data.headers.map((header, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors">
            <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground w-8 text-center shrink-0">
              {header.tag}
            </span>
            <span className={`text-sm truncate ${indents[header.tag]} ${tagColors[header.tag]}`}>
              {header.text}
            </span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">#{header.order}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
