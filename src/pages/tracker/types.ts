export type Status = "done" | "partial" | "planned";
export type Filter = Status | "all";

export interface Item {
  text: string;
  done: boolean;
}

export interface Issue {
  number: number;
  title?: string;
  state?: "open" | "closed" | "merged";
  pr?: boolean;
}

export interface Entry {
  id: string;
  name: string;
  group?: string;
  status: Status;
  note?: string;
  items?: Item[];
  source?: string;
  issues?: Issue[];
  ids?: string[];
  cat: string;
  catLabel: string;
}

export interface Category {
  id: string;
  label: string;
  unit?: string;
  tracking?: number;
  description?: string;
  entries: Entry[];
}

export interface TrackerData {
  version: string;
  commit: string;
  updated: string;
  categories: Category[];
  all: Category;
}

export const STATUS: Record<Status, { label: string; glyph: string; text: string; bg: string }> = {
  done: { label: "Implemented", glyph: "✓", text: "text-success", bg: "bg-success" },
  partial: { label: "Partial", glyph: "!", text: "text-warning", bg: "bg-warning" },
  planned: { label: "Planned", glyph: "✕", text: "text-fg", bg: "bg-fg" },
};

export const STATUS_ORDER: Status[] = ["done", "partial", "planned"];

export function entryKey(entry: Entry): string {
  return `${entry.cat}:${entry.id}`;
}

export function counts(entries: Entry[]): Record<Status, number> {
  const result: Record<Status, number> = { done: 0, partial: 0, planned: 0 };
  for (const entry of entries) result[entry.status] += 1;
  return result;
}

export function pct(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}
