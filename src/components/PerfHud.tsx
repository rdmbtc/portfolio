import { useEffect, useState } from "react";
import { subscribeFps } from "@/lib/perf";

/** Toggle with ?perf=1 in URL or pressing Shift+P. */
export default function PerfHud() {
  const [fps, setFps] = useState(60);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("perf") === "1") setVisible(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "P" || e.key === "p")) setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return subscribeFps((f) => setFps(f));
  }, []);

  if (!visible) return null;

  const status = fps >= 50 ? "smooth" : fps >= 35 ? "okay" : "jank";
  const color = fps >= 50 ? "text-emerald-400" : fps >= 35 ? "text-yellow-400" : "text-red-400";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[70] flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest shadow-lg backdrop-blur-md"
    >
      <span className={`h-2 w-2 rounded-full ${fps >= 50 ? "bg-emerald-500" : fps >= 35 ? "bg-yellow-500" : "bg-red-500"}`} />
      <span className={color}>{fps.toFixed(0)} fps</span>
      <span className="text-muted-foreground">· {status}</span>
    </div>
  );
}