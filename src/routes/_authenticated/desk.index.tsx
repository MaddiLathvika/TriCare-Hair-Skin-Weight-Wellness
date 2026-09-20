import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeskShell, StatCard, money, monthKey } from "@/components/DeskNav";

export const Route = createFileRoute("/_authenticated/desk/")({
  head: () => ({
    meta: [
      { title: "Overview — Agent Desk" },
      { name: "description", content: "Your month at a glance: policies logged, premium collected and target progress." },
      { property: "og:title", content: "Overview — Agent Desk" },
      { property: "og:description", content: "Policies logged, premium collected and target progress this month." },
    ],
  }),
  component: DeskOverview,
});

type PolicyRow = {
  id: string;
  policy_no: string;
  client_name: string;
  premium: number;
  commission: number;
  issued_on: string;
  status: "proposal" | "issued" | "lapsed";
};

function Bar({ value, goal }: { value: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{goal > 0 ? `${pct}% of goal` : "No goal set yet"}</p>
    </div>
  );
}

function DeskOverview() {
  const month = monthKey();

  const { data, isLoading } = useQuery({
    queryKey: ["desk-overview", month],
    queryFn: async () => {
      const [policies, target] = await Promise.all([
        supabase
          .from("policies")
          .select("id, policy_no, client_name, premium, commission, issued_on, status")
          .order("issued_on", { ascending: false }),
        supabase.from("targets").select("policy_goal, premium_goal").eq("period_month", month).maybeSingle(),
      ]);
      if (policies.error) throw policies.error;
      if (target.error) throw target.error;
      return {
        policies: (policies.data ?? []) as unknown as PolicyRow[],
        target: target.data as { policy_goal: number; premium_goal: number } | null,
      };
    },
  });

  const all = data?.policies ?? [];
  const thisMonth = all.filter((p) => p.issued_on.startsWith(month.slice(0, 7)) && p.status === "issued");
  const premiumMonth = thisMonth.reduce((s, p) => s + Number(p.premium), 0);
  const commissionMonth = thisMonth.reduce((s, p) => s + Number(p.commission), 0);
  const issuedAll = all.filter((p) => p.status === "issued");

  return (
    <DeskShell
      title="Your month so far"
      subtitle="Numbers update the moment you log a policy. Only you can see this page."
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your numbers…</p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Policies this month" value={String(thisMonth.length)} />
            <StatCard label="Premium this month" value={money(premiumMonth)} />
            <StatCard label="Commission this month" value={money(commissionMonth)} />
            <StatCard
              label="Issued all-time"
              value={String(issuedAll.length)}
              hint={money(issuedAll.reduce((s, p) => s + Number(p.premium), 0))}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="label-mono text-muted-foreground">Policy target</p>
              <p className="mt-2 text-sm font-semibold">
                {thisMonth.length} / {data?.target?.policy_goal ?? 0} policies
              </p>
              <Bar value={thisMonth.length} goal={data?.target?.policy_goal ?? 0} />
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="label-mono text-muted-foreground">Premium target</p>
              <p className="mt-2 text-sm font-semibold">
                {money(premiumMonth)} / {money(Number(data?.target?.premium_goal ?? 0))}
              </p>
              <Bar value={premiumMonth} goal={Number(data?.target?.premium_goal ?? 0)} />
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold">Latest policies</h2>
              <Link to="/desk/policies">
                <Button size="sm" variant="outline">
                  Manage policies
                </Button>
              </Link>
            </div>
            {all.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing logged yet. Add your first policy from the Policies tab and this page fills up.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {all.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center gap-4 px-5 py-4">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.client_name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        #{p.policy_no} · {new Date(p.issued_on).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="text-sm font-medium">{money(Number(p.premium))}</span>
                    <Badge variant={p.status === "issued" ? "secondary" : "outline"}>{p.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </DeskShell>
  );
}
