import { useEffect, useState } from "react";
import { languageTag, useI18n, type Messages } from "../../i18n";
import { formatCurrency, formatMessage } from "../../i18n/format";
import { rich } from "../../i18n/rich";
import { MARKET_API_URL } from "../../lib/marketApi";

interface SponsorItem {
  name: string;
  tier?: string | null;
  tier_slug?: string | null;
  url?: string | null;
  avatar_url?: string | null;
  is_private?: boolean;
}

interface SponsorList {
  current?: SponsorItem[];
  past?: SponsorItem[];
}

type Tab = "current" | "past";
type TierId = keyof Messages["sponsor"]["tiers"];
type MonthlyTierId = keyof Messages["sponsor"]["monthlyPerks"];
type CorporateTierId = keyof Messages["sponsor"]["corporatePerks"];

const tierOrder: { slug: string; id: TierId }[] = [
  { slug: "tier-corp-platinum", id: "corporatePlatinum" },
  { slug: "tier-corp-gold", id: "corporateGold" },
  { slug: "tier-corp-silver", id: "corporateSilver" },
  { slug: "tier-corp-bronze", id: "corporateBronze" },
  { slug: "tier-diamond", id: "diamond" },
  { slug: "tier-titanium", id: "titanium" },
  { slug: "tier-platinum", id: "platinum" },
  { slug: "tier-gold", id: "gold" },
  { slug: "tier-silver", id: "silver" },
  { slug: "tier-bronze", id: "bronze" },
];

const CUSTOMER_PORTAL_URL = "https://billing.stripe.com/p/login/8x23cueJM7jfaK14XB5os00";

const monthlyTiers: { id: MonthlyTierId; amount: number; href: string }[] = [
  { id: "bronze", amount: 5, href: "https://buy.stripe.com/8x23cueJM7jfaK14XB5os00" },
  { id: "silver", amount: 10, href: "https://buy.stripe.com/9B600i31432ZcS93Tx5os01" },
  { id: "gold", amount: 20, href: "https://buy.stripe.com/bJe8wOgRU7jf3hzblZ5os02" },
  { id: "platinum", amount: 50, href: "https://buy.stripe.com/4gMaEW6dg9rndWd9dR5os03" },
  { id: "titanium", amount: 100, href: "https://buy.stripe.com/8x29AS0SWavr5pH89N5os04" },
  { id: "diamond", amount: 250, href: "https://buy.stripe.com/00w4gygRU473bO50Hl5os05" },
];

const corporateTiers: { id: CorporateTierId; amount: number; href: string }[] = [
  { id: "corporateBronze", amount: 500, href: "https://buy.stripe.com/5kQbJ00SWgTP9FX89N5os06" },
  { id: "corporateSilver", amount: 1000, href: "https://buy.stripe.com/7sY6oGeJM6fb2dvfCf5os07" },
  { id: "corporateGold", amount: 2000, href: "https://buy.stripe.com/28EfZggRU9rn3hzfCf5os08" },
  { id: "corporatePlatinum", amount: 4000, href: "https://buy.stripe.com/4gMeVc59cavrdWdfCf5os09" },
];

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

function hasSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

function named(sponsors: SponsorItem[] | undefined): SponsorItem[] {
  return (sponsors ?? []).filter((sponsor) => sponsor.is_private || sponsor.name?.trim());
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase();
}

function SponsorCard({ sponsor, showTier }: { sponsor: SponsorItem; showTier: boolean }) {
  const { t } = useI18n();

  if (sponsor.is_private) {
    return (
      <div className="flex items-center gap-3 border-2 border-dashed border-white/15 px-4 py-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center bg-white/5 font-mono text-sm text-muted">
          ?
        </span>
        <span className="text-muted">{t.sponsor.partners.private}</span>
      </div>
    );
  }

  const body = (
    <>
      {hasSafeUrl(sponsor.avatar_url) ? (
        <img src={sponsor.avatar_url} alt="" width={40} height={40} className="size-10 shrink-0 bg-surface" />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center bg-pumpkin/15 font-mono text-sm font-bold text-pumpkin"
        >
          {initials(sponsor.name)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-bold">{sponsor.name}</span>
        {showTier && sponsor.tier && <span className="block text-xs text-muted">{sponsor.tier}</span>}
      </span>
    </>
  );

  const shape = "flex items-center gap-3 border-2 border-white/15 bg-ink px-4 py-3";

  return hasSafeUrl(sponsor.url) ? (
    <a href={sponsor.url} target="_blank" rel="noopener" className={`${shape} transition-colors hover:border-pumpkin`}>
      {body}
    </a>
  ) : (
    <div className={shape}>{body}</div>
  );
}

function SponsorGrid({ sponsors, showTier }: { sponsors: SponsorItem[]; showTier: boolean }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sponsors.map((sponsor, index) => (
        <li key={`${sponsor.name}-${index}`}>
          <SponsorCard sponsor={sponsor} showTier={showTier} />
        </li>
      ))}
    </ul>
  );
}

export default function Sponsor() {
  const { lang, t } = useI18n();
  const [tab, setTab] = useState<Tab>("current");
  const [sponsors, setSponsors] = useState<SponsorList | null>(null);
  const [failed, setFailed] = useState(false);
  const locale = languageTag(lang);
  const euros = (amount: number) => formatCurrency(amount, locale, "EUR");

  useEffect(() => {
    let cancelled = false;
    fetch(`${MARKET_API_URL}/donators`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch sponsors");
        return response.json() as Promise<SponsorList>;
      })
      .then((data) => {
        if (!cancelled) setSponsors({ ...data, current: named(data.current), past: named(data.past) });
      })
      .catch((error: unknown) => {
        console.error("Error loading sponsors from API:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = sponsors?.current ?? [];
  const past = sponsors?.past ?? [];
  const groups = tierOrder
    .map((tier) => ({ ...tier, sponsors: current.filter((sponsor) => (sponsor.tier_slug || "tier-bronze") === tier.slug) }))
    .filter((group) => group.sponsors.length > 0);

  return (
    <>
      <section className="mx-auto max-w-325 px-5 pt-14 md:px-8 md:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em]">
              {t.sponsor.title}
              <span className="text-pumpkin">.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted md:text-xl">{t.sponsor.description}</p>
          </div>
          <a
            href={CUSTOMER_PORTAL_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center border-2 border-white/20 bg-surface px-4 py-2.5 text-sm font-bold text-fg transition-colors hover:border-pumpkin hover:text-pumpkin"
          >
            {t.sponsor.manage}
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-325 px-5 pt-12 md:px-8 md:pt-16">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-3xl font-extrabold md:text-4xl">{t.sponsor.community.title}</h2>
          <p className="text-muted">{t.sponsor.community.description}</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {monthlyTiers.map((tier) => (
            <li key={tier.id}>
              <a
                href={tier.href}
                aria-label={formatMessage(t.sponsor.selectTierLabel, {
                  tier: t.sponsor.tiers[tier.id],
                  amount: euros(tier.amount),
                })}
                className="group flex h-full flex-col border-2 border-white/15 bg-surface p-5 transition-colors hover:border-pumpkin hover:bg-pumpkin hover:text-black focus-visible:border-pumpkin focus-visible:outline-none"
              >
                <span className="font-mono text-xs tracking-wider text-muted uppercase group-hover:text-black/70">
                  {t.sponsor.tiers[tier.id]}
                </span>
                <span className="mt-3 text-4xl font-extrabold tracking-[-0.02em]">{euros(tier.amount)}</span>
                <span className="text-sm text-muted group-hover:text-black/70">{t.sponsor.perMonth}</span>
                <span className="mt-3 text-xs text-muted group-hover:text-black/80">{t.sponsor.monthlyPerks[tier.id]}</span>
                <span className="mt-auto pt-5 text-sm font-bold text-pumpkin group-hover:text-black">
                  {t.sponsor.selectTier}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-325 px-5 py-12 md:px-8 md:py-16">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-3xl font-extrabold md:text-4xl">{t.sponsor.corporate.title}</h2>
          <p className="text-muted">{t.sponsor.corporate.description}</p>
        </div>
        <ul className="border-t-3 border-pumpkin">
          {corporateTiers.map((tier) => (
            <li
              key={tier.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 border-b border-white/10 py-4 md:grid-cols-[minmax(0,1fr)_16rem_10rem_6rem]"
            >
              <span className="font-extrabold">{t.sponsor.tiers[tier.id]}</span>
              <span className="col-start-1 text-sm text-muted md:col-start-auto md:text-base">
                {t.sponsor.corporatePerks[tier.id]}
              </span>
              <span className="col-start-1 font-mono text-sm text-muted md:col-start-auto">
                {formatMessage(t.sponsor.monthlyPrice, { amount: euros(tier.amount) })}
              </span>
              <a
                href={tier.href}
                aria-label={formatMessage(t.sponsor.corporate.selectLabel, {
                  tier: t.sponsor.tiers[tier.id],
                  amount: euros(tier.amount),
                })}
                className="col-start-2 row-span-3 row-start-1 font-bold text-pumpkin hover:text-fg md:col-start-auto md:row-span-1 md:row-start-auto md:text-right"
              >
                {t.sponsor.corporate.select}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t-3 border-pumpkin bg-surface">
        <div className="mx-auto max-w-325 px-5 py-12 md:px-8 md:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">{t.sponsor.partners.title}</h2>
              <p className="mt-2 text-muted">{t.sponsor.partners.description}</p>
            </div>
            <div
              role="tablist"
              aria-label={t.sponsor.partners.list}
              className="inline-grid grid-cols-2 border-2 border-white/20 font-mono text-sm"
            >
              {(["current", "past"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`sponsors-tab-${id}`}
                  aria-selected={tab === id}
                  aria-controls={`sponsors-panel-${id}`}
                  onClick={() => setTab(id)}
                  className={`cursor-pointer px-4 py-2 transition-colors ${tab === id ? "bg-fg text-black" : "text-muted hover:text-fg"}`}
                >
                  {id === "current"
                    ? `${t.sponsor.partners.active}${sponsors ? ` · ${current.length}` : ""}`
                    : `${t.sponsor.partners.past}${sponsors ? ` · ${past.length}` : ""}`}
                </button>
              ))}
            </div>
          </div>

          {failed ? (
            <p className="border-l-3 border-danger bg-danger/10 px-4 py-3 text-danger">
              {t.sponsor.partners.loadError}
            </p>
          ) : !sponsors ? (
            <p className="text-muted">{t.sponsor.partners.loading}</p>
          ) : (
            <>
              <div id="sponsors-panel-current" role="tabpanel" aria-labelledby="sponsors-tab-current" hidden={tab !== "current"}>
                {groups.length === 0 ? (
                  <p className="text-muted">{t.sponsor.partners.noCurrent}</p>
                ) : (
                  <div className="grid gap-8">
                    {groups.map((group) => (
                      <div key={group.slug}>
                        <h3 className="mb-3 flex items-baseline gap-3 text-lg font-extrabold">
                          {t.sponsor.tiers[group.id]}
                          <span className="font-mono text-sm font-normal text-muted">{group.sponsors.length}</span>
                        </h3>
                        <SponsorGrid sponsors={group.sponsors} showTier={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div id="sponsors-panel-past" role="tabpanel" aria-labelledby="sponsors-tab-past" hidden={tab !== "past"}>
                {past.length === 0 ? (
                  <p className="text-muted">{t.sponsor.partners.noPast}</p>
                ) : (
                  <SponsorGrid sponsors={past} showTier />
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-325 gap-6 px-5 py-12 text-sm text-muted md:px-8">
        <div className="grid max-w-4xl gap-4 border-t border-white/10 pt-8">
          <h3 className="text-lg font-bold text-fg">{t.sponsor.terms.title}</h3>
          {([t.sponsor.terms.digital, t.sponsor.terms.corporate, t.sponsor.terms.billing, t.sponsor.terms.refund, t.sponsor.terms.signing]).map(
            (paragraph) => (
              <p key={paragraph}>
                {rich(paragraph, {
                  b: (text) => <span className="font-bold text-fg">{text}</span>,
                  portal: (text) => (
                    <a href={CUSTOMER_PORTAL_URL} target="_blank" rel="noopener" className={inlineLink}>
                      {text}
                    </a>
                  ),
                  signpath: (text) => (
                    <a href="https://signpath.io/" target="_blank" rel="noopener" className={inlineLink}>
                      {text}
                    </a>
                  ),
                  foundation: (text) => (
                    <a href="https://signpath.org/" target="_blank" rel="noopener" className={inlineLink}>
                      {text}
                    </a>
                  ),
                })}
              </p>
            ),
          )}
        </div>
      </section>
    </>
  );
}
