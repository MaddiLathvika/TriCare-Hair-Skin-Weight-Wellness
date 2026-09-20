import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DeskShell, money } from "@/components/DeskNav";

export const Route = createFileRoute("/_authenticated/desk/policies")({
  head: () => ({
    meta: [
      { title: "Policy register — Agent Desk" },
      { name: "description", content: "Log and review every policy you have written, with premium and commission." },
      { property: "og:title", content: "Policy register — Agent Desk" },
      { property: "og:description", content: "Log and review every policy you have written." },
    ],
  }),
  component: PoliciesPage,
});

type PolicyRow = {
  id: string;
  policy_no: string;
  client_name: string;
  plan_name: string | null;
  sum_assured: number;
  premium: number;
  commission: number;
  issued_on: string;
  status: "proposal" | "issued" | "lapsed";
};

const empty = {
  policy_no: "",
  client_name: "",
  plan_name: "",
  sum_assured: "",
  premium: "",
  commission: "",
  issued_on: new Date().toISOString().slice(0, 10),
  status: "issued" as PolicyRow["status"],
};

function PoliciesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("id, policy_no, client_name, plan_name, sum_assured, premium, commission, issued_on, status")
        .order("issued_on", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PolicyRow[];
    },
  });

  const addPolicy = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Please sign in again.");
      const { error } = await supabase.from("policies").insert({
        user_id: auth.user.id,
        policy_no: form.policy_no.trim(),
        client_name: form.client_name.trim(),
        plan_name: form.plan_name.trim() || null,
        sum_assured: Number(form.sum_assured || 0),
        premium: Number(form.premium || 0),
        commission: Number(form.commission || 0),
        issued_on: form.issued_on,
        status: form.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Policy logged");
      setForm({ ...empty, issued_on: form.issued_on });
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("policies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Policy removed");
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statuses: PolicyRow["status"][] = ["proposal", "issued", "lapsed"];

  return (
    <DeskShell title="Policy register" subtitle="Client details stay private — the leaderboard only uses your totals.">
      <form
        className="rounded-lg border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.policy_no.trim() || !form.client_name.trim()) {
            toast.error("Policy number and client name are needed.");
            return;
          }
          addPolicy.mutate();
        }}
      >
        <p className="label-mono text-muted-foreground">Log a policy</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="policy_no">Policy number</Label>
            <Input
              id="policy_no"
              value={form.policy_no}
              onChange={(e) => setForm({ ...form, policy_no: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">Client name</Label>
            <Input
              id="client_name"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan_name">Plan</Label>
            <Input
              id="plan_name"
              value={form.plan_name}
              onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sum_assured">Sum assured</Label>
            <Input
              id="sum_assured"
              type="number"
              min="0"
              value={form.sum_assured}
              onChange={(e) => setForm({ ...form, sum_assured: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="premium">Premium</Label>
            <Input
              id="premium"
              type="number"
              min="0"
              value={form.premium}
              onChange={(e) => setForm({ ...form, premium: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission">Commission</Label>
            <Input
              id="commission"
              type="number"
              min="0"
              value={form.commission}
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issued_on">Date</Label>
            <Input
              id="issued_on"
              type="date"
              value={form.issued_on}
              onChange={(e) => setForm({ ...form, issued_on: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={form.status === s ? "default" : "outline"}
                  onClick={() => setForm({ ...form, status: s })}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Button type="submit" className="mt-5" disabled={addPolicy.isPending}>
          {addPolicy.isPending ? "Saving…" : "Add policy"}
        </Button>
      </form>

      <section>
        <h2 className="text-lg font-semibold">All policies</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : !rows?.length ? (
          <p className="mt-4 text-sm text-muted-foreground">Nothing here yet — add your first policy above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {p.client_name} <span className="text-muted-foreground">#{p.policy_no}</span>
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {p.plan_name ? `${p.plan_name} · ` : ""}
                    {new Date(p.issued_on).toLocaleDateString()} · sum assured {money(Number(p.sum_assured))}
                  </span>
                </span>
                <span className="text-sm font-medium">{money(Number(p.premium))}</span>
                <Badge variant={p.status === "issued" ? "secondary" : "outline"}>{p.status}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePolicy.mutate(p.id)}
                  disabled={removePolicy.isPending}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DeskShell>
  );
}
