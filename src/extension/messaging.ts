import type { DomScanResult, ExtensionMessage } from "../analysis/types";

/**
 * Type-safe message protocol for Chrome Extension communication.
 * Popup ↔ Background ↔ Content Script
 */

/** Send a message from the popup to the background service worker. */
export function sendToBackground(message: ExtensionMessage): Promise<ExtensionMessage> {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

/** Check if we're running inside a Chrome Extension context. */
export function isExtensionContext(): boolean {
    return (
        typeof chrome !== "undefined" &&
        typeof chrome.runtime !== "undefined" &&
        !!chrome.runtime.id
    );
}

/** Get the current active tab's URL and ID. */
export async function getActiveTab(): Promise<{ tabId: number; url: string } | null> {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id && tab?.url) {
            return { tabId: tab.id, url: tab.url };
        }
        return null;
    } catch {
        return null;
    }
}

/** Content script result shape (what the injected function returns). */
export type ContentScriptResult = DomScanResult;
