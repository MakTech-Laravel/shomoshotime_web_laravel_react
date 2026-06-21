import { useEffect } from "react";
import { Link } from "react-router-dom";

import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "What is Sonographer Pal?",
    answer:
      "Sonographer Pal is an e-learning platform designed to help sonography students and professionals confidently prepare for credentialing exams. Our peer-reviewed content is created and vetted by registered sonographers and physicians, ensuring both clinical accuracy and educational integrity.",
  },
  {
    question: "Who creates the content on this platform?",
    answer:
      "All content is developed and reviewed by experienced, credentialed professionals—including registered sonographers, educators, and physicians—to provide you with trustworthy, exam-focused material.",
  },
  {
    question: "How long will I have access to the content?",
    answer:
      "Access duration depends on the specific product or membership you purchase. Most subscriptions grant access for a set period (e.g., weekly, monthly, or annually), clearly indicated at checkout.",
  },
  {
    question: "Can I share my login or materials with others?",
    answer:
      "No. Your membership and access are for individual use only. Sharing logins or materials violates our terms of service and may result in revoked access without refund.",
  },
  {
    question: "Are refunds available?",
    answer:
      "All sales are final. Due to the digital nature of our content and instant access to study materials, we are unable to offer refunds or exchanges. We recommend reviewing product descriptions carefully before purchasing.",
  },
  {
    question: "Do you offer updates to content?",
    answer:
      "Yes! Our team regularly reviews and updates content to reflect current guidelines, best practices, and credentialing exam changes. Active members automatically receive updated material during their access period.",
  },
  {
    question: "Is this platform affiliated with ARDMS®, ARRT® or CCI®?",
    answer:
      "Sonographer Pal is an independent educational platform and is not affiliated with credentialing bodies like ARDMS®, ARRT® or CCI®. However, our materials are designed to align with their exam objectives and current clinical standards.",
  },
  {
    question: "Will Sonographer Pal guarantee that I pass my board exams?",
    answer:
      "While our content is designed to help you prepare thoroughly and confidently, Sonographer Pal cannot guarantee exam results. Success depends on multiple factors, including your personal study habits, comprehension, and clinical experience. Our goal is to provide trusted, expert-reviewed resources to support your journey—but exam performance is ultimately up to you.",
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
