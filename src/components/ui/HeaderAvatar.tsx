import { useEffect, useState } from "react";

import { DEFAULT_HEADER_AVATAR } from "@/lib/userAvatar";
import { cn } from "@/lib/utils";

type HeaderAvatarProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
};

function pickAvatarSrc(src: string | null | undefined, fallbackSrc: string) {
  const trimmed = src?.trim();
  return trimmed ? trimmed : fallbackSrc;
}

export function HeaderAvatar({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_HEADER_AVATAR,
}: HeaderAvatarProps) {
  const [avatarSrc, setAvatarSrc] = useState(() => pickAvatarSrc(src, fallbackSrc));

  useEffect(() => {
    setAvatarSrc(pickAvatarSrc(src, fallbackSrc));
  }, [src, fallbackSrc]);

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      decoding="async"
      loading="eager"
      onError={() => setAvatarSrc(fallbackSrc)}
    />
  );
}
