import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const EFFECTIVE = [
  "Projecting the voice so everyone in the room can hear",
  "Making eye contact with different parts of the audience",
  "Organizing the talk with a clear beginning, middle, and end",
  "Pausing to let an important point sink in",
  "Preparing and practicing the talk beforehand",
  "Adjusting pace and tone to keep the audience interested",
];

const INEFFECTIVE = [
  "Speaking too quietly to be heard at the back",
  "Staring only at notes and never at the audience",
  "Jumping between ideas with no clear order",
  "Speaking so fast that key points are lost",
  "Showing up unprepared and improvising the whole talk",
  "Using the exact same flat tone for every sentence",
];

export const presentationQualities: Skill = {
  id: "il-ls-presentation-qualities",
  code: "LS.9",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "Kenyan cultures: qualities of an effective presenter",
  description: "Sort presentation habits into effective and ineffective qualities for a public presentation.",
  generate(rng) {
    const hint = "An effective presenter can be heard clearly, keeps eye contact, and organizes ideas so the audience can follow along.";

    if (rng() < 0.5) {
      const pool = [
        ...EFFECTIVE.map((label) => ({ label, category: "Effective presenter" })),
        ...INEFFECTIVE.map((label) => ({ label, category: "Ineffective presenter" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Effective presenter", "Ineffective presenter"]);

      return {
        kind: "multiple-choice",
        prompt: `Is this a quality of an effective or ineffective presenter: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" is a quality of an ${target.category.toLowerCase()}.`,
      };
    }

    const effective = shuffle(rng, EFFECTIVE).slice(0, 3);
    const ineffective = shuffle(rng, INEFFECTIVE).slice(0, 3);
    const items = shuffle(rng, [
      ...effective.map((label) => ({ id: label, label, bucket: "effective" })),
      ...ineffective.map((label) => ({ id: label, label, bucket: "ineffective" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each habit into Effective presenter or Ineffective presenter.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "effective", label: "Effective presenter" },
        { id: "ineffective", label: "Ineffective presenter" },
      ],
      correctBucket,
      hint,
      explanation: `Effective: ${effective.join(" / ")}. Ineffective: ${ineffective.join(" / ")}.`,
    };
  },
};
