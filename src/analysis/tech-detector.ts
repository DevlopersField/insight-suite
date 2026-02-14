import type { TechInfo } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Detection {
    name: string;
    category: string;
    icon: string;
    detect: () => number; // returns confidence 0–100
}

/** Safely access a window property. */
function win(key: string): any {
    try {
        return (window as any)[key];
    } catch {
        return undefined;
    }
}

/** Check if any <script> src contains a pattern. */
function scriptSrcContains(pattern: string): boolean {
    return Array.from(document.querySelectorAll("script[src]")).some((s) =>
        (s as HTMLScriptElement).src.includes(pattern)
    );
}

/** Check if any <link> href contains a pattern. */
function linkHrefContains(pattern: string): boolean {
    return Array.from(document.querySelectorAll("link[href]")).some((l) =>
        (l as HTMLLinkElement).href.includes(pattern)
    );
}

/** Check if a meta[name="generator"] contains a value (case-insensitive). */
function generatorContains(keyword: string): boolean {
    const gen = document.querySelector('meta[name="generator"]');
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
        detect: () => {
            if (win("__NEXT_DATA__")) return 98;
            if (scriptSrcContains("/_next/")) return 90;
            if (document.getElementById("__next")) return 85;
            return 0;
        },
    },
    {
        name: "Nuxt.js",
        category: "Framework",
        icon: "💚",
        detect: () => {
            if (win("__NUXT__")) return 95;
            if (document.getElementById("__nuxt")) return 85;
            return 0;
        },
    },
    {
        name: "Gatsby",
        category: "Framework",
        icon: "🟣",
        detect: () => {
            if (document.getElementById("___gatsby")) return 92;
            if (scriptSrcContains("/page-data/")) return 80;
            return 0;
        },
    },

    // ── Libraries ──────────────────
    {
        name: "React",
        category: "Library",
        icon: "⚛️",
        detect: () => {
            if (win("React") || win("__REACT_DEVTOOLS_GLOBAL_HOOK__")) return 95;
            if (document.querySelector("[data-reactroot]")) return 90;
            const root = document.getElementById("root") || document.getElementById("__next");
            if (root && (root as any)._reactRootContainer) return 92;
            // Check for React-specific attributes in DOM
            if (document.querySelector("[data-reactid]")) return 85;
            return 0;
        },
    },
    {
        name: "Vue.js",
        category: "Library",
        icon: "🟢",
        detect: () => {
            if (win("Vue") || win("__VUE__")) return 95;
            if (document.querySelector("[data-v-]") || document.querySelector("[data-v-app]")) return 88;
            // Check for Vue 3 app markers
            const allEls = document.querySelectorAll("*");
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
        detect: () => {
            if (win("ng") || win("angular")) return 95;
            if (document.querySelector("[ng-app]") || document.querySelector("[ng-controller]")) return 90;
            if (document.querySelector("app-root") || document.querySelector("[_nghost]")) return 88;
            // Angular 2+ specific attributes
            const allEls = document.querySelectorAll("*");
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
        detect: () => {
            if (win("jQuery") || win("$")?.fn?.jquery) return 95;
            if (scriptSrcContains("jquery")) return 85;
            return 0;
        },
    },

    // ── CMS / Platforms ────────────
    {
        name: "WordPress",
        category: "CMS",
        icon: "📝",
        detect: () => {
            if (win("wp") && win("wp").customize) return 95;
            if (generatorContains("wordpress")) return 92;
            if (scriptSrcContains("/wp-content/") || scriptSrcContains("/wp-includes/")) return 90;
            if (linkHrefContains("/wp-content/")) return 88;
            if (document.querySelector('link[rel="https://api.w.org/"]')) return 85;
            return 0;
        },
    },
    {
        name: "Shopify",
        category: "E-commerce",
        icon: "🛍️",
        detect: () => {
            if (win("Shopify") && win("Shopify").shop) return 98;
            if (win("Shopify")) return 95;
            if (scriptSrcContains("cdn.shopify.com")) return 92;
            if (linkHrefContains("cdn.shopify.com")) return 90;
            if (document.querySelector('meta[name="shopify-checkout-api-token"]')) return 90;
            if (document.querySelector('link[href*="shopify"]')) return 80;
            // Check for Shopify-specific elements
            if (document.querySelector('[data-shopify]') || document.querySelector('input[name="checkout_url"]')) return 82;
            return 0;
        },
    },
    {
        name: "Shopify Theme",
        category: "E-commerce",
        icon: "🎨",
        detect: () => {
            const shopify = win("Shopify");
            if (shopify?.theme?.name) return 95;
            if (shopify?.theme) return 90;
            // Check for Liquid template markers
            if (document.querySelector('[data-section-type]') || document.querySelector('.shopify-section')) return 80;
            return 0;
        },
    },
    {
        name: "Wix",
        category: "CMS",
        icon: "🔲",
        detect: () => {
            if (win("wixBiSession")) return 95;
            if (generatorContains("wix")) return 90;
            if (scriptSrcContains("static.wixstatic.com")) return 88;
            return 0;
        },
    },
    {
        name: "Squarespace",
        category: "CMS",
        icon: "⬛",
        detect: () => {
            if (win("Static") && win("SQUARESPACE_CONTEXT")) return 95;
            if (generatorContains("squarespace")) return 92;
            return 0;
        },
    },
    {
        name: "Webflow",
        category: "CMS",
        icon: "🌐",
        detect: () => {
            if (generatorContains("webflow")) return 95;
            if (document.querySelector("html.w-mod-js")) return 88;
            if (scriptSrcContains("webflow")) return 85;
            return 0;
        },
    },

    // ── Styling ────────────────────
    {
        name: "Tailwind CSS",
        category: "Styling",
        icon: "🎨",
        detect: () => {
            // Check for common Tailwind utility classes
            const classes = document.body?.className ?? "";
            const allClasses = document.body?.innerHTML?.slice(0, 5000) ?? "";
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
        detect: () => {
            if (linkHrefContains("bootstrap")) return 90;
            if (scriptSrcContains("bootstrap")) return 88;
            if (document.querySelector(".container") && document.querySelector(".row") && document.querySelector("[class*='col-']")) return 75;
            return 0;
        },
    },

    // ── Analytics & Tracking ───────
    {
        name: "Google Analytics",
        category: "Analytics",
        icon: "📊",
        detect: () => {
            if (win("ga") || win("gtag")) return 95;
            if (win("dataLayer")) return 88;
            if (scriptSrcContains("google-analytics.com") || scriptSrcContains("googletagmanager.com")) return 90;
            return 0;
        },
    },
    {
        name: "Google Tag Manager",
        category: "Analytics",
        icon: "🏷️",
        detect: () => {
            if (win("google_tag_manager")) return 95;
            if (scriptSrcContains("googletagmanager.com/gtm")) return 90;
            if (document.querySelector('noscript iframe[src*="googletagmanager"]')) return 85;
            return 0;
        },
    },
    {
        name: "Facebook Pixel",
        category: "Analytics",
        icon: "📘",
        detect: () => {
            if (win("fbq")) return 95;
            if (scriptSrcContains("connect.facebook.net")) return 90;
            return 0;
        },
    },
    {
        name: "Hotjar",
        category: "Analytics",
        icon: "🔥",
        detect: () => {
            if (win("hj") || win("hotjar")) return 95;
            if (scriptSrcContains("hotjar.com")) return 90;
            return 0;
        },
    },

    // ── Hosting / CDN ──────────────
    {
        name: "Vercel",
        category: "Hosting",
        icon: "▲",
        detect: () => {
            if (win("__NEXT_DATA__") && document.querySelector('meta[name="x-vercel"]')) return 90;
            // X-Vercel header can't be read from JS, but Vercel analytics can
            if (scriptSrcContains("vercel-analytics") || scriptSrcContains("va.vercel-scripts.com")) return 85;
            return 0;
        },
    },
    {
        name: "Cloudflare",
        category: "CDN",
        icon: "☁️",
        detect: () => {
            if (scriptSrcContains("cloudflare") || scriptSrcContains("cdnjs.cloudflare.com")) return 80;
            if (document.querySelector('script[data-cf-beacon]')) return 90;
            return 0;
        },
    },

    // ── Payments ───────────────────
    {
        name: "Stripe",
        category: "Payments",
        icon: "💳",
        detect: () => {
            if (win("Stripe")) return 95;
            if (scriptSrcContains("js.stripe.com")) return 92;
            return 0;
        },
    },
    {
        name: "PayPal",
        category: "Payments",
        icon: "💰",
        detect: () => {
            if (win("paypal")) return 95;
            if (scriptSrcContains("paypal.com/sdk")) return 92;
            return 0;
        },
    },
];

/**
 * Run all technology detections and return those with confidence > 0.
 * Sorted by confidence (highest first).
 */
export function detectTech(): TechInfo[] {
    const results: TechInfo[] = [];

    for (const d of detections) {
        try {
            const confidence = d.detect();
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
