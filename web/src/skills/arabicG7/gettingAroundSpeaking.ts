import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.9 Phonological Awareness: Pronunciation — identifying locality-place vocabulary
// and pronouncing it accurately. The source names these example places explicitly: market,
// school, hospital, mosques.

const LINES = [
  "Reporter: Ayna al-madrasa min hunaa?",
  "Guide: Al-madrasa qareeba min as-suuq.",
  "Reporter: Wa al-mustashfa?",
  "Guide: Al-mustashfa ba'eeda shway'an, bijaanib al-masjid.",
  "Reporter: Shukran! Sa'adhhab ilaa al-masjid awwalan.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "According to the guide, where is the madrasa (school)?",
    correct: "Qareeba min as-suuq (near the market)",
    distractors: ["Bijaanib al-masjid (next to the mosque)", "Ba'eeda jiddan (very far away)", "The guide does not know"],
    explanation: "The guide says, \"Al-madrasa qareeba min as-suuq\" — the school is near the market.",
  },
  {
    q: "Where is the mustashfa (hospital) located?",
    correct: "Ba'eeda shway'an, bijaanib al-masjid (a bit far, next to the mosque)",
    distractors: ["Very close, right next to the school", "In the middle of the market", "The location is not given"],
    explanation: "The guide says, \"Al-mustashfa ba'eeda shway'an, bijaanib al-masjid\" — the hospital is a bit far, next to the mosque.",
  },
  {
    q: "Where does the reporter say they will go first?",
    correct: "al-masjid (the mosque)",
    distractors: ["al-madrasa (the school)", "as-suuq (the market)", "al-mustashfa (the hospital)"],
    explanation: "The reporter says, \"Sa'adhhab ilaa al-masjid awwalan\" — I will go to the mosque first.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "madrasa", meaning: "school" },
  { phrase: "suuq", meaning: "market" },
  { phrase: "mustashfa", meaning: "hospital" },
  { phrase: "masjid", meaning: "mosque" },
  { phrase: "qareeb", meaning: "near" },
  { phrase: "ba'eed", meaning: "far" },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Guide: Al-madrasa ", after: " min as-suuq.", correct: "qareeba" },
  { before: "Guide: Al-mustashfa ", after: " shway'an, bijaanib al-masjid.", correct: "ba'eeda" },
  { before: "The Arabic word for \"near\" is ", after: ".", correct: "qareeb" },
  { before: "The Arabic word for \"far\" is ", after: ".", correct: "ba'eed" },
];

export const gettingAroundSpeaking: Skill = {
  id: "g7-ar-ls-getting-around",
  code: "LS.9",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Phonological awareness: getting around the locality",
  description: "Listen to a spoken conversation locating places in the neighbourhood, and practise pronouncing place vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const placeItems: { word: string; bucket: "Place" | "Distance word" }[] = [
        { word: "madrasa (school)", bucket: "Place" },
        { word: "suuq (market)", bucket: "Place" },
        { word: "mustashfa (hospital)", bucket: "Place" },
        { word: "masjid (mosque)", bucket: "Place" },
        { word: "qareeb (near)", bucket: "Distance word" },
        { word: "ba'eed (far)", bucket: "Distance word" },
      ];
      const items = placeItems.map((p, i) => ({ id: `w${i}`, label: p.word, bucket: p.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each word as a Place or a Distance word.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Place", label: "Place" },
          { id: "Distance word", label: "Distance word" },
        ],
        correctBucket,
        hint: "A place names a location; a distance word says how far it is.",
        explanation: placeItems.map((p) => `"${p.word}" is a ${p.bucket.toLowerCase()}.`).join(" "),
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
        prompt: "Match each spoken place or distance word to its English meaning.",
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
        hint: "The reporter asks about the school first, then the hospital, then states where they'll go.",
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
