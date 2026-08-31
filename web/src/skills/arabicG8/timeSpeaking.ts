import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Amina: Let me tell you about my day, from morning to night.",
  "Amina: I astayqidh mubakkiran, as-saa'a as-saadisa.",
  "Amina: Then I aakul quickly.",
  "Amina: I adhhab ilaa al-madrasa fi al-waqt.",
  "Amina: After school, I adrus for one hour.",
  "Amina: At night, I anaam mubakkiran.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to Amina describe her day. What time does she say she astayqidh?",
    correct: "as-saa'a as-saadisa (six o'clock)",
    distractors: ["as-saa'a al-waahida (one o'clock)", "as-saa'a ath-thaalitha wa an-nusf (half past three)", "She does not say"],
    explanation: "Amina says, \"I astayqidh mubakkiran, as-saa'a as-saadisa\" — six o'clock.",
  },
  {
    q: "What does Amina say right after waking up?",
    correct: "She eats (aakul) quickly",
    distractors: ["She studies (adrus)", "She sleeps (anaam)", "She goes straight to school without eating"],
    explanation: "Amina says, \"Then I aakul quickly.\"",
  },
  {
    q: "How does Amina say she gets to school?",
    correct: "fi al-waqt (on time)",
    distractors: ["Late every day", "Mubakkiran, long before it opens", "She does not say"],
    explanation: "Amina says, \"I adhhab ilaa al-madrasa fi al-waqt\" — on time.",
  },
  {
    q: "How long does Amina say she adrus after school?",
    correct: "For one hour",
    distractors: ["For two hours", "Until night", "She does not adrus after school"],
    explanation: "Amina says, \"After school, I adrus for one hour.\"",
  },
];

const CLOCK_ITEMS: { hour: number; minute: 0 | 15 | 30 | 45; text: string }[] = [
  { hour: 1, minute: 0, text: "as-saa'a al-waahida" },
  { hour: 6, minute: 0, text: "as-saa'a as-saadisa" },
  { hour: 3, minute: 30, text: "as-saa'a ath-thaalitha wa an-nusf" },
  { hour: 9, minute: 15, text: "as-saa'a at-taasi'a wa ar-rubu'" },
  { hour: 4, minute: 45, text: "as-saa'a al-khaamisa illa rubu'" },
  { hour: 7, minute: 30, text: "as-saa'a as-saabi'a wa an-nusf" },
];

const CATEGORY_ITEMS: { label: string; bucket: "Routine verb" | "Time phrase" }[] = [
  { label: "astayqidh", bucket: "Routine verb" },
  { label: "adrus", bucket: "Routine verb" },
  { label: "mubakkiran", bucket: "Time phrase" },
  { label: "fi al-waqt", bucket: "Time phrase" },
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

export const timeSpeaking: Skill = {
  id: "g8-ar-ls-time",
  code: "LS.4",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: daily routine and time",
  description: "Listen to Amina describe her daily routine aloud, answer comprehension questions, say the time shown on a clock, and practise routine vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["dialogue", "clock", "categorize", "click-match", "ordering"] as const);

    if (branch === "clock") {
      const correct = randChoice(rng, CLOCK_ITEMS);
      const otherTexts = CLOCK_ITEMS.filter((c) => c.text !== correct.text).map((c) => c.text);
      const distractors = shuffle(rng, otherTexts).slice(0, 3);
      const choices = shuffle(rng, [correct.text, ...distractors]);

      return {
        kind: "multiple-choice",
        speakable: true,
        prompt: "Look at the clock. Which sentence says this time aloud correctly?",
        visual: { type: "clock", hour: correct.hour, minute: correct.minute },
        choices,
        correctIndex: choices.indexOf(correct.text),
        layout: "list",
        hint: "Read the hour hand first, then check whether the minutes are 0, 15 (wa ar-rubu'), 30 (wa an-nusf), or 45 (illa rubu').",
        explanation: `The clock shows ${correct.hour}:${String(correct.minute).padStart(2, "0")}, which you would say aloud as "${correct.text}."`,
      };
    }

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        speakable: true,
        prompt: "Sort each word as a Routine verb (an action) or a Time phrase (when it happens).",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Routine verb", label: "Routine verb" },
          { id: "Time phrase", label: "Time phrase" },
        ],
        correctBucket,
        hint: "A routine verb names an action; a time phrase describes when it happens.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is a ${s.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        speakable: true,
        prompt: "Match each spoken routine word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        speakable: true,
        prompt: "Put these lines from Amina's spoken description of her day in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Amina wakes up, eats, goes to school, studies after school, then sleeps at night.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      speakable: true,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Listen for the times and activities Amina mentions in each line.",
      explanation: q.explanation,
    };
  },
};
