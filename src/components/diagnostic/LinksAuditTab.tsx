import React from "react";
import { LinkInfo } from "@/analysis/types";
import { ExternalLink, Link2, Share2, CheckCircle2, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LinksAuditTabProps {
    links: LinkInfo[];
}

export const LinksAuditTab: React.FC<LinksAuditTabProps> = ({ links }) => {
    const [activeFilter, setActiveFilter] = React.useState<"all" | "internal" | "external" | "nofollow">("all");

    const noFollowPats = ["nofollow", "ugc", "sponsored"];
    const noFollowLinks = links.filter(l => l.rel && noFollowPats.some(p => l.rel.toLowerCase().includes(p)));
    const internalLinks = links.filter(l => !l.isExternal);
    const externalLinks = links.filter(l => l.isExternal);

    const visibleLinks = activeFilter === "internal"
        ? internalLinks
        : activeFilter === "external"
            ? externalLinks
            : activeFilter === "nofollow"
                ? noFollowLinks
                : links;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
                <button
                    onClick={() => setActiveFilter("all")}
                    className={`bg-card rounded border p-2 text-center transition-all hover:border-primary/50 ${activeFilter === "all" ? 'ring-2 ring-primary ring-inset border-primary' : 'border-border'}`}
                >
                    <div className="text-[9px] text-muted-foreground uppercase opacity-70">Total</div>
                    <div className="text-sm font-bold">{links.length}</div>
                </button>
                <button
                    onClick={() => setActiveFilter("internal")}
                    className={`bg-card rounded border p-2 text-center transition-all hover:border-primary/50 ${activeFilter === "internal" ? 'ring-2 ring-primary ring-inset border-primary' : 'border-border'}`}
                >
                    <div className="text-[9px] text-muted-foreground uppercase opacity-70">Internal</div>
                    <div className="text-sm font-bold text-primary">{internalLinks.length}</div>
                </button>
                <button
                    onClick={() => setActiveFilter("external")}
                    className={`bg-card rounded border p-2 text-center transition-all hover:border-primary/50 ${activeFilter === "external" ? 'ring-2 ring-primary ring-inset border-primary' : 'border-border'}`}
                >
                    <div className="text-[9px] text-muted-foreground uppercase opacity-70">External</div>
                    <div className="text-sm font-bold text-info">{externalLinks.length}</div>
                </button>
                <button
                    onClick={() => setActiveFilter("nofollow")}
                    className={`bg-card rounded border p-2 text-center transition-all hover:border-primary/50 ${activeFilter === "nofollow" ? 'ring-2 ring-primary ring-inset border-primary' : 'border-border'}`}
                >
                    <div className="text-[9px] text-muted-foreground uppercase opacity-70">No-Follow</div>
                    <div className="text-sm font-bold text-warning">{noFollowLinks.length}</div>
                </button>
            </div>

            <div className="space-y-3">
                {/* Managed Links (nofollow, etc) - Always show if they exist, or show filtered list? 
                    User asked "on click it should show the list of links". I'll show the filtered list. */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                            <Share2 className="w-3 h-3" />
                            {activeFilter === "all" ? "All Scanned Links" :
                                activeFilter === "internal" ? "Internal Links" :
                                    activeFilter === "external" ? "External Links" : "No-Follow & Managed Links"} ({visibleLinks.length})
                        </h4>
                        {activeFilter !== "all" && (
                            <button
                                onClick={() => setActiveFilter("all")}
                                className="text-[10px] text-primary hover:underline font-medium"
                            >
                                Show All
                            </button>
                        )}
                    </div>

                    <ScrollArea className="h-[300px] pr-1">
                        <div className="flex flex-col gap-2 pb-2 mr-2">
                            {visibleLinks.length === 0 ? (
                                <div className="text-[11px] text-muted-foreground italic p-6 bg-card rounded border border-dashed border-border text-center">
                                    No links found for this filter.
                                </div>
                            ) : (
                                visibleLinks.map((link, i) => (
                                    <div key={i} className="bg-card border border-border rounded p-2.5 flex items-start justify-between gap-3 group hover:border-primary/40 transition-all overflow-hidden w-full">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] font-medium text-foreground truncate flex items-center gap-1.5">
                                                {link.isExternal ? <Globe className="w-2.5 h-2.5 text-info/70 shrink-0" /> : <Lock className="w-2.5 h-2.5 text-primary/70 shrink-0" />}
                                                <span className="truncate">{link.text || "[No Anchor Text]"}</span>
                                            </div>
                                            <div className="text-[9px] text-muted-foreground truncate opacity-60 mt-1 pb-0.5 group-hover:opacity-100 transition-opacity font-mono">
                                                {link.href}
                                            </div>
                                        </div>
                                        {link.rel && (
                                            <div className="flex flex-wrap justify-end gap-1 shrink-0 max-w-[120px]">
                                                {link.rel.split(' ').filter(Boolean).map((r, ri) => (
                                                    <Badge key={ri} variant="outline" className="text-[7px] h-3.5 px-1 font-bold border-primary/20 text-primary/70 uppercase leading-none bg-primary/5">
                                                        {r}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};
