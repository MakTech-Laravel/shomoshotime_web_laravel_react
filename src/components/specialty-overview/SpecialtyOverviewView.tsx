import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import type { SpecialtyOverviewContent } from "@/data/specialtyOverviewContent";
import { container } from "@/lib/container";
import { PRICING_PLANS_PATH } from "@/lib/paths";
import { cn } from "@/lib/utils";

type SpecialtyOverviewViewProps = {
  content: SpecialtyOverviewContent;
};

function IncludedStudyToolsTable({
  tools,
}: {
  tools: SpecialtyOverviewContent["includedTools"];
}) {
  return (
    <div className="overflow-hidden rounded border border-[#e5e7eb] bg-white">
      <table className="w-full border-collapse text-left font-sans text-sm text-black">
        <thead>
          <tr className="bg-[#f9fafb]">
            <th className="border-b border-[#e5e7eb] px-4 py-3 font-bold">Resource Type</th>
            <th className="border-b border-[#e5e7eb] px-4 py-3 font-bold">What&apos;s Included</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((row, i) => (
            <tr key={row.resourceType} className={i % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
              <td className="w-[40%] border-b border-[#e5e7eb] px-4 py-3 align-top font-bold">
                {row.resourceType}
              </td>
              <td className="border-b border-[#e5e7eb] px-4 py-3 align-top">{row.whatsIncluded}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SpecialtyOverviewView({ content }: SpecialtyOverviewViewProps) {
  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <section className="bg-white py-12 lg:py-16">
        <div className={cn(container, "mx-auto max-w-4xl text-center")}>
          <h1 className="font-heading text-3xl font-bold text-black sm:text-4xl">{content.heroTitle}</h1>
          <p className="mt-3 font-heading text-lg font-semibold text-[#b8860b]">{content.heroSubtitle}</p>
          {content.heroIntro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mx-auto mt-4 max-w-3xl font-sans text-base leading-relaxed text-[#444444]">
              {paragraph}
            </p>
          ))}
          <Link
            to={PRICING_PLANS_PATH}
            className="mt-8 inline-flex rounded-lg bg-[#FFC107] px-8 py-3 font-sans text-base font-semibold text-black transition hover:bg-[#e6ac00]"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      <section className="border-t border-[#e5e7eb] bg-[#f3f4f6] py-12 lg:py-16">
        <div className={cn(container, "mx-auto max-w-4xl")}>
          <h2 className="text-center font-heading text-2xl font-bold text-black sm:text-3xl">
            Included Study Tools
          </h2>
          <div className="mt-8">
            <IncludedStudyToolsTable tools={content.includedTools} />
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5e7eb] bg-white py-12 lg:py-16">
        <div className={cn(container, "mx-auto max-w-5xl")}>
          <h2 className="text-center font-heading text-2xl font-bold text-black sm:text-3xl">
            Topics Aligned to the Exam Content Outline
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.alignedTopics.map((topic) => (
              <div
                key={topic}
                className="flex items-start gap-3 rounded-md border border-[#e5e7eb] bg-[#fafafa] p-4"
              >
                <Check className="mt-0.5 size-5 shrink-0 text-[#b8860b]" aria-hidden />
                <span className="font-sans text-sm font-medium text-[#222222]">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5e7eb] bg-[#efefef] py-10 lg:py-12">
        <div className={cn(container, "mx-auto max-w-3xl text-center")}>
          <h2 className="font-heading text-xl font-bold text-black sm:text-2xl">
            Audio Versions of Study Guides
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-[#444444]">{content.audioTopics}</p>
        </div>
      </section>

      <section className="border-t border-[#e5e7eb] bg-white py-12 lg:py-16">
        <div className={cn(container, "mx-auto max-w-4xl")}>
          <h2 className="text-center font-heading text-2xl font-bold text-black sm:text-3xl">
            Why Choose Sonographer Pal?
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {content.whyChoose.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-[#b8860b]" aria-hidden />
                <span className="font-sans text-sm leading-relaxed text-[#333333]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[#e5e7eb] bg-[#f3f4f6] py-12 lg:py-16">
        <div className={cn(container, "mx-auto max-w-2xl")}>
          <h2 className="text-center font-heading text-xl font-bold text-black sm:text-2xl">
            Exam Prep Summary
          </h2>
          <div className="mt-8 overflow-hidden rounded border border-[#e5e7eb] bg-white">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <tbody>
                {content.infographic.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                    <td className="border-b border-[#e5e7eb] px-4 py-3 font-bold">{row.label}</td>
                    <td className="border-b border-[#e5e7eb] px-4 py-3">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#d4af37] to-[#fdf5ee] py-14 lg:py-20">
        <div className={cn(container, "mx-auto max-w-3xl text-center")}>
          <h2 className="font-heading text-2xl font-bold text-black sm:text-3xl">{content.bottomCtaTitle}</h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-[#333333]">{content.bottomCtaBody}</p>
          <Link
            to={PRICING_PLANS_PATH}
            className="mt-8 inline-flex rounded-lg bg-black px-8 py-3 font-sans text-base font-semibold text-white transition hover:bg-[#222222]"
          >
            Join Now
          </Link>
        </div>
      </section>
    </div>
  );
}
