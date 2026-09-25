import { ButtonLink } from "../../components/Button";
import { DOCS_URL } from "../../links";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-325 px-5 py-20 md:px-8 md:py-28">
      <p className="text-[clamp(5rem,18vw,11rem)] leading-none font-extrabold tracking-tight text-pumpkin">404</p>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight font-extrabold text-balance">
        This page does not exist.
      </h1>
      <p className="mt-4 max-w-120 text-lg text-muted">
        The link may be old, or the page moved when the site was rebuilt. These are the places most people are looking
        for.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <ButtonLink href="/">Back to the homepage</ButtonLink>
        <ButtonLink href="/download/" variant="ghost">
          Download Pumpkin
        </ButtonLink>
        <a href={`${DOCS_URL}/`} className="font-semibold underline underline-offset-4 hover:text-pumpkin">
          Read the docs
        </a>
      </div>
    </section>
  );
}
