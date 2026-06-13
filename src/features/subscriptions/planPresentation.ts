import type { SubscriptionPlan } from "@/features/subscriptions/subscriptionsApi";

export type PlanVariant = "side" | "featured";

export function billingPeriodLabel(duration: string): string {
  const value = duration.toLowerCase();
  if (value.includes("week")) return "Every week";
  if (value.includes("month")) return "Every month";
  if (value.includes("year") || value.includes("annual")) return "Every year";
  return `Every ${duration.toLowerCase()}`;
}

export function isFeaturedPlan(plan: Pick<SubscriptionPlan, "tag">): boolean {
  const tag = plan.tag?.toLowerCase() ?? "";
  return tag.includes("popular") || tag.includes("featured");
}

export function cardVariant(isFeatured: boolean): PlanVariant {
  return isFeatured ? "featured" : "side";
}

export function pricingGridClass(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

export function planRegisterSlug(duration: string): string {
  return duration.trim().toLowerCase().replace(/\s+/g, "-");
}
