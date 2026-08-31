import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SENTENCE_TYPES: { text: string; type: "affirmative" | "negative" }[] = [
  { text: "Maasai Mara hosts the great wildebeest migration every year.", type: "affirmative" },
  { text: "Tourists visit Fort Jesus to learn about coastal history.", type: "affirmative" },
  { text: "Lake Nakuru is famous for its flocks of flamingos.", type: "affirmative" },
  { text: "Hell's Gate National Park allows visitors to cycle among the wildlife.", type: "affirmative" },
  { text: "Diani Beach attracts many visitors with its white sand.", type: "affirmative" },
  { text: "Nairobi National Park does not allow visitors to feed the animals.", type: "negative" },
  { text: "Tourists should never leave litter inside the conservancy.", type: "negative" },
  { text: "Fort Jesus is not open to visitors after six in the evening.", type: "negative" },
  { text: "Mount Kenya has no direct road to its highest peak.", type: "negative" },
  { text: "None of the tour guides recommend swimming in the hippo pool.", type: "negative" },
];

const TYPE_MC: { text: string; correct: string }[] = [
  { text: "Maasai Mara hosts the great wildebeest migration every year.", correct: "Affirmative statement" },
  { text: "Nairobi National Park does not allow visitors to feed the animals.", correct: "Negative statement" },
  { text: "Diani Beach attracts many visitors with its white sand.", correct: "Affirmative statement" },
  { text: "Mount Kenya has no direct road to its highest peak.", correct: "Negative statement" },
  { text: "Lake Nakuru is famous for its flocks of flamingos.", correct: "Affirmative statement" },
  { text: "Tourists should never leave litter inside the conservancy.", correct: "Negative statement" },
];
const TYPE_CHOICES = ["Affirmative statement", "Negative statement", "Interrogative (question) sentence", "Imperative (command) sentence"];

const CONVERT_FILL: { before: string; after: string; correctAnswer: string; clue: string }[] = [
  { before: "Visitors must ", after: " feed the monkeys at Hell's Gate National Park.", correctAnswer: "not", clue: "Insert the negative word that turns this rule into a prohibition." },
  { before: "Tourists are ", after: " allowed to light fires inside Maasai Mara.", correctAnswer: "not", clue: "Insert the word that makes this sentence negative." },
  { before: "There is ", after: " entry fee for children under three at most Kenyan parks.", correctAnswer: "no", clue: "Insert the negative word meaning 'not any'." },
  { before: "The guide said tourists should ", after: " leave the vehicle during a lion sighting.", correctAnswer: "never", clue: "Insert the negative word meaning 'not at any time'." },
  { before: "", after: " tourist is allowed past the marked boundary at Hell's Gate.", correctAnswer: "No", clue: "Insert the negative word meaning 'not a single'." },
  { before: "", after: " of the campsites near Amboseli permit open fires after dark.", correctAnswer: "None", clue: "Insert the negative word meaning 'not one'." },
];

const CONVERT_MC: { affirmative: string; correct: string; distractors: string[] }[] = [
  {
    affirmative: "Tourists can swim at Diani Beach.",
    correct: "Tourists cannot swim at Diani Beach.",
    distractors: [
      "Tourists can not never swim at Diani Beach.",
      "Tourists don't can swim at Diani Beach.",
      "Tourists cannot swims at Diani Beach.",
    ],
  },
  {
    affirmative: "Fort Jesus opens to visitors every day.",
    correct: "Fort Jesus does not open to visitors every day.",
    distractors: [
      "Fort Jesus not opens to visitors every day.",
      "Fort Jesus don't opens to visitors every day.",
      "Fort Jesus doesn't opened to visitors every day.",
    ],
  },
  {
    affirmative: "Lake Nakuru has many flamingos this season.",
    correct: "Lake Nakuru does not have many flamingos this season.",
    distractors: [
      "Lake Nakuru has not many flamingos this season.",
      "Lake Nakuru don't has many flamingos this season.",
      "Lake Nakuru doesn't has many flamingos this season.",
    ],
  },
  {
    affirmative: "Guides recommend an early start for the game drive.",
    correct: "Guides do not recommend an early start for the game drive.",
    distractors: [
      "Guides not recommend an early start for the game drive.",
      "Guides doesn't recommend an early start for the game drive.",
      "Guides don't recommends an early start for the game drive.",
    ],
  },
];

const MATCH_PAIRS: { affirmative: string; negative: string }[] = [
  { affirmative: "Maasai Mara hosts the wildebeest migration every year.", negative: "Maasai Mara does not host the wildebeest migration every year." },
  { affirmative: "Tourists can swim at Diani Beach.", negative: "Tourists cannot swim at Diani Beach." },
  { affirmative: "Fort Jesus opens to visitors every day.", negative: "Fort Jesus does not open to visitors every day." },
  { affirmative: "Hell's Gate allows cycling among the wildlife.", negative: "Hell's Gate does not allow cycling among the wildlife." },
  { affirmative: "Lake Nakuru has many flamingos this season.", negative: "Lake Nakuru does not have many flamingos this season." },
  { affirmative: "Guides recommend an early start for the game drive.", negative: "Guides do not recommend an early start for the game drive." },
];

export const affirmativeNegativeSentences: Skill = {
  id: "g7-eng-g-affirmative-negative-sentences",
  code: "G.15",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Affirmative and Negative Sentences",
  description: "Differentiate and construct affirmative and negative sentences using contexts about Kenyan tourist attraction sites.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "type-mc", "fill", "convert-mc", "match"] as const);

    if (branch === "categorize") {
      const affPick = shuffle(rng, SENTENCE_TYPES.filter((s) => s.type === "affirmative")).slice(0, 3);
      const negPick = shuffle(rng, SENTENCE_TYPES.filter((s) => s.type === "negative")).slice(0, 3);
      const chosen = shuffle(rng, [...affPick, ...negPick]);
      const buckets = [
        { id: "affirmative", label: "Affirmative sentence (a positive statement)" },
        { id: "negative", label: "Negative sentence (uses not/never/no/none, etc.)" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as affirmative or negative.",
        items,
        buckets,
        correctBucket,
        hint: "An affirmative sentence states that something is true or happens. A negative sentence denies it, using a word like not, never, no, or none.",
        explanation: chosen.map((s) => `"${s.text}" is a ${s.type} sentence.`).join(" "),
      };
    }

    if (branch === "type-mc") {
      const entry = randChoice(rng, TYPE_MC);
      const choices = shuffle(rng, TYPE_CHOICES);
      return {
        kind: "multiple-choice",
        prompt: `What kind of sentence is this? "${entry.text}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check whether the sentence makes a positive statement, denies something with a negative word, asks a question, or gives a command.",
        explanation: `"${entry.text}" is a${entry.correct.startsWith("A") ? "n" : ""} ${entry.correct.toLowerCase()}. It ${entry.correct === "Negative statement" ? "denies something using a negative word" : "makes a positive statement"}, and it is neither a question nor a command.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, CONVERT_FILL);
      return {
        kind: "fill-blank",
        prompt: entry.clue,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Negative sentences use words like not, no, never, or none to deny that something happens or is true.",
        explanation: `"${entry.correctAnswer}" fits here: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "convert-mc") {
      const entry = randChoice(rng, CONVERT_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correct negative form of this sentence? "${entry.affirmative}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "A correct negative sentence adds exactly one negative word and keeps a real, correctly conjugated verb form after it.",
        explanation: `"${entry.correct}" is correct. The other options either use two negative words together, leave out the helping verb 'do/does', or use the wrong verb form after it.`,
      };
    }

    const chosen = shuffle(rng, MATCH_PAIRS).slice(0, 6);
    const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.affirmative })));
    const targets = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.negative })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((p, i) => (correctMap[`p${i}`] = `p${i}`));
    return {
      kind: "click-match",
      prompt: "Match each affirmative sentence to its correct negative equivalent.",
      tokens,
      targets,
      correctMap,
      hint: "Look for the helping verb (do/does/can) and add 'not' to it, keeping the main verb in its base form.",
      explanation: chosen.map((p) => `"${p.affirmative}" negates to "${p.negative}"`).join(" "),
    };
  },
};
