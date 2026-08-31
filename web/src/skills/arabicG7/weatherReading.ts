import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Today's forecast: it will be haar in the afternoon.",
  "Wear a qamees khafeef and drink plenty of maa'.",
  "Tomorrow, expect matar in the morning.",
  "Carry a mizalla and wear a mi'taf to stay dry.",
  "By the weekend it will turn baarid with strong riyah.",
  "Wear a kanza soofiyya if you go near the jabal.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What should you wear because it will be haar (hot) this afternoon?",
    correct: "A qamees khafeef (light shirt)",
    distractors: ["A kanza soofiyya (sweater)", "A mi'taf (coat)", "Nothing special is suggested"],
    explanation: "The forecast says, \"Wear a qamees khafeef and drink plenty of maa'\" for the hot afternoon.",
  },
  {
    q: "What two items does the forecast say to carry for tomorrow's matar (rain)?",
    correct: "A mizalla (umbrella) and a mi'taf (coat)",
    distractors: ["A qubba'a (hat) and maa' (water)", "A kanza soofiyya (sweater) only", "Nothing — you should stay indoors"],
    explanation: "The forecast says, \"Carry a mizalla and wear a mi'taf to stay dry.\"",
  },
  {
    q: "What weather is expected by the weekend?",
    correct: "baarid (cold) with strong riyah (wind)",
    distractors: ["haar (hot) and dry", "matar (rain) only", "No change from today"],
    explanation: "The forecast says, \"By the weekend it will turn baarid with strong riyah.\"",
  },
  {
    q: "Why does the forecast recommend a kanza soofiyya near the jabal (mountain)?",
    correct: "Because it will be cold and windy",
    distractors: ["Because it will be very hot there", "Because of rain only", "No reason is given"],
    explanation: "The kanza soofiyya (sweater) is recommended right after mentioning the cold, windy weekend weather near the mountain.",
  },
];

// Restricted to words that actually appear in PASSAGE above — the click-match prompt below
// claims "from the forecast," so every entry here must be verifiably present in it.
const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "matar", meaning: "rain" },
  { phrase: "haar", meaning: "hot" },
  { phrase: "baarid", meaning: "cold" },
  { phrase: "riyah", meaning: "wind" },
  { phrase: "jabal", meaning: "mountain" },
];

const CLOTHING_GROUPS: { word: string; bucket: "Hot weather" | "Cold/wet weather" }[] = [
  { word: "qamees khafeef (light shirt)", bucket: "Hot weather" },
  { word: "qubba'a (hat)", bucket: "Hot weather" },
  { word: "kanza soofiyya (sweater)", bucket: "Cold/wet weather" },
  { word: "mi'taf (coat)", bucket: "Cold/wet weather" },
  { word: "mizalla (umbrella)", bucket: "Cold/wet weather" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "Today's forecast: it will be ", after: " in the afternoon.", correct: "haar" },
  { before: "The Arabic word for \"umbrella\" is ", after: ".", correct: "mizalla" },
  { before: "By the weekend it will turn baarid with strong ", after: ".", correct: "riyah" },
  { before: "The Arabic word for \"sweater\" is ", after: ".", correct: "kanza soofiyya" },
  { before: "The Arabic word for \"rain\" is ", after: ".", correct: "matar" },
];

export const weatherReading: Skill = {
  id: "g7-ar-r-weather",
  code: "R.8",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading for comprehension: weather and environment",
  description: "Read a short Arabic weather forecast, identify which clothing suits each season, and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = CLOTHING_GROUPS.map((c, i) => ({ id: `w${i}`, label: c.word, bucket: c.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each clothing item by the weather it suits.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Hot weather", label: "Hot weather" },
          { id: "Cold/wet weather", label: "Cold or wet weather" },
        ],
        correctBucket,
        hint: "Light, breathable clothing suits hot weather; warm or waterproof items suit cold or rainy weather.",
        explanation: CLOTHING_GROUPS.map((c) => `"${c.word}" suits ${c.bucket.toLowerCase()}.`).join(" "),
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
        passage: PASSAGE,
        prompt: "Match each weather word from the forecast to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each word is used in the forecast above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the forecast in the order they were given.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The forecast moves from today, to tomorrow, to the weekend.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the forecast.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Reread the matching line in the forecast above.",
        explanation: `The missing word is "${f.correct}".`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what the forecast says for each day.",
      explanation: q.explanation,
    };
  },
};
