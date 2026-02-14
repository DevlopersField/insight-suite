import type { AuditData } from "@/analysis/types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  data: AuditData;
}

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2">
    <span className="text-xs text-muted-foreground w-28 shrink-0 uppercase tracking-wider pt-0.5">{label}</span>
    <span className="text-sm font-mono text-foreground break-all">{value || <span className="text-destructive italic">Missing</span>}</span>
    <StatusBadge status={value ? "pass" : "fail"} className="ml-auto shrink-0" />
  </div>
);

export const SocialTab = ({ data }: Props) => {
  const og = data.social;
  const ogFields = [
    { label: "og:title", value: og.ogTitle },
    { label: "og:description", value: og.ogDescription },
    { label: "og:image", value: og.ogImage },
    { label: "og:url", value: og.ogUrl },
    { label: "og:type", value: og.ogType },
  ];
  const twFields = [
    { label: "twitter:card", value: og.twitterCard },
    { label: "twitter:title", value: og.twitterTitle },
    { label: "twitter:desc", value: og.twitterDescription },
    { label: "twitter:image", value: og.twitterImage },
    { label: "twitter:site", value: og.twitterSite },
  ];

  const ogComplete = ogFields.filter(f => f.value).length;
  const twComplete = twFields.filter(f => f.value).length;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Open Graph</span>
          <StatusBadge status={ogComplete === ogFields.length ? "pass" : "warn"} label={`${ogComplete}/${ogFields.length}`} />
        </div>
        <div className="divide-y divide-border">
          {ogFields.map(f => <MetaRow key={f.label} {...f} />)}
        </div>
      </div>

      <div className="bg-card rounded border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Twitter Card</span>
          <StatusBadge status={twComplete === twFields.length ? "pass" : "warn"} label={`${twComplete}/${twFields.length}`} />
        </div>
        <div className="divide-y divide-border">
          {twFields.map(f => <MetaRow key={f.label} {...f} />)}
        </div>
      </div>
    </div>
  );
};
