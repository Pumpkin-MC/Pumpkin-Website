export type Support = "yes" | "partial" | "no";

export const columns = ["Pumpkin", "Vanilla", "Spigot/Paper", "Folia"] as const;

export interface ChecklistRow {
  feature: string;
  detail: string;
  support: [Support, Support, Support, Support];
  notes: Partial<Record<number, string>>;
}

export const checklist: ChecklistRow[] = [
  {
    feature: "Starts in under a second",
    detail: "Ready before a JVM has finished warming up.",
    support: ["yes", "no", "no", "no"],
    notes: {
      1: "Vanilla waits on JVM start-up and world loading.",
      3: "Often slower than Paper, there is more to initialize.",
    },
  },
  {
    feature: "Low CPU at idle",
    detail: "Sits near zero when nobody is online.",
    support: ["yes", "no", "no", "no"],
    notes: {},
  },
  {
    feature: "Low memory",
    detail: "About 100 MB with a world loaded.",
    support: ["yes", "no", "no", "no"],
    notes: {},
  },
  {
    feature: "Uses every core",
    detail: "Parallel by design, not one main thread.",
    support: ["yes", "no", "no", "partial"],
    notes: {
      0: "Game logic and background tasks run across threads, not only chunk loading.",
      3: "Only ticking is parallel.",
    },
  },
  {
    feature: "Bukkit and Paper plugins",
    detail: "Early, through PatchBukkit. Expect gaps.",
    support: ["partial", "no", "yes", "partial"],
    notes: {
      0: "Pumpkin has its own API. Bukkit and Paper plugins can run through PatchBukkit, which is early.",
      2: "Native.",
      3: "Varies. Many plugins need updates for Folia's threading.",
    },
  },
  {
    feature: "Java and Bedrock players",
    detail: "Both editions on one world, no proxy.",
    support: ["yes", "no", "partial", "partial"],
    notes: {
      0: "Built in.",
      2: "Through an external plugin such as Geyser.",
      3: "Through external plugins, and Folia's threading makes setup harder.",
    },
  },
  {
    feature: "Plugin API in 8 languages",
    detail: "Rust, Kotlin, Python, Go, C#, C, D, TypeScript.",
    support: ["yes", "no", "no", "no"],
    notes: {},
  },
  {
    feature: "Fine-grained configuration",
    detail: "Every subsystem has its own config file.",
    support: ["yes", "no", "no", "no"],
    notes: {},
  },
  {
    feature: "Open source",
    detail: "GPL-3.0, the whole server.",
    support: ["yes", "no", "partial", "partial"],
    notes: {
      2: "Only the patches are open source.",
      3: "Only the patches are open source.",
    },
  },
  {
    feature: "Multiple world formats",
    detail: "Anvil and more efficient alternatives.",
    support: ["yes", "no", "no", "no"],
    notes: {
      3: "Anvil only.",
    },
  },
  {
    feature: "Single executable, no Java",
    detail: "Download, run, done.",
    support: ["yes", "no", "no", "no"],
    notes: {},
  },
];
