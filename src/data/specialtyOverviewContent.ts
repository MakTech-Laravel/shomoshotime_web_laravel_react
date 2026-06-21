import type { SpecialtySlug } from "@/data/specialtyResources";

export type SpecialtyOverviewContent = {
  metaTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroIntro: string[];
  includedTools: { resourceType: string; whatsIncluded: string }[];
  examTopicsSummary: string;
  alignedTopics: string[];
  audioTopics: string;
  whyChoose: string[];
  infographic: { label: string; value: string }[];
  bottomCtaTitle: string;
  bottomCtaBody: string;
};

export type OutlineCardData = {
  slug: SpecialtySlug;
  cardTitle: string;
  subtitle: string;
  rows: { label: string; value: string }[];
};

const SPI_OVERVIEW: SpecialtyOverviewContent = {
  metaTitle: "SPI (Sonography Principles & Instrumentation) Exam Prep",
  heroTitle: "SPI (Sonography Principles & Instrumentation) Exam Prep",
  heroSubtitle: "Pass Your SPI Exam with Confidence",
  heroIntro: [
    "Prepare for the ARDMS® SPI (Sonography Principles & Instrumentation) exam using trusted, expert-reviewed materials created and reviewed by field experts — including registered sonographers and board-certified physicians.",
    "Our comprehensive SPI prep covers all major exam topics with on-demand study resources, built for ultrasound students and professionals seeking ARDMS® certification.",
  ],
  includedTools: [
    { resourceType: "Study Guides (Text & Audio)", whatsIncluded: "6 complete guides covering the full SPI exam content outline" },
    { resourceType: "Flashcards", whatsIncluded: "570 interactive cards for rapid review of key concepts" },
    { resourceType: "Practice Questions", whatsIncluded: "500 board-style SPI exam questions" },
    { resourceType: "Exam Topics Covered", whatsIncluded: "Fundamentals of Ultrasound, Transducers & Machine Functions, Image Optimization, Doppler Ultrasound, Bioeffects, Basic Metrics" },
  ],
  examTopicsSummary: "Fundamentals of Ultrasound, Transducers & Machine Functions, Image Optimization, Doppler Ultrasound, Bioeffects, Basic Metrics",
  alignedTopics: [
    "Fundamentals of Ultrasound Physics",
    "Transducers & Instrumentation",
    "Ultrasound Machine Functions",
    "Image Optimization Techniques",
    "Doppler Principles & Applications",
    "Bioeffects & Patient Safety",
    "Basic Measurements & Calculations",
  ],
  audioTopics:
    "Fundamentals of Ultrasound, Transducers & Machine Functions, Image Optimization, Doppler Ultrasound, Bioeffects, Basic Metrics",
  whyChoose: [
    "Created and reviewed by registered sonographers and board-certified physicians",
    "Comprehensive, on-demand access — study anytime, anywhere",
    "Board-style practice questions",
    "Fully aligned with the ARDMS® SPI exam content outline",
    "Flashcards designed for rapid recall and concept reinforcement",
    "Trusted by sonographers",
    "Accessible on desktop, tablet, and mobile devices",
  ],
  infographic: [
    { label: "Study Guides (Text & Audio)", value: "6 Guides" },
    { label: "Flashcards", value: "570 Cards" },
    { label: "Practice Questions", value: "500 Questions" },
    { label: "Topics Covered", value: "Fundamentals, Transducers, Image Optimization, Doppler, Bioeffects, Basic Metrics" },
  ],
  bottomCtaTitle: "Get Full Access Today",
  bottomCtaBody:
    "Start your SPI exam prep with Sonographer Pal and gain instant access to all study guides, audio content, flashcards, and practice questions designed specifically for the ARDMS® SPI certification exam.",
};

const ABDOMINAL_OVERVIEW: SpecialtyOverviewContent = {
  metaTitle: "Abdominal Sonography Exam Prep",
  heroTitle: "Pass Your Abdominal Sonography Exams with Confidence",
  heroSubtitle: "Abdominal Sonography Exam Prep",
  heroIntro: [
    "Prepare for the ARDMS® Abdomen and ARRT® Sonography certification exams using trusted, expert-reviewed materials created and reviewed by field experts — including registered sonographers and board-certified physicians.",
    "Our comprehensive Abdominal Sonography prep covers all major exam topics with on-demand study resources, designed for ultrasound students and professionals pursuing credentialing through ARDMS® and ARRT®.",
  ],
  includedTools: [
    { resourceType: "Study Guides (Text & Audio)", whatsIncluded: "Comprehensive abdominal ultrasound study guides" },
    { resourceType: "Flashcards", whatsIncluded: "Interactive flashcards covering anatomy, pathology, and protocols" },
    { resourceType: "Practice Questions", whatsIncluded: "Board-style practice questions for ARDMS® Abdomen and ARRT® Sonography" },
    { resourceType: "Exam Topics Covered", whatsIncluded: "Liver, Gallbladder & Biliary Tree, Pancreas, Kidneys & Urinary System, Spleen, Abdominal Vasculature, GI Tract, and Retroperitoneum" },
  ],
  examTopicsSummary:
    "Liver, Gallbladder & Biliary Tree, Pancreas, Kidneys & Urinary System, Spleen, Abdominal Vasculature, GI Tract, and Retroperitoneum",
  alignedTopics: [
    "Liver Anatomy & Pathology",
    "Gallbladder & Biliary System",
    "Pancreatic Anatomy & Pathology",
    "Kidneys, Ureters & Bladder",
    "Spleen Anatomy & Disorders",
    "GI Tract and Appendix",
    "Retroperitoneum and Lymphatics",
    "Abdominal Wall and Peritoneum",
    "Abdominal Vasculature (Aorta, IVC, Renal Vessels, Portal Venous System)",
  ],
  audioTopics:
    "All abdominal sonography study guides are available in audio format, allowing for convenient, flexible learning during your daily routine.",
  whyChoose: [
    "Created and reviewed by registered sonographers and board-certified physicians",
    "On-demand access anytime, anywhere",
    "Board-style practice questions",
    "Flashcards designed for efficient recall and mastery",
    "Trusted by sonographers",
    "Aligned with ARDMS® and ARRT® exam outlines",
    "Mobile, tablet, and desktop friendly",
  ],
  infographic: [
    { label: "Study Guides (Text & Audio)", value: "12 Guides" },
    { label: "Flashcards", value: "700 Cards" },
    { label: "Practice Questions", value: "700 Questions" },
    { label: "Topics Covered", value: "Liver, Biliary, Pancreas, Urinary, Thyroid, GI, Spleen, Abdomen Wall, MSK" },
  ],
  bottomCtaTitle: "Get Full Access Today",
  bottomCtaBody:
    "Start your Abdominal Sonography exam prep with Sonographer Pal and gain immediate access to all study guides, audio versions, flashcards, and practice questions designed for ARDMS® Abdomen and ARRT® Sonography certification exams.",
};

const OB_GYN_OVERVIEW: SpecialtyOverviewContent = {
  metaTitle: "OB/GYN Sonography Exam Prep",
  heroTitle: "Pass Your OB/GYN Sonography Exams with Confidence",
  heroSubtitle: "OB/GYN Sonography Exam Prep",
  heroIntro: [
    "Prepare for the ARDMS® OB/GYN and ARRT® Sonography certification exams using trusted, expert-reviewed materials created and reviewed by field experts — including registered sonographers and board-certified physicians.",
    "Our comprehensive OB/GYN Sonography prep covers all major exam topics with on-demand study resources, designed for ultrasound students and professionals pursuing credentialing through ARDMS® and ARRT®.",
  ],
  includedTools: [
    { resourceType: "Study Guides (Text & Audio)", whatsIncluded: "Comprehensive OB/GYN ultrasound study guides covering anatomy, pathology, and protocols" },
    { resourceType: "Flashcards", whatsIncluded: "Interactive flashcards for reproductive system, pregnancy, and fetal development" },
    { resourceType: "Practice Questions", whatsIncluded: "Board-style practice questions for ARDMS® OB/GYN and ARRT® Sonography exams" },
    { resourceType: "Exam Topics Covered", whatsIncluded: "Female Pelvis, Uterus, Ovaries, Menstrual Cycle, First Trimester, Second & Third Trimester, Fetal Growth & Development, Fetal Anomalies, Maternal Complications, and Infertility & ART Procedures" },
  ],
  examTopicsSummary:
    "Female Pelvis, Uterus, Ovaries, Menstrual Cycle, First Trimester, Second & Third Trimester, Fetal Growth & Development, Fetal Anomalies, Maternal Complications, and Infertility & ART Procedures",
  alignedTopics: [
    "Female Pelvic Anatomy & Pathology",
    "First Trimester Pregnancy Assessment",
    "Fetal Structural & Chromosomal Abnormalities",
    "Uterine & Ovarian Disorders",
    "Second & Third Trimester Anatomy",
    "Maternal Complications (Preeclampsia, Diabetes, etc.)",
    "Menstrual Cycle & Physiology",
    "Fetal Growth & Development",
    "Infertility & Assisted Reproductive Technologies (ART)",
  ],
  audioTopics:
    "All OB/GYN sonography study guides are available as audio versions, providing flexible study options for busy schedules and on-the-go learning.",
  whyChoose: [
    "Created and reviewed by registered sonographers and board-certified physicians",
    "Access your study tools anytime, anywhere",
    "Aligned with ARDMS® and ARRT® exam outlines",
    "Board-style practice questions",
    "Flashcards built for rapid review and concept mastery",
    "Compatible with desktop, tablet, and mobile devices",
    "Trusted by sonographers",
  ],
  infographic: [
    { label: "Study Guides (Text & Audio)", value: "11 Guides" },
    { label: "Flashcards", value: "600 Cards" },
    { label: "Practice Questions", value: "500 Questions" },
    { label: "Topics Covered", value: "Pelvic Anatomy, Gynecologic & Obstetric Pathology, Trimester-Specific Fetal Development" },
  ],
  bottomCtaTitle: "Get Full Access Today",
  bottomCtaBody:
    "Start your OB/GYN Sonography exam prep with Sonographer Pal and gain immediate access to study guides, audio versions, flashcards, and practice questions designed for ARDMS® OB/GYN and ARRT® Sonography certification exams.",
};

const VASCULAR_OVERVIEW: SpecialtyOverviewContent = {
  metaTitle: "Vascular Sonography Exam Prep",
  heroTitle: "Vascular Sonography Exam Prep",
  heroSubtitle: "Pass Your Vascular Sonography Exams with Confidence",
  heroIntro: [
    "Prepare for the CCI® RVS, ARDMS® RVT, and ARRT® Vascular Sonography certification exams using trusted, expert-reviewed materials created and reviewed by field experts — including registered sonographers and board-certified physicians.",
    "Our comprehensive Vascular Sonography prep covers all major exam topics with on-demand study resources, designed for ultrasound students and professionals pursuing vascular credentialing.",
  ],
  includedTools: [
    { resourceType: "Study Guides (Text & Audio)", whatsIncluded: "Comprehensive vascular ultrasound study guides covering arterial and venous systems" },
    { resourceType: "Flashcards", whatsIncluded: "Interactive flashcards for vascular anatomy, hemodynamics, and protocols" },
    { resourceType: "Practice Questions", whatsIncluded: "Board-style practice questions for CCI® RVS, ARDMS® RVT, and ARRT® Vascular exams" },
    { resourceType: "Exam Topics Covered", whatsIncluded: "Cerebrovascular, Peripheral Arterial, Peripheral Venous, Abdominal Vasculature, Venous Insufficiency, Hemodynamics, Doppler Principles, and Pathology Recognition" },
  ],
  examTopicsSummary:
    "Cerebrovascular, Peripheral Arterial, Peripheral Venous, Abdominal Vasculature, Venous Insufficiency, Hemodynamics, Doppler Principles, and Pathology Recognition",
  alignedTopics: [
    "Cerebrovascular (Carotid, Vertebral, Circle of Willis)",
    "Peripheral Arterial (Upper and Lower Extremities)",
    "Peripheral Venous (DVT, Venous Insufficiency)",
    "Abdominal Vasculature (Aorta, Renal, Mesenteric, Portal Venous)",
    "Venous Insufficiency Testing & Protocols",
    "Doppler Waveform Analysis & Hemodynamics",
    "Arterial & Venous Pathology Recognition",
    "Vascular Interventions & Surgical Procedures",
  ],
  audioTopics:
    "All vascular sonography study guides are available as audio versions, providing convenient access for flexible, on-the-go study.",
  whyChoose: [
    "Created and reviewed by registered sonographers and board-certified physicians",
    "Study anytime, anywhere with full on-demand access",
    "Optimized for desktop, tablet, and mobile devices",
    "Aligned with CCI®, ARDMS®, and ARRT® vascular exam outlines",
    "Trusted by sonographers",
    "Flashcards built for rapid recall and mastery",
    "Board-style practice questions",
  ],
  infographic: [
    { label: "Study Guides (Text & Audio)", value: "8 Guides" },
    { label: "Flashcards", value: "580 Cards" },
    { label: "Practice Questions", value: "500 Questions" },
    { label: "Topics Covered", value: "Vascular Anatomy, Pathology, Physiologic Exams, Procedures, Safety & QA" },
  ],
  bottomCtaTitle: "Get Full Access Today",
  bottomCtaBody:
    "Start your Vascular Sonography exam prep with Sonographer Pal and gain immediate access to study guides, audio versions, flashcards, and practice questions designed for CCI® RVS, ARDMS® RVT, and ARRT® Vascular certification exams.",
};

export const SPECIALTY_OVERVIEW: Record<SpecialtySlug, SpecialtyOverviewContent> = {
  spi: SPI_OVERVIEW,
  abdominal: ABDOMINAL_OVERVIEW,
  "ob-gyn": OB_GYN_OVERVIEW,
  vascular: VASCULAR_OVERVIEW,
};

export const OUTLINE_CARDS: OutlineCardData[] = [
  {
    slug: "spi",
    cardTitle: "SPI Outlines",
    subtitle: "SPI",
    rows: SPI_OVERVIEW.infographic,
  },
  {
    slug: "abdominal",
    cardTitle: "Abdomen Outlines",
    subtitle: "Abdomen",
    rows: ABDOMINAL_OVERVIEW.infographic,
  },
  {
    slug: "ob-gyn",
    cardTitle: "OB/GYN Outlines",
    subtitle: "OB/GYN",
    rows: OB_GYN_OVERVIEW.infographic,
  },
  {
    slug: "vascular",
    cardTitle: "Vascular Outlines",
    subtitle: "Vascular",
    rows: VASCULAR_OVERVIEW.infographic,
  },
];

export const SPECIALTY_OVERVIEW_PATH: Record<SpecialtySlug, string> = {
  spi: "/spi",
  abdominal: "/abdominal",
  "ob-gyn": "/ob-gyn",
  vascular: "/vascular",
};
