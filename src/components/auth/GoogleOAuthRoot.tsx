import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

import { env } from "@/config/env";

type GoogleOAuthRootProps = {
  children: ReactNode;
};

export function GoogleOAuthRoot({ children }: GoogleOAuthRootProps) {
  if (!env.googleClientId) {
    return children;
  }

  return <GoogleOAuthProvider clientId={env.googleClientId}>{children}</GoogleOAuthProvider>;
}
