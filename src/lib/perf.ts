type Listener = (fps: number) => void;

const listeners = new Set<Listener>();
let currentFps = 60;
let running = false;
let raf = 0;
let last = 0;
let frames = 0;

function loop(now: number) {
  frames++;
  const delta = now - last;
  if (delta >= 750) {
    currentFps = (frames * 1000) / delta;
    frames = 0;
    last = now;
    listeners.forEach((l) => l(currentFps));
  }
  raf = requestAnimationFrame(loop);
}

export function startFpsMonitor() {
  if (running || typeof window === "undefined") return;
  running = true;
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

export function stopFpsMonitor() {
  if (!running) return;
  running = false;
  cancelAnimationFrame(raf);
}

export function subscribeFps(l: Listener) {
  startFpsMonitor();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getFps() {
  return currentFps;
}

/** Returns a render-step multiplier. 1 = every frame, 2 = every other, 3 = every third. */
export function getQualityStep(fps: number) {
  if (fps >= 50) return 1;
  if (fps >= 35) return 2;
  return 3;
}