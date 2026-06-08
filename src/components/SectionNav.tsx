import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface NavSection { id: string; label: string }

export default function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  // On first load: if URL has a hash matching a section, scroll to it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    if (!sections.some((s) => s.id === hash)) return;
    // Defer so the layout (and pinned ScrollTriggers) is ready.
    const t = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        if ((window as any).lenis) {
          const trigger = ScrollTrigger.getAll().find((st) => st.trigger === el);
          const target = trigger ? trigger.start : el;
          (window as any).lenis.scrollTo(target, { immediate: true });
        } else {
          el.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }
    }, 200);
    return () => window.clearTimeout(t);
  }, [sections]);



  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visible = new Map<string, number>();

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            visible.set(s.id, e.isIntersecting ? e.intersectionRatio : 0);
          }
          let best = sections[0].id;
          let bestVal = -1;
          for (const [id, v] of visible) {
            if (v > bestVal) { bestVal = v; best = id; }
          }
          setActive(best);
        },
        { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      if (typeof window !== "undefined" && (window as any).lenis) {
        const trigger = ScrollTrigger.getAll().find((st) => st.trigger === el);
        const target = trigger ? trigger.start : el;
        (window as any).lenis.scrollTo(target, { duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-auto fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 rounded-full border border-border/60 bg-background/70 px-2 py-3 backdrop-blur-xl lg:flex"
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => jump(s.id)}
            className="group relative flex items-center justify-center"
            aria-label={`Jump to ${s.label}`}
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive ? "h-6 w-1.5 bg-foreground" : "h-1.5 w-1.5 bg-muted-foreground/65 group-hover:bg-foreground/80"
              }`}
            />
            <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border border-border/80 bg-background/80 px-2 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-widest opacity-0 translate-x-1 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 backdrop-blur-md">
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}