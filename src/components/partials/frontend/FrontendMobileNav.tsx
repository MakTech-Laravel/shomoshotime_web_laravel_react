import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, User, X } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { buildSpecialtyDropdownLinks } from "@/data/specialtyResources";
import { PRICING_PLANS_PATH } from "@/lib/paths";
import { getUserAvatarSrc } from "@/lib/userAvatar";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { USER_ACCOUNT_TABS, userAccountHref } from "@/lib/userAccountNav";
import { cn } from "@/lib/utils";

type NavDropdownLink = {
  label: string;
  slug: string;
  href?: string;
  children?: { label: string; slug: string }[];
};

type MobileNavItem =
  | { label: string; to: string; children?: undefined }
  | { label: string; to: string; children: NavDropdownLink[] };

const STUDY_MATERIALS_LINKS = [
  { label: "SPI (Ultrasound Physics)", to: "/spi" },
  { label: "Abdominal Sonography", to: "/abdominal" },
  { label: "OB/Gyn Sonography", to: "/ob-gyn" },
  { label: "Vascular Sonography", to: "/vascular" },
] as const;

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: "Home", to: "/" },
  { label: "Explore Resources", to: "/exploreresources" },
  { label: "SPI", to: "/spi", children: buildSpecialtyDropdownLinks("/audio/spi") },
  { label: "Vascular", to: "/vascular", children: buildSpecialtyDropdownLinks() },
  { label: "OB/GYN", to: "/ob-gyn", children: buildSpecialtyDropdownLinks() },
  { label: "Abdominal", to: "/abdominal", children: buildSpecialtyDropdownLinks() },
  { label: "About Us", to: "/about" },
  { label: "Test", to: "/test" },
  {
    label: "Study Materials",
    to: "/exploreresources",
    children: STUDY_MATERIALS_LINKS.map((link) => ({
      label: link.label,
      slug: link.to.replace(/^\//, ""),
      href: link.to,
    })),
  },
];

const mobileItemClass =
  "flex w-full items-center justify-between border-b border-[#b8b8b8] px-5 py-4 text-left font-montserrat text-[17px] font-bold leading-snug text-[#333333]";

const mobileActiveClass = "bg-[#a6893b] text-white";

const mobileSubLinkClass =
  "block border-b border-[#b8b8b8] px-8 py-3 font-montserrat text-[15px] font-semibold text-[#333333] last:border-b-0 hover:bg-[#bdbdbd]";

function resourceLinkPath(basePath: string, child: NavDropdownLink, sub?: { slug: string }) {
  if (!sub && child.href) return child.href;
  return sub ? `${basePath}/${child.slug}/${sub.slug}` : `${basePath}/${child.slug}`;
}

function isNavSectionActive(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function flattenDropdownLinks(basePath: string, links: NavDropdownLink[]) {
  const flat: { label: string; href: string }[] = [];
  for (const child of links) {
    if (child.children?.length) {
      for (const sub of child.children) {
        flat.push({
          label: sub.label,
          href: resourceLinkPath(basePath, child, sub),
        });
      }
    } else {
      flat.push({
        label: child.label,
        href: resourceLinkPath(basePath, child),
      });
    }
  }
  return flat;
}

type FrontendMobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function FrontendMobileNav({ open, onClose }: FrontendMobileNavProps) {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0]?.trim() || "";
  const avatarSrc = getUserAvatarSrc(user);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close menu overlay"
        className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed inset-0 z-50 flex flex-col bg-[#cccccc] font-montserrat lg:hidden">
        <div className="flex items-center justify-between border-b border-[#b8b8b8] px-5 py-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 overflow-hidden rounded-full bg-[#e8f4fc]">
                <HeaderAvatar
                  src={avatarSrc}
                  alt={displayName || "Account"}
                  className="h-full w-full"
                />
              </span>
              {displayName ? (
                <span className="text-[17px] font-bold text-[#333333]">{displayName}</span>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="inline-flex items-center gap-2"
              aria-label="Log in"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <User className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="text-[17px] font-bold text-[#333333]">Log In</span>
            </Link>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#333333]"
            aria-label="Close menu"
          >
            <X className="size-8" strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {MOBILE_NAV_ITEMS.map((item) => {
            const sectionKey = item.to;
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : isNavSectionActive(location.pathname, item.to);
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openSections[sectionKey] ?? isActive;

            if (!hasChildren) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(mobileItemClass, isActive && mobileActiveClass)}
                >
                  {item.label}
                </Link>
              );
            }

            const subLinks = flattenDropdownLinks(item.to, item.children!);

            return (
              <div key={item.to}>
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className={cn(mobileItemClass, isActive && mobileActiveClass)}
                  aria-expanded={isOpen}
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 transition-transform",
                      isOpen && "rotate-180",
                      isActive && "text-white",
                    )}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div className="bg-[#c4c4c4]">
                    {subLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={onClose}
                        className={cn(
                          mobileSubLinkClass,
                          location.pathname === link.href && "bg-[#bdbdbd] underline",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[#b8b8b8] p-5">
          {isAuthenticated ? (
            <div className="overflow-hidden rounded-md border border-[#e8e8e8] bg-white">
              {USER_ACCOUNT_TABS.map(({ label, view }, index) => (
                <Link
                  key={view}
                  to={userAccountHref(view)}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 font-montserrat text-[15px] font-normal text-[#333333] hover:bg-[#fffbf0] hover:text-[#c5a028]",
                    index < USER_ACCOUNT_TABS.length - 1 && "border-b border-[#f0f0f0]",
                  )}
                >
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void logout();
                }}
                className="w-full border-t border-[#f0f0f0] px-4 py-3 text-left font-montserrat text-[15px] font-normal text-[#333333] hover:bg-[#fffbf0] hover:text-[#c5a028]"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-[5px] border border-[#e8e8e8] bg-white font-montserrat text-sm font-bold text-[#333333] hover:bg-[#fffbf0]"
            >
              Log In
            </Link>
          )}
          <Link
            to={PRICING_PLANS_PATH}
            onClick={onClose}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-[5px] border border-black bg-[#ffc107] font-montserrat text-sm font-bold text-black"
          >
            Get Started
          </Link>
        </div>
      </aside>
    </>
  );
}
