import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  text: string;
  className?: string;
  eyebrow?: string;
  center?: boolean;
}

export default function SplitTextReveal({ text, className = "", eyebrow, center = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll(".char");
    const eyebrowEl = el.querySelector(".eyebrow");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    if (eyebrowEl) {
      tl.fromTo(
        eyebrowEl,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }

    tl.fromTo(
      chars,
      { y: "115%", rotate: 1 },
      {
        y: "0%",
        rotate: 0,
        duration: 0.8,
        stagger: 0.012,
        ease: "power4.out",
      },
      eyebrowEl ? "-=0.35" : 0
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [text]);

  return (
    <div ref={containerRef} className={`${center ? "text-center" : "text-left"} ${className}`}>
      {eyebrow && (
        <p className={`eyebrow section-label font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground opacity-0 ${center ? "justify-center" : ""}`}>
          {eyebrow}
        </p>
      )}
      <h2 
        className={`font-display mt-4 text-4xl font-semibold sm:text-5xl md:text-6xl flex flex-wrap ${center ? "justify-center" : "justify-start"} leading-[1.05] text-foreground`}
        aria-label={text}
      >
        <span className="sr-only">{text}</span>
        {text.split(" ").map((word, wordIdx) => (
          <span 
            key={wordIdx} 
            className="inline-block whitespace-nowrap mr-[0.25em] overflow-hidden py-0.5" 
            aria-hidden="true"
          >
            {word.split("").map((char, charIdx) => (
              <span 
                key={charIdx} 
                className="char inline-block will-change-transform transform-gpu"
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </h2>
    </div>
  );
}
