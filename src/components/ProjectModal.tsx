import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Star } from "lucide-react";
import type { Repo } from "@/data/projects";
import { useMemo, useState } from "react";
import Lightbox from "./Lightbox";

interface Props {
  repo: Repo | null;
  onOpenChange: (open: boolean) => void;
}

const langColor: Record<string, string> = {
  TypeScript: "bg-sky-500",
  JavaScript: "bg-yellow-400",
  Dart: "bg-cyan-500",
  Python: "bg-emerald-500",
  HTML: "bg-orange-500",
  CSS: "bg-pink-500",
  MDX: "bg-violet-500",
};

export default function ProjectModal({ repo, onOpenChange }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Auto-generate screenshots from the live homepage if none provided.
  // thum.io is a free, no-key screenshot service that returns fresh PNGs.
  const screenshots = useMemo(() => {
    if (!repo) return [];
    if (repo.screenshots?.length) return repo.screenshots;
    if (repo.homepage) {
      const url = repo.homepage.replace(/^https?:\/\//, "");
      return [
        `https://image.thum.io/get/width/1280/crop/800/${url}`,
        `https://image.thum.io/get/width/1280/viewportWidth/375/${url}`,
      ];
    }
    return [];
  }, [repo]);

  return (
    <Dialog open={!!repo} onOpenChange={onOpenChange}>
      {/* Radix Dialog: focus trap, Esc to close, focus-return on close — built in. */}
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" aria-describedby={repo ? "project-modal-desc" : undefined}>
        {repo && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight">{repo.name}</DialogTitle>
              <DialogDescription id="project-modal-desc" className="text-sm text-muted-foreground">
                {repo.description ?? "No description provided."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 font-mono uppercase tracking-widest text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${repo.language ? langColor[repo.language] ?? "bg-muted-foreground/40" : "bg-muted-foreground/40"}`} />
                {repo.language ?? "—"}
              </span>
              {repo.stars > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-muted-foreground">
                  <Star className="h-3 w-3" /> {repo.stars}
                </span>
              )}
              {repo.homepage && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  ● live
                </span>
              )}
            </div>

            {/* Screenshots — click to open lightbox */}
            {screenshots.length > 0 ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  aria-label={`Open screenshots of ${repo.name}`}
                  className="group block w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-secondary via-muted to-secondary"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={screenshots[0]}
                      alt={`${repo.name} primary screenshot`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </button>
                {screenshots.length > 1 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {screenshots.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`Open screenshot ${i + 1}`}
                        className="aspect-video overflow-hidden rounded-md border border-border bg-muted transition-opacity hover:opacity-80"
                      >
                        <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 flex aspect-video items-center justify-center rounded-xl border border-border bg-gradient-to-br from-secondary via-muted to-secondary text-xs font-mono uppercase tracking-widest text-muted-foreground">
                no preview available
              </div>
            )}

            {/* Readme summary */}
            <div className="mt-6">
              <h4 className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground">Readme summary</h4>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {repo.readme ?? repo.description ?? "Open on GitHub for full documentation."}
              </p>
            </div>

            {/* Tech stack / tags */}
            <div className="mt-6">
              <h4 className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tech & tags</h4>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                {repo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Github className="h-4 w-4" /> View on GitHub
              </a>
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium transition-colors hover:border-foreground/30"
                >
                  <ExternalLink className="h-4 w-4" /> Live site
                </a>
              )}
            </div>
          </>
        )}
      </DialogContent>
      <Lightbox
        images={screenshots}
        open={lightboxIndex !== null}
        startIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        alt={(i) => `${repo?.name ?? "Project"} screenshot ${i + 1}`}
      />
    </Dialog>
  );
}