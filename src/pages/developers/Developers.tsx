import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ButtonLink } from "../../components/Button";
import { DISCORD_URL, DOCS_URL, GITHUB_URL } from "../../links";
import { useCopy } from "../../lib/useCopy";
import { CodeBlock, TokenLine, tokensFor } from "./CodeBlock";
import { guides, isCodeSample, type GuideId } from "./guides";
import type { SnippetName } from "./snippet-languages";
import { snippets } from "./snippets";

const REFLECTION_CALL = /\.(getMethod|getField|getConstructor|invoke|newInstance)\(|Class\.forName\(/g;

function countReflectionCalls(code: string): number {
  return code.match(REFLECTION_CALL)?.length ?? 0;
}

const highlight = "inline-block border-2 border-pumpkin bg-pumpkin px-[0.2em] text-black";
const sectionTitle = "text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.01em] text-balance";

const comparison = [
  {
    id: "spigot",
    tab: "Spigot",
    badge: "Spigot + Reflection NMS + Geyser API (Java)",
    file: "WelcomeListener.java",
    tone: "border-danger",
    badgeTone: "bg-danger",
    snippet: "javaReflection",
    facts: [`${countReflectionCalls(snippets.javaReflection)} reflection calls`, "Needs the Geyser API", "Breaks on version bumps"],
  },
  {
    id: "pumpkin",
    tab: "Pumpkin",
    badge: "Pumpkin Native API (Rust)",
    file: "lib.rs",
    tone: "border-success",
    badgeTone: "bg-success",
    snippet: "rustNative",
    facts: [`${countReflectionCalls(snippets.rustNative)} reflection calls`, "No extra dependencies", "Checked at compile time"],
  },
] as const;

type Side = (typeof comparison)[number]["id"];

const features = [
  {
    title: "Every player, one plugin",
    body: "Native Java + Bedrock support. Multi-version built in.",
    rest: "Write once, reach everyone.",
  },
  {
    title: "Typed commands and events",
    body: "Register commands and hook typed plugin events",
    rest: "without reflection, NMS, or version-specific hacks.",
  },
  {
    title: "Async by default",
    body: "Built on Tokio. No main thread bottleneck.",
    rest: "Heavy tasks don't freeze the server.",
  },
  {
    title: "Memory safe",
    body: "Rust guarantees.",
    rest: "No null pointers, no memory leaks, no data races.",
  },
];

function guideFromHash(): GuideId | null {
  const id = window.location.hash.replace(/^#guide-/, "");
  return guides.some((guide) => guide.id === id) ? (id as GuideId) : null;
}

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

const firstSteps: Record<GuideId, { snippet: SnippetName } | { note: ReactNode }> = {
  rust: { snippet: "rustTarget" },
  python: { snippet: "pythonInstall" },
  csharp: { snippet: "csharpInstall" },
  c: {
    note: (
      <>
        Start by downloading the{" "}
        <a href="https://github.com/WebAssembly/wasi-sdk/releases" className={inlineLink}>
          wasi-sdk
        </a>
        , then compile with its clang.
      </>
    ),
  },
  go: { snippet: "goInstall" },
  kotlin: { snippet: "kotlinClone" },
  d: {
    note: (
      <>
        Install{" "}
        <a href="https://github.com/ldc-developers/ldc" className={inlineLink}>
          LDC
        </a>{" "}
        1.43 or later with the addon-wasi package, plus{" "}
        <a href="https://dub.pm/" className={inlineLink}>
          DUB
        </a>
        .
      </>
    ),
  },
  zig: { snippet: "zigFetch" },
  typescript: {
    note: (
      <>
        No written guide yet. The API lives in{" "}
        <a href="https://github.com/Pumpkin-MC/pumpkin-api-ts" className={inlineLink}>
          pumpkin-api-ts
        </a>
        .
      </>
    ),
  },
};

function StartPicker() {
  const [active, setActive] = useState<GuideId>("rust");
  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [markerTop, setMarkerTop] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const guide = guides.find((item) => item.id === active) ?? guides[0];
  const first = firstSteps[active];
  const snippet = "snippet" in first ? first.snippet : null;
  const command = snippet ? snippets[snippet].split("\n")[0] : "";
  const [copied, copy] = useCopy(command);

  useEffect(() => {
    setMounted(true);
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    function measure() {
      const button = listRef.current?.querySelector<HTMLElement>(`[data-guide="${active}"]`);
      if (button && !cancelled) setMarkerTop(button.offsetTop + button.offsetHeight / 2);
    }
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [active]);

  function advance() {
    setActive((current) => guides[(guides.findIndex((item) => item.id === current) + 1) % guides.length].id);
  }

  function choose(id: GuideId) {
    setPinned(true);
    setActive(id);
  }

  return (
    <div ref={rootRef} className="group/start min-w-0">
      <p className="mb-4 font-mono text-sm text-muted">Pick your language</p>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Plugin language"
        className="relative flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-0"
      >
        {markerTop !== null && (
          <span
            aria-hidden="true"
            style={{ top: markerTop }}
            className="absolute left-0 hidden size-3 -translate-y-1/2 bg-pumpkin transition-[top] duration-500 ease-out motion-reduce:transition-none lg:block"
          />
        )}
        {guides.map((item) => {
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              data-guide={item.id}
              id={`start-tab-${item.id}`}
              aria-selected={selected}
              aria-controls="start-command"
              onClick={() => choose(item.id)}
              className={`cursor-pointer border-b-3 text-left text-[clamp(1.6rem,2.8vw,2.5rem)] leading-[1.15] font-extrabold tracking-[-0.01em] transition-colors duration-500 motion-reduce:transition-none lg:border-b-0 lg:pl-6 ${
                selected ? "border-pumpkin text-fg" : "border-transparent text-white/25 hover:text-white/60"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id="start-command"
        aria-labelledby={`start-tab-${active}`}
        className="relative mt-6 flex min-h-14 items-center gap-4 overflow-hidden border-l-3 border-pumpkin bg-ink px-4 py-3"
      >
        {snippet ? (
          <>
            <code key={active} className="min-w-0 flex-1 overflow-x-auto font-mono text-[0.95rem] whitespace-pre">
              <span aria-hidden="true" className="text-muted select-none">
                ${" "}
              </span>
              <span
                style={{ "--chars": command.length } as CSSProperties}
                className="inline-block animate-type overflow-hidden align-bottom motion-reduce:animate-none"
              >
                <TokenLine tokens={tokensFor(snippet)[0]} />
              </span>
              <span
                aria-hidden="true"
                className="ml-1 inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] animate-blink bg-pumpkin/80 motion-reduce:animate-none"
              />
            </code>
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Copied command" : "Copy command"}
              className="shrink-0 cursor-pointer text-xs font-bold tracking-wider text-pumpkin uppercase hover:text-fg"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </>
        ) : (
          <p key={active} className="animate-fade-up text-muted motion-reduce:animate-none">
            {"note" in first ? first.note : null}
          </p>
        )}
        {mounted && !pinned && (
          <span
            key={`progress-${active}`}
            aria-hidden="true"
            onAnimationEnd={advance}
            className={`absolute inset-x-0 bottom-0 h-0.5 origin-left animate-progress bg-pumpkin group-focus-within/start:[animation-play-state:paused] group-hover/start:[animation-play-state:paused] motion-reduce:hidden ${
              visible ? "" : "[animation-play-state:paused]"
            }`}
          />
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        {guide.steps.length > 0
          ? `First step of ${guide.steps.length} in the ${guide.label} guide.`
          : `${guide.label} has no written guide yet.`}{" "}
        <a href={`#guide-${guide.id}`} className={inlineLink}>
          Open the guide
        </a>
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section className="border-b-3 border-pumpkin">
      <div className="mx-auto grid max-w-325 gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="mb-5 font-mono text-sm text-muted">
            <s className="decoration-danger decoration-2">No NMS. No reflection. No version-specific hacks.</s>
          </p>
          <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em] text-balance">
            Build plugins without the pain<span className="text-pumpkin">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
            Just clean, type-safe APIs. Write in the language you already use, and Pumpkin loads the result as a
            WebAssembly plugin.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <a href={`${DOCS_URL}/plugin-dev/introduction`} className={inlineLink}>
              Plugin docs
            </a>
            <a href={GITHUB_URL} className={inlineLink}>
              Source on GitHub
            </a>
          </div>
        </div>
        <StartPicker />
      </div>
    </section>
  );
}

function Comparison() {
  const [side, setSide] = useState<Side>("spigot");

  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto mb-8 max-w-325 px-5 md:px-8">
        <h2 className={`${sectionTitle} max-w-3xl`}>
          Same feature, <span className={highlight}>two APIs</span>
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          Send a welcome message, then ask for confirmation with a Java dialog or a Bedrock form. On Spigot that means
          reflection into NMS and a second plugin. On Pumpkin it's one branch.
        </p>
      </div>

      <div className="mx-auto max-w-400 px-5 md:px-8">
        <div role="tablist" aria-label="Choose an API" className="mb-4 grid grid-cols-2 border-3 border-fg lg:hidden">
          {comparison.map((panel) => (
            <button
              key={panel.id}
              type="button"
              role="tab"
              id={`compare-tab-${panel.id}`}
              aria-selected={side === panel.id}
              aria-controls={`compare-${panel.id}`}
              onClick={() => setSide(panel.id)}
              className={`cursor-pointer py-2.5 font-bold ${side === panel.id ? "bg-fg text-black" : "text-muted"}`}
            >
              {panel.tab}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {comparison.map((panel) => (
            <article
              key={panel.id}
              id={`compare-${panel.id}`}
              role="tabpanel"
              aria-labelledby={`compare-tab-${panel.id}`}
              className={`${side === panel.id ? "flex" : "hidden"} min-w-0 flex-col border-3 bg-surface lg:flex ${panel.tone}`}
            >
              <header className="flex flex-col gap-3 border-b-2 border-white/15 p-4">
                <span
                  className={`self-start px-2.5 py-1 text-xs font-extrabold tracking-wider text-black uppercase ${panel.badgeTone}`}
                >
                  {panel.badge}
                </span>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  {panel.facts.map((fact) => (
                    <li
                      key={fact}
                      className="before:mr-2 before:inline-block before:size-1.5 before:bg-current before:align-middle"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>
              </header>
              <CodeBlock
                snippet={panel.snippet}
                label={panel.file}
                tone={panel.id === "spigot" ? "danger" : "success"}
                lineNumbers
                className="flex-1 border-0"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="border-t-3 border-pumpkin bg-surface">
      <div className="mx-auto max-w-325 px-5 py-14 md:px-8 md:py-20">
        <h2 className={`${sectionTitle} mb-10`}>What the API gives you</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="border-3 border-pumpkin bg-ink p-6 brutal-4">
              <h3 className="mb-3 font-extrabold text-pumpkin text-xl/tight">{feature.title}</h3>
              <p>
                {feature.body} <span className="text-muted">{feature.rest}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickStart() {
  const [active, setActive] = useState<GuideId>("rust");

  useEffect(() => {
    function syncFromHash() {
      const id = guideFromHash();
      if (!id) return;
      setActive(id);
      document.getElementById("quick-start")?.scrollIntoView();
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function choose(id: GuideId) {
    setActive(id);
    window.history.replaceState(null, "", `#guide-${id}`);
  }

  return (
    <section id="quick-start" className="border-t-3 border-pumpkin">
      <div className="mx-auto max-w-325 px-5 py-14 md:px-8 md:py-20">
        <div className="mb-10 max-w-3xl">
          <h2 className={sectionTitle}>
            Quick <span className={highlight}>start</span>
          </h2>
          <p className="mt-4 text-lg text-muted">
            Pick a language. Each guide goes from an empty folder to a plugin file Pumpkin can load.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
          <div
            role="tablist"
            aria-label="Plugin language"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:sticky lg:top-28 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0"
          >
            {guides.map((guide) => (
              <button
                key={guide.id}
                type="button"
                role="tab"
                id={`tab-${guide.id}`}
                aria-selected={active === guide.id}
                aria-controls={`panel-${guide.id}`}
                onClick={() => choose(guide.id)}
                className={`shrink-0 cursor-pointer border-2 px-4 py-2.5 text-left font-bold transition-colors ${
                  active === guide.id
                    ? "border-pumpkin bg-pumpkin text-black"
                    : "border-white/20 text-muted hover:border-fg hover:text-fg"
                }`}
              >
                {guide.label}
              </button>
            ))}
          </div>

          {guides.map((guide) => (
            <div
              key={guide.id}
              role="tabpanel"
              id={`panel-${guide.id}`}
              aria-labelledby={`tab-${guide.id}`}
              hidden={active !== guide.id}
              className="min-w-0"
            >
              {guide.intro && <div className="mb-6 max-w-2xl text-lg text-muted">{guide.intro}</div>}
              <ol className="grid gap-10">
                {guide.steps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 md:gap-x-6">
                    <span className="grid size-9 place-items-center border-3 border-pumpkin font-extrabold text-pumpkin tabular-nums">
                      {index + 1}
                    </span>
                    <div className="grid min-w-0 gap-4 text-muted">
                      <h3 className="pt-1 font-extrabold text-fg text-xl/tight">{step.title}</h3>
                      {step.content.map((item, itemIndex) =>
                        isCodeSample(item) ? <CodeBlock key={`code-${itemIndex}`} {...item} /> : item,
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-10 border-t border-white/15 pt-5 text-muted">
                The full walkthrough is in{" "}
                <a href={guide.docsHref} className="font-semibold text-pumpkin underline underline-offset-3 hover:text-fg">
                  {guide.docsLabel}
                </a>
                .
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReadyToBuild() {
  return (
    <section className="mx-auto max-w-225 px-5 pb-16 md:px-8 md:pb-24">
      <div className="border-3 border-pumpkin bg-surface px-6 py-10 text-center brutal-4 md:px-12 md:py-14 md:brutal-6">
        <h2 className="mb-3 text-[2rem] leading-[1.05] font-extrabold text-pumpkin md:text-[2.5rem]">Ready to build?</h2>
        <p className="mx-auto mb-8 max-w-xl text-lg text-muted">
          The docs cover events, commands and the rest of the API. Discord is where to ask when they don't.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLink href={`${DOCS_URL}/plugin-dev/introduction`} className="w-full md:w-auto">
            Get started
          </ButtonLink>
          <ButtonLink href={DISCORD_URL} variant="ghost" className="w-full md:w-auto">
            Ask on Discord
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default function Developers() {
  return (
    <>
      <Hero />
      <Comparison />
      <Features />
      <QuickStart />
      <ReadyToBuild />
    </>
  );
}
