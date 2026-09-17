export type PageId = "home" | "download" | "developers" | "donate" | "contributors" | "stats" | "tracker" | "notFound";

export interface Route {
  id: PageId;
  path: string;
  html: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  breadcrumb?: string;
  noindex?: boolean;
}

export const SITE_URL = "https://pumpkinmc.org";

export const routes: Route[] = [
  {
    id: "home",
    path: "/",
    html: "index.html",
    title: "Pumpkin - Blazingly Fast Minecraft Server",
    description: "Pumpkin: The fastest, most efficient Minecraft server software. Written in Rust.",
    ogTitle: "Pumpkin - Blazingly Fast Minecraft Server",
    ogDescription: "1000x faster startup. 18x less memory. Built with Rust for maximum performance.",
  },
  {
    id: "download",
    breadcrumb: "Download",
    path: "/download/",
    html: "download/index.html",
    title: "Download Pumpkin - Blazingly Fast Minecraft Server",
    description: "Download the latest release of Pumpkin, the fastest Minecraft server.",
    ogTitle: "Download Pumpkin",
    ogDescription: "Self-contained executable. No Java required. Just download, run, and play.",
  },
  {
    id: "developers",
    breadcrumb: "Developers",
    path: "/developers/",
    html: "developers/index.html",
    title: "For Developers - Pumpkin",
    description:
      "Why developers love building on Pumpkin. Typed commands, mutable events, Java + Bedrock support, and more.",
    ogTitle: "For Developers - Pumpkin",
    ogDescription: "No NMS. No reflection. No version-specific hacks. Just clean, type-safe APIs.",
  },
  {
    id: "donate",
    breadcrumb: "Donate",
    path: "/donate/",
    html: "donate/index.html",
    title: "Donate - Pumpkin",
    description: "Support Pumpkin, the fastest Minecraft server, by becoming a sponsor.",
    ogTitle: "Donate - Pumpkin",
    ogDescription: "Support Pumpkin, the fastest Minecraft server, by becoming a sponsor.",
  },
  {
    id: "contributors",
    breadcrumb: "Contributors",
    path: "/contributors/",
    html: "contributors/index.html",
    title: "Contributors - Pumpkin",
    description: "Meet the amazing people who contribute to Pumpkin, the fastest Minecraft server.",
    ogTitle: "Contributors - Pumpkin",
    ogDescription: "Meet the amazing people who contribute to Pumpkin, the fastest Minecraft server.",
  },
  {
    id: "stats",
    breadcrumb: "Stats",
    path: "/stats/",
    html: "stats/index.html",
    title: "Telemetry & Stats - Pumpkin",
    description:
      "Live ecosystem telemetry, server health, hardware distribution, global world map, and community statistics for Pumpkin and Vine.",
    ogTitle: "Telemetry & Stats - Pumpkin",
    ogDescription:
      "Live ecosystem telemetry, server health, hardware distribution, global world map, and community statistics for Pumpkin and Vine.",
  },
  {
    id: "tracker",
    breadcrumb: "Vanilla parity",
    path: "/tracker/",
    html: "tracker/index.html",
    title: "Vanilla Parity - Pumpkin",
    description:
      "How close Pumpkin is to vanilla: which entities, blocks, items and commands are implemented, which are partial, and which are still on the list.",
    ogTitle: "Vanilla Parity - Pumpkin",
    ogDescription:
      "How close Pumpkin is to vanilla: which entities, blocks, items and commands are implemented, which are partial, and which are still on the list.",
  },
  {
    id: "notFound",
    path: "/404.html",
    html: "404.html",
    title: "Page not found - Pumpkin",
    description: "This page does not exist on pumpkinmc.org.",
    ogTitle: "Page not found - Pumpkin",
    ogDescription: "This page does not exist on pumpkinmc.org.",
    noindex: true,
  },
];
