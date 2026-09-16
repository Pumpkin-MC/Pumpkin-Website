import { useEffect, useState } from "react";
import { MARKET_API_URL } from "../../lib/marketApi";

interface Donator {
  name: string;
  tier?: string | null;
  tier_slug?: string | null;
  url?: string | null;
  avatar_url?: string | null;
  is_private?: boolean;
}

interface DonatorList {
  current?: Donator[];
  past?: Donator[];
}

type Tab = "current" | "past";

const tierOrder = [
  { slug: "tier-corp-platinum", name: "Corporate Platinum" },
  { slug: "tier-corp-gold", name: "Corporate Gold" },
  { slug: "tier-corp-silver", name: "Corporate Silver" },
  { slug: "tier-corp-bronze", name: "Corporate Bronze" },
  { slug: "tier-diamond", name: "Diamond" },
  { slug: "tier-titanium", name: "Titanium" },
  { slug: "tier-platinum", name: "Platinum" },
  { slug: "tier-gold", name: "Gold" },
  { slug: "tier-silver", name: "Silver" },
  { slug: "tier-bronze", name: "Bronze" },
];

const monthlyTiers = [
  { name: "Bronze", amount: 5, href: "https://donate.stripe.com/3cI4gyavV0K3aiH3N32cg00" },
  { name: "Silver", amount: 10, href: "https://donate.stripe.com/dRm5kC5bBboH2Qf2IZ2cg01" },
  { name: "Gold", amount: 20, href: "https://donate.stripe.com/cNi8wO5bB50j4Yn83j2cg02" },
  { name: "Platinum", amount: 50, href: "https://donate.stripe.com/aFa6oGeMb9gz2QffvL2cg03" },
  { name: "Titanium", amount: 100, href: "https://donate.stripe.com/bJeaEW7jJboHeyX2IZ2cg05" },
  { name: "Diamond", amount: 250, href: "https://donate.stripe.com/dRmbJ033teATfD16Zf2cg04" },
];

const corporateTiers = [
  { name: "Corporate Bronze", amount: 500, href: "https://donate.stripe.com/28E6oG9rReAT3Uj83j2cg06" },
  { name: "Corporate Silver", amount: 1000, href: "https://donate.stripe.com/8x2aEWeMbakD2Qf0AR2cg07" },
  { name: "Corporate Gold", amount: 2000, href: "https://donate.stripe.com/00w7sK6fF1O776v1EV2cg08" },
  { name: "Corporate Platinum", amount: 4000, href: "https://donate.stripe.com/eVq3cu5bBfEX4YnerH2cg09" },
];

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

const dollars = (amount: number) => `$${amount.toLocaleString("en-US")}`;

function hasSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase();
}

function SponsorCard({ donator, showTier }: { donator: Donator; showTier: boolean }) {
  if (donator.is_private) {
    return (
      <div className="flex items-center gap-3 border-2 border-dashed border-white/15 px-4 py-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center bg-white/5 font-mono text-sm text-muted">
          ?
        </span>
        <span className="text-muted">Private sponsor</span>
      </div>
    );
  }

  const body = (
    <>
      {hasSafeUrl(donator.avatar_url) ? (
        <img src={donator.avatar_url} alt="" width={40} height={40} className="size-10 shrink-0 bg-surface" />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center bg-pumpkin/15 font-mono text-sm font-bold text-pumpkin"
        >
          {initials(donator.name)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-bold">{donator.name}</span>
        {showTier && donator.tier && <span className="block text-xs text-muted">{donator.tier}</span>}
      </span>
    </>
  );

  const shape = "flex items-center gap-3 border-2 border-white/15 bg-ink px-4 py-3";

  return hasSafeUrl(donator.url) ? (
    <a href={donator.url} target="_blank" rel="noopener" className={`${shape} transition-colors hover:border-pumpkin`}>
      {body}
    </a>
  ) : (
    <div className={shape}>{body}</div>
  );
}

function SponsorGrid({ donators, showTier }: { donators: Donator[]; showTier: boolean }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {donators.map((donator, index) => (
        <li key={`${donator.name}-${index}`}>
          <SponsorCard donator={donator} showTier={showTier} />
        </li>
      ))}
    </ul>
  );
}

export default function Donate() {
  const [tab, setTab] = useState<Tab>("current");
  const [donators, setDonators] = useState<DonatorList | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${MARKET_API_URL}/donators`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch donators");
        return response.json() as Promise<DonatorList>;
      })
      .then((data) => {
        if (!cancelled) setDonators(data);
      })
      .catch((error: unknown) => {
        console.error("Error loading donators from API:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = donators?.current ?? [];
  const past = donators?.past ?? [];
  const groups = tierOrder
    .map((tier) => ({ ...tier, donators: current.filter((donator) => (donator.tier_slug || "tier-bronze") === tier.slug) }))
    .filter((group) => group.donators.length > 0);

  return (
    <>
      <section className="mx-auto max-w-325 px-5 pt-14 md:px-8 md:pt-20">
        <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em]">
          Support Pumpkin<span className="text-pumpkin">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted md:text-xl">
          Help us fund development and infrastructure for the fastest Minecraft server ever.
        </p>
      </section>

      <section className="mx-auto max-w-325 px-5 pt-12 md:px-8 md:pt-16">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-3xl font-extrabold md:text-4xl">Monthly</h2>
          <p className="text-muted">Pick an amount. Checkout happens on Stripe.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {monthlyTiers.map((tier) => (
            <li key={tier.name}>
              <a
                href={tier.href}
                aria-label={`Become a ${tier.name} sponsor for ${dollars(tier.amount)} per month`}
                className="group flex h-full flex-col border-2 border-white/15 bg-surface p-5 transition-colors hover:border-pumpkin hover:bg-pumpkin hover:text-black focus-visible:border-pumpkin focus-visible:outline-none"
              >
                <span className="font-mono text-xs tracking-wider text-muted uppercase group-hover:text-black/70">
                  {tier.name}
                </span>
                <span className="mt-3 text-4xl font-extrabold tracking-[-0.02em]">{dollars(tier.amount)}</span>
                <span className="text-sm text-muted group-hover:text-black/70">per month</span>
                <span className="mt-6 text-sm font-bold text-pumpkin group-hover:text-black">Sponsor</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-325 px-5 py-12 md:px-8 md:py-16">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-3xl font-extrabold md:text-4xl">Corporate</h2>
          <p className="text-muted">Perfect for companies looking to support open source development.</p>
        </div>
        <ul className="border-t-3 border-pumpkin">
          {corporateTiers.map((tier) => (
            <li
              key={tier.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 border-b border-white/10 py-4 md:grid-cols-[minmax(0,1fr)_14rem_10rem_6rem]"
            >
              <span className="font-extrabold">{tier.name}</span>
              <span className="col-start-1 text-sm text-muted md:col-start-auto md:text-base">Logo & link in credits</span>
              <span className="col-start-1 font-mono text-sm text-muted md:col-start-auto">
                <span className="text-fg">{dollars(tier.amount)}</span> / month
              </span>
              <a
                href={tier.href}
                aria-label={`Become a ${tier.name} sponsor for ${dollars(tier.amount)} per month`}
                className="col-start-2 row-span-3 row-start-1 font-bold text-pumpkin hover:text-fg md:col-start-auto md:row-span-1 md:row-start-auto md:text-right"
              >
                Sponsor
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t-3 border-pumpkin bg-surface">
        <div className="mx-auto max-w-325 px-5 py-12 md:px-8 md:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">Sponsors</h2>
              <p className="mt-2 text-muted">These amazing people help fund Pumpkin's development.</p>
            </div>
            <div role="tablist" aria-label="Sponsor list" className="inline-grid grid-cols-2 border-2 border-white/20 font-mono text-sm">
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
                  {id === "current" ? `Current${donators ? ` · ${current.length}` : ""}` : `Past${donators ? ` · ${past.length}` : ""}`}
                </button>
              ))}
            </div>
          </div>

          {failed ? (
            <p className="border-l-3 border-danger bg-danger/10 px-4 py-3 text-danger">
              Unable to load sponsors from the server at this time. Please try again later.
            </p>
          ) : !donators ? (
            <p className="text-muted">Loading sponsors...</p>
          ) : (
            <>
              <div id="sponsors-panel-current" role="tabpanel" aria-labelledby="sponsors-tab-current" hidden={tab !== "current"}>
                {groups.length === 0 ? (
                  <p className="text-muted">No current sponsors yet. You could be the first.</p>
                ) : (
                  <div className="grid gap-8">
                    {groups.map((group) => (
                      <div key={group.slug}>
                        <h3 className="mb-3 flex items-baseline gap-3 text-lg font-extrabold">
                          {group.name}
                          <span className="font-mono text-sm font-normal text-muted">{group.donators.length}</span>
                        </h3>
                        <SponsorGrid donators={group.donators} showTier={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div id="sponsors-panel-past" role="tabpanel" aria-labelledby="sponsors-tab-past" hidden={tab !== "past"}>
                {past.length === 0 ? <p className="text-muted">No past sponsors.</p> : <SponsorGrid donators={past} showTier />}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-325 px-5 py-10 md:px-8">
        <p className="max-w-3xl text-sm text-muted">
          <span className="font-bold text-fg">Code signing.</span> Free code signing provided by{" "}
          <a href="https://signpath.io/" target="_blank" rel="noopener" className={inlineLink}>
            SignPath.io
          </a>
          , certificate by{" "}
          <a href="https://signpath.org/" target="_blank" rel="noopener" className={inlineLink}>
            SignPath Foundation
          </a>
          . Pumpkin releases are digitally signed using SignPath.
        </p>
      </section>
    </>
  );
}
