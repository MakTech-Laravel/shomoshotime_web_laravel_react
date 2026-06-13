import { useState } from "react";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import type { AddressPayload, UserAddress } from "@/features/addresses/addressApi";
import {
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
  useUserAddresses,
} from "@/features/addresses/useAddresses";
import { cn } from "@/lib/utils";

const EMPTY_FORM: AddressPayload = {
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
  phone: "",
  label: "",
};

function formFromAddress(address: UserAddress): AddressPayload {
  return {
    label: address.label ?? "",
    full_name: address.fullName,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state ?? "",
    postal_code: address.postalCode,
    country: address.country,
    phone: address.phone ?? "",
    is_default: address.isDefault,
  };
}

export function AddressesPanel() {
  const { data: addresses = [], isLoading } = useUserAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);

  const saving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending;

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(address: UserAddress) {
    setEditingId(address.id);
    setForm(formFromAddress(address));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function saveAddress() {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: form });
        toast.success("Address updated.");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Address saved.");
      }
      closeForm();
    } catch {
      toast.error("Unable to save address.");
    }
  }

  async function removeAddress(id: number) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Address removed.");
      if (expandedId === id) setExpandedId(null);
    } catch {
      toast.error("Unable to remove address.");
    }
  }

  async function makeDefault(id: number) {
    try {
      await setDefaultMutation.mutateAsync(id);
      toast.success("Default address updated.");
    } catch {
      toast.error("Unable to update default address.");
    }
  }

  return (
    <section className="mt-8 sm:mt-9">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-montserrat text-[1.75rem] font-bold leading-none tracking-tight text-black sm:text-[2rem]">
            Addresses
          </h2>
          <p className="mt-2.5 font-montserrat text-[15px] font-normal leading-normal text-[#757575]">
            Manage your billing and shipping addresses.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="w-fit rounded-md bg-[#FFC107] px-5 py-2.5 font-montserrat text-sm font-semibold text-black transition hover:bg-[#e6ac00]"
        >
          Add address
        </button>
      </div>

      {showForm ? (
        <div className="mt-7 space-y-3 border-t border-[#e0e0e0] pt-7">
          <h3 className="font-montserrat text-lg font-semibold text-black">
            {editingId ? "Edit address" : "New address"}
          </h3>
          <div className="grid max-w-lg gap-3">
            <Input
              value={form.label ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Label (Home, Billing)"
              className="font-montserrat"
            />
            <Input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Full name"
              className="font-montserrat"
            />
            <Input
              value={form.line1}
              onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
              placeholder="Address line 1"
              className="font-montserrat"
            />
            <Input
              value={form.line2 ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
              placeholder="Address line 2 (optional)"
              className="font-montserrat"
            />
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="City"
              className="font-montserrat"
            />
            <Input
              value={form.state ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              placeholder="State / Province"
              className="font-montserrat"
            />
            <Input
              value={form.postal_code}
              onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
              placeholder="Postal code"
              className="font-montserrat"
            />
            <Input
              value={form.country ?? "US"}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="Country"
              className="font-montserrat"
            />
            <Input
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone (optional)"
              className="font-montserrat"
            />
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveAddress()}
                className="rounded-md bg-[#FFC107] px-6 py-2.5 font-montserrat text-sm font-semibold text-black disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save address"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                className="font-montserrat text-[15px] text-[#757575] underline underline-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
            Loading…
          </p>
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="mt-7 border-t border-[#e0e0e0]">
          <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
            No items to display yet.
          </p>
        </div>
      ) : (
        <div className="mt-7 border-t border-[#e0e0e0]">
          {addresses.map((address) => {
            const expanded = expandedId === address.id;
            const title = address.label?.trim() || address.fullName;

            return (
              <div key={address.id} className="border-b border-[#e0e0e0]">
                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-0 sm:py-[1.125rem]">
                  <p
                    className={cn(
                      "font-montserrat text-[15px] text-black sm:w-1/3 sm:text-base",
                      expanded ? "font-semibold" : "font-normal",
                    )}
                  >
                    {title}
                    {address.isDefault ? (
                      <span className="ml-2 inline-flex rounded bg-[#e8f5e9] px-2 py-0.5 text-[12px] font-semibold text-[#2e7d32]">
                        Default
                      </span>
                    ) : null}
                  </p>

                  <p className="font-montserrat text-[15px] font-normal text-[#757575] sm:w-1/3 sm:text-center sm:text-base">
                    {address.city}
                    {address.state ? `, ${address.state}` : ""}
                  </p>

                  <div className="flex sm:w-1/3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedId((current) => (current === address.id ? null : address.id))}
                      aria-expanded={expanded}
                      className="inline-flex items-center gap-2 rounded-sm transition-opacity hover:opacity-80"
                    >
                      <span className="inline-flex rounded bg-[#f5f5f5] px-2.5 py-0.5 font-montserrat text-[14px] font-semibold leading-snug text-[#616161]">
                        Details
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-[#9e9e9e] transition-transform duration-200",
                          expanded && "rotate-180",
                        )}
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <div className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-3 sm:gap-0">
                    <div className="space-y-1.5 font-montserrat text-[15px] font-normal text-[#757575] sm:text-base">
                      <p>{address.formatted || address.line1}</p>
                      {address.phone ? <p>{address.phone}</p> : null}
                    </div>

                    <div className="flex flex-col gap-2 font-montserrat text-[15px] sm:items-center sm:text-center">
                      {!address.isDefault ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void makeDefault(address.id)}
                          className="text-black underline underline-offset-2 disabled:opacity-50"
                        >
                          Set as default
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => openEdit(address)}
                        className="text-black underline underline-offset-2 disabled:opacity-50"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="sm:flex sm:justify-end">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void removeAddress(address.id)}
                        className="font-montserrat text-[15px] text-red-700 underline underline-offset-2 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
