import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createUserAddress,
  deleteUserAddress,
  fetchUserAddresses,
  setDefaultUserAddress,
  updateUserAddress,
  type AddressPayload,
} from "./addressApi";

export const addressesQueryKeys = {
  list: ["user-addresses"] as const,
};

export function useUserAddresses() {
  return useQuery({
    queryKey: addressesQueryKeys.list,
    queryFn: fetchUserAddresses,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) => createUserAddress(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressesQueryKeys.list });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) =>
      updateUserAddress(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressesQueryKeys.list });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUserAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressesQueryKeys.list });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setDefaultUserAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressesQueryKeys.list });
    },
  });
}
