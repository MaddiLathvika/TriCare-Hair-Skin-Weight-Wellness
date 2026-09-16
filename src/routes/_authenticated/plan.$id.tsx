import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { CONCERNS, type ConcernKind } from "@/lib/concerns";
import type { CarePlan } from "@/lib/tricare.functions";
import { PlanView } from "@/components/PlanView";

export const Route = createFileRoute("/_authenticated/plan/$id")({
  head: () => ({
    meta: [
      { title: "Your care plan — TriCare" },
      { name: "description", content: "Your saved TriCare plan: routine, nutrition notes, habits and progress check." },
      { property: "og:title", content: "Your care plan — TriCare" },
      { property: "og:description", content: "Routine, nutrition, habits and a progress check-in date." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { id } = useParams({ from: "/_authenticated/plan/$id" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const { data: row, error: err } = await supabase
        .from("assessments")
        .select("id, concern, created_at, image_path, answers, plan")
        .eq("id", id)
        .single();
      if (err) throw err;

      let photoUrl: string | null = null;
      if (row.image_path) {
        const { data: signed } = await supabase.storage
          .from("concern-photos")
          .createSignedUrl(row.image_path, 60 * 60);
        photoUrl = signed?.signedUrl ?? null;
      }
      return { row, photoUrl };
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading your plan…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">This plan could not be found.</p>;

  const { row, photoUrl } = data;
  const concern = row.concern as ConcernKind;
  const plan = row.plan as unknown as CarePlan | null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/dashboard" className="label-mono text-muted-foreground hover:text-foreground">
        ← Dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono text-muted-foreground">{CONCERNS[concern].title}</p>
          <h1 className="mt-2 text-2xl font-bold">Your care plan</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Created{" "}
            {new Date(row.created_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`The ${CONCERNS[concern].title.toLowerCase()} concern area photo used for this plan`}
            className="h-24 w-24 rounded-md border border-border object-cover"
          />
        ) : null}
      </div>

      <div className="mt-8">
        {plan ? <PlanView plan={plan} /> : <p className="text-sm text-muted-foreground">No plan was saved.</p>}
      </div>
    </div>
  );
}
