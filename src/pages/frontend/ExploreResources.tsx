import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

const FLASHCARDS = [
  {
    q: "What is the Doppler effect?",
    a: "A change in frequency of a wave due to relative motion between the source and receiver.",
  },
  {
    q: "What is axial resolution?",
    a: "The ability to distinguish two structures lying parallel to the ultrasound beam, primarily related to spatial pulse length.",
  },
  {
    q: "What is the primary role of ultrasound gel?",
    a: "To eliminate air between the transducer and skin so sound energy can transmit efficiently into the body.",
  },
  {
    q: "What does ALARA stand for in sonography?",
    a: "As Low As Reasonably Achievable — minimizing patient exposure while obtaining diagnostic information.",
  },
] as const;

const PRACTICE = [
  {
    q: "What is the primary consequence of renal artery stenosis?",
    options: [
      "Increased blood flow to the kidneys",
      "Reduced blood flow to the kidneys",
      "Improved kidney function",
      "Decreased risk of hypertension",
    ],
    correctIndex: 1,
    feedbackCorrect: "Correct — renal artery stenosis typically reduces perfusion to the affected kidney.",
  },
  {
    q: "Which Doppler angle is generally closest to ideal for spectral analysis?",
    options: ["0°", "90°", "45–60°", "180°"],
    correctIndex: 2,
    feedbackCorrect: "Correct — angles around 45–60° often balance good Doppler shift with practical imaging.",
  },
  {
    q: "What best describes the duty factor in pulsed ultrasound?",
    options: [
      "Time the transducer is receiving divided by total time",
      "Time the transducer is transmitting divided by pulse repetition period",
      "Peak rarefactional pressure divided by frequency",
      "Wavelength divided by PRF",
    ],
    correctIndex: 1,
    feedbackCorrect: "Correct — duty factor is transmit time divided by the pulse repetition period.",
  },
  {
    q: "Which artifact appears as a duplicated structure deeper than the true reflector?",
    options: ["Reverberation", "Mirror image", "Shadowing", "Speed displacement"],
    correctIndex: 1,
    feedbackCorrect: "Correct — mirror image artifact creates a duplicated structure on the far side of a strong reflector.",
  },
  {
    q: "Bioeffects of ultrasound are primarily categorized as:",
    options: [
      "Thermal and mechanical indices only",
      "Thermal and mechanical (cavitational) mechanisms",
      "Electrical and magnetic only",
      "Ionizing radiation effects",
    ],
    correctIndex: 1,
    feedbackCorrect: "Correct — thermal and mechanical (including cavitational) effects are the main bioeffect categories discussed for diagnostic ultrasound.",
  },
] as const;

const AUDIO_DEMO_TRACK = {
  src: "/audio/Explore Resources - Sonographerpal.mp3",
  title: "Audio Study Guide Demo - Pathologic Ovarian Cysts",
  artist: "sonographerpal",
  album: "Explore Resources (Demo)",
};

const MEMBERSHIP_FEATURES = [
  {
    title: "Study Guides for Each Specialty",
    body:
      "Access study guides with images on-demand for Abdomen, OB/GYN, Vascular, and Ultrasound Physics. Built for sonography students and professionals preparing for SPI, ARDMS®, CCI®, and ARRT® certification exams.",
  },
  {
    title: "Audio Study Guides",
    body:
      "Listen to audio versions of study guides for Abdomen, OB/GYN, Vascular, and Ultrasound Physics. Designed for sonography students and professionals preparing for SPI, ARDMS®, CCI®, and ARRT® certification exams.",
  },
  {
    title: "Flashcards",
    body:
      "Access interactive flashcards for Abdomen, OB/GYN, Vascular, and Ultrasound Physics. Created for sonography students and professionals preparing for SPI, ARDMS®, CCI®, and ARRT® certification exams.",
  },
  {
    title: "Practice Questions",
    body:
      "Practice board-style questions for Abdomen, OB/GYN, Vascular, and Ultrasound Physics. Built for sonography students and professionals preparing for SPI, ARDMS®, CCI®, and ARRT® certification exams.",
  },
  {
    title: "Mock Exams",
    body:
      "All subscriptions include full-length simulated exams for ARDMS SPI, ARDMS Abdomen, ARDMS OB/GYN, ARDMS RVT, ARRT(S), and CCI RVS. Built to mirror the actual board exam experience with matching difficulty levels and comprehensive coverage of the essential concepts you'll face on test day.",
  },
] as const;

function MembershipSection() {
  return (
    <section className="border-t border-border-light bg-white py-16 lg:py-24">
      <div className={cn(container)}>
        <h1 className="text-center font-heading text-[32px] font-bold leading-tight tracking-tight text-black sm:text-[36px] lg:text-[40px]">
          Your Membership Includes:
        </h1>

        <div className="mx-auto mt-8 max-w-4xl text-center sm:mt-10">
          <p className="font-sans text-base font-bold leading-relaxed text-black sm:text-lg">
            All the ARDMS&reg;, ARRT&reg;, and CCI&reg; Prep You Need &ndash; All in One Place, All Backed by Experts.
          </p>
          <p className="mt-4 font-sans text-base font-normal leading-relaxed text-black sm:text-lg">
            Developed and reviewed by credentialed sonographers and board-certified physicians to ensure you&apos;re learning
            what really matters.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-8 lg:mt-16  lg:gap-x-10 lg:gap-y-8">
          {MEMBERSHIP_FEATURES.map((item) => (
            <article
              key={item.title}
              className="rounded-md border border-[#e8e8e8] bg-white p-8 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-9"
            >
              <h2 className="font-heading text-xl font-bold leading-snug text-black sm:text-2xl">{item.title}</h2>
              <p className="mt-4 font-sans text-base leading-[1.65] text-black">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const STUDY_GUIDE_ORCHITIS_CARDS: { title: string; body: ReactNode }[] = [
  {
    title: "Pathophysiology",
    body: "Inflammation of the testicle, frequently as an extension of epididymitis",
  },
  {
    title: "Sonographic Appearance",
    body: (
      <>
        Enlarged hypoechoic testicle with{" "}
        <strong className="font-semibold text-black">increased blood flow and decreased resistance</strong>
      </>
    ),
  },
  {
    title: "Common Causes",
    body: "Sexually transmitted infections, viral infections (e.g., mumps), bacterial spread from epididymitis",
  },
];

function StudyGuidesDemo() {
  return (
    <section className="border-t border-border-light bg-footer-bar py-16 lg:py-24">
      <div className={cn(container)}>
        <h3 className="mb-8 px-2 text-center font-heading text-2xl font-bold leading-tight tracking-tight text-black sm:mb-10 sm:text-3xl lg:mb-12 lg:text-[40px]">
          Study Guides Demo
        </h3>

        <div className="mx-auto w-full max-w-[980px] overflow-hidden rounded-lg border border-black/6 bg-white shadow-[0_4px_28px_rgba(15,23,42,0.1)]">
          <div className="relative px-4 py-6 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="mb-4 flex justify-end sm:absolute sm:right-8 sm:top-8 sm:mb-0 lg:right-10 lg:top-10">
              <Link to="/" className="inline-block" aria-label="Sonographer Pal home">
                <img
                  src="/images/logo.png"
                  alt="Sonographer Pal"
                  width={200}
                  height={92}
                  className="h-7 w-auto select-none object-contain opacity-90 sm:h-9"
                  draggable={false}
                />
              </Link>
            </div>

            <article className="max-w-none sm:pr-28">
              <h4 className="font-heading text-2xl font-bold leading-tight text-black sm:text-[26px] lg:text-[28px]">
                Inflammatory Conditions: Orchitis
              </h4>
              <p className="mt-5 max-w-3xl font-sans text-base leading-[1.7] text-black sm:text-[17px]">
                Orchitis is inflammation of the testicle, often extending from epididymitis. Acute orchitis typically
                presents as an{" "}
                <strong className="font-semibold text-black">
                  enlarged hypoechoic testicle with increased blood flow and decreased resistance.
                </strong>
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                {STUDY_GUIDE_ORCHITIS_CARDS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-black/4 bg-[#f7f0e4] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-6 sm:py-6"
                  >
                    <h5 className="font-heading text-lg font-bold text-black">{item.title}</h5>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-black sm:text-[15px]">{item.body}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlashcardsDemo() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const card = FLASHCARDS[idx];

  return (
    <section className="border-t border-border-light bg-[#f5f5f5] py-16 lg:py-24">
      <div className={cn(container)}>
        <h3 className="text-center font-heading text-[32px] font-bold leading-tight tracking-tight text-black sm:text-[36px]">
          Interactive Flashcards Demo
        </h3>

        <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-[#e5e5e5] bg-white px-4 py-8 shadow-sm sm:mt-12 sm:px-10 sm:py-10 md:px-14 md:py-12 lg:px-16 lg:py-14">
          <p className="text-center font-sans text-base font-bold text-black">
            Question {idx + 1} of {FLASHCARDS.length}
          </p>
          <h4 className="mt-5 text-center font-sans text-lg font-bold leading-snug text-pretty text-black break-words sm:text-xl">{card.q}</h4>

          {show ? (
            <p className="mx-auto mt-8 max-w-xl text-center font-sans text-base font-normal leading-relaxed text-black">
              {card.a}
            </p>
          ) : null}

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="rounded-lg border-2 border-[#FFC107] bg-transparent px-8 py-2.5 font-sans text-sm font-medium text-[#b8860b] transition-colors hover:bg-[#FFC107]/10 sm:text-base"
            >
              {show ? "Hide Answer" : "Show Answer"}{" "}
              <span aria-hidden className="font-normal">
                &gt;
              </span>
            </button>
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-md justify-center gap-3 sm:gap-4">
            <button
              type="button"
              disabled={idx === 0}
              onClick={() => {
                setIdx((i) => Math.max(0, i - 1));
                setShow(false);
              }}
              className="min-h-11 flex-1 rounded-lg bg-[#FFC107] px-6 font-sans text-sm font-semibold text-black shadow-none transition-opacity hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
            >
              Back
            </button>
            <button
              type="button"
              disabled={idx >= FLASHCARDS.length - 1}
              onClick={() => {
                setIdx((i) => Math.min(FLASHCARDS.length - 1, i + 1));
                setShow(false);
              }}
              className="min-h-11 flex-1 rounded-lg bg-[#FFC107] px-6 font-sans text-sm font-semibold text-black shadow-none transition-opacity hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PracticeDemo() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const item = PRACTICE[idx];
  const isCorrect = picked === item.correctIndex;
  const correctLabel = item.options[item.correctIndex];

  function submit() {
    if (picked === null) return;
    setSubmitted(true);
  }

  function next() {
    if (idx < PRACTICE.length - 1) {
      setIdx((i) => i + 1);
      setPicked(null);
      setSubmitted(false);
    }
  }

  return (
    <section className="border-t border-border-light bg-white py-14 lg:py-20">
      <div className={cn(container)}>
        <h3 className="text-center font-heading text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Practice Questions Demo
        </h3>

        <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-gray-200 bg-white px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-center text-sm font-bold text-black sm:text-base">
            Question {idx + 1} of {PRACTICE.length}
          </p>
          <h4 className="mt-5 text-center text-base font-bold leading-snug text-pretty text-black break-words sm:text-lg">{item.q}</h4>

          <div className="mx-auto mt-8 max-w-md space-y-3">
            {item.options.map((opt, i) => (
              <label
                key={`${idx}-${opt}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border border-transparent py-1.5 pl-1 pr-2 transition-colors",
                  "hover:bg-gray-50",
                  picked === i && !submitted && "bg-gray-50",
                )}
              >
                <input
                  type="radio"
                  name={`practice-opt-${idx}`}
                  disabled={submitted}
                  className="size-[18px] shrink-0 border-2 border-gray-300 bg-white text-gray-800 accent-gray-700 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:opacity-60"
                  checked={picked === i}
                  onChange={() => {
                    setPicked(i);
                    setSubmitted(false);
                  }}
                />
                <span className="text-left text-base font-normal leading-snug text-pretty text-black break-words">{opt}</span>
              </label>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={submit}
              disabled={picked === null || submitted}
              className={cn(
                "inline-flex items-center gap-1 rounded border-2 px-8 py-2.5 text-sm font-normal transition-colors",
                "border-[#B8956E] bg-gray-100",
                picked !== null && !submitted
                  ? "text-gray-800 hover:bg-gray-200"
                  : "cursor-not-allowed text-gray-400",
              )}
            >
              Submit Answer <span aria-hidden className="font-normal">&gt;</span>
            </button>
          </div>

          {submitted ? (
            <div className="mt-8 space-y-5">
              {!isCorrect ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-base font-semibold text-[#F06292]">
                    <X className="size-6 shrink-0 stroke-[2.5]" strokeLinecap="round" aria-hidden />
                    Incorrect!
                  </div>
                  <div className="flex items-start justify-center gap-3 text-left text-base font-normal text-black">
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#2E7D32] text-white"
                      aria-hidden
                    >
                      <Check className="size-4 stroke-3" />
                    </span>
                    <span>
                      <span className="font-medium">Correct Answer: </span>
                      {correctLabel}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-base font-semibold text-[#2E7D32]">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#2E7D32] text-white"
                    aria-hidden
                  >
                    <Check className="size-4 stroke-3" />
                  </span>
                  Correct!
                </div>
              )}
            </div>
          ) : (
            <p className="mt-8 min-h-6 text-center text-sm text-gray-400">
              Feedback will appear here after you submit.
            </p>
          )}

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={next}
              disabled={idx >= PRACTICE.length - 1}
              className={cn(
                "w-full max-w-xs rounded-md px-8 py-3 text-base font-medium text-black shadow-none transition-colors sm:min-w-[200px] sm:w-auto",
                "bg-[#FFB300] hover:bg-[#E6A300] disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudioDemo() {
  return (
    <section className="border-t border-border-light bg-[#efefef] py-14 lg:py-20 xl:py-32">
      <div className={cn(container)}>
        <h3 className="font-heading text-center text-2xl font-bold text-black sm:text-3xl lg:text-[40px]">
          Audio Study Guides Demo
        </h3>

        <AudioPlayer
          tracks={[AUDIO_DEMO_TRACK]}
          className="mx-auto mt-10 w-full max-w-4xl"
        />
      </div>
    </section>
  );
}

type OutlineCardData = {
  cardTitle: string;
  subtitle: string;
  audioHref?: string;
  rows: { label: string; value: string }[];
};

const OUTLINE_CARDS: OutlineCardData[] = [
  {
    cardTitle: "SPI Outlines",
    subtitle: "SPI",
    audioHref: "/audio/spi",
    rows: [
      { label: "Study Guides (Text-Based and Audio)", value: "5 Guides" },
      { label: "Flashcards", value: "370 Cards" },
      { label: "Practice Questions", value: "500 Questions" },
      {
        label: "Topics Covered...",
        value:
          "Fundamentals of Ultrasound - Transducers & Machine Functions - Image Optimization - Doppler Ultrasound - Artifacts - Basic Math.",
      },
    ],
  },
  {
    cardTitle: "Abdomen Outlines",
    subtitle: "Abdomen",
    rows: [
      { label: "Study Guides (Text-Based and Audio)", value: "12 Guides" },
      { label: "Flashcards", value: "700 Cards" },
      { label: "Practice Questions", value: "700 Questions" },
      {
        label: "Topics Covered...",
        value:
          "Liver, Biliary System, Pancreas - Urinary & Reproductive Systems - Thyroid, GI Tract, Spleen - Abdomen Wall, VUR, Procedures.",
      },
    ],
  },
  {
    cardTitle: "OB/GYN Outlines",
    subtitle: "OB/GYN",
    rows: [
      { label: "Study Guides (Text-Based and Audio)", value: "11 Guides" },
      { label: "Flashcards", value: "600 Cards" },
      { label: "Practice Questions", value: "500 Questions" },
      {
        label: "Topics Covered...",
        value:
          "Pelvic & Reproductive Anatomy - Gynecologic & Obstetric Pathology - Trimester-Specific Fetal Development - Placenta, Umbilical Cord, Patient Care.",
      },
    ],
  },
  {
    cardTitle: "Vascular Outlines",
    subtitle: "Vascular",
    rows: [
      { label: "Study Guides (Text-Based and Audio)", value: "8 Guides" },
      { label: "Flashcards", value: "580 Cards" },
      { label: "Practice Questions", value: "500 Questions" },
      {
        label: "Topics Covered...",
        value:
          "Vascular Anatomy & Pathology - Surgical Alterations - Physiologic Exams - Ultrasound-Guided Procedures - Safety & Quality Assurance.",
      },
    ],
  },
];

function OutlinesSection() {
  return (
    <section className="border-t border-border-light bg-[#f3f4f6] py-14 lg:py-20">
      <div className={cn(container)}>
        <h2 className="mb-4 text-center font-heading text-[2rem] font-bold leading-tight tracking-wide text-black sm:mb-6 sm:text-[40px]">
          Content Outlines by Specialty
        </h2>
        <p className="mx-auto max-w-3xl text-center font-sans text-base font-normal leading-tight tracking-tight text-neutral-700">
          Comprehensive outlines showing what&apos;s covered in each specialty area
        </p>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          {OUTLINE_CARDS.map((card) => (
            <div key={card.cardTitle} className="flex flex-col">
              <h3 className="mb-2 text-center font-heading text-[1.25rem] font-bold leading-snug text-black">
                {card.cardTitle}
              </h3>
              <article className="flex flex-1 flex-col rounded-md border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
                <h4 className="mb-4 text-left font-heading text-[1.5rem] font-bold leading-tight text-black">
                  {card.subtitle}
                </h4>

                <div className="overflow-hidden rounded border border-[#e5e7eb]">
                  <table className="w-full border-collapse text-left font-sans text-[0.875rem] leading-snug text-black">
                    <tbody>
                      {card.rows.map((row, i) => {
                        const isLast = i === card.rows.length - 1;
                        return (
                          <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                            <td
                              className={cn(
                                "w-[48%] px-3 py-2.5 align-top font-bold sm:w-[46%] sm:px-4 sm:py-3",
                                isLast ? "border-b-0" : "border-b border-[#e5e7eb]",
                              )}
                            >
                              {row.label}
                            </td>
                            <td
                              className={cn(
                                "px-3 py-2.5 align-top font-normal break-words sm:px-4 sm:py-3",
                                isLast ? "border-b-0" : "border-b border-[#e5e7eb]",
                              )}
                            >
                              {row.value}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {card.audioHref && (
                  <Link
                    to={card.audioHref}
                    className="mt-4 inline-flex items-center gap-2 self-start rounded border border-[#b8860b] px-4 py-2 text-sm font-semibold text-[#b8860b] transition-colors hover:bg-[#b8860b] hover:text-white"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                    Listen Audio Guides
                  </Link>
                )}
              </article>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-5xl text-center font-sans text-[0.875rem] font-normal leading-relaxed text-neutral-800 sm:mt-8">
          <strong className="font-bold text-black">Note:</strong> We&apos;re always working to improve your study experience!
          The total number of questions and flashcards may change slightly over time as we update, refine, or replace content
          to keep it current and high quality.
        </p>

        <div className="mt-8 flex justify-center pb-2 sm:mt-10">
          <Link
            to="/pricing-plans"
            className="inline-flex items-center justify-center rounded border border-black bg-[#ffc107] px-10 py-2.5 font-sans text-[0.875rem] font-bold text-black transition hover:bg-[#f5b41a] sm:text-base"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ExploreResources() {
  useEffect(() => {
    document.title = "Explore Resources | Sonographer Pal";
  }, []);

  return (
    <>
      <MembershipSection />
      <StudyGuidesDemo />
      <FlashcardsDemo />
      <PracticeDemo />
      <AudioDemo />
      <OutlinesSection />
    </>
  );
}
