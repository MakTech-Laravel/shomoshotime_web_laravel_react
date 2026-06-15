import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchCmsPage, type CmsPageType } from "@/features/cms/cmsApi";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type CmsLegalPageProps = {
  type: CmsPageType;
  title: string;
};

export default function CmsLegalPage({ type, title }: CmsLegalPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["cms", type],
    queryFn: () => fetchCmsPage(type),
  });

  useEffect(() => {
    document.title = `${title} | Sonographer Pal`;
  }, [title]);

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "py-12 lg:py-16")}>
        <h1 className="text-center font-heading text-3xl font-bold text-black sm:text-4xl">
          {title}
        </h1>

        <div className="prose prose-neutral mx-auto mt-10 max-w-3xl rounded-md border border-[#e5e7eb] bg-white p-8 shadow-sm">
          {isLoading ? (
            <p className="font-sans text-base text-[#666666]">Loading…</p>
          ) : data?.content ? (
            <div
              className="font-sans text-base leading-relaxed text-[#333333]"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          ) : (
            <p className="font-sans text-base text-[#666666]">
              Content is being prepared. Please check back soon or contact{" "}
              <a href="mailto:info@sonographerpal.com" className="text-[#b8860b] hover:underline">
                info@sonographerpal.com
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
