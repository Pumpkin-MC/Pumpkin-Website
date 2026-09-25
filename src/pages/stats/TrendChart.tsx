import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatNumber, type TrendMetric, type TrendPoint, type TrendRange } from "./types";

type SeriesKey = "online_players" | "peak_players" | "pumpkin_servers" | "vine_servers";

export interface SeriesSpec {
  key: SeriesKey;
  label: string;
  color: string;
}

export const TREND_SERIES: Record<TrendMetric, SeriesSpec[]> = {
  players: [
    { key: "online_players", label: "Online players", color: "#d95926" },
    { key: "peak_players", label: "Peak players", color: "#3987e5" },
  ],
  servers: [
    { key: "pumpkin_servers", label: "Pumpkin servers", color: "#d95926" },
    { key: "vine_servers", label: "Vine servers", color: "#3987e5" },
  ],
};

const HEIGHT = 300;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
const GRID = "#2c2c2a";
const BASELINE = "#383835";
const CROSSHAIR = "#898781";
const SURFACE = "#1a1a1a";
const TOOLTIP_WIDTH = 190;

export function formatTick(iso: string, range: TrendRange): string {
  const date = new Date(iso);
  return range === "24h"
    ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatMoment(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function niceStep(raw: number): number {
  const exponent = Math.floor(Math.log10(raw));
  const base = raw / 10 ** exponent;
  const nice = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

function yTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const step = Math.max(1, niceStep(max / 4));
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
}

interface TrendChartProps {
  data: TrendPoint[];
  metric: TrendMetric;
  range: TrendRange;
  rangeLabel: string;
}

export function TrendChart({ data, metric, range, rangeLabel }: TrendChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const series = TREND_SERIES[metric];

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActive(null);
  }, [data, metric]);

  const geometry = useMemo(() => {
    if (width === 0 || data.length === 0) return null;
    const plotWidth = Math.max(width - PAD.left - PAD.right, 1);
    const plotHeight = HEIGHT - PAD.top - PAD.bottom;
    const max = Math.max(0, ...data.flatMap((point) => series.map((spec) => point[spec.key])));
    const ticks = yTicks(max);
    const top = ticks[ticks.length - 1];
    const x = (index: number) => PAD.left + (data.length > 1 ? (index / (data.length - 1)) * plotWidth : plotWidth / 2);
    const y = (value: number) => PAD.top + plotHeight - (value / top) * plotHeight;
    const paths = series.map((spec) => {
      const line = data
        .map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point[spec.key]).toFixed(1)}`)
        .join("");
      const area = `${line}L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)}L${x(0).toFixed(1)},${y(0).toFixed(1)}Z`;
      return { ...spec, line, area };
    });
    const labelCount = Math.max(2, Math.min(6, Math.floor(plotWidth / 110)));
    const labelIndexes = [
      ...new Set(Array.from({ length: labelCount }, (_, index) => Math.round((index / (labelCount - 1)) * (data.length - 1)))),
    ];
    return { plotWidth, plotHeight, ticks, x, y, paths, labelIndexes };
  }, [width, data, series]);

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!geometry) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left - PAD.left) / geometry.plotWidth;
    setActive(Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1)))));
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    setActive((current) => Math.min(data.length - 1, Math.max(0, (current ?? data.length - 1) + step)));
  }

  const point = active !== null ? data[active] : null;
  const tooltipLeft =
    geometry && active !== null
      ? geometry.x(active) + 12 + TOOLTIP_WIDTH > width
        ? geometry.x(active) - 12 - TOOLTIP_WIDTH
        : geometry.x(active) + 12
      : 0;

  return (
    <div ref={wrapRef} className="relative" style={{ height: HEIGHT }}>
      {geometry && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${series.map((spec) => spec.label).join(" and ")}, ${rangeLabel}. Use the arrow keys to read values.`}
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(data.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={handleKeyDown}
          className="block touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pumpkin"
        >
          {geometry.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + geometry.plotWidth}
                y1={geometry.y(tick)}
                y2={geometry.y(tick)}
                stroke={tick === 0 ? BASELINE : GRID}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={geometry.y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted font-mono text-[11px] tabular-nums"
              >
                {formatNumber(tick)}
              </text>
            </g>
          ))}
          {geometry.labelIndexes.map((index) => (
            <text
              key={index}
              x={geometry.x(index)}
              y={HEIGHT - 10}
              textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}
              className="fill-muted font-mono text-[11px]"
            >
              {formatTick(data[index].timestamp, range)}
            </text>
          ))}
          {geometry.paths.map((path) => (
            <path key={`area-${path.key}`} d={path.area} fill={path.color} fillOpacity={0.1} />
          ))}
          {geometry.paths.map((path) => (
            <path
              key={`line-${path.key}`}
              d={path.line}
              fill="none"
              stroke={path.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {active !== null && (
            <>
              <line
                x1={geometry.x(active)}
                x2={geometry.x(active)}
                y1={PAD.top}
                y2={PAD.top + geometry.plotHeight}
                stroke={CROSSHAIR}
                strokeWidth={1}
              />
              {series.map((spec) => (
                <circle
                  key={spec.key}
                  cx={geometry.x(active)}
                  cy={geometry.y(data[active][spec.key])}
                  r={4}
                  fill={spec.color}
                  stroke={SURFACE}
                  strokeWidth={2}
                />
              ))}
            </>
          )}
        </svg>
      )}
      {geometry && point && (
        <div
          aria-hidden="true"
          style={{ left: tooltipLeft, width: TOOLTIP_WIDTH }}
          className="pointer-events-none absolute top-2 z-10 border-2 border-white/15 bg-ink px-3 py-2 text-sm"
        >
          <p className="mb-1.5 font-mono text-xs text-muted">{formatMoment(point.timestamp)}</p>
          {series.map((spec) => (
            <p key={spec.key} className="flex items-center gap-2">
              <span className="h-0.5 w-3 shrink-0" style={{ backgroundColor: spec.color }} />
              <strong className="font-bold tabular-nums">{formatNumber(point[spec.key])}</strong>
              <span className="truncate text-muted">{spec.label}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrendTable({ data, metric }: { data: TrendPoint[]; metric: TrendMetric }) {
  const series = TREND_SERIES[metric];
  return (
    <div className="max-h-80 overflow-auto border-2 border-white/15">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-ink">
          <tr className="border-b-2 border-white/15 font-mono text-xs tracking-wider text-muted uppercase">
            <th scope="col" className="px-4 py-2 font-normal">
              Time
            </th>
            {series.map((spec) => (
              <th key={spec.key} scope="col" className="px-4 py-2 text-right font-normal">
                {spec.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((point) => (
            <tr key={point.timestamp} className="border-b border-white/5">
              <td className="px-4 py-1.5 font-mono text-xs text-muted">{formatMoment(point.timestamp)}</td>
              {series.map((spec) => (
                <td key={spec.key} className="px-4 py-1.5 text-right tabular-nums">
                  {formatNumber(point[spec.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
