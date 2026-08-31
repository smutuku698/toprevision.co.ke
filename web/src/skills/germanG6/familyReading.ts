import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FAMILY_VOCAB, NUMBERS, name, umlautAccepted } from "./shared";

// Reading strand, Theme 2: Family (nuclear family) — guided reading/skimming for family-member
// vocabulary and ages, drawn from FAMILY_VOCAB and NUMBERS (20-100 tens plus sample compounds).

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const AGE_WORDS = NUMBERS.filter((n) => n.num >= 30 && n.num <= 60);

const DIALOGUE_SKELETONS: ((a: string, b: string, fatherAge: { num: number; word: string }, motherAge: { num: number; word: string }) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b, fatherAge, motherAge) => ({
    lines: [`${a}: Das ist mein Vater. Er ist ${fatherAge.word} Jahre alt.`, `${b}: Wie alt ist deine Mutter?`, `${a}: Meine Mutter ist ${motherAge.word} Jahre alt.`, `${b}: Hast du Geschwister?`, `${a}: Ja, ich habe eine Schwester und einen Bruder.`, `${b}: Deine Familie ist groß!`],
    qa: [
      { q: `How old is ${a}'s father, according to the passage?`, correct: `${fatherAge.word} Jahre alt`, distractors: [`${motherAge.word} Jahre alt`, "Zehn Jahre alt", "Der Text sagt es nicht"], explanation: `${a} says "Das ist mein Vater. Er ist ${fatherAge.word} Jahre alt."` },
      { q: `What does ${b} ask right after hearing about ${a}'s father?`, correct: "Wie alt ist deine Mutter? (how old is your mother?)", distractors: ["Wie heißt du? (what is your name?)", "Hast du Geschwister? (do you have siblings?)", "Wo ist deine Familie? (where is your family?)"], explanation: `${b} asks "Wie alt ist deine Mutter?"` },
      { q: `Which siblings does ${a} mention?`, correct: "One sister and one brother", distractors: ["Two sisters", "Two brothers", "No siblings"], explanation: `${a} says "ich habe eine Schwester und einen Bruder".` },
    ],
  }),
  (a, b, fatherAge, motherAge) => ({
    lines: [`${a}: Ich zeige dir ein Foto meiner Familie.`, `${b}: Wer ist das?`, `${a}: Das ist meine Mutter. Sie ist ${motherAge.word} Jahre alt.`, `${b}: Und wer ist das?`, `${a}: Das ist mein Großvater. Er wohnt bei uns.`, `${b}: Wie alt bist du?`, `${a}: Ich bin zwölf Jahre alt.`],
    qa: [
      { q: "What does the passage begin with?", correct: `${a} showing ${b} a family photo`, distractors: [`${b} showing ${a} a family photo`, "A greeting only", "A question about school"], explanation: `${a} says "Ich zeige dir ein Foto meiner Familie."` },
      { q: `How old is ${a}'s mother?`, correct: `${motherAge.word} Jahre alt`, distractors: [`${fatherAge.word} Jahre alt`, "Zwölf Jahre alt", "Der Text sagt es nicht"], explanation: `${a} says "Sie ist ${motherAge.word} Jahre alt."` },
      { q: `Who lives with ${a}'s family, according to the passage?`, correct: "Der Großvater (the grandfather)", distractors: ["Die Großmutter (the grandmother)", "Der Onkel (the uncle)", "Die Tante (the aunt)"], explanation: `${a} says "Das ist mein Großvater. Er wohnt bei uns."` },
    ],
  }),
  (a, b, fatherAge, motherAge) => ({
    lines: [`${a}: Wie alt ist dein Vater?`, `${b}: Mein Vater ist ${fatherAge.word} Jahre alt.`, `${a}: Hast du eine große Familie?`, `${b}: Ja, ich habe zwei Cousins und eine Tante.`, `${a}: Wie heißt deine Tante?`, `${b}: Sie heißt Grace.`],
    qa: [
      { q: `Who asks about ${b}'s father's age first?`, correct: a, distractors: [b, "Neither", "Both at the same time"], explanation: `${a} opens with "Wie alt ist dein Vater?"` },
      { q: `How old is ${b}'s father?`, correct: `${fatherAge.word} Jahre alt`, distractors: [`${motherAge.word} Jahre alt`, "Fünfzig Jahre alt", "Der Text sagt es nicht"], explanation: `${b} says "Mein Vater ist ${fatherAge.word} Jahre alt."` },
      { q: `Which relatives does ${b} mention besides parents?`, correct: "Two male cousins and an aunt", distractors: ["Two sisters", "A grandmother only", "No other relatives"], explanation: `${b} says "ich habe zwei Cousins und eine Tante".` },
    ],
  }),
  (a, b, fatherAge, motherAge) => ({
    lines: [`${a}: Das ist meine Schwester. Sie heißt Joy.`, `${b}: Hast du auch einen Bruder?`, `${a}: Ja, mein Bruder heißt Kevin.`, `${b}: Wie alt ist deine Mutter?`, `${a}: Meine Mutter ist ${motherAge.word} Jahre alt. Mein Vater ist ${fatherAge.word} Jahre alt.`, `${b}: Deine Eltern sind nicht sehr alt!`],
    qa: [
      { q: `What is ${a}'s sister's name?`, correct: "Joy", distractors: ["Kevin", "Grace", "The name is not given"], explanation: `${a} says "Das ist meine Schwester. Sie heißt Joy."` },
      { q: `What is ${a}'s brother's name?`, correct: "Kevin", distractors: ["Joy", "Dennis", "The name is not given"], explanation: `${a} says "mein Bruder heißt Kevin."` },
      { q: `Who is older, according to the passage: ${a}'s mother or father?`, correct: fatherAge.num > motherAge.num ? "The father" : motherAge.num > fatherAge.num ? "The mother" : "They are the same age", distractors: [fatherAge.num > motherAge.num ? "The mother" : "The father", "The passage does not give ages", "The grandmother"], explanation: `The mother is ${motherAge.word} and the father is ${fatherAge.word} — ${fatherAge.num > motherAge.num ? "the father is older" : motherAge.num > fatherAge.num ? "the mother is older" : "they are the same age"}.` },
    ],
  }),
  (a, b, fatherAge, motherAge) => ({
    lines: [`${a}: Ich habe eine Tante und einen Onkel.`, `${b}: Wie heißen deine Eltern?`, `${a}: Mein Vater heißt Otieno. Meine Mutter heißt Peris.`, `${b}: Wie alt ist deine Großmutter?`, `${a}: Meine Großmutter ist sehr alt. Sie ist ${motherAge.num + 20} Jahre alt.`, `${b}: Deine Familie ist interessant!`],
    qa: [
      { q: `What is ${a}'s father's name in the passage?`, correct: "Otieno", distractors: ["Peris", "Kevin", "The name is not given"], explanation: `${a} says "Mein Vater heißt Otieno."` },
      { q: `What is ${a}'s mother's name in the passage?`, correct: "Peris", distractors: ["Otieno", "Joy", "The name is not given"], explanation: `${a} says "Meine Mutter heißt Peris."` },
      { q: `How old is ${a}'s grandmother?`, correct: `${motherAge.num + 20} Jahre alt`, distractors: [`${motherAge.word} Jahre alt`, `${fatherAge.word} Jahre alt`, "Zehn Jahre alt"], explanation: `${a} says the grandmother is "${motherAge.num + 20} Jahre alt".` },
    ],
  }),
];

const MATCH_POOL = FAMILY_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a family passage, 'father' is written as ", after: ".", correct: "der Vater" },
  { before: "'Mother' appears in reading texts as ", after: ".", correct: "die Mutter" },
  { before: "The word for 'brother' when reading aloud is ", after: ".", correct: "der Bruder" },
  { before: "'Sister' reads as ", after: " in a family description.", correct: "die Schwester" },
  { before: "'Son' is written as ", after: " in the passage.", correct: "der Sohn" },
  { before: "'Daughter' reads as ", after: " in a family text.", correct: "die Tochter" },
  { before: "The reading word for 'grandfather' is ", after: ".", correct: "der Großvater" },
  { before: "'Grandmother' appears as ", after: " in the passage.", correct: "die Großmutter" },
  { before: "'Uncle' reads as ", after: " in a family passage.", correct: "der Onkel" },
  { before: "'Aunt' is written as ", after: " in the reading text.", correct: "die Tante" },
  { before: "The collective word for 'family' reads as ", after: ".", correct: "die Familie" },
  { before: "'Parents' reads as ", after: " in a family description.", correct: "die Eltern" },
  { before: "'Siblings' appears in the passage as ", after: ".", correct: "die Geschwister" },
];

const MATCH_OPENERS = [
  "Match each family word from the passage to its meaning.",
  "Which meaning goes with which German family word?",
  "Pair each family term with its correct English meaning.",
  "Match the German family word to what it means.",
  "Connect each family word from the reading to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about how each word describes a relative.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing family word.",
  "Complete the sentence with the correct German word.",
  "What word completes this family sentence?",
  "Fill the gap correctly.",
  "Complete this reading fact about family.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the family passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this family conversation correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how the conversation naturally flows.",
  " Names and ages are introduced one at a time.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each word: Immediate family or Extended family?",
  "Group these family words by how close the relative is.",
  "Sort each word into the category it belongs to.",
  "Classify each family word from the reading text.",
  "Which category best fits each family word?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about who lives in the same home usually.",
  " Reread the passage above if you need a reminder.",
  " Parents, siblings, and children are immediate family.",
];

export const familyReading: Skill = {
  id: "g6-de-r-family",
  code: "R.2",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Guided reading: family",
  description: "Skim and read short German passages about family members and their ages, recognise family vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const fatherAge = randChoice(rng, AGE_WORDS);
    let motherAge = randChoice(rng, AGE_WORDS);
    while (motherAge.num === fatherAge.num) motherAge = randChoice(rng, AGE_WORDS);
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b, fatherAge, motherAge);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;
      return {
        kind: "click-match",
        passage,
        prompt: `${randChoice(rng, MATCH_OPENERS)}${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above — each word appears in context there.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: `${randChoice(rng, FILL_OPENERS)}${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Use the passage above as a reminder of how each word is used.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)}${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "The passage introduces family members one at a time.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, FAMILY_VOCAB.filter((v) => v.word !== "die Familie" && v.word !== "die Eltern" && v.word !== "die Geschwister" && v.word !== "das Baby")).slice(0, 6);
      const bucketOf = (w: string) =>
        ["der Vater", "die Mutter", "der Bruder", "die Schwester", "der Sohn", "die Tochter"].includes(w)
          ? "Immediate family"
          : "Extended family";
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Immediate family", label: "Immediate family" },
          { id: "Extended family", label: "Extended family" },
        ],
        correctBucket,
        hint: "Immediate family are parents, siblings, and children; extended family are grandparents, aunts, uncles, and cousins.",
        explanation: chosen.map((c) => `"${c.word}" is ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, Array.from(new Set([qa.correct, ...qa.distractors])));
    return {
      kind: "multiple-choice",
      passage,
      prompt: qa.q,
      choices,
      correctIndex: choices.indexOf(qa.correct),
      layout: "list",
      hint: "Reread the passage above carefully before answering.",
      explanation: qa.explanation,
    };
  },
};
