import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "../../components/Button";
import { DownloadIcon } from "../../components/icons";
import { readCache, writeCache } from "../../lib/cache";
import { useCopy } from "../../lib/useCopy";
import { DISCORD_URL, DOCS_URL, GITHUB_URL } from "../../links";

const RELEASES_URL = `${GITHUB_URL}/releases`;
const INSTALL_COMMAND = "curl -sSfL https://pumpkinmc.org/install.sh | sh";

const RELEASE_CACHE_KEY = "pumpkin_latest_release";
const RELEASE_CACHE_TTL_MS = 60 * 60 * 1000;
const DEFAULT_VERSION = "0.1.0-dev+26.2-26.45";
const DEFAULT_RELEASE_URL = `${GITHUB_URL}/releases/tag/0.1.0-dev%2B26.2-26.45`;

type Channel = "stable" | "nightly";

const NIGHTLY_URL = `${GITHUB_URL}/releases/tag/nightly`;
const NIGHTLY_CACHE_KEY = "pumpkin_nightly_build";

const channels: { id: Channel; label: string }[] = [
  { id: "stable", label: "Stable" },
  { id: "nightly", label: "Nightly" },
];

const channelBase: Record<Channel, string> = {
  stable: `${GITHUB_URL}/releases/latest/download`,
  nightly: `${GITHUB_URL}/releases/download/nightly`,
};

const installCommands: Record<Channel, string> = {
  stable: INSTALL_COMMAND,
  nightly: "curl -sSfL https://pumpkinmc.org/install.sh | PUMPKIN_TAG=nightly sh",
};

type Os = "windows" | "linux" | "mac" | "android";
type Arch = "x64" | "arm64";

interface ReleaseFile {
  os: Os;
  arch: Arch;
  system: string;
  archLabel: string;
  archNote?: string;
  file: string;
}

const files: ReleaseFile[] = [
  { os: "windows", arch: "x64", system: "Windows", archLabel: "x86-64", archNote: "Intel / AMD", file: "pumpkin-X64-Windows.exe" },
  { os: "windows", arch: "arm64", system: "Windows", archLabel: "ARM64", file: "pumpkin-ARM64-Windows.exe" },
  { os: "linux", arch: "x64", system: "Linux", archLabel: "x86-64", archNote: "Intel / AMD", file: "pumpkin-X64-Linux" },
  { os: "linux", arch: "arm64", system: "Linux", archLabel: "ARM64", file: "pumpkin-ARM64-Linux" },
  { os: "mac", arch: "arm64", system: "macOS", archLabel: "ARM64", archNote: "Apple Silicon", file: "pumpkin-ARM64-macOS" },
  { os: "android", arch: "arm64", system: "Android", archLabel: "ARM64", file: "pumpkin-aarch64-android" },
];

const fileUrl = (file: ReleaseFile, channel: Channel) => `${channelBase[channel]}/${file.file}`;

interface Release {
  tag_name: string;
  html_url: string;
}

const terminalLogs: { message: string; accent?: string }[] = [
  { message: "Starting parallel world load..." },
  { message: "Loading minecraft:the_nether" },
  { message: "Loading minecraft:overworld" },
  { message: "Loading minecraft:the_end" },
  { message: "All worlds loaded successfully." },
  { message: "Query protocol is enabled. Starting..." },
  { message: "Started server; took ", accent: "5ms" },
  { message: "Server is now running. Connect using port: Java Edition: 0.0.0.0:25565 | Bedrock Edition: 0.0.0.0:19132" },
  { message: "Server query running on port 25565" },
];

const commandSequence = [
  { char: ".", delay: 130 },
  { char: "/", delay: 120 },
  { char: "p", delay: 155 },
  { char: "u", delay: 145 },
  { char: "m", delay: 210 },
  { char: "p", delay: 150 },
  { char: "k", delay: 95 },
  { char: "i", delay: 82 },
  { char: "n", delay: 74 },
];

function detectFile(): ReleaseFile {
  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const uaData = (navigator as Navigator & { userAgentData?: { architecture?: string } }).userAgentData;
  const find = (os: Os, arch: Arch) => files.find((file) => file.os === os && file.arch === arch) ?? files[0];

  if (ua.includes("android")) return find("android", "arm64");
  if (ua.includes("mac") || platform.includes("mac")) return find("mac", "arm64");
  const os: Os = ua.includes("linux") || platform.includes("linux") ? "linux" : "windows";
  const isArm =
    ua.includes("arm64") || ua.includes("aarch64") || platform.includes("arm") || uaData?.architecture === "arm";
  return find(os, isArm ? "arm64" : "x64");
}

function useLatestRelease(): Release {
  const [release, setRelease] = useState<Release>({ tag_name: DEFAULT_VERSION, html_url: DEFAULT_RELEASE_URL });

  useEffect(() => {
    try {
      localStorage.removeItem("pumpkin_commit");
    } catch {}
    const cached = readCache<Release>(RELEASE_CACHE_KEY, RELEASE_CACHE_TTL_MS);
    if (cached) {
      setRelease(cached);
      return;
    }
    let cancelled = false;
    fetch("https://api.github.com/repos/Pumpkin-MC/Pumpkin/releases/latest")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch latest release");
        return response.json() as Promise<Partial<Release>>;
      })
      .then((data) => {
        if (cancelled || !data.tag_name) return;
        const latest = {
          tag_name: data.tag_name,
          html_url: data.html_url ?? `${GITHUB_URL}/releases/tag/${encodeURIComponent(data.tag_name)}`,
        };
        writeCache(RELEASE_CACHE_KEY, latest);
        setRelease(latest);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return release;
}

interface NightlyBuild {
  commit?: string;
  builtAt?: string;
}

function useNightlyBuild(enabled: boolean): NightlyBuild | null {
  const [build, setBuild] = useState<NightlyBuild | null>(null);

  useEffect(() => {
    if (!enabled || build) return;
    const cached = readCache<NightlyBuild>(NIGHTLY_CACHE_KEY, RELEASE_CACHE_TTL_MS);
    if (cached) {
      setBuild(cached);
      return;
    }
    let cancelled = false;
    fetch("https://api.github.com/repos/Pumpkin-MC/Pumpkin/releases/tags/nightly")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch the nightly build");
        return response.json() as Promise<{ body?: string }>;
      })
      .then((data) => {
        if (cancelled) return;
        const body = data.body ?? "";
        const info: NightlyBuild = {
          commit: /From commit:\s*([0-9a-f]{7,40})/i.exec(body)?.[1],
          builtAt: /Generated on:\s*([^\n|]+)/i.exec(body)?.[1]?.trim(),
        };
        writeCache(NIGHTLY_CACHE_KEY, info);
        setBuild(info);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [enabled, build]);

  return build;
}

const inlineLink = "font-semibold text-pumpkin underline underline-offset-3 hover:text-fg";

function InstallCommand({ channel }: { channel: Channel }) {
  const [copied, copy] = useCopy(installCommands[channel]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1.5 border-t-2 border-white/15 bg-ink px-5 py-4 md:px-7">
      <code className="min-w-0 overflow-x-auto font-mono text-[0.95rem] whitespace-pre">
        <span aria-hidden="true" className="text-muted select-none">
          ${" "}
        </span>
        <span className="text-[#8ab4ff]">curl</span> -sSfL{" "}
        <span className="text-[#a8e6b0]">https://pumpkinmc.org/install.sh</span>{" "}
        <span className="text-[#b8b8b8]">|</span>{" "}
        {channel === "nightly" && (
          <>
            <span className="text-[#ffb38a]">PUMPKIN_TAG</span>=<span className="text-[#a8e6b0]">nightly</span>{" "}
          </>
        )}
        <span className="text-[#8ab4ff]">sh</span>
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied install command" : "Copy install command"}
        className="cursor-pointer justify-self-end text-xs font-bold tracking-wider text-pumpkin uppercase hover:text-fg"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <p className="col-span-2 text-xs text-muted md:col-span-1 md:col-start-1">
        For macOS, Linux and other Unix-like systems. Installs into <code className="font-mono text-fg">./pumpkin-server</code>.
      </p>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function TerminalDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [command, setCommand] = useState("");
  const [complete, setComplete] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCommand("./pumpkin");
      setComplete(true);
      setShowLogs(true);
      return;
    }

    async function play() {
      let typed = "";
      for (const step of commandSequence) {
        if (cancelled) return;
        typed += step.char;
        setCommand(typed);
        await wait(step.delay);
      }
      if (cancelled) return;
      setComplete(true);
      await wait(5);
      if (!cancelled) setShowLogs(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-label="Animated Pumpkin startup demo"
      className="min-w-0 border-2 border-white/15 bg-ink lg:sticky lg:top-28 lg:self-start"
    >
      <div className="flex items-center justify-between border-b-2 border-white/15 px-4 py-2 font-mono text-xs text-muted">
        <span>~/pumpkin-server</span>
        <span className={complete ? "text-success" : undefined}>{complete ? "running" : "idle"}</span>
      </div>
      <div className="min-h-80 overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed">
        <div className="whitespace-pre">
          <span className="text-muted">$ </span>
          <span>{command}</span>
          {!complete && (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] animate-blink bg-pumpkin/80 motion-reduce:animate-none"
            />
          )}
        </div>
        {showLogs &&
          terminalLogs.map((entry) => (
            <div key={entry.message} className="animate-fade-up whitespace-pre motion-reduce:animate-none">
              <span className="text-success">[INFO] </span>
              <span className="text-fg/85">{entry.message}</span>
              {entry.accent && <span className="font-bold text-pumpkin">{entry.accent}</span>}
            </div>
          ))}
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Download the file",
    body: (
      <>
        Grab the file for your system above, or use the install script on macOS and Linux. It's a single executable,
        there is no installer and no Java to set up.
      </>
    ),
  },
  {
    title: "Run it",
    body: <>Double-click the executable, or start it from a terminal. Your server is running a few milliseconds later.</>,
  },
  {
    title: "Connect",
    body: (
      <>
        Java Edition players join on port <code className="font-mono text-fg">25565</code>, Bedrock Edition players on
        port <code className="font-mono text-fg">19132</code>. Both can be in the same world.
      </>
    ),
  },
  {
    title: "Configure",
    body: (
      <>
        Check the <a href={`${DOCS_URL}/config/introduction`} className={inlineLink}>configuration docs</a> for every
        option, or ask on <a href={DISCORD_URL} className={inlineLink}>Discord</a> if something doesn't start.
      </>
    ),
  },
];

export default function Download() {
  const [recommended, setRecommended] = useState<ReleaseFile>(files[0]);
  const [detected, setDetected] = useState(false);
  const [channel, setChannel] = useState<Channel>("stable");
  const release = useLatestRelease();
  const nightly = useNightlyBuild(channel === "nightly");
  const isNightly = channel === "nightly";
  const nightlyLabel = `nightly${nightly?.commit ? ` · ${nightly.commit}` : ""}`;

  useEffect(() => {
    setRecommended(detectFile());
    setDetected(true);
    if (new URLSearchParams(window.location.search).get("channel") === "nightly") {
      setChannel("nightly");
    }
  }, []);

  function chooseChannel(next: Channel) {
    setChannel(next);
    const url = new URL(window.location.href);
    if (next === "nightly") {
      url.searchParams.set("channel", "nightly");
    } else {
      url.searchParams.delete("channel");
    }
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <section className="mx-auto max-w-325 px-5 pt-14 md:px-8 md:pt-20">
        <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.015em]">
          Download Pumpkin<span className="text-pumpkin">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted md:text-xl">
          Self-contained executable. No Java required. Just download, run, and play.
        </p>

        <div className="mt-10 border-3 border-pumpkin bg-surface">
          <div className="flex flex-wrap items-stretch justify-between border-b-2 border-white/15">
            <div role="radiogroup" aria-label="Release channel" className="grid w-full grid-cols-2 md:flex md:w-auto">
              {channels.map((option) => {
                const checked = channel === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => chooseChannel(option.id)}
                    className={`cursor-pointer border-white/15 px-5 py-3 font-mono text-sm transition-colors first:border-r-2 md:border-r-2 ${
                      checked ? (option.id === "nightly" ? "bg-warning text-black" : "bg-fg text-black") : "text-muted hover:text-fg"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <a
              href={isNightly ? NIGHTLY_URL : release.html_url}
              target="_blank"
              rel="noopener"
              className="flex w-full items-center border-t-2 border-white/15 px-5 py-2.5 font-mono text-xs text-muted hover:text-pumpkin md:w-auto md:border-t-0 md:py-3"
            >
              {isNightly ? nightlyLabel : release.tag_name}
            </a>
          </div>

          {isNightly && (
            <p className="animate-fade-up border-b-2 border-white/15 bg-warning/10 px-5 py-2.5 text-sm text-warning motion-reduce:animate-none md:px-7">
              Nightly builds come straight from recent commits and skip the release process. Expect bugs and back up
              your world first.
              {nightly?.builtAt && <span className="text-muted"> Generated {nightly.builtAt}.</span>}
            </p>
          )}

          <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-7">
            <div className="min-w-0">
              <p className="font-mono text-xs tracking-wider text-muted uppercase">
                {detected ? "Detected on this device" : "Most common download"}
              </p>
              <p className="mt-2 text-2xl font-extrabold md:text-3xl">
                {recommended.system}{" "}
                <span className="text-muted">
                  · {recommended.archLabel}
                  {recommended.archNote ? ` (${recommended.archNote})` : ""}
                </span>
              </p>
              <p className="mt-1 truncate font-mono text-sm text-muted">{recommended.file}</p>
            </div>
            <ButtonLink href={fileUrl(recommended, channel)} className="w-full md:w-auto">
              Download {isNightly ? "nightly " : ""}for {recommended.system}
              <DownloadIcon className="size-4" />
            </ButtonLink>
          </div>

          <InstallCommand channel={channel} />
        </div>
      </section>

      <section id="all-files" className="mx-auto max-w-325 px-5 py-14 md:px-8 md:py-20">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-3xl font-extrabold md:text-4xl">All files</h2>
          <p className="text-muted">
            <a href={isNightly ? NIGHTLY_URL : release.html_url} target="_blank" rel="noopener" className={inlineLink}>
              {isNightly ? "Nightly release page" : "Release notes"}
            </a>{" "}
            ·{" "}
            <a href={RELEASES_URL} target="_blank" rel="noopener" className={inlineLink}>
              {isNightly ? "All releases" : "Older versions"}
            </a>
          </p>
        </div>

        <div role="table" aria-label="Release files" className="border-t-3 border-pumpkin">
          <div
            role="row"
            className="hidden grid-cols-[9rem_14rem_minmax(0,1fr)_8rem] gap-4 border-b-2 border-white/15 py-3 text-xs font-extrabold tracking-wider text-muted uppercase md:grid"
          >
            <span role="columnheader">System</span>
            <span role="columnheader">Architecture</span>
            <span role="columnheader">File</span>
            <span role="columnheader" className="sr-only">
              Download
            </span>
          </div>
          {files.map((file) => {
            const current = detected && file.file === recommended.file;
            return (
              <div
                key={file.file}
                role="row"
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-white/10 py-4 md:grid-cols-[9rem_14rem_minmax(0,1fr)_8rem] ${
                  current ? "text-fg" : ""
                }`}
              >
                <span role="cell" className="flex items-center gap-2 font-extrabold">
                  {file.system}
                  {current && (
                    <span className="bg-pumpkin px-1.5 py-0.5 text-[0.65rem] tracking-wider text-black uppercase">
                      This device
                    </span>
                  )}
                </span>
                <span role="cell" className="col-start-1 text-sm text-muted md:col-start-auto md:text-base">
                  {file.archLabel}
                  {file.archNote && <span className="text-muted/70"> · {file.archNote}</span>}
                </span>
                <span role="cell" className="col-start-1 truncate font-mono text-sm text-muted md:col-start-auto">
                  {file.file}
                </span>
                <span role="cell" className="col-start-2 row-span-3 row-start-1 md:col-start-auto md:row-span-1 md:row-start-auto md:text-right">
                  <a
                    href={fileUrl(file, channel)}
                    aria-label={`Download ${isNightly ? "nightly " : ""}${file.file}`}
                    className="inline-flex items-center gap-2 font-bold text-pumpkin hover:text-fg"
                  >
                    <DownloadIcon className="size-4" />
                    <span className="hidden md:inline">Download</span>
                  </a>
                </span>
              </div>
            );
          })}
        </div>

        {!isNightly && (
        <p className="mt-5 max-w-3xl text-sm text-muted">
          Releases are digitally signed using SignPath. Free code signing provided by{" "}
          <a href="https://signpath.io/" target="_blank" rel="noopener" className={inlineLink}>
            SignPath.io
          </a>
          , certificate by{" "}
          <a href="https://signpath.org/" target="_blank" rel="noopener" className={inlineLink}>
            SignPath Foundation
          </a>
          .
        </p>
        )}
      </section>

      <section className="border-t-3 border-pumpkin bg-surface">
        <div className="mx-auto grid max-w-325 gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 className="text-3xl font-extrabold md:text-4xl">After downloading</h2>
            <ol className="mt-8 grid gap-8">
              {steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5">
                  <span className="grid size-9 place-items-center border-3 border-pumpkin font-mono font-bold text-pumpkin">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="pt-1 text-xl/tight font-extrabold">{step.title}</h3>
                    <p className="mt-2 text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href={`${DOCS_URL}/`} variant="ghost" className="w-full md:w-auto">
                Quick start guide
              </ButtonLink>
              <a href={DISCORD_URL} className={inlineLink}>
                Get help on Discord
              </a>
            </div>
          </div>
          <TerminalDemo />
        </div>
      </section>
    </>
  );
}
