import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";

import { FrontendLayout } from "@/layouts/frontend/FrontendLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { suspensePage } from "@/routes/routeUtils";

const Home = lazy(() => import("@/pages/frontend/Home"));
const ExploreResources = lazy(() => import("@/pages/frontend/ExploreResources"));
const PricingPlans = lazy(() => import("@/pages/frontend/PricingPlans"));
const AboutUs = lazy(() => import("@/pages/frontend/AboutUs"));
const Test = lazy(() => import("@/pages/frontend/Test"));
const StudyGuideViewerPage = lazy(() => import("@/pages/frontend/StudyGuideViewerPage"));
const SpiAudioPage = lazy(() => import("@/pages/frontend/SpiAudioPage"));
const SpecialtyFlashcardsPage = lazy(() => import("@/pages/frontend/SpecialtyFlashcardsPage"));
const SpecialtyPracticePage = lazy(() => import("@/pages/frontend/SpecialtyPracticePage"));
const UserAccountPage = lazy(() => import("@/pages/user/UserAccountPage"));
const LegacyUserDashboardRedirect = lazy(() =>
  import("@/components/user/LegacyUserDashboardRedirect").then((m) => ({
    default: m.LegacyUserDashboardRedirect,
  })),
);

export const publicRoutes: RouteObject = {
  element: <FrontendLayout />,
  children: [
    { path: "/", element: suspensePage(Home) },
    { path: "/exploreresources", element: suspensePage(ExploreResources) },
    { path: "/pricing-plans", element: suspensePage(PricingPlans) },
    { path: "/pricing", element: <Navigate to="/pricing-plans" replace /> },
    { path: "/plans", element: <Navigate to="/pricing-plans" replace /> },
    { path: "/about", element: suspensePage(AboutUs) },
    { path: "/about-us", element: <Navigate to="/about" replace /> },
    { path: "/test", element: suspensePage(Test) },
    {
      element: (
        <ProtectedRoute forceAuth loginPath="/login/email" />
      ),
      children: [
        { path: "/account", element: <Navigate to="/account/my-subscriptions" replace /> },
        { path: "/account/my-subscriptions", element: suspensePage(UserAccountPage) },
        { path: "/account/my-orders", element: suspensePage(UserAccountPage) },
        { path: "/account/my-addresses", element: suspensePage(UserAccountPage) },
        { path: "/account/my-wallet", element: suspensePage(UserAccountPage) },
        { path: "/account/my-account", element: suspensePage(UserAccountPage) },
        { path: "/user/dashboard", element: suspensePage(LegacyUserDashboardRedirect) },
        { path: "/dashboard", element: suspensePage(LegacyUserDashboardRedirect) },
      ],
    },
    { path: "/:specialty/study-guides/:section", element: suspensePage(StudyGuideViewerPage) },
    { path: "/audio/spi", element: suspensePage(SpiAudioPage) },
    { path: "/:specialty/flashcards", element: suspensePage(SpecialtyFlashcardsPage) },
    { path: "/:specialty/flashcards/:deck", element: suspensePage(SpecialtyFlashcardsPage) },
    { path: "/:specialty/practice-questions", element: suspensePage(SpecialtyPracticePage) },
    { path: "/:specialty/practice-questions/:deck", element: suspensePage(SpecialtyPracticePage) },
  ],
};
