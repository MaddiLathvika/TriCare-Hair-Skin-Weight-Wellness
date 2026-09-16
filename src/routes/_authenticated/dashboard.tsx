import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { CONCERN_LIST, CONCERNS, type ConcernKind } from "@/lib/concerns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your TriCare dashboard" },
      { name: "description", content: "Start a new skin, hair or weight check-up and review your saved care plans." },
      { property: "og:title", content: "Your TriCare dashboard" },
      { property: "og:description", content: "Start a check-up or review your saved TriCare plans." },
    ],
  }),
  component: Dashboard,
});

const accent: Record<ConcernKind, string> = {
  skin: "bg-skin",
  hair: "bg-hair",
  weight: "bg-weight",
};

type Row = {
  id: string;
  concern: ConcernKind;
  created_at: string;
  plan: { headline?: string; severity?: string } | null;
};

function Dashboard() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, concern, created_at, plan")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  return (
    <div className="space-y-10">
      <section>
        <p className="label-mono text-muted-foreground">Start a check-up</p>
        <h1 className="mt-2 text-2xl font-bold">What would you like to work on?</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {CONCERN_LIST.map((c) => (
            <article key={c.kind} className="flex flex-col rounded-lg border border-border bg-card p-5">
              <span className={`block h-1 w-10 rounded-full ${accent[c.kind]}`} />
              <h2 className="mt-4 text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.tagline}</p>
              <Link to="/assess/$concern" params={{ concern: c.kind }} className="mt-5">
                <Button className="w-full" size="sm">
                  Start
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <p className="label-mono text-muted-foreground">Your history</p>
        <h2 className="mt-2 text-xl font-bold">Saved plans</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading your plans…</p>
        ) : !history?.length ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No check-ups yet. Start one above and it will be saved here so you can compare progress later.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {history.map((row) => (
              <li key={row.id}>
                <Link
                  to="/plan/$id"
                  params={{ id: row.id }}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                >
                  <span className={`h-8 w-1 shrink-0 rounded-full ${accent[row.concern]}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {row.plan?.headline ?? CONCERNS[row.concern].title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {CONCERNS[row.concern].title} ·{" "}
                      {new Date(row.created_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  {row.plan?.severity ? <Badge variant="secondary">{row.plan.severity}</Badge> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
