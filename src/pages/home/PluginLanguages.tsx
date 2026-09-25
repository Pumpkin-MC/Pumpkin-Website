import { MARKET_URL, pluginLanguages } from "../../links";

export function PluginLanguages() {
  return (
    <section className="mx-auto flex max-w-325 flex-wrap items-center gap-x-8 gap-y-4 px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-[1.4rem] font-extrabold">Write plugins in</h2>
      <ul className="flex flex-wrap gap-2">
        {pluginLanguages.map((language) => (
          <li key={language.label}>
            <a
              href={language.href}
              className="inline-block border-2 border-fg px-3.5 py-1.5 text-[0.95rem] font-bold hover:bg-fg hover:text-black"
            >
              {language.label}
            </a>
          </li>
        ))}
      </ul>
      <a href={MARKET_URL} className="font-semibold text-pumpkin underline underline-offset-3 hover:text-fg md:ml-auto">
        Or install one from the Market
      </a>
    </section>
  );
}
