import { useCallback, useEffect, useRef, useState } from "react";

const COPY_RESET_MS = 2000;

function copyWithSelection(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export function useCopy(text: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = useCallback(() => {
    const succeed = () => {
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    };
    const fallback = () => {
      if (copyWithSelection(text)) succeed();
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(succeed, fallback);
    } else {
      fallback();
    }
  }, [text]);

  return [copied, copy];
}
