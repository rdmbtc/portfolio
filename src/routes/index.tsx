import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Github, Mail, Linkedin, Check, ArrowUpRight, Star, ExternalLink, Search, X } from "lucide-react";
import ScrollSequence from "@/components/ScrollSequence";
import HorizontalScroll from "@/components/HorizontalScroll";
import SectionNav from "@/components/SectionNav";
import ProjectModal from "@/components/ProjectModal";
import ProjectStory from "@/components/ProjectStory";
import { Input } from "@/components/ui/input";
import { repos, allTags, type Repo } from "@/data/projects";
import PerfHud from "@/components/PerfHud";
import { useRepoMeta } from "@/hooks/useRepoMeta";

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

function Index() {
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null);
  const meta = useRepoMeta();

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
      {/* Scroll-scrubbed canvas sequence for 2.mp4 at the end of the website */}
      <ScrollSequence
        frameCount={240}
        framePath={(i) => `/frames2/frame_${String(i).padStart(4, "0")}.jpg`}
      >
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <p className="rounded-full border border-border/70 bg-background/70 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
            scroll-driven · 240 frames · canvas (outro)
          </p>
        </div>
      </ScrollSequence>
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} RDM · therdm.dev
      </footer>
      <ProjectModal repo={activeRepo} onOpenChange={(o) => !o && setActiveRepo(null)} />
      <PerfHud />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="text-sm font-semibold tracking-tight">
          <span className="t-shimmer" data-text="RDM.dev">
            RDM<span className="text-muted-foreground">.dev</span>
          </span>
        </a>
        <nav className="hidden gap-8 text-sm text-muted-foreground sm:flex">
          <a href="#work" className="hover:text-foreground transition-colors">Work</a>
          <a href="#repos" className="hover:text-foreground transition-colors">Repos</a>
          <a href="#stack" className="hover:text-foreground transition-colors">Stack</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
        <a href="#contact" className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity relative">
          Get in touch
          <span className="t-badge" data-open="true">
            <span className="t-badge-dot h-1.5 w-1.5 rounded-full bg-emerald-400 border border-background" />
          </span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const [isShown, setIsShown] = useState(false);
  useEffect(() => {
    setIsShown(true);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center">
        <div className="h-[350px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />
        <div className="h-[250px] w-[400px] rounded-full bg-pink-500/10 blur-[100px] dark:bg-pink-500/5 -ml-20" />
      </div>

      {/* Intro */}
      <div className={`relative mx-auto max-w-6xl px-6 pt-24 pb-16 text-center sm:pt-32 t-stagger ${isShown ? "is-shown" : ""}`}>
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground t-stagger-line t-stagger-line--1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Available for new work · Q3 2026
        </div>
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl t-stagger-line t-stagger-line--2 leading-tight">
          Clean, modern web products,<br />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            shipped with care.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg t-stagger-line t-stagger-line--3">
          I'm RDM — a full-stack developer building fast, considered interfaces with React, Next.js and TypeScript.
        </p>
        <p className="mt-4 text-sm text-muted-foreground t-stagger-line t-stagger-line--4">
          <span className="typing font-mono">therdm.dev</span>
        </p>
        <p className="mt-10 animate-bounce font-mono text-xs uppercase tracking-widest text-muted-foreground t-stagger-line t-stagger-line--5">
          ↓ scroll
        </p>
      </div>

      {/* Scroll-scrubbed canvas sequence */}
      <ScrollSequence
        frameCount={240}
        framePath={(i) => `/frames/frame_${String(i).padStart(4, "0")}.jpg`}
      >
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <p className="rounded-full border border-border/70 bg-background/70 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
            scroll-driven · 240 frames · canvas
          </p>
        </div>
      </ScrollSequence>
    </section>
  );
}

function Skills() {
  return (
    <section id="stack" className="mx-auto max-w-6xl px-6 py-28">
      <SectionLabel eyebrow="Stack" title="A precise, modern toolkit." />
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stack.map((s, i) => (
          <div
            key={s}
            className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-foreground/20"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-sm font-medium">{s}</span>
            <Check className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-emerald-500" strokeWidth={2.5} />
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
            <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
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
          <span key={i} className="font-mono text-2xl text-muted-foreground/70 sm:text-3xl">
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
        <SectionLabel eyebrow="Stories" title="Per-project scroll-scrub stories." center />
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
        <SectionLabel eyebrow="Featured" title="Selected work, side by side." />
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
            <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-secondary via-muted to-secondary">
              <BrowserMock title={r.name} />
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-border p-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <LangDot lang={r.language} /> {r.language ?? "—"}
                  {r.stars > 0 && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {r.stars}</span>}
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

function BrowserMock({ title }: { title: string }) {
  return (
    <div className="absolute inset-6 rounded-xl border border-border bg-background shadow-sm">
      <div className="flex h-7 items-center gap-1.5 border-b border-border px-3">
        <span className="h-2 w-2 rounded-full bg-red-400/60" />
        <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
        <span className="ml-3 truncate font-mono text-[10px] text-muted-foreground">{title.toLowerCase().replace(/\s/g, "-")}.app</span>
      </div>
      <div className="space-y-3 p-5">
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
        <SectionLabel eyebrow={`All · ${items.length}`} title="Everything in the open." />
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

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {filtered.length} of {repos.length} shown
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <button
            key={r.name}
            onClick={() => onOpen(r)}
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_12px_30px_-15px_oklch(0.15_0.005_260_/_0.2)]"
          >
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
                  <span key={tag} className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-auto flex items-center gap-3 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><LangDot lang={r.language} /> {r.language ?? "—"}</span>
              {r.stars > 0 && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {r.stars}</span>}
              {r.homepage && <span className="ml-auto inline-flex items-center gap-1 text-emerald-600/80">● live</span>}
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
      <SectionLabel eyebrow="About" title="A simple journey." />
      <div className="mt-12 space-y-10 border-l border-border pl-8">
        {timeline.map((t) => (
          <div key={t.year} className="relative">
            <span className="absolute -left-[33px] top-1.5 h-2 w-2 rounded-full bg-foreground ring-4 ring-background" />
            <div className="font-mono text-xs text-muted-foreground">{t.year}</div>
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
    { href: "https://github.com", label: "GitHub", icon: <Github className="h-4 w-4" /> },
    { href: "https://linkedin.com", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
    { href: "mailto:hello@therdm.dev", label: "Email", icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-28 text-center">
      <SectionLabel eyebrow="Contact" title="Let's build together." center />
      <p className="mx-auto mt-6 max-w-md text-muted-foreground">
        Got a project in mind, or just want to chat? I reply to every message.
      </p>
      <div className="mt-10 flex flex-col items-center gap-6">
        <a
          href="mailto:hello@therdm.dev"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_-10px_oklch(0.15_0.005_260_/_0.4)]"
        >
          Let's build together
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
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

function SectionLabel({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
