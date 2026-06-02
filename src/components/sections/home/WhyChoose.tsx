import { Clock, BookOpenCheck, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  Icon: LucideIcon;
  hint: string;
};

const FEATURES: Feature[] = [
  {
    title: "24/7 Online Access",
    hint: "Study anytime, anywhere",
    Icon: Clock,
    description:
      "Access your study materials on-demand from any device. Our platform is available 24/7 so you can study according to your schedule.",
  },
  {
    title: "Comprehensive Study Materials",
    hint: "Everything you need to succeed",
    Icon: BookOpenCheck,
    description:
      "From detailed study guides to interactive flashcards and practice questions, we provide all the resources you need to master sonography concepts.",
  },
  {
    title: "Specialty-Focused Content",
    hint: "Tailored to your exam",
    Icon: Target,
    description:
      "Our content is organized by specialty area, allowing you to focus on exactly what you need for your specific certification exam.",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const { Icon, title, description, hint } = feature;
  return (
    <article className="group rounded-2xl border border-border-light bg-card p-6 transition-shadow hover:shadow-md sm:p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-deep">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="font-heading text-lg font-semibold text-brand">{title}</h3>
      </div>
      <p className="mt-4 text-sm font-medium text-ink">{hint}</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
    </article>
  );
}

export function WhyChoose() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={cn(container)}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-ink-heading sm:text-4xl">
            Why Choose Sonographer Pal?
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-muted">
            Get full access to a trusted, comprehensive, and easy-to-use platform for on-demand
            sonography exam prep &mdash; including SPI, ARDMS&copy;, CCI&copy; RVS, and ARRT&copy;
            sonography certifications. Built for ultrasound students and professionals, each
            membership includes expert-reviewed study guides, audio versions, flashcards, and
            board-style practice questions &mdash; all available anytime, anywhere.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
