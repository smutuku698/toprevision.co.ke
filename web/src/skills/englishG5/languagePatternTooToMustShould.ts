import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster, cap } from "./g5EngShared";

// KICD Grade 5 English, Theme 3.0 Etiquette-Table Manners, sub-strand 3.3 Language Pattern:
// (a) "too + adjective + to/for" and (b) "must/should + adverb/adverbial".
// See curriculum-reference/grade-5/english.json.

// (a) too...to/for — blank is the linking word. "too ADJ to VERB" -> "to"; "too ADJ for PERSON to VERB" -> "for".
const TOO_TPL: { before: string; after: string; answer: "to" | "for"; why: string }[] = [
  { before: "The soup is too hot ", after: " eat right now.", answer: "to", why: "no person is named before the verb, so use 'to'" },
  { before: "This chair is too small ", after: " Nanjala to sit on.", answer: "for", why: "a person (Nanjala) comes next, so use 'for ... to'" },
  { before: "The plate is too heavy ", after: " carry with one hand.", answer: "to", why: "no person is named, so use 'to'" },
  { before: "That story is too long ", after: " the children to finish before lunch.", answer: "for", why: "a person group (the children) comes next, so use 'for ... to'" },
  { before: "He spoke too fast ", after: " be understood.", answer: "to", why: "no person is named, so use 'to'" },
  { before: "The stew is too salty ", after: " me to enjoy.", answer: "for", why: "a person (me) comes next, so use 'for ... to'" },
  { before: "She was too shy ", after: " ask for a second helping.", answer: "to", why: "no person is named, so use 'to'" },
  { before: "The table is too high ", after: " the toddler to reach.", answer: "for", why: "a person (the toddler) comes next, so use 'for ... to'" },
  { before: "The bread was too stale ", after: " eat.", answer: "to", why: "no person is named, so use 'to'" },
  { before: "The queue was too long ", after: " us to wait in.", answer: "for", why: "a person group (us) comes next, so use 'for ... to'" },
  { before: "The tea is too sweet ", after: " drink.", answer: "to", why: "no person is named, so use 'to'" },
  { before: "The chapati was too big ", after: " Baraka to finish.", answer: "for", why: "a person (Baraka) comes next, so use 'for ... to'" },
];

// (b) must/should + adverb — MC with rude/odd but grammatical distractors (nameable wrong table manners).
const MUST_TPL: { before: string; after: string; answer: string; distractors: string[] }[] = [
  { before: "We must chew ", after: " at the table.", answer: "quietly", distractors: ["loudly", "noisily", "rudely"] },
  { before: "You should wash your hands ", after: " before every meal.", answer: "thoroughly", distractors: ["quickly", "rarely", "carelessly"] },
  { before: "We must speak ", after: " when others are still eating.", answer: "politely", distractors: ["loudly", "rudely", "sharply"] },
  { before: "You should sit ", after: " during dinner.", answer: "upright", distractors: ["sideways", "lazily", "slumped"] },
  { before: "We should serve the guests ", after: ", before ourselves.", answer: "first", distractors: ["last", "slowly", "quietly"] },
  { before: "We must eat ", after: ", not in a hurry.", answer: "slowly", distractors: ["greedily", "hurriedly", "messily"] },
  { before: "You should wait ", after: " until everyone is served.", answer: "patiently", distractors: ["impatiently", "loudly", "angrily"] },
  { before: "We must cover our mouth ", after: " when we cough at the table.", answer: "always", distractors: ["never", "rarely", "sometimes"] },
  { before: "You should place your cutlery ", after: " on the plate when you finish.", answer: "neatly", distractors: ["carelessly", "loudly", "roughly"] },
  { before: "We should say 'thank you' ", after: " after a meal.", answer: "politely", distractors: ["loudly", "rarely", "grudgingly"] },
  { before: "You should pass the salt ", after: " when someone asks for it.", answer: "promptly", distractors: ["slowly", "grudgingly", "loudly"] },
  { before: "We must close our mouth ", after: " while chewing.", answer: "completely", distractors: ["partly", "loudly", "rarely"] },
];

export const languagePatternTooToMustShould: Skill = {
  id: "g5-eng-grammar-too-to-must-should",
  code: "LU.3",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Language Patterns: too...to/for; must/should + adverb",
  description: "Use the patterns 'too + adjective + to/for' and 'must/should + adverb' correctly in sentences about polite behaviour at the table.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-adverb", "fill-connective", "sort", "match", "order", "reason"] as const);

    if (branch === "mc-adverb") {
      const t = randChoice(rng, MUST_TPL);
      const { choices, correctIndex } = mcFromCluster(rng, t.answer, t.distractors);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the adverb that gives polite advice")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "'must' and 'should' give advice or rules. The adverb should describe the polite way to do the action.",
        explanation: `"${t.answer}" is correct — it describes good table manners. The wrong choices are real words, but they describe rude or careless behaviour, so they do not fit advice given with 'must' or 'should'.`,
      };
    }

    if (branch === "fill-connective") {
      const t = randChoice(rng, TOO_TPL);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the linking word ('to' or 'for') in this 'too...' sentence"),
        before: t.before,
        after: t.after,
        correctAnswer: t.answer,
        acceptedAnswers: [t.answer],
        inputMode: "text",
        hint: "If a person is named right after the blank, use 'for'. If a verb comes next with no person, use 'to'.",
        explanation: `"${t.answer}" is correct — ${t.why}. Full sentence: "${cap((t.before + t.answer + t.after).trim())}"`,
      };
    }

    if (branch === "sort") {
      const tooItems = shuffle(rng, TOO_TPL).slice(0, 3).map((t, i) => ({ id: `t${i}`, label: (t.before + t.answer + t.after).trim(), kind: "too" }));
      const mustItems = shuffle(rng, MUST_TPL).slice(0, 3).map((t, i) => ({ id: `m${i}`, label: (t.before + t.answer + t.after).trim(), kind: "must" }));
      const items = shuffle(rng, [...tooItems, ...mustItems]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which language pattern each sentence uses"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "too", label: "too + adjective + to/for" },
          { id: "must", label: "must/should + adverb" },
        ],
        correctBucket,
        hint: "Look for the word 'too' followed by an adjective, or the words 'must'/'should' followed by an adverb.",
        explanation: "'too...to/for' shows that something cannot happen because of the amount ('too hot to eat'). 'must/should + adverb' gives advice about the way to do something ('chew quietly').",
      };
    }

    if (branch === "match") {
      const seenAnswers = new Set<string>();
      const pool = shuffle(rng, MUST_TPL).filter((t) => (seenAnswers.has(t.answer) ? false : (seenAnswers.add(t.answer), true))).slice(0, 5);
      const tokens = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: (t.before + "___" + t.after).trim() })));
      const targets = shuffle(rng, pool.map((t, i) => ({ id: `p${i}`, label: t.answer })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_t, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "sentence to the adverb that completes it politely"),
        tokens,
        targets,
        correctMap,
        hint: "Read each sentence and picture the polite way to do the action.",
        explanation: pool.map((t) => `"${(t.before + t.answer + t.after).trim()}"`).join("  "),
      };
    }

    if (branch === "order") {
      const useToo = rng() < 0.5;
      const t = useToo ? randChoice(rng, TOO_TPL) : randChoice(rng, MUST_TPL);
      const sentence = (t.before + t.answer + t.after).trim().replace(/[.?]$/, "");
      const words = sentence.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: useToo ? "The pattern is: subject + is/was + too + adjective + to/for..." : "The pattern is: subject + must/should + verb + adverb...",
        explanation: `Correct sentence: "${cap(sentence)}."`,
      };
    }

    // reason — Evaluate: which sentence gives the advice correctly using the pattern?
    const scen: { s: string; correct: string; wrong: string[]; why: string }[] = [
      {
        s: `${name(rng)} keeps talking with food in the mouth at the dinner table.`,
        correct: "You should chew quietly with your mouth closed.",
        wrong: ["You should chew loudly at the table.", "You must talk quickly while eating.", "You should keep your mouth open while chewing."],
        why: "'should + adverb (quietly)' gives polite advice; the others describe or advise rude behaviour.",
      },
      {
        s: `The stew that ${name(rng)} served is far too salty.`,
        correct: "The stew is too salty for me to enjoy.",
        wrong: ["The stew is too salty to me enjoy.", "The stew is too salty for enjoy.", "The stew is too salty me to enjoy."],
        why: "the pattern is 'too + adjective + for + person + to + verb'.",
      },
      {
        s: `A guest is still waiting to be served at ${name(rng)}'s home.`,
        correct: "We should serve the guests first.",
        wrong: ["We should serve the guests last.", "We must serve ourselves quickly first.", "We should serve the guests rudely."],
        why: "'should + adverbial (first)' gives the polite rule; the others advise bad manners.",
      },
      {
        s: `The chapati on ${name(rng)}'s plate is much bigger than she can eat.`,
        correct: "The chapati is too big for her to finish.",
        wrong: ["The chapati is too big her to finish.", "The chapati is too big to her finish.", "The chapati is big too for her to finish."],
        why: "'too' comes before the adjective, then 'for + person + to + verb'.",
      },
      {
        s: `${name(rng)} did not wash his hands before sitting down to eat.`,
        correct: "You must wash your hands thoroughly before a meal.",
        wrong: ["You must wash your hands carelessly before a meal.", "You should wash your hands rarely before a meal.", "You must not wash your hands before a meal."],
        why: "'must + adverb (thoroughly)' gives the hygiene rule correctly.",
      },
      {
        s: `The porridge ${name(rng)} was given is still boiling.`,
        correct: "The porridge is too hot to eat.",
        wrong: ["The porridge is too hot for eat.", "The porridge is hot too to eat.", "The porridge is too hot to eating."],
        why: "with no person named, the pattern is 'too + adjective + to + verb'.",
      },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which sentence uses the pattern correctly?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Check the word order: 'too + adjective + to/for' and 'must/should + verb + adverb'.",
      explanation: `"${sc.correct}" is correct — ${sc.why}`,
    };
  },
};
