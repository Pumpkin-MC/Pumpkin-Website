import type { Messages } from "../../i18n";

export type Support = "yes" | "partial" | "no";

export const columns = ["Pumpkin", "Vanilla", "Spigot/Paper", "Folia"] as const;

export interface ChecklistRow {
  id: keyof Messages["checklist"]["items"];
  feature: string;
  detail: string;
  support: [Support, Support, Support, Support];
  notes: Partial<Record<number, string>>;
}

export function getChecklist(t: Messages): ChecklistRow[] {
  return [
    {
      id: "startup",
      ...t.checklist.items.startup,
      support: ["yes", "no", "no", "no"],
    },
    {
      id: "idleCpu",
      ...t.checklist.items.idleCpu,
      support: ["yes", "no", "no", "no"],
    },
    {
      id: "memory",
      ...t.checklist.items.memory,
      support: ["yes", "no", "no", "no"],
    },
    {
      id: "parallel",
      ...t.checklist.items.parallel,
      support: ["yes", "no", "no", "partial"],
    },
    {
      id: "bukkitPlugins",
      ...t.checklist.items.bukkitPlugins,
      support: ["partial", "no", "yes", "partial"],
    },
    {
      id: "editions",
      ...t.checklist.items.editions,
      support: ["yes", "no", "partial", "partial"],
    },
    {
      id: "pluginLanguages",
      ...t.checklist.items.pluginLanguages,
      support: ["yes", "no", "no", "no"],
    },
    {
      id: "configuration",
      ...t.checklist.items.configuration,
      support: ["yes", "no", "no", "no"],
    },
    {
      id: "openSource",
      ...t.checklist.items.openSource,
      support: ["yes", "no", "partial", "partial"],
    },
    {
      id: "worldFormats",
      ...t.checklist.items.worldFormats,
      support: ["yes", "no", "no", "no"],
    },
    {
      id: "executable",
      ...t.checklist.items.executable,
      support: ["yes", "no", "no", "no"],
    },
  ];
}
