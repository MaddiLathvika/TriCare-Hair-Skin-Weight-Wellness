import type { CarePlan } from "@/lib/tricare.functions";
import { Badge } from "@/components/ui/badge";

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h3 className="label-mono text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PlanView({ plan }: { plan: CarePlan }) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Severity: {plan.severity}</Badge>
          <Badge variant="outline">Confidence: {plan.confidence}</Badge>
        </div>
        <h2 className="mt-4 text-xl font-semibold">{plan.headline}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.observation}</p>
      </section>

      {plan.routine?.length ? (
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="label-mono text-muted-foreground">Your routine</h3>
          <ol className="mt-4 space-y-4">
            {plan.routine.map((r, i) => (
              <li key={i} className="border-l-2 border-brand pl-4">
                <p className="label-mono text-brand">{r.step}</p>
                <p className="mt-1 text-sm font-semibold">{r.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <List title="Food & nutrition" items={plan.nutrition} />
        <List title="Habits to build" items={plan.habits} />
        <List title="What to avoid" items={plan.avoid} />
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="label-mono text-muted-foreground">Check progress</h3>
          <p className="mt-3 text-sm">{plan.progress_check}</p>
        </section>
      </div>

      <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="label-mono text-destructive">When to see a professional</h3>
        <p className="mt-3 text-sm">{plan.see_a_professional}</p>
      </section>
    </div>
  );
}
