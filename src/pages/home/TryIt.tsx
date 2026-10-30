import { useI18n } from "../../i18n";
import { ButtonLink } from "../../components/Button";
import { GITHUB_URL } from "../../links";

/** Call-to-action section inviting visitors to try Pumpkin on a spare machine. */
export function TryIt() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-225 px-5 pt-4 pb-16 md:px-8 md:pt-8 md:pb-24">
      <div className="border-3 border-pumpkin bg-surface px-6 py-10 text-center brutal-4 md:px-12 md:py-14 md:brutal-6">
        <h2 className="mb-3 text-[2rem] leading-[1.05] font-extrabold text-pumpkin md:text-[2.5rem]">
          {t.tryIt.title}
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-[1.15rem] text-muted">
          {t.tryIt.body}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLink href="/download/" className="w-full md:w-auto">
            {t.nav.download}
          </ButtonLink>
          <ButtonLink href={GITHUB_URL} variant="ghost" className="w-full md:w-auto">
            {t.tryIt.github}
          </ButtonLink>
          <ButtonLink href="/contributors/" variant="ghost" className="w-full md:w-auto">
            {t.tryIt.contributors}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
