import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Github, Mail, Linkedin, Check, ArrowUpRight, Star, ExternalLink, Search, X, Sun, Moon } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollSequence from "@/components/ScrollSequence";
import HorizontalScroll from "@/components/HorizontalScroll";
import SectionNav from "@/components/SectionNav";
import ProjectModal from "@/components/ProjectModal";
import ProjectStory from "@/components/ProjectStory";
import { Input } from "@/components/ui/input";
import { repos, allTags, type Repo } from "@/data/projects";
import PerfHud from "@/components/PerfHud";
import { useRepoMeta } from "@/hooks/useRepoMeta";
import Lenis from "lenis";
import Magnetic from "@/components/Magnetic";
import SplitTextReveal from "@/components/SplitTextReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RDM — Full-stack Developer · therdm.dev" },
      { name: "description", content: "Portfolio of RDM — full-stack developer shipping clean, modern web products with React, Next.js, and TypeScript." },
      { property: "og:title", content: "RDM — Full-stack Developer" },
      { property: "og:description", content: "Clean, modern web products. React, Next.js, TypeScript." },
    ],
  }),
  component: Index,
});

const stack = [
  "React", "Next.js", "TypeScript", "Tailwind",
  "GSAP", "Node.js", "PostgreSQL", "tRPC",
];

const langColor: Record<string, string> = {
  TypeScript: "bg-sky-500",
  JavaScript: "bg-yellow-400",
  Dart: "bg-cyan-500",
  Python: "bg-emerald-500",
  HTML: "bg-orange-500",
  CSS: "bg-pink-500",
  MDX: "bg-violet-500",
};

const stats = [
  { value: repos.length.toString(), label: "Public repos" },
  { value: "20+", label: "Live deployments" },
  { value: "6", label: "Years building" },
  { value: "∞", label: "Coffees consumed" },
];

const timeline = [
  { year: "2020", title: "First React project", body: "Discovered components and never looked back." },
  { year: "2022", title: "Full-stack development", body: "Shipped production apps with Next.js, Postgres, and tRPC." },
  { year: "2024", title: "Freelance & open source", body: "Started taking on client work and contributing to OSS." },
  { year: "2025", title: "therdm.dev launch", body: "Consolidated everything into a single home on the web." },
];

const navSections = [
  { id: "top", label: "Intro" },
  { id: "stack", label: "Stack" },
  { id: "stories", label: "Stories" },
  { id: "work", label: "Featured" },
  { id: "repos", label: "Repos" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const heroFramePath = (i: number) => `/frames/frame_${String(i).padStart(4, "0")}.jpg`;

function Index() {
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null);
  const meta = useRepoMeta();

  // Initialize Lenis smooth scroll on client mount
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    (window as any).lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  // Handle scrolling state to toggle neon glow text shadows on active scroll
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | number;
    const handleScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Refresh ScrollTrigger positions when page finishes loading
  useEffect(() => {
    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    if (document.readyState === "complete") {
      ScrollTrigger.refresh();
    } else {
      window.addEventListener("load", handleLoad);
    }
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  // Refresh ScrollTrigger positions after repo metadata is loaded and changes layouts
  useEffect(() => {
    if (Object.keys(meta).length > 0) {
      const t = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [meta]);

  // Merge live GitHub metadata (stars/language/description) on top of the
  // static list — cached in localStorage so search/filters stay instant.
  const liveRepos = useMemo<Repo[]>(() => {
    if (!Object.keys(meta).length) return repos;
    return repos.map((r) => {
      const m = meta[r.name];
      if (!m) return r;
      return {
        ...r,
        stars: Math.max(r.stars, m.stars),
        language: r.language ?? m.language,
        description: r.description ?? m.description,
        homepage: r.homepage ?? m.homepage ?? null,
      };
    });
  }, [meta]);
  const liveFeatured = useMemo(() => liveRepos.slice(0, 6), [liveRepos]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <SectionNav sections={navSections} />
      <Hero />
      <Skills />
      <Stats />
      <Marquee />
      <ProjectStories repos={liveFeatured} onOpen={setActiveRepo} />
      <FeaturedShowcase repos={liveFeatured} onOpen={setActiveRepo} />
      <AllRepos repos={liveRepos} onOpen={setActiveRepo} />
      <About />
      <Contact />
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} RDM · therdm.dev
      </footer>
      <ProjectModal repo={activeRepo} onOpenChange={(o) => !o && setActiveRepo(null)} />
      <PerfHud />
    </div>
  );
}

function Nav() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = saved || (systemDark ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === "top") {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const trigger = ScrollTrigger.getAll().find((st) => st.trigger === element);
      const target = trigger ? trigger.start : element;
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(target, { duration: 1.5 });
      } else {
        if (trigger) {
          window.scrollTo({
            top: trigger.start,
            behavior: "smooth",
          });
        } else {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
      }
    }
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full flex justify-center px-4">
      <div
        className="pointer-events-auto flex items-center justify-between rounded-full border shadow-2xl bg-background/95 text-foreground border-border/80 backdrop-blur-xl px-4 py-2 sm:px-6 sm:py-3 w-full max-w-[480px] sm:max-w-xl md:max-w-2xl h-12 sm:h-14 md:h-16"
      >
        {/* Logo - always visible */}
        <Magnetic>
          <a
            href="#top"
            onClick={(e) => handleNavClick(e, "top")}
            className="text-xs sm:text-sm md:text-base font-bold tracking-tight shrink-0 flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 hover:opacity-85 transition-opacity"
          >
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
            <span>RDM</span>
          </a>
        </Magnetic>

        {/* Full Menu Content - always shown */}
        <nav className="flex gap-3 sm:gap-5 md:gap-6 text-xs sm:text-sm md:text-[15px] font-semibold text-muted-foreground/90">
          <a href="#work" onClick={(e) => handleNavClick(e, "work")} className="hover:text-foreground transition-colors py-1">Work</a>
          <a href="#repos" onClick={(e) => handleNavClick(e, "repos")} className="hover:text-foreground transition-colors py-1">Repos</a>
          <a href="#stack" onClick={(e) => handleNavClick(e, "stack")} className="hover:text-foreground transition-colors py-1">Stack</a>
          <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="hover:text-foreground transition-colors py-1">About</a>
        </nav>

        {/* Actions - always shown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Magnetic>
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground cursor-pointer transition-colors"
              aria-label="Toggle theme"
            >
              <div className="t-icon-swap" data-state={theme === "light" ? "a" : "b"}>
                <span className="t-icon" data-icon="a">
                  <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </span>
                <span className="t-icon" data-icon="b">
                  <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </span>
              </div>
            </button>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="rounded-full bg-primary text-primary-foreground px-4.5 py-2 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Contact
            </a>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}

const phrases = ["with care.", "with speed.", "with precision.", "with purpose."];

function Hero() {
  const [isShown, setIsShown] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsShown(true);
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Hero interactive gradient particle cursor trail
  useEffect(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const points: { x: number; y: number; age: number }[] = [];
    let mouse = { x: 0, y: 0, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      
      points.push({ x: mouse.x, y: mouse.y, age: 0 });
      if (points.length > 25) points.shift();
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const container = canvas.parentElement;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }
        
        const grad = ctx.createLinearGradient(
          points[0].x, points[0].y, 
          points[points.length - 1].x, points[points.length - 1].y
        );
        grad.addColorStop(0, "rgba(99, 102, 241, 0)");
        grad.addColorStop(0.5, "rgba(168, 85, 247, 0.3)");
        grad.addColorStop(1, "rgba(236, 72, 153, 0.75)");
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          p.age += 1;
          const radius = (i / points.length) * 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 72, 153, ${i / points.length})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(236, 72, 153, 0.5)";
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center">
        <div className="h-[350px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />
        <div className="h-[250px] w-[400px] rounded-full bg-pink-500/10 blur-[100px] dark:bg-pink-500/5 -ml-20" />
      </div>

      <canvas ref={trailCanvasRef} className="pointer-events-none absolute inset-0 h-full w-full z-10 opacity-60 dark:opacity-45" />

      {/* Scroll-scrubbed canvas sequence */}
      <ScrollSequence
        frameCount={240}
        framePath={heroFramePath}
        canvasClassName="filter blur-[10px] scale-105 brightness-[1.02] opacity-55 dark:brightness-[0.25] dark:opacity-100 transition-all duration-300"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-20">
          <div className={`w-[90%] max-w-6xl pointer-events-auto t-stagger ${isShown ? "is-shown" : ""} p-8 sm:p-12 md:p-14 rounded-[32px] border border-border/60 bg-background/55 dark:bg-background/25 backdrop-blur-2xl shadow-[0_24px_60px_-15px_oklch(0.15_0.005_260_/_0.05)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.45)]`}>
            <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 w-full">
              {/* Left Column: Text Content */}
              <div className="flex-1 min-w-0 w-full text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs text-foreground/80 dark:text-muted-foreground backdrop-blur-md t-stagger-line t-stagger-line--1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Available for new work · Q3 2026
                </div>
                <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight t-stagger-line t-stagger-line--2 leading-[1.15] text-foreground">
                  Clean, modern web products,<br />
                  <span>shipped </span>
                  <span
                    key={phraseIdx}
                    className="inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text-swap"
                  >
                    {phrases[phraseIdx]}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-balance text-sm sm:text-base md:text-lg text-foreground/85 dark:text-muted-foreground t-stagger-line t-stagger-line--3 leading-relaxed">
                  I'm RDM — a full-stack developer building fast, considered interfaces with React, Next.js and TypeScript.
                </p>
                <p className="mt-4 text-sm sm:text-base text-foreground/85 dark:text-muted-foreground t-stagger-line t-stagger-line--4">
                  <span className="typing-hero font-mono text-sm sm:text-base">therdm.dev</span>
                </p>
              </div>

              {/* Right Column: GitHub PFP with animated gradient glow */}
              <div className="shrink-0 flex justify-center w-full md:w-auto">
                <div className="relative group">
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-xl transition duration-1000 group-hover:opacity-75 group-hover:duration-200" />
                  <img
                    src="https://avatars.githubusercontent.com/u/114354595?v=4"
                    alt="Dr RDM Github Profile"
                    className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 rounded-full border-2 border-border/80 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <p className="rounded-full border border-border/70 bg-background/70 px-4 py-1.5 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-foreground/80 dark:text-muted-foreground backdrop-blur-md">
              scroll-driven · 240 frames · canvas
            </p>
            <p className="animate-bounce font-mono text-[11px] sm:text-xs uppercase tracking-widest text-foreground/75 dark:text-muted-foreground/85">
              ↓ scroll
            </p>
          </div>
        </div>
      </ScrollSequence>
    </section>
  );
}

function Skills() {
  return (
    <section id="stack" className="mx-auto max-w-6xl px-6 py-28">
      <SplitTextReveal eyebrow="Stack" text="A precise, modern toolkit." />
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stack.map((s, i) => (
          <div
            key={s}
            className="group relative flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4 transition-all hover:border-foreground/20 overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
            }}
          >
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(150px circle at var(--x, 0px) var(--y, 0px), var(--color-spotlight), transparent 85%)`,
              }}
            />
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="text-sm font-medium">{s}</span>
              <Check className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-emerald-500" strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-background px-6 py-10 text-center">
            <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className={`t-digit-group ${isAnimating ? "is-animating" : ""}`}>
                {s.value.split("").map((char, index) => (
                  <span key={index} className="t-digit" data-stagger={index + 1}>
                    {char}
                  </span>
                ))}
              </span>
            </div>
            <div className="mt-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Marquee() {
  const tags = ["React", "Next.js", "TypeScript", "Three.js", "Tailwind", "GSAP", "Solidity", "Web3", "Node.js", "Vite", "Edge", "Postgres"];
  const loop = [...tags, ...tags];
  return (
    <section className="relative overflow-hidden border-b border-border py-8">
      <div className="flex gap-12 whitespace-nowrap [animation:marquee_40s_linear_infinite]">
        {loop.map((t, i) => (
          <span key={i} className="font-mono text-2xl text-muted-foreground/90 sm:text-3xl">
            {t} <span className="text-foreground/20">·</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function ProjectStories({ repos: items, onOpen }: { repos: Repo[]; onOpen: (r: Repo) => void }) {
  return (
    <section id="stories" className="relative">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-28 text-center">
        <SplitTextReveal eyebrow="Stories" text="Per-project scroll-scrub stories." center />
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Each featured build gets its own pinned section. Keep scrolling — the frames slide horizontally as the story unfolds.
        </p>
      </div>
      {items.slice(0, 4).map((r, i) => (
        <ProjectStory key={r.name} repo={r} index={i} onOpen={onOpen} />
      ))}
    </section>
  );
}

function FeaturedShowcase({ repos: items, onOpen }: { repos: Repo[]; onOpen: (r: Repo) => void }) {
  return (
    <>
      <div id="work" className="mx-auto max-w-6xl px-6 pb-2 pt-28">
        <SplitTextReveal eyebrow="Featured" text="Selected work, side by side." />
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Scroll → to drift through featured builds. Each one ships live and lives in the open on GitHub.
        </p>
      </div>
      <HorizontalScroll>
        {items.map((r) => (
          <article
            key={r.name}
            className="group flex h-[70vh] w-[78vw] shrink-0 cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-foreground/30 sm:w-[55vw] lg:w-[42vw]"
            onClick={() => onOpen(r)}
          >
            <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-secondary via-muted to-secondary bg-background bg-gradient-to-br">
              <ProjectMockups title={r.name} screenshots={r.screenshots} />
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-border p-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                  <LangDot lang={r.language} /> {r.language ?? "—"}
                  {r.stars > 0 && <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> {r.stars}</span>}
                </div>
                <h3 className="mt-2 truncate text-xl font-semibold tracking-tight">{r.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {r.homepage && (
                  <a href={r.homepage} target="_blank" rel="noreferrer" aria-label="Live site"
                     onClick={(e) => e.stopPropagation()}
                     className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-foreground/30">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <a href={r.url} target="_blank" rel="noreferrer" aria-label="GitHub"
                   onClick={(e) => e.stopPropagation()}
                   className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90">
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>
        ))}
        <div className="flex h-[70vh] w-[60vw] shrink-0 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-secondary/30 text-center sm:w-[40vw]">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">End of featured</p>
          <a href="#repos" className="mt-4 text-lg font-semibold tracking-tight underline-offset-4 hover:underline">
            See all {repos.length} repos ↓
          </a>
        </div>
      </HorizontalScroll>
    </>
  );
}

function ProjectMockups({ title, screenshots }: { title: string; screenshots?: string[] }) {
  const hasScreenshots = screenshots && screenshots.length > 0;
  
  if (!hasScreenshots) {
    return (
      <div className="absolute inset-6 rounded-xl border border-border bg-background shadow-sm overflow-hidden flex flex-col">
        <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-border px-3 bg-muted/20">
          <span className="h-2 w-2 rounded-full bg-red-400/60" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
          <span className="ml-3 truncate font-mono text-[11px] sm:text-xs text-muted-foreground">{title.toLowerCase().replace(/\s/g, "-")}.app</span>
        </div>
        <div className="flex-1 space-y-3 p-5 bg-secondary/5">
          <div className="h-2 w-1/3 rounded bg-muted" />
          <div className="h-2 w-2/3 rounded bg-muted" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="h-14 rounded-lg bg-secondary" />
            <div className="h-14 rounded-lg bg-secondary" />
            <div className="h-14 rounded-lg bg-secondary" />
          </div>
          <div className="mt-2 h-24 rounded-lg bg-gradient-to-br from-secondary to-muted" />
        </div>
      </div>
    );
  }

  const hasMultiple = screenshots.length > 1;

  if (hasMultiple) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6 select-none overflow-hidden">
        {/* Browser Mockup (aligned left/center and slightly scaled down/shifted) */}
        <div className="absolute left-6 right-20 top-6 bottom-16 rounded-xl border border-border bg-background shadow-md overflow-hidden flex flex-col transition-all duration-500 group-hover:scale-[1.01]">
          <div className="flex h-6 shrink-0 items-center gap-1 border-b border-border px-2.5 bg-muted/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
            <span className="ml-2 truncate font-mono text-[9px] text-muted-foreground">{title.toLowerCase().replace(/\s/g, "-")}.app</span>
          </div>
          <div className="flex-1 relative bg-secondary/5 overflow-hidden">
            <img
              src={screenshots[0]}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Mobile Mockup (aligned bottom right, overlapping) */}
        <div className="absolute right-6 bottom-6 w-24 sm:w-28 h-[160px] sm:h-[200px] rounded-[1.5rem] border-[4px] border-foreground bg-background shadow-bob-lg overflow-hidden transition-transform duration-500 group-hover:scale-[1.03] group-hover:translate-x-1 group-hover:-translate-y-1">
          {/* Mini Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-2 border-b-2 border-x-2 border-foreground bg-background rounded-b-md z-20" />
          <div className="relative w-full h-full bg-background overflow-hidden">
            <img
              src={screenshots[1]}
              alt={`${title} mobile`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    );
  }

  // Single screenshot layout (centered browser mockup)
  return (
    <div className="absolute inset-6 rounded-xl border border-border bg-background shadow-sm overflow-hidden flex flex-col">
      <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-border px-3 bg-muted/20">
        <span className="h-2 w-2 rounded-full bg-red-400/60" />
        <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
        <span className="ml-3 truncate font-mono text-[11px] sm:text-xs text-muted-foreground">{title.toLowerCase().replace(/\s/g, "-")}.app</span>
      </div>
      <div className="flex-1 relative bg-secondary/5 overflow-hidden">
        <img
          src={screenshots[0]}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    </div>
  );
}

function LangDot({ lang }: { lang: string | null }) {
  const cls = (lang && langColor[lang]) || "bg-muted-foreground/40";
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />;
}

function AllRepos({ repos: items, onOpen }: { repos: Repo[]; onOpen: (r: Repo) => void }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<"name" | "stars">("stars");

  const [isShaking, setIsShaking] = useState(false);
  const prevCount = useRef(0);
  const sortContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({ left: 0, width: 0, opacity: 0 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.language ?? "").toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || r.tags.includes(activeTag) || r.language === activeTag;
      return matchesQuery && matchesTag;
    });
    list = [...list].sort((a, b) => {
      if (sort === "stars") return b.stars - a.stars || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [items, query, activeTag, sort]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [filtered.length]);

  useEffect(() => {
    const container = sortContainerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[aria-selected="true"]`) as HTMLButtonElement;
    if (activeBtn) {
      setPillStyle({
        transform: `translateX(${activeBtn.offsetLeft}px)`,
        width: `${activeBtn.offsetWidth}px`,
        opacity: 1,
      });
    }
  }, [sort]);

  useEffect(() => {
    if (query && filtered.length === 0 && prevCount.current > 0) {
      setIsShaking(true);
    }
    prevCount.current = filtered.length;
  }, [filtered.length, query]);

  return (
    <section id="repos" className="mx-auto max-w-6xl px-6 py-28">
      <div className="flex items-end justify-between gap-6">
        <SplitTextReveal eyebrow={`All · ${items.length}`} text="Everything in the open." />
        <a href="https://github.com/rdmbtc?tab=repositories" target="_blank" rel="noreferrer"
           className="hidden items-center gap-2 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">
          github.com/rdmbtc <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      {/* Search + sort */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`relative flex-1 t-input-wrap ${filtered.length === 0 && query ? "is-error" : ""}`}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <div
            className={`t-input ${isShaking ? "is-shaking" : ""}`}
            onAnimationEnd={() => setIsShaking(false)}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, language, tag…"
              className="h-11 rounded-full border-border bg-card pl-10 pr-10 w-full"
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <p className="t-error-msg absolute left-4 mt-1 text-[11px] text-destructive">
            No matching repositories found.
          </p>
        </div>
        <div ref={sortContainerRef} className="t-tabs text-xs font-medium relative self-start sm:self-auto">
          <span className="t-tabs-pill" style={pillStyle} aria-hidden="true" />
          {(["stars", "name"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              aria-selected={sort === s}
              className="t-tab"
            >
              Sort: {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            !activeTag ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-foreground/30"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              activeTag === tag ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        {filtered.length} of {repos.length} shown
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <button
            key={r.name}
            onClick={() => onOpen(r)}
            className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_12px_30px_-15px_oklch(0.15_0.005_260_/_0.15)] dark:hover:shadow-[0_12px_30px_-15px_oklch(0.99_0_0_/_0.03)] overflow-hidden"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
            }}
          >
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(300px circle at var(--x, 0px) var(--y, 0px), var(--color-spotlight), transparent 85%)`,
              }}
            />
            <div className="relative z-10 flex flex-col gap-2 w-full h-full">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate font-semibold tracking-tight">{r.name}</h3>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              {r.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
              )}
              {r.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full border border-border/60 bg-secondary/40 px-2.5 py-0.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto flex items-center gap-3 pt-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                <span className="inline-flex items-center gap-1.5"><LangDot lang={r.language} /> {r.language ?? "—"}</span>
                {r.stars > 0 && <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> {r.stars}</span>}
                {r.homepage && <span className="ml-auto inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">● live</span>}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No repos match. Try clearing filters.
          </div>
        )}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-3xl px-6 py-28">
      <SplitTextReveal eyebrow="About" text="About Me" />
      <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
        I’m Dr RDM, a passionate Web3 developer specializing in smart contracts, React, and decentralized applications (dApps). I thrive on building and testing projects in testnets, exploring the cutting edge of blockchain technology. With 2k followers on YouTube (
        <a 
          href="https://youtube.com/@rdmdev" 
          target="_blank" 
          rel="noreferrer" 
          className="text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          @rdmdev
        </a>
        ), I love sharing my journey and knowledge with the community.
      </p>
      <div className="mt-16 space-y-10 border-l border-border pl-8">
        {timeline.map((t) => (
          <div key={t.year} className="relative">
            <span className="absolute -left-[33px] top-1.5 h-2 w-2 rounded-full bg-foreground ring-4 ring-background" />
            <div className="font-mono text-xs sm:text-sm font-bold text-muted-foreground">{t.year}</div>
            <h3 className="mt-1 font-semibold tracking-tight">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const getStyle = (i: number) => {
    const lift = -6;
    const falloff = 0.45;
    const scale = 1.1;
    const distance = activeIdx !== null ? Math.abs(i - activeIdx) : 0;
    const shift = activeIdx !== null ? lift * Math.pow(falloff, distance) : 0;
    const scaleActive = activeIdx === i ? scale : 1;
    return {
      "--shift": `${shift}px`,
      "--scale-active": scaleActive,
      transitionTimingFunction: activeIdx !== null ? "var(--avatar-ease-in)" : "var(--avatar-ease-out)",
    } as React.CSSProperties;
  };

  const links = [
    { href: "https://github.com/rdmbtc", label: "GitHub", icon: <Github className="h-4 w-4" /> },
    { href: "https://www.linkedin.com/in/natlusrun/", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
    { href: "https://www.x.com/@rdmnad", label: "X (Twitter)", icon: <TwitterIcon className="h-4 w-4" /> },
    { href: "https://discord.com", label: "Discord: therdm", icon: <DiscordIcon className="h-4 w-4" /> },
    { href: "https://youtube.com/@rdmdev", label: "YouTube", icon: <YoutubeIcon className="h-4 w-4" /> },
    { href: "mailto:hello@therdm.dev", label: "Email", icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-28 text-center">
      <SplitTextReveal eyebrow="Contact" text="Let's build together." center />
      <p className="mx-auto mt-6 max-w-md text-muted-foreground">
        Got a project in mind, or just want to chat? I reply to every message.
      </p>
      <div className="mt-10 flex flex-col items-center gap-6">
        <Magnetic radius={60} strength={0.4}>
          <a
            href="mailto:hello@therdm.dev"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_-10px_oklch(0.15_0.005_260_/_0.4)]"
          >
            Let's build together
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Magnetic>
        <div className="flex items-center gap-2 t-avatar-group">
          {links.map((link, i) => (
            <div
              key={link.label}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              style={getStyle(i)}
              className="t-avatar"
            >
              <IconLink href={link.href} label={link.label}>
                {link.icon}
              </IconLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      {children}
    </a>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
