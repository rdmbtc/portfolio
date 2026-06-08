import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink, Github } from "lucide-react";
import type { Repo } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  repo: Repo;
  index: number;
  onOpen: (r: Repo) => void;
}

/**
 * Per-project pinned scroll-scrub section with horizontal storytelling.
 * Each story is a single project — pinned while three frames slide horizontally.
 */
export default function ProjectStory({ repo, index, onOpen }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const ctx = gsap.context(() => {
      const frames = track.querySelectorAll<HTMLElement>("[data-story-frame]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${frames.length * 70}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, { xPercent: -100 * (frames.length - 1) });

      // Subtle parallax on each frame's "content" layer
      frames.forEach((f, i) => {
        const content = f.querySelector<HTMLElement>("[data-story-content]");
        if (!content) return;
        gsap.fromTo(
          content,
          { y: 40, opacity: 0.6 },
          {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: root,
              start: `top+=${i * 60}% top`,
              end: `top+=${(i + 1) * 60}% top`,
              scrub: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const screens = [
    { label: "Intro", title: repo.name, body: repo.description ?? "" },
    { label: "What it does", title: "Built for impact", body: repo.readme ?? repo.description ?? "Open project for details." },
    { label: "Stack", title: "Crafted with", body: [repo.language, ...repo.tags].filter(Boolean).join(" · ") },
  ];

  return (
    <section ref={rootRef} className="relative h-screen overflow-hidden">
      <div
        ref={trackRef}
        className="flex h-full w-[300%] will-change-transform"
        style={{ background: "var(--background)" }}
      >
        {screens.map((s, i) => (
          <div
            key={i}
            data-story-frame
            className="relative flex h-full w-1/3 shrink-0 items-center justify-center px-6"
          >
            <div data-story-content className="mx-auto w-full max-w-3xl">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5">
                  {String(index + 1).padStart(2, "0")} / {repo.name.toLowerCase().replace(/\s/g, "-")}
                </span>
                <span>{s.label}</span>
              </div>
              <h3 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                {s.title}
              </h3>
              <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
                {s.body}
              </p>
              {i === screens.length - 1 && (
                <div className="mt-10 flex flex-wrap gap-3">
                  <button
                    onClick={() => onOpen(repo)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    View case study
                  </button>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30"
                    >
                      <ExternalLink className="h-4 w-4" /> Visit live
                    </a>
                  )}
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30"
                  >
                    <Github className="h-4 w-4" /> Source
                  </a>
                </div>
              )}
            </div>

            {/* Frame number rail */}
            <div className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
              {screens.map((_, j) => (
                <span
                  key={j}
                  className={`h-1 rounded-full transition-all ${i === j ? "w-8 bg-foreground" : "w-4 bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}