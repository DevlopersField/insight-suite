export interface AuditData {
  url: string;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  author: string;
  language: string;
  charset: string;
  viewport: string;
  headers: { tag: string; text: string; order: number }[];
  images: { src: string; alt: string; title: string; width: number; height: number }[];
  links: { href: string; text: string; rel: string; isExternal: boolean }[];
  social: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    twitterSite: string;
  };
  tech: {
    name: string;
    category: string;
    confidence: number;
    icon: string;
  }[];
  security: {
    header: string;
    value: string | null;
    status: "pass" | "warn" | "fail";
    recommendation: string;
  }[];
}

export const mockAuditData: AuditData = {
  url: "https://example-store.com/products",
  title: "Premium Widgets & Accessories | ExampleStore - Shop Quality Products Online",
  titleLength: 72,
  description: "Discover our curated collection of premium widgets and accessories. Free shipping on orders over $50. Shop the latest trends with confidence.",
  descriptionLength: 139,
  canonical: "https://example-store.com/products",
  robots: "index, follow",
  author: "ExampleStore Team",
  language: "en-US",
  charset: "UTF-8",
  viewport: "width=device-width, initial-scale=1.0",
  headers: [
    { tag: "H1", text: "Premium Widgets Collection", order: 1 },
    { tag: "H2", text: "Featured Products", order: 2 },
    { tag: "H3", text: "Best Sellers", order: 3 },
    { tag: "H3", text: "New Arrivals", order: 4 },
    { tag: "H2", text: "Categories", order: 5 },
    { tag: "H3", text: "Electronics", order: 6 },
    { tag: "H3", text: "Accessories", order: 7 },
    { tag: "H2", text: "Customer Reviews", order: 8 },
    { tag: "H4", text: "Top Rated", order: 9 },
  ],
  images: [
    { src: "/images/hero-banner.jpg", alt: "Premium widgets collection banner", title: "Shop Now", width: 1920, height: 600 },
    { src: "/images/product-1.jpg", alt: "Wireless Bluetooth Speaker", title: "Bluetooth Speaker", width: 400, height: 400 },
    { src: "/images/product-2.jpg", alt: "", title: "", width: 400, height: 400 },
    { src: "/images/product-3.jpg", alt: "Smart Watch Pro", title: "", width: 400, height: 400 },
    { src: "/images/logo.svg", alt: "", title: "ExampleStore Logo", width: 180, height: 40 },
  ],
  links: [
    { href: "/", text: "Home", rel: "", isExternal: false },
    { href: "/products", text: "Products", rel: "canonical", isExternal: false },
    { href: "/about", text: "About Us", rel: "", isExternal: false },
    { href: "https://twitter.com/examplestore", text: "Twitter", rel: "noopener", isExternal: true },
    { href: "https://facebook.com/examplestore", text: "Facebook", rel: "noopener", isExternal: true },
    { href: "/privacy", text: "Privacy Policy", rel: "", isExternal: false },
  ],
  social: {
    ogTitle: "Premium Widgets & Accessories | ExampleStore",
    ogDescription: "Discover our curated collection of premium widgets.",
    ogImage: "https://example-store.com/images/og-image.jpg",
    ogUrl: "https://example-store.com/products",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: "Premium Widgets & Accessories",
    twitterDescription: "Shop quality products online at ExampleStore.",
    twitterImage: "https://example-store.com/images/twitter-card.jpg",
    twitterSite: "@examplestore",
  },
  tech: [
    { name: "Next.js", category: "Framework", confidence: 95, icon: "⚡" },
    { name: "React 18", category: "Library", confidence: 98, icon: "⚛️" },
    { name: "Tailwind CSS", category: "Styling", confidence: 90, icon: "🎨" },
    { name: "Vercel", category: "Hosting", confidence: 85, icon: "▲" },
    { name: "Google Analytics", category: "Analytics", confidence: 92, icon: "📊" },
    { name: "Stripe", category: "Payments", confidence: 78, icon: "💳" },
  ],
  security: [
    { header: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'", status: "warn", recommendation: "Remove 'unsafe-inline' from script-src" },
    { header: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload", status: "pass", recommendation: "Properly configured" },
    { header: "X-Frame-Options", value: "SAMEORIGIN", status: "pass", recommendation: "Properly configured" },
    { header: "X-Content-Type-Options", value: "nosniff", status: "pass", recommendation: "Properly configured" },
    { header: "Referrer-Policy", value: null, status: "fail", recommendation: "Add strict-origin-when-cross-origin" },
    { header: "Permissions-Policy", value: null, status: "fail", recommendation: "Restrict browser features access" },
  ],
};
