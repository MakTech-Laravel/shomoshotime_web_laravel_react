import * as React from "react";
import { ArrowRight, Eye } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPasswordResetEmail } from "@/auth/passwordResetSession";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";
import { resetPasswordWithToken } from "@/features/auth/service";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const email =
    searchParams.get("email")?.trim().toLowerCase() ??
    getPasswordResetEmail() ??
    "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError("Missing email. Please restart the forgot-password flow.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken({
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate("/login/email", {
        replace: true,
        state: { message: "Password updated. You can sign in now." },
      });
    } catch (err) {
      setError(getAuthErrorMessage(err, "Failed to reset password. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-bg p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-inter font-semibold text-foreground mb-2">
              Reset your password
            </h2>
            <p className="text-base font-inter font-normal text-muted-foreground text-center">
              Set your new password and sign in again.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="8+ characters"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="my-7">
              <Button
                type="submit"
                variant="default"
                disabled={loading}
                className="flex justify-center w-full h-11 rounded-lg bg-brand px-6 text-base font-medium text-ice shadow-none hover:bg-brand/90"
              >
                <span className="inline-flex items-center gap-2 bg-brand">
                  {loading ? "Saving..." : "Reset Password"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </form>

          <div className="text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
