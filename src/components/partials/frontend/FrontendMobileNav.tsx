import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, User, X } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { useLearningNav } from "@/features/learning/LearningNavContext";
import { useStudyGuideNav } from "@/features/studyGuides/StudyGuideNavContext";
import {
  buildSpecialtyDropdownLinks,
  SPECIALTY_AUDIO_HREF,
  type SpecialtySlug,
} from "@/data/specialtyResources";
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
  { label: "OB/GYN Sonography", to: "/ob-gyn" },
  { label: "Vascular Sonography", to: "/vascular" },
] as const;

const MOBILE_NAV_ITEM_DEFS: {
  label: string;
  to: string;
  specialty?: SpecialtySlug;
  audioHref?: string;
  children?: MobileNavItem["children"];
}[] = [
    { label: "Home", to: "/" },
    { label: "Explore Resources", to: "/exploreresources" },
    { label: "SPI", to: "/spi", specialty: "spi", audioHref: SPECIALTY_AUDIO_HREF.spi },
    { label: "Vascular", to: "/vascular", specialty: "vascular" },
    { label: "OB/GYN", to: "/ob-gyn", specialty: "ob-gyn" },
    { label: "Abdomen", to: "/abdominal", specialty: "abdominal" },
    { label: "Mock Exams", to: "/mock-exams" },
    { label: "About Us", to: "/about" },
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

function useMobileNavItems(): MobileNavItem[] {
  const { getNavChildren, isReady } = useStudyGuideNav();
  const { getFlashcardNavChildren, getPracticeNavChildren } = useLearningNav();

  return MOBILE_NAV_ITEM_DEFS.map((item) => {
    if (item.children) {
      return { label: item.label, to: item.to, children: item.children };
    }

    if (!item.specialty) {
      return { label: item.label, to: item.to };
    }

    return {
      label: item.label,
      to: item.to,
      children: buildSpecialtyDropdownLinks(
        item.specialty ? SPECIALTY_AUDIO_HREF[item.specialty] : item.audioHref,
        getNavChildren(item.specialty),
        {
          studyGuidesReady: isReady,
          flashcardChildren: getFlashcardNavChildren(item.specialty),
          practiceChildren: getPracticeNavChildren(item.specialty),
        },
      ),
    };
  });
}

function GroupedMobileSubNav({
  basePath,
  links,
  pathname,
  openSections,
  toggleSection,
  onClose,
}: {
  basePath: string;
  links: NavDropdownLink[];
  pathname: string;
  openSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-[#c4c4c4]">
      {links.map((group) => {
        const groupKey = `${basePath}-${group.slug}`;
        const hasChildren = Boolean(group.children?.length);
        const groupHref = !hasChildren
          ? group.href ?? resourceLinkPath(basePath, group)
          : undefined;
        const isGroupOpen = openSections[groupKey] ?? false;

        if (!hasChildren && groupHref) {
          return (
            <Link
              key={groupKey}
              to={groupHref}
              onClick={onClose}
              className={cn(
                mobileSubLinkClass,
                pathname === groupHref && "bg-[#bdbdbd] underline",
              )}
            >
              {group.label}
            </Link>
          );
        }

        if (!hasChildren) return null;

        return (
          <div key={groupKey}>
            <button
              type="button"
              onClick={() => toggleSection(groupKey)}
              className={cn(
                "flex w-full items-center justify-between border-b border-[#b8b8b8] px-8 py-3 text-left font-montserrat text-[15px] font-bold text-[#333333] hover:bg-[#bdbdbd]",
              )}
              aria-expanded={isGroupOpen}
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn("size-4 shrink-0 transition-transform", isGroupOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {isGroupOpen ? (
              <div className="bg-[#b5b5b5]">
                {group.children!.map((sub) => {
                  const href = resourceLinkPath(basePath, group, sub);
                  return (
                    <Link
                      key={href}
                      to={href}
                      onClick={onClose}
                      className={cn(
                        "block border-b border-[#a8a8a8] px-10 py-2.5 font-montserrat text-[14px] font-medium text-[#333333] last:border-b-0 hover:bg-[#adadad]",
                        pathname === href && "bg-[#adadad] underline",
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type FrontendMobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function FrontendMobileNav({ open, onClose }: FrontendMobileNavProps) {
  const location = useLocation();
  const mobileNavItems = useMobileNavItems();
  const { isAuthenticated, logout, user } = useAuth();
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0]?.trim() || "";
  const avatarSrc = getUserAvatarSrc(user);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showAccountMenu, setShowAccountMenu] = useState(false);
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
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 shrink-0 overflow-hidden rounded-full bg-[#e8f4fc]">
            <HeaderAvatar
              src={avatarSrc}
              alt={displayName || "Account"}
              className="h-full w-full"
            />
          </span>

          {/* {displayName ? (
            <span className="text-[17px] font-bold text-[#333333]">
              {displayName}
            </span>
          ) : null} */}

          <button
            type="button"
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className="ml-1"
          >
            <ChevronDown
              className={cn(
                "size-5 transition-transform",
                showAccountMenu && "rotate-180"
              )}
            />
          </button>

          {showAccountMenu && (
            <div className="absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-md border border-[#e8e8e8] bg-white shadow-lg">
              {USER_ACCOUNT_TABS.map(({ label, view }, index) => (
                <Link
                  key={view}
                  to={userAccountHref(view)}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 text-[15px] text-[#333333] hover:bg-[#fffbf0] hover:text-[#c5a028]",
                    index < USER_ACCOUNT_TABS.length - 1 &&
                    "border-b border-[#f0f0f0]"
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
                className="w-full border-t border-[#f0f0f0] px-4 py-3 text-left text-[15px] text-[#333333] hover:bg-[#fffbf0] hover:text-[#c5a028]"
              >
                Log Out
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto">
          {mobileNavItems.map((item) => {
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

            const subLinks = item.children!;

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
                  <GroupedMobileSubNav
                    basePath={item.to}
                    links={subLinks}
                    pathname={location.pathname}
                    openSections={openSections}
                    toggleSection={toggleSection}
                    onClose={onClose}
                  />
                ) : null}
              </div>
            );
          })}
        </nav>


      </aside>
    </>
  );
}
