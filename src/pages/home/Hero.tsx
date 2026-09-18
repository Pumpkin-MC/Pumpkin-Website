import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n";
import { rich } from "../../i18n/rich";
import { DOCS_URL } from "../../links";
import { ButtonLink } from "../../components/Button";
import { DownloadIcon } from "../../components/icons";
import { withBase } from "../../lib/url";

const PUMPKIN_STARTUP_SECONDS = 0.005;
const VANILLA_STARTUP_SECONDS = 15;

type Tone = "loading" | "fast" | "slow";

const timeTone: Record<Tone, string> = {
  loading: "text-fg",
  fast: "text-success",
  slow: "text-danger",
};

const chipTone: Record<Tone, string> = {
  loading: "border-muted text-muted",
  fast: "border-success bg-success text-black",
  slow: "border-danger bg-danger text-black",
};

interface ClockProps {
  name: string;
  seconds: number;
  tone: Tone;
  label: string;
  className: string;
}

function Clock({ name, seconds, tone, label, className }: ClockProps) {
  return (
    <div className={`tabular-nums ${className}`}>
      <div className="mb-1 flex items-center gap-2 text-[0.85rem] font-extrabold tracking-[0.06em] uppercase md:gap-3 md:text-[1.1rem]">
        {name}
        <span
          className={`inline-flex items-center gap-1.5 border-2 px-1.5 py-px text-[0.6rem] tracking-[0.08em] md:px-2 md:text-[0.7rem] ${chipTone[tone]}`}
        >
          <span className={`size-2 bg-current ${tone === "loading" ? "animate-blink motion-reduce:animate-none" : ""}`} />
          {label}
        </span>
      </div>
      <div
        className={`text-[clamp(1.9rem,10vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] whitespace-nowrap md:text-[clamp(3.2rem,8vw,7.5rem)] md:tracking-[-0.03em] ${timeTone[tone]}`}
      >
        {seconds.toFixed(3)}
        <small className="ml-[0.08em] text-[0.45em] font-extrabold tracking-normal md:text-[0.4em]">s</small>
      </div>
    </div>
  );
}

export function Hero() {
  const { t } = useI18n();
  const [elapsed, setElapsed] = useState(VANILLA_STARTUP_SECONDS);
  const frame = useRef(0);

  const run = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setElapsed(VANILLA_STARTUP_SECONDS);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const seconds = Math.min((now - start) / 1000, VANILLA_STARTUP_SECONDS);
      setElapsed(seconds);
      if (seconds < VANILLA_STARTUP_SECONDS) {
        frame.current = requestAnimationFrame(tick);
      }
    };
    setElapsed(0);
    frame.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    run();
    return () => cancelAnimationFrame(frame.current);
  }, [run]);

  const pumpkinReady = elapsed >= PUMPKIN_STARTUP_SECONDS;
  const vanillaReady = elapsed >= VANILLA_STARTUP_SECONDS;

  return (
    <section className="relative overflow-hidden border-b-3 border-pumpkin">
      <div className="mx-auto grid max-w-325 grid-cols-1 px-5 pt-10 md:px-8 md:pt-16 lg:grid-cols-[minmax(0,920px)_minmax(260px,1fr)] lg:gap-8 lg:pb-20">
        <div className="min-w-0">
          <h1 className="max-w-[16ch] text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.02] font-extrabold tracking-[-0.01em] text-balance">
            {rich(t.hero.title, {
              hl: (text) => (
                <span className="inline-block border-2 border-pumpkin bg-pumpkin px-[0.2em] text-black">{text}</span>
              ),
            })}
          </h1>

          <div className="my-8 md:my-10">
            <div className="mb-5 grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-white/15 pb-2.5 text-sm text-muted md:flex md:flex-wrap md:text-[0.9rem]">
              <span className="col-start-1 row-start-1 font-extrabold tracking-[0.08em] text-fg uppercase">
                {t.hero.benchTitle}
              </span>
              <span className="col-span-2 row-start-2 text-[0.8rem] md:text-[0.9rem]">{t.hero.benchNote}</span>
              <button
                type="button"
                onClick={run}
                className="col-start-2 row-start-1 cursor-pointer font-semibold text-pumpkin underline underline-offset-3 hover:text-fg md:ml-auto"
              >
                {t.hero.runAgain}
              </button>
            </div>
            <div className="grid grid-cols-2">
              <Clock
                name="Pumpkin"
                seconds={Math.min(elapsed, PUMPKIN_STARTUP_SECONDS)}
                tone={pumpkinReady ? "fast" : "loading"}
                label={pumpkinReady ? t.hero.ready : t.hero.loading}
                className="pr-4 md:pr-10"
              />
              <Clock
                name="Vanilla"
                seconds={Math.min(elapsed, VANILLA_STARTUP_SECONDS)}
                tone={vanillaReady ? "slow" : "loading"}
                label={vanillaReady ? t.hero.ready : t.hero.loading}
                className="border-l-3 border-pumpkin pl-4 md:pl-10"
              />
            </div>
          </div>

          <p className="mb-8 max-w-120 text-[1.15rem] text-muted">{t.hero.lede}</p>

          <div className="flex flex-wrap items-center gap-6">
            <ButtonLink href="/download/" className="w-full md:w-auto">
              {t.hero.download}
              <DownloadIcon className="size-4" />
            </ButtonLink>
            <a href={`${DOCS_URL}/`} className="font-semibold underline underline-offset-4 hover:text-pumpkin">
              {t.hero.docs}
            </a>
          </div>
        </div>

        <div aria-hidden="true" className="relative mt-8 h-32.5 lg:mt-0 lg:h-auto">
          <img
            src={withBase("/assets/icon.svg")}
            alt=""
            className="pointer-events-none absolute right-[-8%] bottom-[-60%] h-[210%] w-auto max-w-none -rotate-9 select-none lg:right-auto lg:bottom-[-38%] lg:left-6 lg:h-[125%]"
          />
        </div>
      </div>
    </section>
  );
}
