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
    analyzeHTML: (html: string, url: string) => void;
}

/**
 * React hook that bridges the analysis engine to the UI.
 */
export function usePageAnalysis(): UsePageAnalysisReturn {
    const [data, setData] = useState<AuditData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState("");
    const isExtension = isExtensionContext();

    const searchParams = new URLSearchParams(window.location.search);
    const paramTabId = searchParams.get("tabId");
    const paramUrl = searchParams.get("url");

    useEffect(() => {
        if (isExtension) {
            if (paramUrl) {
                setCurrentUrl(paramUrl);
            } else {
                getActiveTab().then((tab) => {
                    if (tab?.url) setCurrentUrl(tab.url);
                });
            }

            // Listen for incremental updates
            const listener = (message: any) => {
                if (message.type === "ANALYSIS_UPDATE") {
                    setData(prev => {
                        if (!prev) return null;
                        return { ...prev, ...message.data };
                    });
                }
            };
            chrome.runtime.onMessage.addListener(listener);
            return () => chrome.runtime.onMessage.removeListener(listener);
        }
    }, [isExtension, paramUrl]);

    const performScan = useCallback(async (doc: Document | Element, url: string) => {
        const { scanDOM } = await import("@/analysis/dom-scanner");
        const { detectTech } = await import("@/analysis/tech-detector");
        const { scanFonts } = await import("@/analysis/font-scanner");

        const domData = scanDOM(doc, url);
        const tech = detectTech(doc);
        const fonts = scanFonts(doc);
        const security = defaultSecurityResults();

        return {
            ...domData,
            tech,
            fonts,
            security,
        };
    }, []);

    const fetchWithFallback = async (targetUrl: string): Promise<string> => {
        const proxies = [
            async (url: string) => {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error("AllOrigins failed");
                const data = await response.json();
                return data.contents;
            },
            async (url: string) => {
                const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error("CodeTabs failed");
                return await response.text();
            },
            async (url: string) => {
                // corsproxy.io is generally reliable for simple GETs
                const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error("CORSProxy.io failed");
                return await response.text();
            }
        ];

        let lastError: Error | null = null;
        for (let i = 0; i < proxies.length; i++) {
            try {
                console.log(`Trying Proxy ${i + 1}...`);
                const html = await proxies[i](targetUrl);
                if (html && html.trim().length > 0) return html;
                throw new Error("Empty content received");
            } catch (err) {
                console.warn(`Proxy ${i + 1} failed:`, err);
                lastError = err instanceof Error ? err : new Error(String(err));
            }
        }
        throw lastError || new Error("All scraping attempts failed");
    };

    const analyzeHTML = useCallback(async (html: string, url: string) => {
        setIsLoading(true);
        setError(null);
        setData(null);
        setCurrentUrl(url);

        try {
            const parser = new DOMParser();
            const scanDoc = parser.parseFromString(html, "text/html");

            const base = scanDoc.createElement('base');
            base.href = url;
            scanDoc.head.appendChild(base);

            const result = await performScan(scanDoc, url);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "HTML analysis failed");
        } finally {
            setIsLoading(false);
        }
    }, [performScan]);

    const analyze = useCallback(
        async (url?: string) => {
            setIsLoading(true);
            setError(null);
            setData(null);

            try {
                if (isExtension) {
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
                    const targetUrl = url || window.location.href;

                    if (!targetUrl.startsWith('http')) {
                        throw new Error("Please enter a valid URL (starting with http:// or https://)");
                    }

                    setCurrentUrl(targetUrl);

                    if (targetUrl === window.location.href) {
                        const result = await performScan(document, targetUrl);
                        setData(result);
                    } else {
                        try {
                            const html = await fetchWithFallback(targetUrl);

                            const parser = new DOMParser();
                            const scanDoc = parser.parseFromString(html, "text/html");

                            const base = scanDoc.createElement('base');
                            base.href = targetUrl;
                            scanDoc.head.appendChild(base);

                            const scanResult = await performScan(scanDoc, targetUrl);
                            setData(scanResult);
                        } catch (err) {
                            console.error("Remote analysis failed:", err);
                            throw new Error("Unable to fetch site content automatically. This URL might be heavily protected or blocking all scrapers. You can still paste the source code manually using the 'Paste Source' tab.");
                        }
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Analysis failed");
            } finally {
                setIsLoading(false);
            }
        },
        [isExtension, paramTabId, paramUrl, performScan]
    );

    return { data, isLoading, error, isExtension, currentUrl, analyze, analyzeHTML };
}
