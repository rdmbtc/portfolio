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
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${frames.length * 100}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Animate track horizontally
      tl.to(track, { xPercent: -100 * (frames.length - 1), duration: 1, ease: "none" });

      // Subtle parallax on each frame's "content" layer sequenced in the timeline
      frames.forEach((f, i) => {
        const content = f.querySelector<HTMLElement>("[data-story-content]");
        if (!content || i === 0) return; // First frame is already visible
        
        // Frame i enters during the track progress from (i-1)/(frames.length-1) to i/(frames.length-1).
        const duration = 0.4;
        const start = (i / (frames.length - 1)) - 0.45;
        
        tl.fromTo(
          content,
          { y: 50, opacity: 0, filter: "blur(4px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", ease: "power2.out", duration },
          start
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
        {screens.map((s, i) => {
          const hasScreenshots = repo.screenshots && repo.screenshots.length > 0;
          return (
            <div
              key={i}
              data-story-frame
              className="relative flex h-full w-1/3 shrink-0 items-center justify-center px-6"
            >
              <div
                data-story-content
                className={`mx-auto w-full ${hasScreenshots ? "max-w-5xl" : "max-w-3xl"}`}
              >
                {hasScreenshots ? (
                  <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
                    <div className="md:col-span-7 flex flex-col justify-center text-left">
                      <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                        <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5">
                          {String(index + 1).padStart(2, "0")} / {repo.name.toLowerCase().replace(/\s/g, "-")}
                        </span>
                        <span>{s.label}</span>
                      </div>
                      <h3 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                        {s.title}
                      </h3>
                      <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
                        {s.body}
                      </p>
                      {i === screens.length - 1 && (
                        <div className="mt-8 flex flex-wrap gap-3">
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
                    <div className="md:col-span-5 flex justify-center select-none">
                      {i === 1 && repo.screenshots && repo.screenshots[1] ? (
                        <MobileMock title={repo.name} screenshot={repo.screenshots[1]} />
                      ) : (
                        <BrowserMock title={repo.name} screenshot={repo.screenshots?.[0]} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5">
                        {String(index + 1).padStart(2, "0")} / {repo.name.toLowerCase().replace(/\s/g, "-")}
                      </span>
                      <span>{s.label}</span>
                    </div>
                    <h3 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                      {s.title}
                    </h3>
                    <p className="mt-6 max-w-2xl mx-auto text-balance text-base text-muted-foreground sm:text-lg">
                      {s.body}
                    </p>
                    {i === screens.length - 1 && (
                      <div className="mt-10 flex flex-wrap justify-center gap-3">
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
                )}

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
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BrowserMock({ title, screenshot }: { title: string; screenshot?: string }) {
  return (
    <div className="relative w-full aspect-[16/10] max-w-[280px] sm:max-w-[420px] rounded-2xl border-4 border-foreground bg-background shadow-bob-lg overflow-hidden group hover:border-primary transition-colors duration-300">
      <div className="flex h-7 items-center gap-1.5 border-b-4 border-foreground bg-secondary px-3">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-emerald-400" />
        <span className="ml-3 truncate font-mono text-[10px] font-bold text-foreground">{title.toLowerCase().replace(/\s/g, "-")}.vercel.app</span>
      </div>
      <div className="relative w-full h-[calc(100%-28px)] bg-background overflow-hidden">
        {screenshot ? (
          <img
            src={screenshot}
            alt={title}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-xs">
            No Preview Available
          </div>
        )}
      </div>
    </div>
  );
}

function MobileMock({ title, screenshot }: { title: string; screenshot: string }) {
  return (
    <div className="relative w-40 sm:w-48 h-[280px] sm:h-[340px] rounded-[2.5rem] border-[6px] border-foreground bg-background shadow-bob-lg overflow-hidden group hover:border-primary transition-colors duration-300">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 border-b-4 border-x-4 border-foreground bg-background rounded-b-xl z-20" />
      <div className="relative w-full h-full bg-background overflow-hidden">
        <img
          src={screenshot}
          alt={title}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
    </div>
  );
}