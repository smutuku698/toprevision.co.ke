import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FAMILY_VOCAB, NUMBERS, name, place, umlautAccepted } from "./shared";

// LS.2 Family (nuclear family) — oral family-member vocabulary plus numbers 20-100, practised
// through matching, gendered sorting, fill-in, ordered introductions, reasoning about ages, and
// the "Das ist mein Vater/meine Mutter. Er/sie ist ... Jahre alt." + "Wie alt ist dein/e ...?" pattern.

const MATCH_OPENERS = ["Match each German word", "Pair every family word", "Connect each vocabulary item", "Link each word below", "Match the German term", "Join each family word"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each family word", "Group these German words", "Classify each family member", "Decide where each word belongs", "Organise the words below", "Put each family word"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German family word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German family word", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the introduction", "Order the sentences", "Sequence this exchange", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally be said.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person doing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being asked or said here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on in this exchange?",
  "Work out the purpose of what was said.",
];

const NUMBER_PROMPT_POOL = [
  "Match each German number word",
  "Pair every number word",
  "Connect each age-related number",
  "Link each number below",
  "Match the German number term",
  "Join each number word",
];
const NUMBER_CLOSERS = ["to its correct digit.", "with the digit it represents.", "to the right number.", "to what number it means.", "to its digit."];

const NUMBER_ORDER_OPENERS = ["Arrange these German numbers", "Order these number words", "Put these numbers", "Sequence these German numbers", "Sort these number words", "Line up these numbers"];
const NUMBER_ORDER_CLOSERS = ["from smallest to largest.", "in counting order.", "from lowest to highest.", "the way you would count them.", "in ascending order."];

type Bucket = "Male family member" | "Female family member" | "Family in general";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "der Vater", bucket: "Male family member" },
  { word: "der Bruder", bucket: "Male family member" },
  { word: "der Sohn", bucket: "Male family member" },
  { word: "der Großvater", bucket: "Male family member" },
  { word: "der Onkel", bucket: "Male family member" },
  { word: "der Cousin", bucket: "Male family member" },
  { word: "die Mutter", bucket: "Female family member" },
  { word: "die Schwester", bucket: "Female family member" },
  { word: "die Tochter", bucket: "Female family member" },
  { word: "die Großmutter", bucket: "Female family member" },
  { word: "die Tante", bucket: "Female family member" },
  { word: "die Cousine", bucket: "Female family member" },
  { word: "die Familie", bucket: "Family in general" },
  { word: "die Eltern", bucket: "Family in general" },
  { word: "die Geschwister", bucket: "Family in general" },
  { word: "das Baby", bucket: "Family in general" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'Father' in German is ", after: ".", correct: "der Vater" },
  { before: "'Mother' in German is ", after: ".", correct: "die Mutter" },
  { before: "'Brother' in German is ", after: ".", correct: "der Bruder" },
  { before: "'Sister' in German is ", after: ".", correct: "die Schwester" },
  { before: "'Son' in German is ", after: ".", correct: "der Sohn" },
  { before: "'Daughter' in German is ", after: ".", correct: "die Tochter" },
  { before: "'Grandfather' in German is ", after: ".", correct: "der Großvater" },
  { before: "'Grandmother' in German is ", after: ".", correct: "die Großmutter" },
  { before: "'Uncle' in German is ", after: ".", correct: "der Onkel" },
  { before: "'Aunt' in German is ", after: ".", correct: "die Tante" },
  { before: "'Parents' in German is ", after: ".", correct: "die Eltern" },
  { before: "'Siblings' in German is ", after: ".", correct: "die Geschwister" },
  { before: "'Family' in German is ", after: ".", correct: "die Familie" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Das ist meine Familie. (this is my family)", "Das ist mein Vater. (this is my father)", "Er ist fünfzig Jahre alt. (he is fifty years old)", "Das ist meine Mutter. (this is my mother)"] },
  { lines: ["Wie alt ist dein Vater? (how old is your father?)", "Mein Vater ist vierzig Jahre alt. (my father is forty years old)", "Wie alt ist deine Mutter? (how old is your mother?)", "Meine Mutter ist siebenunddreißig Jahre alt. (my mother is thirty-seven)"] },
  { lines: ["Das ist mein Bruder. (this is my brother)", "Er ist dreizehn Jahre alt. (he is thirteen years old)", "Das ist meine Schwester. (this is my sister)", "Sie ist zehn Jahre alt. (she is ten years old)"] },
  { lines: ["Das sind meine Eltern. (these are my parents)", "Das ist mein Großvater. (this is my grandfather)", "Er ist achtzig Jahre alt. (he is eighty years old)", "Das ist meine Großmutter. (this is my grandmother)"] },
  { lines: ["Ich habe eine Tante. (I have an aunt)", "Sie heißt Faith. (her name is Faith)", "Sie ist fünfunddreißig Jahre alt. (she is thirty-five years old)", "Sie wohnt in Nairobi. (she lives in Nairobi)"] },
  { lines: ["Das ist mein Cousin. (this is my male cousin)", "Er ist zwölf Jahre alt. (he is twelve years old)", "Das ist meine Cousine. (this is my female cousin)", "Sie ist neun Jahre alt. (she is nine years old)"] },
];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} points at a photo and says "Das ist mein Vater. Er ist fünfzig Jahre alt." What is ${n} doing?`,
    correct: "introducing their father and his age",
    distractors: ["introducing their mother", "asking someone's age", "asking who someone is"],
    explanation: `"Das ist mein Vater. Er ist fünfzig Jahre alt" introduces the father specifically, using "der Vater" and the pronoun "Er".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} shows a photo and says "Das ist meine Mutter. Sie ist fünfundvierzig Jahre alt." What is ${n} doing?`,
    correct: "introducing their mother and her age",
    distractors: ["introducing their sister", "asking about someone's father", "counting family members"],
    explanation: `"meine Mutter" (my mother) and the pronoun "Sie" (she) identify this as an introduction of the mother.`,
  }),
  (n, p) => ({
    prompt: `A friend in ${p} asks ${n}, "Wie alt ist dein Vater?" What is the friend doing?`,
    correct: "asking how old someone's father is",
    distractors: ["asking someone's own age", "introducing their own father", "asking how old someone's mother is"],
    explanation: `"Wie alt ist dein Vater?" asks specifically about the father's age, using "dein" (your, masculine).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is asked "Wie alt ist deine Mutter?" and answers "Meine Mutter ist achtunddreißig Jahre alt." What did ${n} do?`,
    correct: "stated their mother's age",
    distractors: ["stated their own age", "asked about the father", "introduced a sibling"],
    explanation: `"Meine Mutter ist ... Jahre alt" gives the mother's age directly, answering the question asked.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Ich habe zwei Geschwister." What is ${n} telling us?`,
    correct: "how many siblings they have",
    distractors: ["how many parents they have", "their own age", "their grandparents' names"],
    explanation: `"Geschwister" means siblings (brothers and sisters together) — "zwei Geschwister" means two siblings.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} introduces a relative: "Das ist mein Onkel. Er wohnt in ${p}." What relationship is being introduced?`,
    correct: "an uncle",
    distractors: ["an aunt", "a grandfather", "a cousin"],
    explanation: `"der Onkel" specifically means uncle — "die Tante" would be aunt instead.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Meine Großmutter ist zweiundsiebzig Jahre alt." What is being described?`,
    correct: "the grandmother's age",
    distractors: ["the grandfather's age", "the mother's age", "the aunt's age"],
    explanation: `"Großmutter" means grandmother, distinct from "Großvater" (grandfather).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Das ist mein Cousin, nicht meine Cousine." What mistake is ${n} correcting?`,
    correct: "a mix-up between a male and female cousin",
    distractors: ["a mix-up between a brother and sister", "a mix-up between a son and daughter", "a mix-up between an uncle and aunt"],
    explanation: `"der Cousin" (male cousin) and "die Cousine" (female cousin) are easy to mix up because they sound similar.`,
  }),
  (n, p) => ({
    prompt: `${n}'s baby sibling is at home in ${p}, and ${n} says "Das ist mein Baby-Bruder." What does this describe?`,
    correct: "a baby brother",
    distractors: ["a baby sister", "the whole family", "the parents"],
    explanation: `"Baby-Bruder" combines "das Baby" with "der Bruder" to mean baby brother.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is asked their own age and answers "Ich bin zwölf Jahre alt," not naming any family member. What is ${n} doing?`,
    correct: "stating their own age",
    distractors: ["stating a parent's age", "introducing a sibling", "asking a question"],
    explanation: `"Ich bin ... Jahre alt" (I am ... years old) states the speaker's own age, unlike "Er/Sie ist" for someone else.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Meine Eltern sind fünfzig und fünfundvierzig Jahre alt." What is ${n} describing?`,
    correct: "both parents' ages",
    distractors: ["their own age", "their grandparents' ages", "their siblings' ages"],
    explanation: `"Eltern" means parents — the sentence gives two ages, one for each parent.`,
  }),
];

export const familySpeaking: Skill = {
  id: "g6-de-ls-family",
  code: "LS.2",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "Family and Numbers 20-100",
  description: "Speak and recognise nuclear-family vocabulary and numbers 20-100 in German — matching, gendered sorting (der/die), fill-in, ordered introductions, reasoning about ages, and 'Wie alt ist dein/e Vater/Mutter?' practice.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "numbers"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, FAMILY_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => (correctMap[`${i}-${v.word}`] = `${i}-${v.word}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Look at the article (der/die/das) — it hints at whether the word is male, female, or general.",
        explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Male family member", label: "Male family member" },
          { id: "Female family member", label: "Female family member" },
          { id: "Family in general", label: "Family in general" },
        ],
        correctBucket,
        hint: "'der' words are usually male, 'die' words are usually female or plural/general.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Remember to include the article (der/die/das) with the family word.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Introductions usually name the family member first, then give their age.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Check which family word and pronoun (Er/Sie/Ich) are used, and whether an age is given.",
        explanation: q.explanation,
      };
    }

    const sub = randChoice(rng, ["numMatch", "numOrder"] as const);
    if (sub === "numMatch") {
      const chosen = shuffle(rng, NUMBERS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: `n${v.num}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: `n${v.num}`, label: String(v.num) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v) => (correctMap[`n${v.num}`] = `n${v.num}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, NUMBER_PROMPT_POOL)} ${randChoice(rng, NUMBER_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Numbers 20-100 often end in '-zig' (zwanzig, dreißig...); compound numbers put the ones digit before the tens (e.g. fünfundzwanzig = 25).",
        explanation: chosen.map((v) => `"${v.word}" is ${v.num}.`).join(" "),
      };
    }

    const windowSize = randChoice(rng, [4, 5] as const);
    const start = randInt(rng, 0, NUMBERS.length - windowSize);
    const windowNums = shuffle(rng, NUMBERS.slice(start, start + windowSize).sort((a, b) => a.num - b.num));
    const sorted = [...windowNums].sort((a, b) => a.num - b.num);
    const items = windowNums.map((v) => ({ id: `n${v.num}`, label: v.word }));
    return {
      kind: "ordering",
      prompt: `${randChoice(rng, NUMBER_ORDER_OPENERS)} ${randChoice(rng, NUMBER_ORDER_CLOSERS)}`,
      instruction: "Click the numbers in counting order.",
      items,
      correctOrder: sorted.map((v) => `n${v.num}`),
      hint: "Say them in counting order, smallest number first.",
      explanation: `In counting order: ${sorted.map((v) => `${v.word} (${v.num})`).join(", ")}.`,
    };
  },
};
