import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ROUTINE: { id: string; label: string }[] = [
  { id: "wake", label: "astayqidhu (I wake up)" },
  { id: "eat", label: "aakulu al-fatoor (I eat breakfast)" },
  { id: "school", label: "adhhabu ilaa al-madrasa (I go to school)" },
  { id: "study", label: "adrusu (I study)" },
  { id: "sleep", label: "anaamu (I sleep)" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "", after: " as-saa'ata as-saabi'a.", answer: "Astayqidhu", gloss: "I wake up at seven o'clock." },
  { before: "Aakulu al-fatoor thumma ", after: " ilaa al-madrasa.", answer: "adhhabu", gloss: "I eat breakfast then go to school." },
  { before: "Ba'da al-madrasa, ", after: " fee al-masaa'.", answer: "adrusu", gloss: "After school, I study in the evening." },
  { before: "Aakulu al-'asha' thumma ", after: " mubakkiran.", answer: "anaamu", gloss: "I eat dinner then sleep early." },
];

export const timeWriting: Skill = {
  id: "ar-w-time",
  code: "W.4",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing a daily routine",
  description: "Fill in missing routine verbs and arrange the stages of a daily routine in order (romanized).",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order"] as const);

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the daily routine activities in the correct order, from morning to night.",
        instruction: "Click the activities in order, from first to last.",
        items: shuffle(rng, ROUTINE),
        correctOrder: ROUTINE.map((r) => r.id),
        hint: "Think about what happens first thing in the morning, and what happens last at night.",
        explanation: `The correct order is: ${ROUTINE.map((r) => r.label).join(" → ")}.`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing romanized verb to complete the Arabic sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the routine verbs you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
