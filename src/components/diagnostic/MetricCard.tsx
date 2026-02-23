import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  status?: "pass" | "warn" | "fail" | "info";
  mono?: boolean;
}

export const MetricCard = ({ label, value, sublabel, status, mono = false }: MetricCardProps) => {
  const statusColor = {
    pass: "border-l-success",
    warn: "border-l-warning",
    fail: "border-l-destructive",
    info: "border-l-info",
  };

  return (
    <div className={cn(
      "bg-card rounded border border-border p-3 border-l-2 transition-all hover:bg-muted/10",
      status ? statusColor[status] : "border-l-muted-foreground/30"
    )}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={cn(
        "text-sm text-foreground truncate",
        mono && "font-mono"
      )}>{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  );
};
