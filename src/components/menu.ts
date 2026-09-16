import {
  BLOG_URL,
  DISCORD_URL,
  DOCS_URL,
  GITHUB_URL,
  X_URL,
  YOUTUBE_URL,
  pluginLanguages,
  type NamedLink,
} from "../links";
import type { Messages } from "../i18n";

export interface MenuLink extends NamedLink {
  hint?: string;
}

export interface MenuColumn {
  heading: string;
  links: MenuLink[];
  compact?: boolean;
}

export interface MenuPanel {
  id: keyof Pick<Messages["nav"], "developers" | "docs" | "community">;
  columns: MenuColumn[];
  translations?: NamedLink[];
}

export const menuPanels: MenuPanel[] = [
  {
    id: "developers",
    columns: [
      {
        heading: "Write plugins",
        links: [
          { label: "How plugins work", hint: "The API, the runtime, the packaging.", href: `${DOCS_URL}/plugin-dev/introduction` },
          { label: "Coming from Bukkit", hint: "Events, commands, inventories mapped.", href: `${DOCS_URL}/plugin-dev/migrating-from-bukkit/` },
          { label: "Example plugins", hint: "Small, complete, copyable.", href: "https://github.com/Pumpkin-MC/pumpkin-plugin-examples" },
        ],
      },
      { heading: "Pick a language", compact: true, links: pluginLanguages },
      {
        heading: "Hack on the server",
        links: [
          { label: "Contributing", hint: "Setup, style, how PRs get reviewed.", href: `${DOCS_URL}/developer/contributing` },
          { label: "Architecture", hint: "How the server is put together.", href: `${DOCS_URL}/developer/introduction` },
          { label: "Networking", hint: "Packets, auth, RCON.", href: `${DOCS_URL}/developer/networking/networking` },
          { label: "Source on GitHub", hint: "Issues, PRs, releases.", href: GITHUB_URL },
        ],
      },
    ],
  },
  {
    id: "docs",
    columns: [
      {
        heading: "Run a server",
        links: [
          { label: "Getting started", hint: "Download, first run, first player.", href: `${DOCS_URL}/admin/introduction` },
          { label: "Moving from Paper or Spigot", hint: "What carries over and what doesn't.", href: `${DOCS_URL}/admin/migrating-from-bukkit` },
          { label: "PatchBukkit", hint: "Keep running your Bukkit and Paper plugins.", href: "https://github.com/Pumpkin-MC/PatchBukkit" },
          { label: "Troubleshooting", hint: "Common issues and what they mean.", href: `${DOCS_URL}/troubleshooting/common_issues` },
        ],
      },
      {
        heading: "Configure",
        links: [
          { label: "Basic settings", hint: "Port, MOTD, view distance, whitelist.", href: `${DOCS_URL}/config/basic` },
          { label: "World", hint: "Generation, saving, spawn.", href: `${DOCS_URL}/config/world` },
          { label: "Bedrock players", hint: "Let Bedrock clients join.", href: `${DOCS_URL}/config/bedrock` },
          { label: "Behind a proxy", hint: "Velocity and BungeeCord forwarding.", href: `${DOCS_URL}/config/proxy` },
          { label: "Every config key", hint: "The full reference.", href: `${DOCS_URL}/config/introduction` },
        ],
      },
      {
        heading: "About",
        links: [
          { label: "Benchmarks", hint: "How the numbers were measured.", href: `${DOCS_URL}/about/benchmarks` },
          { label: "Helping out", hint: "Ways to contribute without code.", href: `${DOCS_URL}/about/helping` },
        ],
      },
    ],
    translations: [
      { label: "Deutsch", href: `${DOCS_URL}/de/` },
      { label: "日本語", href: `${DOCS_URL}/ja_jp/` },
      { label: "Nederlands", href: `${DOCS_URL}/nl/` },
      { label: "Português", href: `${DOCS_URL}/pt/` },
    ],
  },
  {
    id: "community",
    columns: [
      {
        heading: "Talk",
        links: [
          { label: "Discord", hint: "Help, dev chat, announcements.", href: DISCORD_URL },
          { label: "X", hint: "Short updates.", href: X_URL },
          { label: "YouTube", hint: "Demos and talks.", href: YOUTUBE_URL },
        ],
      },
      {
        heading: "Follow along",
        links: [
          { label: "Blog", hint: "Release notes and longer posts.", href: BLOG_URL },
          { label: "Stats", hint: "Servers running Pumpkin right now.", href: "/stats/" },
          { label: "Contributors", hint: "The people who build Pumpkin.", href: "/contributors/" },
          { label: "Sponsor", hint: "Keep the project funded.", href: "/donate/" },
        ],
      },
    ],
  },
];
