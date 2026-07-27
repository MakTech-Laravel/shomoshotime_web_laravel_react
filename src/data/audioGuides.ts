import type { AudioPlayerTrack } from "@/components/ui/AudioPlayer";
import type { SpecialtySlug } from "@/data/specialtyResources";
import { env } from "@/config/env";

function audioStreamUrl(filename: string): string {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  return `${base}/audio/${encodeURIComponent(filename)}`;
}

const SPI_AUDIO_FILES = [
  "Explore Resources - Sonographerpal.mp3",
  "Transducers and Machine Functions in Sonography Study Guide.mp3",
  "Image Optimization Study Guide.mp3",
  "Doppler Ultrasound Study Guide.mp3",
  "Bioeffects and QA Study Guide.mp3",
] as const;

export const SPI_AUDIO_TRACKS: AudioPlayerTrack[] = [
  {
    src: audioStreamUrl(SPI_AUDIO_FILES[0]),
    title: "Fundamentals of Performing Ultrasound Examinations",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "58:03",
  },
  {
    src: audioStreamUrl(SPI_AUDIO_FILES[1]),
    title: "Transducers and Machine Functions in Sonography Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "44:41",
  },
  {
    src: audioStreamUrl(SPI_AUDIO_FILES[2]),
    title: "Image Optimization Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "01:07:46",
  },
  {
    src: audioStreamUrl(SPI_AUDIO_FILES[3]),
    title: "Doppler Ultrasound Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "30:07",
  },
  {
    src: audioStreamUrl(SPI_AUDIO_FILES[4]),
    title: "Bioeffects and QA Study Guide",
    artist: "sonographerpal",
    album: "Audio (SPI)",
    displayDuration: "21:01",
  },
];

/**
 * Per-specialty audio playlists (static metadata; files stream from GET /api/v1/audio/{filename}).
 * Add Vascular / OB-GYN / Abdomen filenames here when MP3s are on storage — no API changes needed.
 */
export const AUDIO_TRACKS_BY_SPECIALTY: Record<SpecialtySlug, AudioPlayerTrack[]> = {
  spi: SPI_AUDIO_TRACKS,
  vascular: [],
  "ob-gyn": [],
  abdominal: [],
};

export function getAudioTracksForSpecialty(specialty: SpecialtySlug): AudioPlayerTrack[] {
  return AUDIO_TRACKS_BY_SPECIALTY[specialty] ?? [];
}

export function hasAudioTracksForSpecialty(specialty: SpecialtySlug): boolean {
  return getAudioTracksForSpecialty(specialty).length > 0;
}
