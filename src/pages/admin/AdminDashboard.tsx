import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  BookOpen,
  CreditCard,
  Home,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { fetchAdminDashboardStats } from "@/features/admin/adminApi";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type StatCard = {
  label: string;
  value: string;
  hint: string;
  Icon: LucideIcon;
};

function StatTile({ stat }: { stat: StatCard }) {
  const { Icon, label, value, hint } = stat;
  return (
    <article className="rounded-2xl border border-border-light bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-deep">
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-ink-muted">{label}</p>
      </div>
      <p className="mt-4 font-heading text-3xl font-bold text-ink-heading">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </article>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const displayName = user?.name ?? user?.email ?? "Admin";
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchAdminDashboardStats,
  });

  const STATS: StatCard[] = [
    { label: "Total students", value: String(stats?.totalStudents ?? 0), hint: "Active members", Icon: Users },
    { label: "Study materials", value: String(stats?.studyMaterials ?? 0), hint: "Across 4 specialties", Icon: BookOpen },
    { label: "Active subscriptions", value: String(stats?.activeSubscriptions ?? 0), hint: "Paid plans", Icon: CreditCard },
    { label: "Practice attempts", value: String(stats?.practiceAttempts ?? 0), hint: "Last 30 days", Icon: Activity },
  ];

  return (
    <div className="min-h-dvh bg-surface-soft">
      <div className={cn(container, "py-10 sm:py-14")}>
        <div className="mx-auto max-w-6xl">
          <header className="rounded-2xl border border-border-light bg-card p-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-ink-heading px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Admin Dashboard
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink-heading sm:text-4xl">
                  Welcome, {displayName}
                </h1>
                <p className="mt-2 max-w-xl text-base leading-7 text-ink-muted">
                  Manage students, study materials, subscriptions, and content for the
                  Sonographer Pal platform.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-10 gap-2 rounded-lg border-border-gray px-4"
                >
                  <Link to="/">
                    <Home className="size-4" aria-hidden />
                    Home
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2 rounded-lg border-border-gray px-4 text-destructive"
                  onClick={() => {
                    void logout();
                  }}
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <StatTile key={stat.label} stat={stat} />
            ))}
          </section>

          <section className="mt-8 rounded-2xl border border-border-light bg-card p-7 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-ink-heading">
              Quick actions
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Admin modules will appear here as they come online.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Manage students", to: "/admin/users" },
                { label: "Manage materials", to: "/admin/materials" },
                { label: "Subscriptions", to: "/admin/subscriptions" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="rounded-xl border border-border-light bg-surface-soft px-4 py-3 text-sm font-medium text-ink-heading transition-colors hover:border-brand/40 hover:bg-brand-soft"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </section>

          {user?.email ? (
            <p className="mt-8 text-sm text-ink-muted">
              Signed in as <span className="font-medium text-ink">{user.email}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
