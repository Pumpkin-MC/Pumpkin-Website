import type { snippets } from "./snippets.ts";

export type SnippetName = keyof typeof snippets;

export type SnippetLanguage = "java" | "rust" | "toml" | "python" | "csharp" | "c" | "go" | "kotlin" | "shellscript" | "text";

export const snippetLanguages: Record<SnippetName, SnippetLanguage> = {
  javaReflection: "java",
  rustNative: "rust",
  rustTarget: "shellscript",
  rustNewCrate: "shellscript",
  rustCargoConfig: "toml",
  rustTree: "text",
  rustManifest: "toml",
  rustManifestWithDeps: "toml",
  pythonInstall: "shellscript",
  pythonPlugin: "python",
  pythonBuild: "shellscript",
  csharpInstall: "shellscript",
  csharpPlugin: "csharp",
  csharpBuild: "shellscript",
  cPlugin: "c",
  cBuild: "shellscript",
  goInstall: "shellscript",
  goPlugin: "go",
  goBuild: "shellscript",
  kotlinClone: "shellscript",
  kotlinPlugin: "kotlin",
  kotlinBuild: "shellscript",
};
