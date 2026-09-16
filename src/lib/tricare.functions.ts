import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnalyzeInput = z.object({
  concern: z.enum(["skin", "hair", "weight"]),
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
  imageDataUrl: z.string().nullable().optional(),
});

export type CarePlan = {
  headline: string;
  observation: string;
  severity: "mild" | "moderate" | "needs attention";
  confidence: "low" | "medium" | "high";
  routine: { step: string; title: string; detail: string }[];
  nutrition: string[];
  habits: string[];
  avoid: string[];
  progress_check: string;
  see_a_professional: string;
};

const CONCERN_BRIEF: Record<string, string> = {
  skin: "facial or body skin health: texture, acne, pigmentation, dryness, oiliness, sensitivity.",
  hair: "hair and scalp health: shedding, thinning, dandruff, scalp condition, breakage.",
  weight: "body composition goals: weight loss or weight gain, nutrition, activity and sustainable habits.",
};

export const analyzeConcern = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project yet.");

    const system = [
      "You are TriCare, a careful evidence-informed care assistant for",
      CONCERN_BRIEF[data.concern],
      "You produce practical, low-risk, self-care guidance based on the intake answers and, when present, the photo of the concern area (for example a scalp close-up or a patch of skin).",
      "Never diagnose a disease and never name prescription medication. Be specific and actionable, use everyday language, and stay honest about uncertainty.",
      "If the photo is unusable or absent, say so in the observation and lower the confidence.",
      "Recommend seeing a qualified doctor or dermatologist whenever signs could be medical.",
    ].join(" ");

    const userContent: Array<Record<string, unknown>> = [
      {
        type: "text",
        text:
          `Concern: ${data.concern}\n\nIntake answers (JSON):\n${JSON.stringify(data.answers, null, 2)}` +
          (data.imageDataUrl ? "\n\nA photo of the concern area is attached." : "\n\nNo photo was provided."),
      },
    ];
    if (data.imageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: data.imageDataUrl } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "care_plan",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "headline",
                "observation",
                "severity",
                "confidence",
                "routine",
                "nutrition",
                "habits",
                "avoid",
                "progress_check",
                "see_a_professional",
              ],
              properties: {
                headline: { type: "string" },
                observation: { type: "string" },
                severity: { type: "string", enum: ["mild", "moderate", "needs attention"] },
                confidence: { type: "string", enum: ["low", "medium", "high"] },
                routine: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["step", "title", "detail"],
                    properties: {
                      step: { type: "string" },
                      title: { type: "string" },
                      detail: { type: "string" },
                    },
                  },
                },
                nutrition: { type: "array", items: { type: "string" } },
                habits: { type: "array", items: { type: "string" } },
                avoid: { type: "array", items: { type: "string" } },
                progress_check: { type: "string" },
                see_a_professional: { type: "string" },
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("The AI is busy right now. Please try again in a moment.");
      if (res.status === 402)
        throw new Error("The AI credits for this app have run out. Please add credits to continue.");
      throw new Error(`Analysis failed (${res.status}). ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("The AI returned an empty result. Please try again.");

    let plan: CarePlan;
    try {
      plan = JSON.parse(content) as CarePlan;
    } catch {
      throw new Error("The AI returned an unreadable result. Please try again.");
    }
    return plan;
  });
