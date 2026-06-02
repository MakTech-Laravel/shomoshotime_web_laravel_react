import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export function CallToAction() {
  return (
    <section className="relative overflow-hidden ">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      

        style={{
          background:
            "linear-gradient(150deg, rgba(153, 110, 0, 0.87) 0%, rgba(255, 194, 10, 0.5) 100%)",
        }}
      />
      <div className={cn(container, "relative py-14 text-center sm:py-28")}>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
          Your Sonography Exam Success Starts Here
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-black/90 sm:text-xl">
          Join the trusted platform helping sonographers and sonography students pass their board
          exams and grow their careers!
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            type="button"
            className="h-11 rounded-lg bg-ink-heading px-7 text-base font-semibold text-white shadow-none hover:bg-ink"
          >
            <Link to="/pricing-plans">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
