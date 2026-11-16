import { ButtonLink } from "../../components/Button";
import { useI18n } from "../../i18n";
import { DOCS_URL } from "../../links";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-325 px-5 py-20 md:px-8 md:py-28">
      <p className="text-[clamp(5rem,18vw,11rem)] leading-none font-extrabold tracking-tight text-pumpkin">404</p>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight font-extrabold text-balance">{t.notFound.title}</h1>
      <p className="mt-4 max-w-120 text-lg text-muted">{t.notFound.description}</p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <ButtonLink href="/">{t.notFound.home}</ButtonLink>
        <ButtonLink href="/download/" variant="ghost">
          {t.notFound.download}
        </ButtonLink>
        <a href={`${DOCS_URL}/`} className="font-semibold underline underline-offset-4 hover:text-pumpkin">
          {t.notFound.docs}
        </a>
      </div>
    </section>
  );
}
