export type TrendRange = "24h" | "7d" | "30d" | "90d" | "all";
export type TrendMetric = "players" | "servers";
export type GeoMetric = "servers" | "players";

export interface Overview {
  live_servers: number;
  live_pumpkin_servers: number;
  live_vine_servers: number;
  active_24h_servers: number;
  active_range_servers: number;
  total_online_players: number;
  peak_24h_players: number;
  peak_range_players: number;
  total_tracked_plugins: number;
  total_countries: number;
  range: string;
  last_updated: string;
}

export interface TrendPoint {
  timestamp: string;
  active_servers: number;
  pumpkin_servers: number;
  vine_servers: number;
  online_players: number;
  peak_players: number;
}

export interface Share {
  label: string;
  count: number;
  percentage: number;
}

export interface Systems {
  os: Share[];
  arch: Share[];
  cpu_models: Share[];
  minecraft_versions: Share[];
  software_versions: Share[];
  ram_distribution: Share[];
  total_ram_distribution: Share[];
}

export interface GeoEntry {
  country: string;
  country_name: string;
  servers: number;
  players: number;
  percentage: number;
}

export interface PluginEntry {
  rank: number;
  name: string;
  server_count: number;
  adoption_percentage: number;
  market_plugin_id: string | number | null;
  market_plugin_name: string | null;
}

export const RANGES: { id: TrendRange; label: string; long: string }[] = [
  { id: "24h", label: "24H", long: "last 24 hours" },
  { id: "7d", label: "7D", long: "last 7 days" },
  { id: "30d", label: "30D", long: "last 30 days" },
  { id: "90d", label: "90D", long: "last 90 days" },
  { id: "all", label: "All", long: "all time" },
];

export function formatNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("en-US");
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
