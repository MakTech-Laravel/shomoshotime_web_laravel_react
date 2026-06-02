import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import "@/lib/configurePdfWorker";
import { PdfStudyViewer } from "@/components/study-guide/PdfStudyViewer";
import { getStudyGuideContent } from "@/data/studyGuideContent";
import { container } from "@/lib/container";

export default function StudyGuideViewerPage() {
  const { specialty, section } = useParams<{ specialty: string; section: string }>();
  const content =
    specialty && section ? getStudyGuideContent(specialty, section) : null;

  useEffect(() => {
    if (content) {
      document.title = `${content.title} | Sonographer Pal`;
    }
  }, [content]);

  if (!content) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-[calc(100dvh-6.75rem)] flex-col bg-[#faf3f0] py-3 font-montserrat sm:h-[calc(100dvh-7rem)] sm:py-5 lg:py-6">
      <div className={`${container} flex min-h-0 flex-1 flex-col`}>
        <h1 className="shrink-0 px-1 text-center text-lg font-normal leading-snug tracking-tight text-black break-words sm:text-[22px] lg:text-[28px]">
          {content.title}
        </h1>

        <div className="mx-auto mt-3 flex min-h-0 w-full max-w-5xl flex-1 flex-col sm:mt-5 lg:mt-6">
          <PdfStudyViewer
            pdfAssetId={content.pdfAssetId}
            fileName={content.fileName}
            className="min-h-0 flex-1"
          />
        </div>
      </div>
    </div>
  );
}
