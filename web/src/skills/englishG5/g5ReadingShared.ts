import { randChoice, shuffle } from "@/lib/rng";
import type { Question } from "@/lib/types";
import type { RNG } from "@/lib/rng";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// Shared comprehension-question builder for the Grade 5 English Reading strand. A Passage carries a short
// text plus pools of factual, inferential, main-idea, vocabulary-in-context, and sequence items, so each
// intensive-reading skill can branch across 5+ QuestionKinds from real text.

export interface Passage {
  title: string;
  text: string;
  /** factual: answer is stated directly in the text. Each has a one-word/short `answer` and 3 wrong options. */
  factual: { q: string; answer: string; wrong: string[] }[];
  /** inferential: answer must be worked out from clues. */
  inferential: { q: string; answer: string; wrong: string[] }[];
  mainIdea: { answer: string; wrong: string[] };
  /** vocabulary in context: a word from the text and its meaning here. */
  vocab: { word: string; meaning: string; wrong: string[] }[];
  /** events in the order they happen in the text (3-4). */
  sequence: string[];
  /** statements that are NOT in the text at all (for the 3-way sort). */
  notInText: string[];
}

export function comprehensionBranch(rng: RNG, passages: Passage[], focusHint: string): Question {
  const p = randChoice(rng, passages);
  const branch = randChoice(rng, ["mc-infer", "fill-vocab", "sort-source", "match-fact", "order-events", "reason-main"] as const);

  if (branch === "mc-infer") {
    const item = randChoice(rng, p.inferential.length ? p.inferential : p.factual);
    const { choices, correctIndex } = mcFromCluster(rng, item.answer, item.wrong, 3);
    return {
      kind: "multiple-choice",
      passage: p.text,
      prompt: `${choosePrompt(rng, "the best answer")} ${item.q}`,
      choices,
      correctIndex,
      layout: "list",
      hint: focusHint,
      explanation: `"${item.answer}" — you work this out by putting together clues in the text; it is not stated word for word.`,
    } as Question;
  }

  if (branch === "fill-vocab") {
    const v = randChoice(rng, p.vocab);
    return {
      kind: "fill-blank",
      passage: p.text,
      prompt: fillPrompt(rng, `a word from the passage that means "${v.meaning}" here`),
      before: "Word from the passage: ",
      after: "",
      correctAnswer: v.word,
      acceptedAnswers: [v.word, v.word.toLowerCase()],
      inputMode: "text",
      hint: "Find the sentence where the meaning fits, then read the word used there.",
      explanation: `"${v.word}" means "${v.meaning}" in this passage. Contextual clues in the sentence help you work that out.`,
    } as Question;
  }

  if (branch === "sort-source") {
    const facts = shuffle(rng, p.factual).slice(0, 2).map((f, i) => ({ id: `f${i}`, label: statementFrom(f), kind: "stated" }));
    const infers = shuffle(rng, p.inferential).slice(0, 2).map((f, i) => ({ id: `i${i}`, label: statementFrom(f), kind: "worked-out" }));
    const nots = shuffle(rng, p.notInText).slice(0, 2).map((n, i) => ({ id: `n${i}`, label: n, kind: "not-there" }));
    const items = shuffle(rng, [...facts, ...infers, ...nots]);
    const correctBucket: Record<string, string> = {};
    items.forEach((it) => (correctBucket[it.id] = it.kind));
    return {
      kind: "categorize",
      passage: p.text,
      prompt: sortPrompt(rng, "whether each statement is stated in the text, must be worked out, or is not in the text"),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "stated", label: "Stated directly in the text" },
        { id: "worked-out", label: "Must be worked out (inferred)" },
        { id: "not-there", label: "Not in the text at all" },
      ],
      correctBucket,
      hint: "Point to the exact words for 'stated'. For 'worked out', you use clues plus thinking. If there are no clues at all, it is 'not there'.",
      explanation: "Factual answers are in the text word for word. Inferential answers come from clues + reasoning. Some statements simply are not supported by the passage.",
    } as Question;
  }

  if (branch === "match-fact") {
    const pool = shuffle(rng, p.factual).slice(0, Math.min(5, p.factual.length));
    const tokens = shuffle(rng, pool.map((f, i) => ({ id: `p${i}`, label: f.q })));
    const targets = shuffle(rng, pool.map((f, i) => ({ id: `p${i}`, label: f.answer })));
    const correctMap: Record<string, string> = {};
    pool.forEach((_f, i) => (correctMap[`p${i}`] = `p${i}`));
    return {
      kind: "click-match",
      passage: p.text,
      prompt: matchPrompt(rng, "question to its answer from the text"),
      tokens,
      targets,
      correctMap,
      hint: "Each answer is stated somewhere in the passage — scan for it.",
      explanation: pool.map((f) => `${f.q} → ${f.answer}`).join("  "),
    } as Question;
  }

  if (branch === "order-events") {
    const items = p.sequence.map((t, i) => ({ id: `e${i}`, label: t }));
    return {
      kind: "ordering",
      passage: p.text,
      prompt: orderPrompt(rng, "the events in the order they happen in the passage"),
      instruction: "Click the events in the correct order.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Re-read the passage and follow the order of what happens.",
      explanation: `Order: ${p.sequence.map((s, i) => `${i + 1}. ${s}`).join("  ")}`,
    } as Question;
  }

  // reason-main: main idea
  const { choices, correctIndex } = mcFromCluster(rng, p.mainIdea.answer, p.mainIdea.wrong, 3);
  return {
    kind: "multiple-choice",
    passage: p.text,
    prompt: scenarioPrompt(rng, `A friend asks what "${p.title}" is mainly about.`, "Which answer gives the MAIN idea?"),
    choices,
    correctIndex,
    layout: "list",
    hint: "The main idea covers the whole passage — not just one small detail from it.",
    explanation: `"${p.mainIdea.answer}" is the main idea. The other options are either small details or ideas the passage does not really make.`,
  } as Question;
}

function statementFrom(f: { q: string; answer: string }): string {
  // turn "Where did they go?" + "the stadium" into a declarative-ish statement for sorting
  return `${f.q.replace(/\?$/, "")} — ${f.answer}`;
}

export { randChoice, shuffle };
