import type { FlashcardItem } from "@/components/flashcards/FlashcardDeck";
import type { PracticeQuestion } from "@/components/practice/PracticeQuiz";
import { isValidSpecialty } from "@/data/studyGuideContent";

export type SpecialtySlug = "spi" | "vascular" | "ob-gyn" | "abdominal";

export const SPECIALTY_SLUGS: SpecialtySlug[] = ["spi", "vascular", "ob-gyn", "abdominal"];

export const DEFAULT_DECK_SLUG = "fundamentals";

type DeckTemplate = {
  slug: string;
  flashcardTitle: string;
  practiceTitle: string;
  flashcardMenuLabel: string;
  practiceMenuLabel: string;
};

const DECK_TEMPLATES: DeckTemplate[] = [
  {
    slug: "fundamentals",
    flashcardTitle: "Fundamentals of Performing Ultrasound Flashcards",
    practiceTitle: "Ultrasound Examination Fundamentals",
    flashcardMenuLabel: "Fundamentals of Performing Ultrasound...",
    practiceMenuLabel: "Ultrasound Examination Fundamentals...",
  },
  {
    slug: "transducers",
    flashcardTitle: "Transducers and Machine Functions in Sonography Flashcards",
    practiceTitle: "Transducers and Machine Functions in Sonography",
    flashcardMenuLabel: "Transducers and Machine Functions in Son...",
    practiceMenuLabel: "Transducers and Machine Functions in Son...",
  },
  {
    slug: "image-optimization",
    flashcardTitle: "Image Optimization Flashcards",
    practiceTitle: "Image Optimization Practice Questions",
    flashcardMenuLabel: "Image Optimization Flashcards",
    practiceMenuLabel: "Image Optimization Practice Questions",
  },
  {
    slug: "doppler",
    flashcardTitle: "Doppler Ultrasound Flashcards",
    practiceTitle: "Doppler Ultrasound Practice Questions",
    flashcardMenuLabel: "Doppler Ultrasound",
    practiceMenuLabel: "Doppler Ultrasound Practice Questions",
  },
  {
    slug: "bioeffects",
    flashcardTitle: "Bioeffects and Quality Assurance Flashcards",
    practiceTitle: "Bioeffects and Quality Assurance Practice Questions",
    flashcardMenuLabel: "Bioeffects and Quality Assurance Flashca...",
    practiceMenuLabel: "Bioeffects and Quality Assurance Practi...",
  },
  {
    slug: "basic-metrics",
    flashcardTitle: "Basic Metrics in Sonography Flashcards",
    practiceTitle: "Basic Metrics in Sonography Practice Questions",
    flashcardMenuLabel: "Basic Metrics in Sonography",
    practiceMenuLabel: "Basic Metrics in Sonography Practice Questions",
  },
];

/** Nested menu under Flashcards (all four header specialties). */
export const FLASHCARD_NAV_CHILDREN = DECK_TEMPLATES.map((t) => ({
  label: t.flashcardMenuLabel,
  slug: t.slug,
}));

/** Nested menu under Practice Questions (all four header specialties). */
export const PRACTICE_NAV_CHILDREN = DECK_TEMPLATES.map((t) => ({
  label: t.practiceMenuLabel,
  slug: t.slug,
}));

export type FlashcardDeckView = {
  slug: string;
  title: string;
  menuLabel: string;
  cards: FlashcardItem[];
};

export type PracticeDeckView = {
  slug: string;
  title: string;
  menuLabel: string;
  questions: PracticeQuestion[];
};

/** Demo flashcards shown on every deck until deck-specific content is added. */
const DEMO_FLASHCARDS: FlashcardItem[] = [
  {
    question: "What is ultrasound imaging?",
    answer:
      "A diagnostic technique that uses high-frequency sound waves to create images of structures inside the body based on reflected echoes.",
  },
  {
    question: "What is the Doppler effect?",
    answer:
      "A change in frequency of a wave due to relative motion between the source and receiver.",
  },
  {
    question: "What is axial resolution?",
    answer:
      "The ability to distinguish two structures lying parallel to the ultrasound beam, primarily related to spatial pulse length.",
  },
  {
    question: "What is the primary role of ultrasound gel?",
    answer:
      "To eliminate air between the transducer and skin so sound energy can transmit efficiently into the body.",
  },
  {
    question: "What does ALARA stand for in sonography?",
    answer:
      "As Low As Reasonably Achievable — minimizing patient exposure while obtaining diagnostic information.",
  },
];

/** Demo practice questions shown on every deck until deck-specific content is added. */
const DEMO_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    prompt: "What is the primary effect of shadowing artifacts in ultrasound imaging?",
    options: [
      "They create bright areas behind structures that transmit sound well",
      "They appear as dark areas beyond dense structures",
      "They enhance the overall image quality",
      "They indicate the presence of fluid-filled structures",
    ],
    correctIndex: 1,
    feedbackCorrect:
      "Correct — shadowing appears as anechoic or dark areas distal to strongly attenuating structures.",
  },
  {
    prompt: "Which Doppler angle is generally closest to ideal for spectral analysis?",
    options: ["0°", "90°", "45–60°", "180°"],
    correctIndex: 2,
    feedbackCorrect:
      "Correct — angles around 45–60° often balance good Doppler shift with practical imaging.",
  },
  {
    prompt: "What best describes the duty factor in pulsed ultrasound?",
    options: [
      "Time the transducer is receiving divided by total time",
      "Time the transducer is transmitting divided by pulse repetition period",
      "Peak rarefactional pressure divided by frequency",
      "Wavelength divided by PRF",
    ],
    correctIndex: 1,
    feedbackCorrect:
      "Correct — duty factor is transmit time divided by the pulse repetition period.",
  },
];

/** Optional per-deck overrides (API/content later). Falls back to demo set. */
const FLASHCARD_CONTENT_BY_DECK: Partial<Record<string, FlashcardItem[]>> = {};

const PRACTICE_CONTENT_BY_DECK: Partial<Record<string, PracticeQuestion[]>> = {};

function resolveFlashcardCards(_specialty: string, deckSlug: string): FlashcardItem[] {
  return FLASHCARD_CONTENT_BY_DECK[deckSlug] ?? DEMO_FLASHCARDS;
}

function resolvePracticeQuestions(_specialty: string, deckSlug: string): PracticeQuestion[] {
  return PRACTICE_CONTENT_BY_DECK[deckSlug] ?? DEMO_PRACTICE_QUESTIONS;
}

export function getFlashcardDeck(
  specialty: string | undefined,
  deckSlug: string | undefined,
): FlashcardDeckView | undefined {
  if (!specialty || !deckSlug || !isValidSpecialty(specialty)) return undefined;
  const template = DECK_TEMPLATES.find((t) => t.slug === deckSlug);
  if (!template) return undefined;
  return {
    slug: template.slug,
    title: template.flashcardTitle,
    menuLabel: template.flashcardMenuLabel,
    cards: resolveFlashcardCards(specialty, deckSlug),
  };
}

export function getPracticeDeck(
  specialty: string | undefined,
  deckSlug: string | undefined,
): PracticeDeckView | undefined {
  if (!specialty || !deckSlug || !isValidSpecialty(specialty)) return undefined;
  const template = DECK_TEMPLATES.find((t) => t.slug === deckSlug);
  if (!template) return undefined;
  return {
    slug: template.slug,
    title: template.practiceTitle,
    menuLabel: template.practiceMenuLabel,
    questions: resolvePracticeQuestions(specialty, deckSlug),
  };
}

export type ResourceDropdownLink = {
  label: string;
  slug: string;
  href?: string;
  children?: { label: string; slug: string }[];
};

/** Inject API-driven study guide items into a specialty dropdown. */
export function mergeStudyGuideNavChildren(
  links: ResourceDropdownLink[],
  studyGuideChildren: { label: string; slug: string }[],
): ResourceDropdownLink[] {
  if (!studyGuideChildren.length) return links;

  return links.map((link) =>
    link.slug === "study-guides" ? { ...link, children: studyGuideChildren } : link,
  );
}

/** Same SPI-style dropdown for SPI, Vascular, OB/GYN, and Abdominal. */
export function buildSpecialtyDropdownLinks(
  audioHref?: string,
  studyGuideChildren?: { label: string; slug: string }[],
  options?: { studyGuidesReady?: boolean },
): ResourceDropdownLink[] {
  const studyChildren =
    studyGuideChildren && studyGuideChildren.length > 0
      ? studyGuideChildren
      : options?.studyGuidesReady
        ? []
        : [{ label: "Outlines", slug: "outlines" }];

  return [
    {
      label: "Study Guides",
      slug: "study-guides",
      children: studyChildren,
    },
    { label: "Audio", slug: "audio", ...(audioHref ? { href: audioHref } : {}) },
    { label: "Flashcards", slug: "flashcards", children: FLASHCARD_NAV_CHILDREN },
    {
      label: "Practice Questions",
      slug: "practice-questions",
      children: PRACTICE_NAV_CHILDREN,
    },
  ];
}
