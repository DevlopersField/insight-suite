# AuditLens - Technical Documentation

## Architecture Overview

**AuditLens** is a hybrid React application designed for high-reliability web auditing. It operates in two primary modes: **Extension Context** and **Web Context**.

### Core Modules (`src/analysis/`)

1.  **Scanning Engine**:
    *   `dom-scanner.ts`: The primary analyzer. It resolves relative URLs to absolute links during "Web Mode" analysis to ensure assets (images/links) render correctly.
    *   `tech-detector.ts`: Inspects the DOM for framework signatures (React, Vue, CMS, etc.).
    *   `font-scanner.ts`: Scans stylesheets and the FontFace API to identify typography.

2.  **Scraper Logic (`src/hooks/use-page-analysis.ts`)**:
    *   **fetchWithFallback**: A robust router that handles CORS bypassing. It tries AllOrigins, CORSProxy.io, and CodeTabs sequentially.
    *   **analyzeHTML**: A direct entry point for analyzing raw HTML strings, bypassing the network layer entirely.

### Hybrid Environment Management

The app uses `isExtensionContext()` to determine if it should communicate with a Background Service Worker or use its internal Web Scraper.

*   **Extension Mode**: Injects content scripts via `chrome.scripting.executeScript`.
*   **Web Mode**: Uses the Multi-Proxy Scraper to fetch the target URL's source code, then parses it into a virtual DOM for scanning.

## Key Audit Rules

### URL Resolution
In Web Mode, standard scanning of fetched HTML would result in broken relative links. 
*   **Implementation**: The scanner accepts a `baseUrl` context.
*   **Result**: Every `<img>` `src` and `<a>` `href` is transformed into an absolute URL using `new URL(path, baseUrl)`.

### Intelligent Scraper Routing
The scraper logic automatically handles the technical frustration of CORS:
1.  **Attempt 1**: Primary Proxy (Fastest).
2.  **Attempt 2**: Secondary Proxy (Different IP range).
3.  **Attempt 3**: Tertiary Proxy (Strict CORS headers).
4.  **Fallback**: UI prompts for manual source code paste if all automated attempts are blocked by the target site's firewall.

## Build & Deployment

### Commands
*   `npm run build`: Generates a production-ready `dist` folder compatible with both web hosting (Vercel/Netlify) and Chrome Web Store requirements.
*   `npm run deploy`: Automated deployment to GitHub Pages via the `/insight-suite/` subpath.
