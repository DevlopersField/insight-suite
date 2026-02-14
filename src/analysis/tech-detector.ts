import type { TechInfo } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Detection {
    name: string;
    category: string;
    icon: string;
    detect: (doc: Document | Element) => number; // returns confidence 0–100
}

/** Safely access a window property. */
function win(key: string): any {
    try {
        if (typeof window === 'undefined') return undefined;
        return (window as any)[key];
    } catch {
        return undefined;
    }
}

/** Check if any <script> src contains a pattern. */
function scriptSrcContains(doc: Document | Element, pattern: string): boolean {
    return Array.from(doc.querySelectorAll("script[src]")).some((s) =>
        (s.getAttribute("src") ?? "").includes(pattern)
    );
}

/** Check if any <link> href contains a pattern. */
function linkHrefContains(doc: Document | Element, pattern: string): boolean {
    return Array.from(doc.querySelectorAll("link[href]")).some((l) =>
        (l.getAttribute("href") ?? "").includes(pattern)
    );
}

/** Check if a meta[name="generator"] contains a value (case-insensitive). */
function generatorContains(doc: Document | Element, keyword: string): boolean {
    const gen = doc.querySelector('meta[name="generator"]');
    return gen
        ? (gen.getAttribute("content") ?? "").toLowerCase().includes(keyword.toLowerCase())
        : false;
}

// ─── Detection Definitions ──────────────────────────────────────────

const detections: Detection[] = [
    // ── Frameworks ─────────────────
    {
        name: "Next.js",
        category: "Framework",
        icon: "⚡",
        detect: (doc) => {
            if (win("__NEXT_DATA__")) return 98;
            if (scriptSrcContains(doc, "/_next/")) return 90;
            if (doc.querySelector("#__next")) return 85;
            return 0;
        },
    },
    {
        name: "Nuxt.js",
        category: "Framework",
        icon: "💚",
        detect: (doc) => {
            if (win("__NUXT__")) return 95;
            if (doc.querySelector("#__nuxt")) return 85;
            return 0;
        },
    },
    {
        name: "Gatsby",
        category: "Framework",
        icon: "🟣",
        detect: (doc) => {
            if (doc.querySelector("#___gatsby")) return 92;
            if (scriptSrcContains(doc, "/page-data/")) return 80;
            return 0;
        },
    },

    // ── Libraries ──────────────────
    {
        name: "React",
        category: "Library",
        icon: "⚛️",
        detect: (doc) => {
            if (win("React") || win("__REACT_DEVTOOLS_GLOBAL_HOOK__")) return 95;
            if (doc.querySelector("[data-reactroot]")) return 90;
            const root = doc.querySelector("#root") || doc.querySelector("#__next");
            if (root && (root as any)._reactRootContainer) return 92;
            // Check for React-specific attributes in DOM
            if (doc.querySelector("[data-reactid]")) return 85;
            return 0;
        },
    },
    {
        name: "Vue.js",
        category: "Library",
        icon: "🟢",
        detect: (doc) => {
            if (win("Vue") || win("__VUE__")) return 95;
            if (doc.querySelector("[data-v-]") || doc.querySelector("[data-v-app]")) return 88;
            // Check for Vue 3 app markers
            const allEls = doc.querySelectorAll("*");
            for (const el of Array.from(allEls).slice(0, 50)) {
                for (const attr of Array.from(el.attributes)) {
                    if (attr.name.startsWith("data-v-")) return 85;
                }
            }
            return 0;
        },
    },
    {
        name: "Angular",
        category: "Framework",
        icon: "🅰️",
        detect: (doc) => {
            if (win("ng") || win("angular")) return 95;
            if (doc.querySelector("[ng-app]") || doc.querySelector("[ng-controller]")) return 90;
            if (doc.querySelector("app-root") || doc.querySelector("[_nghost]")) return 88;
            // Angular 2+ specific attributes
            const allEls = doc.querySelectorAll("*");
            for (const el of Array.from(allEls).slice(0, 50)) {
                for (const attr of Array.from(el.attributes)) {
                    if (attr.name.startsWith("_ngcontent") || attr.name.startsWith("_nghost")) return 85;
                }
            }
            return 0;
        },
    },
    {
        name: "jQuery",
        category: "Library",
        icon: "📜",
        detect: (doc) => {
            if (win("jQuery") || win("$")?.fn?.jquery) return 95;
            if (scriptSrcContains(doc, "jquery")) return 85;
            return 0;
        },
    },

    // ── CMS / Platforms ────────────
    {
        name: "WordPress",
        category: "CMS",
        icon: "📝",
        detect: (doc) => {
            if (win("wp") && win("wp").customize) return 95;
            if (generatorContains(doc, "wordpress")) return 92;
            if (scriptSrcContains(doc, "/wp-content/") || scriptSrcContains(doc, "/wp-includes/")) return 90;
            if (linkHrefContains(doc, "/wp-content/")) return 88;
            if (doc.querySelector('link[rel="https://api.w.org/"]')) return 85;
            return 0;
        },
    },
    {
        name: "Shopify",
        category: "E-commerce",
        icon: "🛍️",
        detect: (doc) => {
            if (win("Shopify") && win("Shopify").shop) return 98;
            if (win("Shopify")) return 95;
            if (scriptSrcContains(doc, "cdn.shopify.com")) return 92;
            if (linkHrefContains(doc, "cdn.shopify.com")) return 90;
            if (doc.querySelector('meta[name="shopify-checkout-api-token"]')) return 90;
            if (doc.querySelector('link[href*="shopify"]')) return 80;
            // Check for Shopify-specific elements
            if (doc.querySelector('[data-shopify]') || doc.querySelector('input[name="checkout_url"]')) return 82;
            return 0;
        },
    },
    {
        name: "Shopify Theme",
        category: "E-commerce",
        icon: "🎨",
        detect: (doc) => {
            const shopify = win("Shopify");
            if (shopify?.theme?.name) return 95;
            if (shopify?.theme) return 90;
            // Check for Liquid template markers
            if (doc.querySelector('[data-section-type]') || doc.querySelector('.shopify-section')) return 80;
            return 0;
        },
    },
    {
        name: "Wix",
        category: "CMS",
        icon: "🔲",
        detect: (doc) => {
            if (win("wixBiSession")) return 95;
            if (generatorContains(doc, "wix")) return 90;
            if (scriptSrcContains(doc, "static.wixstatic.com")) return 88;
            return 0;
        },
    },
    {
        name: "Squarespace",
        category: "CMS",
        icon: "⬛",
        detect: (doc) => {
            if (win("Static") && win("SQUARESPACE_CONTEXT")) return 95;
            if (generatorContains(doc, "squarespace")) return 92;
            return 0;
        },
    },
    {
        name: "Webflow",
        category: "CMS",
        icon: "🌐",
        detect: (doc) => {
            if (generatorContains(doc, "webflow")) return 95;
            if (doc.querySelector("html.w-mod-js")) return 88;
            if (scriptSrcContains(doc, "webflow")) return 85;
            return 0;
        },
    },

    // ── Styling ────────────────────
    {
        name: "Tailwind CSS",
        category: "Styling",
        icon: "🎨",
        detect: (doc) => {
            // Check for common Tailwind utility classes
            const classes = (doc instanceof Document ? doc.body?.className : doc.getAttribute("class")) ?? "";
            const allClasses = doc.innerHTML?.slice(0, 5000) ?? "";
            const patterns = ["flex", "grid", "mt-", "p-", "text-", "bg-", "rounded", "shadow"];
            const matchCount = patterns.filter(
                (p) => classes.includes(p) || allClasses.includes(`class="${p}`) || allClasses.includes(` ${p}`)
            ).length;
            if (matchCount >= 4) return 85;
            if (matchCount >= 2) return 60;
            return 0;
        },
    },
    {
        name: "Bootstrap",
        category: "Styling",
        icon: "🅱️",
        detect: (doc) => {
            if (linkHrefContains(doc, "bootstrap")) return 90;
            if (scriptSrcContains(doc, "bootstrap")) return 88;
            if (doc.querySelector(".container") && doc.querySelector(".row") && doc.querySelector("[class*='col-']")) return 75;
            return 0;
        },
    },

    // ── Analytics & Tracking ───────
    {
        name: "Google Analytics",
        category: "Analytics",
        icon: "📊",
        detect: (doc) => {
            if (win("ga") || win("gtag")) return 95;
            if (win("dataLayer")) return 88;
            if (scriptSrcContains(doc, "google-analytics.com") || scriptSrcContains(doc, "googletagmanager.com")) return 90;
            return 0;
        },
    },
    {
        name: "Google Tag Manager",
        category: "Analytics",
        icon: "🏷️",
        detect: (doc) => {
            if (win("google_tag_manager")) return 95;
            if (scriptSrcContains(doc, "googletagmanager.com/gtm")) return 90;
            if (doc.querySelector('noscript iframe[src*="googletagmanager"]')) return 85;
            return 0;
        },
    },
    {
        name: "Facebook Pixel",
        category: "Analytics",
        icon: "📘",
        detect: (doc) => {
            if (win("fbq")) return 95;
            if (scriptSrcContains(doc, "connect.facebook.net")) return 90;
            return 0;
        },
    },
    {
        name: "Hotjar",
        category: "Analytics",
        icon: "🔥",
        detect: (doc) => {
            if (win("hj") || win("hotjar")) return 95;
            if (scriptSrcContains(doc, "hotjar.com")) return 90;
            return 0;
        },
    },

    // ── Hosting / CDN ──────────────
    {
        name: "Vercel",
        category: "Hosting",
        icon: "▲",
        detect: (doc) => {
            if (win("__NEXT_DATA__") && doc.querySelector('meta[name="x-vercel"]')) return 90;
            // X-Vercel header can't be read from JS, but Vercel analytics can
            if (scriptSrcContains(doc, "vercel-analytics") || scriptSrcContains(doc, "va.vercel-scripts.com")) return 85;
            return 0;
        },
    },
    {
        name: "Cloudflare",
        category: "CDN",
        icon: "☁️",
        detect: (doc) => {
            if (scriptSrcContains(doc, "cloudflare") || scriptSrcContains(doc, "cdnjs.cloudflare.com")) return 80;
            if (doc.querySelector('script[data-cf-beacon]')) return 90;
            return 0;
        },
    },

    // ── Payments ───────────────────
    {
        name: "Stripe",
        category: "Payments",
        icon: "💳",
        detect: (doc) => {
            if (win("Stripe")) return 95;
            if (scriptSrcContains(doc, "js.stripe.com")) return 92;
            return 0;
        },
    },
    {
        name: "PayPal",
        category: "Payments",
        icon: "💰",
        detect: (doc) => {
            if (win("paypal")) return 95;
            if (scriptSrcContains(doc, "paypal.com/sdk")) return 92;
            return 0;
        },
    },
];

/**
 * Run all technology detections and return those with confidence > 0.
 * Sorted by confidence (highest first).
 */
export function detectTech(doc: Document | Element = document): TechInfo[] {
    const results: TechInfo[] = [];

    for (const d of detections) {
        try {
            const confidence = d.detect(doc);
            if (confidence > 0) {
                results.push({
                    name: d.name,
                    category: d.category,
                    confidence,
                    icon: d.icon,
                });
            }
        } catch {
            // Silently skip any detection that throws
        }
    }

    // Special: append Shopify theme name if detected
    try {
        const shopify = win("Shopify");
        if (shopify?.theme?.name) {
            const themeEntry = results.find((r) => r.name === "Shopify Theme");
            if (themeEntry) {
                themeEntry.name = `Shopify Theme: ${shopify.theme.name}`;
            }
        }
    } catch {
        // ignore
    }

    return results.sort((a, b) => b.confidence - a.confidence);
}
