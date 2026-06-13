import { useRef } from "react";
import { Camera, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "@/auth/useAuth";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateProfile } from "@/features/account/accountApi";
import { userAccountHref } from "@/lib/userAccountNav";
import { getUserAvatarSrc } from "@/lib/userAvatar";
import { cn } from "@/lib/utils";

type UserProfileBannerProps = {
  className?: string;
};

export function UserProfileBanner({ className }: UserProfileBannerProps) {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "Your account";
  const avatarSrc = getUserAvatarSrc(user);

  async function uploadAvatar(file: File) {
    try {
      const updated = await updateProfile({ file });
      if (updated) setUser(updated);
      toast.success("Profile photo updated.");
    } catch {
      toast.error("Unable to update profile photo.");
    }
  }

  return (
    <section className={cn("relative pb-5", className)}>
      <div className="relative h-[15rem] rounded-sm bg-[#FFC107]">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadAvatar(file);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="absolute left-3.5 top-3.5 flex size-7 items-center justify-center text-white transition hover:opacity-80"
          aria-label="Change profile photo"
        >
          <Camera className="size-5" strokeWidth={1.75} aria-hidden />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute bottom-3.5 right-3.5 flex size-8 items-center justify-center text-[#3d3d3d] transition hover:opacity-70"
              aria-label="Profile options"
            >
              <MoreVertical className="size-5" strokeWidth={2.5} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-montserrat">
            <DropdownMenuItem onSelect={() => navigate(userAccountHref("account"))}>
              Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void logout();
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <h1 className="absolute bottom-15 left-40 max-w-[calc(100%-9rem)] font-montserrat text-[2.125rem] leading-snug text-black">
          {displayName}
        </h1>
      </div>

      <div className="absolute bottom-20 left-15">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="size-[5.25rem] overflow-hidden rounded-full border-[3px] border-white bg-white"
          aria-label="Change profile photo"
        >
          <HeaderAvatar
            src={avatarSrc}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </section>
  );
}
