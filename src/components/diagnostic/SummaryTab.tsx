import type { AuditData } from "@/analysis/types";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";

interface Props {
  data: AuditData;
}

export const SummaryTab = ({ data }: Props) => {
  const titleStatus = data.titleLength <= 60 ? "pass" : data.titleLength <= 70 ? "warn" : "fail";
  const descStatus = data.descriptionLength >= 150 && data.descriptionLength <= 160 ? "pass" : data.descriptionLength < 120 ? "fail" : "warn";
  const h1Count = data.headers.filter(h => h.tag === "H1").length;
  const h1Status = h1Count === 1 ? "pass" : "fail";

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-card rounded border border-border p-4 transition-all hover:bg-muted/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Page Title</span>
          <StatusBadge status={titleStatus} label={`${data.titleLength} chars`} />
        </div>
        <p className="text-sm font-mono text-foreground">{data.title}</p>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${titleStatus === "pass" ? "bg-success" : titleStatus === "warn" ? "bg-warning" : "bg-destructive"}`}
            style={{ width: `${Math.min(100, (data.titleLength / 70) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Optimal: 50–60 characters</p>
      </div>

      {/* Description */}
      <div className="bg-card rounded border border-border p-4 transition-all hover:bg-muted/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Meta Description</span>
          <StatusBadge status={descStatus} label={`${data.descriptionLength} chars`} />
        </div>
        <p className="text-sm font-mono text-foreground">{data.description}</p>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${descStatus === "pass" ? "bg-success" : descStatus === "warn" ? "bg-warning" : "bg-destructive"}`}
            style={{ width: `${Math.min(100, (data.descriptionLength / 170) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Optimal: 150–160 characters</p>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="H1 Tags" value={h1Count} status={h1Status} sublabel={h1Count === 1 ? "Single H1 ✓" : "Should be exactly 1"} />
        <MetricCard label="Canonical" value={data.canonical ? "Set" : "Missing"} status={data.canonical ? "pass" : "fail"} mono />
        <MetricCard label="Robots" value={data.robots} status="pass" mono />
        <MetricCard label="Language" value={data.language} status="info" mono />
        <MetricCard label="Charset" value={data.charset} status="pass" mono />
        <MetricCard label="Author" value={data.author || "—"} status={data.author ? "info" : "warn"} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded border border-border p-3 text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{data.headers.length}</p>
          <p className="text-xs text-muted-foreground">Headers</p>
        </div>
        <div className="bg-card rounded border border-border p-3 text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{data.images.length}</p>
          <p className="text-xs text-muted-foreground">Images</p>
        </div>
        <div className="bg-card rounded border border-border p-3 text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{data.links.length}</p>
          <p className="text-xs text-muted-foreground">Links</p>
        </div>
      </div>
    </div>
  );
};
