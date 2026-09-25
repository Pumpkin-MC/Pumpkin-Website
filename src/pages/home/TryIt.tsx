import { ButtonLink } from "../../components/Button";
import { GITHUB_URL } from "../../links";

export function TryIt() {
  return (
    <section className="mx-auto max-w-225 px-5 pt-4 pb-16 md:px-8 md:pt-8 md:pb-24">
      <div className="border-3 border-pumpkin bg-surface px-6 py-10 text-center brutal-4 md:px-12 md:py-14 md:brutal-6">
        <h2 className="mb-3 text-[2rem] leading-[1.05] font-extrabold text-pumpkin md:text-[2.5rem]">
          Try it on a spare machine.
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-[1.15rem] text-muted">
          It's one file. Run it next to your current server, point a client at it, and see what works for your world
          before you commit.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLink href="/download/" className="w-full md:w-auto">
            Download
          </ButtonLink>
          <ButtonLink href={GITHUB_URL} variant="ghost" className="w-full md:w-auto">
            Star on GitHub
          </ButtonLink>
          <ButtonLink href="/contributors/" variant="ghost" className="w-full md:w-auto">
            Meet the contributors
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
