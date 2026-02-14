import { ExternalLink, Type } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { FontInfo } from "@/analysis/types";

interface Props {
    fonts: FontInfo[];
}

const sourceBadge: Record<FontInfo["source"], { label: string; status: "pass" | "info" | "warn" }> = {
    google: { label: "Google Fonts", status: "pass" },
    typekit: { label: "Adobe Fonts", status: "info" },
    custom: { label: "Custom", status: "info" },
    system: { label: "System", status: "warn" },
};

export const FontsTab = ({ fonts }: Props) => {
    const googleCount = fonts.filter((f) => f.source === "google").length;
    const customCount = fonts.filter((f) => f.source === "custom").length;
    const systemCount = fonts.filter((f) => f.source === "system").length;

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex flex-wrap gap-2">
                <StatusBadge status="info" label={`${fonts.length} fonts detected`} />
                {googleCount > 0 && <StatusBadge status="pass" label={`${googleCount} Google Fonts`} />}
                {customCount > 0 && <StatusBadge status="info" label={`${customCount} Custom`} />}
                {systemCount > 0 && <StatusBadge status="warn" label={`${systemCount} System`} />}
            </div>

            {/* Font Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fonts.map((font, i) => {
                    const badge = sourceBadge[font.source];

                    return (
                        <div
                            key={`${font.family}-${i}`}
                            className="bg-card rounded border border-border p-4 hover:border-primary/40 transition-colors"
                        >
                            {/* Font Name + Source Badge */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Type className="w-4 h-4 text-primary shrink-0" />
                                    <span
                                        className="text-sm font-medium text-foreground truncate"
                                        style={{ fontFamily: `"${font.family}", sans-serif` }}
                                    >
                                        {font.family}
                                    </span>
                                </div>
                                <StatusBadge status={badge.status} label={badge.label} />
                            </div>

                            {/* Font Preview */}
                            <p
                                className="text-lg text-muted-foreground mb-3"
                                style={{ fontFamily: `"${font.family}", sans-serif` }}
                            >
                                The quick brown fox jumps over the lazy dog
                            </p>

                            {/* Weights & Styles */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {font.weights.map((w) => (
                                    <span
                                        key={w}
                                        className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground"
                                    >
                                        {w}
                                    </span>
                                ))}
                                {font.styles
                                    .filter((s) => s !== "normal")
                                    .map((s) => (
                                        <span
                                            key={s}
                                            className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground italic"
                                        >
                                            {s}
                                        </span>
                                    ))}
                            </div>

                            {/* Links */}
                            <div className="space-y-1">
                                {font.url && (
                                    <a
                                        href={font.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-primary hover:underline group"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>View on {font.source === "google" ? "Google Fonts" : font.source === "typekit" ? "Adobe Fonts" : "Source"}</span>
                                    </a>
                                )}
                                {font.cssUrl && (
                                    <p className="text-[10px] font-mono text-muted-foreground truncate" title={font.cssUrl}>
                                        {font.cssUrl}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {fonts.length === 0 && (
                <div className="bg-card rounded border border-border p-8 text-center">
                    <Type className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No fonts detected on this page.</p>
                </div>
            )}
        </div>
    );
};
