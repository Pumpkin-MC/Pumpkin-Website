/** Replaces the {named} placeholders of a translated message, leaving unknown names untouched. */
export function formatMessage(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : placeholder,
  );
}

/** Formats a number with the separators and digits of the given BCP-47 tag. */
export function formatNumber(value: number | null | undefined, tag: string): string {
  return (value ?? 0).toLocaleString(tag);
}

/** Formats a share such as 12.5 as a percentage in the given locale. */
export function formatPercent(value: number, tag: string): string {
  return (value / 100).toLocaleString(tag, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Formats an amount of money in the given locale and currency, without decimals. */
export function formatCurrency(value: number, tag: string, currency: string): string {
  return value.toLocaleString(tag, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formats a date-time string from a release note in the given locale, keeping
 * the original text when it cannot be parsed.
 */
export function formatTimestamp(value: string, tag: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Formats a clock time (hours and minutes) in the given locale. */
export function formatTime(date: Date, tag: string): string {
  return date.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Formats a clock time including seconds in the given locale. */
export function formatTimeOfDay(date: Date, tag: string): string {
  return date.toLocaleTimeString(tag, { hour12: false });
}

/** Formats a short month-and-day date in the given locale. */
export function formatMonthDay(iso: string, tag: string): string {
  return new Date(iso).toLocaleDateString(tag, { month: "short", day: "numeric" });
}

/** Formats a date and time in the given locale. */
export function formatDateTime(iso: string, tag: string): string {
  return new Date(iso).toLocaleString(tag, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Localizes an ISO 3166-1 country code for the given locale, keeping the name
 * reported by the telemetry API when the platform has no translation.
 */
export function countryName(code: string, fallback: string, tag: string): string {
  try {
    const name = new Intl.DisplayNames([tag], { type: "region" }).of(code);
    return name && name !== code ? name : fallback;
  } catch {
    return fallback;
  }
}
