import { api } from "@/api/client";
import { unwrapLaravelData, unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";

export type UserAddress = {
  id: number;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  formatted: string;
  createdAt: string;
};

export type AddressPayload = {
  label?: string;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country?: string;
  phone?: string;
  is_default?: boolean;
};

function normalizeAddress(raw: unknown): UserAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    label: typeof o.label === "string" ? o.label : null,
    fullName: String(o.full_name ?? ""),
    line1: String(o.line1 ?? ""),
    line2: typeof o.line2 === "string" ? o.line2 : null,
    city: String(o.city ?? ""),
    state: typeof o.state === "string" ? o.state : null,
    postalCode: String(o.postal_code ?? ""),
    country: String(o.country ?? "US"),
    phone: typeof o.phone === "string" ? o.phone : null,
    isDefault: Boolean(o.is_default),
    formatted: typeof o.formatted === "string" ? o.formatted : "",
    createdAt: typeof o.created_at === "string" ? o.created_at : "—",
  };
}

export async function fetchUserAddresses(): Promise<UserAddress[]> {
  const res = await api.post(userEndpoints.addressList, { per_page: 50 });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows.map(normalizeAddress).filter((a): a is UserAddress => a !== null);
}

export async function createUserAddress(payload: AddressPayload): Promise<UserAddress | null> {
  const res = await api.post(userEndpoints.addressStore, payload);
  return normalizeAddress(unwrapLaravelData(res.data));
}

export async function updateUserAddress(
  id: number,
  payload: Partial<AddressPayload>,
): Promise<UserAddress | null> {
  const res = await api.post(userEndpoints.addressUpdate(id), payload);
  return normalizeAddress(unwrapLaravelData(res.data));
}

export async function deleteUserAddress(id: number): Promise<void> {
  await api.post(userEndpoints.addressDelete(id));
}

export async function setDefaultUserAddress(id: number): Promise<UserAddress | null> {
  const res = await api.post(userEndpoints.addressSetDefault(id));
  return normalizeAddress(unwrapLaravelData(res.data));
}
