import type { HeaderInfo, ImageInfo, LinkInfo, SocialData, VideoData, SchemaInfo } from "./types";

/** Extract the text content of a meta tag by name or property. */
function getMeta(doc: Document | Element, attr: "name" | "property", value: string): string {
    const el = doc.querySelector(`meta[${attr}="${value}"]`);
    return el?.getAttribute("content") ?? "";
}

/** Scan the page <title>, meta description, and core SEO fields. */
export function scanBasicSEO(doc: Document | Element = document, url?: string) {
    const title = (doc instanceof Document ? doc.title : (doc.querySelector('title')?.textContent ?? "")) || "";
    const description = getMeta(doc, "name", "description");
    const canonical =
        (doc.querySelector('link[rel="canonical"]') as HTMLLinkElement)
            ?.href ?? "";
    const robots = getMeta(doc, "name", "robots") || "index, follow";
    const author = getMeta(doc, "name", "author");
    const language = (doc instanceof Document ? doc.documentElement.lang : doc.getAttribute("lang")) ?? "";
    const charsetMeta = doc.querySelector("meta[charset]");
    const charset = charsetMeta?.getAttribute("charset") ?? "UTF-8";
    const viewport = getMeta(doc, "name", "viewport");

    return {
        url: url || (typeof window !== 'undefined' ? window.location.href : ""),
        title,
        titleLength: title.length,
        description,
        descriptionLength: description.length,
        canonical,
        robots,
        author,
        language,
        charset,
        viewport,
    };
}

/** Scan all heading elements (H1–H6) preserving document order. */
export function scanHeaders(doc: Document | Element = document): HeaderInfo[] {
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
    return Array.from(headings).map((el, i) => ({
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 200),
        order: i + 1,
    }));
}

/** Scan all <img> elements on the page. */
export function scanImages(doc: Document | Element = document, baseUrl?: string): ImageInfo[] {
    const imgs = doc.querySelectorAll("img");
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.href : "");

    return Array.from(imgs).map((img) => {
        const rawSrc = img.getAttribute("src") || img.getAttribute("data-src") || "";
        let src = rawSrc;
        let type = "unknown";

        // Resolve absolute URL
        if (rawSrc && !rawSrc.startsWith('data:')) {
            try {
                src = new URL(rawSrc, base).href;
            } catch {
                src = rawSrc;
            }
        }

        try {
            const activeSrc = img.getAttribute("currentSrc") || rawSrc;
            if (!activeSrc) {
                type = "none";
            } else if (activeSrc.startsWith('data:')) {
                const match = activeSrc.match(/^data:image\/([a-zA-Z0-9+-]+);/);
                type = match ? match[1].split('+')[0] : "data";
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
                        const wordBoundaryRegex = new RegExp(`\\b${k}\\b|\\.${k}`, 'i');
                        if (wordBoundaryRegex.test(lowerSrc)) {
                            type = k;
                            break;
                        }
                    }
                }
            }
        } catch {
            type = "err";
        }

        if (type === 'jpeg') type = 'jpg';
        if (type === 'unknown') type = 'img';

        return {
            src,
            alt: img.getAttribute("alt") ?? "",
            title: img.getAttribute("title") ?? "",
            width: (img as any).naturalWidth || (img as any).width || 0,
            height: (img as any).naturalHeight || (img as any).height || 0,
            type: type || "img",
        };
    });
}

/** Scan all <a> elements on the page. */
export function scanLinks(doc: Document | Element = document, baseUrl?: string): LinkInfo[] {
    const anchors = doc.querySelectorAll("a[href]");
    const currentHost = baseUrl ? new URL(baseUrl).hostname : (typeof window !== 'undefined' ? window.location.hostname : "");

    return Array.from(anchors).map((a) => {
        const anchor = a as HTMLAnchorElement;
        const rawHref = anchor.getAttribute("href") || "";
        let href = rawHref;
        let isExternal = false;
        try {
            const absoluteUrl = new URL(rawHref, baseUrl || (typeof window !== 'undefined' ? window.location.href : ""));
            href = absoluteUrl.href;
            isExternal = absoluteUrl.hostname !== currentHost;
        } catch { }

        return {
            href,
            text: (anchor.textContent ?? "").trim().slice(0, 120),
            rel: anchor.getAttribute("rel") ?? "",
            isExternal,
        };
    });
}

/** Scan Open Graph and Twitter Card meta tags. */
export function scanSocialTags(doc: Document | Element = document, baseUrl?: string): SocialData {
    const resolve = (val: string) => {
        if (!val || !baseUrl) return val;
        try { return new URL(val, baseUrl).href; } catch { return val; }
    };

    return {
        ogTitle: getMeta(doc, "property", "og:title"),
        ogDescription: getMeta(doc, "property", "og:description"),
        ogImage: resolve(getMeta(doc, "property", "og:image")),
        ogUrl: resolve(getMeta(doc, "property", "og:url")),
        ogType: getMeta(doc, "property", "og:type"),
        twitterCard: getMeta(doc, "name", "twitter:card"),
        twitterTitle: getMeta(doc, "name", "twitter:title"),
        twitterDescription: getMeta(doc, "name", "twitter:description"),
        twitterImage: resolve(getMeta(doc, "name", "twitter:image")),
        twitterSite: getMeta(doc, "name", "twitter:site"),
    };
}

/** Scan for video embeds (YouTube, Vimeo). */
export function scanVideos(doc: Document | Element = document): VideoData[] {
    const iframes = doc.querySelectorAll("iframe");
    const videos: VideoData[] = [];

    iframes.forEach((iframe) => {
        const src = iframe.getAttribute("src") || "";
        if (src.includes("youtube.com") || src.includes("youtu.be")) {
            let id = "";
            try {
                const url = new URL(src);
                id = url.pathname.split("/").pop() || "";
            } catch { }

            videos.push({
                type: "youtube",
                id,
                url: src,
                hasSchema: false,
            });
        } else if (src.includes("vimeo.com")) {
            let id = "";
            try {
                const url = new URL(src);
                id = url.pathname.split("/").pop() || "";
            } catch { }

            videos.push({
                type: "vimeo",
                id,
                url: src,
                hasSchema: false,
            });
        }
    });

    const hasVideoSchema = checkVideoSchema(doc);
    if (hasVideoSchema) {
        videos.forEach(v => v.hasSchema = true);
    }

    return videos;
}

/** Check if the page has VideoObject schema in JSON-LD. */
function checkVideoSchema(doc: Document | Element): boolean {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
        try {
            const content = script.textContent || "";
            if (content.includes("VideoObject")) {
                const json = JSON.parse(content);
                const items = Array.isArray(json) ? json : [json];
                if (items.some(item =>
                    item["@type"] === "VideoObject" ||
                    (Array.isArray(item["@graph"]) && item["@graph"].some((g: any) => g["@type"] === "VideoObject"))
                )) {
                    return true;
                }
            }
        } catch { }
    }
    return false;
}

/** 
 * Scan for all JSON-LD schemas on the page.
 */
export function scanSchemas(doc: Document | Element = document): SchemaInfo[] {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    const schemas: SchemaInfo[] = [];

    scripts.forEach((script) => {
        try {
            const content = script.textContent || "";
            const json = JSON.parse(content);
            const items = Array.isArray(json) ? json : [json];

            items.forEach((item) => {
                const type = item["@type"] || "unknown";
                const errors: string[] = [];
                const warnings: string[] = [];

                if (type === "Article" || type === "NewsArticle" || type === "BlogPosting") {
                    if (!item.headline) errors.push("Missing required property 'headline'");
                    if (!item.image) warnings.push("Missing property 'image'");
                } else if (type === "Product") {
                    if (!item.name) errors.push("Missing required property 'name'");
                    if (!item.offers) warnings.push("Missing property 'offers'");
                } else if (type === "Organization") {
                    if (!item.name) errors.push("Missing required property 'name'");
                    if (!item.url) warnings.push("Missing property 'url'");
                }

                schemas.push({
                    type: Array.isArray(type) ? type.join(", ") : type,
                    data: item,
                    isValid: errors.length === 0,
                    errors,
                    warnings,
                });
            });
        } catch { }
    });

    return schemas;
}

/**
 * Run the full DOM scan.
 */
export function scanDOM(doc: Document | Element = document, url?: string) {
    const basic = scanBasicSEO(doc, url);
    const headers = scanHeaders(doc);
    const images = scanImages(doc, url);
    const links = scanLinks(doc, url);
    const social = scanSocialTags(doc, url);
    const videos = scanVideos(doc);
    const schemas = scanSchemas(doc);

    return {
        ...basic,
        headers,
        images,
        links,
        social,
        videos,
        schemas,
    };
}
