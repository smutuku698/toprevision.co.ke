import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 9.0 Communicable Diseases, sub-strand 9.3 Word Class: Adverbs
// (manner, time, place, frequency); modals could / would; pattern "how many ... could/would ...?".
// See curriculum-reference/grade-5/english.json.

type AdvType = "manner" | "time" | "place" | "frequency";
const ADVERBS: { word: string; type: AdvType }[] = [
  { word: "quickly", type: "manner" }, { word: "carefully", type: "manner" }, { word: "quietly", type: "manner" }, { word: "well", type: "manner" }, { word: "badly", type: "manner" }, { word: "gently", type: "manner" },
  { word: "now", type: "time" }, { word: "today", type: "time" }, { word: "yesterday", type: "time" }, { word: "soon", type: "time" }, { word: "later", type: "time" }, { word: "early", type: "time" },
  { word: "here", type: "place" }, { word: "there", type: "place" }, { word: "outside", type: "place" }, { word: "nearby", type: "place" }, { word: "everywhere", type: "place" }, { word: "upstairs", type: "place" },
  { word: "always", type: "frequency" }, { word: "usually", type: "frequency" }, { word: "often", type: "frequency" }, { word: "sometimes", type: "frequency" }, { word: "rarely", type: "frequency" }, { word: "never", type: "frequency" }, { word: "daily", type: "frequency" },
];

const FILL_TPL: { before: string; after: string; word: string; type: AdvType }[] = [
  { before: "The nurse washed her hands ", after: " before touching the patient.", word: "carefully", type: "manner" },
  { before: "We should cover a cough ", after: " to stop germs from spreading.", word: "always", type: "frequency" },
  { before: "Wash your hands with soap ", after: ", before every meal.", word: "daily", type: "frequency" },
  { before: "The clinic opens ", after: " at eight in the morning.", word: "early", type: "time" },
  { before: "Boil the drinking water ", after: " so it is safe by lunchtime.", word: "now", type: "time" },
  { before: "Cholera spreads ", after: " in places with dirty water.", word: "quickly", type: "manner" },
  { before: "The health worker put the used needles ", after: ", in a sealed box.", word: "here", type: "place" },
  { before: "Children ", after: " forget to wash their hands after playing.", word: "often", type: "frequency" },
  { before: "The doctor spoke ", after: " so the frightened child would calm down.", word: "gently", type: "manner" },
  { before: "Keep the sick child ", after: ", away from the others, until the fever passes.", word: "nearby", type: "place" },
  { before: "The vaccine will arrive ", after: ", so the campaign starts next week.", word: "soon", type: "time" },
  { before: "You should ", after: " share a cup with someone who has a cold.", word: "never", type: "frequency" },
];

export const adverbsModalsCouldWould: Skill = {
  id: "g5-eng-grammar-adverbs-could-would",
  code: "LU.9",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Adverbs (manner, time, place, frequency) and could / would",
  description: "Identify and use adverbs of manner, time, place and frequency, use could and would in sentences, and form 'How many ... could/would ...?' questions.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort-type", "match", "order-question", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, FILL_TPL);
      const wrong = shuffle(rng, ADVERBS.filter((a) => a.type !== t.type).map((a) => a.word)).slice(0, 3);
      const { choices, correctIndex } = mcFromCluster(rng, t.word, wrong);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, `the adverb of ${t.type} that fits`)}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: `An adverb of ${t.type} tells us ${t.type === "manner" ? "how" : t.type === "time" ? "when" : t.type === "place" ? "where" : "how often"} the action happens.`,
        explanation: `"${t.word}" is correct — an adverb of ${t.type}. The other choices are real adverbs, but they answer the wrong question (${t.type === "manner" ? "when/where/how often" : "how/where/when"} instead of ${t.type === "manner" ? "how" : t.type === "time" ? "when" : t.type === "place" ? "where" : "how often"}).`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, FILL_TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `an adverb of ${t.type}`),
        before: t.before,
        after: t.after,
        correctAnswer: t.word,
        acceptedAnswers: [t.word],
        inputMode: "text",
        hint: `Adverb of ${t.type}: tells ${t.type === "manner" ? "how" : t.type === "time" ? "when" : t.type === "place" ? "where" : "how often"}.`,
        explanation: `"${t.word}" is correct. Full sentence: "${cap((t.before + t.word + t.after).trim())}"`,
      };
    }

    if (branch === "sort-type") {
      const pool = shuffle(rng, ADVERBS).slice(0, 8);
      const items = pool.map((a, i) => ({ id: `a${i}`, label: a.word }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((a, i) => (correctBucket[`a${i}`] = a.type));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "the type of each adverb"),
        items,
        buckets: [
          { id: "manner", label: "Manner (how)" },
          { id: "time", label: "Time (when)" },
          { id: "place", label: "Place (where)" },
          { id: "frequency", label: "Frequency (how often)" },
        ],
        correctBucket,
        hint: "Ask the adverb a question: how? when? where? how often?",
        explanation: "Manner: quickly, carefully, gently. Time: now, soon, early. Place: here, outside, nearby. Frequency: always, often, never, daily.",
      };
    }

    if (branch === "match") {
      const seenTypes = new Set<AdvType>();
      const pool = shuffle(rng, ADVERBS).filter((a) => (seenTypes.has(a.type) ? false : (seenTypes.add(a.type), true))).slice(0, 5);
      const tokens = shuffle(rng, pool.map((a) => ({ id: a.word, label: a.word })));
      const targets = shuffle(rng, pool.map((a) => ({ id: a.word, label: a.type === "manner" ? "how (manner)" : a.type === "time" ? "when (time)" : a.type === "place" ? "where (place)" : "how often (frequency)" })));
      const correctMap: Record<string, string> = {};
      pool.forEach((a) => (correctMap[a.word] = a.word));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "adverb to the question it answers"),
        tokens,
        targets,
        correctMap,
        hint: "Say the adverb in a sentence and ask what it tells you about the verb.",
        explanation: pool.map((a) => `"${a.word}" answers ${a.type === "manner" ? "how" : a.type === "time" ? "when" : a.type === "place" ? "where" : "how often"}.`).join(" "),
      };
    }

    if (branch === "order-question") {
      const qs = [
        "How many patients could the nurse treat in one hour",
        "How many pupils would miss school if the flu spread",
        "How many doses could the clinic store in the fridge",
        "How many people would attend the vaccination day",
        "How many hand-washing points could the school build this term",
        "How many children would need the measles jab",
      ];
      const q = randChoice(rng, qs);
      const words = q.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a 'How many ... could/would ...?' question"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "The pattern is: How many + noun + could/would + subject + verb ...?",
        explanation: `Correct question: "${q}?"`,
      };
    }

    // reason — Apply: could/would in a polite/hypothetical health scenario.
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      {
        s: `${name(rng)} wants to ask the health worker politely for a leaflet about typhoid.`,
        correct: "Could I have a leaflet about typhoid, please?",
        wrong: ["Can you must give me a leaflet about typhoid?", "Would I having a leaflet about typhoid?", "Could I had a leaflet about typhoid?"],
        why: "'could + I + base verb' makes a polite request.",
      },
      {
        s: `The class is guessing how the clinic might respond if 50 people came for vaccines in one day.`,
        correct: "The clinic would need more nurses.",
        wrong: ["The clinic will needed more nurses.", "The clinic would needs more nurses.", "The clinic would needed more nurses."],
        why: "'would + base verb' talks about an imagined result.",
      },
      {
        s: `${name(rng)} wonders aloud how many hand-washing stations the school could afford.`,
        correct: "How many stations could the school afford?",
        wrong: ["How much stations could the school afford?", "How many stations could the school affords?", "How many stations the school could afford?"],
        why: "the pattern is 'How many + plural noun + could + subject + base verb?'.",
      },
      {
        s: `The nurse describes her old job, where she saw patients one after another all morning.`,
        correct: "She could see twenty patients before lunch.",
        wrong: ["She could saw twenty patients before lunch.", "She could sees twenty patients before lunch.", "She can saw twenty patients before lunch."],
        why: "'could + base verb' also describes a past ability.",
      },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which sentence is correct?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "After could/would, use the base form of the verb (see, have, need — not sees, had, needed).",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
