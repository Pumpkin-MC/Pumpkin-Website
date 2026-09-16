import { useEffect, useState } from "react";
import { checklist, columns, type Support } from "./checklist";

const marks: Record<Support, { glyph: string; label: string; background: string }> = {
  yes: { glyph: "✓", label: "Yes", background: "bg-success" },
  partial: { glyph: "!", label: "Partly", background: "bg-warning" },
  no: { glyph: "✕", label: "No", background: "bg-danger" },
};

type View = "table" | "cards";

interface OpenNote {
  view: View;
  row: number;
  column: number;
}

interface MarkProps {
  support: Support;
  note?: string;
  noteId?: string;
  expanded?: boolean;
  onToggle?: () => void;
}

function Mark({ support, note, noteId, expanded, onToggle }: MarkProps) {
  const { glyph, label, background } = marks[support];
  const shape = `inline-flex size-6 items-center justify-center text-[0.9rem] leading-none font-extrabold text-black ${background}`;

  if (!note) {
    return (
      <span role="img" aria-label={label} className={shape}>
        {glyph}
      </span>
    );
  }

  return (
    <button
      type="button"
      data-note-toggle=""
      aria-label={`${label}, has a note`}
      aria-describedby={noteId}
      aria-expanded={expanded}
      onClick={onToggle}
      className={`${shape} relative cursor-help after:absolute after:-top-1 after:-right-1 after:size-2 after:border-2 after:border-ink after:bg-fg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fg`}
    >
      {glyph}
    </button>
  );
}

function Legend() {
  return (
    <div className="flex gap-5 text-[0.85rem] text-muted md:ml-auto">
      {(["yes", "partial", "no"] as const).map((support) => (
        <span key={support} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`inline-flex size-6 items-center justify-center text-[0.9rem] font-extrabold text-black ${marks[support].background}`}
          >
            {marks[support].glyph}
          </span>
          {marks[support].label}
        </span>
      ))}
    </div>
  );
}

export function Checklist() {
  const [open, setOpen] = useState<OpenNote | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof Element) || !event.target.closest("[data-note-toggle]")) {
        setOpen(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function isOpen(view: View, row: number, column: number) {
    return open?.view === view && open.row === row && open.column === column;
  }

  function toggle(view: View, row: number, column: number) {
    setOpen(isOpen(view, row, column) ? null : { view, row, column });
  }

  return (
    <section className="border-t-3 border-pumpkin bg-surface py-14 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-325 px-5 md:px-8">
        <div className="mb-8 flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.01em]">
            Feature <span className="inline-block border-2 border-pumpkin bg-pumpkin px-[0.2em] text-black">checklist</span>
          </h2>
          <p className="text-muted">
            Pumpkin next to Vanilla, Paper and Folia, as they ship today. Marks with a dot have a note.
          </p>
          <Legend />
        </div>

        <table className="hidden w-full table-fixed border-collapse border-3 border-pumpkin bg-ink md:table">
          <thead>
            <tr>
              <th className="w-2/5 border-2 border-pumpkin bg-pumpkin px-4 py-3.5 text-left text-[0.95rem] font-extrabold text-black">
                Feature
              </th>
              {columns.map((column, index) => (
                <th
                  key={column}
                  className={`border-2 border-pumpkin bg-pumpkin px-4 py-3.5 text-[0.95rem] font-extrabold ${index === 0 ? "text-fg" : "text-black"}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checklist.map((row, rowIndex) => (
              <tr key={row.feature}>
                <td className="border-2 border-pumpkin px-4 py-3.5 text-left">
                  <strong className="block font-bold">{row.feature}</strong>
                  <small className="mt-0.5 block text-[0.8rem] text-muted">{row.detail}</small>
                </td>
                {row.support.map((support, columnIndex) => {
                  const note = row.notes[columnIndex];
                  const noteId = `checklist-note-${rowIndex}-${columnIndex}`;
                  const shown = isOpen("table", rowIndex, columnIndex);
                  return (
                    <td
                      key={columns[columnIndex]}
                      className={`group relative border-2 border-pumpkin px-4 py-3.5 text-center align-middle ${columnIndex === 0 ? "bg-pumpkin/14" : ""}`}
                    >
                      <Mark
                        support={support}
                        note={note}
                        noteId={noteId}
                        expanded={shown}
                        onToggle={() => toggle("table", rowIndex, columnIndex)}
                      />
                      {note && (
                        <span
                          id={noteId}
                          role="tooltip"
                          className={`pointer-events-none absolute bottom-[calc(100%-0.4rem)] left-1/2 z-10 w-max max-w-65 -translate-x-1/2 border-3 border-pumpkin bg-surface px-3 py-2.5 text-left text-[0.85rem] leading-snug font-medium text-fg brutal-4 transition-opacity after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[7px] after:border-transparent after:border-t-pumpkin ${shown ? "visible opacity-100" : "invisible opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"}`}
                        >
                          {note}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="grid gap-4 md:hidden">
          {checklist.map((row, rowIndex) => {
            const openColumn = open?.view === "cards" && open.row === rowIndex ? open.column : null;
            return (
              <li key={row.feature} className="border-3 border-pumpkin bg-ink">
                <div className="border-b border-white/12 px-4 pt-3.5 pb-2">
                  <strong className="block font-bold">{row.feature}</strong>
                  <small className="mt-0.5 block text-[0.8rem] text-muted">{row.detail}</small>
                </div>
                <div className="grid grid-cols-4">
                  {row.support.map((support, columnIndex) => (
                    <div key={columns[columnIndex]} className="flex flex-col items-center gap-1.5 px-1 pt-3 pb-3.5">
                      <span
                        className={`text-center text-[0.7rem] font-extrabold tracking-[0.06em] uppercase ${columnIndex === 0 ? "text-pumpkin" : "text-muted"}`}
                      >
                        {columns[columnIndex]}
                      </span>
                      <Mark
                        support={support}
                        note={row.notes[columnIndex]}
                        expanded={openColumn === columnIndex}
                        onToggle={() => toggle("cards", rowIndex, columnIndex)}
                      />
                    </div>
                  ))}
                </div>
                {openColumn !== null && (
                  <p className="border-t border-white/12 px-4 pt-3 pb-3.5 text-[0.9rem] leading-snug">
                    <b className="font-extrabold text-pumpkin">{columns[openColumn]}:</b> {row.notes[openColumn]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
