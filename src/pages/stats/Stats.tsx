import { useEffect, useState, type ReactNode } from "react";
import { GITHUB_URL, MARKET_URL } from "../../links";
import { DistributionList, type DistributionItem } from "./DistributionList";
import { TREND_SERIES, TrendChart, TrendTable } from "./TrendChart";
import { useTelemetry } from "./useTelemetry";
import { MAP_RAMP, WorldMap } from "./WorldMap";
import {
  RANGES,
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
  return (
    <div className="bg-surface p-5 md:px-6">
      <p className="font-mono text-xs tracking-wider text-muted uppercase">{label}</p>
      <p className="mt-2 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
        {value === null || value === undefined ? "-" : formatNumber(value)}
      </p>
      <p className="mt-1 min-h-5 text-sm text-muted">{detail}</p>
    </div>
  );
}

function Loading() {
  return <p className="py-2 text-sm text-muted">Loading...</p>;
}

function shares(list: Share[] | undefined): DistributionItem[] {
  return (list ?? []).map((share) => ({ key: share.label, label: share.label, value: share.count, share: share.percentage }));
}

function summarize(data: TrendPoint[], metric: TrendMetric) {
  const level = (point: TrendPoint) => (metric === "players" ? point.online_players : point.active_servers);
  const peak = (point: TrendPoint) => (metric === "players" ? point.peak_players : point.active_servers);
  const levels = data.map(level);
  return [
    { label: "Peak", value: Math.max(0, ...data.map(peak)) },
    { label: "Average", value: Math.round(levels.reduce((sum, value) => sum + value, 0) / (levels.length || 1)) },
    { label: "Low", value: levels.length ? Math.min(...levels) : 0 },
    { label: "Latest", value: levels.at(-1) ?? 0 },
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
  const [range, setRange] = useState<TrendRange>("24h");
  const [metric, setMetric] = useState<TrendMetric>("players");
  const [mapMetric, setMapMetric] = useState<GeoMetric>("servers");
  const [geoSort, setGeoSort] = useState<GeoMetric>("servers");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const telemetry = useTelemetry(range);
  const { overview, trends, systems, geo, plugins } = telemetry;
  const rangeOption = RANGES.find((option) => option.id === range);
  const rangeLabel = rangeOption?.long ?? range;
  const rangeShort = range === "all" ? "all time" : (rangeOption?.label ?? range);

  useEffect(() => {
    if (!selectedCountry) return;
    document.getElementById(`geo-${selectedCountry}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setSelectedCountry(null), 2500);
    return () => window.clearTimeout(timer);
  }, [selectedCountry]);

  const topCountry = [...(geo ?? [])].sort((a, b) => b.servers - a.servers)[0];
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
            {entry.country_name}
          </span>
        ),
        detail: (
          <>
            <span className="text-fg">{formatNumber(entry.servers)}</span> servers ·{" "}
            <span className="text-fg">{formatNumber(entry.players)}</span> players
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
            Market
          </a>
        )}
      </span>
    ),
    detail: (
      <>
        <span className="text-fg">{formatNumber(plugin.server_count)}</span> servers ·{" "}
        {formatPercent(plugin.adoption_percentage)}
      </>
    ),
  }));

  const reportedPlayers = (geo ?? []).reduce((sum, entry) => sum + entry.players, 0);
  const reportingServers = (geo ?? []).reduce((sum, entry) => sum + entry.servers, 0);

  const mapSummary = [
    { label: "Top location", value: topCountry ? topCountry.country_name : "-" },
    { label: "Regions", value: geo ? formatNumber(geo.length) : "-" },
    { label: "Reported players", value: geo ? formatNumber(reportedPlayers) : "-" },
    {
      label: "Players per server",
      value: geo ? (reportingServers ? (reportedPlayers / reportingServers).toFixed(1) : "0") : "-",
    },
  ];

  const systemPanels = [
    { title: "Operating systems", items: systems?.os, limit: 5 },
    { title: "CPU architecture", items: systems?.arch },
    { title: "Software versions", items: systems?.software_versions },
    { title: "Minecraft versions", items: systems?.minecraft_versions },
    { title: "Allocated server memory", items: systems?.ram_distribution },
    { title: "Host machine memory", items: systems?.total_ram_distribution },
  ];

  return (
    <>
      <section className="mx-auto max-w-325 px-5 pt-14 md:px-8 md:pt-20">
        <p className="mb-4 flex items-center gap-2 font-mono text-xs tracking-wider text-success uppercase">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping bg-success opacity-60 motion-reduce:animate-none" />
            <span className="relative size-2 bg-success" />
          </span>
          Live telemetry
        </p>
        <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em]">
          Ecosystem telemetry<span className="text-pumpkin">.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">
          Real-time network telemetry, global node distribution, hardware infrastructure, and community server analytics
          across Pumpkin and Vine deployments.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-y-2 border-white/15 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs tracking-wider text-muted uppercase">Time range</span>
            <Segmented label="Time range" options={RANGES} value={range} onChange={setRange} />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
            <span>
              Last polled{" "}
              <span className="text-fg">
                {telemetry.lastUpdated ? telemetry.lastUpdated.toLocaleTimeString("en-US", { hour12: false }) : "connecting..."}
              </span>
            </span>
            <button
              type="button"
              onClick={telemetry.refresh}
              disabled={telemetry.loading}
              className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-pumpkin uppercase hover:text-fg disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshIcon spinning={telemetry.loading} />
              Refresh
            </button>
            <a href={API_DOCS_URL} target="_blank" rel="noopener" className="font-bold text-pumpkin uppercase hover:text-fg">
              API docs
            </a>
          </div>
        </div>

        {telemetry.failed && (
          <p className="mt-4 border-l-3 border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
            Telemetry is unreachable right now. The page retries every minute.
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
            label={`Active servers · ${rangeShort}`}
            value={overview?.active_range_servers}
            detail={
              overview && (
                <>
                  <span className="text-fg">{formatNumber(overview.live_servers)}</span> live now · Pumpkin{" "}
                  {formatNumber(overview.live_pumpkin_servers)} · Vine {formatNumber(overview.live_vine_servers)}
                </>
              )
            }
          />
          <Kpi
            label={`Peak players · ${rangeShort}`}
            value={overview?.peak_range_players}
            detail={
              overview && (
                <>
                  <span className="text-fg">{formatNumber(overview.total_online_players)}</span> online now
                </>
              )
            }
          />
          <Kpi label="Countries" value={overview?.total_countries} detail={topCountry && <>Most servers in {topCountry.country_name}</>} />
          <Kpi label="Tracked plugins" value={overview?.total_tracked_plugins} detail={plugins?.[0] && <>Most used: {plugins[0].name}</>} />
        </div>

        <Panel
          title="Activity over time"
          description={`Concurrent players and online servers, ${rangeLabel}.`}
          actions={
            <Segmented
              label="Metric"
              options={[
                { id: "players", label: "Players" },
                { id: "servers", label: "Servers" },
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
                {spec.label}
              </li>
            ))}
          </ul>
          <div className={`transition-opacity ${telemetry.rangeLoading ? "opacity-40" : ""}`}>
            {trends === null ? (
              <div className="grid h-75 place-items-center text-sm text-muted">Loading...</div>
            ) : trends.length === 0 ? (
              <div className="grid h-75 place-items-center text-sm text-muted">No telemetry trend data available.</div>
            ) : (
              <TrendChart data={trends} metric={metric} range={range} rangeLabel={rangeLabel} />
            )}
          </div>
          {trends && trends.length > 0 && (
            <>
              <dl className="mt-5 grid grid-cols-2 gap-0.5 border-2 border-white/15 bg-white/15 md:grid-cols-4">
                {summarize(trends, metric).map((item) => (
                  <div key={item.label} className="bg-surface px-4 py-3">
                    <dt className="font-mono text-xs tracking-wider text-muted uppercase">{item.label}</dt>
                    <dd className="mt-1 text-2xl font-extrabold">{formatNumber(item.value)}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                aria-expanded={showTable}
                onClick={() => setShowTable((value) => !value)}
                className="mt-4 cursor-pointer text-sm font-bold text-pumpkin hover:text-fg"
              >
                {showTable ? "Hide data table" : "Show data table"}
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
          title="Where servers run"
          description="Geographic distribution of active servers and player traffic. Click a country to find it in the list."
          actions={
            <Segmented
              label="Map metric"
              options={[
                { id: "servers", label: "Servers" },
                { id: "players", label: "Players" },
              ]}
              value={mapMetric}
              onChange={setMapMetric}
            />
          }
        >
          {geo === null ? (
            <div className="grid h-72 place-items-center text-sm text-muted md:h-104">Loading...</div>
          ) : (
            <WorldMap geo={geo} metric={mapMetric} onSelect={setSelectedCountry} />
          )}
          <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted">
            <span>Fewer</span>
            <span
              aria-hidden="true"
              className="h-2 w-32"
              style={{ backgroundImage: `linear-gradient(to right, ${MAP_RAMP[0]}, ${MAP_RAMP[1]})` }}
            />
            <span>More {mapMetric}</span>
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
            title="Countries"
            description="Servers and player traffic by host country."
            actions={
              <Segmented
                label="Sort countries by"
                options={[
                  { id: "servers", label: "Servers" },
                  { id: "players", label: "Players" },
                ]}
                value={geoSort}
                onChange={setGeoSort}
              />
            }
          >
            {geo === null ? (
              <Loading />
            ) : (
              <DistributionList items={geoItems} limit={10} idPrefix="geo" highlight={selectedCountry} empty="No geolocation data reported." />
            )}
          </Panel>
          <Panel title="Popular plugins" description="Most adopted plugins across reporting servers.">
            {plugins === null ? <Loading /> : <DistributionList items={pluginItems} limit={10} empty="No plugin telemetry reported." />}
          </Panel>
        </div>

        <div className="mt-6">
          <h2 className="text-3xl font-extrabold md:text-4xl">Systems & hardware</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Operating systems, CPU architectures, software versions, and memory footprints reported by server hosts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {systemPanels.map((panel) => (
            <Panel key={panel.title} title={panel.title}>
              {systems === null ? <Loading /> : <DistributionList items={shares(panel.items)} limit={panel.limit} empty="No data reported." />}
            </Panel>
          ))}
        </div>

        <Panel title="Server CPUs" description="The processors reported most often.">
          {systems === null ? <Loading /> : <DistributionList items={shares(systems.cpu_models)} limit={10} empty="No data reported." />}
        </Panel>

        <aside className="mt-6 border-l-3 border-success bg-success/10 px-5 py-4">
          <h2 className="font-extrabold text-success">Privacy-preserving open telemetry</h2>
          <p className="mt-2 max-w-4xl text-sm text-muted">
            Pumpkin and Vine telemetry is completely transparent, non-identifying, and privacy-first. We collect aggregated
            system metrics (OS, CPU architecture, memory range, software versions, and player counts) to help benchmark
            performance, optimize multi-threading, and prioritize Minecraft version compatibility. To learn more or
            integrate your own tools, visit our{" "}
            <a href={API_DOCS_URL} target="_blank" rel="noopener" className={inlineLink}>
              Telemetry API documentation
            </a>{" "}
            or inspect the telemetry modules in our{" "}
            <a href={GITHUB_URL} target="_blank" rel="noopener" className={inlineLink}>
              GitHub repository
            </a>
            .
          </p>
        </aside>
      </div>
    </>
  );
}
