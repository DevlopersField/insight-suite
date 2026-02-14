# AuditLens - Technical Documentation

## Architecture Overview

**AuditLens** is built as a hybrid React application that can function both as a standalone web app and a Chrome Extension.

### Core Components

1.  **Scanning Engine (`src/analysis/`)**:
    *   `dom-scanner.ts`: Contains the primary logic for extracting metadata, headers, images, and links from the DOM.
    *   `tech-detector.ts`: Logic for identifying frameworks and CMS platforms by inspecting signatures.
    *   `types.ts`: Shared TypeScript interfaces for all audit data.

2.  **Chrome Extension Layer (`src/extension/`)**:
    *   `background.ts`: The background service worker that manages tab injection and heavy scanning.
    *   `content-script.ts`: Injected into target pages to execute DOM-based audits.
    *   `messaging.ts`: Standardized communication protocols between popup and background.

3.  **UI Layer (`src/components/diagnostic/`)**:
    *   Modular tab components (`ImagesTab`, `HeadersTab`, `SummaryTab`, etc.) for displaying structured audit results.
    *   `MetricCard`: Reusable UI component for high-level statistics.
    *   `StatusBadge`: Visual indicator for pass/fail/warn statuses.

## Scanning Logic & Audit Rules

### Header Hierarchy
The tool validates that headings (`H1-H6`) follow a logical structure.
*   **H1 Check**: Flags cases where H1 is missing or multiple H1s are present.
*   **Skipped Levels**: Identifies gaps in hierarchy (e.g., jumping from H1 to H3), which is crucial for accessibility.

### Image Audit
*   **Scope**: By default, the scanner targets images within `document.body` to ignore technical or meta-level assets.
*   **Format Detection**: Uses regex and `currentSrc` to identify formats. Highlights modern formats (**WebP**, **AVIF**, **SVG**) in Green. **PNG** is highlighted in Yellow to suggest further optimization.
*   **Alt Text**: Maps images missing `alt` attributes and identifies empty strings as critical errors.

### Tech Detection
Scans for common patterns including:
*   CMS: WordPress, Shopify, Webflow.
*   Frameworks: React, Vue, Next.js.
*   Analytics: Google Analytics, Facebook Pixel.

## Development & Build

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
This command generates the `dist/` folder containing the optimized web app and the extension bundle.

### Deployment (GitHub Pages)
```bash
npm run deploy
```
Utilizes `gh-pages` to host the web-based version of the suite.
