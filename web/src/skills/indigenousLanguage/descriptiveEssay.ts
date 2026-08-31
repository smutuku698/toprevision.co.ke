import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STRUCTURE: { id: string; label: string }[] = [
  { id: "intro", label: "Introduction — introduces the place or scene being described" },
  { id: "body", label: "Body — describes details using the five senses" },
  { id: "conclusion", label: "Conclusion — sums up the overall impression of the place" },
];

const ADJECTIVE_SENTENCES: { before: string; adjective: string; after: string; distractors: string[] }[] = [
  { before: "The", adjective: "crowded", after: "bus terminal buzzed with noise every morning.", distractors: ["crowd", "crowding", "crowds"] },
  { before: "A", adjective: "narrow", after: "footpath wound between the market stalls.", distractors: ["narrowly", "narrowness", "narrowed"] },
  { before: "The vendor's stall was covered by a", adjective: "colorful", after: "cloth awning.", distractors: ["color", "colorfully", "colored"] },
  { before: "Warning signs hung above the", adjective: "slippery", after: "steps near the entrance.", distractors: ["slip", "slipping", "slippage"] },
];

export const descriptiveEssay: Skill = {
  id: "il-w-descriptive-essay",
  code: "W.4",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "Safety in public places: descriptive essay structure and adjectives",
  description: "Arrange the parts of a descriptive essay in order and identify the adjective in a sentence describing a public place.",
  generate(rng) {
    if (rng() < 0.5) {
      const hint = "A descriptive essay begins by introducing the place, uses the body to describe sensory details, and ends by summing up the overall feeling.";

      if (rng() < 0.5) {
        const ordinals = ["first", "second", "third and last"];
        const index = Math.floor(rng() * STRUCTURE.length);
        const target = STRUCTURE[index];
        const choices = shuffle(rng, STRUCTURE.map((s) => s.label));

        return {
          kind: "multiple-choice",
          prompt: `Which part of a descriptive essay comes ${ordinals[index]}?`,
          choices,
          correctIndex: choices.indexOf(target.label),
          layout: "list",
          hint,
          explanation: `The correct order is: ${STRUCTURE.map((s) => s.label).join(" → ")}.`,
        };
      }

      return {
        kind: "ordering",
        prompt: "Arrange the parts of a descriptive essay in the correct order.",
        instruction: "Click the parts in the order they should appear, from first to last.",
        items: shuffle(rng, STRUCTURE),
        correctOrder: STRUCTURE.map((s) => s.id),
        hint,
        explanation: `The correct order is: ${STRUCTURE.map((s) => s.label).join(" → ")}.`,
      };
    }

    const entry = randChoice(rng, ADJECTIVE_SENTENCES);
    const choices = shuffle(rng, [entry.adjective, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Which word is the adjective in this sentence? "${entry.before} ___ ${entry.after}"`,
      choices,
      correctIndex: choices.indexOf(entry.adjective),
      layout: "row",
      hint: "An adjective describes a noun — ask what kind of place, thing, or person it is.",
      explanation: `"${entry.adjective}" is the adjective — it describes the noun that follows it: "${entry.before} ${entry.adjective} ${entry.after}"`,
    };
  },
};
