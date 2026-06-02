import type { AudioPlayerTrack } from "@/components/ui/AudioPlayer";

// Dummy sources — swap these for real CDN/API URLs once available
const D1 = "/audio/Explore Resources - Sonographerpal.mp3";
const D2 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const D3 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
const D4 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3";
const D5 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";

export const SPI_AUDIO_TRACKS: AudioPlayerTrack[] = [
  {
    src: D1,
    title: "Fundamentals of Performing Ultrasound Examinations",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "58:03",
  },
  {
    src: D2,
    title: "Transducers and Machine Functions in Sonography Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "44:41",
  },
  {
    src: D3,
    title: "Image Optimization Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "01:07:46",
  },
  {
    src: D4,
    title: "Doppler Ultrasound Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "30:07",
  },
  {
    src: D5,
    title: "Bioeffects and QA Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "21:01",
  },
];
