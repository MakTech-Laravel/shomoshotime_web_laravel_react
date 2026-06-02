import { useEffect } from "react";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { SPI_AUDIO_TRACKS } from "@/data/audioGuides";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function SpiAudioPage() {
  useEffect(() => {
    document.title = "SPI Audio Study Guides | Sonographer Pal";
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>

        {/* Heading */}
        <h1 className="mb-6 text-center font-heading text-2xl font-bold text-black sm:text-3xl lg:text-[36px]">
          SPI Audio Study Guides
        </h1>

        {/* Player with full playlist */}
        <AudioPlayer
          tracks={SPI_AUDIO_TRACKS}
          className="mx-auto w-full max-w-4xl"
        />
      </div>
    </div>
  );
}
