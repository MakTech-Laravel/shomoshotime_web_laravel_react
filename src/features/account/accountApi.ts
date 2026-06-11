import { api } from "@/api/client";
import { extractUserFromAuthPayload } from "@/api/laravelResponse";
import { resolveAuthEndpoints } from "@/config/authEndpoints";
import { userEndpoints } from "@/config/userEndpoints";
import type { AuthUser } from "@/auth/types";

const authPaths = resolveAuthEndpoints();

export async function updateProfile(payload: {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  file?: File | null;
}): Promise<AuthUser | null> {
  const form = new FormData();
  if (payload.name) form.append("name", payload.name);
  if (payload.email) form.append("email", payload.email);
  if (payload.password) {
    form.append("password", payload.password);
    form.append("password_confirmation", payload.password_confirmation ?? payload.password);
  }
  if (payload.file) form.append("file", payload.file);

  const res = await api.post(userEndpoints.profileUpdate, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return extractUserFromAuthPayload(res.data);
}

export async function changePassword(payload: {
  old_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await api.post(authPaths.changePassword, payload);
}

export async function deleteAccount(payload: { email: string; password: string }): Promise<void> {
  await api.post(userEndpoints.profileDelete, payload);
}

