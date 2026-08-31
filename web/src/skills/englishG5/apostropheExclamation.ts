import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 9.0 Communicable Diseases, sub-strand 9.4 Mechanics of Writing:
// Punctuation Marks — the apostrophe and the exclamation mark. See curriculum-reference/grade-5/english.json.

type AposUse = "contraction" | "singular-poss" | "plural-poss" | "irregular-poss";
const APOS_LABEL: Record<AposUse, string> = {
  contraction: "a contraction (two words joined, letters missed out)",
  "singular-poss": "one owner (apostrophe before the s)",
  "plural-poss": "more than one owner ending in s (apostrophe after the s)",
  "irregular-poss": "an irregular plural owner (apostrophe before the s)",
};

const APOS_TPL: { correct: string; noApos: string; use: AposUse }[] = [
  { correct: "The nurse said we shouldn't share cups during a cold.", noApos: "The nurse said we shouldnt share cups during a cold.", use: "contraction" },
  { correct: "It's important to cover a cough.", noApos: "Its important to cover a cough.", use: "contraction" },
  { correct: "The doctor's gloves were clean.", noApos: "The doctors gloves were clean.", use: "singular-poss" },
  { correct: "The patient's temperature was high.", noApos: "The patients temperature was high.", use: "singular-poss" },
  { correct: "The nurses' room is next to the ward.", noApos: "The nurses room is next to the ward.", use: "plural-poss" },
  { correct: "The children's ward was quiet.", noApos: "The childrens ward was quiet.", use: "irregular-poss" },
  { correct: "We didn't wash our hands before lunch.", noApos: "We didnt wash our hands before lunch.", use: "contraction" },
  { correct: "The clinic's vaccine fridge stopped working.", noApos: "The clinics vaccine fridge stopped working.", use: "singular-poss" },
  { correct: "The pupils' hand-washing chart is on the wall.", noApos: "The pupils hand-washing chart is on the wall.", use: "plural-poss" },
  { correct: "They're staying home until the fever passes.", noApos: "Theyre staying home until the fever passes.", use: "contraction" },
  { correct: "The men's clinic opens at nine.", noApos: "The mens clinic opens at nine.", use: "irregular-poss" },
  { correct: "The health worker's advice was clear.", noApos: "The health workers advice was clear.", use: "singular-poss" },
];

// Exclamation vs full stop: which sentence should end with "!"?
const EXCLAIM_TPL: { text: string; needsExclaim: boolean }[] = [
  { text: "Watch out, that needle is not covered", needsExclaim: true },
  { text: "The clinic opens at eight o'clock", needsExclaim: false },
  { text: "How quickly cholera can spread", needsExclaim: true },
  { text: "Measles is a communicable disease", needsExclaim: false },
  { text: "Wash your hands right now", needsExclaim: true },
  { text: "The nurse recorded the temperature", needsExclaim: false },
  { text: "What a relief, the test was negative", needsExclaim: true },
  { text: "Typhoid is spread through dirty water", needsExclaim: false },
  { text: "Hurry, the ambulance is here", needsExclaim: true },
  { text: "The vaccine campaign starts next week", needsExclaim: false },
];

export const apostropheExclamation: Skill = {
  id: "g5-eng-writing-apostrophe-exclamation",
  code: "W.9",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Punctuation: Apostrophe and Exclamation Mark",
  description: "Use the apostrophe for contractions and possession (singular, plural, irregular), and the exclamation mark for strong feeling or a sharp command.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-apos", "fill-apos", "sort-use", "match", "order", "reason-exclaim"] as const);

    if (branch === "mc-apos") {
      const t = randChoice(rng, APOS_TPL);
      // wrong: no apostrophe; apostrophe in the wrong place; its/it's or their/they're confusion
      const misplaced = t.use === "singular-poss" ? t.correct.replace("'s", "s'") : t.use === "plural-poss" ? t.correct.replace("s'", "'s") : t.correct.replace("'", " '");
      const wrong = [t.noApos, misplaced, t.correct.replace("'", "`")];
      const { choices, correctIndex } = mcFromCluster(rng, t.correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: choosePrompt(rng, "the sentence with the apostrophe used correctly"),
        choices,
        correctIndex,
        layout: "list",
        hint: `Here the apostrophe shows ${APOS_LABEL[t.use]}.`,
        explanation: `Correct: "${t.correct}" — the apostrophe shows ${APOS_LABEL[t.use]}. Note: "its" (belonging to it) has NO apostrophe; "it's" always means "it is".`,
      };
    }

    if (branch === "fill-apos") {
      const t = randChoice(rng, APOS_TPL);
      // ask for the single word that needs the apostrophe, spelled correctly
      const words = t.correct.replace(/[.]/g, "").split(" ");
      const target = words.find((w) => w.includes("'"))!;
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the word in this sentence that needs an apostrophe (write it correctly)"),
        before: `Sentence (apostrophe missing): "${t.noApos}"\nCorrect word: `,
        after: "",
        correctAnswer: target,
        acceptedAnswers: [target],
        inputMode: "text",
        hint: APOS_LABEL[t.use],
        explanation: `The word is "${target}". Full sentence: "${t.correct}"`,
      };
    }

    if (branch === "sort-use") {
      const pool = shuffle(rng, APOS_TPL).slice(0, 6);
      const items = pool.map((t, i) => ({ id: `t${i}`, label: t.correct }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((t, i) => (correctBucket[`t${i}`] = t.use));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "what the apostrophe is doing in each sentence"),
        items,
        buckets: [
          { id: "contraction", label: "Contraction (joining words)" },
          { id: "singular-poss", label: "One owner ('s)" },
          { id: "plural-poss", label: "Owners ending in s (s')" },
          { id: "irregular-poss", label: "Irregular plural owner ('s)" },
        ],
        correctBucket,
        hint: "Contraction = replaces missing letters (do not → don't). Possession = shows who something belongs to.",
        explanation: "don't / it's / they're = contractions. doctor's = one owner. nurses' = many owners ending in s. children's / men's = irregular plural owners.",
      };
    }

    if (branch === "match") {
      const uses: AposUse[] = ["contraction", "singular-poss", "plural-poss", "irregular-poss"];
      const pool = uses.map((u) => ({ u, ex: APOS_TPL.find((t) => t.use === u)!.correct }));
      const tokens = shuffle(rng, pool.map((p) => ({ id: p.u, label: APOS_LABEL[p.u] })));
      const targets = shuffle(rng, pool.map((p) => ({ id: p.u, label: p.ex })));
      const correctMap: Record<string, string> = {};
      pool.forEach((p) => (correctMap[p.u] = p.u));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "use of the apostrophe to an example"),
        tokens,
        targets,
        correctMap,
        hint: "Decide if the apostrophe joins words or shows ownership — and if ownership, how many owners.",
        explanation: pool.map((p) => `${APOS_LABEL[p.u]}: "${p.ex}"`).join("  "),
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, EXCLAIM_TPL.filter((e) => e.needsExclaim));
      const words = t.text.split(" ");
      const parts = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      parts.push({ id: "mark", label: "!" });
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words and the mark to make a sentence showing strong feeling"),
        instruction: "Click the words and the punctuation mark in the correct order.",
        items: shuffle(rng, parts),
        correctOrder: [...words.map((w, i) => `${i}-${w}`), "mark"],
        hint: "A warning or a sharp command ends with an exclamation mark.",
        explanation: `Correct: "${t.text}!"`,
      };
    }

    // reason — Evaluate: should this sentence end with "." or "!"?
    const t = randChoice(rng, EXCLAIM_TPL);
    const correct = t.needsExclaim ? `${t.text}!` : `${t.text}.`;
    const wrong = t.needsExclaim
      ? [`${t.text}.`, `${t.text}?`, `${t.text}!!`]
      : [`${t.text}!`, `${t.text}!!`, `${t.text}?`];
    const { choices, correctIndex } = mcFromCluster(rng, correct, wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `A pupil is writing a health poster. One line reads: "${t.text}"`, "How should it end?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Use an exclamation mark only for strong feeling, a warning, or a sharp command — and never more than one.",
      explanation: t.needsExclaim
        ? `"${correct}" — this is a warning/strong feeling, so one exclamation mark is right (never "!!").`
        : `"${correct}" — this is a plain fact, so it ends with a full stop, not an exclamation mark.`,
    };
  },
};
