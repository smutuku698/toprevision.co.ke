import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each teaching from Luqman's advice to his son with what it says.",
  "Pair each teaching from Luqman's advice with what it says.",
  "Connect each teaching below to what it says.",
  "Match each teaching to its correct detail.",
  "Link each teaching from Luqman's advice to what it teaches.",
  "Choose the correct detail for each teaching from Luqman's advice.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each teaching from Luqman's advice as mainly about faith/worship or mainly about character/conduct.",
  "Group each teaching under faith/worship, or character/conduct.",
  "Decide whether each teaching is mainly about faith or about character, and sort it there.",
  "Sort each teaching into the correct category: faith/worship, or character/conduct.",
  "Place each teaching into the right bucket — faith/worship, or character/conduct.",
  "Categorise each teaching as mainly about faith/worship or character/conduct.",
];

const ORDER_PROMPTS = [
  "Arrange Luqman's pieces of advice to his son in the order they appear in Surah Luqman (12-19).",
  "Put Luqman's advice to his son into the order it appears in Surah Luqman (12-19).",
  "Sequence Luqman's pieces of advice correctly, as they appear in the surah.",
  "Order these pieces of Luqman's advice as they appear in Surah Luqman.",
  "Sort these pieces of Luqman's advice into the order they appear.",
  "Arrange these teachings from Luqman's advice in the order they appear in the surah.",
];

const FILL_PROMPTS = [
  "Fill in the missing word from Luqman's advice.",
  "Which word completes Luqman's advice?",
  "Complete Luqman's advice with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete Luqman's advice correctly.",
  "Which word belongs in the blank?",
];

const TEACHINGS: { teaching: string; detail: string }[] = [
  { teaching: "Gratitude to Allah", detail: "Luqman began his advice by reminding his son to be grateful to Allah, the source of all blessings" },
  { teaching: "Warning against shirk", detail: "Luqman told his son that associating partners with Allah (shirk) is a tremendous wrong" },
  { teaching: "Kindness to parents", detail: "Luqman instructed his son to treat his parents well, even while holding fast to true belief" },
  { teaching: "Accountability for deeds", detail: "Luqman taught that Allah will bring forth even a deed the weight of a mustard seed on the Day of Judgement" },
  { teaching: "Establishing prayer and enjoining good", detail: "Luqman told his son to establish prayer, enjoin what is right, and forbid what is wrong" },
  { teaching: "Patience", detail: "Luqman taught his son to be patient over whatever difficulty befalls him" },
  { teaching: "Humility", detail: "Luqman warned his son not to turn his cheek from people in scorn or walk through the earth arrogantly" },
  { teaching: "Moderation in speech", detail: "Luqman told his son to lower his voice, saying the harshest of voices is the braying of a donkey" },
];

const SORT_ITEMS = [
  { text: "Be grateful to Allah for His blessings", bucket: "faith" },
  { text: "Do not associate partners with Allah (shirk)", bucket: "faith" },
  { text: "Establish (perform) the prayer regularly", bucket: "faith" },
  { text: "Be kind and dutiful to your parents", bucket: "character" },
  { text: "Be patient whatever difficulty befalls you", bucket: "character" },
  { text: "Do not walk through the earth arrogantly", bucket: "character" },
  { text: "Lower your voice when speaking to others", bucket: "character" },
] as const;
const SORT_LABEL: Record<string, string> = { faith: "A teaching about faith and worship", character: "A teaching about character and conduct" };

const ORDER_STEPS = [
  { id: "gratitude", label: "Be grateful to Allah" },
  { id: "shirk", label: "Do not associate partners with Allah — a tremendous wrong" },
  { id: "parents", label: "Be kind and dutiful to your parents" },
  { id: "accountability", label: "Know that even the smallest deed will be brought forth by Allah" },
  { id: "prayer-good", label: "Establish prayer, enjoin good, forbid evil, and be patient" },
  { id: "humility", label: "Do not turn your cheek from people in scorn or walk arrogantly" },
  { id: "voice", label: "Lower and moderate your voice when you speak" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "In Surah Luqman (12-19), what does Luqman tell his son about shirk?",
    correct: "That associating partners with Allah is a tremendous wrong",
    distractors: ["That it is a minor mistake with no consequences", "That it is only wrong for adults", "That it is acceptable if done privately"],
  },
  {
    q: "What comparison does Luqman use to describe a harsh, loud voice?",
    correct: "The braying of a donkey",
    distractors: ["The roar of a lion", "The buzzing of a bee", "The bark of a dog"],
  },
  {
    q: "According to Luqman's advice, how small a deed will Allah still bring forth and account for?",
    correct: "Even one the weight of a mustard seed",
    distractors: ["Only deeds done in public", "Only deeds done after the age of 40", "Only deeds involving money"],
  },
  {
    q: "What does Luqman teach his son about walking and interacting with people?",
    correct: "Not to walk arrogantly or turn his cheek away from people in scorn",
    distractors: ["To always walk quickly and avoid speaking to anyone", "To only greet wealthy people", "To avoid walking in public places"],
  },
];

export const selectedVersesLuqman: Skill = {
  id: "g8-ire-qu-selected-verses-luqman",
  code: "QU.3",
  subjectId: "ire",
  strandId: "g8-ire-qu",
  grade: 8,
  title: "Selected Verses: Al-Luqman 12-19",
  description: "Luqman's advice to his son on gratitude, shirk, kindness to parents, prayer, patience, humility, and moderation in speech.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TEACHINGS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.teaching, label: t.teaching })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.teaching, label: t.detail })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.teaching] = t.teaching;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Luqman's advice covers both belief in Allah and good character.",
        explanation: chosen.map((t) => `${t.teaching} — ${t.detail.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SORT_ITEMS).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: SORT_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Some teachings are about belief in and worship of Allah; others are about how to treat and behave around people.",
        explanation: chosen.map((c) => `"${c.text}" — ${SORT_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Luqman starts with gratitude and belief, moves to kindness to parents and accountability, then to prayer, patience, humility, and finally moderation in speech.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "Luqman told his son that the harshest of voices is the braying of a",
        after: ".",
        correctAnswer: "donkey",
        inputMode: "text",
        hint: "Luqman used this animal's loud call as an example of an unpleasant voice.",
        explanation: "Luqman advised his son to lower his voice, saying the harshest of voices is the braying of a donkey.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Luqman's advice to his son (verses 12-19) blends belief in Allah with guidance on good character.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
