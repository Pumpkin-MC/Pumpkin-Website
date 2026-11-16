import { useEffect, useState } from "react";
import { languageTag, useI18n } from "../../i18n";
import { formatMessage, formatNumber, formatTime } from "../../i18n/format";
import { rich } from "../../i18n/rich";
import { readCache, writeCache } from "../../lib/cache";
import { DISCORD_URL, DOCS_URL, GITHUB_URL } from "../../links";

interface Contributor {
  login: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
  type: string;
}

type LoadError = { kind: "rateLimit"; resetAt: number | null } | { kind: "other" };

const GITHUB_REPO = "Pumpkin-MC/Pumpkin";
const CACHE_KEY = "pumpkin_contributors";
const CACHE_TTL_MS = 60 * 60 * 1000;
const COUNT_UP_MS = 1500;
const TOP_COUNT = 5;

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

/** Raised when the GitHub API rate limit blocks the contributor list. */
class RateLimitError extends Error {
  constructor(readonly resetAt: number | null) {
    super("GitHub API rate limit reached");
  }
}

function hasHost(url: string, hostname: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === hostname;
  } catch {
    return false;
  }
}

function profileUrl(contributor: Contributor): string | undefined {
  return hasHost(contributor.html_url, "github.com") ? contributor.html_url : undefined;
}

function avatarUrl(contributor: Contributor, size: number): string | undefined {
  if (!hasHost(contributor.avatar_url, "avatars.githubusercontent.com")) return undefined;
  const url = new URL(contributor.avatar_url);
  url.searchParams.set("s", String(size));
  return url.toString();
}

async function fetchAllContributors(): Promise<Contributor[]> {
  const all: Contributor[] = [];
  for (let page = 1; ; page++) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=100&page=${page}`);
    if (response.status === 403) {
      const reset = response.headers.get("X-RateLimit-Reset");
      throw new RateLimitError(reset ? Number(reset) * 1000 : null);
    }
    if (!response.ok) throw new Error("Failed to fetch contributors");
    const batch = (await response.json()) as Contributor[];
    if (batch.length === 0) return all.filter((contributor) => contributor.type !== "Bot");
    all.push(...batch);
  }
}

function useCountUp(target: number | null): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / COUNT_UP_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

function Tally({ target, label }: { target: number | null; label: string }) {
  const { lang } = useI18n();
  const value = useCountUp(target);
  const locale = languageTag(lang);

  return (
    <span className="flex items-baseline gap-3">
      <span className="grid text-[clamp(3rem,8vw,5.5rem)] leading-none font-extrabold tracking-[-0.02em] text-fg tabular-nums">
        <span aria-hidden="true" className="invisible col-start-1 row-start-1">
          {target === null ? "-" : formatNumber(target, locale)}
        </span>
        <span className="col-start-1 row-start-1">{target === null ? "-" : formatNumber(value, locale)}</span>
      </span>
      <span className="font-mono text-sm text-muted md:text-base">{label}</span>
    </span>
  );
}

function TopContributors({ contributors }: { contributors: Contributor[] }) {
  const { lang, t } = useI18n();
  const locale = languageTag(lang);
  const most = contributors[0]?.contributions ?? 1;

  return (
    <ol className="grid gap-5">
      {contributors.map((contributor, index) => {
        const share = Math.max((contributor.contributions / most) * 100, 1.5);
        return (
          <li key={contributor.login} className="grid grid-cols-[1.5rem_3rem_minmax(0,1fr)_auto] items-center gap-x-4">
            <span className="font-mono text-sm text-muted tabular-nums">{index + 1}</span>
            <img
              src={avatarUrl(contributor, 96)}
              alt=""
              width={48}
              height={48}
              className="size-12 border-2 border-white/15 bg-surface"
            />
            <div className="min-w-0">
              <a href={profileUrl(contributor)} target="_blank" rel="noopener" className="font-bold hover:text-pumpkin">
                {contributor.login}
              </a>
              <div className="mt-2 h-1.5 bg-white/10">
                <div style={{ width: `${share}%` }} className="h-full bg-pumpkin" />
              </div>
            </div>
            <span className="font-mono text-sm text-muted tabular-nums">
              <span className="text-fg">{formatNumber(contributor.contributions, locale)}</span> {t.contributors.commits}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function AvatarWall({ contributors }: { contributors: Contributor[] }) {
  const { lang, t } = useI18n();
  const locale = languageTag(lang);

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2 md:grid-cols-[repeat(auto-fill,minmax(4rem,1fr))]">
      {contributors.map((contributor) => {
        const label = formatMessage(t.contributors.contributorLabel, {
          name: contributor.login,
          count: formatNumber(contributor.contributions, locale),
        });
        return (
          <li key={contributor.login}>
            <a
              href={profileUrl(contributor)}
              target="_blank"
              rel="noopener"
              title={label}
              aria-label={label}
              className="block aspect-square border-2 border-transparent bg-surface transition-colors hover:border-pumpkin focus-visible:border-pumpkin focus-visible:outline-none"
            >
              <img
                src={avatarUrl(contributor, 128)}
                alt=""
                loading="lazy"
                decoding="async"
                width={64}
                height={64}
                className="size-full"
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function WallPlaceholder() {
  return (
    <ul aria-hidden="true" className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2 md:grid-cols-[repeat(auto-fill,minmax(4rem,1fr))]">
      {Array.from({ length: 48 }, (_, index) => (
        <li key={index} className="aspect-square animate-pulse bg-surface motion-reduce:animate-none" />
      ))}
    </ul>
  );
}

export default function Contributors() {
  const { lang, t } = useI18n();
  const locale = languageTag(lang);
  const [contributors, setContributors] = useState<Contributor[] | null>(null);
  const [error, setError] = useState<LoadError | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readCache<Contributor[]>(CACHE_KEY, CACHE_TTL_MS);
    const load = cached ? Promise.resolve(cached) : fetchAllContributors();
    load
      .then((list) => {
        if (!cached) writeCache(CACHE_KEY, list);
        if (!cancelled) setContributors([...list].sort((a, b) => b.contributions - a.contributions));
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        setError(
          failure instanceof RateLimitError
            ? { kind: "rateLimit", resetAt: failure.resetAt }
            : { kind: "other" },
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCommits = contributors?.reduce((sum, contributor) => sum + contributor.contributions, 0) ?? null;
  const top = contributors?.slice(0, TOP_COUNT) ?? [];
  const everyoneElse = contributors?.slice(TOP_COUNT) ?? [];
  const errorMessage = error
    ? error.kind === "rateLimit"
      ? formatMessage(error.resetAt ? t.contributors.rateLimitReset : t.contributors.rateLimitSoon, {
          time: error.resetAt ? formatTime(new Date(error.resetAt), locale) : "",
        })
      : t.contributors.loadError
    : "";

  return (
    <>
      <section className="mx-auto max-w-325 px-5 pt-14 md:px-8 md:pt-20">
        <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em]">
          {t.contributors.title}
          <span className="text-pumpkin">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted md:text-xl">{t.contributors.description}</p>
        <div className="mt-10 flex flex-wrap gap-x-14 gap-y-4 border-y-2 border-white/15 py-6">
          <Tally target={contributors?.length ?? null} label={t.contributors.contributors} />
          <Tally target={totalCommits} label={t.contributors.commits} />
        </div>
      </section>

      <section className="mx-auto max-w-325 px-5 py-14 md:px-8 md:py-20">
        {error ? (
          <div className="border-l-3 border-danger bg-danger/10 px-5 py-4">
            <p className="font-bold text-danger">{errorMessage}</p>
            <p className="mt-2 text-sm text-muted">
              {rich(t.contributors.fullList, {
                github: (text) => (
                  <a href={`${GITHUB_URL}/graphs/contributors`} className={inlineLink}>
                    {text}
                  </a>
                ),
              })}
            </p>
          </div>
        ) : (
          <div className="grid gap-14 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">{t.contributors.mostCommits}</h2>
              {contributors ? (
                <TopContributors contributors={top} />
              ) : (
                <p className="text-muted">{t.contributors.loading}</p>
              )}
            </div>
            <div>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="text-2xl font-extrabold md:text-3xl">{t.contributors.everyoneElse}</h2>
                {contributors && (
                  <span className="font-mono text-sm text-muted">
                    {formatMessage(t.contributors.people, { count: formatNumber(everyoneElse.length, locale) })}
                  </span>
                )}
              </div>
              {contributors ? <AvatarWall contributors={everyoneElse} /> : <WallPlaceholder />}
            </div>
          </div>
        )}
      </section>

      <section className="border-t-3 border-pumpkin bg-surface">
        <div className="mx-auto flex max-w-325 flex-wrap items-center justify-between gap-x-10 gap-y-6 px-5 py-12 md:px-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold md:text-3xl">{t.contributors.contributeTitle}</h2>
            <p className="mt-2 text-muted">{t.contributors.contributeDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={`${DOCS_URL}/developer/contributing`} className={inlineLink}>
              {t.contributors.guide}
            </a>
            <a href={GITHUB_URL} className={inlineLink}>
              {t.contributors.github}
            </a>
            <a href={DISCORD_URL} className={inlineLink}>
              {t.contributors.discord}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
