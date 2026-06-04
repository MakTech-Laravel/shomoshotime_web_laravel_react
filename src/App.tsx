import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { AppBootstrap } from "@/AppBootstrap";
import { AuthProvider } from "@/auth/AuthProvider";
import { GoogleOAuthRoot } from "@/components/auth/GoogleOAuthRoot";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthRoot>
        <AuthProvider>
          <ErrorBoundary>
            <AppBootstrap />
          </ErrorBoundary>
          <Toaster position="top-right" />
        </AuthProvider>
      </GoogleOAuthRoot>
    </QueryClientProvider>
  );
}
