import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ENHANCE_UNDERMINE_MC_PROMPTS = (label: string) => [
  `Does this "${label}" enhance or undermine the unity of Muslims?`,
  `"${label}" — does this enhance or undermine the unity of Muslims?`,
  `Is "${label}" a factor that enhances or undermines Muslim unity?`,
  `Classify "${label}" as either enhancing or undermining the unity of Muslims.`,
  `Decide whether "${label}" enhances or undermines the unity of Muslims.`,
  `Does "${label}" strengthen or weaken the unity of Muslims?`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement into 'Enhances unity of Muslims' or 'Undermines unity of Muslims'.",
  "Group each statement under 'Enhances unity of Muslims' or 'Undermines unity of Muslims'.",
  "Decide whether each statement enhances or undermines the unity of Muslims, and sort it there.",
  "Sort each statement into the correct category: enhances unity, or undermines it.",
  "Place each statement into the right bucket — enhances unity, or undermines it.",
  "Categorise each statement as either enhancing or undermining the unity of Muslims.",
];

const ENHANCE = [
  { label: "Praying together in congregation", reason: "Shared worship builds a strong sense of unity among Muslims." },
  { label: "Following common Islamic teachings and values", reason: "Shared values are a foundation that enhances the unity of Muslims." },
  { label: "Celebrating community events like Eid together", reason: "Shared celebrations strengthen bonds within the Muslim community." },
];

const UNDERMINE = [
  { label: "Sectarian or tribal divisions", reason: "Divisions along sect or tribal lines undermine the unity of Muslims." },
  { label: "Spreading misinformation and rumours", reason: "Misinformation breeds mistrust that undermines unity." },
  { label: "Lack of communication between different communities", reason: "Poor communication between communities weakens unity." },
];

export const unityOfMuslims: Skill = {
  id: "ire-ih-unity-of-muslims",
  code: "IH.2",
  subjectId: "ire",
  strandId: "ire-heritage",
  grade: 9,
  title: "Unity of Muslims",
  description: "Sort each statement into a factor that enhances unity or a challenge that undermines it.",
  generate(rng) {
    const hint = "Shared worship, values, and celebrations bring Muslims together, while division, rumours, and poor communication pull them apart.";

    if (rng() < 0.4) {
      const pool = [
        ...ENHANCE.map((s) => ({ ...s, category: "Enhances unity of Muslims" })),
        ...UNDERMINE.map((s) => ({ ...s, category: "Undermines unity of Muslims" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Enhances unity of Muslims", "Undermines unity of Muslims"]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, ENHANCE_UNDERMINE_MC_PROMPTS(target.label)),
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: target.reason,
      };
    }

    const enhance = shuffle(rng, ENHANCE).slice(0, 2);
    const undermine = shuffle(rng, UNDERMINE).slice(0, 2);
    const items = shuffle(rng, [
      ...enhance.map((s) => ({ id: s.label, label: s.label, bucket: "enhance", reason: s.reason })),
      ...undermine.map((s) => ({ id: s.label, label: s.label, bucket: "undermine", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "enhance", label: "Enhances unity of Muslims" },
        { id: "undermine", label: "Undermines unity of Muslims" },
      ],
      correctBucket,
      hint: "Shared worship, values, and celebrations bring Muslims together, while division, rumours, and poor communication pull them apart.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
