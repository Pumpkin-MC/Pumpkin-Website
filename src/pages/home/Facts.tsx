import { useI18n } from "../../i18n";
import { rich } from "../../i18n/rich";
import { DOCS_URL, GITHUB_URL } from "../../links";

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

export function Facts() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-325 px-5 pt-14 pb-16 md:px-8 md:pt-20 md:pb-24">
      <h2 className="mb-10 text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.01em]">
        {rich(t.facts.title, {
          hl: (text) => (
            <span className="inline-block border-2 border-pumpkin bg-pumpkin px-[0.2em] text-black">{text}</span>
          ),
        })}
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {t.facts.items.map((item) => (
          <div key={item.big} className="border-3 border-pumpkin bg-surface px-7 pt-7 pb-[1.9rem] brutal-4">
            <span className="mb-2.5 block text-[2.2rem] leading-none font-extrabold tracking-[-0.02em] text-pumpkin">
              {item.big}
            </span>
            <p className="text-base/normal">
              {item.lead} <span className="text-muted">{item.rest}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 items-start gap-4 border-3 border-fg bg-ink px-5 py-6 brutal-4 brutal-color-fg md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-8 md:px-8 md:py-7 md:brutal-6">
        <span className="inline-block -rotate-2 justify-self-start border-3 border-success bg-success px-3 py-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] text-black uppercase">
          {t.facts.earlyTag}
        </span>
        <p className="text-[1.1rem] leading-normal">
          {rich(t.facts.earlyBody, {
            b: (text) => <strong className="font-extrabold">{text}</strong>,
            report: (text) => (
              <a href={`${GITHUB_URL}/issues`} className={inlineLink}>
                {text}
              </a>
            ),
            docs: (text) => (
              <a href={`${DOCS_URL}/`} className={inlineLink}>
                {text}
              </a>
            ),
          })}
        </p>
      </div>
    </section>
  );
}
