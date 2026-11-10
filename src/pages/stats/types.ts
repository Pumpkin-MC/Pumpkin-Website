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

export const RANGES: TrendRange[] = ["24h", "7d", "30d", "90d", "all"];

export function formatNumber(value: number | null | undefined, locale = "en-US"): string {
  return (value ?? 0).toLocaleString(locale);
}

export function formatPercent(value: number, locale = "en-US"): string {
  if (locale === "en-US") return `${value.toFixed(1)}%`;
  return (value / 100).toLocaleString(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function countryName(code: string, fallback: string, locale: string): string {
  if (locale === "en-US") return fallback;
  try {
    const name = new Intl.DisplayNames([locale], { type: "region" }).of(code);
    return name && name !== code ? name : fallback;
  } catch {
    return fallback;
  }
}
