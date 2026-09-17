import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GITHUB_URL } from "../../links";
import { ChevronDownIcon, ExternalIcon } from "../../components/icons";
import { withBase } from "../../lib/url";
import {
  BoltIcon,
  BugIcon,
  ClipboardCheckIcon,
  CubeIcon,
  DragonIcon,
  EarthIcon,
  FileCodeIcon,
  LayerGroupIcon,
  PullRequestIcon,
  SearchIcon,
  ShieldIcon,
  TerminalIcon,
  WandIcon,
} from "./icons";
import { trackerData } from "./trackerData";
import { STATUS, STATUS_ORDER, counts, entryKey, pct, type Category, type Entry, type Filter, type Issue, type Status } from "./types";

const WEBSITE_DATA_URL = "https://github.com/Pumpkin-MC/Pumpkin-Website/blob/master/src/pages/tracker/data.json";
const COUNT_UP_MS = 1200;

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";
const highlight = "inline-block border-2 border-pumpkin bg-pumpkin px-[0.2em] text-black";
const chip = "inline-flex cursor-pointer items-center gap-2 border-2 border-fg px-3.5 py-1.5 text-[0.95rem] font-bold transition-colors";

const CATEGORY_ICONS: Record<string, (props: { className?: string }) => ReactNode> = {
  all: LayerGroupIcon,
  entities: DragonIcon,
  blocks: CubeIcon,
  items: WandIcon,
  commands: TerminalIcon,
  redstone: BoltIcon,
  combat: ShieldIcon,
  world: EarthIcon,
};

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const Component = CATEGORY_ICONS[id] ?? LayerGroupIcon;
  return <Component className={className} />;
}

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") ? (
      <code key={index} className="border border-white/15 bg-ink px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

function Mark({ status, small = false }: { status: Status; small?: boolean }) {
  const { glyph, label, bg } = STATUS[status];
  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center leading-none font-extrabold text-black ${bg} ${
        small ? "size-4 text-[0.65rem]" : "size-6 text-[0.9rem]"
      }`}
    >
      {glyph}
    </span>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-5 text-[0.85rem] text-muted md:ml-auto">
      {STATUS_ORDER.map((status) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <Mark status={status} />
          {STATUS[status].label}
        </span>
      ))}
    </div>
  );
}

function useCountUp(target: number): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / COUNT_UP_MS, 1);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

interface StatProps {
  status: Status;
  count: number;
  total: number;
  className: string;
}

function Stat({ status, count, total, className }: StatProps) {
  const { label, text, bg } = STATUS[status];
  const value = useCountUp(count);
  return (
    <div className={`tabular-nums ${className}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-[0.85rem] font-extrabold tracking-[0.06em] uppercase md:gap-3 md:text-[1rem]">
        <Mark status={status} />
        {label}
        <span className={`inline-flex items-center border-2 border-transparent px-1.5 py-px text-[0.6rem] tracking-[0.08em] text-black md:px-2 md:text-[0.7rem] ${bg}`}>
          {value}
        </span>
      </div>
      <div
        className={`text-[clamp(2.4rem,12vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] whitespace-nowrap md:text-[clamp(3.2rem,7vw,6.5rem)] md:tracking-[-0.03em] ${text}`}
      >
        {pct(value, total)}
        <small className="ml-[0.08em] text-[0.45em] font-extrabold tracking-normal md:text-[0.4em]">%</small>
      </div>
    </div>
  );
}

function Bar({ entries, className }: { entries: Entry[]; className: string }) {
  const c = counts(entries);
  const total = entries.length;
  return (
    <div
      className={`flex overflow-hidden outline outline-black/30 ${className}`}
      role="img"
      aria-label="Share of implemented, partial and planned entries"
    >
      {STATUS_ORDER.map((status) => (
        <div key={status} className={`${STATUS[status].bg} transition-[width] duration-500`} style={{ width: `${pct(c[status], total)}%` }} />
      ))}
    </div>
  );
}

interface RowProps {
  entry: Entry;
  open: boolean;
  onToggle: () => void;
}

const term = "text-[0.7rem] font-extrabold tracking-[0.08em] text-muted uppercase sm:pt-0.5";

function IssueLink({ issue }: { issue: Issue }) {
  const open = issue.state === "open";
  const Icon = issue.pr ? PullRequestIcon : BugIcon;
  return (
    <a
      href={`${GITHUB_URL}/${issue.pr ? "pull" : "issues"}/${issue.number}`}
      target="_blank"
      rel="noopener"
      className={`group inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${open ? "text-fg" : "text-muted"}`}
    >
      <Icon className={`size-3.5 shrink-0 ${open ? "text-pumpkin" : ""}`} />
      <span className={`font-bold ${open ? "text-pumpkin" : ""}`}>#{issue.number}</span>
      {issue.title && <span className="group-hover:underline group-hover:underline-offset-3">{issue.title}</span>}
      {issue.state && (
        <span
          className={`inline-flex border px-1.5 text-[0.6rem] font-extrabold tracking-[0.08em] uppercase ${open ? "border-pumpkin text-pumpkin" : "border-muted"}`}
        >
          {issue.state}
        </span>
      )}
    </a>
  );
}

function Row({ entry, open, onToggle }: RowProps) {
  const status = STATUS[entry.status];
  const items = entry.items ?? [];
  const issues = entry.issues ?? [];
  const ids = entry.ids ?? [];
  const source = entry.source?.split("/").slice(-2).join("/");
  return (
    <div id={`row-${entry.cat}-${entry.id}`} className="scroll-mt-32">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors ${open ? "bg-surface" : "hover:bg-surface"}`}
      >
        <Mark status={entry.status} />
        <span className="min-w-0 flex-1 font-bold">{entry.name}</span>
        <span className={`hidden text-[0.7rem] font-extrabold tracking-[0.08em] uppercase sm:inline ${status.text}`}>{status.label}</span>
        <ChevronDownIcon className={`size-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid gap-4 border-t border-white/12 bg-surface px-4 pt-3.5 pb-4 md:pl-13">
          {entry.note && <p className="text-[0.9rem] leading-snug text-muted">{inline(entry.note)}</p>}
          {items.length > 0 && (
            <ul className="grid gap-x-6 gap-y-2 text-[0.9rem] sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.text} className={`flex items-start gap-2.5 ${item.done ? "" : "text-muted"}`}>
                  <span className="mt-0.5">
                    <Mark status={item.done ? "done" : "planned"} small />
                  </span>
                  <span>{inline(item.text)}</span>
                </li>
              ))}
            </ul>
          )}
          {(source || issues.length > 0 || ids.length > 0) && (
            <dl className="grid gap-x-8 gap-y-1.5 text-[0.85rem] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-y-2.5">
              {source && (
                <>
                  <dt className={term}>Source</dt>
                  <dd>
                    <a href={`${GITHUB_URL}/blob/master/${entry.source}`} target="_blank" rel="noopener" className={`${inlineLink} inline-flex items-center gap-1.5`}>
                      <FileCodeIcon className="size-3.5" />
                      {source}
                      <ExternalIcon className="size-3 opacity-70" />
                    </a>
                  </dd>
                </>
              )}
              {issues.length > 0 && (
                <>
                  <dt className={term}>{issues.some((issue) => issue.pr) ? "Issues and PRs" : "Issues"}</dt>
                  <dd className="grid gap-1.5">
                    {issues.map((issue) => (
                      <IssueLink key={issue.number} issue={issue} />
                    ))}
                  </dd>
                </>
              )}
              {ids.length > 0 && (
                <>
                  <dt className={term}>Registered</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {ids.map((id) => (
                      <code key={id} className="border border-white/15 bg-ink px-1.5 py-0.5 font-mono text-[0.8rem] text-fg">
                        {id}
                      </code>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

function readHash(): { category: string; entry: string | null } {
  const [category, entry] = window.location.hash.replace(/^#/, "").split("/");
  return { category: category || "all", entry: entry || null };
}

const VIEWS: Category[] = [trackerData.all, ...trackerData.categories];

export default function Tracker() {
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const hashApplied = useRef(false);

  const current = VIEWS.find((view) => view.id === category) ?? trackerData.all;

  useEffect(() => {
    function apply() {
      const { category: id, entry } = readHash();
      if (VIEWS.some((view) => view.id === id)) setCategory(id);
      if (entry) {
        setOpen((previous) => new Set(previous).add(`${id}:${entry}`));
        setScrollTarget(`row-${id}-${entry}`);
      }
    }
    apply();
    hashApplied.current = true;
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    if (!scrollTarget) return;
    const target = document.getElementById(scrollTarget);
    if (!target) return;
    target.scrollIntoView({ block: "center" });
    setScrollTarget(null);
  }, [scrollTarget, category, open]);

  useEffect(() => {
    if (!hashApplied.current) return;
    const openInCategory = category === "all" ? null : [...open].find((key) => key.startsWith(`${category}:`));
    const hash = openInCategory ? `#${category}/${openInCategory.split(":")[1]}` : `#${category}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
  }, [category, open]);

  const visible = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return current.entries.filter((entry) => {
      if (filter !== "all" && entry.status !== filter) return false;
      if (!tokens.length) return true;
      const haystack = [
        entry.name,
        entry.group ?? "",
        entry.note ?? "",
        ...(entry.items ?? []).map((item) => item.text),
        ...(entry.issues ?? []).map((issue) => `#${issue.number} ${issue.title ?? ""}`),
        ...(entry.ids ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [current, filter, query]);

  const anyVisibleOpen = visible.some((entry) => open.has(entryKey(entry)));

  function toggle(key: string) {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setOpen((previous) => {
      const next = new Set(previous);
      for (const entry of visible) {
        if (anyVisibleOpen) next.delete(entryKey(entry));
        else next.add(entryKey(entry));
      }
      return next;
    });
  }

  const overall = counts(trackerData.all.entries);
  const total = current.entries.length;
  const unit = current.unit ?? "entries";

  const groups: { key: string; label: string; entries: Entry[] }[] = [];
  for (const entry of visible) {
    const key = `${entry.cat}:${entry.group ?? ""}`;
    const last = groups.at(-1);
    if (last?.key === key) {
      last.entries.push(entry);
    } else {
      const label = current.id === "all" ? `${entry.catLabel} · ${entry.group ?? "Other"}` : (entry.group ?? "Other");
      groups.push({ key, label, entries: [entry] });
    }
  }

  return (
    <>
      <section className="relative overflow-hidden border-b-3 border-pumpkin">
        <div className="mx-auto grid max-w-325 grid-cols-1 px-5 pt-10 md:px-8 md:pt-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:gap-8 xl:pb-16">
          <div className="min-w-0">
            <h1 className="max-w-[16ch] text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.02] font-extrabold tracking-[-0.01em] text-balance">
              Vanilla <span className={highlight}>parity</span>
            </h1>
            <p className="mt-6 max-w-120 text-[1.15rem] text-muted">
              What Pumpkin already does like vanilla, what is half way there, and what is still on the list.
            </p>

            <div className="mt-8 md:mt-10">
              <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-white/15 pb-2.5 text-sm text-muted md:text-[0.9rem]">
                <span className="font-extrabold tracking-[0.08em] text-fg uppercase">Overall progress</span>
                <span>
                  {trackerData.all.entries.length} entries read from Pumpkin {trackerData.commit} for Minecraft {trackerData.version},{" "}
                  {trackerData.updated}
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-3 sm:gap-0">
                {STATUS_ORDER.map((status, index) => (
                  <Stat
                    key={status}
                    status={status}
                    count={overall[status]}
                    total={trackerData.all.entries.length}
                    className={index === 0 ? "sm:pr-6 md:pr-10" : "sm:border-l-3 sm:border-pumpkin sm:pl-6 md:pl-10"}
                  />
                ))}
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="relative mt-4 h-44 xl:mt-0 xl:h-auto">
            <img
              src={withBase("/assets/pumpkin-clipboard.webp")}
              alt=""
              className="pointer-events-none absolute right-[-3%] bottom-[-10%] h-[120%] w-auto max-w-none -rotate-6 select-none xl:inset-x-0 xl:bottom-[-8%] xl:h-auto xl:w-full"
            />
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-325 px-5 py-14 md:px-8 md:py-20">
          <div className="mb-8 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.01em]">
              Piece by <span className={highlight}>piece</span>
            </h2>
            <p className="text-muted">Pick a category, then narrow it down by status or search.</p>
            <Legend />
          </div>

          <div role="radiogroup" aria-label="Category" className="grid grid-cols-2 gap-0.5 border-3 border-pumpkin bg-pumpkin md:grid-cols-4">
            {VIEWS.map((view) => {
              const vc = counts(view.entries);
              const active = view.id === current.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCategory(view.id)}
                  className={`cursor-pointer px-4 py-3.5 text-left transition-colors ${active ? "bg-fg text-black" : "bg-ink hover:bg-surface"}`}
                >
                  <span className="flex items-center justify-between gap-2 text-[0.8rem] font-extrabold tracking-[0.06em] uppercase">
                    <span className="inline-flex items-center gap-1.5">
                      <CategoryIcon id={view.id} className="size-4 text-pumpkin" />
                      {view.label}
                    </span>
                    <span className="tabular-nums">{pct(vc.done, view.entries.length)}%</span>
                  </span>
                  <Bar entries={view.entries} className={`mt-2.5 h-1.5 ${active ? "bg-black/10" : "bg-white/10"}`} />
                  <span className={`mt-1.5 block text-[0.8rem] ${active ? "text-black/60" : "text-muted"}`}>
                    {view.entries.length} {view.unit ?? "entries"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-2">
              {[{ id: "all" as Filter, label: "Any" }, ...STATUS_ORDER.map((status) => ({ id: status as Filter, label: STATUS[status].label }))].map(
                (option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={filter === option.id}
                    onClick={() => setFilter(option.id)}
                    className={`${chip} ${filter === option.id ? "bg-fg text-black" : "hover:bg-fg hover:text-black"}`}
                  >
                    {option.label}
                  </button>
                ),
              )}
            </div>
            <label className="relative min-w-60 flex-1 md:ml-auto md:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search entries, goals, keywords..."
                aria-label="Search entries"
                className="w-full border-2 border-fg bg-ink py-1.5 pr-3.5 pl-9.5 text-[0.95rem] font-bold text-fg placeholder:font-normal placeholder:text-muted focus:border-pumpkin focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[0.85rem] text-muted">
            <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
              Showing {visible.length} of {total} {unit}
              {current.tracking && (
                <a href={`${GITHUB_URL}/issues/${current.tracking}`} target="_blank" rel="noopener" className={`${inlineLink} inline-flex items-center gap-1.5`}>
                  <ClipboardCheckIcon className="size-3.5" />
                  Tracking issue #{current.tracking}
                </a>
              )}
            </span>
            {visible.length > 0 && (
              <button type="button" onClick={toggleAll} className={`${inlineLink} cursor-pointer`}>
                {anyVisibleOpen ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>

          {visible.length === 0 && (
            <p className="mt-4 border-3 border-dashed border-muted px-5 py-10 text-center text-muted">Nothing matches these filters.</p>
          )}

          <div className="mt-4 grid gap-6">
            {groups.map((group) => (
              <section key={group.key} className="border-3 border-pumpkin bg-ink">
                <h3 className="flex items-center justify-between gap-3 bg-pumpkin px-4 py-2.5 text-[0.85rem] font-extrabold tracking-[0.06em] text-black uppercase">
                  {group.label}
                  <span className="tabular-nums">{group.entries.length}</span>
                </h3>
                <div className="divide-y-2 divide-pumpkin">
                  {group.entries.map((entry) => (
                    <Row key={entryKey(entry)} entry={entry} open={open.has(entryKey(entry))} onToggle={() => toggle(entryKey(entry))} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 items-start gap-4 border-3 border-fg bg-ink px-5 py-6 brutal-4 brutal-color-fg md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-8 md:px-8 md:py-7 md:brutal-6">
            <span className="inline-block -rotate-2 justify-self-start border-3 border-success bg-success px-3 py-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] text-black uppercase">
              From the source
            </span>
            <p className="text-[1.1rem] leading-normal">
              <strong className="font-extrabold">Read from the Pumpkin source, not from a wish list.</strong> Entities, redstone, combat
              and world are audited by hand against the maintainers' tracking issues: implemented means the goals and mechanics vanilla
              registers are there, partial means the type exists with pieces missing, planned means nothing maps to it yet. Blocks, items
              and commands are read straight from the server source tree, so implemented means Pumpkin has code handling it and a TODO in
              that code drops it to partial; the behaviour itself is not compared line by line. Spotted a mistake or shipped something new?
              Edit{" "}
              <a href={WEBSITE_DATA_URL} target="_blank" rel="noopener" className={inlineLink}>
                data.json
              </a>{" "}
              and open a pull request.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
