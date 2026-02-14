import { useState, useCallback, useEffect } from "react";
import type { AuditData } from "@/analysis/types";
import { isExtensionContext, sendToBackground, getActiveTab } from "@/extension/messaging";
import { defaultSecurityResults } from "@/analysis/security-auditor";

interface UsePageAnalysisReturn {
    data: AuditData | null;
    isLoading: boolean;
    error: string | null;
    isExtension: boolean;
    currentUrl: string;
    analyze: (url?: string) => void;
}

/**
 * React hook that bridges the analysis engine to the UI.
 *
 * - In Extension mode: sends ANALYZE_PAGE to the background service worker,
 *   which injects content scripts and fetches security headers.
 * - In Website mode: shows a prompt to install the extension (limited scanning).
 */
export function usePageAnalysis(): UsePageAnalysisReturn {
    const [data, setData] = useState<AuditData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState("");
    const isExtension = isExtensionContext();

    // Check for context in URL params (Full View Mode)
    const searchParams = new URLSearchParams(window.location.search);
    const paramTabId = searchParams.get("tabId");
    const paramUrl = searchParams.get("url");

    // Auto-detect current tab URL in extension mode
    useEffect(() => {
        if (isExtension) {
            if (paramUrl) {
                setCurrentUrl(paramUrl);
            } else {
                getActiveTab().then((tab) => {
                    if (tab?.url) setCurrentUrl(tab.url);
                });
            }
        }
    }, [isExtension, paramUrl]);

    const analyze = useCallback(
        async (url?: string) => {
            setIsLoading(true);
            setError(null);
            setData(null);

            try {
                if (isExtension) {
                    // Extension mode: delegate to background service worker
                    let targetTabId: number | undefined;
                    let targetUrl: string | undefined;

                    if (paramTabId) {
                        targetTabId = parseInt(paramTabId);
                        targetUrl = paramUrl || "";
                    } else {
                        const tab = await getActiveTab();
                        if (!tab) throw new Error("No active tab found. Open a website first.");
                        targetTabId = tab.tabId;
                        targetUrl = tab.url;
                    }

                    setCurrentUrl(targetUrl);

                    const response = await sendToBackground({
                        type: "ANALYZE_PAGE",
                        tabId: targetTabId,
                    });

                    if (response.type === "ANALYSIS_RESULT") {
                        setData(response.data);
                    } else if (response.type === "ANALYSIS_ERROR") {
                        throw new Error(response.error);
                    }
                } else {
                    // Website mode: limited self-analysis (analyze the current page only)
                    const targetUrl = url || window.location.href;
                    setCurrentUrl(targetUrl);

                    // Import scanners dynamically
                    const { scanDOM } = await import("@/analysis/dom-scanner");
                    const { detectTech } = await import("@/analysis/tech-detector");
                    const { scanFonts } = await import("@/analysis/font-scanner");

                    const domData = scanDOM();
                    const tech = detectTech();
                    const fonts = scanFonts();
                    const security = defaultSecurityResults();

                    setData({
                        ...domData,
                        tech,
                        fonts,
                        security,
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Analysis failed");
            } finally {
                setIsLoading(false);
            }
        },
        [isExtension, paramTabId, paramUrl]
    );

    return { data, isLoading, error, isExtension, currentUrl, analyze };
}
