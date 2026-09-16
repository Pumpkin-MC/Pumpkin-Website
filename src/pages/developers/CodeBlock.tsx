import { snippetTokens, type SnippetToken } from "virtual:snippet-tokens";
import { useCopy } from "../../lib/useCopy";
import type { SnippetName } from "./snippet-languages";
import { snippets } from "./snippets";

export interface CodeSample {
  snippet: SnippetName;
  label: string;
}

interface CodeBlockProps extends CodeSample {
  lineNumbers?: boolean;
  tone?: "danger" | "success";
  className?: string;
}

const toneMarker = {
  danger: "bg-danger",
  success: "bg-success",
};

export function tokensFor(snippet: SnippetName): SnippetToken[][] {
  return snippetTokens[snippet] ?? snippets[snippet].split("\n").map((line) => [[line]]);
}

export function TokenLine({ tokens }: { tokens: SnippetToken[] }) {
  if (tokens.length === 0 || tokens.every(([content]) => content === "")) return <>{" "}</>;
  return (
    <>
      {tokens.map(([content, color], index) =>
        color ? (
          <span key={index} style={{ color }}>
            {content}
          </span>
        ) : (
          <span key={index}>{content}</span>
        ),
      )}
    </>
  );
}

export function CodeBlock({ snippet, label, lineNumbers = false, tone, className = "" }: CodeBlockProps) {
  const [copied, copy] = useCopy(snippets[snippet]);
  const lines = tokensFor(snippet);

  return (
    <figure className={`flex min-w-0 flex-col border-2 border-white/15 bg-ink ${className}`}>
      <figcaption className="flex items-center justify-between gap-4 border-b-2 border-white/15 px-4 py-2 text-xs text-muted">
        <span className="flex items-center gap-2 font-mono">
          {tone && <span aria-hidden="true" className={`size-2 ${toneMarker[tone]}`} />}
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
          className="cursor-pointer font-bold tracking-wider text-pumpkin uppercase hover:text-fg"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="flex-1 overflow-x-auto p-4 font-mono text-[0.82rem] leading-relaxed">
        <code className="block min-w-max">
          {lines.map((tokens, index) => (
            <span key={index} className="flex whitespace-pre">
              {lineNumbers && (
                <span aria-hidden="true" className="w-8 shrink-0 pr-4 text-right text-muted/50 select-none">
                  {index + 1}
                </span>
              )}
              <span>
                <TokenLine tokens={tokens} />
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
