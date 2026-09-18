import { StrictMode, type ComponentType } from "react";
import { I18nProvider } from "./i18n";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export function App({ page: Page }: { page: ComponentType }) {
  return (
    <StrictMode>
      <I18nProvider>
        <Header />
        <main>
          <Page />
        </main>
        <Footer />
      </I18nProvider>
    </StrictMode>
  );
}
