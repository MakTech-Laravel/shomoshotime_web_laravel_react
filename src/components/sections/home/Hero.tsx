import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type Slide = {
  src: string;
  alt: string;
};

const SLIDES: Slide[] = [
  { src: "/images/hero-1.png", alt: "Ultrasound scan images grid: liver, fetal, color Doppler, and spectral Doppler" },
  { src: "/images/hero-2.png", alt: "Sonography student smiling next to her ARDMS passing score report" },
  { src: "/images/hero-3.png", alt: "Sonography student celebrating with her ARDMS Abdomen score report" },
];

const AUTOPLAY_MS = 5000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      goTo(index + 1);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, goTo]);

  return (
    <section className="relative overflow-hidden bg-hero-cream  ">
      <div
        aria-hidden
        className="pointer-events-none absolute "
      />

      <div className={cn(container, "relative grid gap-10 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24 min-h-[80vh] items-center bg-hero-cream")} >
        <div className="max-w-4xl">
          <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-ink-heading sm:text-5xl">
            Pass Your Sonography Exams
            <br />
            with Confidence
          </h1>
          <p className="mt-5 text-base leading-7 font-normal sm:text-lg text-black">
            Expert-created and reviewed exam prep materials, developed by registered sonographers
            and board-certified physicians. Get full access to SPI, ARDMS&copy;, CCI&copy;, and
            ARRT&copy; sonography exam preparation &mdash; built for ultrasound students and
            professionals.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              type="button"
              className="h-11 rounded-lg bg-brand px-6 text-base font-normal font-bai-jamjuree text-black shadow-none hover:bg-brand-deep"
            >
              <Link to="/pricing-plans">Get Started</Link>
            </Button>
            <Button
              asChild
              type="button"
              variant="outline"
              className="h-11 rounded-lg border-ink-heading/20 bg-transparent font-bai-jamjuree px-6 text-base font-normal text-ink-heading hover:bg-white"
            >
              <Link to="/exploreresources">Explore Resources</Link>
            </Button>
          </div>
        </div>

        <div className="relative w-full lg:ml-auto lg:max-w-lg">
          <div
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl shadow-amber-900/10"
            aria-roledescription="carousel"
            aria-label="Sonographer Pal student success and ultrasound imagery"
          >
            <div className="relative aspect-4/3 w-full">
              {SLIDES.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                    i === index ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden={i !== index}
                />
              ))}
            </div>

          </div>

          <div
            aria-hidden
            className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl"
          />
        </div>
      </div>
    </section>
  );
}
