import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ROUTINE: { id: string; label: string }[] = [
  { id: "wake", label: "astayqidh (I wake up)" },
  { id: "eat", label: "aakul (I eat)" },
  { id: "school", label: "adhhab ilaa al-madrasa (I go to school)" },
  { id: "study", label: "adrus (I study)" },
  { id: "sleep", label: "anaam (I sleep)" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'I wake up' is written as ", after: ".", answer: "astayqidh" },
  { before: "In Arabic, 'I eat' is written as ", after: ".", answer: "aakul" },
  { before: "In Arabic, 'I study' is written as ", after: ".", answer: "adrus" },
  { before: "In Arabic, 'I sleep' is written as ", after: ".", answer: "anaam" },
];

const CLOCK_ITEMS: { hour: number; minute: 0 | 15 | 30 | 45; text: string }[] = [
  { hour: 1, minute: 0, text: "as-saa'a al-waahida" },
  { hour: 6, minute: 0, text: "as-saa'a as-saadisa" },
  { hour: 3, minute: 30, text: "as-saa'a ath-thaalitha wa an-nusf" },
  { hour: 9, minute: 15, text: "as-saa'a at-taasi'a wa ar-rubu'" },
  { hour: 4, minute: 45, text: "as-saa'a al-khaamisa illa rubu'" },
  { hour: 7, minute: 30, text: "as-saa'a as-saabi'a wa an-nusf" },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "astayqidh", meaning: "I wake up" },
  { term: "aakul", meaning: "I eat" },
  { term: "adhhab ilaa al-madrasa", meaning: "I go to school" },
  { term: "adrus", meaning: "I study" },
  { term: "anaam", meaning: "I sleep" },
  { term: "mubakkiran", meaning: "early" },
  { term: "fi al-waqt", meaning: "on time" },
];

export const timeWriting: Skill = {
  id: "g8-ar-w-time",
  code: "W.4",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing about daily routine and time",
  description: "Practise romanized Arabic daily-routine vocabulary and time phrases: read a clock, fill in verbs, order a routine, and match words to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["clock", "fill", "order", "match"] as const);

    if (branch === "clock") {
      const correct = randChoice(rng, CLOCK_ITEMS);
      const otherTexts = CLOCK_ITEMS.filter((c) => c.text !== correct.text).map((c) => c.text);
      const distractors = shuffle(rng, otherTexts).slice(0, 3);
      const choices = shuffle(rng, [correct.text, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: "Which sentence correctly describes the time shown on the clock?",
        visual: { type: "clock", hour: correct.hour, minute: correct.minute },
        choices,
        correctIndex: choices.indexOf(correct.text),
        layout: "list",
        hint: "Read the hour hand first, then check whether the minutes are 0, 15 (wa ar-rubu'), 30 (wa an-nusf), or 45 (illa rubu').",
        explanation: `The clock shows ${correct.hour}:${String(correct.minute).padStart(2, "0")}, which in Arabic is "${correct.text}."`,
      };
    }

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

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each romanized Arabic routine word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'mubakkiran' (early) and 'fi al-waqt' (on time) describe when you do something, not what you do.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing Arabic word to complete the sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the daily routine verbs you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
