import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribeFps, getQualityStep } from "@/lib/perf";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  frameCount: number;
  framePath: (i: number) => string;
  children?: React.ReactNode;
  canvasClassName?: string;
}

export default function ScrollSequence({ frameCount, framePath, children, canvasClassName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adaptive perf: mobile starts at step 2; we also bump step up automatically
    // when the FPS monitor reports jank.
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const baseStep = isMobile ? 2 : 1;
    let qualityStep = baseStep;
    const indices: number[] = [];
    for (let i = 0; i < frameCount; i += baseStep) indices.push(i);
    const effectiveCount = indices.length;

    const images: (HTMLImageElement | null)[] = new Array(effectiveCount).fill(null);
    const state = { frame: 0 };
    let firstLoaded = false;

    const loadImage = (slot: number) => {
      if (images[slot]) return;
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = framePath(indices[slot] + 1);
      images[slot] = img;
      img.onload = () => {
        if (!firstLoaded) {
          firstLoaded = true;
          setCanvasSize();
          render();
        } else if (slot === state.frame) {
          render();
        }
      };
    };

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      const img = images[state.frame];
      if (!img || !img.complete) return;
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      ctx.clearRect(0, 0, cw, ch);
      const ir = img.width / img.height;
      const cr = cw / ch;
      let dw = cw, dh = ch, dx = 0, dy = 0;
      if (ir > cr) {
        dh = ch;
        dw = ch * ir;
        dx = (cw - dw) / 2;
      } else {
        dw = cw;
        dh = cw / ir;
        dy = (ch - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    // Eagerly load the first few frames so the canvas paints immediately.
    const eager = Math.min(8, effectiveCount);
    for (let i = 0; i < eager; i++) loadImage(i);
    // Lazy-load the rest in chunks during browser idle time.
    const idle: typeof window.requestIdleCallback =
      (typeof window !== "undefined" && window.requestIdleCallback) ||
      ((cb: IdleRequestCallback) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline), 1) as unknown as number);
    let cursor = eager;
    const loadChunk = () => {
      const end = Math.min(cursor + 16, effectiveCount);
      for (; cursor < end; cursor++) loadImage(cursor);
      if (cursor < effectiveCount) idle(loadChunk);
    };
    idle(loadChunk);

    setCanvasSize();
    const onResize = () => { setCanvasSize(); render(); };
    window.addEventListener("resize", onResize);

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=200%",
      scrub: isMobile ? 0.8 : 0.5,
      pin: container,
      pinSpacing: true,
      onUpdate: (self) => {
        // Quantize frame index by qualityStep so we render less work on jank.
        const raw = Math.round(self.progress * (effectiveCount - 1));
        const quantized = Math.floor(raw / qualityStep) * qualityStep;
        const f = Math.min(effectiveCount - 1, quantized);
        if (f !== state.frame) {
          state.frame = f;
          // Make sure this frame and its neighbors are loaded
          loadImage(f);
          if (f + 1 < effectiveCount) loadImage(f + 1);
          render();
        }
      },
    });

    // Subscribe to the FPS monitor — auto-throttle the sequence under jank.
    const unsubscribe = subscribeFps((fps) => {
      const next = Math.max(baseStep, getQualityStep(fps));
      if (next !== qualityStep) qualityStep = next;
    });

    return () => {
      window.removeEventListener("resize", onResize);
      trigger.kill();
      unsubscribe();
    };
  }, [frameCount, framePath]);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${canvasClassName || ""}`} />
      <div className="pointer-events-none absolute inset-0">{children}</div>
    </section>
  );
}