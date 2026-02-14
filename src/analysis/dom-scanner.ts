import type { HeaderInfo, ImageInfo, LinkInfo, SocialData } from "./types";

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
    return Array.from(imgs).map((img) => ({
        src: img.src || img.getAttribute("data-src") || "",
        alt: img.alt ?? "",
        title: img.title ?? "",
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0,
    }));
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

    return {
        ...basic,
        headers,
        images,
        links,
        social,
    };
}
