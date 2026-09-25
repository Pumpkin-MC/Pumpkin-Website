declare module "jsvectormap" {
  const JsVectorMap: new (options: Record<string, unknown>) => { destroy(): void };
  export default JsVectorMap;
}

declare module "jsvectormap/dist/maps/world.js";
