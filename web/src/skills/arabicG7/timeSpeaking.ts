import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.4 Listening for Gist — picking out key ideas from a spoken presentation and
// acknowledging important dates and holidays. The source explicitly names "Eid, Holidays."

const LINES = [
  "Presenter: Marhaban! Today I will talk about important dates.",
  "Presenter: Eid huwa a'zam 'eed fi as-sana.",
  "Presenter: Nastayqidh mubakkiran wa nadhhab ilaa al-masjid fi al-waqt.",
  "Presenter: Ba'da Eid, tabda' al-'utla — ayaam bidoon madrasa!",
  "Presenter: Shukran li istima'ikum!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to the presentation. What is its main topic?",
    correct: "Important dates, especially Eid and holidays",
    distractors: ["The weather forecast", "How to cook a meal", "A football match"],
    explanation: "The presenter opens by saying they will talk about important dates, then focuses on Eid.",
  },
  {
    q: "According to the presenter, what is Eid?",
    correct: "A'zam 'eed fi as-sana (the greatest festival of the year)",
    distractors: ["A normal school day", "A type of food", "A weather season"],
    explanation: "The presenter says, \"Eid huwa a'zam 'eed fi as-sana\" — Eid is the greatest festival of the year.",
  },
  {
    q: "What happens right before going to the masjid, according to the presenter?",
    correct: "Waking up early (nastayqidh mubakkiran)",
    distractors: ["Eating a big meal", "Going to the market", "Nothing is mentioned"],
    explanation: "The presenter says, \"Nastayqidh mubakkiran wa nadhhab ilaa al-masjid fi al-waqt\" — we wake up early and go to the mosque on time.",
  },
  {
    q: "What begins right after Eid, according to the presenter?",
    correct: "al-'utla (the holiday) — days without school",
    distractors: ["A new school term", "A market festival", "Nothing changes"],
    explanation: "The presenter says, \"Ba'da Eid, tabda' al-'utla — ayaam bidoon madrasa!\" — after Eid, the holiday begins, days without school.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Eid", meaning: "the major Islamic festival" },
  { phrase: "'utla", meaning: "holiday" },
  { phrase: "mubakkiran", meaning: "early" },
  { phrase: "fi al-waqt", meaning: "on time" },
  { phrase: "astayqidh", meaning: "I wake up" },
  { phrase: "madrasa", meaning: "school" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Presenter: Ba'da Eid, tabda' al-", after: " — ayaam bidoon madrasa!", correct: "'utla" },
  { before: "Presenter: Eid huwa a'zam 'eed fi ", after: ".", correct: "as-sana" },
  { before: "Presenter: Nastayqidh ", after: " wa nadhhab ilaa al-masjid fi al-waqt.", correct: "mubakkiran" },
  { before: "The Arabic word for \"on time\" is ", after: ".", correct: "fi al-waqt" },
  { before: "The major Islamic festival is called ", after: ".", correct: "Eid" },
];

const CATEGORY_ITEMS: { label: string; bucket: "About Eid" | "About daily routine" }[] = [
  { label: "Eid (the festival)", bucket: "About Eid" },
  { label: "'utla (holiday)", bucket: "About Eid" },
  { label: "a'zam 'eed fi as-sana (greatest festival)", bucket: "About Eid" },
  { label: "astayqidh (I wake up)", bucket: "About daily routine" },
  { label: "mubakkiran (early)", bucket: "About daily routine" },
  { label: "fi al-waqt (on time)", bucket: "About daily routine" },
];

export const timeSpeaking: Skill = {
  id: "g7-ar-ls-time",
  code: "LS.4",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Listening for gist: time, dates and holidays",
  description: "Listen to a spoken presentation about Eid and holidays, pick out the key ideas, and practise the related vocabulary aloud.",
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
        prompt: "Sort each word as being About Eid or About daily routine.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "About Eid", label: "About Eid" },
          { id: "About daily routine", label: "About daily routine" },
        ],
        correctBucket,
        hint: "One group names the festival itself; the other describes everyday timing habits.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is ${s.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Put these lines from the spoken presentation in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The presenter introduces the topic, explains Eid, describes the routine, then the holiday, then closes.",
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
        acceptedAnswers: f.correct === "'utla" ? ["utla"] : undefined,
        inputMode: "text",
        hint: "Reread the matching line in the presentation above.",
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
