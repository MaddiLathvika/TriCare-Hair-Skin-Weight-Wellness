export type ConcernKind = "skin" | "hair" | "weight";

export type Question =
  | { id: string; label: string; type: "text"; placeholder?: string }
  | { id: string; label: string; type: "number"; placeholder?: string; unit?: string }
  | { id: string; label: string; type: "select"; options: string[] }
  | { id: string; label: string; type: "multi"; options: string[] };

export type ConcernConfig = {
  kind: ConcernKind;
  title: string;
  tagline: string;
  photoLabel: string;
  photoHint: string;
  questions: Question[];
};

const shared: Question[] = [
  { id: "age", label: "Age", type: "number", placeholder: "22" },
  { id: "sex", label: "Sex", type: "select", options: ["Female", "Male", "Prefer not to say"] },
  { id: "sleep_hours", label: "Average sleep per night (hours)", type: "number", placeholder: "7" },
  {
    id: "water",
    label: "Water intake per day",
    type: "select",
    options: ["Less than 1 L", "1–2 L", "2–3 L", "More than 3 L"],
  },
  { id: "stress", label: "Stress level", type: "select", options: ["Low", "Moderate", "High"] },
];

export const CONCERNS: Record<ConcernKind, ConcernConfig> = {
  skin: {
    kind: "skin",
    title: "Skin care",
    tagline: "Acne, texture, dullness, pigmentation, dryness or oiliness.",
    photoLabel: "Photo of the skin area",
    photoHint:
      "A clear, well-lit close-up of the affected area only — a cheek, forehead, arm patch. No full-face or personal photos needed.",
    questions: [
      ...shared,
      {
        id: "skin_type",
        label: "Your skin feels mostly",
        type: "select",
        options: ["Dry", "Oily", "Combination", "Normal", "Not sure"],
      },
      {
        id: "main_issue",
        label: "Main concern",
        type: "select",
        options: ["Acne / breakouts", "Dark spots", "Dullness", "Dryness / flaking", "Excess oil", "Sensitivity"],
      },
      { id: "duration", label: "How long has this been going on?", type: "text", placeholder: "e.g. 3 months" },
      {
        id: "current_routine",
        label: "What do you currently use?",
        type: "text",
        placeholder: "e.g. face wash and moisturiser at night",
      },
      {
        id: "triggers",
        label: "Anything that makes it worse?",
        type: "multi",
        options: ["Sun exposure", "Sweat", "Certain foods", "Stress", "Makeup", "Not sure"],
      },
    ],
  },
  hair: {
    kind: "hair",
    title: "Hair & scalp care",
    tagline: "Hair fall, thinning, dandruff, itchiness or breakage.",
    photoLabel: "Photo of the scalp or hair area",
    photoHint:
      "Part your hair and take a close-up of the scalp or the thinning area under good light. Only the concern area — nothing personal.",
    questions: [
      ...shared,
      {
        id: "main_issue",
        label: "Main concern",
        type: "select",
        options: ["Hair fall", "Thinning / patches", "Dandruff", "Itchy scalp", "Dryness / frizz", "Breakage"],
      },
      {
        id: "hair_type",
        label: "Hair type",
        type: "select",
        options: ["Straight", "Wavy", "Curly", "Coily"],
      },
      {
        id: "wash_frequency",
        label: "How often do you wash your hair?",
        type: "select",
        options: ["Daily", "Every 2–3 days", "Weekly", "Less than weekly"],
      },
      { id: "duration", label: "How long has this been going on?", type: "text", placeholder: "e.g. 6 months" },
      {
        id: "habits",
        label: "Anything that applies to you?",
        type: "multi",
        options: ["Heat styling", "Colouring / bleaching", "Tight hairstyles", "Family history of hair loss", "Recent illness", "Low-protein diet"],
      },
    ],
  },
  weight: {
    kind: "weight",
    title: "Weight care",
    tagline: "A realistic plan to lose or gain weight, built around your routine.",
    photoLabel: "Optional progress photo",
    photoHint:
      "Optional. A neutral, fully-clothed standing photo helps track progress over time. You can skip this entirely.",
    questions: [
      ...shared,
      { id: "goal", label: "Goal", type: "select", options: ["Lose weight", "Gain weight", "Maintain & recompose"] },
      { id: "height_cm", label: "Height (cm)", type: "number", placeholder: "170" },
      { id: "weight_kg", label: "Current weight (kg)", type: "number", placeholder: "65" },
      { id: "target_weight_kg", label: "Target weight (kg)", type: "number", placeholder: "60" },
      {
        id: "activity",
        label: "Activity level",
        type: "select",
        options: ["Mostly sitting", "Lightly active", "Active 3–4 days a week", "Very active"],
      },
      {
        id: "diet",
        label: "Diet",
        type: "select",
        options: ["Vegetarian", "Vegan", "Eggetarian", "Non-vegetarian", "Mixed"],
      },
      {
        id: "constraints",
        label: "Anything to work around?",
        type: "multi",
        options: ["No gym access", "Limited time to cook", "Hostel / mess food", "Knee or back pain", "Night shifts", "Budget conscious"],
      },
    ],
  },
};

export const CONCERN_LIST = [CONCERNS.skin, CONCERNS.hair, CONCERNS.weight];
