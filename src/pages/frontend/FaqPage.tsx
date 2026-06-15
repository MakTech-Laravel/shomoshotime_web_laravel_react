import { useEffect } from "react";
import { Link } from "react-router-dom";

import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "What specialties does Sonographer Pal cover?",
    answer:
      "We offer study materials for SPI (Ultrasound Physics), Abdomen, OB/GYN, and Vascular sonography — aligned with ARDMS®, ARRT®, and CCI® specialty examinations.",
  },
  {
    question: "Do I need a subscription to access content?",
    answer:
      "Most study guides, flashcards, practice questions, and mock exams require an active subscription. You can view pricing and sign up on our Plans page.",
  },
  {
    question: "Can I use Sonographer Pal on mobile?",
    answer:
      "Yes. The Sonographer Pal mobile app is available for iOS and Android. Your subscription and progress sync with the web platform.",
  },
  {
    question: "How often is content updated?",
    answer:
      "We regularly review and update study guides, flashcards, and practice questions to keep materials current and clinically relevant.",
  },
  {
    question: "Who can I contact for support?",
    answer:
      "Email us at info@sonographerpal.com or visit our Contact page. We typically respond within one business day.",
  },
];

export default function FaqPage() {
  useEffect(() => {
    document.title = "FAQ | Sonographer Pal";
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "py-12 lg:py-16")}>
        <h1 className="text-center font-heading text-3xl font-bold text-black sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-base text-[#444444]">
          Quick answers about Sonographer Pal study resources and subscriptions.
        </p>

        <div className="mx-auto mt-10 max-w-3xl space-y-6">
          {FAQ_ITEMS.map((item) => (
            <article
              key={item.question}
              className="rounded-md border border-[#e5e7eb] bg-white p-6 shadow-sm"
            >
              <h2 className="font-heading text-lg font-bold text-black">{item.question}</h2>
              <p className="mt-3 font-sans text-base leading-relaxed text-[#333333]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center font-sans text-sm text-[#666666]">
          Still have questions?{" "}
          <Link to="/contact" className="font-semibold text-[#b8860b] hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
