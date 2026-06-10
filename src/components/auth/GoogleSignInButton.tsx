import { useGoogleLogin } from "@react-oauth/google";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { GoogleIcon } from "@/components/auth/AuthSocialIcons";
import { useAuth } from "@/auth/useAuth";
import { env } from "@/config/env";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";
import { resolveIntendedPath } from "@/features/auth/paths";
import { googleLoginUser, resolvePostLoginPath } from "@/features/auth/service";
import { getGoogleClientIdIssue, googleClientIdHelpMessage } from "@/lib/googleOAuth";
import { cn } from "@/lib/utils";

type GoogleSignInButtonProps = {
  label: string;
  className?: string;
};

function GoogleSignInButtonDisabled({
  label,
  className,
  issue,
}: GoogleSignInButtonProps & { issue: NonNullable<ReturnType<typeof getGoogleClientIdIssue>> }) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled
        className={cn(
          "relative flex h-[52px] w-full cursor-not-allowed items-center justify-center rounded-none border border-[#d1d1d1] bg-[#f5f5f5] px-4 font-montserrat text-[15px] font-normal text-[#999999]",
          className,
        )}
      >
        <GoogleIcon className="absolute left-4 size-5 opacity-50" />
        {label}
      </button>
      <p className="text-center font-montserrat text-[13px] text-[#996e00]">
        {googleClientIdHelpMessage(issue)}
      </p>
    </div>
  );
}

function GoogleSignInButtonActive({ label, className }: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser, refreshSession, resetAuthState, authStrategy } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        await googleLoginUser(
          { access_token: tokenResponse.access_token },
          { authStrategy, setToken, setUser, refreshSession, resetAuthState },
        );

        const intendedPath = resolveIntendedPath(location);
        if (intendedPath) {
          navigate(intendedPath, { replace: true });
          return;
        }
        navigate(resolvePostLoginPath(), { replace: true });
      } catch (err) {
        setError(getAuthErrorMessage(err, "Google sign-in failed. Please try again."));
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or could not start.");
    },
  });

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => startGoogleLogin()}
        className={cn(
          "relative flex h-[52px] w-full items-center justify-center rounded-none border border-[#d1d1d1] bg-white px-4 font-montserrat text-[15px] font-normal text-[#333333] transition-colors hover:bg-[#fafafa] disabled:cursor-wait disabled:opacity-70",
          className,
        )}
      >
        <GoogleIcon className="absolute left-4 size-5" />
        {loading ? "Signing in..." : label}
      </button>
      {error ? (
        <p className="text-center font-montserrat text-[13px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function GoogleSignInButton({ label, className }: GoogleSignInButtonProps) {
  const clientIdIssue = getGoogleClientIdIssue(env.googleClientId);
  if (clientIdIssue) {
    return <GoogleSignInButtonDisabled label={label} className={className} issue={clientIdIssue} />;
  }

  return <GoogleSignInButtonActive label={label} className={className} />;
}
