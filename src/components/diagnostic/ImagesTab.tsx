import type { AuditData } from "@/analysis/types";
import { StatusBadge } from "./StatusBadge";
import { ImageIcon, Youtube, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    data: AuditData;
}

export const ImagesTab = ({ data }: Props) => {
    const images = [...data.images].sort((a, b) => {
        if (!a.alt && b.alt) return -1;
        if (a.alt && !b.alt) return 1;
        return 0;
    });
    const videos = data.videos;

    const imagesWithAlt = images.filter((img) => img.alt.trim()).length;
    const imagesMissingAlt = images.length - imagesWithAlt;

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded border border-border p-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Images Audit</div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">{images.length}</span>
                        <span className="text-xs text-muted-foreground mb-1">Total Images</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <StatusBadge
                            status={imagesMissingAlt === 0 ? "pass" : "fail"}
                            label={`${imagesWithAlt} with Alt`}
                        />
                        {imagesMissingAlt > 0 && (
                            <StatusBadge status="fail" label={`${imagesMissingAlt} Missing Alt`} />
                        )}
                    </div>
                </div>

                <div className="bg-card rounded border border-border p-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Video Schema</div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">{videos ? videos.length : 0}</span>
                        <span className="text-xs text-muted-foreground mb-1">Videos Found</span>
                    </div>
                    <div className="mt-3">
                        {videos && videos.length > 0 ? (
                            <StatusBadge
                                status={videos.every(v => v.hasSchema) ? "pass" : "fail"}
                                label={videos.every(v => v.hasSchema) ? "All have Schema" : "Missing Schema"}
                            />
                        ) : (
                            <StatusBadge status="info" label="No videos detected" />
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
                                <th className="px-4 py-2 font-medium">Alt Text</th>
                                <th className="px-4 py-2 font-medium">Type</th>
                                <th className="px-4 py-2 font-medium">Resolution</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {images.map((img, idx) => (
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
                                            img.type === "webp" || img.type === "avif" ? "bg-success/10 border-success/20 text-success" : "bg-muted border-border text-muted-foreground"
                                        )}>
                                            {img.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground font-mono">
                                        {img.width > 0 ? `${img.width}x${img.height}px` : "Unknown"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={img.alt ? "pass" : "fail"} label={img.alt ? "OK" : "Crit"} />
                                    </td>
                                </tr>
                            ))}
                            {images.length === 0 && (
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
