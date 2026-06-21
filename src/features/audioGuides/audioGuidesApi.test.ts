import SpecialtyStaticAudioPage from "@/pages/frontend/SpecialtyStaticAudioPage";
import { SPI_AUDIO_TRACKS } from "@/data/audioGuides";
import {
  audioGuidesToPlayerTracks,
  fetchAudioGuidesBySpecialty,
} from "@/features/audioGuides/audioGuidesApi";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "@/api/client";

describe("fetchAudioGuidesBySpecialty", () => {
  it("returns normalized guides with playable file urls", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 5,
            sort_order: 1,
            title: "Fundamentals Track",
            subtitle: "58:03",
            display_duration: "58:03",
            category: "SPI",
            specialty: "spi",
            slug: "fundamentals-track-5",
            file_url: "https://api.example.com/api/v1/content/audio-guides/5/file",
            has_file: true,
          },
        ],
      },
    });

    const guides = await fetchAudioGuidesBySpecialty("spi");
    expect(guides).toHaveLength(1);
    expect(guides[0]?.title).toBe("Fundamentals Track");

    const tracks = audioGuidesToPlayerTracks(guides, "spi");
    expect(tracks[0]?.src).toContain("/content/audio-guides/5/file");
    expect(tracks[0]?.displayDuration).toBe("58:03");
  });

  it("throws on request failure", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("network"));
    await expect(fetchAudioGuidesBySpecialty("vascular")).rejects.toThrow("network");
  });
});

describe("SPI static fallback catalog", () => {
  it("still defines legacy SPI tracks for empty API fallback", () => {
    expect(SPI_AUDIO_TRACKS.length).toBeGreaterThan(0);
    expect(SPI_AUDIO_TRACKS[0]?.title).toBeTruthy();
  });
});

describe("SpecialtyStaticAudioPage", () => {
  it("exports a page component", () => {
    expect(SpecialtyStaticAudioPage).toBeTypeOf("function");
  });
});
