import { createFileRoute, Link } from "@tanstack/react-router";

import { CONCERN_LIST } from "@/lib/concerns";
import { TriCareMark } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TriCare — Skin, Hair & Weight Care Plans" },
      {
        name: "description",
        content:
          "Answer a short intake, add a photo of the concern area, and TriCare builds a practical skin, hair or weight care plan you can track over time.",
      },
      { property: "og:title", content: "TriCare — Skin, Hair & Weight Care Plans" },
      {
        property: "og:description",
        content: "Three concerns, one care assistant: skin, hair and weight guidance built from your own inputs.",
      },
    ],
  }),
  component: Landing,
});

const accent: Record<string, string> = {
  skin: "bg-skin",
  hair: "bg-hair",
  weight: "bg-weight",
};

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <TriCareMark />
          <Link to="/auth">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-lines opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-20">
          <p className="label-mono text-muted-foreground">Skin · Hair · Weight</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            One care assistant for the three things you keep googling at 2am.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Fill in a short intake, add a photo of the concern area — a scalp part, a patch of skin — and TriCare turns
            it into a specific routine, nutrition notes and habits to fix. Every plan is saved so you can compare
            progress later.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg">Create your account</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                I already have one
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="label-mono text-muted-foreground">Three tracks</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {CONCERN_LIST.map((c) => (
            <article key={c.kind} className="rounded-lg border border-border bg-card p-5">
              <span className={`block h-1 w-10 rounded-full ${accent[c.kind]}`} />
              <h2 className="mt-4 text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.tagline}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-3">
          {[
            { n: "01", t: "Tell it the basics", d: "Age, sleep, water, stress and a few questions specific to your concern." },
            { n: "02", t: "Add the concern photo", d: "Only the affected area — scalp, skin patch or an optional progress photo." },
            { n: "03", t: "Get your plan", d: "A routine, food notes, habits to drop and a date to check progress." },
          ].map((s) => (
            <div key={s.n}>
              <p className="label-mono text-brand">{s.n}</p>
              <h3 className="mt-2 text-base font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-5xl px-4 py-8 text-xs text-muted-foreground">
          TriCare gives general self-care guidance only — it is not a medical diagnosis. Photos stay private to your
          account.
        </p>
      </footer>
    </div>
  );
}
