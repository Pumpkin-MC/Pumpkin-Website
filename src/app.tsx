import { StrictMode, type ComponentType } from "react";
import { I18nProvider } from "./i18n";
import { PageMetadata } from "./i18n/PageMetadata";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export function App({ page: Page }: { page: ComponentType }) {
  return (
    <StrictMode>
      <I18nProvider>
        <PageMetadata />
        <Header />
        <main>
          <Page />
        </main>
        <Footer />
      </I18nProvider>
    </StrictMode>
  );
}
