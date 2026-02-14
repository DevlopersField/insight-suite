# AuditLens 🚀

**AuditLens** is a professional-grade SEO and technical audit tool that works both as a standalone **standalone website** and a **Chrome Extension**. It provides instant insights into on-page SEO, technical health, performance assets, and security configurations.

![AuditLens Header](https://placehold.co/1200x400/0d1b3e/ffffff?text=AuditLens+Professional+Audit+Suite)

## ✨ Key Features

- 🌐 **Robust Web Auditing**: Analyze any URL directly from the website. No extension required!
- 🛡️ **Zero-CORS Scraper**: Automatically cycles through multiple proxy channels (AllOrigins, CORSProxy.io, CodeTabs) to retrieve source code reliably.
- 📑 **Paste Source Fallback**: Manual mode to audit local HTML files or heavily protected sites.
- 📐 **Heading Audit**: Complete heading tree visualization with hierarchy validation (H1-H6).
- 🖼️ **Image Optimization**: Detects missing Alt text, identifies image formats (Next-gen support check), and resolves absolute URLs for live preview.
- 📹 **Video Insights**: Finds embedded videos and checks for proper Schema.org markup.
- 🎨 **Font Analysis**: Identifies all fonts used on the page, including weights and sources.
- 🔐 **Security Audit**: High-level check of common security headers and protocols.

## 🚀 Getting Started

### 1. Website Mode (Local Development)
1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the tool in your browser (defaults to `http://localhost:8080`).

### 2. Chrome Extension
1. Build the project:
   ```bash
   npm run build
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode**.
4. Click **Load unpacked** and select the `dist` folder.

## 🛠️ Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS (with professional SaaS aesthetics)
- **Scraping**: Multi-Proxy Fallback Engine
- **Icons**: Lucide React
- **Analysis**: Custom DOM Scanning Engine (ESM compatible)

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
