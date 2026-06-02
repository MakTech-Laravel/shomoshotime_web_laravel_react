import { lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { authRoutes } from "@/routes/authRoutes";
import { publicRoutes } from "@/routes/publicRoutes";
import { ScrollToTopLayout, suspensePage } from "@/routes/routeUtils";

const Unauthorized = lazy(() => import("@/pages/global/Unauthorized"));
const NotFound = lazy(() => import("@/pages/global/NotFound"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

const redirect = (to: string) => <Navigate to={to} replace />;

export const router = createBrowserRouter([
  {
    element: <ScrollToTopLayout />,
    children: [
      publicRoutes,
      ...authRoutes,
      { path: "/unauthorized", element: suspensePage(Unauthorized) },
      { path: "/dashboard", element: redirect("/account/my-subscriptions") },
      { path: "/admin", element: redirect("/admin/dashboard") },
      { path: "/admin/dashboard", element: suspensePage(AdminDashboard) },
      { path: "*", element: suspensePage(NotFound) },
    ],
  },
]);
