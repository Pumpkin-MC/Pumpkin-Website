import { useEffect, useState } from "react";
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

const CUSTOMER_PORTAL_URL = "https://billing.stripe.com/p/login/8x23cueJM7jfaK14XB5os00";

const monthlyTiers = [
  { name: "Bronze", amount: 5, perk: "Credits listing & Discord role", href: "https://buy.stripe.com/8x23cueJM7jfaK14XB5os00" },
  { name: "Silver", amount: 10, perk: "Credits listing, link & Discord role", href: "https://buy.stripe.com/9B600i31432ZcS93Tx5os01" },
  { name: "Gold", amount: 20, perk: "Gold credits, link & Discord role", href: "https://buy.stripe.com/bJe8wOgRU7jf3hzblZ5os02" },
  { name: "Platinum", amount: 50, perk: "Priority credits, avatar & link", href: "https://buy.stripe.com/4gMaEW6dg9rndWd9dR5os03" },
  { name: "Titanium", amount: 100, perk: "Featured credits, avatar & link", href: "https://buy.stripe.com/8x29AS0SWavr5pH89N5os04" },
  { name: "Diamond", amount: 250, perk: "Top-tier credits, avatar & link", href: "https://buy.stripe.com/00w4gygRU473bO50Hl5os05" },
];

const corporateTiers = [
  { name: "Corporate Bronze", amount: 500, perk: "Logo & link in credits", href: "https://buy.stripe.com/5kQbJ00SWgTP9FX89N5os06" },
  { name: "Corporate Silver", amount: 1000, perk: "Priority logo & link in credits", href: "https://buy.stripe.com/7sY6oGeJM6fb2dvfCf5os07" },
  { name: "Corporate Gold", amount: 2000, perk: "Featured logo & link in credits", href: "https://buy.stripe.com/28EfZggRU9rn3hzfCf5os08" },
  { name: "Corporate Platinum", amount: 4000, perk: "Top-tier logo & link in credits", href: "https://buy.stripe.com/4gMeVc59cavrdWdfCf5os09" },
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

function named(sponsors: SponsorItem[] | undefined): SponsorItem[] {
  return (sponsors ?? []).filter((sponsor) => sponsor.is_private || sponsor.name?.trim());
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase();
}

function SponsorCard({ sponsor, showTier }: { sponsor: SponsorItem; showTier: boolean }) {
  if (sponsor.is_private) {
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
  const [tab, setTab] = useState<Tab>("current");
  const [sponsors, setSponsors] = useState<SponsorList | null>(null);
  const [failed, setFailed] = useState(false);

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
              Sponsorship<span className="text-pumpkin">.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted md:text-xl">
              Partner with Pumpkin. Select a sponsorship package for project credits, community perks, or corporate brand placement.
            </p>
          </div>
          <a
            href={CUSTOMER_PORTAL_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center border-2 border-white/20 bg-surface px-4 py-2.5 text-sm font-bold text-fg transition-colors hover:border-pumpkin hover:text-pumpkin"
          >
            Manage sponsorship →
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-325 px-5 pt-12 md:px-8 md:pt-16">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-3xl font-extrabold md:text-4xl">Community Supporter Tiers</h2>
          <p className="text-muted">Monthly membership with digital perks and directory recognition.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {monthlyTiers.map((tier) => (
            <li key={tier.name}>
              <a
                href={tier.href}
                aria-label={`Select ${tier.name} tier for ${dollars(tier.amount)} per month`}
                className="group flex h-full flex-col border-2 border-white/15 bg-surface p-5 transition-colors hover:border-pumpkin hover:bg-pumpkin hover:text-black focus-visible:border-pumpkin focus-visible:outline-none"
              >
                <span className="font-mono text-xs tracking-wider text-muted uppercase group-hover:text-black/70">
                  {tier.name}
                </span>
                <span className="mt-3 text-4xl font-extrabold tracking-[-0.02em]">{dollars(tier.amount)}</span>
                <span className="text-sm text-muted group-hover:text-black/70">per month</span>
                <span className="mt-3 text-xs text-muted group-hover:text-black/80">{tier.perk}</span>
                <span className="mt-auto pt-5 text-sm font-bold text-pumpkin group-hover:text-black">Select tier</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-325 px-5 py-12 md:px-8 md:py-16">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-3xl font-extrabold md:text-4xl">Corporate Sponsorship</h2>
          <p className="text-muted">
            Promote your company, hosting service, or developer tools with logo placement and outbound links in our credits.
          </p>
        </div>
        <ul className="border-t-3 border-pumpkin">
          {corporateTiers.map((tier) => (
            <li
              key={tier.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 border-b border-white/10 py-4 md:grid-cols-[minmax(0,1fr)_16rem_10rem_6rem]"
            >
              <span className="font-extrabold">{tier.name}</span>
              <span className="col-start-1 text-sm text-muted md:col-start-auto md:text-base">{tier.perk}</span>
              <span className="col-start-1 font-mono text-sm text-muted md:col-start-auto">
                <span className="text-fg">{dollars(tier.amount)}</span> / month
              </span>
              <a
                href={tier.href}
                aria-label={`Select ${tier.name} package for ${dollars(tier.amount)} per month`}
                className="col-start-2 row-span-3 row-start-1 font-bold text-pumpkin hover:text-fg md:col-start-auto md:row-span-1 md:row-start-auto md:text-right"
              >
                Select package
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t-3 border-pumpkin bg-surface">
        <div className="mx-auto max-w-325 px-5 py-12 md:px-8 md:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">Partners & Sponsors</h2>
              <p className="mt-2 text-muted">These companies and community members actively support Pumpkin development.</p>
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
                  {id === "current" ? `Active${sponsors ? ` · ${current.length}` : ""}` : `Past Sponsors${sponsors ? ` · ${past.length}` : ""}`}
                </button>
              ))}
            </div>
          </div>

          {failed ? (
            <p className="border-l-3 border-danger bg-danger/10 px-4 py-3 text-danger">
              Unable to load sponsors from the server at this time. Please try again later.
            </p>
          ) : !sponsors ? (
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
                          <span className="font-mono text-sm font-normal text-muted">{group.sponsors.length}</span>
                        </h3>
                        <SponsorGrid sponsors={group.sponsors} showTier={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div id="sponsors-panel-past" role="tabpanel" aria-labelledby="sponsors-tab-past" hidden={tab !== "past"}>
                {past.length === 0 ? <p className="text-muted">No past sponsors.</p> : <SponsorGrid sponsors={past} showTier />}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-325 gap-6 px-5 py-12 text-sm text-muted md:px-8">
        <div className="grid gap-4 border-t border-white/10 pt-8 max-w-4xl">
          <h3 className="text-lg font-bold text-fg">Terms of Sale, Billing & Fulfillment Policy</h3>
          <p>
            <span className="font-bold text-fg">Digital Fulfillment:</span> Digital perks—including Discord community
            supporter roles, website credit listings, and corporate logo/link placements—are provisioned digitally upon
            successful payment completion. If your digital perks require manual setup or Discord sync, access is confirmed
            within 24 hours.
          </p>
          <p>
            <span className="font-bold text-fg">Corporate Sponsorship Guidelines:</span> Corporate sponsorship tiers
            include logo placement and outbound link credits on pumpkinmc.org. All brand assets and links are subject to
            review for community guidelines. Pumpkin reserves the right to decline or request modification of assets
            that violate these standards.
          </p>
          <p>
            <span className="font-bold text-fg">Billing & Cancellation:</span> Monthly sponsorships are billed on a
            recurring cycle and can be modified or cancelled at any time through the{" "}
            <a href={CUSTOMER_PORTAL_URL} target="_blank" rel="noopener" className={inlineLink}>
              Stripe Customer Portal
            </a>
            . Cancellations take effect at the conclusion of the active billing period.
          </p>
          <p>
            <span className="font-bold text-fg">Refund Policy:</span> Due to the immediate delivery of digital perks,
            community roles, and directory placement, payments are non-refundable once activated, except as required
            by applicable law.
          </p>
          <p>
            <span className="font-bold text-fg">Code signing:</span> Free code signing provided by{" "}
            <a href="https://signpath.io/" target="_blank" rel="noopener" className={inlineLink}>
              SignPath.io
            </a>
            , certificate by{" "}
            <a href="https://signpath.org/" target="_blank" rel="noopener" className={inlineLink}>
              SignPath Foundation
            </a>
            . Pumpkin releases are digitally signed using SignPath.
          </p>
        </div>
      </section>
    </>
  );
}
