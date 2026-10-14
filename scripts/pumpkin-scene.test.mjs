import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { Group, MathUtils, OrthographicCamera, Scene } from "three";

let renderer;
let decoder;
let loadModel;

mock.module("three", {
  namedExports: {
    Group, MathUtils, OrthographicCamera, Scene,
    WebGLRenderer: class { constructor() { return renderer; } },
  },
});
mock.module("three/addons/loaders/GLTFLoader.js", {
  namedExports: {
    GLTFLoader: class {
      setDRACOLoader() { return this; }
      loadAsync() { return loadModel(); }
    },
  },
});
mock.module("three/addons/loaders/DRACOLoader.js", {
  namedExports: {
    DRACO_GLTF_CONFIG: {},
    DRACOLoader: class { constructor() { return decoder; } },
  },
});

const { mountPumpkin } = await import("../src/pages/home/pumpkinScene.ts");

function fixture(t) {
  const frames = new Map();
  let nextFrame = 0;
  const reduced = Object.assign(new EventTarget(), { matches: false });
  const canvas = Object.assign(new EventTarget(), {
    clientWidth: 748,
    clientHeight: 748,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 846, height: 846 }),
  });
  Object.assign(globalThis, {
    window: Object.assign(new EventTarget(), {
      matchMedia: () => reduced, devicePixelRatio: 2, innerWidth: 1512, innerHeight: 868,
    }),
    document: { documentElement: new EventTarget() },
    requestAnimationFrame: (fn) => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() {} },
    IntersectionObserver: class { observe() {} disconnect() {} },
  });
  renderer = {
    setPixelRatio: mock.fn(), setSize: mock.fn(), render: mock.fn(),
    compileAsync: mock.fn(async () => {}), initTexture: mock.fn(),
    dispose: mock.fn(), forceContextLoss: mock.fn(),
  };
  decoder = { setDecoderPath() { return this; }, dispose: mock.fn() };
  loadModel = async () => ({ scene: new Group() });
  const options = { canvas, modelUrl: "pumpkin.glb", onReady: mock.fn(), onLost: mock.fn() };
  const mount = async () => {
    const dispose = await mountPumpkin(options);
    t.after(dispose);
    return dispose;
  };
  return { canvas, reduced, frames, options, mount };
}

test("context loss while loading keeps the fallback and lets decoding finish", async (t) => {
  const { canvas, options, mount } = fixture(t);
  const pending = Promise.withResolvers();
  loadModel = () => pending.promise;
  const mounting = mount();
  canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  const disposedWhileLoading = decoder.dispose.mock.callCount();
  pending.resolve({ scene: new Group() });
  await mounting;
  assert.equal(options.onLost.mock.callCount(), 1);
  assert.equal(options.onReady.mock.callCount(), 0);
  assert.equal(renderer.render.mock.callCount(), 0);
  assert.equal(disposedWhileLoading, 0);
  assert.equal(decoder.dispose.mock.callCount(), 1);
});

test("context loss during shader compilation never announces a ready canvas", async (t) => {
  const { canvas, options, mount } = fixture(t);
  renderer.compileAsync = async () => {
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  };
  await mount();
  assert.equal(options.onLost.mock.callCount(), 1);
  assert.equal(options.onReady.mock.callCount(), 0);
  assert.equal(renderer.render.mock.callCount(), 0);
});

test("reduced motion enabled while loading prevents the canvas becoming live", async (t) => {
  const { reduced, options, mount } = fixture(t);
  const pending = Promise.withResolvers();
  loadModel = () => pending.promise;
  const mounting = mount();
  reduced.matches = true;
  reduced.dispatchEvent(new Event("change"));
  pending.resolve({ scene: new Group() });
  await mounting;
  assert.equal(options.onLost.mock.callCount(), 1);
  assert.equal(options.onReady.mock.callCount(), 0);
  assert.equal(renderer.render.mock.callCount(), 0);
});

test("enabling reduced motion cancels active animation and restores the fallback", async (t) => {
  const { reduced, frames, options, mount } = fixture(t);
  await mount();
  window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 50, clientY: 50, pointerType: "mouse" }));
  assert.equal(frames.size, 1);
  reduced.matches = true;
  reduced.dispatchEvent(new Event("change"));
  assert.equal(frames.size, 0);
  assert.equal(options.onLost.mock.callCount(), 1);
  const draws = renderer.render.mock.callCount();
  window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 100, clientY: 100, pointerType: "mouse" }));
  assert.equal(renderer.render.mock.callCount(), draws);
});

test("canvas sizing ignores CSS rotation", async (t) => {
  const { options, mount } = fixture(t);
  await mount();
  assert.equal(options.onReady.mock.callCount(), 1);
  assert.deepEqual(renderer.setSize.mock.calls[0].arguments, [748, 748, false]);
});

test("failed model loads release the renderer and decoder", async (t) => {
  const { options, mount } = fixture(t);
  const error = new Error("Model unavailable");
  loadModel = async () => { throw error; };
  await assert.rejects(mount(), error);
  assert.equal(options.onReady.mock.callCount(), 0);
  assert.equal(renderer.dispose.mock.callCount(), 1);
  assert.equal(decoder.dispose.mock.callCount(), 1);
});

test("a setup failure after the renderer exists releases its GPU context", async (t) => {
  const { reduced, options } = fixture(t);
  // Older Safari: MediaQueryList has no addEventListener.
  reduced.addEventListener = undefined;
  await assert.rejects(mountPumpkin(options), TypeError);
  assert.equal(renderer.dispose.mock.callCount(), 1);
  assert.equal(renderer.forceContextLoss.mock.callCount(), 1);
  assert.equal(options.onReady.mock.callCount(), 0);
});
