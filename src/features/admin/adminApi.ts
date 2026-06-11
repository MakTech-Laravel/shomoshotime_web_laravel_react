import { api } from "@/api/client";
import { unwrapLaravelData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";

export type AdminDashboardStats = {
  totalStudents: number;
  studyMaterials: number;
  activeSubscriptions: number;
  practiceAttempts: number;
};

function sumNumbers(values: unknown): number {
  if (!Array.isArray(values)) return 0;
  return values.reduce<number>((acc, v) => acc + Number(v ?? 0), 0);
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await api.post(userEndpoints.adminAnalytics, {
    totalUsers: true,
    totalContents: true,
    kpiMetrics: true,
    subscriptionDistribution: true,
  });

  const data = unwrapLaravelData<Record<string, unknown>>(res.data) ?? {};
  const kpi = (data.kpiMetrics as Record<string, unknown> | undefined) ?? {};
  const subDist = (data.subscriptionDistribution as Record<string, unknown> | undefined) ?? {};
  const attemptsRaw = kpi.total_attempts;
  const attempts =
    typeof attemptsRaw === "string"
      ? Number(attemptsRaw.replace(/,/g, "")) || 0
      : Number(attemptsRaw ?? 0);

  return {
    totalStudents: Number(data.totalUsers ?? 0),
    studyMaterials: Number(data.totalContents ?? 0),
    activeSubscriptions: sumNumbers(subDist.data),
    practiceAttempts: attempts,
  };
}
