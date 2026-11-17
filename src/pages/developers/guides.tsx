import type { ReactNode } from "react";
import type { Messages } from "../../i18n";
import { rich, type RichTags } from "../../i18n/rich";
import { DOCS_URL } from "../../links";
import type { CodeSample } from "./CodeBlock";
import type { SnippetName } from "./snippet-languages";

export const GUIDE_IDS = ["rust", "python", "csharp", "c", "go", "kotlin", "d", "zig", "typescript"] as const;

export type GuideId = (typeof GUIDE_IDS)[number];

export type StepContent = ReactNode | CodeSample;

export interface GuideStep {
  title: string;
  content: StepContent[];
}

export interface Guide {
  id: GuideId;
  label: string;
  docsHref: string;
  docsLabel: string;
  intro?: ReactNode;
  steps: GuideStep[];
}

export function isCodeSample(content: StepContent): content is CodeSample {
  return typeof content === "object" && content !== null && "snippet" in content && typeof content.snippet === "string";
}

function Code({ children }: { children: ReactNode }) {
  return <code className="border border-white/15 bg-ink px-1.5 py-0.5 font-mono text-[0.9em] text-fg">{children}</code>;
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-semibold text-pumpkin underline underline-offset-3 hover:text-fg">
      {children}
    </a>
  );
}

/**
 * Renders inline markup of a translated paragraph: <code> becomes an inline
 * code tag, every other tag name is looked up in the link targets.
 */
function body(text: string, links: Record<string, string> = {}): ReactNode {
  const tags: RichTags = { code: (children) => <Code>{children}</Code> };
  for (const [tag, href] of Object.entries(links)) {
    tags[tag] = (children) => <Link href={href}>{children}</Link>;
  }
  return rich(text, tags);
}

const RUST_TEMPLATE_URL = "https://github.com/Pumpkin-MC/pumpkin-rust-template";
const WASI_SDK_URL = "https://github.com/WebAssembly/wasi-sdk/releases";
const API_C_URL = "https://github.com/Pumpkin-MC/pumpkin-api-c";
const GO_URL = "https://go.dev/doc/install";
const RUST_URL = "https://rust-lang.org/";
const WASM_TOOLS_URL = "https://github.com/bytecodealliance/wasm-tools";
const GNU_MAKE_URL = "https://www.gnu.org/software/make/";
const LDC_URL = "https://github.com/ldc-developers/ldc";
const DUB_URL = "https://dub.pm/";
const API_D_URL = "https://github.com/Pumpkin-MC/pumpkin-api-d";
const ZIG_URL = "https://ziglang.org/download/";
const API_ZIG_URL = "https://github.com/Pumpkin-MC/pumpkin-api-zig";
const API_TS_URL = "https://github.com/Pumpkin-MC/pumpkin-api-ts";

/** Builds the per-language plugin guides for the current language. */
export function getGuides(t: Messages): Guide[] {
  const text = t.developers.guides;
  const terminal = (snippet: SnippetName): CodeSample => ({ snippet, label: text.terminal });

  return [
    {
      id: "rust",
      label: "Rust",
      docsHref: `${DOCS_URL}/plugin-dev/rust/creating-project`,
      docsLabel: text.rust.docsLabel,
      steps: [
        {
          title: text.rust.steps.create,
          content: [
            <p key="build">{text.rust.text.build}</p>,
            <p key="template">{body(text.rust.text.template, { template: RUST_TEMPLATE_URL })}</p>,
          ],
        },
        {
          title: text.rust.steps.toolchain,
          content: [
            <p key="target">{body(text.rust.text.target)}</p>,
            terminal("rustTarget"),
          ],
        },
        {
          title: text.rust.steps.crate,
          content: [
            <p key="folder">{text.rust.text.folder}</p>,
            terminal("rustNewCrate"),
            <p key="cargo">{body(text.rust.text.cargo)}</p>,
            { snippet: "rustCargoConfig", label: ".cargo/config.toml" },
            <p key="tree">{text.rust.text.tree}</p>,
            { snippet: "rustTree", label: text.projectLayout },
          ],
        },
        {
          title: text.rust.steps.configure,
          content: [
            <p key="cdylib">{text.rust.text.cdylib}</p>,
            { snippet: "rustManifest", label: "Cargo.toml" },
            <p key="deps">{text.rust.text.deps}</p>,
            { snippet: "rustManifestWithDeps", label: "Cargo.toml" },
          ],
        },
      ],
    },
    {
      id: "python",
      label: "Python",
      docsHref: `${DOCS_URL}/plugin-dev/python/quick-start`,
      docsLabel: text.python.docsLabel,
      steps: [
        {
          title: text.python.steps.install,
          content: [
            <p key="install">{body(text.python.text.install)}</p>,
            terminal("pythonInstall"),
          ],
        },
        {
          title: text.python.steps.create,
          content: [
            <p key="file">{body(text.python.text.file)}</p>,
            { snippet: "pythonPlugin", label: "main.py" },
          ],
        },
        {
          title: text.python.steps.build,
          content: [
            <p key="build">{text.python.text.build}</p>,
            terminal("pythonBuild"),
            <p key="output">{body(text.python.text.output)}</p>,
          ],
        },
      ],
    },
    {
      id: "csharp",
      label: "C#",
      docsHref: `${DOCS_URL}/plugin-dev/csharp/quick-start`,
      docsLabel: text.csharp.docsLabel,
      steps: [
        {
          title: text.csharp.steps.install,
          content: [
            <p key="sdk">{body(text.csharp.text.sdk)}</p>,
            terminal("csharpInstall"),
          ],
        },
        {
          title: text.csharp.steps.create,
          content: [
            <p key="library">{text.csharp.text.library}</p>,
            { snippet: "csharpPlugin", label: "MyPlugin.cs" },
          ],
        },
        {
          title: text.csharp.steps.build,
          content: [
            <p key="build">{text.csharp.text.build}</p>,
            terminal("csharpBuild"),
            <p key="output">{body(text.csharp.text.output)}</p>,
          ],
        },
      ],
    },
    {
      id: "c",
      label: "C/C++",
      docsHref: API_C_URL,
      docsLabel: text.c.docsLabel,
      steps: [
        {
          title: text.c.steps.install,
          content: [
            <p key="sdk">{body(text.c.text.sdk, { sdk: WASI_SDK_URL })}</p>,
            <p key="repo">{body(text.c.text.repo, { repo: API_C_URL })}</p>,
          ],
        },
        {
          title: text.c.steps.create,
          content: [
            <p key="file">{body(text.c.text.file)}</p>,
            { snippet: "cPlugin", label: "main.c" },
          ],
        },
        {
          title: text.c.steps.build,
          content: [
            <p key="clang">{body(text.c.text.clang)}</p>,
            terminal("cBuild"),
            <p key="output">{body(text.c.text.output)}</p>,
          ],
        },
      ],
    },
    {
      id: "go",
      label: "Go",
      docsHref: `${DOCS_URL}/plugin-dev/go/quick-start`,
      docsLabel: text.go.docsLabel,
      steps: [
        {
          title: text.go.steps.install,
          content: [
            <p key="tools">{body(text.go.text.tools, { go: GO_URL })}</p>,
            terminal("goInstall"),
          ],
        },
        {
          title: text.go.steps.create,
          content: [
            <p key="file">{body(text.go.text.file)}</p>,
            { snippet: "goPlugin", label: "main.go" },
          ],
        },
        {
          title: text.go.steps.build,
          content: [
            <p key="build">{body(text.go.text.build)}</p>,
            terminal("goBuild"),
            <p key="output">{body(text.go.text.output)}</p>,
          ],
        },
      ],
    },
    {
      id: "kotlin",
      label: "Kotlin",
      docsHref: `${DOCS_URL}/plugin-dev/kotlin/quick-start`,
      docsLabel: text.kotlin.docsLabel,
      steps: [
        {
          title: text.kotlin.steps.install,
          content: [
            <p key="needs">{text.kotlin.text.needs}</p>,
            <ul key="list" className="grid list-inside list-disc gap-1 marker:text-pumpkin">
              <li>Git</li>
              <li>JDK 17+</li>
              <li>{body(text.kotlin.text.rust, { rust: RUST_URL })}</li>
              <li>{body(text.kotlin.text.wasmTools, { tools: WASM_TOOLS_URL })}</li>
              <li>{body(text.kotlin.text.make, { make: GNU_MAKE_URL })}</li>
            </ul>,
            <p key="template">{text.kotlin.text.template}</p>,
            terminal("kotlinClone"),
            <p key="rename">{body(text.kotlin.text.rename)}</p>,
          ],
        },
        {
          title: text.kotlin.steps.create,
          content: [
            <p key="prepared">{body(text.kotlin.text.prepared)}</p>,
            { snippet: "kotlinPlugin", label: "Plugin.kt" },
          ],
        },
        {
          title: text.kotlin.steps.build,
          content: [
            <p key="make">{body(text.kotlin.text.makeCommand)}</p>,
            terminal("kotlinBuild"),
            <p key="slow">{text.kotlin.text.slow}</p>,
            <p key="output">{body(text.kotlin.text.output)}</p>,
          ],
        },
      ],
    },
    {
      id: "d",
      label: "D",
      docsHref: `${DOCS_URL}/plugin-dev/d/quick-start`,
      docsLabel: text.d.docsLabel,
      steps: [
        {
          title: text.d.steps.install,
          content: [
            <p key="needs">{body(text.d.text.needs, { ldc: LDC_URL, dub: DUB_URL })}</p>,
            <p key="package">{body(text.d.text.package, { api: API_D_URL })}</p>,
            { snippet: "dManifest", label: "dub.json" },
          ],
        },
        {
          title: text.d.steps.create,
          content: [
            <p key="source">{body(text.d.text.source)}</p>,
            { snippet: "dPlugin", label: "app.d" },
          ],
        },
        {
          title: text.d.steps.build,
          content: [
            <p key="dub">{body(text.d.text.dub)}</p>,
            terminal("dBuild"),
            <p key="output">{body(text.d.text.output)}</p>,
          ],
        },
      ],
    },
    {
      id: "zig",
      label: "Zig",
      docsHref: `${DOCS_URL}/plugin-dev/zig/quick-start`,
      docsLabel: text.zig.docsLabel,
      steps: [
        {
          title: text.zig.steps.install,
          content: [
            <p key="needs">{body(text.zig.text.needs, { zig: ZIG_URL, tools: WASM_TOOLS_URL })}</p>,
            <p key="fetch">{body(text.zig.text.fetch, { api: API_ZIG_URL })}</p>,
            terminal("zigFetch"),
            <p key="build-zig">{body(text.zig.text.buildFile)}</p>,
            { snippet: "zigBuildZig", label: "build.zig" },
          ],
        },
        {
          title: text.zig.steps.create,
          content: [
            <p key="source">{body(text.zig.text.source)}</p>,
            { snippet: "zigPlugin", label: "src/main.zig" },
          ],
        },
        {
          title: text.zig.steps.build,
          content: [
            <p key="build">{text.zig.text.build}</p>,
            terminal("zigBuild"),
            <p key="output">{body(text.zig.text.output)}</p>,
          ],
        },
      ],
    },
    {
      id: "typescript",
      label: "TypeScript",
      docsHref: API_TS_URL,
      docsLabel: text.typescript.docsLabel,
      intro: <p>{body(text.typescript.intro, { repo: API_TS_URL })}</p>,
      steps: [],
    },
  ];
}

/**
 * Returns either the first command of a guide or an explanatory note, for the
 * inline picker on the developers page.
 */
export function getFirstSteps(t: Messages): Record<GuideId, { snippet: SnippetName } | { note: ReactNode }> {
  const text = t.developers.guides;

  return {
    rust: { snippet: "rustTarget" },
    python: { snippet: "pythonInstall" },
    csharp: { snippet: "csharpInstall" },
    c: { note: <>{body(text.firstSteps.c, { sdk: WASI_SDK_URL })}</> },
    go: { snippet: "goInstall" },
    kotlin: { snippet: "kotlinClone" },
    d: { note: <>{body(text.firstSteps.d, { ldc: LDC_URL, dub: DUB_URL })}</> },
    zig: { snippet: "zigFetch" },
    typescript: { note: <>{body(text.firstSteps.typescript, { api: API_TS_URL })}</> },
  };
}
