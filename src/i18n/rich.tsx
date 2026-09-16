import { Fragment, type ReactNode } from "react";

export type RichTags = Record<string, (children: string) => ReactNode>;

const TAG_PATTERN = /<(\w+)>(.*?)<\/\1>/g;

export function rich(text: string, tags: RichTags): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(TAG_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push(text.slice(cursor, start));
    const render = tags[match[1]];
    parts.push(<Fragment key={start}>{render ? render(match[2]) : match[2]}</Fragment>);
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
