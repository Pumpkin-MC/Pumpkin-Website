import { useEffect, useRef, useState } from "react";
import "jsvectormap/dist/jsvectormap.css";
import "./map.css";
import { languageTag, useI18n } from "../../i18n";
import { countryName, formatMessage, formatNumber } from "../../i18n/format";
import type { GeoEntry, GeoMetric } from "./types";

const MAP_ID = "telemetry-map";
export const MAP_RAMP = ["#4a2410", "#ff6b2c"] as const;

type MapEngine = new (options: Record<string, unknown>) => { destroy(): void };

interface MapTooltip {
  text: (html?: string, isHtml?: boolean) => string;
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

interface WorldMapProps {
  geo: GeoEntry[];
  metric: GeoMetric;
  onSelect: (code: string) => void;
}

export function WorldMap({ geo, metric, onSelect }: WorldMapProps) {
  const { lang, t } = useI18n();
  const locale = languageTag(lang);
  const [engine, setEngine] = useState<MapEngine | null>(null);
  const [failed, setFailed] = useState(false);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: JsVectorMap } = await import("jsvectormap");
        (globalThis as { jsVectorMap?: unknown }).jsVectorMap = JsVectorMap;
        await import("jsvectormap/dist/maps/world.js");
        if (!cancelled) setEngine(() => JsVectorMap as MapEngine);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = document.getElementById(MAP_ID);
    if (!engine || !container) return;
    container.innerHTML = "";
    const byCode = new Map(geo.map((entry) => [entry.country, entry]));
    const values = Object.fromEntries(geo.map((entry) => [entry.country, metric === "servers" ? entry.servers : entry.players]));
    const hasData = Object.values(values).some((value) => value > 0);

    const map = new engine({
      selector: `#${MAP_ID}`,
      map: "world",
      backgroundColor: "transparent",
      draggable: true,
      zoomButtons: true,
      zoomOnScroll: false,
      regionStyle: {
        initial: { fill: "#262626", stroke: "#0d0d0d", strokeWidth: 0.5, fillOpacity: 1 },
        hover: { fillOpacity: 0.8, cursor: "pointer" },
        selected: { fill: "#ff6b2c" },
      },
      ...(hasData ? { visualizeData: { scale: [...MAP_RAMP], values } } : {}),
      onRegionTooltipShow(_event: unknown, tooltip: MapTooltip, code: string) {
        const entry = byCode.get(code);
        if (entry) {
          tooltip.text(
            `<strong>${escapeHtml(countryName(entry.country, entry.country_name, locale))}</strong><br>${escapeHtml(
              formatMessage(t.stats.map.tooltip, {
                servers: formatNumber(entry.servers, locale),
                players: formatNumber(entry.players, locale),
              }),
            )}`,
            true,
          );
        } else {
          tooltip.text(`<strong>${escapeHtml(tooltip.text())}</strong><br>${escapeHtml(t.stats.map.noReporting)}`, true);
        }
      },
      onRegionClick(_event: unknown, code: string) {
        if (byCode.has(code)) onSelectRef.current(code);
      },
    });

    return () => {
      try {
        map.destroy();
      } catch {
        container.innerHTML = "";
      }
    };
  }, [engine, geo, metric, locale, t]);

  return (
    <div className="relative h-72 md:h-104">
      <div id={MAP_ID} className="size-full" />
      {!engine && !failed && (
        <p className="absolute inset-0 grid place-items-center text-sm text-muted">{t.stats.map.loading}</p>
      )}
      {failed && <p className="absolute inset-0 grid place-items-center text-sm text-muted">{t.stats.map.error}</p>}
    </div>
  );
}
