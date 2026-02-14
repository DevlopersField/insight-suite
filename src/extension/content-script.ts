import { scanDOM } from "../analysis/dom-scanner";
import { detectTech } from "../analysis/tech-detector";
import { scanFonts } from "../analysis/font-scanner";
import type { DomScanResult } from "../analysis/types";

/**
 * Content script entry point.
 * Run all DOM-based scanners and return the combined result.
 *
 * This function is designed to be injected via chrome.scripting.executeScript().
 * It has full access to the page DOM and window globals.
 */
export function runContentScan(): DomScanResult {
    const domData = scanDOM();
    const tech = detectTech();
    const fonts = scanFonts();

    return {
        ...domData,
        tech,
        fonts,
    };
}

// If this script is injected directly (not as a module), auto-run and report back
if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === "RUN_CONTENT_SCAN") {
            try {
                const result = runContentScan();
                sendResponse({ success: true, data: result });
            } catch (err) {
                sendResponse({
                    success: false,
                    error: err instanceof Error ? err.message : "Content scan failed",
                });
            }
        }
        return true; // Keep channel open for async response
    });
}
