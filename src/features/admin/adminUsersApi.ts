import { api } from "@/api/client";
import { unwrapLaravelData, unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { adminEndpoints } from "@/config/adminEndpoints";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  status: number;
  status_label: string;
  email_verified_at: string | null;
};

function normalizeUser(raw: unknown): AdminUser | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    name: String(o.name ?? ""),
    email: String(o.email ?? ""),
    status: Number(o.status ?? 0),
    status_label: String(o.status_label ?? ""),
    email_verified_at: o.email_verified_at ? String(o.email_verified_at) : null,
  };
}

export async function fetchAdminUsers(search?: string): Promise<AdminUser[]> {
  const res = await api.post(adminEndpoints.usersAll, {
    per_page: 100,
    ...(search ? { search } : {}),
  });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows.map(normalizeUser).filter((r): r is AdminUser => r !== null);
}

export type CreateAdminUserInput = {
  name: string;
  email: string;
  password: string;
  status?: number;
};

export async function createAdminUser(input: CreateAdminUserInput): Promise<AdminUser> {
  const form = new FormData();
  form.append("name", input.name);
  form.append("email", input.email);
  form.append("password", input.password);
  form.append("status", String(input.status ?? 1));
  const res = await api.post(adminEndpoints.userCreate, form);
  const data = unwrapLaravelData<unknown>(res.data);
  const user = normalizeUser(data);
  if (!user) throw new Error("Invalid user response");
  return user;
}

export async function suspendAdminUser(userId: number): Promise<void> {
  await api.post(adminEndpoints.userStatusChange, { id: userId, status: 3 });
}

export async function activateAdminUser(userId: number): Promise<void> {
  await api.post(adminEndpoints.userStatusChange, { id: userId, status: 1 });
}

export async function deleteAdminUser(userId: number): Promise<void> {
  await api.delete(adminEndpoints.userDelete(userId));
}
