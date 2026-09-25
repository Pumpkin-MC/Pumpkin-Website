const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? `${BASE}${path}` : path;
}
