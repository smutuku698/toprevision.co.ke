import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GOOD = [
  "Researching the organization before the interview",
  "Making eye contact and offering a firm handshake",
  "Dressing neatly and appropriately for the occasion",
  "Listening carefully to the full question before answering",
  "Preparing a few thoughtful questions to ask the interviewer",
  "Speaking clearly and at a steady pace",
];

const POOR = [
  "Arriving late without any explanation",
  "Interrupting the interviewer while they are speaking",
  "Answering a phone call during the interview",
  "Giving only one-word answers with no explanation",
  "Speaking negatively about a previous employer or teacher",
  "Looking at the floor or ceiling instead of the interviewer",
];

export const interviewEtiquette: Skill = {
  id: "eng-ls-interview-etiquette",
  code: "LS.4",
  subjectId: "english",
  strandId: "eng-listening-speaking",
  grade: 9,
  title: "Job interview and public speaking etiquette",
  description: "Sort behaviors into good and poor practice for a job interview or an impromptu speech.",
  generate(rng) {
    const hint = "Good practice shows preparation and respect for the listener; poor practice shows carelessness or disrespect.";

    if (rng() < 0.5) {
      const pool = [
        ...GOOD.map((label) => ({ label, category: "Good Practice" })),
        ...POOR.map((label) => ({ label, category: "Poor Practice" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Good Practice", "Poor Practice"]);

      return {
        kind: "multiple-choice",
        prompt: `Is this good practice or poor practice for a job interview or speech: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" is ${target.category.toLowerCase()}.`,
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
      prompt: "Sort each behavior into Good Practice or Poor Practice.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "good", label: "Good Practice" },
        { id: "poor", label: "Poor Practice" },
      ],
      correctBucket,
      hint: "Good practice shows preparation and respect for the listener; poor practice shows carelessness or disrespect.",
      explanation: `Good practice: ${good.join(" / ")}. Poor practice: ${poor.join(" / ")}.`,
    };
  },
};
