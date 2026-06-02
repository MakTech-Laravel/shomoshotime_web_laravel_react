import { useEffect, type ReactNode } from "react";

import { CallToAction } from "@/components/sections/home/CallToAction";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type NoteLabel = "Personal Note" | "Fun Fact" | "Fun Fact and Personal Note" | "Note";

type TeamMember = {
  name: string;
  image: string;
  imageAlt: string;
  role: string;
  specialty: string;
  note?: ReactNode;
  noteLabel?: NoteLabel;
};

const INTRO_PARAGRAPHS: ReactNode[] = [
  <>
    Founded in 2021, Sonographer Pal was created to meet the growing demand for high-quality, accessible board exam
    preparation resources for both students and practicing sonographers. The platform was founded by Joey Luna, a
    registered sonographer with extensive clinical experience, a strong background in precepting students, and a proven
    track record in sonography education. Having served as a Sonography Instructor, Director of Clinical Education, and
    Program Director, he has mentored more than 200 students into successful careers in medical imaging.
  </>,
  <>
    At the heart of Sonographer Pal is a mission: to empower sonographers to achieve their credentials with confidence.
    Understanding the critical role credentials play in advancing a sonographer&apos;s career, our founder and team are
    dedicated to delivering clear, effective, and clinically relevant content.
  </>,
  <>
    The Sonographer Pal Team includes ARDMS&reg;, ARRT&reg;, and CCI&reg;-registered sonographers and board-certified
    physicians, each with extensive backgrounds as educators, clinical preceptors, and practicing professionals.
    Together, we bring real-world expertise to every module, ensuring learners gain not only textbook knowledge but also
    practical insight.
  </>,
  <strong className="font-semibold text-black">
    The content from Sonographer Pal has been peer reviewed and is trusted by registered sonographers, physicians, and
    students. The mission of Sonographer Pal is to provide a foundation of study materials for sonographers to obtain
    their credentials.
  </strong>,
];

const SONOGRAPHERS: TeamMember[] = [
  {
    name: "Joey Luna, BS, RDMS (AB, OB), RVT, RVS",
    image: "/images/about/joey-luna.png",
    imageAlt: "Joey Luna",
    role: "Diagnostic Medical Sonography Director of Clinical Education",
    specialty: "Education and Student Success",
    note:
      "With sonography experience across TX, AZ & CA, I enjoy helping students succeed. Beyond work, I love time at the beach with my wife & dog, staying active, and watching nostalgic 80s movies.",
  },
  {
    name: "Marta Gajor, MS, RDMS (AB, BR, OB, PS), RVT",
    image: "/images/about/marta-gajor.png",
    imageAlt: "Marta Gajor",
    role: "Neuro-Ultrasound Specialist",
    specialty: "Neuro Sonography",
    note: "I used to work in a research lab performing detailed ultrasounds on mice for experimental studies!",
    noteLabel: "Fun Fact",
  },
  {
    name: "Natalie Abeyta, BA, AAS, RDMS (AB, OB, BR), RVT",
    image: "/images/about/natalie-abeyta.png",
    imageAlt: "Natalie Abeyta",
    role: "Diagnostic Medical Sonographer",
    specialty: "General, Vascular, High-Risk Ob, Breast",
    note:
      "I have a passion for educating patients and newer sonographers and believe it is important to know how the body works holistically, and the amazing part medical imaging can play in that.",
  },
  {
    name: "Jerzie Loving, AAS, RDMS (AB, OB), RT(S)",
    image: "/images/about/jerzie-loving.png",
    imageAlt: "Jerzie Loving",
    role: "Diagnostic Medical Sonographer",
    specialty: "Emergency and Fetal Medicine",
    note: "Passionate foodie who loves discovering new flavors and will travel anywhere for a good bite to eat!",
    noteLabel: "Fun Fact",
  },
  {
    name: "Jennifer Forrai, RDMS (AB, OB), RVT, RDCS",
    image: "/images/about/jennifer-forrai.png",
    imageAlt: "Jennifer Forrai",
    role: "Lead Sonographer",
    specialty: "OB, Vascular and Adult Echo",
    note:
      "I am truly passionate about my work and advocating for patients. I absolutely love teaching Sonography and helping new grads get started in their career. I'm also deeply passionate about being a mom and helping my kids find their passion in life.",
  },
  {
    name: "Jessica DeMarco, BA, RDMS (AB), RVT",
    image: "/images/about/jessica-demarco.png",
    imageAlt: "Jessica DeMarco",
    role: "Diagnostic Medical Sonographer",
    specialty: "General and Breast Sonography",
    note:
      "Passionate about ultrasound and our ability to see beyond the surface, through all the noise to reveal what really matters.",
  },
];

const PHYSICIANS: TeamMember[] = [
  {
    name: "Dr. Jose Luna Jr, MD, MBA",
    image: "/images/about/dr-jose-luna.png",
    imageAlt: "Dr. Jose Luna Jr",
    role: "Medical Director Transition Clinic",
    specialty: "Hepatitis C",
    note:
      "I am passionate about treating liver disease, particularly in patients with hepatitis C. In my free time, I enjoy solving daily crossword puzzles from the New York Times and LA Times.",
    noteLabel: "Fun Fact and Personal Note",
  },
  {
    name: "Dr. Christopher Olivares, DO, M.Sc.",
    image: "/images/about/dr-christopher-olivares.png",
    imageAlt: "Dr. Christopher Olivares",
    role: "Urologist",
    specialty:
      "General Urology, Kidney Stones, Erectile Dysfunction, Kidney Cancer, Testicular Cancer, Prostate Cancer, Voiding Dysfunction/BPH, Minimally Invasive Surgery",
    note:
      "Dr. Olivares lends his expertise to Sonographer Pal through the careful review of select content, helping uphold the highest standards of sonography education.",
    noteLabel: "Note",
  },
];

const MARKETING: TeamMember = {
  name: "Marivelle Sims, BA, RDH",
  image: "/images/about/marivelle-sims.png",
  imageAlt: "Marivelle Sims",
  role: "Educator and Community Outreach Expert",
  specialty:
    "Focuses on building relationships with schools, clinics, and the broader sonography community through strategic outreach and event participation. Experienced healthcare provider and educator.",
  note: "I have a weirdly good memory for movie quotes…and I'll prove it if you ask!",
  noteLabel: "Fun Fact",
};

function SectionDivider() {
  return (
    <div className="mb-10 mt-5 flex justify-center sm:mb-12">
      <span className="block h-[3px] w-24 rounded-full bg-[#c5a059] sm:w-28" aria-hidden />
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const notePrefix = member.noteLabel ?? "Personal Note";

  return (
    <article className="flex h-full flex-col items-center rounded-[15px] bg-white px-7 py-9 text-center shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:px-9 sm:py-10">
      <div className="size-[150px] shrink-0 overflow-hidden rounded-full sm:size-[160px]">
        <img
          src={member.image}
          alt={member.imageAlt}
          width={160}
          height={160}
          className="size-full object-cover object-top"
          loading="lazy"
          draggable={false}
        />
      </div>
      <h3 className="mt-6 font-libre-baskerville text-[17px] font-bold leading-snug text-black sm:text-lg">
        {member.name}
      </h3>
      <p className="mt-3 max-w-[280px] font-libre-baskerville text-sm italic leading-relaxed text-[#525252]">
        Professional Title / Role: {member.role}
      </p>
      <div className="mt-5 w-full space-y-4 font-libre-baskerville text-sm leading-relaxed text-black">
        <p>
          <span className="font-bold">Specialty / Area of Focus:</span> {member.specialty}
        </p>
        {member.note ? (
          <p>
            <span className="font-bold">{notePrefix}:</span> {member.note}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function TeamGrid({ members, columns = "lg:grid-cols-3" }: { members: TeamMember[]; columns?: string }) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-[1268px] grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:gap-8",
        columns,
      )}
    >
      {members.map((member) => (
        <TeamMemberCard key={member.name} member={member} />
      ))}
    </div>
  );
}

export default function AboutUs() {
  useEffect(() => {
    document.title = "About Us | Sonographer Pal";
  }, []);

  return (
    <>
      <section className="bg-white py-14 lg:py-20">
        <div className={cn(container, "max-w-[980px]")}>
          <h1 className="text-center font-heading text-[40px] font-bold leading-normal tracking-normal text-black">
            About Sonographer Pal
          </h1>
          <div className="mt-10 space-y-6 font-sans text-base leading-normal text-black">
            {INTRO_PARAGRAPHS.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f7] pb-14 pt-16 lg:pb-20 lg:pt-[73px]">
        <div className={cn(container)}>
          <h2 className="text-center font-heading text-[40px] font-bold leading-normal tracking-normal text-black">
            Our Contributors, Editors, and Reviewers
          </h2>
          <SectionDivider />

          <h3 className="mb-10 text-center font-heading text-[25px] font-bold leading-normal tracking-normal text-black sm:mb-12">
            Registered Diagnostic Medical Sonographers
          </h3>
          <TeamGrid members={SONOGRAPHERS} />

          <h3 className="mb-10 mt-16 text-center font-heading text-[25px] font-bold leading-normal tracking-normal text-black sm:mb-12">
            Board-Certified Physicians
          </h3>
          <div className="flex justify-center">
            <TeamGrid members={PHYSICIANS} columns="lg:grid-cols-2 lg:max-w-[900px]" />
          </div>

          <h3 className="mb-10 mt-16 text-center font-heading text-[25px] font-bold leading-normal tracking-normal text-black sm:mb-12">
            Director of Marketing &amp; Community Engagement
          </h3>
          <div className="mx-auto max-w-sm sm:max-w-md">
            <TeamMemberCard member={MARKETING} />
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
