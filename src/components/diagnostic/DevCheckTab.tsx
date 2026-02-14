import { AuditData } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";

interface Props {
  data: AuditData;
}

export const DevCheckTab = ({ data }: Props) => {
  const securityScore = data.security.filter(s => s.status === "pass").length;
  const totalSecurity = data.security.length;
  const scorePercent = Math.round((securityScore / totalSecurity) * 100);

  return (
    <div className="space-y-4">
      {/* Tech Stack */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Detected Technologies</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {data.tech.map((t) => (
            <div key={t.name} className="bg-card rounded border border-border p-3 flex items-start gap-3 hover:border-primary/40 transition-colors">
              <span className="text-xl">{t.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.category}</p>
                <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${t.confidence}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.confidence}% confidence</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Headers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Security Headers</p>
          <StatusBadge
            status={scorePercent >= 80 ? "pass" : scorePercent >= 50 ? "warn" : "fail"}
            label={`${securityScore}/${totalSecurity} passed`}
          />
        </div>
        <div className="bg-card rounded border border-border divide-y divide-border">
          {data.security.map((s) => (
            <div key={s.header} className="px-4 py-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono text-foreground">{s.header}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs font-mono text-muted-foreground truncate">
                {s.value || <span className="text-destructive italic">Not set</span>}
              </p>
              {s.status !== "pass" && (
                <p className="text-xs text-warning mt-1">↳ {s.recommendation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
