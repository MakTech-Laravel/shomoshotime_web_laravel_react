import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, User, X } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FrontendMobileNav } from "@/components/partials/frontend/FrontendMobileNav";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { useLearningNav } from "@/features/learning/LearningNavContext";
import { useStudyGuideNav } from "@/features/studyGuides/StudyGuideNavContext";
import {
  buildSpecialtyDropdownLinks,
  SPECIALTY_AUDIO_HREF,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import { container } from "@/lib/container";
import { PRICING_PLANS_PATH } from "@/lib/paths";
import { USER_ACCOUNT_TABS, userAccountHref } from "@/lib/userAccountNav";
import { getUserAvatarSrc } from "@/lib/userAvatar";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type NavDropdownLink = {
  label: string;
  slug: string;
  href?: string;
  children?: { label: string; slug: string }[];
};

type NavItem =
  | { label: string; to: string; children?: undefined }
  | { label: string; to: string; children: NavDropdownLink[] };

/* -------------------------------------------------------------------------- */
/*  Nav data                                                                  */
/* -------------------------------------------------------------------------- */

const NAV_ITEM_DEFS: {
  label: string;
  to: string;
  specialty?: SpecialtySlug;
  audioHref?: string;
}[] = [
    { label: "Home", to: "/" },
    { label: "Explore Resources", to: "/exploreresources" },
    { label: "SPI", to: "/spi", specialty: "spi", audioHref: SPECIALTY_AUDIO_HREF.spi },
    { label: "Vascular", to: "/vascular", specialty: "vascular" },
    { label: "OB/GYN", to: "/ob-gyn", specialty: "ob-gyn" },
    { label: "Abdomen", to: "/abdominal", specialty: "abdominal" },
    { label: "Mock Exams", to: "/mock-exams" },
    { label: "About Us", to: "/about" },
  ];

/* -------------------------------------------------------------------------- */
/*  Shared class tokens — nav #333333 • active #c5a028 • CTA #ffc107         */
/* -------------------------------------------------------------------------- */

const headerNavClass =
  "whitespace-nowrap font-montserrat text-[14px] font-regular leading-none tracking-[0.01em] text-[#333333] transition-colors duration-150 sm:text-base";

const headerNavActiveClass = "text-[#c5a028]";

const headerNavHoverClass = "hover:text-[#c5a028]";

const headerCtaClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-[5px] border border-black bg-[#ffc107] px-5 font-montserrat text-[13px] font-bold leading-none text-black shadow-none transition-colors hover:bg-[#e6ac00] sm:h-10 sm:px-6 sm:text-sm";

/** All specialty dropdown items (leaf + nested) share blue hover/active. */
const dropdownLinkClass =
  "block px-5 py-2.5 font-montserrat text-[14px] font-normal leading-snug text-[#333333] transition-colors hover:text-[#2563eb] hover:underline hover:decoration-[#2563eb] hover:decoration-2 hover:underline-offset-4";

const dropdownLinkClassMobile =
  "block rounded-md px-3 py-2.5 font-montserrat text-[14px] font-normal leading-snug text-[#333333] transition-colors hover:text-[#2563eb] hover:underline hover:decoration-[#2563eb] hover:decoration-2 hover:underline-offset-4";

/** Signed-in header menu (matches profile dropdown pattern). */
const SIGNED_IN_ACCOUNT_LINKS = USER_ACCOUNT_TABS.map(({ label, view }) => ({
  label,
  to: userAccountHref(view),
}));

const accountDropdownPanelClass =
  "min-w-[220px] border border-[#f0f0f0] bg-white p-0 py-2 font-montserrat shadow-[0_8px_24px_rgba(0,0,0,0.08)]";

const accountDropdownItemClass =
  "cursor-pointer rounded-none px-5 py-2.5 text-left text-[14px] font-normal leading-snug text-[#333333] focus:bg-[#fffbf0] focus:text-[#c5a028] data-[highlighted]:bg-[#fffbf0] data-[highlighted]:text-[#c5a028]";

const accountDropdownSeparatorClass = "my-1 h-px bg-[#f0f0f0]";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function resourceLinkPath(basePath: string, child: NavDropdownLink, sub?: { slug: string }) {
  if (!sub && child.href) return child.href;
  return sub ? `${basePath}/${child.slug}/${sub.slug}` : `${basePath}/${child.slug}`;
}

function isResourceLinkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavSectionActive(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

/* -------------------------------------------------------------------------- */
/*  Brand logo (left side of header)                                          */
/* -------------------------------------------------------------------------- */

function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("inline-flex shrink-0 items-center py-1.5", className)}
      aria-label="Sonographer Pal home"
    >
      {/* Wrapper height controls logo size; img uses h-full so layout wins over img defaults */}
      <span className="inline-flex h-14 items-center sm:h-16 lg:h-[72px]">
        <img
          src="/images/logo.png"
          alt="Sonographer Pal"
          width={600}
          height={374}
          decoding="async"
          className="h-full w-auto max-w-[min(68vw,280px)] object-contain object-left select-none sm:max-w-[min(50vw,320px)] lg:max-w-[360px]"
          draggable={false}
        />
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Resource dropdown links (shared by desktop + mobile)                      */
/* -------------------------------------------------------------------------- */

const dropdownMenuActiveClass =
  "text-[#2563eb] underline decoration-[#2563eb] decoration-2 underline-offset-4";

const nestedParentItemClass = cn(
  dropdownLinkClass,
  "flex cursor-default items-center justify-between gap-3 pr-4 select-none",
);

const nestedSubItemClass = cn(dropdownLinkClass, "whitespace-normal");

const nestedParentItemMobileClass = cn(
  dropdownLinkClassMobile,
  "cursor-default select-none",
);

function ResourceDropdownLinks({
  basePath,
  links,
  pathname,
  onNavigate,
  variant,
}: {
  basePath: string;
  links: NavDropdownLink[];
  pathname: string;
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
}) {
  const [openNestedSlug, setOpenNestedSlug] = useState<string | null>(null);

  const leafLinkClass = variant === "desktop" ? dropdownLinkClass : dropdownLinkClassMobile;
  const subLinkClassMobile = cn(dropdownLinkClassMobile, "py-1.5 text-[13px] whitespace-normal");

  return links.map((child) => {
    const href = resourceLinkPath(basePath, child);
    const active = isResourceLinkActive(pathname, href);

    /* ---- leaf link ---- */
    if (!child.children?.length) {
      return (
        <Link
          key={child.slug}
          to={href}
          onClick={onNavigate}
          className={cn(leafLinkClass, active && dropdownMenuActiveClass)}
        >
          {child.label}
        </Link>
      );
    }

    /* ---- desktop nested submenu (one open at a time) ---- */
    if (variant === "desktop") {
      const submenuActive = child.children.some((sub) =>
        isResourceLinkActive(pathname, resourceLinkPath(basePath, child, sub)),
      );
      const isOpen = openNestedSlug === child.slug;
      const parentHighlighted = isOpen || submenuActive;

      return (
        <div
          key={child.slug}
          className="group/nested relative"
          onMouseEnter={() => setOpenNestedSlug(child.slug)}
          onMouseLeave={() => setOpenNestedSlug(null)}
        >
          <span
            role="presentation"
            className={cn(
              nestedParentItemClass,
              parentHighlighted && dropdownMenuActiveClass,
            )}
          >
            {child.label}
            <ChevronRight
              className={cn(
                "size-4 shrink-0 transition-colors",
                parentHighlighted
                  ? "text-[#2563eb]"
                  : "text-black/45 group-hover/nested:text-[#2563eb]",
              )}
              aria-hidden
            />
          </span>

          <div
            className={cn(
              "absolute left-full top-0 z-60 pl-1 transition-[opacity,visibility] duration-150",
              isOpen
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0",
            )}
          >
            <div className="min-w-72 max-w-xs border border-[#f0f0f0] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              {child.children.map((sub) => {
                const subHref = resourceLinkPath(basePath, child, sub);
                const subActive = isResourceLinkActive(pathname, subHref);
                return (
                  <Link
                    key={sub.slug}
                    to={subHref}
                    onClick={onNavigate}
                    className={cn(nestedSubItemClass, subActive && dropdownMenuActiveClass)}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    /* ---- mobile nested list ---- */
    const submenuActive = child.children.some((sub) =>
      isResourceLinkActive(pathname, resourceLinkPath(basePath, child, sub)),
    );

    return (
      <div key={child.slug} className="flex flex-col gap-0.5">
        <span
          role="presentation"
          className={cn(nestedParentItemMobileClass, submenuActive && dropdownMenuActiveClass)}
        >
          {child.label}
        </span>
        <div className="ml-6 flex flex-col border-l border-border-light pl-3">
          {child.children.map((sub) => {
            const subHref = resourceLinkPath(basePath, child, sub);
            return (
              <Link
                key={sub.slug}
                to={subHref}
                onClick={onNavigate}
                className={cn(
                  subLinkClassMobile,
                  isResourceLinkActive(pathname, subHref) && dropdownMenuActiveClass,
                )}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  });
}

/* -------------------------------------------------------------------------- */
/*  Desktop nav dropdown wrapper (SPI / Vascular / OB-GYN / Abdominal)        */
/* -------------------------------------------------------------------------- */

function DesktopNavDropdown({ item }: { item: NavItem & { children: NavDropdownLink[] } }) {
  const location = useLocation();
  const sectionActive = isNavSectionActive(location.pathname, item.to);

  return (
    <div className="group relative">
      <span
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-label={`${item.label} menu`}
        className={cn(
          headerNavClass,
          sectionActive ? headerNavActiveClass : headerNavHoverClass,
          "inline-flex cursor-default select-none outline-none",
        )}
      >
        {item.label}
      </span>

      <div
        className={cn(
          "pointer-events-none absolute left-0 top-full z-50 pt-2",
          "invisible opacity-0 transition-[opacity,visibility] duration-150",
          "group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100",
          "group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100",
        )}
      >
        <div className="min-w-54 overflow-visible border border-[#f0f0f0] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <ResourceDropdownLinks
            basePath={item.to}
            links={item.children}
            pathname={location.pathname}
            variant="desktop"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop nav row                                                           */
/* -------------------------------------------------------------------------- */

function useNavItems(): NavItem[] {
  const { getNavChildren, isReady } = useStudyGuideNav();
  const { getFlashcardNavChildren, getPracticeNavChildren } = useLearningNav();

  return NAV_ITEM_DEFS.map((item) => {
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

function DesktopNav() {
  const navItems = useNavItems();

  return (
    <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
      {navItems.map((item) =>
        item.children ? (
          <DesktopNavDropdown key={item.to} item={item} />
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(headerNavClass, isActive ? headerNavActiveClass : headerNavHoverClass)
            }
          >
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Get Started → pricing plans                                               */
/* -------------------------------------------------------------------------- */

function GetStartedCta({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={PRICING_PLANS_PATH}
      onClick={onClick}
      className={cn(headerCtaClass, className)}
    >
      Get Started
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Guest: Log In + Get Started (desktop)                                     */
/* -------------------------------------------------------------------------- */

function GuestAuthMenu() {
  return (
    <div className="hidden items-center gap-3 sm:gap-4 lg:flex">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-sm outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-[#c5a028]/35"
        aria-label="Log in"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white sm:size-11">
          <User className="size-5 sm:size-[22px]" strokeWidth={2} aria-hidden />
        </span>
        <span className="font-montserrat text-sm font-normal text-black sm:text-base">Log In</span>
      </Link>
      <GetStartedCta />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Signed in: profile avatar + dropdown + Get Started CTA (desktop)        */
/* -------------------------------------------------------------------------- */

function SignedInAuthMenu() {
  const { isAuthenticated, logout, user } = useAuth();

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0]?.trim() || "";
  const avatarSrc = getUserAvatarSrc(user);

  return (
    <div className="hidden items-center gap-3 lg:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-sm p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[#c5a028]/35"
            aria-label="Account menu"
          >
            {displayName ? (
              <span className="max-w-[8rem] truncate font-montserrat text-[14px] font-normal text-black sm:max-w-[10rem] sm:text-base">
                {displayName}
              </span>
            ) : null}
            <span className="flex size-11 shrink-0 overflow-hidden rounded-full bg-[#e8f4fc] sm:size-12">
              <HeaderAvatar
                src={avatarSrc}
                alt={displayName || "Account"}
                className="h-full w-full"
              />
            </span>
            <ChevronDown className="size-5 shrink-0 text-[#333333]" strokeWidth={2} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className={accountDropdownPanelClass}>
          {SIGNED_IN_ACCOUNT_LINKS.map(({ label, to }) => (
            <DropdownMenuItem key={to + label} asChild className={accountDropdownItemClass}>
              <Link to={to}>{label}</Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className={accountDropdownSeparatorClass} />
          <DropdownMenuItem
            onSelect={() => {
              if (isAuthenticated) void logout();
            }}
            className={cn(accountDropdownItemClass, "text-[#333333]")}
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GetStartedCta />
    </div>
  );
}

function AuthMenu() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <SignedInAuthMenu /> : <GuestAuthMenu />;
}

/* -------------------------------------------------------------------------- */
/*  Mobile nav (hamburger drawer)                                             */
/* -------------------------------------------------------------------------- */

function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="ghost"
        className="h-12 w-12 rounded-lg p-0 text-[#333333] hover:bg-[#fafafa] sm:h-14 sm:w-14"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => onOpenChange(!open)}
      >
        {open ? <X className="size-7 sm:size-8" aria-hidden /> : <Menu className="size-7 sm:size-8" aria-hidden />}
      </Button>

      <FrontendMobileNav open={open} onClose={() => onOpenChange(false)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main exported header                                                      */
/* -------------------------------------------------------------------------- */

export function FrontendHeader({
  mobileNavOpen = false,
  onMobileNavOpenChange,
}: {
  mobileNavOpen?: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-40 overflow-visible bg-white font-montserrat">
      <div className="border-b border-[#ebebeb] bg-white">
        <div
          className={cn(
            container,
            "relative flex min-h-[72px] items-center justify-between gap-4 overflow-visible py-2 sm:min-h-[80px] lg:min-h-[84px]",
          )}
        >
          <BrandLogo />
          <div className="hidden flex-1 justify-center overflow-visible lg:flex">
            <DesktopNav />
          </div>
          <div className="flex shrink-0 items-center gap-3 overflow-visible sm:gap-4">
            <AuthMenu />
            <MobileNav
              open={mobileNavOpen}
              onOpenChange={onMobileNavOpenChange ?? (() => { })}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
