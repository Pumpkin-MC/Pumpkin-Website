import { useState, type ReactNode } from "react";
import { formatNumber, formatPercent } from "./types";

export interface DistributionItem {
  key: string;
  label: ReactNode;
  value: number;
  share: number;
  detail?: ReactNode;
}

interface DistributionListProps {
  items: DistributionItem[];
  limit?: number;
  empty: string;
  idPrefix?: string;
  highlight?: string | null;
}

export function DistributionList({ items, limit, empty, idPrefix, highlight }: DistributionListProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return <p className="py-2 text-sm text-muted">{empty}</p>;

  const hasMore = limit !== undefined && items.length > limit;
  const highlightIndex = highlight ? items.findIndex((item) => item.key === highlight) : -1;
  const showAll = expanded || (limit !== undefined && highlightIndex >= limit);
  const visible = hasMore && !showAll ? items.slice(0, limit) : items;

  return (
    <div>
      <ul className="grid gap-3.5">
        {visible.map((item) => (
          <li
            key={item.key}
            id={idPrefix ? `${idPrefix}-${item.key}` : undefined}
            className={`scroll-mt-32 transition-colors ${
              highlight === item.key ? "bg-pumpkin/10 outline-2 outline-offset-4 outline-pumpkin" : ""
            }`}
          >
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="min-w-0 wrap-break-word">{item.label}</span>
              <span className="shrink-0 text-right font-mono text-xs text-muted tabular-nums">
                {item.detail ?? (
                  <>
                    <span className="text-fg">{formatNumber(item.value)}</span> · {formatPercent(item.share)}
                  </>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-white/10">
              <div
                className="h-full rounded-r bg-pumpkin"
                style={{ width: `${Math.min(100, Math.max(item.share, item.value > 0 ? 1 : 0))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {hasMore && !(highlightIndex >= (limit ?? 0) && !expanded) && (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 cursor-pointer text-sm font-bold text-pumpkin hover:text-fg"
        >
          {showAll ? "Show less" : `Show ${items.length - (limit ?? 0)} more`}
        </button>
      )}
    </div>
  );
}
