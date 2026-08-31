import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 13.0 Money - Savings and Banking, sub-strand 13.4 Spelling:
// homophones; words with double consonants; words with double vowels.
// See curriculum-reference/grade-5/english.json.

const DOUBLE_CONS: { word: string; wrong: string }[] = [
  { word: "slipped", wrong: "sliped" }, { word: "clapping", wrong: "claping" }, { word: "carefully", wrong: "carefuly" },
  { word: "dropped", wrong: "droped" }, { word: "running", wrong: "runing" }, { word: "beginning", wrong: "begining" },
  { word: "hammer", wrong: "hamer" }, { word: "dinner", wrong: "diner" }, { word: "ladder", wrong: "lader" },
  { word: "bottle", wrong: "botle" }, { word: "little", wrong: "litle" }, { word: "address", wrong: "adress" },
  { word: "borrow", wrong: "borow" }, { word: "sudden", wrong: "suden" }, { word: "village", wrong: "vilage" },
  { word: "yellow", wrong: "yelow" }, { word: "button", wrong: "buton" }, { word: "common", wrong: "comon" },
];
const DOUBLE_VOW: { word: string; wrong: string }[] = [
  { word: "book", wrong: "bok" }, { word: "cook", wrong: "cok" }, { word: "moon", wrong: "mon" },
  { word: "food", wrong: "fod" }, { word: "tooth", wrong: "toth" }, { word: "spoon", wrong: "spon" },
  { word: "wood", wrong: "wod" }, { word: "green", wrong: "gren" }, { word: "sleep", wrong: "slep" },
  { word: "keep", wrong: "kep" }, { word: "week", wrong: "wek" }, { word: "need", wrong: "ned" },
  { word: "feel", wrong: "fel" }, { word: "wheel", wrong: "whel" }, { word: "cheese", wrong: "chese" },
  { word: "agree", wrong: "agre" }, { word: "balloon", wrong: "baloon" }, { word: "three", wrong: "thre" },
];
const HOMOPHONES: { sentence: string; answer: string; other: string; meaning: string }[] = [
  { sentence: "Do not ___ money you cannot pay back.", answer: "waste", other: "waist", meaning: "use carelessly" },
  { sentence: "The tailor measured her ___ for the new skirt.", answer: "waist", other: "waste", meaning: "the middle of the body" },
  { sentence: "The teller counted the notes ___.", answer: "aloud", other: "allowed", meaning: "out loud, so others can hear" },
  { sentence: "Children are not ___ inside the bank vault.", answer: "allowed", other: "aloud", meaning: "permitted" },
  { sentence: "She wrote her name on the ___ to withdraw cash.", answer: "cheque", other: "check", meaning: "a written money order" },
  { sentence: "The manager will ___ the balance for you.", answer: "check", other: "cheque", meaning: "look at to make sure" },
  { sentence: "He put the coins in a metal ___.", answer: "safe", other: "save", meaning: "a strong lockable box" },
  { sentence: "It is wise to ___ some money each month.", answer: "save", other: "safe", meaning: "keep for later" },
  { sentence: "The bank is ___ the market on Main Street.", answer: "by", other: "buy", meaning: "next to" },
  { sentence: "She saved enough to ___ a bicycle.", answer: "buy", other: "by", meaning: "pay money for" },
  { sentence: "The interest was added ___ the account.", answer: "to", other: "two", meaning: "onto / towards" },
  { sentence: "He opened ___ accounts, one for savings.", answer: "two", other: "to", meaning: "the number 2" },
];

export const spellingDoubleLetters: Skill = {
  id: "g5-eng-writing-spelling-double-letters",
  code: "W.13",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Spelling: Homophones, Double Consonants and Double Vowels",
  description: "Spell words with double consonants (slipped, address) and double vowels (book, agree), and choose the correct homophone for the meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-double", "fill-homophone", "sort-double", "match-homophone", "order", "reason"] as const);

    if (branch === "mc-double") {
      const useVow = rng() < 0.5;
      const w = useVow ? randChoice(rng, DOUBLE_VOW) : randChoice(rng, DOUBLE_CONS);
      const { choices, correctIndex } = mcFromCluster(rng, w.word, [w.wrong], 1);
      return {
        kind: "multiple-choice",
        prompt: choosePrompt(rng, `the correct spelling (${useVow ? "double vowel" : "double consonant"})`),
        choices,
        correctIndex,
        layout: "row",
        hint: useVow ? "Some sounds need two vowels together: oo, ee." : "When a short word adds -ed or -ing, the last consonant is often doubled (slip → slipped).",
        explanation: `"${w.word}" is correct. A common error is "${w.wrong}" — ${useVow ? "leaving out one of the double vowels" : "not doubling the consonant"}.`,
      };
    }

    if (branch === "fill-homophone") {
      const h = randChoice(rng, HOMOPHONES);
      const [before, after] = h.sentence.split("___");
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the homophone meaning "${h.meaning}"`),
        before,
        after,
        correctAnswer: h.answer,
        acceptedAnswers: [h.answer],
        inputMode: "text",
        hint: `The other spelling, "${h.other}", sounds the same but has a different meaning.`,
        explanation: `"${h.answer}" (${h.meaning}) is correct. Full sentence: "${h.sentence.replace("___", h.answer)}"`,
      };
    }

    if (branch === "sort-double") {
      const cons = shuffle(rng, DOUBLE_CONS).slice(0, 4).map((w) => w.word);
      const vow = shuffle(rng, DOUBLE_VOW).slice(0, 4).map((w) => w.word);
      const items = shuffle(rng, [
        ...cons.map((w, i) => ({ id: `c${i}`, label: w, kind: "cons" })),
        ...vow.map((w, i) => ({ id: `v${i}`, label: w, kind: "vow" })),
      ]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each word has a double consonant or a double vowel"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "cons", label: "Double consonant (ll, pp, dd, mm...)" },
          { id: "vow", label: "Double vowel (oo, ee)" },
        ],
        correctBucket,
        hint: "Consonants are letters like b, c, d, l, m, p. Vowels are a, e, i, o, u.",
        explanation: "Double consonants: slipped, hammer, address, village. Double vowels: book, moon, green, agree.",
      };
    }

    if (branch === "match-homophone") {
      const pool = shuffle(rng, HOMOPHONES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((h, i) => ({ id: `p${i}`, label: h.meaning })));
      const targets = shuffle(rng, pool.map((h, i) => ({ id: `p${i}`, label: h.answer })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_h, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "meaning to the correctly spelt homophone"),
        tokens,
        targets,
        correctMap,
        hint: "Two words can sound the same — the meaning tells you which spelling to use.",
        explanation: pool.map((h) => `"${h.answer}" = ${h.meaning}`).join("  "),
      };
    }

    if (branch === "order") {
      const h = randChoice(rng, HOMOPHONES);
      const full = h.sentence.replace("___", h.answer).replace(/\.$/, "");
      const words = full.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The sentence uses "${h.answer}" (${h.meaning}).`,
        explanation: `Correct sentence: "${full}."`,
      };
    }

    // reason — Evaluate: spot the misspelt word in a short banking note.
    const w1 = randChoice(rng, DOUBLE_CONS);
    const w2 = randChoice(rng, DOUBLE_VOW.filter((v) => v.word !== "book"));
    const options = shuffle(rng, [
      { text: `I ${w1.wrong} the coin and it rolled under the counter.`, ok: false, fix: `${w1.wrong} → ${w1.word}` },
      { text: `She keeps her savings in a small ${w2.word} box.`, ok: true, fix: "" },
      { text: `We agree to ${w2.wrong} the receipt for our records.`, ok: false, fix: `${w2.wrong} → ${w2.word}` },
      { text: `The teller counted the notes carefully.`, ok: true, fix: "" },
    ]);
    const correct = options.find((o) => o.ok)!.text;
    const { choices, correctIndex } = mcFromCluster(rng, correct, options.filter((o) => !o.ok).map((o) => o.text), 2);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, "A pupil writes a note about saving money.", "Which sentence has NO spelling mistake?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Check each word for a missing double letter.",
      explanation: `The correct sentence is "${correct}". The others each miss a double letter (${options.filter((o) => !o.ok).map((o) => o.fix).join("; ")}).`,
    };
  },
};
