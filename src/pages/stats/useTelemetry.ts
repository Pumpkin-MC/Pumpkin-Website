import { useCallback, useEffect, useRef, useState } from "react";
import { MARKET_API_URL } from "../../lib/marketApi";
import type { GeoEntry, Overview, PluginEntry, Systems, TrendPoint, TrendRange } from "./types";

const API_BASE = `${MARKET_API_URL}/telemetry`;
const REFRESH_MS = 60_000;
const TIMEOUT_MS = 15_000;

export interface TelemetryData {
  overview: Overview | null;
  trends: TrendPoint[] | null;
  systems: Systems | null;
  geo: GeoEntry[] | null;
  plugins: PluginEntry[] | null;
  lastUpdated: Date | null;
  loading: boolean;
  rangeLoading: boolean;
  failed: boolean;
}

const initialState: TelemetryData = {
  overview: null,
  trends: null,
  systems: null,
  geo: null,
  plugins: null,
  lastUpdated: null,
  loading: false,
  rangeLoading: false,
  failed: false,
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Telemetry request failed: ${path}`);
  return (await response.json()) as T;
}

function settled<T>(result: PromiseSettledResult<T>, fallback: T | null): T | null {
  return result.status === "fulfilled" ? result.value : fallback;
}

export function useTelemetry(range: TrendRange): TelemetryData & { refresh: () => void } {
  const [state, setState] = useState<TelemetryData>(initialState);
  const rangeRef = useRef(range);
  const requestRef = useRef(0);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    const current = rangeRef.current;
    setState((previous) => ({ ...previous, loading: true }));
    const results = await Promise.allSettled([
      getJson<Overview>(`overview?range=${encodeURIComponent(current)}`),
      getJson<TrendPoint[]>(`trends?range=${encodeURIComponent(current)}`),
      getJson<Systems>("systems"),
      getJson<GeoEntry[]>("geo"),
      getJson<PluginEntry[]>("plugins"),
    ]);
    if (!mountedRef.current || request !== requestRef.current) return;
    const [overview, trends, systems, geo, plugins] = results;
    setState((previous) => ({
      overview: settled(overview, previous.overview),
      trends: settled(trends, previous.trends),
      systems: settled(systems, previous.systems),
      geo: settled(geo, previous.geo),
      plugins: settled(plugins, previous.plugins),
      lastUpdated: new Date(),
      loading: false,
      rangeLoading: false,
      failed: results.every((result) => result.status === "rejected"),
    }));
  }, []);

  const loadRange = useCallback(async (next: TrendRange) => {
    const request = ++requestRef.current;
    setState((previous) => ({ ...previous, rangeLoading: true }));
    const [overview, trends] = await Promise.allSettled([
      getJson<Overview>(`overview?range=${encodeURIComponent(next)}`),
      getJson<TrendPoint[]>(`trends?range=${encodeURIComponent(next)}`),
    ]);
    if (!mountedRef.current || request !== requestRef.current) return;
    setState((previous) => ({
      ...previous,
      overview: settled(overview, null),
      trends: settled(trends, null),
      rangeLoading: false,
    }));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [refresh]);

  useEffect(() => {
    if (rangeRef.current === range) return;
    rangeRef.current = range;
    loadRange(range);
  }, [range, loadRange]);

  return { ...state, refresh };
}
