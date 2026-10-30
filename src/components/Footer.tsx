import { useI18n, type Messages } from "../i18n";
import { rich } from "../i18n/rich";
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
import { withBase } from "../lib/url";
import { DiscordIcon, GitHubIcon, XIcon, YouTubeIcon } from "./icons";

/** Builds the footer link columns for the current language. */
function getColumns(t: Messages): { heading: string; links: NamedLink[] }[] {
  const { footer } = t;

  return [
    {
      heading: footer.useIt.heading,
      links: [
        { label: t.nav.download, href: "/download/" },
        { label: footer.useIt.gettingStarted, href: `${DOCS_URL}/admin/introduction` },
        { label: footer.useIt.configuration, href: `${DOCS_URL}/config/introduction` },
        { label: footer.useIt.troubleshooting, href: `${DOCS_URL}/troubleshooting/common_issues` },
      ],
    },
    {
      heading: footer.buildOnIt.heading,
      links: [
        { label: footer.buildOnIt.pluginDocs, href: `${DOCS_URL}/plugin-dev/introduction` },
        { label: footer.buildOnIt.developers, href: "/developers/" },
        { label: footer.buildOnIt.examples, href: "https://github.com/Pumpkin-MC/pumpkin-plugin-examples" },
        { label: t.nav.market, href: MARKET_URL },
        { label: footer.buildOnIt.contributing, href: `${DOCS_URL}/developer/contributing` },
      ],
    },
    {
      heading: footer.follow.heading,
      links: [
        { label: footer.follow.blog, href: BLOG_URL },
        { label: footer.follow.stats, href: "/stats/" },
        { label: footer.follow.parity, href: "/tracker/" },
        { label: footer.follow.benchmarks, href: `${DOCS_URL}/about/benchmarks` },
        { label: footer.follow.sponsorship, href: "/sponsor/" },
      ],
    },
    {
      heading: footer.project.heading,
      links: [
        { label: footer.project.releases, href: `${GITHUB_URL}/releases` },
        { label: footer.project.reportBug, href: `${GITHUB_URL}/issues` },
        { label: footer.project.contributors, href: "/contributors/" },
        { label: footer.project.license, href: `${GITHUB_URL}/blob/master/LICENSE` },
        { label: footer.project.repositories, href: GITHUB_ORG_URL },
      ],
    },
  ];
}

const creditLink = "underline underline-offset-3 hover:text-pumpkin";

const socials = [
  { label: "GitHub", href: GITHUB_URL, Icon: GitHubIcon },
  { label: "Discord", href: DISCORD_URL, Icon: DiscordIcon },
  { label: "X", href: X_URL, Icon: XIcon },
  { label: "YouTube", href: YOUTUBE_URL, Icon: YouTubeIcon },
];

/** Site footer with link columns, credits and the legal disclaimer. */
export function Footer() {
  const { t } = useI18n();
  const columns = getColumns(t);

  return (
    <footer className="border-t-3 border-pumpkin bg-surface text-fg">
      <div className="mx-auto max-w-325 px-5 pt-10 pb-6 md:px-8 md:pt-14 md:pb-8">
        <div className="grid grid-cols-2 gap-6 border-b border-white/15 pb-10 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,1fr)] lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xl font-extrabold">
              <img src={withBase("/assets/icon.svg")} alt="" className="size-7.5" />
              Pumpkin
            </div>
            <p className="mt-3 max-w-96 text-[0.95rem] text-muted">
              {t.footer.description}
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
                    <a href={withBase(link.href)} className="text-[0.95rem] font-medium hover:text-pumpkin">
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
            {rich(t.footer.credit, {
              purdze: (text) => (
                <a href="https://marshall.dev" target="_blank" rel="noopener" className={creditLink}>
                  {text}
                </a>
              ),
              megalith: (text) => (
                <a href="https://github.com/MegalithOfficial" target="_blank" rel="noopener" className={creditLink}>
                  {text}
                </a>
              ),
            })}
          </span>
          <span>{t.footer.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
