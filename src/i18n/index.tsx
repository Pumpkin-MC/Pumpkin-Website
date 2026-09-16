import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "./locales/en.json";

export const languages = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
} as const;

export type Lang = keyof typeof languages;
export type Messages = typeof en;

interface I18nValue {
  lang: Lang;
  t: Messages;
  setLang: (lang: Lang) => void;
}

const STORAGE_KEY = "pumpkin_lang";

const loaders = import.meta.glob<unknown>(["./locales/*.json", "!./locales/en.json"], { import: "default" });

const I18nContext = createContext<I18nValue>({ lang: "en", t: en, setLang: () => {} });

function isLang(value: string | null | undefined): value is Lang {
  return value != null && Object.hasOwn(languages, value);
}

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    return "en";
  }
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const code = tag?.toLowerCase().split("-")[0];
    if (isLang(code)) return code;
  }
  return "en";
}

function saveLang(lang: Lang): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    return true;
  } catch {
    return false;
  }
}

function merge(base: unknown, override: unknown): unknown {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    const items = Array.isArray(override) ? override : [];
    return base.map((item, index) => merge(item, items[index]));
  }
  if (typeof base === "object" && base !== null) {
    const source = typeof override === "object" ? (override as Record<string, unknown>) : {};
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [key, merge(value, source[key])]),
    );
  }
  return typeof override === typeof base ? override : base;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [t, setT] = useState<Messages>(en);

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === "en") {
      setT(en);
      return;
    }
    let cancelled = false;
    loaders[`./locales/${lang}.json`]?.().then((messages) => {
      if (!cancelled) setT(merge(en, messages) as Messages);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t,
      setLang: (next) => {
        saveLang(next);
        setLangState(next);
      },
    }),
    [lang, t],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
