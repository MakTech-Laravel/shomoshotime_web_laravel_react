import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";

import "@/lib/configurePdfWorker";
import { PdfStudyViewer } from "@/components/study-guide/PdfStudyViewer";
import {
  findStudyGuideInNav,
  useStudyGuideNav,
} from "@/features/studyGuides/StudyGuideNavContext";
import { resolveStudyGuidePdfSources } from "@/features/studyGuides/pdfSource";
import { useStudyGuideBySlug } from "@/features/studyGuides/usePublicStudyGuides";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { container } from "@/lib/container";

export default function StudyGuideViewerPage() {
  const { specialty, section } = useParams<{ specialty: string; section: string }>();
  const { guidesBySpecialty, isReady } = useStudyGuideNav();

  const slug = section?.trim() ?? "";
  const cachedGuide =
    specialty && slug ? findStudyGuideInNav(guidesBySpecialty, specialty, slug) : undefined;

  const needsFetch = Boolean(slug) && !cachedGuide;
  const { data: fetchedGuide, isLoading, isError } = useStudyGuideBySlug(
    slug || undefined,
    needsFetch,
  );

  const guide = cachedGuide ?? fetchedGuide ?? null;

  const fileName = useMemo(() => {
    if (!guide) return "study-guide.pdf";
    const safeTitle = guide.title.replace(/[^\w.-]+/g, "_").slice(0, 80);
    return `${safeTitle || "study-guide"}.pdf`;
  }, [guide]);

  const pdfSources = useMemo(
    () => (guide ? resolveStudyGuidePdfSources(guide) : null),
    [guide?.id, guide?.file_url, guide?.file_src, guide?.updated_at, guide?.has_file],
  );

  useEffect(() => {
    if (guide) {
      document.title = `${guide.title} | Sonographer Pal`;
    }
  }, [guide]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  if (!slug) {
    return <Navigate to={`/${specialty}`} replace />;
  }

  if (slug === "outlines") {
    const firstGuide = guidesBySpecialty[specialty as keyof typeof guidesBySpecialty]?.[0];
    if (firstGuide) {
      return <Navigate to={`/${specialty}/study-guides/${firstGuide.slug}`} replace />;
    }
    if (isReady) {
      return <Navigate to={`/${specialty}`} replace />;
    }
  }

  if ((isLoading || !isReady) && !guide) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf3f0] font-montserrat text-[#333333]">
        <p className="text-base">Loading study guide…</p>
      </div>
    );
  }

  if ((isError || !guide) && !isLoading) {
    return <Navigate to={`/${specialty}`} replace />;
  }

  if (!guide?.file_url) {
    return <Navigate to={`/${specialty}`} replace />;
  }

  if (guide.has_file === false) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf3f0] px-6 font-montserrat">
        <div className="max-w-lg text-center text-[#333333]">
          <h1 className="text-xl font-semibold text-black sm:text-2xl">{guide.title}</h1>
          <p className="mt-4 text-base leading-relaxed">
            This study guide&apos;s PDF file is not on the server. Open the admin panel, edit this
            guide, and upload the PDF again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100dvh-6.75rem)] flex-col bg-[#faf3f0] py-3 font-montserrat sm:h-[calc(100dvh-7rem)] sm:py-5 lg:py-6"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={`${container} flex min-h-0 flex-1 flex-col`}>
        <h1 className="shrink-0 px-1 text-center text-lg font-normal leading-snug tracking-tight text-black break-words sm:text-[22px] lg:text-[28px]">
          {guide.title}
        </h1>

        <div className="mx-auto mt-3 flex min-h-0 w-full max-w-5xl flex-1 flex-col sm:mt-5 lg:mt-6">
          {pdfSources ? (
            <PdfStudyViewer
              key={`${guide.id}-${guide.updated_at ?? guide.file_url}`}
              pdfSources={pdfSources}
              fileName={fileName}
              contentId={guide.id}
              className="min-h-0 flex-1"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
