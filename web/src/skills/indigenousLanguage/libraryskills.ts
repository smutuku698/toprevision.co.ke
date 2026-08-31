import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GOOD = [
  "Checking the catalogue before searching the shelves",
  "Reading silently so as not to disturb others",
  "Returning books by their due date",
  "Keeping a reading log of books finished",
  "Reshelving a book in its correct place after browsing",
  "Handling books carefully to avoid tearing pages",
];

const POOR = [
  "Talking loudly on the phone inside the library",
  "Tearing out pages you want to keep",
  "Leaving borrowed books scattered on the desk",
  "Never returning books after borrowing them",
  "Writing notes directly inside a shared library book",
  "Eating greasy food over an open book",
];

export const libraryskills: Skill = {
  id: "il-r-library-skills",
  code: "R.3",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "Serving the community: library skills",
  description: "Sort good and poor library practices to support extensive reading.",
  generate(rng) {
    const hint = "Good library practice protects shared resources and keeps the library usable for everyone.";

    if (rng() < 0.5) {
      const pool = [
        ...GOOD.map((label) => ({ label, category: "Good library practice" })),
        ...POOR.map((label) => ({ label, category: "Poor library practice" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Good library practice", "Poor library practice"]);

      return {
        kind: "multiple-choice",
        prompt: `Is this a good or poor library practice: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" is a ${target.category.toLowerCase()}.`,
      };
    }

    const good = shuffle(rng, GOOD).slice(0, 3);
    const poor = shuffle(rng, POOR).slice(0, 3);
    const items = shuffle(rng, [
      ...good.map((label) => ({ id: label, label, bucket: "good" })),
      ...poor.map((label) => ({ id: label, label, bucket: "poor" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each practice into Good library practice or Poor library practice.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "good", label: "Good library practice" },
        { id: "poor", label: "Poor library practice" },
      ],
      correctBucket,
      hint,
      explanation: `Good: ${good.join(" / ")}. Poor: ${poor.join(" / ")}.`,
    };
  },
};
