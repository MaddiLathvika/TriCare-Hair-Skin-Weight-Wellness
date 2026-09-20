import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const items = [
  { to: "/desk", label: "Overview" },
  { to: "/desk/policies", label: "Policies" },
  { to: "/desk/targets", label: "Targets" },
  { to: "/desk/leaderboard", label: "Leaderboard" },
  { to: "/desk/profile", label: "Profile" },
] as const;

export function DeskShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="space-y-8">
      <nav className="-mx-1 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/desk" }}
            activeProps={{ className: "bg-brand text-brand-foreground" }}
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <header>
        <p className="label-mono text-muted-foreground">Agent desk</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>

      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="label-mono text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}
