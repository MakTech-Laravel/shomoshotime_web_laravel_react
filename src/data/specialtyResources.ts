import type { FlashcardItem } from "@/components/flashcards/FlashcardDeck";
import type { PracticeQuestion } from "@/components/practice/PracticeQuiz";
import { isValidSpecialty } from "@/data/studyGuideContent";

export type SpecialtySlug = "spi" | "vascular" | "ob-gyn" | "abdominal";

export const SPECIALTY_SLUGS: SpecialtySlug[] = ["spi", "vascular", "ob-gyn", "abdominal"];

export const SPECIALTY_DISPLAY_LABELS: Record<SpecialtySlug, string> = {
  spi: "SPI",
  vascular: "Vascular",
  "ob-gyn": "OB/GYN",
  abdominal: "Abdomen",
};

/** Public audio page paths (nav links). Tracks may be empty until MP3s are added in audioGuides.ts. */
export const SPECIALTY_AUDIO_HREF: Record<SpecialtySlug, string> = {
  spi: "/audio/spi",
  vascular: "/audio/vascular",
  "ob-gyn": "/audio/ob-gyn",
  abdominal: "/audio/abdominal",
};

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

function resolveFlashcardCards(_specialty: string, _deckSlug: string): FlashcardItem[] {
  return [];
}

function resolvePracticeQuestions(_specialty: string, _deckSlug: string): PracticeQuestion[] {
  return [];
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
  options?: {
    studyGuidesReady?: boolean;
    flashcardChildren?: { label: string; slug: string }[];
    practiceChildren?: { label: string; slug: string }[];
  },
): ResourceDropdownLink[] {
  const studyChildren =
    studyGuideChildren && studyGuideChildren.length > 0
      ? studyGuideChildren
      : options?.studyGuidesReady
        ? []
        : [{ label: "Outlines", slug: "outlines" }];

  const flashcardChildren =
    options?.flashcardChildren && options.flashcardChildren.length > 0
      ? options.flashcardChildren
      : [];

  const practiceChildren =
    options?.practiceChildren && options.practiceChildren.length > 0
      ? options.practiceChildren
      : [];

  return [
    {
      label: "Study Guides",
      slug: "study-guides",
      children: studyChildren,
    },
    ...(audioHref ? [{ label: "Audio", slug: "audio", href: audioHref }] : []),
    { label: "Flashcards", slug: "flashcards", children: flashcardChildren },
    {
      label: "Practice Questions",
      slug: "practice-questions",
      children: practiceChildren,
    },
  ];
}
