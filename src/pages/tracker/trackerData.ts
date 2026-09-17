import raw from "./data.json";
import { STATUS_ORDER, type Category, type Entry, type Status, type TrackerData } from "./types";

type RawEntry = Omit<Entry, "cat" | "catLabel" | "status"> & { status: string };
type RawCategory = Omit<Category, "entries"> & { entries: RawEntry[] };
type RawData = Omit<TrackerData, "categories" | "all"> & { categories: RawCategory[] };

function toStatus(value: string): Status {
  return (STATUS_ORDER as string[]).includes(value) ? (value as Status) : "planned";
}

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
      label: "All",
      unit: "entries",
      description: "Every tracked entry across all categories.",
      entries: categories.flatMap((category) => category.entries),
    },
  };
}

export const trackerData: TrackerData = annotate(raw as RawData);
