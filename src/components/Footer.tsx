import {
  BLOG_URL,
  DISCORD_URL,
  DOCS_URL,
  GITHUB_ORG_URL,
  GITHUB_URL,
  MARKET_URL,
  X_URL,
  YOUTUBE_URL,
  type NamedLink,
} from "../links";
import { DiscordIcon, GitHubIcon, XIcon, YouTubeIcon } from "./icons";

const columns: { heading: string; links: NamedLink[] }[] = [
  {
    heading: "Use it",
    links: [
      { label: "Download", href: "/download/" },
      { label: "Getting started", href: `${DOCS_URL}/admin/introduction` },
      { label: "Configuration", href: `${DOCS_URL}/config/introduction` },
      { label: "Troubleshooting", href: `${DOCS_URL}/troubleshooting/common_issues` },
    ],
  },
  {
    heading: "Build on it",
    links: [
      { label: "Plugin docs", href: `${DOCS_URL}/plugin-dev/introduction` },
      { label: "For developers", href: "/developers/" },
      { label: "Examples", href: "https://github.com/Pumpkin-MC/pumpkin-plugin-examples" },
      { label: "Market", href: MARKET_URL },
      { label: "Contributing", href: `${DOCS_URL}/developer/contributing` },
    ],
  },
  {
    heading: "Follow",
    links: [
      { label: "Blog", href: BLOG_URL },
      { label: "Stats", href: "/stats/" },
      { label: "Benchmarks", href: `${DOCS_URL}/about/benchmarks` },
      { label: "Sponsor", href: "/donate/" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "Releases", href: `${GITHUB_URL}/releases` },
      { label: "Report a bug", href: `${GITHUB_URL}/issues` },
      { label: "Contributors", href: "/contributors/" },
      { label: "License", href: `${GITHUB_URL}/blob/master/LICENSE` },
      { label: "All repositories", href: GITHUB_ORG_URL },
    ],
  },
];

const socials = [
  { label: "GitHub", href: GITHUB_URL, Icon: GitHubIcon },
  { label: "Discord", href: DISCORD_URL, Icon: DiscordIcon },
  { label: "X", href: X_URL, Icon: XIcon },
  { label: "YouTube", href: YOUTUBE_URL, Icon: YouTubeIcon },
];

export function Footer() {
  return (
    <footer className="border-t-3 border-pumpkin bg-surface text-fg">
      <div className="mx-auto max-w-325 px-5 pt-10 pb-6 md:px-8 md:pt-14 md:pb-8">
        <div className="grid grid-cols-2 gap-6 border-b border-white/15 pb-10 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,1fr)] lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xl font-extrabold">
              <img src="/assets/icon.svg" alt="" className="size-7.5" />
              Pumpkin
            </div>
            <p className="mt-3 max-w-96 text-[0.95rem] text-muted">
              A Minecraft server written in Rust. Fast to start, light to run, free to change.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center border-2 border-muted hover:border-pumpkin hover:text-pumpkin"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.heading}>
              <p className="mb-3.5 text-xs font-extrabold tracking-widest text-muted uppercase">{column.heading}</p>
              <ul className="grid gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[0.95rem] font-medium hover:text-pumpkin">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-x-8 gap-y-2 pt-6 text-[0.85rem] text-muted md:flex-row md:flex-wrap">
          <span>
            Made with ❤️ by{" "}
            <a href="https://marshall.dev" target="_blank" rel="noopener" className="underline underline-offset-3 hover:text-pumpkin">
              purdze
            </a>{" "}
            and contributors · GPL-3.0
          </span>
          <span>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</span>
        </div>
      </div>
    </footer>
  );
}
