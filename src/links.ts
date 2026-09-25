export const DOCS_URL = "https://docs.pumpkinmc.org";
export const GITHUB_ORG_URL = "https://github.com/Pumpkin-MC";
export const GITHUB_URL = "https://github.com/Pumpkin-MC/Pumpkin";
export const DISCORD_URL = "https://discord.com/invite/wT8XjrjKkf";
export const X_URL = "https://x.com/pumpkinmcdev";
export const YOUTUBE_URL = "https://www.youtube.com/@PumpkinServer";
export const BLOG_URL = "https://blog.pumpkinmc.org/";
export const MARKET_URL = "https://market.pumpkinmc.org/";
export const DONATE_URL = "https://donate.stripe.com/5kQ8wO9rReATeyXfvL2cg0a";

export interface NamedLink {
  label: string;
  href: string;
}

export const pluginLanguages: NamedLink[] = [
  { label: "Rust", href: `${DOCS_URL}/plugin-dev/rust/creating-project` },
  { label: "Kotlin", href: `${DOCS_URL}/plugin-dev/kotlin/quick-start` },
  { label: "Python", href: `${DOCS_URL}/plugin-dev/python/quick-start` },
  { label: "Go", href: `${DOCS_URL}/plugin-dev/go/quick-start` },
  { label: "C#", href: `${DOCS_URL}/plugin-dev/csharp/quick-start` },
  { label: "C / C++", href: `${DOCS_URL}/plugin-dev/c/quick-start` },
  { label: "D", href: `${DOCS_URL}/plugin-dev/d/quick-start` },
  { label: "Zig", href: `${DOCS_URL}/plugin-dev/zig/quick-start` },
  { label: "TypeScript", href: "https://github.com/Pumpkin-MC/pumpkin-api-ts" },
];
