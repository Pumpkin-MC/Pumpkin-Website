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
  translations?: Record<string, string>;
}

export function getMenuPanels(t: Messages): MenuPanel[] {
  const { developers, docs, community } = t.nav.panels;

  return [
    {
      id: "developers",
      columns: [
        {
          heading: developers.writePlugins,
          links: [
            { ...developers.howPluginsWork, href: `${DOCS_URL}/plugin-dev/introduction` },
            { ...developers.fromBukkit, href: `${DOCS_URL}/plugin-dev/migrating-from-bukkit/` },
            { ...developers.examples, href: "https://github.com/Pumpkin-MC/pumpkin-plugin-examples" },
          ],
        },
        { heading: developers.pickLanguage, compact: true, links: pluginLanguages },
        {
          heading: developers.hackServer,
          links: [
            { ...developers.contributing, href: `${DOCS_URL}/developer/contributing` },
            { ...developers.architecture, href: `${DOCS_URL}/developer/introduction` },
            { ...developers.networking, href: `${DOCS_URL}/developer/networking/networking` },
            { ...developers.source, href: GITHUB_URL },
          ],
        },
      ],
    },
    {
      id: "docs",
      columns: [
        {
          heading: docs.runServer,
          links: [
            { ...docs.gettingStarted, href: `${DOCS_URL}/admin/introduction` },
            { ...docs.migration, href: `${DOCS_URL}/admin/migrating-from-bukkit` },
            { ...docs.patchBukkit, href: "https://github.com/Pumpkin-MC/PatchBukkit" },
            { ...docs.troubleshooting, href: `${DOCS_URL}/troubleshooting/common_issues` },
          ],
        },
        {
          heading: docs.configure,
          links: [
            { ...docs.basicSettings, href: `${DOCS_URL}/config/basic` },
            { ...docs.world, href: `${DOCS_URL}/config/world` },
            { ...docs.bedrock, href: `${DOCS_URL}/config/bedrock` },
            { ...docs.proxy, href: `${DOCS_URL}/config/proxy` },
            { ...docs.configReference, href: `${DOCS_URL}/config/introduction` },
          ],
        },
        {
          heading: docs.about,
          links: [
            { ...docs.benchmarks, href: `${DOCS_URL}/about/benchmarks` },
            { ...docs.helping, href: `${DOCS_URL}/about/helping` },
          ],
        },
      ],
      translations: {
        de: `${DOCS_URL}/de/`,
        ja: `${DOCS_URL}/ja_jp/`,
        nl: `${DOCS_URL}/nl/`,
        pt: `${DOCS_URL}/pt/`,
      },
    },
    {
      id: "community",
      columns: [
        {
          heading: community.talk,
          links: [
            { ...community.discord, href: DISCORD_URL },
            { ...community.x, href: X_URL },
            { ...community.youtube, href: YOUTUBE_URL },
          ],
        },
        {
          heading: community.follow,
          links: [
            { ...community.blog, href: BLOG_URL },
            { ...community.stats, href: "/stats/" },
            { ...community.parity, href: "/tracker/" },
            { ...community.contributors, href: "/contributors/" },
            { ...community.sponsor, href: "/sponsor/" },
          ],
        },
      ],
    },
  ];
}
