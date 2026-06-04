import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";

import { FacebookIcon } from "@/components/auth/AuthSocialIcons";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

type AuthChoiceMode = "login" | "signup";

type AuthChoicePanelProps = {
  mode: AuthChoiceMode;
  className?: string;
};

function getFacebookAuthUrl() {
  const origin = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");
  return `${origin}/auth/facebook/redirect`;
}

const copy = {
  login: {
    title: "Log In",
    subtitle: "New to this site?",
    toggleLabel: "Sign Up",
    toggleTo: "/register",
    google: "Log in with Google",
    facebook: "Log in with Facebook",
    email: "Log in with Email",
    emailTo: "/login/email",
  },
  signup: {
    title: "Sign Up",
    subtitle: "Already a member?",
    toggleLabel: "Log In",
    toggleTo: "/login",
    google: "Sign up with Google",
    facebook: "Sign up with Facebook",
    email: "Sign up with email",
    emailTo: "/register/email",
  },
} as const;

const socialBtnClass =
  "relative flex h-[52px] w-full items-center justify-center rounded-none border border-[#d1d1d1] bg-white px-4 font-montserrat text-[15px] font-normal text-[#333333] transition-colors hover:bg-[#fafafa]";

const facebookBtnClass =
  "relative flex h-[52px] w-full items-center justify-center rounded-none bg-[#1877F2] px-4 font-montserrat text-[15px] font-normal text-white transition-colors hover:bg-[#166fe0]";

const emailBtnClass =
  "flex h-[52px] w-full items-center justify-center rounded-none border border-[#d1d1d1] bg-white px-4 font-montserrat text-[15px] font-normal text-[#333333] transition-colors hover:bg-[#fafafa]";

export function AuthChoicePanel({ mode, className }: AuthChoicePanelProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const text = copy[mode];
  const query = searchParams.toString();
  const emailPath = query ? `${text.emailTo}?${query}` : text.emailTo;

  function handleFacebookLogin() {
    window.location.href = getFacebookAuthUrl();
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg bg-white px-6 py-10 sm:px-10 sm:py-12",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute right-0 top-0 p-1 text-[#333333] transition-colors hover:text-black"
        aria-label="Close"
      >
        <X className="size-7" strokeWidth={1.5} aria-hidden />
      </button>

      <div className="mx-auto w-full max-w-[340px] pt-2">
        <h1 className="text-center font-montserrat text-[32px] font-bold leading-tight text-[#333333]">
          {text.title}
        </h1>

        <p className="mt-3 text-center font-montserrat text-[15px] text-[#333333]">
          {text.subtitle}{" "}
          <Link to={text.toggleTo} className="text-[#996e00] underline-offset-2 hover:underline">
            {text.toggleLabel}
          </Link>
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <GoogleSignInButton label={text.google} className={socialBtnClass} />

          <button
            type="button"
            className={facebookBtnClass}
            onClick={handleFacebookLogin}
          >
            <FacebookIcon className="absolute left-4 size-5 text-white" />
            {text.facebook}
          </button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[#d1d1d1]" aria-hidden />
            <span className="font-montserrat text-[14px] text-[#333333]">or</span>
            <span className="h-px flex-1 bg-[#d1d1d1]" aria-hidden />
          </div>

          <Link to={emailPath} className={emailBtnClass}>
            {text.email}
          </Link>
        </div>
      </div>
    </div>
  );
}
