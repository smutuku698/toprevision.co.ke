import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, soundFillBranch } from "./g5LsShared";
import { sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 3.0 Etiquette-Table Manners, sub-strand 3.1 Pronunciation and Vocabulary —
// Polite Words, Phrases and Expressions. Focus: sound /ɔɪ/, identify and use polite words/phrases,
// compliment others, recommend polite phrasing. See curriculum-reference/grade-5/english.json.

const POLITE: { phrase: string; use: string }[] = [
  { phrase: "Please", use: "when you ask for something" },
  { phrase: "Thank you", use: "when someone helps you or gives you something" },
  { phrase: "Excuse me", use: "when you need to interrupt or pass by" },
  { phrase: "I beg your pardon", use: "when you did not hear and want it repeated" },
  { phrase: "May I", use: "when you ask permission" },
  { phrase: "You are welcome", use: "when someone thanks you" },
  { phrase: "I am sorry", use: "when you have done something wrong" },
  { phrase: "That was delicious, thank you", use: "when you praise a meal your host made" },
  { phrase: "Would you mind passing the salt", use: "when you politely ask for something at the table" },
  { phrase: "No, thank you", use: "when you refuse something politely" },
];

const RUDE_VS_POLITE: { rude: string; polite: string }[] = [
  { rude: "Give me the bread.", polite: "Could you pass the bread, please?" },
  { rude: "Move, you are in my way.", polite: "Excuse me, may I pass?" },
  { rude: "What? Say it again.", polite: "I beg your pardon — could you repeat that?" },
  { rude: "I don't want that.", polite: "No, thank you." },
  { rude: "This food is not nice.", polite: "Thank you for the meal; I am quite full now." },
];

const COMPLIMENTS = [
  "That was a wonderful meal — thank you for cooking it.",
  "You set the table beautifully.",
  "Thank you for waiting for everyone before we started.",
  "Your manners at the table were very good today.",
];

export const politeWordsExpressions: Skill = {
  id: "g5-eng-ls-polite-words-expressions",
  code: "LS.3",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Polite Words, Phrases and Expressions",
  description: "Recognise the sound /ɔɪ/, and choose polite words, phrases and expressions for asking, thanking, apologising, refusing and complimenting.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-fill", "choose-polite", "sort-register", "match-use", "reason-rewrite"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/ɔɪ/"]);
    if (branch === "sound-fill") return soundFillBranch(rng, "/ɔɪ/", "polite");

    if (branch === "choose-polite") {
      const p = randChoice(rng, POLITE);
      const wrong = shuffle(rng, POLITE.filter((x) => x.phrase !== p.phrase)).slice(0, 3).map((x) => x.phrase);
      const { choices, correctIndex } = mcFromCluster(rng, p.phrase, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `You want to be polite ${p.use}.`, "Which expression fits best?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Match the polite phrase to the exact situation.",
        explanation: `"${p.phrase}" is used ${p.use}.`,
      };
    }

    if (branch === "sort-register") {
      const pool = shuffle(rng, RUDE_VS_POLITE).slice(0, 3);
      const items = shuffle(rng, pool.flatMap((r, i) => [
        { id: `r${i}`, label: r.rude, kind: "rude" },
        { id: `p${i}`, label: r.polite, kind: "polite" },
      ])).slice(0, 6);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each way of speaking is polite or rude"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "polite", label: "Polite" },
          { id: "rude", label: "Rude" },
        ],
        correctBucket,
        hint: "Polite speech uses 'please', 'could you', 'excuse me', 'thank you' and a gentle tone.",
        explanation: "A polite request softens an order with words like 'please', 'may I' and 'would you mind'.",
      };
    }

    if (branch === "match-use") {
      const pool = shuffle(rng, POLITE).slice(0, 5);
      const tokens = shuffle(rng, pool.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, pool.map((p) => ({ id: p.phrase, label: p.use })));
      const correctMap: Record<string, string> = {};
      pool.forEach((p) => (correctMap[p.phrase] = p.phrase));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "polite expression to when you use it"),
        tokens,
        targets,
        correctMap,
        hint: "Each phrase has its own moment: asking, thanking, apologising, refusing, praising.",
        explanation: pool.map((p) => `"${p.phrase}": ${p.use}`).join("  "),
      };
    }

    // reason-rewrite / ordering
    if (rng() < 0.5) {
      const r = randChoice(rng, RUDE_VS_POLITE);
      const { choices, correctIndex } = mcFromCluster(rng, r.polite, shuffle(rng, RUDE_VS_POLITE.filter((x) => x.polite !== r.polite)).slice(0, 2).map((x) => x.polite).concat([r.rude]), 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `Someone says rudely: "${r.rude}"`, "Which is the polite way to say the same thing?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Keep the meaning, but add polite words and a softer tone.",
        explanation: `"${r.polite}" is the polite version.`,
      };
    }
    const c = randChoice(rng, COMPLIMENTS);
    const words = c.replace(/[—.]/g, "").replace(/\s+/g, " ").trim().split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the words to make a polite compliment"),
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "A compliment names the good thing and thanks or praises the person.",
      explanation: `Polite compliment: "${c}"`,
    };
  },
};
