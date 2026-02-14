import type { FontInfo } from "./types";

/**
 * Build a Google Fonts specimen URL for a given font family.
 * e.g. "Inter" → "https://fonts.google.com/specimen/Inter"
 */
function googleFontsUrl(family: string): string {
    return `https://fonts.google.com/specimen/${encodeURIComponent(family.trim())}`;
}

/**
 * Parse Google Fonts CSS link URL to extract family names.
 * Handles both /css?family=... and /css2?family=... formats.
 */
function parseFamiliesFromGoogleUrl(href: string): string[] {
    try {
        const url = new URL(href);
        const families: string[] = [];
        // css2 API uses multiple family= params
        const familyParams = url.searchParams.getAll("family");
        for (const fp of familyParams) {
            // "Inter:wght@400;700" → "Inter"
            const name = fp.split(":")[0].replace(/\+/g, " ").trim();
            if (name) families.push(name);
        }
        // Legacy css API: family=Open+Sans|Roboto
        if (families.length === 0) {
            const legacy = url.searchParams.get("family");
            if (legacy) {
                for (const f of legacy.split("|")) {
                    const name = f.split(":")[0].replace(/\+/g, " ").trim();
                    if (name) families.push(name);
                }
            }
        }
        return families;
    } catch {
        return [];
    }
}

/**
 * Scan <link> tags for Google Fonts references.
 */
function scanGoogleFontLinks(): Map<string, FontInfo> {
    const fonts = new Map<string, FontInfo>();
    const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');

    for (const link of Array.from(links)) {
        const href = (link as HTMLLinkElement).href;
        const families = parseFamiliesFromGoogleUrl(href);

        for (const family of families) {
            if (!fonts.has(family)) {
                fonts.set(family, {
                    family,
                    source: "google",
                    weights: [],
                    styles: ["normal"],
                    url: googleFontsUrl(family),
                    cssUrl: href,
                });
            }
        }
    }

    return fonts;
}

/**
 * Scan <link> tags for Adobe Typekit (use.typekit.net) references.
 */
function scanTypekitLinks(): Map<string, FontInfo> {
    const fonts = new Map<string, FontInfo>();
    const links = document.querySelectorAll('link[href*="use.typekit.net"]');

    for (const link of Array.from(links)) {
        const href = (link as HTMLLinkElement).href;
        // Typekit URLs don't expose family names directly in the URL,
        // but we note it as an Adobe Fonts source
        fonts.set(`typekit:${href}`, {
            family: "Adobe Typekit Font",
            source: "typekit",
            weights: [],
            styles: [],
            url: "https://fonts.adobe.com/",
            cssUrl: href,
        });
    }

    return fonts;
}

/**
 * Scan document.fonts (FontFace API) for all loaded fonts.
 */
function scanFontFaceApi(): Map<string, Partial<FontInfo>> {
    const fonts = new Map<string, Partial<FontInfo>>();

    if (!document.fonts) return fonts;

    try {
        document.fonts.forEach((face: FontFace) => {
            const family = face.family.replace(/^["']|["']$/g, "").trim();
            if (!family) return;

            const existing = fonts.get(family) || {
                family,
                weights: [],
                styles: [],
            };

            const weight = face.weight || "400";
            const style = face.style || "normal";

            if (!existing.weights!.includes(weight)) existing.weights!.push(weight);
            if (!existing.styles!.includes(style)) existing.styles!.push(style);

            fonts.set(family, existing);
        });
    } catch {
        // FontFace API not supported or restricted
    }

    return fonts;
}

/**
 * Scan stylesheets for @font-face declarations.
 */
function scanStylesheetFontFaces(): Map<string, FontInfo> {
    const fonts = new Map<string, FontInfo>();

    try {
        for (const sheet of Array.from(document.styleSheets)) {
            let rules: CSSRuleList;
            try {
                rules = sheet.cssRules;
            } catch {
                // Cross-origin stylesheet — can't read rules
                continue;
            }

            for (const rule of Array.from(rules)) {
                if (rule instanceof CSSFontFaceRule) {
                    const family = rule.style
                        .getPropertyValue("font-family")
                        .replace(/^["']|["']$/g, "")
                        .trim();
                    const src = rule.style.getPropertyValue("src");
                    const weight = rule.style.getPropertyValue("font-weight") || "400";
                    const style = rule.style.getPropertyValue("font-style") || "normal";

                    if (!family) continue;

                    const existing = fonts.get(family);
                    if (existing) {
                        if (!existing.weights.includes(weight)) existing.weights.push(weight);
                        if (!existing.styles.includes(style)) existing.styles.push(style);
                    } else {
                        // Determine source from src URL
                        let source: FontInfo["source"] = "custom";
                        let cssUrl: string | null = null;

                        if (src.includes("fonts.gstatic.com") || src.includes("fonts.googleapis.com")) {
                            source = "google";
                        } else if (src.includes("typekit") || src.includes("use.typekit.net")) {
                            source = "typekit";
                        }

                        // Extract first URL from src
                        const urlMatch = src.match(/url\(["']?([^"')]+)["']?\)/);
                        if (urlMatch) cssUrl = urlMatch[1];

                        fonts.set(family, {
                            family,
                            source,
                            weights: [weight],
                            styles: [style],
                            url: source === "google" ? googleFontsUrl(family) : null,
                            cssUrl,
                        });
                    }
                }
            }
        }
    } catch {
        // Can't access stylesheets
    }

    return fonts;
}

/**
 * Fallback: detect actually rendered fonts via getComputedStyle on key elements.
 */
function scanComputedFonts(): Map<string, FontInfo> {
    const fonts = new Map<string, FontInfo>();
    const elements = [
        document.body,
        document.querySelector("h1"),
        document.querySelector("h2"),
        document.querySelector("p"),
        document.querySelector("a"),
        document.querySelector("button"),
    ].filter(Boolean) as Element[];

    for (const el of elements) {
        try {
            const computed = getComputedStyle(el);
            const fontFamily = computed.fontFamily;
            if (!fontFamily) continue;

            const families = fontFamily.split(",").map((f) => f.trim().replace(/^["']|["']$/g, ""));
            for (const family of families) {
                if (!family || fonts.has(family)) continue;
                // Generic font families are "system"
                const generics = ["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded"];
                const source: FontInfo["source"] = generics.includes(family.toLowerCase()) ? "system" : "system";

                fonts.set(family, {
                    family,
                    source,
                    weights: [computed.fontWeight || "400"],
                    styles: [computed.fontStyle || "normal"],
                    url: null,
                    cssUrl: null,
                });
            }
        } catch {
            // element not accessible
        }
    }

    return fonts;
}

// ─── Well-known Google Fonts for tagging detected system-classified fonts ────
const KNOWN_GOOGLE_FONTS = new Set([
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway",
    "Oswald", "Source Sans Pro", "Source Sans 3", "Nunito", "Playfair Display",
    "Merriweather", "Ubuntu", "Noto Sans", "PT Sans", "Rubik", "Work Sans",
    "Fira Sans", "Quicksand", "Barlow", "Mulish", "DM Sans", "Outfit",
    "Space Grotesk", "Plus Jakarta Sans", "Manrope", "JetBrains Mono",
    "Fira Code", "Source Code Pro", "IBM Plex Sans", "IBM Plex Mono",
    "Libre Franklin", "Crimson Text", "Bitter", "Josefin Sans", "Cabin",
    "Karla", "Exo 2", "Archivo", "Overpass", "Sora", "Lexend", "Geist",
]);

/**
 * Main entry point: scan all fonts on the page.
 * Merges results from multiple detection methods.
 */
export function scanFonts(): FontInfo[] {
    const merged = new Map<string, FontInfo>();

    // Priority order: Google Font links > @font-face > FontFace API > computed
    const googleFonts = scanGoogleFontLinks();
    const typekitFonts = scanTypekitLinks();
    const fontFaceFonts = scanStylesheetFontFaces();
    const apiFonts = scanFontFaceApi();
    const computedFonts = scanComputedFonts();

    // Merge Google Font links first (highest confidence)
    for (const [key, font] of googleFonts) merged.set(key, font);
    for (const [key, font] of typekitFonts) merged.set(key, font);

    // Merge @font-face declarations
    for (const [key, font] of fontFaceFonts) {
        if (merged.has(key)) {
            // Enrich existing entry with weights/styles
            const existing = merged.get(key)!;
            for (const w of font.weights) {
                if (!existing.weights.includes(w)) existing.weights.push(w);
            }
            for (const s of font.styles) {
                if (!existing.styles.includes(s)) existing.styles.push(s);
            }
        } else {
            merged.set(key, font);
        }
    }

    // Merge FontFace API data (enrich weights/styles)
    for (const [key, partial] of apiFonts) {
        const existing = merged.get(key);
        if (existing) {
            for (const w of partial.weights || []) {
                if (!existing.weights.includes(w)) existing.weights.push(w);
            }
            for (const s of partial.styles || []) {
                if (!existing.styles.includes(s)) existing.styles.push(s);
            }
        }
        // Don't add unrecognized FontFace-only entries — they're noisy
    }

    // Merge computed fonts as fallback (only add if not already known)
    for (const [key, font] of computedFonts) {
        if (!merged.has(key)) {
            // Check if it's a known Google Font we missed via links
            if (KNOWN_GOOGLE_FONTS.has(key)) {
                font.source = "google";
                font.url = googleFontsUrl(key);
            }
            merged.set(key, font);
        }
    }

    return Array.from(merged.values());
}
