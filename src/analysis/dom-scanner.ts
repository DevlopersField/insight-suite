import type { HeaderInfo, ImageInfo, LinkInfo, SocialData, VideoData } from "./types";

/** Extract the text content of a meta tag by name or property. */
function getMeta(attr: "name" | "property", value: string): string {
    const el = document.querySelector(`meta[${attr}="${value}"]`);
    return el?.getAttribute("content") ?? "";
}

/** Scan the page <title>, meta description, and core SEO fields. */
export function scanBasicSEO() {
    const title = document.title ?? "";
    const description = getMeta("name", "description");
    const canonical =
        (document.querySelector('link[rel="canonical"]') as HTMLLinkElement)
            ?.href ?? "";
    const robots = getMeta("name", "robots") || "index, follow";
    const author = getMeta("name", "author");
    const language = document.documentElement.lang ?? "";
    const charsetMeta = document.querySelector("meta[charset]");
    const charset = charsetMeta?.getAttribute("charset") ?? "UTF-8";
    const viewport = getMeta("name", "viewport");

    return {
        url: window.location.href,
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
export function scanHeaders(): HeaderInfo[] {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    return Array.from(headings).map((el, i) => ({
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 200),
        order: i + 1,
    }));
}

/** Scan all <img> elements on the page. */
export function scanImages(): ImageInfo[] {
    const imgs = document.querySelectorAll("img");
    return Array.from(imgs).map((img) => {
        const src = img.src || img.getAttribute("data-src") || "";
        let type = "unknown";

        try {
            const activeSrc = img.currentSrc || src;
            if (!activeSrc) {
                type = "none";
            } else if (activeSrc.startsWith('data:')) {
                const match = activeSrc.match(/^data:image\/([a-zA-Z0-9+-]+);/);
                type = match ? match[1].split('+')[0] : "data";
            } else {
                // Try to find extension in the entire URL string
                const patterns = [
                    /\.(webp|avif|png|jpg|jpeg|svg|gif|ico|bmp)(?:\?|#|$)/i, // Standard extension
                    /[?&](?:format|fm|ext|type|output)=([^&?#]+)/i,           // CDN parameter
                    /\/(webp|avif|png|jpg|jpeg|svg|gif|ico|bmp)(?:\/|$)/i     // Path segment
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

                // Loose keyword search as last fallback
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
            alt: img.alt ?? "",
            title: img.title ?? "",
            width: img.naturalWidth || img.width || 0,
            height: img.naturalHeight || img.height || 0,
            type: type || "img",
        };
    });
}

/** Scan all <a> elements on the page. */
export function scanLinks(): LinkInfo[] {
    const anchors = document.querySelectorAll("a[href]");
    const currentHost = window.location.hostname;

    return Array.from(anchors).map((a) => {
        const anchor = a as HTMLAnchorElement;
        let isExternal = false;
        try {
            const linkUrl = new URL(anchor.href, window.location.href);
            isExternal = linkUrl.hostname !== currentHost;
        } catch {
            // malformed URL — treat as internal
        }

        return {
            href: anchor.href,
            text: (anchor.textContent ?? "").trim().slice(0, 120),
            rel: anchor.rel ?? "",
            isExternal,
        };
    });
}

/** Scan Open Graph and Twitter Card meta tags. */
export function scanSocialTags(): SocialData {
    return {
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
}

/** Scan for video embeds (YouTube, Vimeo). */
export function scanVideos(): VideoData[] {
    const iframes = document.querySelectorAll("iframe");
    const videos: VideoData[] = [];

    iframes.forEach((iframe) => {
        const src = iframe.src || "";
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
                hasSchema: false, // Will be updated below
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

    const hasVideoSchema = checkVideoSchema();
    if (hasVideoSchema) {
        videos.forEach(v => v.hasSchema = true);
    }

    return videos;
}

/** Check if the page has VideoObject schema in JSON-LD. */
function checkVideoSchema(): boolean {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
        try {
            const content = script.textContent || "";
            if (content.includes("VideoObject")) {
                const json = JSON.parse(content);
                // Handle both single object and array of objects
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
 * Run the full DOM scan and return all SEO-relevant data from the page.
 * This is the main entry point called from the content script.
 */
export function scanDOM() {
    const basic = scanBasicSEO();
    const headers = scanHeaders();
    const images = scanImages();
    const links = scanLinks();
    const social = scanSocialTags();
    const videos = scanVideos();

    return {
        ...basic,
        headers,
        images,
        links,
        social,
        videos,
    };
}
