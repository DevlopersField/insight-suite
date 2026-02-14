# Dev Buddy 🚀

**Dev Buddy** is a professional-grade SEO and technical audit tool designed for developers and SEO specialists. It provides instant insights into on-page SEO, technical health, performance assets, and security configurations.

![Dev Buddy Header](https://placehold.co/1200x400/0d1b3e/ffffff?text=Dev+Buddy+Technical+Audit+Suite)

## ✨ Key Features

- 🔍 **SEO Diagnostics**: Instant analysis of Title, Meta Description, and Canonical tags.
- 📐 **Heading Audit**: Complete heading tree visualization with hierarchy validation (H1-H6).
- 🖼️ **Image Optimization**: Detects missing Alt text, identifies image formats (Next-gen support check), and scans for broken assets.
- 📹 **Video Insights**: Finds embedded videos and checks for proper Schema.org markup.
- 🎨 **Font Analysis**: Identifies all fonts used on the page, including weights and sources.
- 🛠️ **Developer Tools**: Quick access to professional tools like PageSpeed Insights, GTmetrix, and W3C Validators.
- 🔐 **Security Audit**: High-level check of common security headers and protocols.

## 🚀 Installation & Setup

### For Website Mode
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

### For Chrome Extension
1. Build the project:
   ```bash
   npm run build
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the `dist` folder.

## 🛠️ Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **Icons**: Lucide React
- **Analysis**: Custom DOM Scanning Engine
- **Testing**: Vitest

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
