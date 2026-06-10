import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

import { env } from "@/config/env";
import { isGoogleOAuthConfigured } from "@/lib/googleOAuth";

type GoogleOAuthRootProps = {
  children: ReactNode;
};

export function GoogleOAuthRoot({ children }: GoogleOAuthRootProps) {
  if (!isGoogleOAuthConfigured(env.googleClientId)) {
    return children;
  }

  return <GoogleOAuthProvider clientId={env.googleClientId!}>{children}</GoogleOAuthProvider>;
}
