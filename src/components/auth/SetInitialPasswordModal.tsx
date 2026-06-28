import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";
import { resolveIntendedPath } from "@/features/auth/paths";
import { resolvePostLoginPath, sendClaimOtp, setInitialPassword } from "@/features/auth/service";

type SetInitialPasswordModalProps = {
  email: string;
  open: boolean;
  onClose: () => void;
};

export function SetInitialPasswordModal({ email, open, onClose }: SetInitialPasswordModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser, refreshSession, resetAuthState, authStrategy } = useAuth();

  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(
    "We sent a verification code to your email. Set a new password to activate your account.",
  );

  React.useEffect(() => {
    if (!open) {
      setOtp("");
      setPassword("");
      setPasswordConfirmation("");
      setError(null);
      setMessage(
        "We sent a verification code to your email. Set a new password to activate your account.",
      );
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await sendClaimOtp(email);
      setMessage("A new verification code has been sent to your email.");
    } catch (err) {
      setError(getAuthErrorMessage(err, "Unable to resend verification code."));
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Password and confirmation do not match.");
      setLoading(false);
      return;
    }

    try {
      await setInitialPassword(
        { email, otp, password, password_confirmation: passwordConfirmation },
        { authStrategy, setToken, setUser, refreshSession, resetAuthState },
      );

      const intendedPath = resolveIntendedPath(location);
      navigate(intendedPath ?? resolvePostLoginPath(), { replace: true });
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err, "Unable to set password. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-password-title"
    >
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
        <h2 id="set-password-title" className="text-xl font-semibold text-foreground">
          Activate your account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{email}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Verification code</label>
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 4-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={4}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">New password</label>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Confirm password</label>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Set password and log in"}
            </Button>
            <Button type="button" variant="outline" disabled={resending} onClick={handleResend}>
              {resending ? "Sending..." : "Resend code"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
