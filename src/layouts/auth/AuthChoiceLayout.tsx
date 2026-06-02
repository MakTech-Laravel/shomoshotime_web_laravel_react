import { Outlet } from "react-router-dom";

export function AuthChoiceLayout() {
  return (
    <div className="flex min-h-dvh items-start justify-center bg-white pt-8 sm:items-center sm:pt-0">
      <Outlet />
    </div>
  );
}
