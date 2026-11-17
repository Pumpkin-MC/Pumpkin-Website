import { useEffect, useState, type ReactNode } from "react";
import { GITHUB_URL, MARKET_URL } from "../../links";
import { languageTag, useI18n, type Messages } from "../../i18n";
import { countryName, formatMessage, formatNumber, formatPercent, formatTimeOfDay } from "../../i18n/format";
import { rich } from "../../i18n/rich";
import { DistributionList, type DistributionItem } from "./DistributionList";
import { TrendChart, TrendTable, trendSeries } from "./TrendChart";
import { useTelemetry } from "./useTelemetry";
import { MAP_RAMP, WorldMap } from "./WorldMap";
import { RANGES, type GeoMetric, type Share, type TrendMetric, type TrendPoint, type TrendRange } from "./types";

const API_DOCS_URL = "https://market.pumpkinmc.org/api/docs/";

const inlineLink =
  "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

interface SegmentedProps<T extends string> {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex border-2 border-white/20 font-mono text-xs"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={`cursor-pointer px-3 py-1.5 transition-colors not-last:border-r-2 not-last:border-white/20 ${
            value === option.id
              ? "bg-fg text-black"
              : "text-muted hover:text-fg"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface PanelProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: PanelProps) {
  return (
    <section
      className={`min-w-0 border-2 border-white/15 bg-surface ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b-2 border-white/15 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          )}
        </div>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | null | undefined;
  detail: ReactNode;
}) {
  const { lang } = useI18n();

  return (
    <div className="bg-surface p-5 md:px-6">
      <p className="font-mono text-xs tracking-wider text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
        {value === null || value === undefined ? "-" : formatNumber(value, languageTag(lang))}
      </p>
      <p className="mt-1 min-h-5 text-sm text-muted">{detail}</p>
    </div>
  );
}

function Loading() {
  const { t } = useI18n();

  return <p className="py-2 text-sm text-muted">{t.stats.loading}</p>;
}

type PlayerView = "edition" | "online" | "view";

function playerViews(t: Messages): {
  id: PlayerView;
  label: string;
  key: "player_editions" | "online_mode" | "view_distances";
  description: string;
}[] {
  return [
    {
      id: "edition",
      label: t.stats.players.edition,
      key: "player_editions",
      description: t.stats.players.editionDescription,
    },
    {
      id: "online",
      label: t.stats.players.online,
      key: "online_mode",
      description: t.stats.players.onlineDescription,
    },
    {
      id: "view",
      label: t.stats.players.view,
      key: "view_distances",
      description: t.stats.players.viewDescription,
    },
  ];
}

function shares(list: Share[] | undefined): DistributionItem[] {
  return (list ?? []).map((share) => ({
    key: share.label,
    label: share.label,
    value: share.count,
    share: share.percentage,
  }));
}

const LANGUAGE_LABELS: Record<string, string> = {
  rust: "Rust",
  go: "Go",
  golang: "Go",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  python: "Python",
  py: "Python",
  csharp: "C#",
  "c#": "C#",
  cpp: "C++",
  "c++": "C++",
  c_plus_plus: "C++",
  c: "C",
  kotlin: "Kotlin",
  kt: "Kotlin",
  java: "Java",
  zig: "Zig",
  moonbit: "MoonBit",
  assemblyscript: "AssemblyScript",
  swift: "Swift",
  ruby: "Ruby",
  lua: "Lua",
  wasm: "Wasm",
};

function languageLabel(language: string, native: string): string {
  const key = language.trim().toLowerCase();
  if (key === "native" || key === "rust-native") return native;
  return LANGUAGE_LABELS[key] ?? language;
}

function summarize(t: Messages, data: TrendPoint[], metric: TrendMetric) {
  const level = (point: TrendPoint) =>
    metric === "players" ? point.online_players : point.active_servers;
  const peak = (point: TrendPoint) =>
    metric === "players" ? point.peak_players : point.active_servers;
  const levels = data.map(level);
  const labels = t.stats.summary;
  return [
    { label: labels.peak, value: Math.max(0, ...data.map(peak)) },
    {
      label: labels.average,
      value: Math.round(
        levels.reduce((sum, value) => sum + value, 0) / (levels.length || 1),
      ),
    },
    { label: labels.low, value: levels.length ? Math.min(...levels) : 0 },
    { label: labels.latest, value: levels.at(-1) ?? 0 },
  ];
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
      className={`size-3.5 ${spinning ? "animate-spin motion-reduce:animate-none" : ""}`}
    >
      <path d="M20 11a8 8 0 0 0-14.9-4M4 5v4h4M4 13a8 8 0 0 0 14.9 4M20 19v-4h-4" />
    </svg>
  );
}

export default function Stats() {
  const { lang, t } = useI18n();
  const locale = languageTag(lang);
  const [range, setRange] = useState<TrendRange>("24h");
  const [metric, setMetric] = useState<TrendMetric>("players");
  const [mapMetric, setMapMetric] = useState<GeoMetric>("servers");
  const [geoSort, setGeoSort] = useState<GeoMetric>("servers");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [playerView, setPlayerView] = useState<PlayerView>("edition");
  const telemetry = useTelemetry(range);
  const { overview, trends, systems, geo, plugins } = telemetry;
  const rangeLabel = t.stats.ranges[range].long;
  const rangeShort = range === "all" ? t.stats.ranges.all.long : t.stats.ranges[range].label;
  const views = playerViews(t);

  useEffect(() => {
    if (!selectedCountry) return;
    document
      .getElementById(`geo-${selectedCountry}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setSelectedCountry(null), 2500);
    return () => window.clearTimeout(timer);
  }, [selectedCountry]);

  const topCountry = [...(geo ?? [])].sort((a, b) => b.servers - a.servers)[0];
  const topOnMap = [...(geo ?? [])].sort(
    (a, b) => b[mapMetric] - a[mapMetric],
  )[0];
  const geoTotal = (geo ?? []).reduce(
    (sum, entry) =>
      sum + (geoSort === "servers" ? entry.servers : entry.players),
    0,
  );
  const geoItems: DistributionItem[] = [...(geo ?? [])]
    .sort((a, b) =>
      geoSort === "servers" ? b.servers - a.servers : b.players - a.players,
    )
    .map((entry) => {
      const value = geoSort === "servers" ? entry.servers : entry.players;
      return {
        key: entry.country,
        value,
        share: geoTotal ? (value / geoTotal) * 100 : 0,
        label: (
          <span className="flex items-baseline gap-2">
            <span className="w-7 shrink-0 font-mono text-xs text-muted">
              {entry.country}
            </span>
            {countryName(entry.country, entry.country_name, locale)}
          </span>
        ),
        detail: formatMessage(t.stats.geoDetail, {
          servers: formatNumber(entry.servers, locale),
          players: formatNumber(entry.players, locale),
        }),
      };
    });

  const pluginItems: DistributionItem[] = (plugins ?? []).map((plugin) => ({
    key: plugin.name,
    value: plugin.server_count,
    share: plugin.adoption_percentage,
    label: (
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="w-6 shrink-0 font-mono text-xs text-muted">
          {plugin.rank}
        </span>
        {plugin.name}
        {plugin.language && (
          <span className="font-mono text-xs text-muted">
            {languageLabel(plugin.language, t.stats.systems.rustNative)}
          </span>
        )}
        {plugin.market_plugin_id !== null && (
          <a
            href={MARKET_URL}
            target="_blank"
            rel="noopener"
            className="text-xs font-bold text-pumpkin hover:text-fg"
          >
            {t.nav.market}
          </a>
        )}
      </span>
    ),
    detail: formatMessage(t.stats.plugins.detail, {
      count: formatNumber(plugin.server_count, locale),
      percent: formatPercent(plugin.adoption_percentage, locale),
    }),
  }));

  const reportedPlayers = (geo ?? []).reduce(
    (sum, entry) => sum + entry.players,
    0,
  );
  const reportingServers = (geo ?? []).reduce(
    (sum, entry) => sum + entry.servers,
    0,
  );

  const mapSummary = [
    {
      label: t.stats.map.topLocation,
      value: topOnMap ? countryName(topOnMap.country, topOnMap.country_name, locale) : "-",
    },
    { label: t.stats.map.regions, value: geo ? formatNumber(geo.length, locale) : "-" },
    {
      label: t.stats.map.reportedPlayers,
      value: geo ? formatNumber(reportedPlayers, locale) : "-",
    },
    {
      label: t.stats.map.playersPerServer,
      value: geo
        ? reportingServers
          ? (reportedPlayers / reportingServers).toFixed(1)
          : "0"
        : "-",
    },
  ];

  const systemPanels = [
    { title: t.stats.systems.os, items: systems?.os, limit: 5 },
    { title: t.stats.systems.arch, items: systems?.arch },
    { title: t.stats.systems.software, items: systems?.software_versions },
    { title: t.stats.systems.minecraft, items: systems?.minecraft_versions },
    { title: t.stats.systems.serverMemory, items: systems?.ram_distribution },
    { title: t.stats.systems.hostMemory, items: systems?.total_ram_distribution },
  ];

  return (
    <>
      <section className="mx-auto max-w-325 px-5 pt-14 md:px-8 md:pt-20">
        <p className="mb-4 flex items-center gap-2 font-mono text-xs tracking-wider text-success uppercase">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping bg-success opacity-60 motion-reduce:animate-none" />
            <span className="relative size-2 bg-success" />
          </span>
          {t.stats.live}
        </p>
        <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em]">
          {t.stats.title}
          <span className="text-pumpkin">.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">{t.stats.description}</p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-y-2 border-white/15 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs tracking-wider text-muted uppercase">
              {t.stats.timeRange}
            </span>
            <Segmented
              label={t.stats.timeRange}
              options={RANGES.map((id) => ({ id, label: t.stats.ranges[id].label }))}
              value={range}
              onChange={setRange}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
            <span>
              {t.stats.lastPolled}{" "}
              <span className="text-fg">
                {telemetry.lastUpdated
                  ? formatTimeOfDay(telemetry.lastUpdated, locale)
                  : t.stats.connecting}
              </span>
            </span>
            <button
              type="button"
              onClick={telemetry.refresh}
              disabled={telemetry.loading}
              className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-pumpkin uppercase hover:text-fg disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshIcon spinning={telemetry.loading} />
              {t.stats.refresh}
            </button>
            <a
              href={API_DOCS_URL}
              target="_blank"
              rel="noopener"
              className="font-bold text-pumpkin uppercase hover:text-fg"
            >
              {t.stats.apiDocs}
            </a>
          </div>
        </div>

        {telemetry.failed && (
          <p className="mt-4 border-l-3 border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
            {t.stats.unavailable}
          </p>
        )}
      </section>

      <div className="mx-auto grid max-w-325 gap-6 px-5 pt-6 pb-16 md:px-8 md:pb-24">
        <div
          className={`grid gap-0.5 border-2 border-white/15 bg-white/15 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${
            telemetry.rangeLoading ? "opacity-40" : ""
          }`}
        >
          <Kpi
            label={formatMessage(t.stats.kpi.activeServers, { range: rangeShort })}
            value={overview?.active_range_servers}
            detail={
              overview &&
              formatMessage(t.stats.kpi.liveNow, {
                count: formatNumber(overview.live_servers, locale),
                pumpkin: formatNumber(overview.live_pumpkin_servers, locale),
                vine: formatNumber(overview.live_vine_servers, locale),
              })
            }
          />
          <Kpi
            label={formatMessage(t.stats.kpi.peakPlayers, { range: rangeShort })}
            value={overview?.peak_range_players}
            detail={
              overview &&
              formatMessage(t.stats.kpi.onlineNow, {
                count: formatNumber(overview.total_online_players, locale),
              })
            }
          />
          <Kpi
            label={t.stats.kpi.countries}
            value={overview?.total_countries}
            detail={
              topCountry &&
              formatMessage(t.stats.kpi.mostServers, {
                country: countryName(topCountry.country, topCountry.country_name, locale),
              })
            }
          />
          <Kpi
            label={t.stats.kpi.plugins}
            value={overview?.total_tracked_plugins}
            detail={
              plugins?.[0] &&
              formatMessage(t.stats.kpi.mostUsed, { plugin: plugins[0].name })
            }
          />
        </div>

        <Panel
          title={t.stats.activity.title}
          description={formatMessage(t.stats.activity.description, { range: rangeLabel })}
          actions={
            <Segmented
              label={t.stats.activity.metric}
              options={[
                { id: "players", label: t.stats.metrics.players },
                { id: "servers", label: t.stats.metrics.servers },
              ]}
              value={metric}
              onChange={setMetric}
            />
          }
        >
          <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {trendSeries(t, metric).map((spec) => (
              <li key={spec.key} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-0.5 w-4"
                  style={{ backgroundColor: spec.color }}
                />
                {spec.label}
              </li>
            ))}
          </ul>
          <div
            className={`transition-opacity ${telemetry.rangeLoading ? "opacity-40" : ""}`}
          >
            {trends === null ? (
              <div className="grid h-75 place-items-center text-sm text-muted">
                {t.stats.loading}
              </div>
            ) : trends.length === 0 ? (
              <div className="grid h-75 place-items-center text-sm text-muted">
                {t.stats.activity.noData}
              </div>
            ) : (
              <TrendChart
                data={trends}
                metric={metric}
                range={range}
                rangeLabel={rangeLabel}
              />
            )}
          </div>
          {trends && trends.length > 0 && (
            <>
              <dl className="mt-5 grid grid-cols-2 gap-0.5 border-2 border-white/15 bg-white/15 md:grid-cols-4">
                {summarize(t, trends, metric).map((item) => (
                  <div key={item.label} className="bg-surface px-4 py-3">
                    <dt className="font-mono text-xs tracking-wider text-muted uppercase">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-2xl font-extrabold">
                      {formatNumber(item.value, locale)}
                    </dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                aria-expanded={showTable}
                onClick={() => setShowTable((value) => !value)}
                className="mt-4 cursor-pointer text-sm font-bold text-pumpkin hover:text-fg"
              >
                {showTable ? t.stats.activity.hideTable : t.stats.activity.showTable}
              </button>
              {showTable && (
                <div className="mt-3">
                  <TrendTable data={trends} metric={metric} />
                </div>
              )}
            </>
          )}
        </Panel>

        <Panel
          title={t.stats.map.title}
          description={t.stats.map.description}
          actions={
            <Segmented
              label={t.stats.map.metric}
              options={[
                { id: "servers", label: t.stats.metrics.servers },
                { id: "players", label: t.stats.metrics.players },
              ]}
              value={mapMetric}
              onChange={setMapMetric}
            />
          }
        >
          {geo === null ? (
            <div className="grid h-72 place-items-center text-sm text-muted md:h-104">
              {t.stats.loading}
            </div>
          ) : (
            <WorldMap
              geo={geo}
              metric={mapMetric}
              onSelect={setSelectedCountry}
            />
          )}
          <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted">
            <span>{t.stats.map.fewer}</span>
            <span
              aria-hidden="true"
              className="h-2 w-32"
              style={{
                backgroundImage: `linear-gradient(to right, ${MAP_RAMP[0]}, ${MAP_RAMP[1]})`,
              }}
            />
            <span>{mapMetric === "servers" ? t.stats.map.moreServers : t.stats.map.morePlayers}</span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-0.5 border-2 border-white/15 bg-white/15 md:grid-cols-4">
            {mapSummary.map((item) => (
              <div key={item.label} className="min-w-0 bg-surface px-4 py-3">
                <dt className="font-mono text-xs tracking-wider text-muted uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1 truncate text-lg font-extrabold">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title={t.stats.countries.title}
            description={t.stats.countries.description}
            actions={
              <Segmented
                label={t.stats.countries.sort}
                options={[
                  { id: "servers", label: t.stats.metrics.servers },
                  { id: "players", label: t.stats.metrics.players },
                ]}
                value={geoSort}
                onChange={setGeoSort}
              />
            }
          >
            {geo === null ? (
              <Loading />
            ) : (
              <DistributionList
                items={geoItems}
                limit={10}
                idPrefix="geo"
                highlight={selectedCountry}
                empty={t.stats.countries.empty}
              />
            )}
          </Panel>
          <Panel
            title={t.stats.plugins.title}
            description={t.stats.plugins.description}
          >
            {plugins === null ? (
              <Loading />
            ) : (
              <DistributionList
                items={pluginItems}
                limit={10}
                empty={t.stats.plugins.empty}
              />
            )}
          </Panel>
        </div>

        <div className="mt-6">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            {t.stats.players.title}
          </h2>
          <p className="mt-2 max-w-2xl text-muted">{t.stats.players.description}</p>
        </div>

        <Panel
          title={t.stats.players.breakdown}
          description={views.find((view) => view.id === playerView)?.description}
          actions={
            <Segmented
              label={t.stats.players.breakdown}
              options={views}
              value={playerView}
              onChange={setPlayerView}
            />
          }
        >
          {systems === null ? (
            <Loading />
          ) : (
            <DistributionList
              items={shares(
                systems[views.find((view) => view.id === playerView)!.key],
              )}
              limit={8}
              empty={t.stats.players.empty}
            />
          )}
        </Panel>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel
            title={t.stats.players.clientBrands}
            description={t.stats.players.clientBrandsDescription}
          >
            {systems === null ? (
              <Loading />
            ) : (
              <DistributionList
                items={shares(systems.client_brands)}
                limit={8}
                empty={t.stats.players.clientBrandsEmpty}
              />
            )}
          </Panel>
          <Panel
            title={t.stats.players.locales}
            description={t.stats.players.localesDescription}
          >
            {systems === null ? (
              <Loading />
            ) : (
              <DistributionList
                items={shares(systems.player_locales)}
                limit={8}
                empty={t.stats.players.localesEmpty}
              />
            )}
          </Panel>
        </div>
        <div className="mt-6">
          <h2 className="text-3xl font-extrabold md:text-4xl">{t.stats.systems.title}</h2>
          <p className="mt-2 max-w-2xl text-muted">{t.stats.systems.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {systemPanels.map((panel) => (
            <Panel key={panel.title} title={panel.title}>
              {systems === null ? (
                <Loading />
              ) : (
                <DistributionList
                  items={shares(panel.items)}
                  limit={panel.limit}
                  empty={t.stats.systems.empty}
                />
              )}
            </Panel>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title={t.stats.systems.pluginLanguages}
            description={t.stats.systems.pluginLanguagesDescription}
          >
            {systems === null ? (
              <Loading />
            ) : (
              <DistributionList
                items={shares(systems.plugin_languages)}
                limit={10}
                empty={t.stats.systems.pluginLanguagesEmpty}
              />
            )}
          </Panel>
          <Panel
            title={t.stats.systems.cpus}
            description={t.stats.systems.cpusDescription}
          >
            {systems === null ? (
              <Loading />
            ) : (
              <DistributionList
                items={shares(systems.cpu_models)}
                limit={10}
                empty={t.stats.systems.empty}
              />
            )}
          </Panel>
        </div>

        <aside className="mt-6 border-l-3 border-success bg-success/10 px-5 py-4">
          <h2 className="font-extrabold text-success">{t.stats.privacy.title}</h2>
          <p className="mt-2 max-w-4xl text-sm text-muted">
            {rich(t.stats.privacy.body, {
              docs: (text) => (
                <a href={API_DOCS_URL} target="_blank" rel="noopener" className={inlineLink}>
                  {text}
                </a>
              ),
              github: (text) => (
                <a href={GITHUB_URL} target="_blank" rel="noopener" className={inlineLink}>
                  {text}
                </a>
              ),
            })}
          </p>
        </aside>
      </div>
    </>
  );
}
