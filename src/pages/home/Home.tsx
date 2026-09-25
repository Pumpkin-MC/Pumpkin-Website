import { Hero } from "./Hero";
import { Facts } from "./Facts";
import { Checklist } from "./Checklist";
import { PluginLanguages } from "./PluginLanguages";
import { TryIt } from "./TryIt";

export default function Home() {
  return (
    <>
      <Hero />
      <Facts />
      <Checklist />
      <PluginLanguages />
      <TryIt />
    </>
  );
}
