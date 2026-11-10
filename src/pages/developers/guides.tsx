import type { ReactNode } from "react";
import type { Messages } from "../../i18n";
import { rich } from "../../i18n/rich";
import type { CodeSample } from "./CodeBlock";
import type { SnippetName } from "./snippet-languages";
import { DOCS_URL } from "../../links";

export type GuideId = "rust" | "python" | "csharp" | "c" | "go" | "kotlin" | "d" | "zig" | "typescript";

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

export const guideIds: GuideId[] = ["rust", "python", "csharp", "c", "go", "kotlin", "d", "zig", "typescript"];

export function createGuides(t: Messages["developersPage"]): Guide[] {
  const terminal = (snippet: SnippetName): CodeSample => ({ snippet, label: t.code.terminal });
  return [
    {
      id: "rust",
      label: "Rust",
      docsHref: `${DOCS_URL}/plugin-dev/rust/creating-project`,
      docsLabel: t.guides.rust.docsLabel,
      steps: [
        {
          title: t.guides.rust.titles[0],
          content: [
            <p key="build">{t.guides.rust.text["build"]}</p>,
            <p key="template">{rich(t.guides.rust.text["template"], { link0: (children) => <Link href="https://github.com/Pumpkin-MC/pumpkin-rust-template">{children}</Link> })}</p>,
          ],
        },
        {
          title: t.guides.rust.titles[1],
          content: [
            <p key="target">{rich(t.guides.rust.text["target"], { code0: (children) => <Code>{children}</Code> })}</p>,
            terminal("rustTarget"),
          ],
        },
        {
          title: t.guides.rust.titles[2],
          content: [
            <p key="folder">{t.guides.rust.text["folder"]}</p>,
            terminal("rustNewCrate"),
            <p key="cargo">{rich(t.guides.rust.text["cargo"], { code0: (children) => <Code>{children}</Code>, code1: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "rustCargoConfig", label: ".cargo/config.toml" },
            <p key="tree">{t.guides.rust.text["tree"]}</p>,
            { snippet: "rustTree", label: t.code.projectLayout },
          ],
        },
        {
          title: t.guides.rust.titles[3],
          content: [
            <p key="cdylib">{t.guides.rust.text["cdylib"]}</p>,
            { snippet: "rustManifest", label: "Cargo.toml" },
            <p key="deps">{t.guides.rust.text["deps"]}</p>,
            { snippet: "rustManifestWithDeps", label: "Cargo.toml" },
          ],
        },
      ],
    },
    {
      id: "python",
      label: "Python",
      docsHref: `${DOCS_URL}/plugin-dev/python/quick-start`,
      docsLabel: t.guides.python.docsLabel,
      steps: [
        {
          title: t.guides.python.titles[0],
          content: [
            <p key="install">{rich(t.guides.python.text["install"], { code0: (children) => <Code>{children}</Code> })}</p>,
            terminal("pythonInstall"),
          ],
        },
        {
          title: t.guides.python.titles[1],
          content: [
            <p key="file">{rich(t.guides.python.text["file"], { code0: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "pythonPlugin", label: "main.py" },
          ],
        },
        {
          title: t.guides.python.titles[2],
          content: [
            <p key="build">{t.guides.python.text["build"]}</p>,
            terminal("pythonBuild"),
            <p key="output">{rich(t.guides.python.text["output"], { code0: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
      ],
    },
    {
      id: "csharp",
      label: "C#",
      docsHref: `${DOCS_URL}/plugin-dev/csharp/quick-start`,
      docsLabel: t.guides.csharp.docsLabel,
      steps: [
        {
          title: t.guides.csharp.titles[0],
          content: [
            <p key="sdk">{rich(t.guides.csharp.text["sdk"], { code0: (children) => <Code>{children}</Code> })}</p>,
            terminal("csharpInstall"),
          ],
        },
        {
          title: t.guides.csharp.titles[1],
          content: [
            <p key="library">{t.guides.csharp.text["library"]}</p>,
            { snippet: "csharpPlugin", label: "MyPlugin.cs" },
          ],
        },
        {
          title: t.guides.csharp.titles[2],
          content: [
            <p key="build">{t.guides.csharp.text["build"]}</p>,
            terminal("csharpBuild"),
            <p key="output">{rich(t.guides.csharp.text["output"], { code0: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
      ],
    },
    {
      id: "c",
      label: "C/C++",
      docsHref: "https://github.com/Pumpkin-MC/pumpkin-api-c",
      docsLabel: t.guides.c.docsLabel,
      steps: [
        {
          title: t.guides.c.titles[0],
          content: [
            <p key="sdk">{rich(t.guides.c.text["sdk"], { code0: (children) => <Code>{children}</Code>, link1: (children) => <Link href="https://github.com/WebAssembly/wasi-sdk/releases">{children}</Link> })}</p>,
            <p key="repo">{rich(t.guides.c.text["repo"], { link0: (children) => <Link href="https://github.com/Pumpkin-MC/pumpkin-api-c">{children}</Link> })}</p>,
          ],
        },
        {
          title: t.guides.c.titles[1],
          content: [
            <p key="file">{rich(t.guides.c.text["file"], { code0: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "cPlugin", label: "main.c" },
          ],
        },
        {
          title: t.guides.c.titles[2],
          content: [
            <p key="clang">{rich(t.guides.c.text["clang"], { code0: (children) => <Code>{children}</Code>, code1: (children) => <Code>{children}</Code> })}</p>,
            terminal("cBuild"),
            <p key="output">{rich(t.guides.c.text["output"], { code0: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
      ],
    },
    {
      id: "go",
      label: "Go",
      docsHref: `${DOCS_URL}/plugin-dev/go/quick-start`,
      docsLabel: t.guides.go.docsLabel,
      steps: [
        {
          title: t.guides.go.titles[0],
          content: [
            <p key="tools">{rich(t.guides.go.text["tools"], { link0: (children) => <Link href="https://go.dev/doc/install">{children}</Link>, code1: (children) => <Code>{children}</Code> })}</p>,
            terminal("goInstall"),
          ],
        },
        {
          title: t.guides.go.titles[1],
          content: [
            <p key="file">{rich(t.guides.go.text["file"], { code0: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "goPlugin", label: "main.go" },
          ],
        },
        {
          title: t.guides.go.titles[2],
          content: [
            <p key="build">{rich(t.guides.go.text["build"], { code0: (children) => <Code>{children}</Code> })}</p>,
            terminal("goBuild"),
            <p key="output">{rich(t.guides.go.text["output"], { code0: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
      ],
    },
    {
      id: "kotlin",
      label: "Kotlin",
      docsHref: `${DOCS_URL}/plugin-dev/kotlin/quick-start`,
      docsLabel: t.guides.kotlin.docsLabel,
      steps: [
        {
          title: t.guides.kotlin.titles[0],
          content: [
            <p key="needs">{t.guides.kotlin.text["needs"]}</p>,
            <ul key="list" className="grid list-inside list-disc gap-1 marker:text-pumpkin">
              <li>Git</li>
              <li>JDK 17+</li>
              <li>{rich(t.guides.kotlin.text["item0"], { link0: (children) => <Link href="https://rust-lang.org/">{children}</Link> })}</li>
              <li>
                <Link href="https://github.com/bytecodealliance/wasm-tools">wasm-tools</Link>
              </li>
              <li>{rich(t.guides.kotlin.text["item1"], { code0: (children) => <Code>{children}</Code>, link1: (children) => <Link href="https://www.gnu.org/software/make/">{children}</Link> })}</li>
            </ul>,
            <p key="template">{t.guides.kotlin.text["template"]}</p>,
            terminal("kotlinClone"),
            <p key="rename">{rich(t.guides.kotlin.text["rename"], { code0: (children) => <Code>{children}</Code>, code1: (children) => <Code>{children}</Code>, code2: (children) => <Code>{children}</Code>, code3: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
        {
          title: t.guides.kotlin.titles[1],
          content: [
            <p key="prepared">{rich(t.guides.kotlin.text["prepared"], { code0: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "kotlinPlugin", label: "Plugin.kt" },
          ],
        },
        {
          title: t.guides.kotlin.titles[2],
          content: [
            <p key="make">{rich(t.guides.kotlin.text["make"], { code0: (children) => <Code>{children}</Code> })}</p>,
            terminal("kotlinBuild"),
            <p key="slow">{t.guides.kotlin.text["slow"]}</p>,
            <p key="output">{rich(t.guides.kotlin.text["output"], { code0: (children) => <Code>{children}</Code>, code1: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
      ],
    },
    {
      id: "d",
      label: "D",
      docsHref: `${DOCS_URL}/plugin-dev/d/quick-start`,
      docsLabel: t.guides.d.docsLabel,
      steps: [
        {
          title: t.guides.d.titles[0],
          content: [
            <p key="needs">{rich(t.guides.d.text["needs"], { link0: (children) => <Link href="https://github.com/ldc-developers/ldc">{children}</Link>, code1: (children) => <Code>{children}</Code>, link2: (children) => <Link href="https://dub.pm/">{children}</Link> })}</p>,
            <p key="package">{rich(t.guides.d.text["package"], { link0: (children) => <Link href="https://github.com/Pumpkin-MC/pumpkin-api-d">{children}</Link>, code1: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "dManifest", label: "dub.json" },
          ],
        },
        {
          title: t.guides.d.titles[1],
          content: [
            <p key="source">{rich(t.guides.d.text["source"], { code0: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "dPlugin", label: "app.d" },
          ],
        },
        {
          title: t.guides.d.titles[2],
          content: [
            <p key="dub">{rich(t.guides.d.text["dub"], { code0: (children) => <Code>{children}</Code> })}</p>,
            terminal("dBuild"),
            <p key="output">{rich(t.guides.d.text["output"], { code0: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
      ],
    },
    {
      id: "zig",
      label: "Zig",
      docsHref: `${DOCS_URL}/plugin-dev/zig/quick-start`,
      docsLabel: t.guides.zig.docsLabel,
      steps: [
        {
          title: t.guides.zig.titles[0],
          content: [
            <p key="needs">{rich(t.guides.zig.text["needs"], { link0: (children) => <Link href="https://ziglang.org/download/">{children}</Link>, link1: (children) => <Link href="https://github.com/bytecodealliance/wasm-tools">{children}</Link>, code2: (children) => <Code>{children}</Code> })}</p>,
            <p key="fetch">{rich(t.guides.zig.text["fetch"], { link0: (children) => <Link href="https://github.com/Pumpkin-MC/pumpkin-api-zig">{children}</Link> })}</p>,
            terminal("zigFetch"),
            <p key="build-zig">{rich(t.guides.zig.text["build-zig"], { code0: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "zigBuildZig", label: "build.zig" },
          ],
        },
        {
          title: t.guides.zig.titles[1],
          content: [
            <p key="source">{rich(t.guides.zig.text["source"], { code0: (children) => <Code>{children}</Code> })}</p>,
            { snippet: "zigPlugin", label: "src/main.zig" },
          ],
        },
        {
          title: t.guides.zig.titles[2],
          content: [
            <p key="build">{t.guides.zig.text["build"]}</p>,
            terminal("zigBuild"),
            <p key="output">{rich(t.guides.zig.text["output"], { code0: (children) => <Code>{children}</Code> })}</p>,
          ],
        },
      ],
    },
    {
      id: "typescript",
      label: "TypeScript",
      docsHref: "https://github.com/Pumpkin-MC/pumpkin-api-ts",
      docsLabel: t.guides.typescript.docsLabel,
      intro: (
        <p>{rich(t.guides.typescript.text["intro"], { link0: (children) => <Link href="https://github.com/Pumpkin-MC/pumpkin-api-ts">{children}</Link> })}</p>
      ),
      steps: [],
    },
  ];
}
