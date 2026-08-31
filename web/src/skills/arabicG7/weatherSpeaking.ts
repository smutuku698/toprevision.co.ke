import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 1.8 Conversational Skills — identifying and using non-verbal cues for effective
// communication. The source names exactly 5 cue types: gestures, general appearance, tonal
// variation, movement, facial expressions. This sub-strand is genuinely about communication
// technique, not just weather vocabulary — both are built in here.

const NON_VERBAL_CUES: { term: string; meaning: string }[] = [
  { term: "gestures", meaning: "hand or arm movements that add meaning, like pointing or waving" },
  { term: "general appearance", meaning: "how a speaker looks overall — posture, dress, grooming" },
  { term: "tonal variation", meaning: "changes in the pitch or tone of the voice while speaking" },
  { term: "movement", meaning: "moving around the space while presenting, not staying frozen" },
  { term: "facial expressions", meaning: "changes in the face, like smiling or frowning, that show feeling" },
];

const LINES = [
  "Presenter: Today's weather report — al-jaww haar wa mushmis.",
  "Presenter: (smiling, pointing at the sky) Shams qawiyya jiddan!",
  "Presenter: Ghadan, tatawaqqa'u matar wa riyah.",
  "Presenter: (frowning, voice lower) Fa khudhu mizallatikum!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What weather does the presenter report for today?",
    correct: "haar (hot) and mushmis (sunny)",
    distractors: ["baarid (cold) and matar (rainy)", "riyah (windy) only", "The presenter does not mention today's weather"],
    explanation: "The presenter says, \"al-jaww haar wa mushmis\" — the weather is hot and sunny.",
  },
  {
    q: "Which non-verbal cue does the presenter use while saying 'Shams qawiyya jiddan!'?",
    correct: "Smiling and pointing at the sky (facial expression and gesture)",
    distractors: ["Frowning and lowering the voice", "Standing completely still and silent", "Reading from a written script only"],
    explanation: "The stage direction shows the presenter \"(smiling, pointing at the sky)\" — a facial expression plus a gesture.",
  },
  {
    q: "What weather does the presenter forecast for tomorrow (ghadan)?",
    correct: "matar (rain) and riyah (wind)",
    distractors: ["haar (hot) and mushmis (sunny)", "baarid (cold) only, no wind", "The same as today, no change"],
    explanation: "The presenter says, \"Ghadan, tatawaqqa'u matar wa riyah\" — tomorrow, expect rain and wind.",
  },
  {
    q: "Why does the presenter frown and lower their voice for the last line?",
    correct: "To show concern and warn viewers to prepare (non-verbal cues matching a serious warning)",
    distractors: ["Because the microphone is broken", "Because they are describing sunny weather", "Non-verbal cues do not matter here"],
    explanation: "Frowning and a lower tone are non-verbal cues that match the serious tone of a weather warning to bring umbrellas.",
  },
];

const FILL: { before: string; after: string; correct: string }[] = [
  { before: "Changes in the pitch or tone of the voice while speaking are called ", after: ".", correct: "tonal variation" },
  { before: "Hand or arm movements that add meaning, like pointing or waving, are called ", after: ".", correct: "gestures" },
  { before: "Changes in the face, like smiling or frowning, that show feeling are called ", after: ".", correct: "facial expressions" },
  { before: "The Arabic word for \"hot\" is ", after: ".", correct: "haar" },
  { before: "The Arabic word for \"wind\" is ", after: ".", correct: "riyah" },
];

const CUE_CATEGORY: { label: string; bucket: "Non-verbal cue" | "Weather word" }[] = [
  { label: "gestures", bucket: "Non-verbal cue" },
  { label: "tonal variation", bucket: "Non-verbal cue" },
  { label: "facial expressions", bucket: "Non-verbal cue" },
  { label: "matar (rain)", bucket: "Weather word" },
  { label: "shams (sun)", bucket: "Weather word" },
  { label: "riyah (wind)", bucket: "Weather word" },
];

export const weatherSpeaking: Skill = {
  id: "g7-ar-ls-weather",
  code: "LS.8",
  subjectId: "arabic",
  strandId: "g7-ar-listening-speaking",
  grade: 7,
  title: "Conversational skills: weather and non-verbal cues",
  description: "Listen to a spoken weather report, identify the 5 named non-verbal communication cues used, and practise weather vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = CUE_CATEGORY.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each item as a Non-verbal cue or a Weather word.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Non-verbal cue", label: "Non-verbal cue" },
          { id: "Weather word", label: "Weather word" },
        ],
        correctBucket,
        hint: "A non-verbal cue is about how something is communicated (body/voice); a weather word names a weather condition.",
        explanation: CUE_CATEGORY.map((s) => `"${s.label}" is a ${s.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, NON_VERBAL_CUES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each of the 5 non-verbal communication cues to what it means.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the difference between what your hands do, your voice does, and your face does.",
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
        prompt: "Put these lines from the spoken weather report in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The report covers today's weather first, then tomorrow's, ending with the warning.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word or term.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the 5 named non-verbal cues and the weather vocabulary above.",
        explanation: `The answer is "${f.correct}".`,
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
      hint: "Look at both the spoken words and the stage-direction cues in the passage above.",
      explanation: q.explanation,
    };
  },
};
