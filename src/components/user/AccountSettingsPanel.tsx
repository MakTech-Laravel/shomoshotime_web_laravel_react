import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/auth/useAuth";
import { changePassword, deleteAccount, updateProfile } from "@/features/account/accountApi";
import { Input } from "@/components/ui/input";

export function AccountSettingsPanel() {
  const { user, setUser, logout } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile(file?: File | null) {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name,
        email,
        file: file ?? undefined,
      });
      if (updated) setUser(updated);
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    setSaving(true);
    try {
      await changePassword({
        old_password: oldPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success("Password changed.");
      setOldPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Password change failed.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setSaving(true);
    try {
      await deleteAccount({ email: deleteEmail, password: deletePassword });
      toast.success("Account deleted.");
      await logout();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 sm:mt-9">
      <h2 className="font-montserrat text-[1.75rem] font-bold leading-none tracking-tight text-black sm:text-[2rem]">
        My Account
      </h2>
      <p className="mt-2.5 font-montserrat text-[15px] font-normal leading-normal text-[#757575]">
        Update your profile and account settings.
      </p>

      <div className="mt-7 space-y-10 border-t border-[#e0e0e0] pt-8">
        <div>
          <h3 className="font-montserrat text-lg font-semibold text-black">Profile</h3>
          <div className="mt-4 grid max-w-lg gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="font-montserrat"
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="font-montserrat"
            />
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void saveProfile(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => avatarInputRef.current?.click()}
              className="text-left font-montserrat text-[15px] text-[#333333] underline underline-offset-2 disabled:opacity-50"
            >
              Change profile photo
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveProfile()}
              className="w-fit rounded-md bg-[#FFC107] px-6 py-2.5 font-montserrat text-sm font-semibold text-black transition hover:bg-[#e6ac00] disabled:opacity-50"
            >
              Save profile
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-montserrat text-lg font-semibold text-black">Change password</h3>
          <div className="mt-4 grid max-w-lg gap-3">
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Current password"
              className="font-montserrat"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="font-montserrat"
            />
            <Input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm new password"
              className="font-montserrat"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void savePassword()}
              className="w-fit rounded-md border border-[#e0e0e0] px-6 py-2.5 font-montserrat text-sm font-medium text-black transition hover:bg-[#fafafa] disabled:opacity-50"
            >
              Update password
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-montserrat text-lg font-semibold text-red-700">Delete account</h3>
          <div className="mt-4 grid max-w-lg gap-3">
            <Input
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder="Confirm email"
              className="font-montserrat"
            />
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Password"
              className="font-montserrat"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void confirmDelete()}
              className="w-fit font-montserrat text-[15px] text-red-700 underline underline-offset-2 disabled:opacity-50"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
