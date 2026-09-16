import type { ReactNode } from "react";
import type { CodeSample } from "./CodeBlock";
import type { SnippetName } from "./snippet-languages";
import { DOCS_URL } from "../../links";

export type GuideId = "rust" | "python" | "csharp" | "c" | "go" | "kotlin" | "typescript";

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

const terminal = (snippet: SnippetName): CodeSample => ({ snippet, label: "Terminal" });

export const guides: Guide[] = [
  {
    id: "rust",
    label: "Rust",
    docsHref: `${DOCS_URL}/plugin-dev/rust/creating-project`,
    docsLabel: "the Rust documentation",
    steps: [
      {
        title: "Creating a new project",
        content: [
          <p key="build">Pumpkin plugins use the Cargo build system.</p>,
          <p key="template">
            The complete code for this plugin can be found as a{" "}
            <Link href="https://github.com/Pumpkin-MC/pumpkin-rust-template">template on GitHub</Link>.
          </p>,
        ],
      },
      {
        title: "Installing the toolchain",
        content: [
          <p key="target">
            Before we can compile a plugin, we have to have the <Code>wasm32-wasip2</Code> target installed. You can
            install the target by running:
          </p>,
          terminal("rustTarget"),
        ],
      },
      {
        title: "Initializing a new crate",
        content: [
          <p key="folder">
            First we need to create a new project folder. You can do this by running this command in the folder you
            created:
          </p>,
          terminal("rustNewCrate"),
          <p key="cargo">
            After adding this, we want to create a new directory called <Code>.cargo</Code> and add in a{" "}
            <Code>config.toml</Code> file with the following contents:
          </p>,
          { snippet: "rustCargoConfig", label: ".cargo/config.toml" },
          <p key="tree">Altogether your new folder structure should look like this:</p>,
          { snippet: "rustTree", label: "Project layout" },
        ],
      },
      {
        title: "Configuring the crate",
        content: [
          <p key="cdylib">
            Since Pumpkin plugins are loaded at runtime as dynamic libraries, we need to tell Cargo to build this crate
            as one.
          </p>,
          { snippet: "rustManifest", label: "Cargo.toml" },
          <p key="deps">
            Next we need to add some basic dependencies. Since Pumpkin is still in early development, the internal
            crates aren't published to crates.io, so we need to tell Cargo to download the dependencies directly from
            GitHub.
          </p>,
          { snippet: "rustManifestWithDeps", label: "Cargo.toml" },
        ],
      },
    ],
  },
  {
    id: "python",
    label: "Python",
    docsHref: `${DOCS_URL}/plugin-dev/python/quick-start`,
    docsLabel: "the Python documentation",
    steps: [
      {
        title: "Installation",
        content: [
          <p key="install">
            First, you need to install the <Code>pumpkin-api-py</Code> library:
          </p>,
          terminal("pythonInstall"),
        ],
      },
      {
        title: "Creating your first plugin",
        content: [
          <p key="file">
            Create a file named <Code>main.py</Code> and add the following content:
          </p>,
          { snippet: "pythonPlugin", label: "main.py" },
        ],
      },
      {
        title: "Building the plugin",
        content: [
          <p key="build">Build your plugin into a WebAssembly component using the provided build tool:</p>,
          terminal("pythonBuild"),
          <p key="output">
            This will generate a <Code>my_plugin.wasm</Code> file that you can place in the plugins folder of your
            Pumpkin server.
          </p>,
        ],
      },
    ],
  },
  {
    id: "csharp",
    label: "C#",
    docsHref: `${DOCS_URL}/plugin-dev/csharp/quick-start`,
    docsLabel: "the C# documentation",
    steps: [
      {
        title: "Installation",
        content: [
          <p key="sdk">
            You will need the <Code>.NET SDK</Code> and the WASI workload to compile C# plugins for Pumpkin.
          </p>,
          terminal("csharpInstall"),
        ],
      },
      {
        title: "Creating your first plugin",
        content: [
          <p key="library">Create a new class library and add the following code:</p>,
          { snippet: "csharpPlugin", label: "MyPlugin.cs" },
        ],
      },
      {
        title: "Building the plugin",
        content: [
          <p key="build">Compile the plugin to WebAssembly using the WASI runtime identifier:</p>,
          terminal("csharpBuild"),
          <p key="output">
            This will generate a <Code>.wasm</Code> file in your output directory that can be loaded by Pumpkin.
          </p>,
        ],
      },
    ],
  },
  {
    id: "c",
    label: "C/C++",
    docsHref: "https://github.com/Pumpkin-MC/pumpkin-api-c",
    docsLabel: "the GitHub repository",
    steps: [
      {
        title: "Installation",
        content: [
          <p key="sdk">
            You will need the <Code>wasi-sdk</Code> to compile C/C++ plugins for Pumpkin. Download the latest release
            from the <Link href="https://github.com/WebAssembly/wasi-sdk/releases">wasi-sdk repository</Link>.
          </p>,
          <p key="repo">
            The complete code for this plugin can be found in the{" "}
            <Link href="https://github.com/Pumpkin-MC/pumpkin-api-c">pumpkin-api-c repository</Link>.
          </p>,
        ],
      },
      {
        title: "Creating your first plugin",
        content: [
          <p key="file">
            Create a file named <Code>main.c</Code> and add the following content:
          </p>,
          { snippet: "cPlugin", label: "main.c" },
        ],
      },
      {
        title: "Building the plugin",
        content: [
          <p key="clang">
            To compile this plugin into a WebAssembly component, use <Code>clang</Code> from the <Code>wasi-sdk</Code>:
          </p>,
          terminal("cBuild"),
          <p key="output">
            This will generate a <Code>my_plugin.wasm</Code> file that can be loaded by Pumpkin.
          </p>,
        ],
      },
    ],
  },
  {
    id: "go",
    label: "Go",
    docsHref: `${DOCS_URL}/plugin-dev/go/quick-start`,
    docsLabel: "the Go documentation",
    steps: [
      {
        title: "Installation",
        content: [
          <p key="tools">
            You will need <Link href="https://go.dev/doc/install">Go 1.23 or later</Link> and <Code>tinygo</Code> to
            compile Go plugins for Pumpkin.
          </p>,
          terminal("goInstall"),
        ],
      },
      {
        title: "Creating your first plugin",
        content: [
          <p key="file">
            Create a file named <Code>main.go</Code> and add the following content:
          </p>,
          { snippet: "goPlugin", label: "main.go" },
        ],
      },
      {
        title: "Building the plugin",
        content: [
          <p key="build">
            Compile the plugin to WebAssembly using <Code>tinygo</Code>:
          </p>,
          terminal("goBuild"),
          <p key="output">
            This will generate a <Code>my_plugin.wasm</Code> file that can be loaded by Pumpkin.
          </p>,
        ],
      },
    ],
  },
  {
    id: "kotlin",
    label: "Kotlin",
    docsHref: `${DOCS_URL}/plugin-dev/kotlin/quick-start`,
    docsLabel: "the Kotlin documentation",
    steps: [
      {
        title: "Installation",
        content: [
          <p key="needs">You will need a number of things installed.</p>,
          <ul key="list" className="grid list-inside list-disc gap-1 marker:text-pumpkin">
            <li>Git</li>
            <li>JDK 17+</li>
            <li>
              <Link href="https://rust-lang.org/">Rust</Link> (only default/host toolchain)
            </li>
            <li>
              <Link href="https://github.com/bytecodealliance/wasm-tools">wasm-tools</Link>
            </li>
            <li>
              <Code>make</Code> (e.g. <Link href="https://www.gnu.org/software/make/">GNU Make</Link>)
            </li>
          </ul>,
          <p key="template">Unlike most of the other APIs, this one is actually a template instead. Clone it and rename.</p>,
          terminal("kotlinClone"),
          <p key="rename">
            Then change the <Code>rootProject.name</Code> in <Code>settings.gradle.kts</Code>, and the{" "}
            <Code>PROJECT_NAME</Code> in <Code>Makefile</Code>. They must both match. Whatever you name the project is
            going to be the filename of the Wasm produced.
          </p>,
        ],
      },
      {
        title: "Creating your first plugin",
        content: [
          <p key="prepared">
            The template already has some code prepared. <Code>src/wasmWasiMain/kotlin/plugin/Plugin.kt</Code> contains:
          </p>,
          { snippet: "kotlinPlugin", label: "Plugin.kt" },
        ],
      },
      {
        title: "Building the plugin",
        content: [
          <p key="make">
            Compile the plugin to WebAssembly by running the <Code>Makefile</Code>:
          </p>,
          terminal("kotlinBuild"),
          <p key="slow">This will take a while the first time as it builds some Rust dependencies from source.</p>,
          <p key="output">
            Once it is done, <Code>my_kotlin_plugin.wasm</Code> (or whatever your Gradle project name is) will appear
            in <Code>build</Code>, ready to load into Pumpkin.
          </p>,
        ],
      },
    ],
  },
  {
    id: "typescript",
    label: "TypeScript",
    docsHref: "https://github.com/Pumpkin-MC/pumpkin-api-ts",
    docsLabel: "the pumpkin-api-ts repository",
    intro: (
      <p>
        There is no written quick start for TypeScript yet. The API and its setup instructions live in the{" "}
        <Link href="https://github.com/Pumpkin-MC/pumpkin-api-ts">pumpkin-api-ts repository</Link>.
      </p>
    ),
    steps: [],
  },
];
