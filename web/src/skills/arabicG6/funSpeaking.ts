import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { MADDA_WORDS, SPORT_VOCAB, name, place } from "./shared";

// Sub-strand 1.5 Listening for Gist: Attentive Listening — Theme: Fun and Enjoyment.
// Content: identifying games and sports from an oral text, long vowel (madda) pronunciation, and
// simple sentences expressing likes/dislikes (source example register: "I like/love..., I don't
// like/love...").

const MADDA_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which sign shows that a vowel sound should be held LONG rather than short?", correct: "madda", distractors: ["fatha", "sukun", "tanween"], explanation: "madda is a mark that elongates a vowel sound (typically a long 'aa')." },
  { question: `In the word "${MADDA_WORDS[0]}" (door), which mark shows the long 'aa' sound?`, correct: "madda", distractors: ["kasra", "damma", "shaddah"], explanation: `"${MADDA_WORDS[0]}" has a long vowel mark (madda) giving its 'aa' sound.` },
  { question: `In the word "${MADDA_WORDS[1]}" (book), which mark shows the long 'aa' sound?`, correct: "madda", distractors: ["sukun", "fatha", "tanween"], explanation: `"${MADDA_WORDS[1]}" has a madda mark for its long 'aa' sound.` },
  { question: `In the word "${MADDA_WORDS[2]}" (peace), which mark shows the long 'aa' sound?`, correct: "madda", distractors: ["kasra", "shaddah", "damma"], explanation: `"${MADDA_WORDS[2]}" has a madda mark for its long 'aa' sound.` },
  { question: "Is madda the same as fatha, or something different?", correct: "different — madda elongates a vowel, fatha is a short vowel sign", distractors: ["exactly the same sign", "madda replaces fatha entirely", "madda is only used in numbers"], explanation: "madda shows vowel length, while fatha/kasra/damma show short vowel quality — different jobs." },
  { question: "When you take turns repeating sports-and-games words while focusing on madda, what should you listen for?", correct: "a held, long vowel sound", distractors: ["a short, clipped vowel sound", "no vowel sound at all", "a doubled consonant sound"], explanation: "madda words are pronounced with a long, held vowel." },
  { question: "Which of these example words has a long-vowel (madda) sound in it?", correct: MADDA_WORDS[3], distractors: ["kayfa", "shukran", "ijlis"], explanation: `"${MADDA_WORDS[3]}" contains a madda-marked long vowel.` },
  { question: "How does pronouncing a madda word differ from pronouncing a plain fatha word?", correct: "the madda word's vowel is held longer", distractors: ["there is no difference at all", "the madda word is always louder", "the madda word has no vowel"], explanation: "The key difference is vowel length — madda vowels are held longer." },
  { question: "Why does correct madda pronunciation matter for fluency?", correct: "shortening a long vowel can make a word harder to understand or sound wrong", distractors: ["it has no effect on meaning or fluency", "it only matters in written spelling", "it is optional and never checked"], explanation: "Vowel length affects clarity and correctness of pronunciation." },
  { question: "Madda is typically written as which kind of mark?", correct: "a wavy or tilde-like mark above the elongated letter", distractors: ["a small circle below the letter", "a dot beside the word", "a doubled letter with no mark"], explanation: "madda is written as a small wavy mark showing vowel elongation." },
];

const LIKE_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu kurat al-qadam." What is ${n} expressing?`,
    correct: "liking football",
    distractors: ["disliking football", "liking swimming", "disliking swimming"],
    explanation: `"Uhibbu kurat al-qadam" means "I like football".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Laa uhibbu al-shatranj." What is ${n} expressing?`,
    correct: "disliking chess",
    distractors: ["liking chess", "liking basketball", "disliking basketball"],
    explanation: `"Laa uhibbu al-shatranj" means "I don't like chess" — "laa" negates the liking.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-sibaha akthar min al-jary." What is ${n} comparing?`,
    correct: "preferring swimming over running",
    distractors: ["preferring running over swimming", "disliking both", "liking neither"],
    explanation: `"Uhibbu al-sibaha akthar min al-jary" means "I like swimming more than running".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu kurat al-salla jiddan." How strongly does ${n} like basketball?`,
    correct: "very much",
    distractors: ["only a little", "not at all", "the sentence does not say"],
    explanation: `"jiddan" means "very much" — intensifying "Uhibbu" (I like).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Laa uhibbu al-darraja, lakin uhibbu kurat al-tawira." What does ${n} like?`,
    correct: "volleyball, not cycling",
    distractors: ["cycling, not volleyball", "both equally", "neither"],
    explanation: `The sentence means "I don't like cycling, but I like volleyball" — "lakin" means "but".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} asks a friend "Hal tuhibbu al-sibaq?" What is ${n} asking?`,
    correct: "do you like racing?",
    distractors: ["I like racing", "I don't like racing", "let's race now"],
    explanation: `"Hal tuhibbu al-sibaq?" means "Do you like racing?" — "hal" marks a yes/no question.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-li'b bi habl al-qafz." What does ${n} like?`,
    correct: "skipping rope",
    distractors: ["chess", "swimming", "cycling"],
    explanation: `"Uhibbu al-li'b bi habl al-qafz" means "I like playing with the skipping rope".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Laa uhibbu al-qafz al-'aali." What does ${n} dislike?`,
    correct: "high jumping",
    distractors: ["football", "swimming", "chess"],
    explanation: `"Laa uhibbu al-qafz al-'aali" means "I don't like high jumping".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-riyada bishakl 'aam." What is ${n} expressing?`,
    correct: "liking sport/exercise in general",
    distractors: ["disliking sport in general", "liking only chess", "disliking chess only"],
    explanation: `"Uhibbu al-riyada bishakl 'aam" means "I like sport/exercise in general".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Sadeeqi yuhibbu kurat al-qadam, lakinnani uhibbu al-sibaha." What is being contrasted?`,
    correct: `${n}'s friend likes football, but ${n} likes swimming`,
    distractors: [`Both like football`, `Both like swimming`, `Neither likes any sport`],
    explanation: `"lakinnani" (but I) signals a contrast between the friend's preference and ${n}'s own preference.`,
  }),
];

const SPORT_CATEGORY: { word: string; type: "Ball game" | "Other sport" }[] = [
  { word: "kurat al-qadam", type: "Ball game" },
  { word: "kurat al-salla", type: "Ball game" },
  { word: "kurat al-tawira", type: "Ball game" },
  { word: "sibaha", type: "Other sport" },
  { word: "jary", type: "Other sport" },
  { word: "qafz", type: "Other sport" },
  { word: "darraja", type: "Other sport" },
  { word: "shatranj", type: "Other sport" },
  { word: "habl al-qafz", type: "Other sport" },
  { word: "sibaq", type: "Other sport" },
];

const ROUTINES: { sport: string; steps: string[] }[] = SPORT_VOCAB.slice(0, 6).map((s) => ({
  sport: s.word,
  steps: [
    "irtidi malabis riyadiya (put on sports kit)",
    "qum bi-tasakhun (warm up)",
    `il'ab ${s.word} (play ${s.meaning})`,
    "istarih (rest / cool down)",
  ],
}));

export const funSpeaking: Skill = {
  id: "g6-ar-ls-fun",
  code: "LS.5",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Listening for gist: attentive listening (fun and enjoyment)",
  description: "Identify games and sports from spoken descriptions, practise long-vowel (madda) pronunciation, and express likes and dislikes about sports.",
  generate(rng) {
    const branch = randChoice(rng, ["madda", "likes", "match", "categorize", "ordering"] as const);

    if (branch === "madda") {
      const q = randChoice(rng, MADDA_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "madda marks a long, held vowel sound — different from the short fatha/kasra/damma signs.",
        explanation: q.explanation,
      };
    }

    if (branch === "likes") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, LIKE_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "'Uhibbu' means 'I like/love'; 'Laa uhibbu' means 'I don't like/love'.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SPORT_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each sport or game to its meaning.",
          "Match the spoken sport/game word to what it means.",
          "Which meaning goes with which sport?",
          "Pair each sport/game word with its correct meaning.",
          "Match each word you hear to its sport meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen2 = shuffle(rng, SPORT_CATEGORY).slice(0, 7);
      const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "Sort each sport/game: Ball game, or Other sport?",
          "Group these sports by ball game vs other sport.",
          "Which category does each sport belong to?",
          "Sort each sport/game word into the correct category.",
          "Classify each sport or game below.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Ball game", label: "Ball game" },
          { id: "Other sport", label: "Other sport" },
        ],
        correctBucket,
        hint: "Football, basketball, and volleyball are ball games; the rest are not.",
        explanation: chosen2.map((c) => `"${c.word}" is a${c.type === "Other sport" ? "n" : ""} ${c.type.toLowerCase()}.`).join(" "),
      };
    }

    const set = randChoice(rng, ROUTINES);
    const items = shuffle(rng, set.steps.map((s, i) => ({ id: `${i}-${s}`, label: s })));
    return {
      kind: "ordering",
      prompt: randChoice(rng, [
        `Put these steps for playing ${set.sport} in the correct order.`,
        `Arrange this sports routine in the order you'd follow it.`,
        `Sequence these steps as they would naturally happen before and after playing.`,
        `Order these steps correctly.`,
        `Which order makes sense for getting ready to play and cooling down?`,
      ]),
      instruction: "Click the steps in the correct order.",
      items,
      correctOrder: set.steps.map((s, i) => `${i}-${s}`),
      hint: "You get ready, warm up, play, then rest — in that order.",
      explanation: `A natural order is:\n${set.steps.join("\n")}`,
    };
  },
};
