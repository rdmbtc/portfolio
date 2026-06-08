import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  images: string[];
  open: boolean;
  startIndex?: number;
  onClose: () => void;
  alt?: (i: number) => string;
}

export default function Lightbox({ images, open, startIndex = 0, onClose, alt }: Props) {
  const [index, setIndex] = useState(startIndex);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll + focus close button for keyboard users.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, prev, next, onClose]);

  if (!open || images.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot lightbox"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      }}
    >
      <button
        ref={closeRef}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close lightbox"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous screenshot"
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next screenshot"
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <figure className="relative flex max-h-[90vh] max-w-[92vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          key={images[index]}
          src={images[index]}
          alt={alt?.(index) ?? `Screenshot ${index + 1} of ${images.length}`}
          loading="lazy"
          decoding="async"
          className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
        />
        {images.length > 1 && (
          <figcaption className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80">
            {index + 1} / {images.length}
          </figcaption>
        )}
      </figure>
    </div>
  );
}