import { Camera, MoreVertical } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const DEMO_DISPLAY_NAME = "Md Shariful Islam MakTech";

type UserProfileBannerProps = {
  className?: string;
};

export function UserProfileBanner({ className }: UserProfileBannerProps) {
  const { user, logout } = useAuth();
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    DEMO_DISPLAY_NAME;

  return (
    <section className={cn("relative pb-5", className)}>
      {/* Banner background — amber/yellow #FFC107 */}
      <div className="relative h-[15rem] rounded-sm bg-[#FFC107]">

        {/* Camera icon — top-left */}
        <button
          type="button"
          className="absolute left-3.5 top-3.5 flex size-7 items-center justify-center text-white transition hover:opacity-80"
          aria-label="Change cover photo"
        >
          <Camera className="size-5" strokeWidth={1.75} aria-hidden />
        </button>

        {/* Three-dot menu — bottom-right */}
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
            <DropdownMenuItem>Edit profile</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void logout();
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Display name — bottom, aligned with avatar */}
        <h1 className="absolute bottom-15 left-40  max-w-[calc(100%-9rem)] font-montserrat text-[2.125rem]  leading-snug text-black">
          {displayName}
        </h1>
      </div>

      {/* Avatar — overlaps bottom of banner */}
      <div className="absolute bottom-20 left-15">
        <div className="size-[5.25rem] overflow-hidden rounded-full border-[3px] border-white bg-white">
          <HeaderAvatar
            alt={displayName}
            className="h-full w-full object-cover"
            fallbackSrc="/images/about/jessica-demarco.png"
          />
        </div>
      </div>
    </section>
  );
}