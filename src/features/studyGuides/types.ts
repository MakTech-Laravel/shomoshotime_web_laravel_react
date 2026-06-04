export type PublicStudyGuide = {
  id: number;
  sort_order: number;
  title: string;
  subtitle: string;
  category: string;
  slug: string;
  total_pages: number;
  file_url: string;
  file_src?: string;
  has_file?: boolean;
  updated_at?: string;
};
