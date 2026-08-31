import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_CATEGORY_PROMPTS = [
  (label: string) => `Is this "${label}" — a healthy use of leisure or a misuse of leisure?`,
  (label: string) => `Decide: is "${label}" a healthy use of leisure, or a misuse of it?`,
  (label: string) => `Which category fits "${label}" — healthy use, or misuse of leisure?`,
  (label: string) => `Read this activity — "${label}" — and choose the category it belongs to.`,
  (label: string) => `Does "${label}" describe a healthy use of leisure, or a misuse of it?`,
  (label: string) => `Classify this way of spending free time: "${label}".`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each way of spending free time into 'Healthy use of leisure' or 'Misuse of leisure'.",
  "Group these activities under healthy use of leisure or misuse of leisure.",
  "Decide which category each activity below belongs to, and sort it there.",
  "Sort each activity into the bucket it best fits.",
  "Place each way of spending free time into the correct category.",
  "Read each activity and sort it under healthy use or misuse of leisure.",
];

const HEALTHY = [
  { label: "Playing sports or games with friends", reason: "Sport is a healthy way to spend leisure time and stay fit." },
  { label: "Reading books or developing a hobby or talent", reason: "Developing a hobby or talent is a productive use of leisure time." },
  { label: "Spending time in worship, prayer, or church fellowship", reason: "Worship and fellowship are valuable, God-honouring uses of free time." },
  { label: "Resting and spending time with family", reason: "Rest and family time are a healthy, balanced use of leisure." },
];

const MISUSE = [
  { label: "Drinking alcohol or using drugs to pass free time", reason: "Alcohol and drug abuse is a serious misuse of leisure time with lasting harm." },
  { label: "Spending all free time idle, with no productive activity", reason: "Idleness is a common way youths misuse leisure today." },
  { label: "Joining peers in criminal or risky activities out of boredom", reason: "Turning to crime out of boredom is a harmful misuse of leisure time." },
  { label: "Using free time to pressure others into substance abuse", reason: "Encouraging others into substance abuse is a serious misuse of leisure time." },
];

export const leisure: Skill = {
  id: "cre-cl-leisure",
  code: "CL.3",
  subjectId: "cre",
  strandId: "cre-living",
  grade: 9,
  title: "Leisure: healthy use vs. misuse",
  description: "Sort each way of spending free time into a healthy use of leisure or a misuse of leisure.",
  generate(rng) {
    const hint = "Healthy leisure builds you up — rest, hobbies, sport, and fellowship. Misused leisure, like alcohol, drugs, or idleness, causes harm.";

    if (rng() < 0.5) {
      const pool = [
        ...HEALTHY.map((s) => ({ ...s, category: "Healthy use of leisure" })),
        ...MISUSE.map((s) => ({ ...s, category: "Misuse of leisure" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Healthy use of leisure", "Misuse of leisure"]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_CATEGORY_PROMPTS)(target.label),
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: target.reason,
      };
    }

    const healthy = shuffle(rng, HEALTHY).slice(0, 3);
    const misuse = shuffle(rng, MISUSE).slice(0, 3);
    const items = shuffle(rng, [
      ...healthy.map((s) => ({ id: s.label, label: s.label, bucket: "healthy", reason: s.reason })),
      ...misuse.map((s) => ({ id: s.label, label: s.label, bucket: "misuse", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "healthy", label: "Healthy use of leisure" },
        { id: "misuse", label: "Misuse of leisure" },
      ],
      correctBucket,
      hint: "Healthy leisure builds you up — rest, hobbies, sport, and fellowship. Misused leisure, like alcohol, drugs, or idleness, causes harm.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
