export type PublicAudioGuide = {
  id: number;
  sort_order: number;
  title: string;
  subtitle: string;
  display_duration: string;
  category: string;
  specialty: string | null;
  slug: string;
  file_url: string;
  has_file: boolean;
  updated_at?: string | number;
};
