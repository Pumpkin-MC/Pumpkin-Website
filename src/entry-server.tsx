import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./app";
import type { PageId } from "./routes";
import Home from "./pages/home/Home";
import Download from "./pages/download/Download";
import Developers from "./pages/developers/Developers";
import Donate from "./pages/donate/Donate";
import Contributors from "./pages/contributors/Contributors";
import Stats from "./pages/stats/Stats";
import NotFound from "./pages/not-found/NotFound";

export { routes, SITE_URL } from "./routes";

const pages: Record<PageId, ComponentType> = {
  home: Home,
  download: Download,
  developers: Developers,
  donate: Donate,
  contributors: Contributors,
  stats: Stats,
  notFound: NotFound,
};

export function render(id: PageId): string {
  return renderToString(<App page={pages[id]} />);
}
