import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { id: string; label: string; description: string }[] = [
  { id: "shaping", label: "Letter shaping", description: "Forming each letter with its correct, consistent shape so it is never confused with another letter" },
  { id: "joining", label: "Joining letters", description: "Connecting letters smoothly within a word, without tangled or crossed strokes" },
  { id: "spacing", label: "Spacing", description: "Leaving even, consistent gaps between letters, words, and lines" },
];
const FEATURE_OF: Record<string, (typeof FEATURES)[number]> = {};
for (const f of FEATURES) FEATURE_OF[f.id] = f;

const PROBLEMS: { featureId: string; problem: string; fix: string }[] = [
  { featureId: "shaping", problem: "Peter forms his 'u' and 'n' almost identically, so readers often misread 'sun' as 'sum'.", fix: "Practise the distinct shape of each letter carefully instead of rushing through it." },
  { featureId: "shaping", problem: "Wanjiru's 'a' looks just like her 'o', so words like 'cat' and 'cot' are hard to tell apart.", fix: "Slow down and give each letter its own clear, correct shape." },
  { featureId: "joining", problem: "In Amina's cursive writing, the letters in each word run together into one tangled scribble.", fix: "Join each letter with a single controlled stroke instead of looping back over earlier letters." },
  { featureId: "joining", problem: "Because Brian crosses his joining strokes incorrectly, his 'th' often looks like an 'l'.", fix: "Practise joining letter pairs slowly, lifting the pen cleanly between words." },
  { featureId: "spacing", problem: "A reader can't tell where one word ends and the next begins in Fatuma's writing.", fix: "Leave a clear, even gap — about the width of a small letter — between each word." },
  { featureId: "spacing", problem: "Kevin's lines of writing are so close together that the tops and tails of letters overlap.", fix: "Leave enough space between lines so ascenders and descenders don't collide." },
];

const QUALITIES: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is legible, neat handwriting an important personal responsibility?",
    correct: "It shows respect for the reader's time by making the message easy to understand",
    distractors: ["It has no effect on how a message is understood", "It only matters when a teacher is marking the work", "It makes the writer finish faster, regardless of how careful they are"],
  },
  {
    q: "What is the main purpose of writing neatly and legibly?",
    correct: "So that anyone who reads it can understand the message without confusion",
    distractors: ["So that only the writer can read it later", "So the page looks emptier", "Because neat writing always takes less time, no matter how careless it is"],
  },
  {
    q: "Which habit best shows personal responsibility in your handwriting?",
    correct: "Taking time to shape, join, and space your letters carefully, even when writing quickly",
    distractors: ["Writing as fast as possible and ignoring how it looks", "Only writing neatly during examinations", "Letting the reader guess unclear words"],
  },
  {
    q: "Why should a writer take responsibility for how legible their handwriting is?",
    correct: "Because unclear handwriting can confuse the reader or cause a message to be misunderstood",
    distractors: ["Because handwriting never affects how a message is received", "Because only printed text needs to be clear", "Because legibility is only useful for younger students"],
  },
];

export const handwritingLegibility: Skill = {
  id: "g7-eng-w-handwriting-legibility",
  code: "W.1",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Handwriting: Legibility and Neatness",
  description: "Identify the features of legible, neat handwriting — letter shaping, joining, and spacing — and recognise why legible writing matters.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-cause", "match-fix", "categorize", "fill-feature", "mc-importance"] as const);
    const hint = "Legible handwriting depends on three features: shaping each letter correctly, joining letters smoothly, and leaving even spacing between letters, words, and lines.";

    if (branch === "mc-cause") {
      const entry = randChoice(rng, PROBLEMS);
      const feature = FEATURE_OF[entry.featureId];
      const otherFeatures = FEATURES.filter((f) => f.id !== feature.id).map((f) => f.label);
      const choices = shuffle(rng, [feature.label, ...otherFeatures]);
      return {
        kind: "multiple-choice",
        prompt: `${entry.problem} What handwriting habit most likely caused this?`,
        choices,
        correctIndex: choices.indexOf(feature.label),
        layout: "list",
        hint,
        explanation: `This is a problem with ${feature.label.toLowerCase()} — ${feature.description.toLowerCase()}. The fix: ${entry.fix.toLowerCase()}`,
      };
    }

    if (branch === "match-fix") {
      const chosen = shuffle(rng, PROBLEMS).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `p${i}`, label: p.problem }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.fix })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each handwriting habit to the best way of fixing it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.problem}" — fix: ${p.fix.toLowerCase()}`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PROBLEMS);
      const items = chosen.map((p, i) => ({ id: `c${i}`, label: p.problem }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`c${i}`] = p.featureId));
      return {
        kind: "categorize",
        prompt: "Sort each described handwriting problem by which feature — shaping, joining, or spacing — is responsible for it.",
        items,
        buckets: FEATURES.map((f) => ({ id: f.id, label: f.label })),
        correctBucket,
        hint,
        explanation: chosen.map((p) => `"${p.problem}" is a ${FEATURE_OF[p.featureId].label.toLowerCase()} problem.`).join(" "),
      };
    }

    if (branch === "fill-feature") {
      const entry = randChoice(rng, PROBLEMS);
      const feature = FEATURE_OF[entry.featureId];
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word — which handwriting feature is described?",
        before: entry.problem + " This is most likely a problem with letter",
        after: "in this piece of writing.",
        correctAnswer: feature.id === "joining" ? "joining" : feature.id,
        acceptedAnswers: feature.id === "spacing" ? ["spacing"] : feature.id === "joining" ? ["joining"] : ["shaping"],
        inputMode: "text",
        hint,
        explanation: `This is a problem with ${feature.label.toLowerCase()} — ${feature.description.toLowerCase()}.`,
      };
    }

    const entry = randChoice(rng, QUALITIES);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
