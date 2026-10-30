import type { Messages } from "../../i18n";
import en from "../../i18n/locales/en_us.json";
import raw from "./data.json";
import { STATUS_ORDER, type Category, type Entry, type Status, type TrackerData } from "./types";

type RawEntry = Omit<Entry, "cat" | "catLabel" | "groupLabel" | "status"> & { status: string };
type RawCategory = Omit<Category, "entries"> & { entries: RawEntry[] };
type RawData = Omit<TrackerData, "categories" | "all"> & { categories: RawCategory[] };

function toStatus(value: string): Status {
  return (STATUS_ORDER as string[]).includes(value) ? (value as Status) : "planned";
}

/** Annotates raw tracker data: normalizes statuses and fills the "all" pseudo-category. */
function annotate(data: RawData): TrackerData {
  const categories: Category[] = data.categories.map((category) => ({
    ...category,
    entries: category.entries.map((entry) => ({ ...entry, status: toStatus(entry.status), cat: category.id, catLabel: category.label })),
  }));
  return {
    ...data,
    categories,
    all: {
      id: "all",
      ...en.tracker.categories.all,
      entries: categories.flatMap((category) => category.entries),
    },
  };
}

export const trackerData: TrackerData = annotate(raw as RawData);

/**
 * Creates a lookup that maps English source texts to their translations for
 * one message group, keeping the source text when no translation exists.
 */
function textLookup(source: Record<string, string>, messages: Record<string, string>): (text: string) => string {
  const translations = new Map(Object.entries(source).map(([key, text]) => [text, messages[key] ?? text]));
  return (text) => translations.get(text) ?? text;
}

/**
 * Returns the tracker data with every user-facing text translated into the
 * current language. Strings are matched against the English source text, so
 * entries the catalog does not know yet stay in English instead of being
 * mistranslated.
 */
export function getTrackerData(t: Messages): TrackerData {
  const source = en.tracker;
  const messages = t.tracker;
  const groups = textLookup(source.groups, messages.groups);
  const notes = textLookup(source.notes, messages.notes);
  const items = textLookup(source.items, messages.items);
  const sourceEntries: Record<string, Record<string, string>> = source.entries;
  const translatedEntries: Record<string, Record<string, string>> = messages.entries;
  const sourceCategories: Record<string, Pick<Category, "label" | "unit" | "description">> = source.categories;
  const translatedCategories: typeof sourceCategories = messages.categories;

  function categoryText(category: Category): Pick<Category, "label" | "unit" | "description"> {
    const original = sourceCategories[category.id];
    const translated = translatedCategories[category.id];
    return {
      label: original?.label === category.label ? (translated?.label ?? category.label) : category.label,
      unit: original?.unit === category.unit ? (translated?.unit ?? category.unit) : category.unit,
      description: original?.description === category.description ? (translated?.description ?? category.description) : category.description,
    };
  }

  const categories = trackerData.categories.map((category) => {
    const text = categoryText(category);
    return {
      ...category,
      ...text,
      entries: category.entries.map((entry) => ({
        ...entry,
        // Generated text can change before the catalog is updated. Keep the new source text in that case.
        name: sourceEntries[category.id]?.[entry.id] === entry.name ? (translatedEntries[category.id]?.[entry.id] ?? entry.name) : entry.name,
        catLabel: text.label,
        groupLabel: entry.group === undefined ? undefined : groups(entry.group),
        note: entry.note === undefined ? undefined : notes(entry.note),
        items: entry.items?.map((item) => ({ ...item, text: items(item.text) })),
      })),
    };
  });

  return {
    ...trackerData,
    categories,
    all: {
      ...trackerData.all,
      ...categoryText(trackerData.all),
      entries: categories.flatMap((category) => category.entries),
    },
  };
}
