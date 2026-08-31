import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 10.0 Leisure Time Activities, sub-strand 10.3 Word Class: Conjunctions —
// but, or, yet, because, since, also. See curriculum-reference/grade-5/english.json.

type Fn = "contrast" | "choice" | "reason" | "addition";
const CONJ: Record<string, Fn> = { but: "contrast", yet: "contrast", or: "choice", because: "reason", since: "reason", also: "addition" };
const FN_LABEL: Record<Fn, string> = { contrast: "shows a contrast (a surprising difference)", choice: "shows a choice between two things", reason: "gives a reason or cause", addition: "adds another idea" };

const TPL: { before: string; after: string; answer: string }[] = [
  { before: "We wanted to go swimming, ", after: " the pool was closed.", answer: "but" },
  { before: "You can play chess ", after: " read a book during the break.", answer: "or" },
  { before: "The team kept training ", after: " they were tired.", answer: "yet" },
  { before: "We stayed indoors ", after: " it was raining heavily.", answer: "because" },
  { before: "The hike was cancelled ", after: " the path was flooded.", answer: "since" },
  { before: "She enjoys cycling; she ", after: " likes jogging in the evening.", answer: "also" },
  { before: "I packed a ball ", after: " a skipping rope for the picnic.", answer: "and" },
  { before: "He tried to fly the kite, ", after: " there was no wind.", answer: "but" },
  { before: "We can visit the museum ", after: " the park on Saturday.", answer: "or" },
  { before: "The match was fun ", after: " our team lost.", answer: "yet" },
  { before: "They joined the drama club ", after: " they love acting.", answer: "because" },
  { before: "We left early ", after: " the bus comes only once an hour.", answer: "since" },
  { before: "Reading is my favourite hobby; I ", after: " enjoy drawing.", answer: "also" },
];
const TPL_TARGET = TPL.filter((t) => t.answer !== "and"); // "and" only appears once, as a familiar contrast item

function conjCluster(correct: string): string[] {
  const fn = CONJ[correct];
  // pick conjunctions of a different function as nameable "wrong-relationship" distractors
  const others = Object.keys(CONJ).filter((c) => c !== correct && CONJ[c] !== fn);
  const sameFn = Object.keys(CONJ).filter((c) => c !== correct && CONJ[c] === fn);
  return [...sameFn, ...others];
}

export const conjunctions: Skill = {
  id: "g5-eng-grammar-conjunctions",
  code: "LU.10",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Conjunctions (but, or, yet, because, since, also)",
  description: "Use the conjunctions but, or, yet, because, since and also to join ideas that show contrast, choice, reason or addition.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort-fn", "match", "order", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, TPL_TARGET);
      const { choices, correctIndex } = mcFromCluster(rng, t.answer, conjCluster(t.answer));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the conjunction that joins the two ideas correctly")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Ask what the two parts of the sentence do: contrast? choice? reason? addition?",
        explanation: `"${t.answer}" is correct — it ${FN_LABEL[CONJ[t.answer]]}. Choosing a conjunction with the wrong job (e.g. a reason word where a contrast word is needed) changes the meaning of the sentence.`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, TPL_TARGET);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the conjunction (but, or, yet, because, since or also)"),
        before: t.before,
        after: t.after,
        correctAnswer: t.answer,
        acceptedAnswers: [t.answer],
        inputMode: "text",
        hint: `The two ideas here ${FN_LABEL[CONJ[t.answer]]}.`,
        explanation: `"${t.answer}" is correct. Full sentence: "${cap((t.before + t.answer + t.after).trim())}"`,
      };
    }

    if (branch === "sort-fn") {
      const words = shuffle(rng, Object.keys(CONJ)).slice(0, 6);
      const items = words.map((w, i) => ({ id: `w${i}`, label: w }));
      const correctBucket: Record<string, string> = {};
      words.forEach((w, i) => (correctBucket[`w${i}`] = CONJ[w]));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "the job each conjunction does"),
        items,
        buckets: [
          { id: "contrast", label: "Contrast (but, yet)" },
          { id: "choice", label: "Choice (or)" },
          { id: "reason", label: "Reason (because, since)" },
          { id: "addition", label: "Addition (also)" },
        ],
        correctBucket,
        hint: "but/yet = a surprising difference; or = a choice; because/since = why; also = one more idea.",
        explanation: "Contrast: but, yet. Choice: or. Reason: because, since. Addition: also.",
      };
    }

    if (branch === "match") {
      const seenConj = new Set<string>();
      const pool = shuffle(rng, TPL_TARGET).filter((t) => (seenConj.has(t.answer) ? false : (seenConj.add(t.answer), true))).slice(0, 5);
      const tokens = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: `${t.before.trim()} ___ ${t.after.trim()}` })));
      const targets = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: t.answer })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_t, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "sentence to the conjunction that completes it"),
        tokens,
        targets,
        correctMap,
        hint: "Work out the relationship between the two halves of each sentence.",
        explanation: pool.map((t) => `"${(t.before + t.answer + t.after).trim()}"`).join("  "),
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, TPL_TARGET);
      const sentence = (t.before + t.answer + t.after).trim().replace(/[.;]$/, "").replace(";", "");
      const words = sentence.split(/\s+/);
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence with a conjunction"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The conjunction "${t.answer}" joins the two ideas in the middle.`,
        explanation: `Correct sentence: "${cap(sentence)}."`,
      };
    }

    // reason — Analyze: which conjunction correctly links these two facts?
    const scen: { a: string; b: string; answer: string; wrong: string[] }[] = [
      { a: "We planned a picnic in the park.", b: "It started to rain.", answer: "but", wrong: ["because", "so that", "also"] },
      { a: "The children stayed inside during break.", b: "The field was muddy.", answer: "because", wrong: ["but", "or", "yet"] },
      { a: "You may watch the film.", b: "You may play outside.", answer: "or", wrong: ["because", "yet", "since"] },
      { a: "The team lost the friendly match.", b: "They played very well.", answer: "yet", wrong: ["because", "since", "also"] },
      { a: "She joined the swimming club.", b: "She also joined the athletics club.", answer: "also", wrong: ["but", "or", "because"] },
      { a: "We left the house at seven.", b: "The bus runs only once an hour.", answer: "since", wrong: ["but", "or", "yet"] },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.answer, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `Two facts: (1) ${sc.a} (2) ${sc.b}`, "Which conjunction joins them correctly?"),
      choices,
      correctIndex,
      layout: "row",
      hint: "Does fact 2 contrast with fact 1, give its reason, offer a choice, or add to it?",
      explanation: `"${sc.answer}" is correct — it ${FN_LABEL[CONJ[sc.answer]]}.`,
    };
  },
};
