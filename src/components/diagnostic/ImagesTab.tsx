import React, { useState, useMemo } from "react";
import type { AuditData } from "@/analysis/types";
import { StatusBadge } from "./StatusBadge";
import { ImageIcon, Youtube, AlertCircle, CheckCircle2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    data: AuditData;
}

type SortConfig = {
    key: 'alt' | 'type' | 'size';
    direction: 'asc' | 'desc';
} | null;

export const ImagesTab = ({ data }: Props) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const handleSort = (key: 'alt' | 'type' | 'size') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedImages = useMemo(() => {
        const items = [...data.images];
        if (sortConfig) {
            items.sort((a, b) => {
                if (sortConfig.key === 'size') {
                    const sizeA = a.size || 0;
                    const sizeB = b.size || 0;
                    return sortConfig.direction === 'asc' ? sizeA - sizeB : sizeB - sizeA;
                }
                const valA = (a[sortConfig.key] || "").toLowerCase();
                const valB = (b[sortConfig.key] || "").toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            // Default sort: missing alt first
            items.sort((a, b) => {
                if (!a.alt && b.alt) return -1;
                if (a.alt && !b.alt) return 1;
                return 0;
            });
        }
        return items;
    }, [data.images, sortConfig]);

    const videos = data.videos;

    const imagesWithAlt = data.images.filter((img) => img.alt.trim()).length;
    const imagesMissingAlt = data.images.length - imagesWithAlt;

    const formatSize = (bytes?: number) => {
        if (bytes === undefined) return "Unknown";
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded border border-border p-3">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Images Audit</div>
                    <div className="flex items-end gap-1.5">
                        <span className="text-xl font-bold text-foreground leading-none">{data.images.length}</span>
                        <span className="text-[10px] text-muted-foreground mb-0.5">Total Assets</span>
                    </div>
                    <div className="mt-2 flex gap-1.5 flex-wrap items-center">
                        <StatusBadge
                            status={imagesMissingAlt === 0 ? "pass" : "fail"}
                            label={`${imagesWithAlt} Alt OK`}
                        />
                        {imagesMissingAlt > 0 && (
                            <StatusBadge status="fail" label={`${imagesMissingAlt} Missing Alt`} />
                        )}
                        {data.images.some(img => img.size === undefined) && (
                            <span className="text-[9px] text-info animate-pulse flex items-center gap-1 font-medium bg-info/5 px-2 py-0.5 rounded border border-info/20">
                                <span className="w-1.5 h-1.5 bg-info rounded-full" />
                                Auditing sizes...
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded border border-border p-3">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Video Detection</div>
                    <div className="flex items-end gap-1.5">
                        <span className="text-xl font-bold text-foreground leading-none">{videos ? videos.length : 0}</span>
                        <span className="text-[10px] text-muted-foreground mb-0.5">Embeds Found</span>
                    </div>
                    <div className="mt-2 text-xs">
                        {videos && videos.length > 0 ? (
                            <StatusBadge
                                status={videos.every(v => v.hasSchema) ? "pass" : "fail"}
                                label={videos.every(v => v.hasSchema) ? "Schema Valid" : "Missing Schema"}
                            />
                        ) : (
                            <span className="text-[10px] text-muted-foreground italic">No videos detected</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Videos Section */}
            {videos && videos.length > 0 && (
                <div className="bg-card rounded border border-border p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        Video Detect & Schema
                    </h3>
                    <div className="space-y-3">
                        {videos.map((video, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border/50">
                                <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-mono text-muted-foreground truncate mb-1">{video.url}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted border border-border uppercase">
                                            {video.type}
                                        </span>
                                        {video.hasSchema ? (
                                            <span className="text-xs text-success flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                VideoObject Schema Detected
                                            </span>
                                        ) : (
                                            <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Missing Video Schema (Dev Task)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Images List */}
            <div className="bg-card rounded border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image Assets Checklist
                    </h3>
                </div>
                <div className="divide-y divide-border overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-2 font-medium">Preview</th>
                                <th
                                    className="px-4 py-2 font-medium cursor-pointer hover:text-foreground transition-colors group"
                                    onClick={() => handleSort('alt')}
                                >
                                    <div className="flex items-center gap-1">
                                        Alt Text
                                        <ArrowUpDown className={cn("w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity", sortConfig?.key === 'alt' && "opacity-100 text-primary")} />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-2 font-medium cursor-pointer hover:text-foreground transition-colors group"
                                    onClick={() => handleSort('type')}
                                >
                                    <div className="flex items-center gap-1">
                                        Type
                                        <ArrowUpDown className={cn("w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity", sortConfig?.key === 'type' && "opacity-100 text-primary")} />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-2 font-medium cursor-pointer hover:text-foreground transition-colors group"
                                    onClick={() => handleSort('size')}
                                >
                                    <div className="flex items-center gap-1">
                                        Size
                                        <ArrowUpDown className={cn("w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity", sortConfig?.key === 'size' && "opacity-100 text-primary")} />
                                    </div>
                                </th>
                                <th className="px-4 py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sortedImages.map((img, idx) => (
                                <tr key={idx} className={cn("hover:bg-muted/30 transition-colors", !img.alt && "bg-destructive/5")}>
                                    <td className="px-4 py-3">
                                        <div className="h-10 w-16 bg-muted rounded border border-border overflow-hidden group">
                                            <img
                                                src={img.src}
                                                alt={img.alt}
                                                className="h-full w-full object-contain transition-transform group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/64x40?text=Error';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 max-w-[200px]">
                                        {img.alt ? (
                                            <span className="text-foreground line-clamp-2">{img.alt}</span>
                                        ) : (
                                            <span className="text-destructive font-medium italic">Missing Alt Text</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded border font-mono uppercase text-[10px]",
                                            (img.type === "webp" || img.type === "avif" || img.type === "svg")
                                                ? "bg-success/10 border-success/20 text-success"
                                                : img.type === "png"
                                                    ? "bg-warning/10 border-warning/20 text-warning"
                                                    : "bg-muted border-border text-muted-foreground"
                                        )}>
                                            {img.type || "img"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground font-mono">
                                        {img.size === undefined ? (
                                            <span className="text-[10px] animate-pulse text-muted-foreground/60 italic">Scanning...</span>
                                        ) : formatSize(img.size)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={img.alt ? "pass" : "fail"} label={img.alt ? "OK" : "Crit"} />
                                    </td>
                                </tr>
                            ))}
                            {sortedImages.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                                        No images found on this page
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
