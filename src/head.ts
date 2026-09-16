import { SITE_URL, type Route } from "./routes.ts";

const GOOGLE_ANALYTICS_IMAGES = [
  "https://*.google-analytics.com",
  "https://www.googletagmanager.com",
  "https://*.g.doubleclick.net",
  "https://*.google.com",
].join(" ");

const GOOGLE_ANALYTICS_CONNECT = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
  "https://*.g.doubleclick.net",
  "https://*.google.com",
  "https://pagead2.googlesyndication.com",
].join(" ");

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
  "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
  `img-src 'self' https://avatars.githubusercontent.com https://market.pumpkinmc.org data: ${GOOGLE_ANALYTICS_IMAGES}`,
  `connect-src 'self' https://api.github.com https://market.pumpkinmc.org http://localhost:5000 http://127.0.0.1:5000 ${GOOGLE_ANALYTICS_CONNECT}`,
  "frame-src https://www.googletagmanager.com",
  "frame-ancestors 'none'",
].join("; ");

const ANALYTICS_ID = "G-QK7NXQQ2ZP";
const ADSENSE_CLIENT = "ca-pub-8857181057818321";
const OG_IMAGE = { url: `${SITE_URL}/assets/logos/ogimage.png`, width: 1229, height: 528 };
const LOGO_URL = `${SITE_URL}/assets/logos/icon_png.png`;

const SAME_AS = [
  "https://github.com/Pumpkin-MC",
  "https://discord.com/invite/wT8XjrjKkf",
  "https://x.com/pumpkinmcdev",
  "https://www.youtube.com/@PumpkinServer",
];

function attr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function jsonLd(data: object): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

function structuredData(route: Route): string[] {
  if (route.noindex) return [];

  if (route.id === "home") {
    return [
      jsonLd({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: "Pumpkin",
            url: `${SITE_URL}/`,
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: "Pumpkin",
            url: `${SITE_URL}/`,
            logo: LOGO_URL,
            sameAs: SAME_AS,
          },
          {
            "@type": "SoftwareApplication",
            name: "Pumpkin",
            description: route.description,
            url: `${SITE_URL}/`,
            downloadUrl: `${SITE_URL}/download/`,
            image: OG_IMAGE.url,
            applicationCategory: "GameApplication",
            applicationSubCategory: "Minecraft server",
            operatingSystem: "Windows, macOS, Linux, Android",
            programmingLanguage: "Rust",
            license: "https://www.gnu.org/licenses/gpl-3.0.html",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            author: { "@id": `${SITE_URL}/#organization` },
          },
        ],
      }),
    ];
  }

  if (!route.breadcrumb) return [];

  return [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pumpkin", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: route.breadcrumb, item: `${SITE_URL}${route.path}` },
      ],
    }),
  ];
}

export function renderHead(route: Route, isBuild: boolean): string {
  const url = `${SITE_URL}${route.path}`;
  const tags = [
    `<meta charset="UTF-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
  ];

  if (isBuild) {
    tags.push(
      `<meta http-equiv="Content-Security-Policy" content="${attr(CONTENT_SECURITY_POLICY)}" />`,
      `<meta http-equiv="X-Content-Type-Options" content="nosniff" />`,
      `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
      `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />`,
    );
  }

  tags.push(
    `<title>${attr(route.title)}</title>`,
    `<meta name="description" content="${attr(route.description)}" />`,
    route.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    `<meta name="theme-color" content="#ff6b2c" />`,
    `<meta property="og:site_name" content="Pumpkin" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${attr(route.ogTitle)}" />`,
    `<meta property="og:description" content="${attr(route.ogDescription)}" />`,
    `<meta property="og:image" content="${OG_IMAGE.url}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="Pumpkin, the Minecraft server written in Rust" />`,
    ...(route.noindex ? [] : [`<meta property="og:url" content="${url}" />`]),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@pumpkinmcdev" />`,
    `<meta name="twitter:title" content="${attr(route.ogTitle)}" />`,
    `<meta name="twitter:description" content="${attr(route.ogDescription)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE.url}" />`,
    `<link rel="icon" type="image/svg+xml" href="/assets/icon.svg" />`,
    `<link rel="apple-touch-icon" href="/assets/logos/icon_png.png" />`,
    `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap" />`,
    ...structuredData(route),
  );

  if (isBuild) {
    tags.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}"></script>`,
      `<script>window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } gtag("js", new Date()); gtag("config", "${ANALYTICS_ID}");</script>`,
    );
    if (route.id === "home") {
      tags.push(
        `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`,
      );
    }
  }

  return tags.join("\n    ");
}
