import { useEffect, useState, type ReactNode } from "react";
import { GITHUB_URL, MARKET_URL } from "../../links";
import { languageTag, useI18n } from "../../i18n";
import { formatMessage } from "../../i18n/format";
import { rich } from "../../i18n/rich";
import { DistributionList, type DistributionItem } from "./DistributionList";
import { TREND_SERIES, TrendChart, TrendTable } from "./TrendChart";
import { useTelemetry } from "./useTelemetry";
import { MAP_RAMP, WorldMap } from "./WorldMap";
import {
  RANGES,
  countryName,
  formatNumber,
  formatPercent,
  type GeoMetric,
  type Share,
  type TrendMetric,
  type TrendPoint,
  type TrendRange,
} from "./types";

const API_DOCS_URL = "https://market.pumpkinmc.org/api/docs/";

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

interface SegmentedProps<T extends string> {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex border-2 border-white/20 font-mono text-xs">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={`cursor-pointer px-3 py-1.5 transition-colors not-last:border-r-2 not-last:border-white/20 ${
            value === option.id ? "bg-fg text-black" : "text-muted hover:text-fg"
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

function Panel({ title, description, actions, children, className = "" }: PanelProps) {
  return (
    <section className={`min-w-0 border-2 border-white/15 bg-surface ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b-2 border-white/15 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Kpi({ label, value, detail }: { label: string; value: number | null | undefined; detail: ReactNode }) {
  const { lang } = useI18n();
  const locale = languageTag(lang);
  return (
    <div className="bg-surface p-5 md:px-6">
      <p className="font-mono text-xs tracking-wider text-muted uppercase">{label}</p>
      <p className="mt-2 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
        {value === null || value === undefined ? "-" : formatNumber(value, locale)}
      </p>
      <p className="mt-1 min-h-5 text-sm text-muted">{detail}</p>
    </div>
  );
}

function Loading() {
  const { t } = useI18n();
  return <p className="py-2 text-sm text-muted">{t.statsPage.loading}</p>;
}

function shares(list: Share[] | undefined): DistributionItem[] {
  return (list ?? []).map((share) => ({ key: share.label, label: share.label, value: share.count, share: share.percentage }));
}

function summarize(data: TrendPoint[], metric: TrendMetric) {
  const level = (point: TrendPoint) => (metric === "players" ? point.online_players : point.active_servers);
  const peak = (point: TrendPoint) => (metric === "players" ? point.peak_players : point.active_servers);
  const levels = data.map(level);
  return [
    { key: "peak" as const, value: Math.max(0, ...data.map(peak)) },
    { key: "average" as const, value: Math.round(levels.reduce((sum, value) => sum + value, 0) / (levels.length || 1)) },
    { key: "low" as const, value: levels.length ? Math.min(...levels) : 0 },
    { key: "latest" as const, value: levels.at(-1) ?? 0 },
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
  const { t, lang } = useI18n();
  const s = t.statsPage;
  const locale = languageTag(lang);
  const [range, setRange] = useState<TrendRange>("24h");
  const [metric, setMetric] = useState<TrendMetric>("players");
  const [mapMetric, setMapMetric] = useState<GeoMetric>("servers");
  const [geoSort, setGeoSort] = useState<GeoMetric>("servers");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const telemetry = useTelemetry(range);
  const { overview, trends, systems, geo, plugins } = telemetry;
  const rangeOptions = RANGES.map((id) => ({ id, label: s.ranges[id].label }));
  const rangeLabel = s.ranges[range].long;
  const rangeShort = range === "all" ? rangeLabel : s.ranges[range].label;

  useEffect(() => {
    if (!selectedCountry) return;
    document.getElementById(`geo-${selectedCountry}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setSelectedCountry(null), 2500);
    return () => window.clearTimeout(timer);
  }, [selectedCountry]);

  const topCountry = [...(geo ?? [])].sort((a, b) => b.servers - a.servers)[0];
  const topOnMap = [...(geo ?? [])].sort((a, b) => b[mapMetric] - a[mapMetric])[0];
  const geoTotal = (geo ?? []).reduce((sum, entry) => sum + (geoSort === "servers" ? entry.servers : entry.players), 0);
  const geoItems: DistributionItem[] = [...(geo ?? [])]
    .sort((a, b) => (geoSort === "servers" ? b.servers - a.servers : b.players - a.players))
    .map((entry) => {
      const value = geoSort === "servers" ? entry.servers : entry.players;
      return {
        key: entry.country,
        value,
        share: geoTotal ? (value / geoTotal) * 100 : 0,
        label: (
          <span className="flex items-baseline gap-2">
            <span className="w-7 shrink-0 font-mono text-xs text-muted">{entry.country}</span>
            {countryName(entry.country, entry.country_name, locale)}
          </span>
        ),
        detail: (
          <>
            <span className="text-fg">{formatNumber(entry.servers, locale)}</span> {s.serverUnit} ·{" "}
            <span className="text-fg">{formatNumber(entry.players, locale)}</span> {s.playerUnit}
          </>
        ),
      };
    });

  const pluginItems: DistributionItem[] = (plugins ?? []).map((plugin) => ({
    key: plugin.name,
    value: plugin.server_count,
    share: plugin.adoption_percentage,
    label: (
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="w-6 shrink-0 font-mono text-xs text-muted">{plugin.rank}</span>
        {plugin.name}
        {plugin.market_plugin_id !== null && (
          <a href={MARKET_URL} target="_blank" rel="noopener" className="text-xs font-bold text-pumpkin hover:text-fg">
            {s.market}
          </a>
        )}
      </span>
    ),
    detail: (
      <>
        <span className="text-fg">{formatNumber(plugin.server_count, locale)}</span> {s.serverUnit} ·{" "}
        {formatPercent(plugin.adoption_percentage, locale)}
      </>
    ),
  }));

  const reportedPlayers = (geo ?? []).reduce((sum, entry) => sum + entry.players, 0);
  const reportingServers = (geo ?? []).reduce((sum, entry) => sum + entry.servers, 0);

  const mapSummary = [
    { label: s.topLocation, value: topOnMap ? countryName(topOnMap.country, topOnMap.country_name, locale) : "-" },
    { label: s.regions, value: geo ? formatNumber(geo.length, locale) : "-" },
    { label: s.reportedPlayers, value: geo ? formatNumber(reportedPlayers, locale) : "-" },
    {
      label: s.playersPerServer,
      value: geo ? (reportingServers ? (reportedPlayers / reportingServers).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "0") : "-",
    },
  ];

  const systemPanels = [
    { title: s.operatingSystems, items: systems?.os, limit: 5 },
    { title: s.cpuArchitecture, items: systems?.arch },
    { title: s.softwareVersions, items: systems?.software_versions },
    { title: s.minecraftVersions, items: systems?.minecraft_versions },
    { title: s.serverMemory, items: systems?.ram_distribution },
    { title: s.hostMemory, items: systems?.total_ram_distribution },
  ];

  return (
    <>
      <section className="mx-auto max-w-325 px-5 pt-14 md:px-8 md:pt-20">
        <p className="mb-4 flex items-center gap-2 font-mono text-xs tracking-wider text-success uppercase">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping bg-success opacity-60 motion-reduce:animate-none" />
            <span className="relative size-2 bg-success" />
          </span>
          {s.liveTelemetry}
        </p>
        <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em]">
          {s.title}<span className="text-pumpkin">.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">
          {s.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-y-2 border-white/15 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs tracking-wider text-muted uppercase">{s.timeRange}</span>
            <Segmented label={s.timeRange} options={rangeOptions} value={range} onChange={setRange} />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
            <span>
              {s.lastPolled}{" "}
              <span className="text-fg">
                {telemetry.lastUpdated ? telemetry.lastUpdated.toLocaleTimeString(locale, { hour12: false }) : s.connecting}
              </span>
            </span>
            <button
              type="button"
              onClick={telemetry.refresh}
              disabled={telemetry.loading}
              className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-pumpkin uppercase hover:text-fg disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshIcon spinning={telemetry.loading} />
              {s.refresh}
            </button>
            <a href={API_DOCS_URL} target="_blank" rel="noopener" className="font-bold text-pumpkin uppercase hover:text-fg">
              {s.apiDocs}
            </a>
          </div>
        </div>

        {telemetry.failed && (
          <p className="mt-4 border-l-3 border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
            {s.unavailable}
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
            label={formatMessage(s.activeServers, { range: rangeShort })}
            value={overview?.active_range_servers}
            detail={
              overview && (
                rich(formatMessage(s.liveNow, { count: formatNumber(overview.live_servers, locale), pumpkin: formatNumber(overview.live_pumpkin_servers, locale), vine: formatNumber(overview.live_vine_servers, locale) }), { count: (text) => <span className="text-fg">{text}</span> })
              )
            }
          />
          <Kpi
            label={formatMessage(s.peakPlayers, { range: rangeShort })}
            value={overview?.peak_range_players}
            detail={
              overview && (
                rich(formatMessage(s.onlineNow, { count: formatNumber(overview.total_online_players, locale) }), { count: (text) => <span className="text-fg">{text}</span> })
              )
            }
          />
          <Kpi label={s.countries} value={overview?.total_countries} detail={topCountry && formatMessage(s.mostServers, { country: countryName(topCountry.country, topCountry.country_name, locale) })} />
          <Kpi label={s.trackedPlugins} value={overview?.total_tracked_plugins} detail={plugins?.[0] && formatMessage(s.mostUsed, { plugin: plugins[0].name })} />
        </div>

        <Panel
          title={s.activityTitle}
          description={formatMessage(s.activityDescription, { range: rangeLabel })}
          actions={
            <Segmented
              label={s.metric}
              options={[
                { id: "players", label: s.players },
                { id: "servers", label: s.servers },
              ]}
              value={metric}
              onChange={setMetric}
            />
          }
        >
          <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {TREND_SERIES[metric].map((spec) => (
              <li key={spec.key} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-0.5 w-4" style={{ backgroundColor: spec.color }} />
                {s.series[spec.key]}
              </li>
            ))}
          </ul>
          <div className={`transition-opacity ${telemetry.rangeLoading ? "opacity-40" : ""}`}>
            {trends === null ? (
              <div className="grid h-75 place-items-center text-sm text-muted">{s.loading}</div>
            ) : trends.length === 0 ? (
              <div className="grid h-75 place-items-center text-sm text-muted">{s.noTrends}</div>
            ) : (
              <TrendChart data={trends} metric={metric} range={range} rangeLabel={rangeLabel} />
            )}
          </div>
          {trends && trends.length > 0 && (
            <>
              <dl className="mt-5 grid grid-cols-2 gap-0.5 border-2 border-white/15 bg-white/15 md:grid-cols-4">
                {summarize(trends, metric).map((item) => (
                  <div key={item.key} className="bg-surface px-4 py-3">
                    <dt className="font-mono text-xs tracking-wider text-muted uppercase">{s.summary[item.key]}</dt>
                    <dd className="mt-1 text-2xl font-extrabold">{formatNumber(item.value, locale)}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                aria-expanded={showTable}
                onClick={() => setShowTable((value) => !value)}
                className="mt-4 cursor-pointer text-sm font-bold text-pumpkin hover:text-fg"
              >
                {showTable ? s.hideTable : s.showTable}
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
          title={s.mapTitle}
          description={s.mapDescription}
          actions={
            <Segmented
              label={s.mapMetric}
              options={[
                { id: "servers", label: s.servers },
                { id: "players", label: s.players },
              ]}
              value={mapMetric}
              onChange={setMapMetric}
            />
          }
        >
          {geo === null ? (
            <div className="grid h-72 place-items-center text-sm text-muted md:h-104">{s.loading}</div>
          ) : (
            <WorldMap geo={geo} metric={mapMetric} onSelect={setSelectedCountry} />
          )}
          <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted">
            <span>{s.fewer}</span>
            <span
              aria-hidden="true"
              className="h-2 w-32"
              style={{ backgroundImage: `linear-gradient(to right, ${MAP_RAMP[0]}, ${MAP_RAMP[1]})` }}
            />
            <span>{mapMetric === "servers" ? s.moreServers : s.morePlayers}</span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-0.5 border-2 border-white/15 bg-white/15 md:grid-cols-4">
            {mapSummary.map((item) => (
              <div key={item.label} className="min-w-0 bg-surface px-4 py-3">
                <dt className="font-mono text-xs tracking-wider text-muted uppercase">{item.label}</dt>
                <dd className="mt-1 truncate text-lg font-extrabold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title={s.countries}
            description={s.countriesDescription}
            actions={
              <Segmented
                label={s.sortCountries}
                options={[
                  { id: "servers", label: s.servers },
                  { id: "players", label: s.players },
                ]}
                value={geoSort}
                onChange={setGeoSort}
              />
            }
          >
            {geo === null ? (
              <Loading />
            ) : (
              <DistributionList items={geoItems} limit={10} idPrefix="geo" highlight={selectedCountry} empty={s.noGeo} />
            )}
          </Panel>
          <Panel title={s.popularPlugins} description={s.pluginsDescription}>
            {plugins === null ? <Loading /> : <DistributionList items={pluginItems} limit={10} empty={s.noPlugins} />}
          </Panel>
        </div>

        <div className="mt-6">
          <h2 className="text-3xl font-extrabold md:text-4xl">{s.systemsTitle}</h2>
          <p className="mt-2 max-w-2xl text-muted">
            {s.systemsDescription}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {systemPanels.map((panel) => (
            <Panel key={panel.title} title={panel.title}>
              {systems === null ? <Loading /> : <DistributionList items={shares(panel.items)} limit={panel.limit} empty={s.noData} />}
            </Panel>
          ))}
        </div>

        <Panel title={s.serverCpus} description={s.cpusDescription}>
          {systems === null ? <Loading /> : <DistributionList items={shares(systems.cpu_models)} limit={10} empty={s.noData} />}
        </Panel>

        <aside className="mt-6 border-l-3 border-success bg-success/10 px-5 py-4">
          <h2 className="font-extrabold text-success">{s.privacyTitle}</h2>
          <p className="mt-2 max-w-4xl text-sm text-muted">
            {rich(s.privacyBody, {
              apiDocs: (text) => <a href={API_DOCS_URL} target="_blank" rel="noopener" className={inlineLink}>{text}</a>,
              github: (text) => <a href={GITHUB_URL} target="_blank" rel="noopener" className={inlineLink}>{text}</a>,
            })}
          </p>
        </aside>
      </div>
    </>
  );
}
