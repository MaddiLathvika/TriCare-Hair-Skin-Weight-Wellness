import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { CONCERNS, type ConcernKind } from "@/lib/concerns";
import { analyzeConcern } from "@/lib/tricare.functions";
import { fileToCompressedDataUrl, dataUrlToBlob } from "@/lib/image";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/assess/$concern")({
  head: () => ({
    meta: [
      { title: "New check-up — TriCare" },
      { name: "description", content: "Answer a short intake and add a photo of the concern area to get your plan." },
      { property: "og:title", content: "New check-up — TriCare" },
      { property: "og:description", content: "Build a fresh skin, hair or weight care plan." },
    ],
  }),
  component: Assess,
});

type AnswerValue = string | number | string[];

function Assess() {
  const { concern } = useParams({ from: "/_authenticated/assess/$concern" });
  const kind = (["skin", "hair", "weight"].includes(concern) ? concern : "skin") as ConcernKind;
  const config = CONCERNS[kind];
  const navigate = useNavigate();
  const { user } = useAuth();
  const analyze = useServerFn(analyzeConcern);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set(id: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggle(id: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      return {
        ...prev,
        [id]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option],
      };
    });
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await fileToCompressedDataUrl(file));
    } catch {
      toast.error("That image could not be read. Try a JPG or PNG.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (kind !== "weight" && !photo) {
      toast.error(`Please add a ${config.photoLabel.toLowerCase()} so the analysis has something to look at.`);
      return;
    }
    setBusy(true);
    try {
      const plan = await analyze({ data: { concern: kind, answers, imageDataUrl: photo } });

      let imagePath: string | null = null;
      if (photo) {
        const path = `${user.id}/${kind}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("concern-photos")
          .upload(path, dataUrlToBlob(photo), { contentType: "image/jpeg" });
        if (!upErr) imagePath = path;
      }

      const { data, error } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          concern: kind,
          answers: answers as never,
          image_path: imagePath,
          plan: plan as never,
        })
        .select("id")
        .single();
      if (error) throw error;

      navigate({ to: "/plan/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not build your plan. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/dashboard" className="label-mono text-muted-foreground hover:text-foreground">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{config.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{config.tagline}</p>

      <form onSubmit={submit} className="mt-8 space-y-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="label-mono text-muted-foreground">Intake</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {config.questions.map((q) => (
              <div key={q.id} className={q.type === "multi" ? "sm:col-span-2 space-y-2" : "space-y-2"}>
                <Label htmlFor={q.id}>{q.label}</Label>
                {q.type === "text" || q.type === "number" ? (
                  <Input
                    id={q.id}
                    type={q.type === "number" ? "number" : "text"}
                    placeholder={q.placeholder}
                    value={(answers[q.id] as string | number | undefined) ?? ""}
                    onChange={(e) => set(q.id, q.type === "number" ? Number(e.target.value) : e.target.value)}
                  />
                ) : q.type === "select" ? (
                  <Select value={(answers[q.id] as string) ?? ""} onValueChange={(v) => set(q.id, v)}>
                    <SelectTrigger id={q.id}>
                      <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                      {q.options.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => toggle(q.id, o)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            selected
                              ? "border-brand bg-brand text-brand-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-accent/50"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="label-mono text-muted-foreground">{config.photoLabel}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{config.photoHint}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Input type="file" accept="image/*" onChange={onPhoto} className="max-w-xs" />
            {photo ? (
              <img
                src={photo}
                alt="Preview of the concern area you uploaded"
                className="h-20 w-20 rounded-md border border-border object-cover"
              />
            ) : null}
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Analysing…" : "Build my plan"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Your photo is stored privately to your account and used only to generate this plan.
        </p>
      </form>
    </div>
  );
}
