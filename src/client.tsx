import type { ComponentType } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./app";

export function mount(page: ComponentType) {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("The page is missing its #root element");
  }
  const app = <App page={page} />;
  if (container.firstElementChild) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
