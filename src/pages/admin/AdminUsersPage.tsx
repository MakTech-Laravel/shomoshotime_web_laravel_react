import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activateAdminUser,
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  suspendAdminUser,
  type AdminUser,
} from "@/features/admin/adminUsersApi";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

function UserRow({
  user,
  onSuspend,
  onActivate,
  onDelete,
}: {
  user: AdminUser;
  onSuspend: (id: number) => void;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isSuspended = user.status === 3;

  return (
    <tr className="border-b border-[#f0f0f0]">
      <td className="px-4 py-3 font-sans text-sm text-[#333333]">{user.name}</td>
      <td className="px-4 py-3 font-sans text-sm text-[#333333]">{user.email}</td>
      <td className="px-4 py-3 font-sans text-sm text-[#333333]">{user.status_label}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {isSuspended ? (
            <button
              type="button"
              onClick={() => onActivate(user.id)}
              className="rounded border border-[#2E7D32] px-3 py-1 font-sans text-xs font-medium text-[#2E7D32] hover:bg-[#2E7D32]/10"
            >
              Activate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSuspend(user.id)}
              className="rounded border border-[#b8860b] px-3 py-1 font-sans text-xs font-medium text-[#b8860b] hover:bg-[#FFC107]/10"
            >
              Suspend
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Permanently delete ${user.email}? This cannot be undone. Prefer Suspend to revoke access.`,
                )
              ) {
                onDelete(user.id);
              }
            }}
            className="rounded border border-[#c62828] px-3 py-1 font-sans text-xs font-medium text-[#c62828] hover:bg-[#c62828]/10"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchAdminUsers(),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const suspendMutation = useMutation({
    mutationFn: suspendAdminUser,
    onSuccess: invalidate,
  });

  const activateMutation = useMutation({
    mutationFn: activateAdminUser,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      setShowCreate(false);
      setName("");
      setEmail("");
      setPassword("");
      setFormError(null);
      invalidate();
    },
    onError: () => setFormError("Could not create user. Check that the email is unique."),
  });

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className={cn(container, "py-10")}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/admin/dashboard" className="font-sans text-sm text-[#666666] hover:text-black">
              ← Admin dashboard
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-bold text-black">Manage Students</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="rounded-lg bg-[#FFC107] px-5 py-2.5 font-sans text-sm font-semibold text-black hover:bg-[#e6ac00]"
          >
            Add user
          </button>
        </div>

        {showCreate ? (
          <form
            className="mb-8 max-w-lg rounded-md border border-[#e5e7eb] bg-white p-6 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              setFormError(null);
              createMutation.mutate({ name, email, password });
            }}
          >
            <h2 className="font-heading text-lg font-bold text-black">Create user</h2>
            <p className="mt-1 font-sans text-xs text-[#666666]">
              New users are created with a verified email and active status.
            </p>
            <label className="mt-4 block">
              <span className="font-sans text-sm font-medium text-[#333333]">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded border border-[#d0d0d0] px-3 py-2 font-sans text-sm"
              />
            </label>
            <label className="mt-4 block">
              <span className="font-sans text-sm font-medium text-[#333333]">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded border border-[#d0d0d0] px-3 py-2 font-sans text-sm"
              />
            </label>
            <label className="mt-4 block">
              <span className="font-sans text-sm font-medium text-[#333333]">Password</span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded border border-[#d0d0d0] px-3 py-2 font-sans text-sm"
              />
            </label>
            {formError ? (
              <p className="mt-3 font-sans text-sm text-[#c62828]">{formError}</p>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-[#FFC107] px-4 py-2 font-sans text-sm font-semibold text-black hover:bg-[#e6ac00] disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-[#d0d0d0] px-4 py-2 font-sans text-sm text-[#333333]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="overflow-x-auto rounded-md border border-[#e5e7eb] bg-white shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase text-[#666666]">
                  Name
                </th>
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase text-[#666666]">
                  Email
                </th>
                <th className="px-4 py-3 font-sans text-xs font-semibold uppercase text-[#666666]">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-sans text-xs font-semibold uppercase text-[#666666]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center font-sans text-sm text-[#666666]">
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center font-sans text-sm text-[#666666]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onSuspend={(id) => suspendMutation.mutate(id)}
                    onActivate={(id) => activateMutation.mutate(id)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
