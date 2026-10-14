import { useEffect, useRef, useState } from "react";
import { withBase } from "../../lib/url";
import type { PointerAim } from "./pumpkinScene";

const STILL_WIDTHS = [384, 640, 1024];

// The 3D render frames the pumpkin a little higher and larger than /assets/icon.svg, which the
// hero layout was designed around. This maps the render's frame onto the icon's so the pumpkin
// lands exactly where the icon drew it (measured from both images' opaque bounds).
const ICON_FIT = "translate(0.45%, 4.63%) scale(0.9886)";

interface NetworkInformation {
  saveData?: boolean;
}

/** The live 3D pumpkin costs ~370 kB gzipped and a GPU context, so skip it where it isn't wanted. */
function wants3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return !connection?.saveData;
}

/**
 * Runs `fn` once the page has loaded, the browser is idle and `el` is near the viewport.
 * Touch screens have no hover, so the pumpkin has nothing to do there until the visitor
 * touches or scrolls the page; they wait for that too, and pass on the touch to aim at.
 */
function whenWanted(el: Element, fn: (aim?: PointerAim) => void): () => void {
  let cancelled = false;
  let idle = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let aim: PointerAim | undefined;
  let interacted = !window.matchMedia("(pointer: coarse)").matches;
  let nearby = false;

  const run = () => {
    if (cancelled || !interacted || !nearby) return;
    cancelled = true;
    observer.disconnect();
    removeInteraction();
    // Safari has no requestIdleCallback.
    const go = () => fn(aim);
    if (typeof requestIdleCallback === "function") idle = requestIdleCallback(go, { timeout: 2000 });
    else timer = setTimeout(go, 200);
  };

  const onPointer = (e: PointerEvent) => {
    aim = { clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType };
    onInteract();
  };
  const onInteract = () => {
    interacted = true;
    run();
  };
  const removeInteraction = () => {
    window.removeEventListener("pointerdown", onPointer);
    window.removeEventListener("scroll", onInteract);
  };
  if (!interacted) {
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("scroll", onInteract, { passive: true, once: true });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Records can arrive batched; the last one is the current state.
      nearby = entries[entries.length - 1].isIntersecting;
      run();
    },
    { rootMargin: "200px" },
  );
  const begin = () => observer.observe(el);
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });

  return () => {
    cancelled = true;
    observer.disconnect();
    removeInteraction();
    window.removeEventListener("load", begin);
    if (idle) cancelIdleCallback(idle);
    clearTimeout(timer);
  };
}

/**
 * The hero pumpkin. Server-rendered as a still image (the LCP candidate), then upgraded in
 * place to the live Blender model once the page is idle (on touch screens, once touched). The
 * still stays if WebGL, the network or the user's motion preference says no.
 */
export function HeroPumpkin({ className }: { className: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !wants3D()) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;
    const cancelWait = whenWanted(el, (initialAim) => {
      import("./pumpkinScene")
        .then(({ mountPumpkin }) => {
          // Unmounted while the module was loading: don't create a renderer for a detached canvas.
          if (cancelled) return undefined;
          return mountPumpkin({
            canvas: el,
            modelUrl: withBase("/assets/pumpkin/pumpkin.glb"),
            onReady: () => !cancelled && setLive(true),
            onLost: () => setLive(false),
            initialAim,
          });
        })
        .then((teardown) => {
          if (!teardown) return;
          if (cancelled) teardown();
          else dispose = teardown;
        })
        .catch((error: unknown) => {
          // No WebGL, a blocked request or a bad decode: the still is already showing.
          console.warn("Pumpkin model unavailable; keeping the still image.", error);
        });
    });

    return () => {
      cancelled = true;
      cancelWait();
      dispose?.();
      setLive(false);
    };
  }, []);

  return (
    <div className={className} style={{ aspectRatio: "1" }}>
      <div className="absolute inset-0 origin-top-left" style={{ transform: ICON_FIT }}>
        <img
          src={withBase("/assets/pumpkin/pumpkin-640.webp")}
          srcSet={STILL_WIDTHS.map((w) => `${withBase(`/assets/pumpkin/pumpkin-${w}.webp`)} ${w}w`).join(", ")}
          sizes="(min-width: 64rem) 860px, 320px"
          width={1024}
          height={1024}
          alt=""
          fetchPriority="high"
          draggable={false}
          className={`absolute inset-0 size-full transition-opacity duration-300 motion-reduce:transition-none ${live ? "opacity-0" : "opacity-100"}`}
        />
        <canvas
          ref={canvas}
          className={`absolute inset-0 size-full transition-opacity duration-300 motion-reduce:transition-none ${live ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}
