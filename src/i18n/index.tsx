import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "./locales/en_us.json";

export const languages = {
  en_us: "English",
  de_de: "Deutsch",
  fr_fr: "Français",
  es_es: "Español",
  vi_vn: "Tiếng Việt",
  zh_cn: "简体中文",
  zh_hk: "繁體中文（香港）",
  zh_tw: "繁體中文（台灣）",
} as const;

export type Lang = keyof typeof languages;
export type Messages = typeof en;

/** Converts an internal language key such as "zh_cn" to a BCP-47 tag such as "zh-CN". */
export function languageTag(lang: Lang): string {
  const [language, region] = lang.split("_");
  return `${language}-${region.toUpperCase()}`;
}

/**
 * Returns the short uppercase code the language switcher shows: the bare
 * language when it has a single variant, the full tag when several regions
 * share it ("ZH-CN", "ZH-HK", "ZH-TW").
 */
export function languageCode(lang: Lang): string {
  const language = lang.split("_")[0];
  const variants = (Object.keys(languages) as Lang[]).filter((code) => code.split("_")[0] === language);
  return (variants.length > 1 ? languageTag(lang) : language).toUpperCase();
}

interface I18nValue {
  lang: Lang;
  t: Messages;
  setLang: (lang: Lang) => void;
}

const STORAGE_KEY = "pumpkin_lang";

const loaders = import.meta.glob<unknown>(["./locales/*.json", "!./locales/en_us.json"], { import: "default" });

const I18nContext = createContext<I18nValue>({ lang: "en_us", t: en, setLang: () => {} });

function isLang(value: string | null | undefined): value is Lang {
  return value != null && Object.hasOwn(languages, value);
}

/**
 * Resolves a stored or browser language tag to a supported language.
 * Accepts full tags ("zh-CN"), bare language names ("zh"), legacy short
 * codes and script subtags ("zh-Hant"), falling back to the closest match.
 */
function resolveLang(value: string | null | undefined): Lang | undefined {
  const code = value?.toLowerCase().replaceAll("-", "_");
  if (isLang(code)) return code;
  const [language, ...subtags] = code?.split("_") ?? [];
  if (language === "zh") {
    const hant = subtags.some((subtag) => subtag.startsWith("hant"));
    const hans = subtags.some((subtag) => subtag.startsWith("hans"));
    if (hant) return subtags.includes("hk") ? "zh_hk" : "zh_tw";
    if (hans) return "zh_cn";
    if (subtags.includes("hk")) return "zh_hk";
    if (subtags.some((subtag) => subtag === "tw" || subtag === "mo")) return "zh_tw";
  }
  return (Object.keys(languages) as Lang[]).find((lang) => lang.split("_")[0] === language);
}

/** Detects the initial language from the saved preference or the browser, defaulting to English. */
function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang = resolveLang(saved);
    if (lang) {
      if (saved !== lang) saveLang(lang);
      return lang;
    }
  } catch {}
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const lang = resolveLang(tag);
    if (lang) return lang;
  }
  return "en_us";
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

/** Provides the active language, its messages and a setter to the whole app. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en_us");
  const [t, setT] = useState<Messages>(en);

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = languageTag(lang);
    if (lang === "en_us") {
      setT(en);
      return;
    }
    let cancelled = false;
    loaders[`./locales/${lang}.json`]?.()
      .then((messages) => {
        if (!cancelled) setT(merge(en, messages) as Messages);
      })
      .catch(() => {
        if (!cancelled) setLangState("en_us");
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
