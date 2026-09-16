import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function TriCareMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground font-display text-sm font-bold">
        3
      </span>
      <span className="font-display text-lg font-bold tracking-tight">TriCare</span>
    </span>
  );
}

export function AppShell({ children, email }: { children: ReactNode; email?: string | null }) {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard">
            <TriCareMark />
          </Link>
          <div className="flex items-center gap-3">
            {email ? <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span> : null}
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="border-t border-border">
        <p className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted-foreground">
          TriCare gives general self-care guidance only. It is not a medical diagnosis — see a qualified doctor for
          anything persistent, painful or worsening.
        </p>
      </footer>
    </div>
  );
}
