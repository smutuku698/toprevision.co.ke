import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 13.0 Money - Savings and Banking, sub-strand 13.3 Word Class: Prepositions —
// time (in / on / at), place (in / on / at), direction (into / towards / to / through).
// See curriculum-reference/grade-5/english.json.

type Use = "time" | "place" | "direction";
const TPL: { before: string; after: string; answer: string; use: Use; why: string }[] = [
  { before: "The bank opens ", after: " eight o'clock every morning.", answer: "at", use: "time", why: "'at' is used with clock times" },
  { before: "We visit the SACCO office ", after: " Mondays.", answer: "on", use: "time", why: "'on' is used with days of the week" },
  { before: "Interest is added to the account ", after: " December.", answer: "in", use: "time", why: "'in' is used with months" },
  { before: "My mother queued ", after: " the counter to make a deposit.", answer: "at", use: "place", why: "'at' is used for a specific point or spot" },
  { before: "The passbook was lying ", after: " the desk.", answer: "on", use: "place", why: "'on' is used for a surface" },
  { before: "There were many customers ", after: " the banking hall.", answer: "in", use: "place", why: "'in' is used for an enclosed space" },
  { before: "The customer walked ", after: " the bank to open an account.", answer: "into", use: "direction", why: "'into' shows movement to the inside of something" },
  { before: "The teller pointed ", after: " the exit for the confused customer.", answer: "towards", use: "direction", why: "'towards' shows movement in the direction of something" },
  { before: "We took the bus ", after: " town to visit the ATM.", answer: "to", use: "direction", why: "'to' shows movement to a destination" },
  { before: "The security guard walked ", after: " the doorway and greeted us.", answer: "through", use: "direction", why: "'through' shows movement from one side to the other" },
  { before: "The savings meeting starts ", after: " noon on Friday.", answer: "at", use: "time", why: "'at' is used with points of time like noon and midnight" },
  { before: "Her name was written ", after: " the cheque.", answer: "on", use: "place", why: "'on' is used for writing on a surface" },
  { before: "The coins rolled ", after: " the money box.", answer: "into", use: "direction", why: "'into' shows movement to the inside" },
  { before: "We keep our savings ", after: " a locked box at home.", answer: "in", use: "place", why: "'in' is used for something inside a container" },
];

function prepCluster(correct: string, use: Use): string[] {
  if (use === "direction") return ["into", "towards", "to", "through"].filter((p) => p !== correct);
  return ["in", "on", "at"].filter((p) => p !== correct);
}

export const prepositionsTimePlaceDirection: Skill = {
  id: "g5-eng-grammar-prepositions-time-place-direction",
  code: "LU.13",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Prepositions of Time, Place and Direction",
  description: "Use prepositions of time (in, on, at), place (in, on, at) and direction (into, towards, to, through) correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "sort-use", "match", "order", "reason"] as const);

    if (branch === "mc") {
      const t = randChoice(rng, TPL);
      const { choices, correctIndex } = mcFromCluster(rng, t.answer, prepCluster(t.answer, t.use));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, `the preposition of ${t.use}`)}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: t.use === "time" ? "at = clock time; on = a day/date; in = a month/year/part of day." : t.use === "place" ? "at = a point; on = a surface; in = an enclosed space." : "into = to the inside; towards = in the direction of; to = to a destination; through = from one side to the other.",
        explanation: `"${t.answer}" is correct — ${t.why}. Full sentence: "${cap((t.before + t.answer + t.after).trim())}"`,
      };
    }

    if (branch === "fill") {
      const t = randChoice(rng, TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the preposition of ${t.use}`),
        before: t.before,
        after: t.after,
        correctAnswer: t.answer,
        acceptedAnswers: [t.answer],
        inputMode: "text",
        hint: t.why.replace("'", "").replace("'", ""),
        explanation: `"${t.answer}" is correct — ${t.why}.`,
      };
    }

    if (branch === "sort-use") {
      const pool = shuffle(rng, TPL).slice(0, 6);
      const items = pool.map((t, i) => ({ id: `t${i}`, label: (t.before + t.answer.toUpperCase() + t.after).trim() }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((t, i) => (correctBucket[`t${i}`] = t.use));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "what the highlighted preposition shows"),
        items,
        buckets: [
          { id: "time", label: "Time (when)" },
          { id: "place", label: "Place (where)" },
          { id: "direction", label: "Direction (which way / to where)" },
        ],
        correctBucket,
        hint: "Time answers 'when', place answers 'where (still)', direction answers 'moving which way'.",
        explanation: "Time: at eight, on Monday, in December. Place: at the counter, on the desk, in the hall. Direction: into the bank, towards the exit, to town, through the doorway.",
      };
    }

    if (branch === "match") {
      const rows = [
        { p: "at", label: "at 8 o'clock / at the counter", key: "at" },
        { p: "on", label: "on Monday / on the desk", key: "on" },
        { p: "in", label: "in December / in the hall", key: "in" },
        { p: "into", label: "walked ___ the bank", key: "into" },
        { p: "towards", label: "pointed ___ the exit", key: "towards" },
        { p: "through", label: "went ___ the doorway", key: "through" },
      ];
      const pool = shuffle(rng, rows).slice(0, 5);
      const tokens = shuffle(rng, pool.map((r) => ({ id: r.key, label: r.p })));
      const targets = shuffle(rng, pool.map((r) => ({ id: r.key, label: r.label })));
      const correctMap: Record<string, string> = {};
      pool.forEach((r) => (correctMap[r.key] = r.key));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "preposition to an example that uses it"),
        tokens,
        targets,
        correctMap,
        hint: "Read each example and decide which small word fits the gap or the pattern.",
        explanation: "at → clock times & points; on → days & surfaces; in → months & enclosed spaces; into/towards/through → movement.",
      };
    }

    if (branch === "order") {
      const t = randChoice(rng, TPL);
      const sentence = (t.before + t.answer + t.after).trim().replace(/\.$/, "");
      const words = sentence.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence with a preposition"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The preposition "${t.answer}" shows ${t.use} here.`,
        explanation: `Correct sentence: "${cap(sentence)}."`,
      };
    }

    // reason — Apply: choose the sentence with the correct preposition for the situation.
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      { s: "The bank's doors are unlocked exactly at 8:00 a.m.", correct: "The bank opens at eight o'clock.", wrong: ["The bank opens in eight o'clock.", "The bank opens on eight o'clock.", "The bank opens to eight o'clock."], why: "clock times take 'at'." },
      { s: "A customer moves from the street to the inside of the banking hall.", correct: "She walked into the banking hall.", wrong: ["She walked at the banking hall.", "She walked on the banking hall.", "She walked towards into the banking hall."], why: "movement to the inside of a place takes 'into'." },
      { s: "The savings-group meeting happens every first day of the working week.", correct: "The meeting is on Mondays.", wrong: ["The meeting is at Mondays.", "The meeting is in Mondays.", "The meeting is to Mondays."], why: "days of the week take 'on'." },
      { s: "A guard directs a lost customer, showing the way to the door without going with them.", correct: "He pointed towards the exit.", wrong: ["He pointed into the exit.", "He pointed on the exit.", "He pointed at the exit door of towards."], why: "'towards' shows the direction to move without reaching it." },
      { s: "Interest is added once, during the last month of the year.", correct: "Interest is added in December.", wrong: ["Interest is added on December.", "Interest is added at December.", "Interest is added to December."], why: "months take 'in'." },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which sentence uses the correct preposition?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Decide first whether the sentence is about a time, a place, or a movement.",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
