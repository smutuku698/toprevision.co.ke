import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch } from "./g5LsShared";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 6.0 Jobs and Occupations, sub-strand 6.1 Pronunciation and Vocabulary —
// Stress; Intonation. Focus: sounds /f/ and /v/, sort statements and questions by rising/falling
// intonation, use stress and intonation appropriately. See curriculum-reference/grade-5/english.json.

// Rising intonation: yes/no questions, lists (before the last item), politeness.
// Falling intonation: statements, commands, wh-questions.
const SENTENCES: { text: string; intonation: "rising" | "falling"; why: string }[] = [
  { text: "Is your father a carpenter?", intonation: "rising", why: "it is a yes/no question" },
  { text: "My mother is a nurse.", intonation: "falling", why: "it is a statement" },
  { text: "Do you want to be an engineer?", intonation: "rising", why: "it is a yes/no question" },
  { text: "What does a cobbler do?", intonation: "falling", why: "it is a wh-question" },
  { text: "Please pass me the hammer.", intonation: "falling", why: "it is a command / request" },
  { text: "Are the builders here yet?", intonation: "rising", why: "it is a yes/no question" },
  { text: "The tailor finished the shirt.", intonation: "falling", why: "it is a statement" },
  { text: "Where does the judge work?", intonation: "falling", why: "it is a wh-question" },
  { text: "Can you fix this shoe?", intonation: "rising", why: "it is a yes/no question" },
  { text: "A doctor helps sick people.", intonation: "falling", why: "it is a statement" },
  { text: "Would you like to visit the workshop?", intonation: "rising", why: "it is a yes/no question, and a polite offer" },
  { text: "Tell me about your job.", intonation: "falling", why: "it is a command" },
];

export const stressIntonation: Skill = {
  id: "g5-eng-ls-stress-intonation",
  code: "LS.6",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Stress and Intonation: Statements and Questions",
  description: "Recognise the sounds /f/ and /v/, and use rising intonation for yes/no questions and falling intonation for statements, commands and wh-questions.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-sort", "intonation-mc", "intonation-fill", "sort-intonation", "match"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/f/", "/v/"]);
    if (branch === "sound-sort") return sortTwoSoundsBranch(rng, "/f/", "/v/");

    if (branch === "intonation-mc") {
      const s = randChoice(rng, SENTENCES);
      const { choices, correctIndex } = mcFromCluster(rng, s.intonation === "rising" ? "Rising (voice goes up at the end)" : "Falling (voice goes down at the end)", [s.intonation === "rising" ? "Falling (voice goes down at the end)" : "Rising (voice goes up at the end)"], 1);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the intonation you use when you say this aloud")}\n"${s.text}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Yes/no questions rise at the end. Statements, commands and wh-questions fall.",
        explanation: `"${s.text}" takes ${s.intonation} intonation — ${s.why}.`,
      };
    }

    if (branch === "intonation-fill") {
      const s = randChoice(rng, SENTENCES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `"rising" or "falling"`),
        before: `When you say "${s.text}" aloud, your voice uses `,
        after: " intonation.",
        correctAnswer: s.intonation,
        acceptedAnswers: [s.intonation],
        inputMode: "text",
        hint: s.why,
        explanation: `${s.intonation} intonation — ${s.why}.`,
      };
    }

    if (branch === "sort-intonation") {
      const pool = shuffle(rng, SENTENCES).slice(0, 6);
      const items = pool.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((s, i) => (correctBucket[`s${i}`] = s.intonation));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether you say each sentence with rising or falling intonation"),
        items,
        buckets: [
          { id: "rising", label: "Rising (↗ at the end)" },
          { id: "falling", label: "Falling (↘ at the end)" },
        ],
        correctBucket,
        hint: "Say each one aloud and listen to what your voice does on the last word.",
        explanation: "Rising: yes/no questions, polite offers. Falling: statements, commands, wh-questions.",
      };
    }

    // match / ordering
    if (rng() < 0.5) {
      const rows = [
        { type: "Yes/no question", intonation: "Rising" },
        { type: "Statement", intonation: "Falling" },
        { type: "Command", intonation: "Falling" },
        { type: "Wh-question", intonation: "Falling" },
        { type: "Polite offer", intonation: "Rising" },
      ];
      const seenIntonation = new Set<string>();
      const pool = shuffle(rng, rows).filter((r) => (seenIntonation.has(r.intonation) ? false : (seenIntonation.add(r.intonation), true)));
      const tokens = shuffle(rng, pool.map((r, i) => ({ id: `p${i}`, label: r.type })));
      const targets = shuffle(rng, pool.map((r, i) => ({ id: `p${i}`, label: `${r.intonation} intonation` })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_r, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "sentence type to its intonation"),
        tokens,
        targets,
        correctMap,
        hint: "Only yes/no questions and polite offers rise.",
        explanation: "Rising: yes/no questions, polite offers. Falling: statements, commands, wh-questions.",
      };
    }
    const s = randChoice(rng, SENTENCES);
    const words = s.text.replace(/[?.]/g, "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    items.push({ id: "mark", label: s.text.includes("?") ? "?" : "." });
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the words and the mark to make this sentence"),
      instruction: "Click the words and the punctuation mark in the correct order.",
      items: shuffle(rng, items),
      correctOrder: [...words.map((w, i) => `${i}-${w}`), "mark"],
      hint: s.text.includes("?") ? "A question ends with a question mark, and your voice may rise." : "A statement or command ends with a full stop, and your voice falls.",
      explanation: `Correct: "${s.text}" — said with ${s.intonation} intonation.`,
    };
  },
};
