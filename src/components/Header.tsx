import { useEffect, useRef, useState } from "react";
import { languages, useI18n, type Lang } from "../i18n";
import { GITHUB_URL, MARKET_URL } from "../links";
import { withBase } from "../lib/url";
import { menuPanels, type MenuPanel } from "./menu";
import { ChevronDownIcon, CloseIcon, ExternalIcon, GitHubIcon, GlobeIcon, MenuIcon } from "./icons";

const DESKTOP_QUERY = "(min-width: 60rem)";
const CLOSE_DELAY_MS = 120;

const squareButton =
  "inline-flex h-10.5 items-center justify-center border-3 border-fg bg-ink text-fg transition duration-100 nav:brutal-3 nav:brutal-color-fg nav:hover:brutal-5 nav:hover:-translate-0.5";

const triggerBase =
  "relative flex w-full cursor-pointer items-center justify-between px-1 py-3.5 font-semibold hover:text-fg nav:h-10.5 nav:w-auto nav:justify-start nav:gap-1.5 nav:px-4 nav:py-0 nav:after:absolute nav:after:bottom-0 nav:after:left-1/2 nav:after:h-0.75 nav:after:-translate-x-1/2 nav:after:bg-pumpkin nav:after:transition-[width] nav:hover:after:w-[calc(100%-2rem)]";

function isDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function Panel({ panel, open }: { panel: MenuPanel; open: boolean }) {
  return (
    <div
      className={`${open ? "grid" : "hidden"} gap-4 px-1 pb-4 nav:absolute nav:top-[calc(100%+10px)] nav:left-0 nav:auto-cols-[minmax(200px,max-content)] nav:grid-flow-col nav:gap-x-10 nav:gap-y-0 nav:border-3 nav:border-pumpkin nav:bg-surface nav:px-6 nav:py-6 nav:brutal-6 nav:before:absolute nav:before:inset-x-0 nav:before:-top-3.25 nav:before:h-3.25`}
    >
      {panel.columns.map((column) => (
        <div key={column.heading}>
          <p className="mb-2.5 ml-3 text-[0.72rem] font-extrabold tracking-widest text-muted uppercase">{column.heading}</p>
          <ul className={column.compact ? "grid grid-cols-2" : undefined}>
            {column.links.map((link) => (
              <li key={link.label}>
                <a
                  href={withBase(link.href)}
                  className={`group/link block ${column.compact ? "py-1.5" : "py-2"} px-3 text-[0.95rem] leading-snug font-bold text-fg hover:bg-pumpkin hover:text-black focus-visible:bg-pumpkin focus-visible:text-black focus-visible:outline-none`}
                >
                  {link.label}
                  {link.hint && (
                    <small className="mt-0.5 block text-[0.8rem] font-medium text-muted group-hover/link:text-black group-focus-visible/link:text-black">
                      {link.hint}
                    </small>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {panel.translations && (
        <p className="col-span-full mt-1 border-t border-white/15 pt-3.5 text-[0.85rem] text-muted nav:mt-4">
          Docs are also available in{" "}
          {panel.translations.map((link, index) => (
            <span key={link.href}>
              <a href={link.href} className="font-semibold text-pumpkin underline underline-offset-3 hover:text-fg">
                {link.label}
              </a>
              {index < panel.translations!.length - 2 ? ", " : index === panel.translations!.length - 2 ? " and " : "."}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function LanguageSwitcher() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <>
      <div
        role="radiogroup"
        aria-label={t.nav.language}
        className="grid w-full grid-cols-4 border-2 border-white/15 nav:hidden"
      >
        {(Object.keys(languages) as Lang[]).map((code) => (
          <button
            key={code}
            type="button"
            role="radio"
            lang={code}
            title={languages[code]}
            aria-checked={code === lang}
            onClick={() => setLang(code)}
            className={`cursor-pointer border-white/15 py-2.5 text-sm font-bold uppercase not-last:border-r-2 ${
              code === lang ? "bg-pumpkin text-black" : "text-muted hover:text-fg"
            }`}
          >
            {code}
          </button>
        ))}
      </div>
      <div ref={ref} className="relative hidden nav:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.nav.language}: ${languages[lang]}`}
        onClick={() => setOpen((value) => !value)}
        className={`${squareButton} cursor-pointer gap-1.5 px-2.5 text-[0.85rem] font-bold uppercase`}
      >
        <GlobeIcon className="size-4" />
        {lang}
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute top-full right-0 z-30 mt-2 min-w-40 border-3 border-pumpkin bg-surface brutal-4"
        >
          {(Object.keys(languages) as Lang[]).map((code) => (
            <li key={code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={code === lang}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={`block w-full cursor-pointer border-b border-white/10 px-4 py-2.5 text-left text-[0.9rem] font-semibold last:border-b-0 hover:bg-pumpkin hover:text-black ${code === lang ? "bg-pumpkin text-black" : "text-fg"}`}
              >
                {languages[code]} ({code.toUpperCase()})
              </button>
            </li>
          ))}
        </ul>
      )}
      </div>
    </>
  );
}

export function Header() {
  const { t } = useI18n();
  const [openId, setOpenId] = useState<MenuPanel["id"] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    function closeEverything() {
      setOpenId(null);
      setDrawerOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) closeEverything();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeEverything();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  function hoverOpen(id: MenuPanel["id"]) {
    if (!isDesktop()) return;
    window.clearTimeout(closeTimer.current);
    setOpenId(id);
  }

  function hoverClose(id: MenuPanel["id"]) {
    if (!isDesktop()) return;
    closeTimer.current = window.setTimeout(() => {
      setOpenId((current) => (current === id ? null : current));
    }, CLOSE_DELAY_MS);
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-100 border-b-3 border-pumpkin bg-surface text-fg"
    >
      <div className="mx-auto flex max-w-325 flex-wrap items-center gap-2 px-4 py-3 nav:flex-nowrap nav:px-8 nav:py-3.5">
        <a href={withBase("/")} className="flex items-center gap-2 text-xl font-extrabold nav:mr-4 nav:text-2xl">
          <img src={withBase("/assets/icon.svg")} alt="" className="size-8 nav:size-10" />
          <span>Pumpkin</span>
        </a>

        <button
          type="button"
          aria-label={t.nav.menu}
          aria-expanded={drawerOpen}
          aria-controls="site-drawer"
          onClick={() => {
            setDrawerOpen((value) => !value);
            setOpenId(null);
          }}
          className="ml-auto inline-flex size-10.5 cursor-pointer items-center justify-center border-3 border-fg bg-ink nav:hidden"
        >
          {drawerOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>

        <div
          id="site-drawer"
          className={`${drawerOpen ? "block" : "hidden"} absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b-3 border-pumpkin bg-surface px-4 pb-4 shadow-[0_12px_0_rgb(0_0_0/0.35)] nav:contents`}
        >
          <nav aria-label="Main" className="flex w-full flex-col nav:w-auto nav:flex-row nav:items-stretch nav:gap-1">
            {menuPanels.map((panel) => {
              const open = openId === panel.id;
              return (
                <div
                  key={panel.id}
                  className="relative border-b border-white/8 nav:border-0"
                  onMouseEnter={() => hoverOpen(panel.id)}
                  onMouseLeave={() => hoverClose(panel.id)}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId((current) => (current === panel.id ? null : panel.id))}
                    className={`${triggerBase} ${open ? "text-fg nav:after:w-[calc(100%-2rem)]" : "text-muted nav:after:w-0"}`}
                  >
                    {t.nav[panel.id]}
                    <ChevronDownIcon className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <Panel panel={panel} open={open} />
                </div>
              );
            })}
            <div className="relative border-b border-white/8 nav:border-0">
              <a href="/tracker/" className={`${triggerBase} text-muted nav:after:w-0`}>
                {t.nav.tracker}
              </a>
            </div>
            <div className="relative nav:border-0">
              <a href={MARKET_URL} className={`${triggerBase} text-muted nav:after:w-0`}>
                {t.nav.market}
                <ExternalIcon className="size-3 opacity-70" />
              </a>
            </div>
          </nav>

          <div className="flex w-full flex-wrap items-center justify-center gap-2 pt-4 pb-1 nav:ml-auto nav:w-auto nav:p-0">
            <LanguageSwitcher />
            <a href={GITHUB_URL} aria-label="GitHub" className={`${squareButton} w-10.5`}>
              <GitHubIcon className="size-5" />
            </a>
            <a
              href={withBase("/download/")}
              className="inline-flex h-10.5 items-center border-3 border-pumpkin bg-pumpkin px-5 text-[0.95rem] font-bold text-black transition duration-100 nav:brutal-3 nav:hover:brutal-5 nav:hover:-translate-0.5"
            >
              {t.nav.download}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
