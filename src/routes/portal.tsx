import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Agent Desk — track policies, targets and rankings" },
      {
        name: "description",
        content:
          "A clean agent portal: log every policy you write, watch your monthly target fill up, and see where you stand on the leaderboard.",
      },
      { property: "og:title", content: "Agent Desk — track policies, targets and rankings" },
      {
        property: "og:description",
        content: "Log policies, track monthly targets and compare your standing with other agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalLanding,
});

const features = [
  {
    title: "Policy register",
    body: "Record policy number, client, plan, sum assured, premium and commission — every entry stays private to you.",
  },
  {
    title: "Monthly targets",
    body: "Set a policy count and premium goal for the month and watch the progress bars fill as you log business.",
  },
  {
    title: "Leaderboard",
    body: "See how your issued policies and premium stack up against other agents. Client details are never shared.",
  },
  {
    title: "Agent profile",
    body: "Keep your agency code, branch, division and club tier in one place so your standing is always labelled right.",
  },
];

function PortalLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand font-display text-sm font-bold text-brand-foreground">
              AD
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Agent Desk</span>
          </span>
          <Link to="/auth">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <section className="grid-lines rounded-xl border border-border p-8 sm:p-12">
          <p className="label-mono text-muted-foreground">Performance portal for agents</p>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Every policy you write, every target you chase — in one clean desk.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Built as a rebuild of the classic agent performance portal: faster, clearer numbers, honest rankings, and no
            clutter. Your policy register is yours alone — only totals appear on the leaderboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button>Create your agent account</Button>
            </Link>
            <Link to="/desk">
              <Button variant="outline">Go to my desk</Button>
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <article key={f.title} className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground">
          <p>Agent Desk is an independent tool and is not affiliated with any insurer.</p>
          <Link to="/" className="underline hover:text-foreground">
            TriCare
          </Link>
        </div>
      </footer>
    </div>
  );
}
