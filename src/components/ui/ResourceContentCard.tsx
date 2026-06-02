import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ResourceContentCardProps = {
  children: ReactNode;
  className?: string;
};

/** Shared white card shell for flashcards, practice, and coming-soon states. */
export function ResourceContentCard({ children, className }: ResourceContentCardProps) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl", className)}>
      <div className="rounded-lg border border-[#e5e5e5] bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-10 md:px-12 md:py-12 lg:px-16 lg:py-14">
        {children}
      </div>
    </div>
  );
}
