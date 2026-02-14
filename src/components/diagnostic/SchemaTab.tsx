import React, { useState } from "react";
import { SchemaInfo } from "@/analysis/types";
import { AlertCircle, CheckCircle2, Copy, ExternalLink, ChevronDown, ChevronRight, FileJson, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SchemaTabProps {
    schemas: SchemaInfo[];
    url: string;
}

export const SchemaTab: React.FC<SchemaTabProps> = ({ schemas, url }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const copyToClipboard = (data: any) => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    };

    const openInValidator = () => {
        window.open(`https://validator.schema.org/#url=${encodeURIComponent(url)}`, "_blank");
    };

    if (!schemas || schemas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-dashed border-border">
                <FileJson className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground">No Structured Data Found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                    We couldn't detect any JSON-LD schema markup on this page.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openInValidator}>
                    Check in Google/Schema.org
                    <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        Schema Markup
                        <Badge variant="secondary" className="text-[10px] h-4">
                            {schemas.length} detected
                        </Badge>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Structured data helps search engines understand your content.
                    </p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5" onClick={openInValidator}>
                    Schema Validator
                    <ExternalLink className="w-3 h-3" />
                </Button>
            </div>

            <div className="grid gap-3">
                {schemas.map((schema, index) => (
                    <div
                        key={index}
                        className={`bg-card rounded border transition-all ${schema.errors.length > 0 ? "border-destructive/30" : "border-border"
                            }`}
                    >
                        <div className="p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded ${schema.isValid ? 'bg-success/10' : 'bg-destructive/10'}`}>
                                        {schema.isValid ? (
                                            <CheckCircle2 className="w-4 h-4 text-success" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-destructive" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-[12px] font-bold text-foreground">
                                                {schema.type}
                                            </h4>
                                            {schema.data.name && (
                                                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">
                                                    ({schema.data.name})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {schema.errors.length > 0 && (
                                                <span className="text-[10px] text-destructive flex items-center gap-1 font-medium">
                                                    <AlertCircle className="w-2.5 h-2.5" />
                                                    {schema.errors.length} Errors
                                                </span>
                                            )}
                                            {schema.warnings.length > 0 && (
                                                <span className="text-[10px] text-warning flex items-center gap-1 font-medium">
                                                    <AlertTriangle className="w-2.5 h-2.5" />
                                                    {schema.warnings.length} Warnings
                                                </span>
                                            )}
                                            {schema.isValid && schema.warnings.length === 0 && (
                                                <span className="text-[10px] text-success font-medium">Valid Schema</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => copyToClipboard(schema.data)}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Copy JSON-LD</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                    >
                                        {expandedIndex === index ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            {schema.errors.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {schema.errors.map((error, i) => (
                                        <div key={i} className="text-[10px] text-destructive bg-destructive/5 p-1.5 rounded flex items-start gap-2">
                                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                            {error}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {expandedIndex === index && (
                                <div className="mt-3">
                                    <ScrollArea className="h-[150px] w-full rounded bg-muted/30 border border-border/50 p-2">
                                        <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {JSON.stringify(schema.data, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
