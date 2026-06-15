import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { FrontendChatFab } from "@/components/partials/frontend/FrontendChatFab";
import { FrontendFooter } from "@/components/partials/frontend/FrontendFooter";
import { FrontendHeader } from "@/components/partials/frontend/FrontendHeader";

export function FrontendLayout() {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const hideFooter = /\/study-guides\//.test(pathname);
  const hideChatFab =
    mobileNavOpen ||
    hideFooter ||
    /\/flashcards(\/|$)/.test(pathname) ||
    /\/practice-questions(\/|$)/.test(pathname) ||
    /\/mock-exams(\/|$)/.test(pathname);

  return (
    <div className="min-h-dvh bg-background">
      <FrontendHeader mobileNavOpen={mobileNavOpen} onMobileNavOpenChange={setMobileNavOpen} />
      <main className="mx-auto w-full">
        <Outlet />
      </main>
      {!hideFooter && <FrontendFooter />}
      {!hideChatFab && <FrontendChatFab />}
    </div>
  );
}
