import { useEffect } from "react";
import { Link } from "react-router-dom";

import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact | Sonographer Pal";
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "py-12 lg:py-16")}>
        <h1 className="text-center font-heading text-3xl font-bold text-black sm:text-4xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-base text-[#444444]">
          We&apos;re here to help with account questions, technical support, and study resource
          inquiries.
        </p>

        <div className="mx-auto mt-10 max-w-lg rounded-md border border-[#e5e7eb] bg-white p-8 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-black">Email</h2>
          <p className="mt-2 font-sans text-base text-[#333333]">
            <a
              href="mailto:info@sonographerpal.com"
              className="font-semibold text-[#b8860b] hover:underline"
            >
              info@sonographerpal.com
            </a>
          </p>

          <h2 className="mt-8 font-heading text-xl font-bold text-black">Account &amp; billing</h2>
          <p className="mt-2 font-sans text-base leading-relaxed text-[#333333]">
            For subscription or payment questions, sign in and visit{" "}
            <Link to="/account/my-subscriptions" className="text-[#b8860b] hover:underline">
              My Subscriptions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
