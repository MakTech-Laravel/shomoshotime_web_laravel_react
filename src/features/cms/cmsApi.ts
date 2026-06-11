import { api } from "@/api/client";
import { unwrapLaravelData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";

export type CmsPageType = "about_us" | "privacy_policy" | "terms_condition";

export type CmsPage = {
  type: string;
  content: string;
};

export async function fetchCmsPage(type: CmsPageType): Promise<CmsPage | null> {
  try {
    const res = await api.post(userEndpoints.cmsPageShow, { type }, { skipAuthRedirect: true });
    const data = unwrapLaravelData<Record<string, unknown>>(res.data);
    if (!data) return null;
    return {
      type: String(data.type ?? type),
      content: String(data.content ?? ""),
    };
  } catch {
    return null;
  }
}
