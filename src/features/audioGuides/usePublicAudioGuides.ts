import { useQuery } from "@tanstack/react-query";

import type { SpecialtySlug } from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import {
  audioGuidesToPlayerTracks,
  fetchAudioGuidesBySpecialty,
} from "@/features/audioGuides/audioGuidesApi";
import type { AudioPlayerTrack } from "@/components/ui/AudioPlayer";

export const audioGuidesQueryKeys = {
  specialty: (specialty: SpecialtySlug) => ["public-audio-guides", specialty] as const,
};

export function useAudioGuidesForSpecialty(specialty: string | undefined) {
  const slug = specialty && isValidSpecialty(specialty) ? (specialty as SpecialtySlug) : null;

  return useQuery({
    queryKey: slug ? audioGuidesQueryKeys.specialty(slug) : ["public-audio-guides", "empty"],
    queryFn: () => (slug ? fetchAudioGuidesBySpecialty(slug) : Promise.resolve([])),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useAudioPlayerTracksForSpecialty(specialty: SpecialtySlug): {
  tracks: AudioPlayerTrack[];
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = useAudioGuidesForSpecialty(specialty);

  return {
    tracks: audioGuidesToPlayerTracks(data ?? [], specialty),
    isLoading,
    isError,
  };
}
