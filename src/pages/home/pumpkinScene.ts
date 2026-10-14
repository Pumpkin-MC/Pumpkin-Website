// The hero pumpkin, rendered live from the Blender model and turned toward the pointer.
// Loaded on demand by HeroPumpkin, so none of three.js is on the critical path.
import { Group, MathUtils, OrthographicCamera, Scene, WebGLRenderer, type Material, type Mesh, type Texture } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACO_GLTF_CONFIG, DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export interface PumpkinSceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  /** Called once the first frame of the model is on the canvas. */
  onReady: () => void;
  /** Called if the GPU drops the context; the caller should fall back to the still. */
  onLost: () => void;
  /** A pointer press that happened before the scene was ready; the pumpkin turns toward it. */
  initialAim?: PointerAim;
}

export interface PointerAim {
  clientX: number;
  clientY: number;
  pointerType: string;
}

// How far the pumpkin turns toward the pointer at the edge of the screen.
const MAX_YAW = MathUtils.degToRad(24);
const MAX_PITCH = MathUtils.degToRad(12);

// Frame the model exactly as the still image frames it.
const VIEW = 2.65;
const CENTER_Y = 0.2;

// The model is exported 1 unit tall from its base; this puts the body centre back at the origin.
const MODEL_SCALE = 2.24546;
const MODEL_OFFSET = [-0.005, -0.8394, 0.0226] as const;

// After a tap, the pumpkin looks at it for a moment and then turns back to face the viewer.
const TOUCH_HOLD_MS = 2500;
// Below this many radians from its target the pumpkin is at rest and drawing stops.
const SETTLED = 1e-4;

// Hands the main thread back between setup steps so no single task blocks input for long.
const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function texturesOf(root: Group): Set<Texture> {
  const textures = new Set<Texture>();
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    for (const material of ([] as Material[]).concat(mesh.material)) {
      for (const value of Object.values(material)) {
        if ((value as Texture | null)?.isTexture) textures.add(value as Texture);
      }
    }
  });
  return textures;
}

/** Mounts the scene and resolves to a function that tears it down. Rejects if WebGL is unavailable. */
export async function mountPumpkin({ canvas, modelUrl, onReady, onLost, initialAim }: PumpkinSceneOptions) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return () => {};

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });

  const scene = new Scene();
  const camera = new OrthographicCamera(-VIEW / 2, VIEW / 2, CENTER_Y + VIEW / 2, CENTER_Y - VIEW / 2, 0.1, 50);
  camera.position.set(0, 0, 10);
  const pivot = new Group();
  scene.add(pivot);

  let disposed = false;
  let frame = 0;
  const cleanups: (() => void)[] = [];
  const listen = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void) => {
    window.addEventListener(type, fn, { passive: true });
    cleanups.push(() => window.removeEventListener(type, fn));
  };

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    cleanups.forEach((fn) => fn());
    texturesOf(pivot).forEach((texture) => texture.dispose());
    pivot.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      ([] as Material[]).concat(mesh.material).forEach((material) => material.dispose());
    });
    renderer.dispose();
    renderer.forceContextLoss();
  }

  // From here on the renderer holds a GPU context, so any failure must release it.
  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const onLostContext = (e: Event) => {
      e.preventDefault();
      dispose();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", onLostContext);
    cleanups.push(() => canvas.removeEventListener("webglcontextlost", onLostContext));

    const onMotionChange = () => {
      if (!reduced.matches) return;
      dispose();
      onLost();
    };
    reduced.addEventListener("change", onMotionChange);
    cleanups.push(() => reduced.removeEventListener("change", onMotionChange));

    // The glTF-only WASM decoder, bundled and content-hashed by Vite from the three package.
    const draco = new DRACOLoader().setDecoderPath(DRACO_GLTF_CONFIG);
    const loader = new GLTFLoader().setDRACOLoader(draco);

    // Let in-flight decoding finish before terminating its workers.
    const gltf = await loader.loadAsync(modelUrl).finally(() => draco.dispose());
    if (disposed) return dispose;
    gltf.scene.scale.setScalar(MODEL_SCALE);
    gltf.scene.position.set(...MODEL_OFFSET);
    pivot.add(gltf.scene);

    // Compile shaders (in parallel where the GPU allows) and upload textures one per task,
    // rather than all inside the first render.
    await yieldToMain();
    if (disposed) return dispose;
    await renderer.compileAsync(scene, camera);
    for (const texture of texturesOf(pivot)) {
      await yieldToMain();
      if (disposed) return dispose;
      renderer.initTexture(texture);
    }
    await yieldToMain();
    if (disposed) return dispose;
  } catch (error) {
    dispose();
    throw error;
  }

  let last = 0;
  let running = false;

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (width && height) renderer.setSize(width, height, false);
  };
  const resizer = new ResizeObserver(() => {
    resize();
    draw();
  });
  resizer.observe(canvas);
  cleanups.push(() => resizer.disconnect());
  resize();

  // Pointer → target angle; the drawn angle eases toward it and drawing stops once it arrives.
  const target = { yaw: 0, pitch: 0 };
  const current = { yaw: 0, pitch: 0 };
  let touchRelease: ReturnType<typeof setTimeout> | undefined;
  cleanups.push(() => clearTimeout(touchRelease));

  function aim(e: PointerAim) {
    const rect = canvas.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    target.yaw = clamp((e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth * 0.5)) * MAX_YAW;
    target.pitch = clamp((e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight * 0.5)) * MAX_PITCH;
    clearTimeout(touchRelease);
    if (e.pointerType === "touch") touchRelease = setTimeout(center, TOUCH_HOLD_MS);
    start();
  }
  function center() {
    target.yaw = 0;
    target.pitch = 0;
    start();
  }
  listen("pointermove", aim);
  listen("pointerdown", aim);
  listen("blur", center);
  // A lifted finger also "leaves" the page; touch is released by its timer instead.
  const onLeave = (e: PointerEvent) => e.pointerType !== "touch" && center();
  const root = document.documentElement;
  root.addEventListener("pointerleave", onLeave);
  cleanups.push(() => root.removeEventListener("pointerleave", onLeave));

  // Only draw while the hero is on screen.
  let visible = true;
  // Records can arrive batched; the last one is the current state.
  const watcher = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    start();
  });
  watcher.observe(canvas);
  cleanups.push(() => watcher.disconnect());

  function draw() {
    // Positive pitch tips the face down toward a pointer below the pumpkin.
    pivot.rotation.set(current.pitch, current.yaw, 0, "YXZ");
    renderer.render(scene, camera);
  }

  function tick(now: number) {
    if (disposed) return;
    const dt = Math.max(0, Math.min(64, now - last)) / 1000;
    last = now;
    const k = 1 - Math.exp(-dt * 6);
    current.yaw += (target.yaw - current.yaw) * k;
    current.pitch += (target.pitch - current.pitch) * k;
    const settled =
      Math.abs(target.yaw - current.yaw) < SETTLED && Math.abs(target.pitch - current.pitch) < SETTLED;
    if (settled) {
      current.yaw = target.yaw;
      current.pitch = target.pitch;
    }
    draw();
    if (settled || !visible) {
      running = false;
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (disposed || running || !visible) return;
    running = true;
    frame = requestAnimationFrame((now) => {
      last = now;
      tick(now);
    });
  }

  // Swap the still for the canvas only once there is a real frame on it: the resting pose,
  // which is the pose the still was rendered in.
  draw();
  onReady();
  if (initialAim) aim(initialAim);

  return dispose;
}
