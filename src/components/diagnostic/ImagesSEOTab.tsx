import React from "react";
import { ImageInfo } from "@/analysis/types";
import { AlertTriangle, CheckCircle2, ImageIcon, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImagesSEOTabProps {
    images: ImageInfo[];
}

export const ImagesSEOTab: React.FC<ImagesSEOTabProps> = ({ images }) => {
    const [activeFilter, setActiveFilter] = React.useState<"all" | "missing" | "poor">("all");

    const getFileName = (url: string) => {
        try {
            const parts = url.split('/');
            const last = parts[parts.length - 1];
            return last.split('?')[0].split('#')[0] || "image";
        } catch {
            return "image";
        }
    };

    const isAltSameAsFileName = (alt: string, src: string) => {
        if (!alt) return false;
        const fileName = getFileName(src).toLowerCase().split('.')[0];
        return alt.toLowerCase().trim() === fileName || alt.toLowerCase().trim() === getFileName(src).toLowerCase();
    };

    const missingAltImages = images.filter(img => !img.alt);
    const poorAltImages = images.filter(img => img.alt && isAltSameAsFileName(img.alt, img.src));

    // Sort issues: Missing Alt first, then Poor Alt
    const imagesWithIssues = [...missingAltImages, ...poorAltImages];

    const visibleImages = activeFilter === "missing"
        ? missingAltImages
        : activeFilter === "poor"
            ? poorAltImages
            : imagesWithIssues;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setActiveFilter(activeFilter === "missing" ? "all" : "missing")}
                    className={`bg-card rounded border p-3 text-left transition-all hover:border-primary/50 ${activeFilter === "missing" ? 'ring-2 ring-primary ring-inset border-primary' : 'border-border'}`}
                >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Missing Alt</div>
                    <div className="flex items-end gap-1.5">
                        <span className={`text-xl font-bold leading-none ${missingAltImages.length > 0 ? 'text-destructive' : 'text-success'}`}>
                            {missingAltImages.length}
                        </span>
                        <span className="text-[10px] text-muted-foreground mb-0.5">Images</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveFilter(activeFilter === "poor" ? "all" : "poor")}
                    className={`bg-card rounded border p-3 text-left transition-all hover:border-primary/50 ${activeFilter === "poor" ? 'ring-2 ring-primary ring-inset border-primary' : 'border-border'}`}
                >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Poor Alt Text</div>
                    <div className="flex items-end gap-1.5">
                        <span className={`text-xl font-bold leading-none ${poorAltImages.length > 0 ? 'text-warning' : 'text-success'}`}>
                            {poorAltImages.length}
                        </span>
                        <span className="text-[10px] text-muted-foreground mb-0.5">Warnings</span>
                    </div>
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                        Image SEO Audit
                        {imagesWithIssues.length > 0 ? (
                            <Badge variant="destructive" className="text-[9px] h-3.5 px-1 font-medium italic">Issues Found</Badge>
                        ) : (
                            <Badge variant="outline" className="text-[9px] h-3.5 px-1 font-medium border-success/30 text-success italic">Perfect</Badge>
                        )}
                    </h4>
                    {activeFilter !== "all" && (
                        <button
                            onClick={() => setActiveFilter("all")}
                            className="text-[10px] text-primary hover:underline font-medium"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {visibleImages.length === 0 ? (
                    <div className="p-6 text-center bg-card rounded border border-border border-dashed">
                        {activeFilter === "all" ? (
                            <>
                                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2 opacity-40" />
                                <p className="text-sm font-medium text-success">All images have descriptive ALT text!</p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No images found for this filter.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {visibleImages.map((img, i) => {
                            const fileName = getFileName(img.src);
                            const isSame = isAltSameAsFileName(img.alt, img.src);

                            return (
                                <div key={i} className={`flex items-center gap-3 p-2 rounded border bg-card/50 ${!img.alt ? 'border-destructive/20' : 'border-warning/20'}`}>
                                    <div className="w-10 h-10 rounded border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                        {img.src.startsWith('http') ? (
                                            <img src={img.src} alt="" className="w-full h-full object-cover shadow-sm transition-transform hover:scale-110" />
                                        ) : (
                                            <ImageIcon className="w-4 h-4 text-muted-foreground opacity-30" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-muted-foreground truncate block">
                                                {fileName}
                                            </span>
                                            {!img.alt ? (
                                                <Badge variant="destructive" className="text-[8px] h-3 px-1 leading-none shrink-0">Missing Alt</Badge>
                                            ) : isSame ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center text-warning shrink-0 cursor-help">
                                                                <AlertTriangle className="w-3 h-3" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-[10px]">Alt text matches filename. Use descriptive text for better SEO.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : null}
                                        </div>
                                        <div className="mt-0.5">
                                            <span className={`text-[11px] font-medium leading-tight ${!img.alt ? 'text-destructive italic underline decoration-dotted' : 'text-foreground'}`}>
                                                {img.alt || "No alt text provided"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
