import { useState } from "react";

interface SlideViewerProps {
  slides: string[];
  alt?: string;
}

export function SlideViewer({ slides, alt = "Slide" }: SlideViewerProps) {
  const [index, setIndex] = useState(0);

  if (slides.length === 0) return null;

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <div className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-stone">
        <img
          src={slides[index]}
          alt={`${alt} ${index + 1} of ${slides.length}`}
          className="aspect-[16/9] w-full object-contain bg-black"
        />

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          ›
        </button>

        <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground">
          {index + 1} / {slides.length}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-14 w-24 flex-none overflow-hidden rounded-lg border transition-opacity ${
              i === index ? "border-primary opacity-100" : "border-border opacity-50 hover:opacity-80"
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
