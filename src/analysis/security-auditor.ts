import type { SecurityHeaderResult } from "./types";

interface HeaderCheck {
    header: string;
    evaluate: (value: string | null) => { status: "pass" | "warn" | "fail"; recommendation: string };
}

const headerChecks: HeaderCheck[] = [
    {
        header: "Content-Security-Policy",
        evaluate: (value) => {
            if (!value) return { status: "fail", recommendation: "Add a Content-Security-Policy header to prevent XSS attacks" };
            if (value.includes("'unsafe-inline'") || value.includes("'unsafe-eval'"))
                return { status: "warn", recommendation: "Remove 'unsafe-inline' and 'unsafe-eval' from CSP for better security" };
            return { status: "pass", recommendation: "Properly configured" };
        },
    },
    {
        header: "Strict-Transport-Security",
        evaluate: (value) => {
            if (!value) return { status: "fail", recommendation: "Add HSTS header: max-age=31536000; includeSubDomains; preload" };
            const maxAge = value.match(/max-age=(\d+)/);
            if (maxAge && parseInt(maxAge[1]) < 31536000)
                return { status: "warn", recommendation: "Increase max-age to at least 31536000 (1 year)" };
            if (!value.includes("includeSubDomains"))
                return { status: "warn", recommendation: "Add includeSubDomains directive" };
            return { status: "pass", recommendation: "Properly configured" };
        },
    },
    {
        header: "X-Frame-Options",
        evaluate: (value) => {
            if (!value) return { status: "fail", recommendation: "Add X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking" };
            if (value.toUpperCase() === "DENY" || value.toUpperCase() === "SAMEORIGIN")
                return { status: "pass", recommendation: "Properly configured" };
            return { status: "warn", recommendation: "Set to DENY or SAMEORIGIN" };
        },
    },
    {
        header: "X-Content-Type-Options",
        evaluate: (value) => {
            if (!value) return { status: "fail", recommendation: "Add X-Content-Type-Options: nosniff to prevent MIME type sniffing" };
            if (value.toLowerCase() === "nosniff") return { status: "pass", recommendation: "Properly configured" };
            return { status: "warn", recommendation: "Set value to 'nosniff'" };
        },
    },
    {
        header: "Referrer-Policy",
        evaluate: (value) => {
            if (!value) return { status: "fail", recommendation: "Add Referrer-Policy: strict-origin-when-cross-origin" };
            const safe = ["no-referrer", "same-origin", "strict-origin", "strict-origin-when-cross-origin"];
            if (safe.includes(value.toLowerCase())) return { status: "pass", recommendation: "Properly configured" };
            if (value.toLowerCase() === "unsafe-url") return { status: "warn", recommendation: "Use strict-origin-when-cross-origin instead of unsafe-url" };
            return { status: "pass", recommendation: "Properly configured" };
        },
    },
    {
        header: "Permissions-Policy",
        evaluate: (value) => {
            if (!value) return { status: "fail", recommendation: "Add Permissions-Policy to restrict browser features (camera, microphone, geolocation)" };
            return { status: "pass", recommendation: "Properly configured" };
        },
    },
];

/**
 * Audit security headers for a given URL.
 * This function performs a fetch() request to read the HTTP response headers.
 *
 * In Chrome Extension context, this runs in the background service worker
 * which has unrestricted fetch() access.
 *
 * Returns results for all 6 security headers.
 */
export async function auditSecurityHeaders(url: string): Promise<SecurityHeaderResult[]> {
    const results: SecurityHeaderResult[] = [];

    try {
        if (!url.toLowerCase().startsWith('http')) {
            throw new Error("Invalid protocol");
        }
        // Fetch with no-cors might limit headers, but in extension context it works fine
        const response = await fetch(url, {
            method: "HEAD",
            cache: "no-cache",
        });

        for (const check of headerChecks) {
            const value = response.headers.get(check.header);
            const evaluation = check.evaluate(value);
            results.push({
                header: check.header,
                value,
                status: evaluation.status,
                recommendation: evaluation.recommendation,
            });
        }
    } catch {
        // If fetch fails (CORS, network error), return all as unknown
        for (const check of headerChecks) {
            results.push({
                header: check.header,
                value: null,
                status: "warn",
                recommendation: "Could not fetch headers — install Chrome Extension for full audit",
            });
        }
    }

    return results;
}

/**
 * Create a default set of security results when headers can't be fetched.
 * Used as fallback in website mode where CORS prevents header reading.
 */
export function defaultSecurityResults(): SecurityHeaderResult[] {
    return headerChecks.map((check) => ({
        header: check.header,
        value: null,
        status: "warn" as const,
        recommendation: "Install the Chrome Extension to audit security headers",
    }));
}
