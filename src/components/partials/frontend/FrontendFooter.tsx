import { Link } from "react-router-dom";

import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type FooterLink = { label: string; to?: string; href?: string };

const FOOTER_COLUMNS: { title: string; links: readonly FooterLink[] }[] = [
  {
    title: "Study Materials",
    links: [
      { label: "SPI (Ultrasound Physics)", to: "/spi" },
      { label: "Abdominal Sonography", to: "/abdominal" },
      { label: "OB/Gyn Sonography", to: "/ob-gyn" },
      { label: "Vascular Sonography", to: "/vascular" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", to: "/pricing-plans" },
      { label: "Explore Resources", to: "/explore" },
      { label: "About us", to: "/about" },
      { label: "FAQ", to: "/faq" },
    ],
  },
];

const footerHeadingClass =
  "font-montserrat text-[15px] font-bold leading-snug text-[#1a1a1a]";

const footerLinkClass =
  "font-montserrat text-[14px] font-normal leading-snug text-black transition-colors hover:text-[#333333]";

function FooterColumn({ title, links }: { title: string; links: readonly FooterLink[] }) {
  return (
    <div>
      <h4 className={footerHeadingClass}>{title}</h4>
      <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link to={link.to} className={footerLinkClass}>
                {link.label}
              </Link>
            ) : (
              <a href={link.href ?? "#"} className={footerLinkClass}>
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FrontendFooter() {
  return (
    <footer>
      <div className="bg-[#f8f8f8]">
        <div className={cn(container, "py-12 sm:py-14 lg:py-16")}>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-8">
            <div>
              <Link to="/" className="inline-flex items-center" aria-label="Sonographer Pal home">
                <img
                  src="/images/logo.png"
                  alt="Sonographer Pal"
                  width={600}
                  height={274}
                  className="block h-14 w-auto select-none object-contain"
                  draggable={false}
                />
              </Link>
              <p className="mt-4 max-w-[17rem] font-montserrat text-[14px] font-normal leading-[1.6] text-black">
                Comprehensive digital resources designed specifically for sonographers preparing
                for ARDMS<sup>&reg;</sup>, ARRT<sup>&reg;</sup>, and CCI<sup>&reg;</sup> specialty
                examinations.
              </p>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <FooterColumn key={column.title} title={column.title} links={column.links} />
            ))}

            <div>
              <h4 className={footerHeadingClass}>Connect With Us</h4>
              <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
                <li>
                  <Link to="/contact" className={footerLinkClass}>
                    Contact
                  </Link>
                </li>
                <li>
                  <a href="mailto:info@sonographerpal.com" className={footerLinkClass}>
                    info@sonographerpal.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-footer-socket text-white">
        <div
          className={cn(
            container,
            "flex flex-col items-start justify-between gap-3 py-3 sm:flex-row sm:items-center",
          )}
        >
          <p className="font-montserrat text-xs text-white">
            &copy; {new Date().getFullYear()} Sonographer Pal. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link
              to="/terms"
              className="font-montserrat text-xs text-white transition hover:text-white/90"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy-policy"
              className="font-montserrat text-xs text-white transition hover:text-white/90"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
