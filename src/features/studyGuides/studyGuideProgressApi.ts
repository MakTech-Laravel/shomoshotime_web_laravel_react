import { api } from "@/api/client";
import { userEndpoints } from "@/config/userEndpoints";

export async function saveStudyGuidePageProgress(
  contentId: number,
  pageNumber: number,
): Promise<void> {
  await api.post(userEndpoints.contentNextPage, {
    content_id: contentId,
    page_number: pageNumber,
  });
}
