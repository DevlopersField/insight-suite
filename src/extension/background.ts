import { auditSecurityHeaders } from "../analysis/security-auditor";
import type { AuditData, DomScanResult } from "../analysis/types";

/**
 * Background Service Worker for the Chrome Extension.
 *
 * Responsibilities:
 * 1. Listen for ANALYZE_PAGE messages from the popup
 * 2. Inject the content script into the active tab
 * 3. Collect DOM scan results from the content script
 * 4. Fetch HTTP headers for security audit (has no CORS restrictions)
 * 5. Merge everything into a single AuditData object and return
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "ANALYZE_PAGE") {
        handleAnalyzePage(message.tabId)
            .then((data) => sendResponse({ type: "ANALYSIS_RESULT", data }))
            .catch((err) =>
                sendResponse({
                    type: "ANALYSIS_ERROR",
                    error: err instanceof Error ? err.message : "Analysis failed",
                })
            );
        return true; // Keep the message channel open for async response
    }
});

async function handleAnalyzePage(requestedTabId?: number): Promise<AuditData> {
    // 1. Get the active tab
    let tabId = requestedTabId;
    let tabUrl = "";

    if (!tabId) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !tab?.url) throw new Error("No active tab found");
        tabId = tab.id;
        tabUrl = tab.url;
    } else {
        const tab = await chrome.tabs.get(tabId);
        tabUrl = tab.url ?? "";
    }

    // 2. Validate URL (can't scan chrome:// or extension pages)
    if (
        tabUrl.startsWith("chrome://") ||
        tabUrl.startsWith("chrome-extension://") ||
        tabUrl.startsWith("about:")
    ) {
        throw new Error("Cannot analyze browser internal pages. Navigate to a website first.");
    }

    // 3. Inject and execute the content script
    const injectionResults = await chrome.scripting.executeScript({
        target: { tabId },
        func: injectedContentScan,
        world: "MAIN", // Access window globals (for tech detection)
    });

    const scanResult = injectionResults?.[0]?.result as DomScanResult | null;
    if (!scanResult) throw new Error("Content script did not return results");

    // 4. Audit security headers (only for web pages)
    const security = tabUrl.startsWith('http')
        ? await auditSecurityHeaders(tabUrl)
        : [];

    // 5. Audit link status (background can bypass CORS)
    // We only check the first 50 links to avoid excessive resource usage
    const links = [...scanResult.links];
    const uniqueLinks = Array.from(new Set(links.map(l => l.href)))
        .filter(url => url && typeof url === 'string' && url.toLowerCase().startsWith('http'))
        .slice(0, 50);

    const linkStatuses = await Promise.all(
        uniqueLinks.map(async (url) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const res = await fetch(url, {
                    method: 'HEAD',
                    mode: 'no-cors', // We try to get whatever we can
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return { url, status: res.status, statusText: res.statusText };
            } catch (e) {
                return { url, status: 0, statusText: "Error/Timeout" };
            }
        })
    );

    // Map statuses back to links
    const statusMap = new Map(linkStatuses.map(s => [s.url, s]));
    const enrichedLinks = links.map(link => {
        const stats = statusMap.get(link.href);
        if (stats) {
            return {
                ...link,
                status: stats.status,
                statusText: stats.statusText,
                isBroken: stats.status >= 400 || stats.status === 0
            };
        }
        return link;
    });

    // 6. Audit image sizes (background can bypass CORS)
    const images = [...scanResult.images];
    const uniqueImageUrls = Array.from(new Set(images.map(img => img.src)))
        .filter(src => src && typeof src === 'string' && src.toLowerCase().startsWith('http'))
        .slice(0, 50); // Limit to top 50 images to avoid performance issues

    const imageSizes = await Promise.all(
        uniqueImageUrls.map(async (url) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000);

                // Try HEAD first
                let res = await fetch(url, {
                    method: 'HEAD',
                    signal: controller.signal
                });

                let size = res.headers.get('content-length');

                // If HEAD fails or has no size, try GET with a tiny range or just regular GET
                if (!size || parseInt(size) === 0) {
                    res = await fetch(url, {
                        method: 'GET',
                        headers: { 'Range': 'bytes=0-1' }, // Support range if server allows
                        signal: controller.signal
                    });
                    size = res.headers.get('content-length');

                    // If range failed or we got the whole thing, check content-range or length
                    const contentRange = res.headers.get('content-range');
                    if (contentRange) {
                        const match = contentRange.match(/\/(\d+)$/);
                        if (match) size = match[1];
                    }
                }

                clearTimeout(timeoutId);
                return { url, size: size ? parseInt(size, 10) : undefined };
            } catch (e) {
                return { url, size: undefined };
            }
        })
    );

    const imageSizeMap = new Map(imageSizes.map(s => [s.url, s.size]));
    const enrichedImages = images.map(img => {
        let size = img.size;
        if (img.src.startsWith('data:')) {
            size = Math.round((img.src.length - img.src.indexOf(',') - 1) * 0.75);
        } else if (!size) {
            size = imageSizeMap.get(img.src);
        }
        return { ...img, size };
    });

    // 7. Merge into final AuditData
    const auditData: AuditData = {
        ...scanResult,
        images: enrichedImages,
        links: enrichedLinks,
        security,
    };

    return auditData;
}

/**
 * This function is serialized and injected into the page via executeScript.
 * It must be self-contained — all dependencies are inlined.
 */
function injectedContentScan(): DomScanResult {
    // ─── Inline: DOM Scanner ─────────────────────────────────────

    function getMeta(attr: string, value: string): string {
        const el = document.querySelector(`meta[${attr}="${value}"]`);
        return el?.getAttribute("content") ?? "";
    }

    const title = document.title ?? "";
    const description = getMeta("name", "description");
    const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement)?.href ?? "";
    const robots = getMeta("name", "robots") || "index, follow";
    const author = getMeta("name", "author");
    const language = document.documentElement.lang ?? "";
    const charsetMeta = document.querySelector("meta[charset]");
    const charset = charsetMeta?.getAttribute("charset") ?? "UTF-8";
    const viewport = getMeta("name", "viewport");

    const headers = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((el, i) => ({
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 200),
        order: i + 1,
    }));

    const images = Array.from((document.body || document).querySelectorAll("img")).map((img) => {
        const src = img.src || img.getAttribute("data-src") || "";
        let size: number | undefined;

        // Try Performance API for sizes (if TAO is set or same-origin)
        try {
            const entry = performance.getEntriesByName(src)[0] as PerformanceResourceTiming;
            if (entry && entry.encodedBodySize > 0) {
                size = entry.encodedBodySize;
            } else if (entry && entry.transferSize > 0) {
                size = entry.transferSize;
            }
        } catch { }

        let type = "unknown";
        try {
            const activeSrc = img.currentSrc || src;
            if (!activeSrc) {
                type = "none";
            } else if (activeSrc.startsWith('data:')) {
                const match = activeSrc.match(/^data:image\/([a-zA-Z0-9+-]+);/);
                type = match ? match[1].split('+')[0].toLowerCase() : "data";
            } else {
                const patterns = [
                    /\.(webp|avif|png|jpg|jpeg|svg|gif|ico|bmp)(?:\?|#|$)/i,
                    /[?&](?:format|fm|ext|type|output)=([^&?#]+)/i,
                    /\/(webp|avif|png|jpg|jpeg|svg|gif|ico|bmp)(?:\/|$)/i
                ];
                for (const reg of patterns) {
                    const match = activeSrc.match(reg);
                    if (match && match[1]) {
                        type = match[1].toLowerCase();
                        break;
                    }
                }
                if (type === "unknown") {
                    const picture = img.closest('picture');
                    if (picture) {
                        const source = picture.querySelector('source');
                        if (source && source.type) {
                            type = source.type.split('/')[1]?.split('+')[0].toLowerCase() || "unknown";
                        }
                    }
                }
                if (type === "unknown") {
                    const keywords = ["webp", "avif", "png", "jpg", "jpeg", "svg", "gif", "ico", "bmp"];
                    const lowerSrc = activeSrc.toLowerCase();
                    for (const k of keywords) {
                        if (new RegExp(`\\b${k}\\b|\\.${k}`, 'i').test(lowerSrc)) {
                            type = k;
                            break;
                        }
                    }
                }
            }
        } catch { type = "err"; }
        if (type === 'jpeg') type = 'jpg';
        if (type === 'unknown') type = 'img';

        return {
            src,
            alt: img.alt ?? "",
            title: img.title ?? "",
            width: img.naturalWidth || img.width || 0,
            height: img.naturalHeight || img.height || 0,
            type,
            size
        };
    });

    const videos = Array.from(document.querySelectorAll("iframe")).map(iframe => {
        const src = iframe.src || "";
        if (src.includes("youtube.com") || src.includes("youtu.be")) {
            return { type: "youtube" as const, url: src, hasSchema: false, id: src.split("/").pop() || "" };
        }
        if (src.includes("vimeo.com")) {
            return { type: "vimeo" as const, url: src, hasSchema: false, id: src.split("/").pop() || "" };
        }
        return null;
    }).filter(Boolean);

    const currentHost = window.location.hostname;
    const links = Array.from(document.querySelectorAll("a[href]")).map((a) => {
        const anchor = a as HTMLAnchorElement;
        let isExternal = false;
        try {
            isExternal = new URL(anchor.href, window.location.href).hostname !== currentHost;
        } catch { /* malformed */ }
        return {
            href: anchor.href,
            text: (anchor.textContent ?? "").trim().slice(0, 120),
            rel: anchor.rel ?? "",
            isExternal,
        };
    });

    const social = {
        ogTitle: getMeta("property", "og:title"),
        ogDescription: getMeta("property", "og:description"),
        ogImage: getMeta("property", "og:image"),
        ogUrl: getMeta("property", "og:url"),
        ogType: getMeta("property", "og:type"),
        twitterCard: getMeta("name", "twitter:card"),
        twitterTitle: getMeta("name", "twitter:title"),
        twitterDescription: getMeta("name", "twitter:description"),
        twitterImage: getMeta("name", "twitter:image"),
        twitterSite: getMeta("name", "twitter:site"),
    };

    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap(script => {
        try {
            const json = JSON.parse(script.textContent || "");
            const items = (Array.isArray(json) ? json : [json]).flatMap(root => {
                if (root["@graph"] && Array.isArray(root["@graph"])) {
                    return root["@graph"];
                }
                return [root];
            });
            return items.map(item => {
                const type = item["@type"] || "unknown";
                const errors: string[] = [];
                const warnings: string[] = [];
                if ((type === "Article" || type === "NewsArticle" || type === "BlogPosting") && !item.headline) errors.push("Missing headline");
                if (type === "Product" && !item.name) errors.push("Missing name");
                return {
                    type: Array.isArray(type) ? type.join(", ") : type,
                    data: item,
                    isValid: errors.length === 0,
                    errors,
                    warnings
                };
            });
        } catch { return []; }
    });

    // ─── Inline: Tech Detector ───────────────────────────────────

    function winProp(key: string): any {
        try { return (window as any)[key]; } catch { return undefined; }
    }

    function scriptSrcHas(pattern: string): boolean {
        return Array.from(document.querySelectorAll("script[src]")).some(s => (s as HTMLScriptElement).src.includes(pattern));
    }

    function linkHrefHas(pattern: string): boolean {
        return Array.from(document.querySelectorAll("link[href]")).some(l => (l as HTMLLinkElement).href.includes(pattern));
    }

    function genContains(kw: string): boolean {
        const gen = document.querySelector('meta[name="generator"]');
        return gen ? (gen.getAttribute("content") ?? "").toLowerCase().includes(kw.toLowerCase()) : false;
    }

    const techDetections: { name: string; category: string; icon: string; detect: () => number }[] = [
        { name: "Next.js", category: "Framework", icon: "⚡", detect: () => { if (winProp("__NEXT_DATA__")) return 98; if (scriptSrcHas("/_next/")) return 90; if (document.getElementById("__next")) return 85; return 0; } },
        { name: "Nuxt.js", category: "Framework", icon: "💚", detect: () => { if (winProp("__NUXT__")) return 95; if (document.getElementById("__nuxt")) return 85; return 0; } },
        { name: "Gatsby", category: "Framework", icon: "🟣", detect: () => { if (document.getElementById("___gatsby")) return 92; return 0; } },
        { name: "React", category: "Library", icon: "⚛️", detect: () => { if (winProp("React") || winProp("__REACT_DEVTOOLS_GLOBAL_HOOK__")) return 95; if (document.querySelector("[data-reactroot]")) return 90; return 0; } },
        { name: "Vue.js", category: "Library", icon: "🟢", detect: () => { if (winProp("Vue") || winProp("__VUE__")) return 95; const els = document.querySelectorAll("*"); for (const el of Array.from(els).slice(0, 50)) { for (const attr of Array.from(el.attributes)) { if (attr.name.startsWith("data-v-")) return 85; } } return 0; } },
        { name: "Angular", category: "Framework", icon: "🅰️", detect: () => { if (winProp("ng") || winProp("angular")) return 95; if (document.querySelector("[ng-app]")) return 90; const els = document.querySelectorAll("*"); for (const el of Array.from(els).slice(0, 50)) { for (const attr of Array.from(el.attributes)) { if (attr.name.startsWith("_ngcontent") || attr.name.startsWith("_nghost")) return 85; } } return 0; } },
        { name: "jQuery", category: "Library", icon: "📜", detect: () => { if (winProp("jQuery")) return 95; if (scriptSrcHas("jquery")) return 85; return 0; } },
        { name: "WordPress", category: "CMS", icon: "📝", detect: () => { if (genContains("wordpress")) return 92; if (scriptSrcHas("/wp-content/") || scriptSrcHas("/wp-includes/")) return 90; if (linkHrefHas("/wp-content/")) return 88; if (document.querySelector('link[rel="https://api.w.org/"]')) return 85; return 0; } },
        { name: "Shopify", category: "E-commerce", icon: "🛍️", detect: () => { if (winProp("Shopify")?.shop) return 98; if (winProp("Shopify")) return 95; if (scriptSrcHas("cdn.shopify.com")) return 92; if (linkHrefHas("cdn.shopify.com")) return 90; if (document.querySelector('meta[name="shopify-checkout-api-token"]')) return 90; return 0; } },
        { name: "Shopify Theme", category: "E-commerce", icon: "🎨", detect: () => { const s = winProp("Shopify"); if (s?.theme?.name) return 95; if (s?.theme) return 90; if (document.querySelector(".shopify-section")) return 80; return 0; } },
        { name: "Wix", category: "CMS", icon: "🔲", detect: () => { if (winProp("wixBiSession")) return 95; if (genContains("wix")) return 90; return 0; } },
        { name: "Squarespace", category: "CMS", icon: "⬛", detect: () => { if (winProp("SQUARESPACE_CONTEXT")) return 95; if (genContains("squarespace")) return 92; return 0; } },
        { name: "Webflow", category: "CMS", icon: "🌐", detect: () => { if (genContains("webflow")) return 95; if (document.querySelector("html.w-mod-js")) return 88; return 0; } },
        { name: "Tailwind CSS", category: "Styling", icon: "🎨", detect: () => { const html = document.body?.innerHTML?.slice(0, 5000) ?? ""; const pats = ["flex", "mt-", "p-", "text-", "bg-", "rounded"]; const m = pats.filter(p => html.includes(p)).length; if (m >= 4) return 85; if (m >= 2) return 60; return 0; } },
        { name: "Bootstrap", category: "Styling", icon: "🅱️", detect: () => { if (linkHrefHas("bootstrap")) return 90; if (scriptSrcHas("bootstrap")) return 88; return 0; } },
        { name: "Google Analytics", category: "Analytics", icon: "📊", detect: () => { if (winProp("ga") || winProp("gtag")) return 95; if (winProp("dataLayer")) return 88; if (scriptSrcHas("google-analytics.com") || scriptSrcHas("googletagmanager.com")) return 90; return 0; } },
        { name: "Google Tag Manager", category: "Analytics", icon: "🏷️", detect: () => { if (winProp("google_tag_manager")) return 95; if (scriptSrcHas("googletagmanager.com/gtm")) return 90; return 0; } },
        { name: "Facebook Pixel", category: "Analytics", icon: "📘", detect: () => { if (winProp("fbq")) return 95; if (scriptSrcHas("connect.facebook.net")) return 90; return 0; } },
        { name: "Hotjar", category: "Analytics", icon: "🔥", detect: () => { if (winProp("hj")) return 95; if (scriptSrcHas("hotjar.com")) return 90; return 0; } },
        { name: "Stripe", category: "Payments", icon: "💳", detect: () => { if (winProp("Stripe")) return 95; if (scriptSrcHas("js.stripe.com")) return 92; return 0; } },
        { name: "PayPal", category: "Payments", icon: "💰", detect: () => { if (winProp("paypal")) return 95; if (scriptSrcHas("paypal.com/sdk")) return 92; return 0; } },
        { name: "Cloudflare", category: "CDN", icon: "☁️", detect: () => { if (document.querySelector("script[data-cf-beacon]")) return 90; if (scriptSrcHas("cdnjs.cloudflare.com")) return 80; return 0; } },
    ];

    const tech: { name: string; category: string; confidence: number; icon: string }[] = [];
    for (const d of techDetections) {
        try {
            const c = d.detect();
            if (c > 0) tech.push({ name: d.name, category: d.category, confidence: c, icon: d.icon });
        } catch { /* skip */ }
    }

    // Append Shopify theme name
    try {
        const shopify = winProp("Shopify");
        if (shopify?.theme?.name) {
            const t = tech.find(r => r.name === "Shopify Theme");
            if (t) t.name = `Shopify Theme: ${shopify.theme.name}`;
        }
    } catch { }

    tech.sort((a, b) => b.confidence - a.confidence);

    // ─── Inline: Font Scanner ────────────────────────────────────

    function googleFontsUrl(family: string): string {
        return `https://fonts.google.com/specimen/${encodeURIComponent(family.trim())}`;
    }

    const fontMap = new Map<string, any>();

    // Google Fonts links
    for (const link of Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"]'))) {
        try {
            const href = (link as HTMLLinkElement).href;
            const url = new URL(href);
            const familyParams = url.searchParams.getAll("family");
            const families: string[] = [];
            for (const fp of familyParams) { const n = fp.split(":")[0].replace(/\+/g, " ").trim(); if (n) families.push(n); }
            if (families.length === 0) {
                const legacy = url.searchParams.get("family");
                if (legacy) for (const f of legacy.split("|")) { const n = f.split(":")[0].replace(/\+/g, " ").trim(); if (n) families.push(n); }
            }
            for (const fam of families) {
                if (!fontMap.has(fam)) fontMap.set(fam, { family: fam, source: "google", weights: [], styles: ["normal"], url: googleFontsUrl(fam), cssUrl: href });
            }
        } catch { /* skip */ }
    }

    // @font-face from stylesheets
    try {
        for (const sheet of Array.from(document.styleSheets)) {
            let rules: CSSRuleList;
            try { rules = sheet.cssRules; } catch { continue; }
            for (const rule of Array.from(rules)) {
                if (rule instanceof CSSFontFaceRule) {
                    const family = rule.style.getPropertyValue("font-family").replace(/^["']|["']$/g, "").trim();
                    const src = rule.style.getPropertyValue("src");
                    const weight = rule.style.getPropertyValue("font-weight") || "400";
                    const fStyle = rule.style.getPropertyValue("font-style") || "normal";
                    if (!family) continue;
                    const existing = fontMap.get(family);
                    if (existing) {
                        if (!existing.weights.includes(weight)) existing.weights.push(weight);
                        if (!existing.styles.includes(fStyle)) existing.styles.push(fStyle);
                    } else {
                        let source = "custom";
                        if (src.includes("fonts.gstatic.com") || src.includes("fonts.googleapis.com")) source = "google";
                        else if (src.includes("typekit")) source = "typekit";
                        const urlMatch = src.match(/url\(["']?([^"')]+)["']?\)/);
                        fontMap.set(family, { family, source, weights: [weight], styles: [fStyle], url: source === "google" ? googleFontsUrl(family) : null, cssUrl: urlMatch ? urlMatch[1] : null });
                    }
                }
            }
        }
    } catch { /* can't access stylesheets */ }

    // FontFace API
    try {
        if (document.fonts) {
            document.fonts.forEach((face: FontFace) => {
                const fam = face.family.replace(/^["']|["']$/g, "").trim();
                if (!fam) return;
                const existing = fontMap.get(fam);
                if (existing) {
                    const w = face.weight || "400";
                    const s = face.style || "normal";
                    if (!existing.weights.includes(w)) existing.weights.push(w);
                    if (!existing.styles.includes(s)) existing.styles.push(s);
                }
            });
        }
    } catch { }

    // Known Google Fonts detection from computed styles
    const KNOWN = new Set(["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Oswald", "Source Sans Pro", "Nunito", "Playfair Display", "Merriweather", "Ubuntu", "Noto Sans", "PT Sans", "Rubik", "Work Sans", "Fira Sans", "Quicksand", "Barlow", "Mulish", "DM Sans", "Outfit", "Space Grotesk", "Plus Jakarta Sans", "Manrope", "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Sans", "Lexend", "Geist"]);
    const checkEls = [document.body, document.querySelector("h1"), document.querySelector("h2"), document.querySelector("p")].filter(Boolean) as Element[];
    for (const el of checkEls) {
        try {
            const ff = getComputedStyle(el).fontFamily;
            if (!ff) continue;
            for (const f of ff.split(",")) {
                const fam = f.trim().replace(/^["']|["']$/g, "");
                if (!fam || fontMap.has(fam)) continue;
                const generics = ["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"];
                const isGoogle = KNOWN.has(fam);
                fontMap.set(fam, { family: fam, source: isGoogle ? "google" : "system", weights: [getComputedStyle(el).fontWeight || "400"], styles: [getComputedStyle(el).fontStyle || "normal"], url: isGoogle ? googleFontsUrl(fam) : null, cssUrl: null });
            }
        } catch { }
    }

    const fonts = Array.from(fontMap.values());

    return {
        url: window.location.href,
        title, titleLength: title.length,
        description, descriptionLength: description.length,
        canonical, robots, author, language, charset, viewport,
        headers, images, links, social,
        tech, fonts, videos, schemas,
    };
}
