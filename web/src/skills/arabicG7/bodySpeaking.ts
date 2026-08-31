import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.7 Imitative Speaking — identifying and using words that describe people and
// things, via observing pictures and talking about a friend or family member.

const LINES = [
  "Nadia: Look at this picture — who is that?",
  "Karim: That's my ukht. Hiya tawila wa nasheeta.",
  "Nadia: What about her fam and udhun?",
  "Karim: Fam-ha kabeer wa udhun-ha sagheera.",
  "Nadia: She sounds bikhayr and happy in this photo!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who is in the picture Karim describes?",
    correct: "His ukht (sister)",
    distractors: ["His akh (brother)", "His umm (mother)", "A friend, not family"],
    explanation: "Karim says, \"That's my ukht\" — my sister.",
  },
  {
    q: "How does Karim describe his sister at first?",
    correct: "tawila (tall) and nasheeta (energetic)",
    distractors: ["qaseera (short) and muta'aba (tired)", "mareeda (sick)", "He gives no description"],
    explanation: "Karim says, \"Hiya tawila wa nasheeta\" — she is tall and energetic.",
  },
  {
    q: "How does Karim describe his sister's fam (mouth)?",
    correct: "kabeer (big)",
    distractors: ["sagheer (small)", "He does not describe her mouth", "It is described as sick"],
    explanation: "Karim says, \"Fam-ha kabeer wa udhun-ha sagheera\" — her mouth is big and her ear is small.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "ra's", meaning: "head" },
  { phrase: "yad", meaning: "hand" },
  { phrase: "fam", meaning: "mouth" },
  { phrase: "udhun", meaning: "ear" },
  { phrase: "tawil", meaning: "tall" },
  { phrase: "qaseer", meaning: "short" },
  { phrase: "nasheet", meaning: "energetic" },
  { phrase: "kabeer", meaning: "big" },
  { phrase: "sagheer", meaning: "small" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Karim: Hiya tawila wa ", after: ".", correct: "nasheeta" },
  { before: "Karim: Fam-ha kabeer wa udhun-ha ", after: ".", correct: "sagheera" },
  { before: "The Arabic word for \"tall\" is ", after: ".", correct: "tawil" },
  { before: "The Arabic word for \"mouth\" is ", after: ".", correct: "fam" },
  { before: "Nadia: She sounds ", after: " and happy!", correct: "bikhayr" },
];

const CATEGORY_ITEMS: { label: string; bucket: "Body part" | "Descriptor" }[] = [
  { label: "ra's (head)", bucket: "Body part" },
  { label: "fam (mouth)", bucket: "Body part" },
  { label: "udhun (ear)", bucket: "Body part" },
  { label: "tawil (tall)", bucket: "Descriptor" },
  { label: "nasheet (energetic)", bucket: "Descriptor" },
  { label: "kabeer (big)", bucket: "Descriptor" },
];

export const bodySpeaking: Skill = {
  id: "g7-ar-ls-body",
  code: "LS.7",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Imitative speaking: describing people (my body)",
  description: "Listen to a spoken description of a person's appearance from a picture, and practise using descriptive words aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each word as a Body part or a Descriptor (a describing word).",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Body part", label: "Body part" },
          { id: "Descriptor", label: "Descriptor" },
        ],
        correctBucket,
        hint: "A body part names something on your body; a descriptor describes how it looks.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is a ${s.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        speakable: true,
        prompt: "Match each spoken word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        speakable: true,
        prompt: "Put these lines from the spoken conversation in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Nadia asks who's in the picture, then Karim describes her build, then facial features, then Nadia comments.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        speakable: true,
        prompt: "Fill in the missing word.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.correct === "nasheeta" ? ["nasheet"] : undefined,
        inputMode: "text",
        hint: "Reread the matching line in the conversation above.",
        explanation: `The missing word is "${f.correct}".`,
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
      hint: "Imagine hearing each line spoken aloud, one at a time.",
      explanation: q.explanation,
    };
  },
};
