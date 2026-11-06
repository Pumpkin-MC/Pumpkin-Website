import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ButtonLink } from "../../components/Button";
import { DISCORD_URL, DOCS_URL, GITHUB_URL } from "../../links";
import { useCopy } from "../../lib/useCopy";
import { CodeBlock, TokenLine, tokensFor } from "./CodeBlock";
import { createGuides, guideIds, isCodeSample, type GuideId } from "./guides";
import { useI18n, type Messages } from "../../i18n";
import { rich } from "../../i18n/rich";
import { formatMessage } from "../../i18n/format";
import type { SnippetName } from "./snippet-languages";
import { snippets } from "./snippets";

const REFLECTION_CALL = /\.(getMethod|getField|getConstructor|invoke|newInstance)\(|Class\.forName\(/g;

function countReflectionCalls(code: string): number {
  return code.match(REFLECTION_CALL)?.length ?? 0;
}

const highlight = "inline-block border-2 border-pumpkin bg-pumpkin px-[0.2em] text-black";
const sectionTitle = "text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.01em] text-balance";

function getComparison(t: Messages["developersPage"]) {
  return [
    {
      id: "spigot",
      tab: "Spigot",
      badge: t.comparison.spigot.badge,
      file: "WelcomeListener.java",
      tone: "border-danger",
      badgeTone: "bg-danger",
      snippet: "javaReflection",
      facts: [formatMessage(t.comparison.reflectionCalls, { count: countReflectionCalls(snippets.javaReflection) }), ...t.comparison.spigot.facts],
    },
    {
      id: "pumpkin",
      tab: "Pumpkin",
      badge: t.comparison.pumpkin.badge,
      file: "lib.rs",
      tone: "border-success",
      badgeTone: "bg-success",
      snippet: "rustNative",
      facts: [formatMessage(t.comparison.reflectionCalls, { count: countReflectionCalls(snippets.rustNative) }), ...t.comparison.pumpkin.facts],
    },
  ] as const;
}

type Side = "spigot" | "pumpkin";

function guideFromHash(): GuideId | null {
  const id = window.location.hash.replace(/^#guide-/, "");
  return guideIds.includes(id as GuideId) ? (id as GuideId) : null;
}

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

function getFirstSteps(t: Messages["developersPage"]): Record<GuideId, { snippet: SnippetName } | { note: ReactNode }> {
  return {
    rust: { snippet: "rustTarget" },
    python: { snippet: "pythonInstall" },
    csharp: { snippet: "csharpInstall" },
    c: { note: rich(t.firstSteps.c, { sdk: (children) => <a href="https://github.com/WebAssembly/wasi-sdk/releases" className={inlineLink}>{children}</a> }) },
    go: { snippet: "goInstall" },
    kotlin: { snippet: "kotlinClone" },
    d: { note: rich(t.firstSteps.d, {
      ldc: (children) => <a href="https://github.com/ldc-developers/ldc" className={inlineLink}>{children}</a>,
      dub: (children) => <a href="https://dub.pm/" className={inlineLink}>{children}</a>,
    }) },
    zig: { snippet: "zigFetch" },
    typescript: { note: rich(t.firstSteps.typescript, { api: (children) => <a href="https://github.com/Pumpkin-MC/pumpkin-api-ts" className={inlineLink}>{children}</a> }) },
  };
}

function StartPicker() {
  const { t: messages } = useI18n();
  const t = messages.developersPage;
  const guides = createGuides(t);
  const firstSteps = getFirstSteps(t);
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
      <p className="mb-4 font-mono text-sm text-muted">{t.picker.title}</p>
      <div
        ref={listRef}
        role="tablist"
        aria-label={t.picker.languageLabel}
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
              aria-label={copied ? t.code.commandCopied : t.code.copyCommand}
              className="shrink-0 cursor-pointer text-xs font-bold tracking-wider text-pumpkin uppercase hover:text-fg"
            >
              {copied ? t.code.copied : t.code.copy}
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
          ? formatMessage(t.picker.firstStep, { count: guide.steps.length, language: guide.label })
          : formatMessage(t.picker.noGuide, { language: guide.label })}{" "}
        <a href={`#guide-${guide.id}`} className={inlineLink}>
          {t.picker.openGuide}
        </a>
      </p>
    </div>
  );
}

function Hero() {
  const { t: messages } = useI18n();
  const t = messages.developersPage;
  return (
    <section className="border-b-3 border-pumpkin">
      <div className="mx-auto grid max-w-325 gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="mb-5 font-mono text-sm text-muted">
            <s className="decoration-danger decoration-2">{t.hero.overline}</s>
          </p>
          <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em] text-balance">
            {t.hero.title}<span className="text-pumpkin">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
            {t.hero.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <a href={`${DOCS_URL}/plugin-dev/introduction`} className={inlineLink}>
              {t.hero.docs}
            </a>
            <a href={GITHUB_URL} className={inlineLink}>
              {t.hero.source}
            </a>
          </div>
        </div>
        <StartPicker />
      </div>
    </section>
  );
}

function Comparison() {
  const { t: messages } = useI18n();
  const t = messages.developersPage;
  const [side, setSide] = useState<Side>("spigot");
  const comparison = getComparison(t);

  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto mb-8 max-w-325 px-5 md:px-8">
        <h2 className={`${sectionTitle} max-w-3xl`}>
          {rich(t.comparison.title, { hl: (children) => <span className={highlight}>{children}</span> })}
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          {t.comparison.description}
        </p>
      </div>

      <div className="mx-auto max-w-400 px-5 md:px-8">
        <div role="tablist" aria-label={t.comparison.chooseApi} className="mb-4 grid grid-cols-2 border-3 border-fg lg:hidden">
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
  const { t: messages } = useI18n();
  const t = messages.developersPage;
  return (
    <section className="border-t-3 border-pumpkin bg-surface">
      <div className="mx-auto max-w-325 px-5 py-14 md:px-8 md:py-20">
        <h2 className={`${sectionTitle} mb-10`}>{t.featuresTitle}</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {t.features.map((feature) => (
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
  const { t: messages } = useI18n();
  const t = messages.developersPage;
  const guides = createGuides(t);
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
            {rich(t.quickStart.title, { hl: (children) => <span className={highlight}>{children}</span> })}
          </h2>
          <p className="mt-4 text-lg text-muted">
            {t.quickStart.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
          <div
            role="tablist"
            aria-label={t.picker.languageLabel}
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
                {rich(formatMessage(t.quickStart.walkthrough, { documentation: guide.docsLabel }), { docs: (children) => (
                  <a href={guide.docsHref} className="font-semibold text-pumpkin underline underline-offset-3 hover:text-fg">{children}</a>
                ) })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReadyToBuild() {
  const { t: messages } = useI18n();
  const t = messages.developersPage;
  return (
    <section className="mx-auto max-w-225 px-5 pb-16 md:px-8 md:pb-24">
      <div className="border-3 border-pumpkin bg-surface px-6 py-10 text-center brutal-4 md:px-12 md:py-14 md:brutal-6">
        <h2 className="mb-3 text-[2rem] leading-[1.05] font-extrabold text-pumpkin md:text-[2.5rem]">{t.ready.title}</h2>
        <p className="mx-auto mb-8 max-w-xl text-lg text-muted">
          {t.ready.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLink href={`${DOCS_URL}/plugin-dev/introduction`} className="w-full md:w-auto">
            {t.ready.getStarted}
          </ButtonLink>
          <ButtonLink href={DISCORD_URL} variant="ghost" className="w-full md:w-auto">
            {t.ready.discord}
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
