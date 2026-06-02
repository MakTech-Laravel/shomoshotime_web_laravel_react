import { Link } from "react-router-dom";
import { ArrowRight, Activity, Baby, HeartPulse, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type Specialty = {
  title: string;
  description: string;
  to: string;
  Icon: LucideIcon;
};

const SPECIALTIES: Specialty[] = [
  {
    title: "SPI",
    Icon: Activity,
    to: "/spi",
    description:
      "Comprehensive review materials \u2014 including study guides, audio versions, flashcards, and practice questions \u2014 tailored for the ARDMS\u00a9 SPI (Sonography Principles & Instrumentation) exam.",
  },
  {
    title: "Abdominal Sonography",
    Icon: Stethoscope,
    to: "/abdominal",
    description:
      "Comprehensive review materials \u2014 including study guides, audio versions, flashcards, and practice questions \u2014 tailored for the ARDMS\u00a9 Abdomen and ARRT\u00a9 Sonography exams.",
  },
  {
    title: "OB/GYN Sonography",
    Icon: Baby,
    to: "/ob-gyn",
    description:
      "Comprehensive review materials \u2014 including study guides, audio versions, flashcards, and practice questions \u2014 tailored for the ARDMS\u00a9 OB/GYN and ARRT\u00a9 Sonography exams.",
  },
  {
    title: "Vascular Sonography",
    Icon: HeartPulse,
    to: "/vascular",
    description:
      "Comprehensive review materials \u2014 including study guides, audio versions, flashcards, and practice questions \u2014 tailored for the CCI\u00a9 RVS, ARDMS\u00a9 RVT, and ARRT\u00a9 Vascular Sonography exams.",
  },
];

function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  const { Icon, title, description, to } = specialty;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border-light bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md sm:p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-deep">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="font-heading text-lg font-bold text-ink-heading">{title}</h3>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-ink-muted">{description}</p>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep"
      >
        Learn More
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

export function Specialties() {
  return (
    <section className="bg-surface-soft py-16 sm:py-20">
      <div className={cn(container)}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-heading sm:text-4xl">
            Explore Sonography Specialties
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-muted">
            Access comprehensive, on-demand exam prep for ARDMS&copy;, CCI&copy;, and ARRT&copy;
            certifications &mdash; including expert-reviewed study guides with images, audio
            versions, flashcards, and realistic practice questions for SPI, OB/GYN, Abdomen,
            Vascular, and more.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {SPECIALTIES.map((specialty) => (
            <SpecialtyCard key={specialty.title} specialty={specialty} />
          ))}
        </div>
      </div>
    </section>
  );
}
