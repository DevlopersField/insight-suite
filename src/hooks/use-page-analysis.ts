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
 * - In Extension mode: sends ANALYZE_PAGE to background service worker,
 *   which injects the content scanner into the active tab's DOM.
 * - In Website mode: scans the CURRENT PAGE's DOM (the page Insight Suite
 *   is loaded on). For analyzing *other* sites, the extension is required.
 */
export function usePageAnalysis(): UsePageAnalysisReturn {
    const [data, setData] = useState<AuditData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState("");
    const isExtension = isExtensionContext();

    // Auto-detect current tab URL in extension mode
    useEffect(() => {
        if (isExtension) {
            getActiveTab().then((tab) => {
                if (tab?.url) setCurrentUrl(tab.url);
            });
        } else {
            setCurrentUrl(window.location.href);
        }
    }, [isExtension]);

    const analyze = useCallback(
        async (url?: string) => {
            setIsLoading(true);
            setError(null);
            setData(null);

            try {
                if (isExtension) {
                    // ── Extension mode ──────────────────────────────────────
                    // Background worker injects scanner into the ACTIVE TAB's DOM
                    const tab = await getActiveTab();
                    if (!tab) throw new Error("No active tab found. Open a website first.");

                    setCurrentUrl(tab.url);

                    const response = await sendToBackground({
                        type: "ANALYZE_PAGE",
                        tabId: tab.tabId,
                    });

                    if (response.type === "ANALYSIS_RESULT") {
                        setData(response.data);
                    } else if (response.type === "ANALYSIS_ERROR") {
                        throw new Error(response.error);
                    }
                } else {
                    // ── Website mode ────────────────────────────────────────
                    // Scans the current page's actual DOM (the page this app is on)
                    const pageUrl = url || window.location.href;
                    setCurrentUrl(pageUrl);

                    // Import scanners dynamically to tree-shake in extension builds
                    const { scanDOM } = await import("@/analysis/dom-scanner");
                    const { detectTech } = await import("@/analysis/tech-detector");
                    const { scanFonts } = await import("@/analysis/font-scanner");
                    const { auditSecurityHeaders } = await import("@/analysis/security-auditor");

                    // Scan this page's live DOM
                    const domData = scanDOM();
                    const tech = detectTech();
                    const fonts = scanFonts();

                    // Try fetching security headers (will fail cross-origin, but works for same-origin)
                    let security = defaultSecurityResults();
                    try {
                        security = await auditSecurityHeaders(pageUrl);
                    } catch {
                        // CORS restriction — show defaults with "unknown" status
                    }

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
        [isExtension]
    );

    return { data, isLoading, error, isExtension, currentUrl, analyze };
}
