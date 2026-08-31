import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FLAVOUR_VOCAB, FOOD_VOCAB, name, umlautAccepted } from "./shared";

// Reading strand, Theme 6: Food and Drinks (food preferences) — guided reading/articulation of short
// texts on what food people eat and how it tastes, drawn from FOOD_VOCAB and FLAVOUR_VOCAB.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string, food: { word: string; meaning: string }, flavour: { word: string; meaning: string }) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b, food, flavour) => ({
    lines: [`${a}: Was isst du gern?`, `${b}: Ich esse gern ${food.word}.`, `${a}: Wie schmeckt ${food.word}?`, `${b}: ${food.word} ist ${flavour.word}.`, `${a}: Lecker! Ich mag das auch.`, `${b}: Isst du auch gern ${food.word}?`],
    qa: [
      { q: `What food does ${b} say they like eating?`, correct: `${food.word} (${food.meaning})`, distractors: ["der Reis (rice)", "das Gemüse (vegetables)", "The passage does not say"], explanation: `${b} says "Ich esse gern ${food.word}."` },
      { q: `How does ${b} describe the taste of ${food.word}?`, correct: `${flavour.word} (${flavour.meaning})`, distractors: ["schmeckt komisch (tastes strange)", "kalt (cold)", "The passage does not say"], explanation: `${b} says "${food.word} ist ${flavour.word}."` },
      { q: `What does ${a} say about ${food.word}?`, correct: "That it sounds delicious and they like it too", distractors: ["That they dislike it", "That they have never tried it", "The passage does not say"], explanation: `${a} says "Lecker! Ich mag das auch."` },
    ],
  }),
  (a, b, food, flavour) => ({
    lines: [`${a}: Was isst du zum Frühstück?`, `${b}: Zum Frühstück esse ich ${food.word}.`, `${a}: Trinkst du auch etwas?`, `${b}: Ja, ich trinke Tee.`, `${a}: Schmeckt ${food.word} gut?`, `${b}: Ja, es ist sehr ${flavour.word} und lecker.`],
    qa: [
      { q: `What does ${b} eat for breakfast?`, correct: food.word, distractors: ["der Fisch", "das Fleisch", "The passage does not say"], explanation: `${b} says "Zum Frühstück esse ich ${food.word}."` },
      { q: `What does ${b} drink, according to the passage?`, correct: "Tea (Tee)", distractors: ["Milk (Milch)", "Water (Wasser)", "The passage does not say"], explanation: `${b} says "ich trinke Tee."` },
      { q: `How does ${b} describe the taste of ${food.word}?`, correct: `${flavour.word} and delicious (${flavour.meaning}, lecker)`, distractors: ["Very salty and bitter", "Not very tasty", "The passage does not say"], explanation: `${b} says "es ist sehr ${flavour.word} und lecker."` },
    ],
  }),
  (a, b, food, flavour) => ({
    lines: [`${a}: Ich mag ${food.word} nicht so gern.`, `${b}: Warum nicht?`, `${a}: Es ist zu ${flavour.word} für mich.`, `${b}: Ich finde ${food.word} lecker!`, `${a}: Jeder hat einen anderen Geschmack.`, `${b}: Das stimmt!`],
    qa: [
      { q: `How does ${a} feel about ${food.word}, according to the passage?`, correct: "Does not like it very much", distractors: ["Loves it", "Has never tasted it", "The passage does not say"], explanation: `${a} says "Ich mag ${food.word} nicht so gern."` },
      { q: `Why doesn't ${a} like ${food.word}?`, correct: `It is too ${flavour.meaning} for them`, distractors: ["It is too expensive", "It is too cold", "The passage does not say"], explanation: `${a} says "Es ist zu ${flavour.word} für mich."` },
      { q: "What do the two speakers agree on at the end?", correct: "Everyone has different tastes", distractors: ["Everyone likes the same food", "Food does not matter", "The passage does not conclude anything"], explanation: `${a} says "Jeder hat einen anderen Geschmack" and ${b} agrees.` },
    ],
  }),
  (a, b, food, flavour) => ({
    lines: [`${a}: Was möchtest du zum Mittagessen?`, `${b}: Ich möchte ${food.word}, bitte.`, `${a}: Und etwas zu trinken?`, `${b}: Ein Glas Wasser, bitte.`, `${a}: Hier ist dein Essen. Guten Appetit!`, `${b}: Danke! Es riecht ${flavour.word}.`],
    qa: [
      { q: `What does ${b} want for lunch?`, correct: food.word, distractors: ["die Suppe", "der Käse", "The passage does not say"], explanation: `${b} says "Ich möchte ${food.word}, bitte."` },
      { q: `What does ${b} want to drink?`, correct: "A glass of water", distractors: ["A cup of tea", "Juice", "The passage does not say"], explanation: `${b} says "Ein Glas Wasser, bitte."` },
      { q: `How does ${b} describe the smell of the food?`, correct: `${flavour.word} (${flavour.meaning})`, distractors: ["kalt (cold)", "komisch (strange)", "The passage does not say"], explanation: `${b} says "Es riecht ${flavour.word}."` },
    ],
  }),
  (a, b, food, flavour) => ({
    lines: [`${a}: Kochst du gern?`, `${b}: Ja, ich koche oft ${food.word} für meine Familie.`, `${a}: Wie schmeckt dein ${food.word}?`, `${b}: Meine Familie sagt, es ist sehr ${flavour.word}.`, `${a}: Kann ich es probieren?`, `${b}: Natürlich, komm morgen vorbei!`],
    qa: [
      { q: `What does ${b} often cook for their family?`, correct: food.word, distractors: ["das Gemüse", "die Eier", "The passage does not say"], explanation: `${b} says "ich koche oft ${food.word} für meine Familie."` },
      { q: `What does ${b}'s family say about their cooking?`, correct: `It is very ${flavour.meaning}`, distractors: ["It is too salty", "It needs more time", "The passage does not say"], explanation: `${b} says "es ist sehr ${flavour.word}."` },
      { q: `What does ${b} invite ${a} to do?`, correct: "Come try the food tomorrow", distractors: ["Cook together today", "Buy ingredients", "The passage does not say"], explanation: `${b} says "komm morgen vorbei!"` },
    ],
  }),
];

const MATCH_POOL = FOOD_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a reading text, 'bread' is written as ", after: ".", correct: "das Brot" },
  { before: "'Cake' appears in reading texts as ", after: ".", correct: "der Kuchen" },
  { before: "The word for 'soup' when reading aloud is ", after: ".", correct: "die Suppe" },
  { before: "'Rice' reads as ", after: " in a food passage.", correct: "der Reis" },
  { before: "'Fish' is written as ", after: " in the passage.", correct: "der Fisch" },
  { before: "'Vegetables' reads as ", after: " in a food text.", correct: "das Gemüse" },
  { before: "The reading word for 'fruit' is ", after: ".", correct: "das Obst" },
  { before: "'Milk' appears as ", after: " in the passage.", correct: "die Milch" },
  { before: "'Cheese' reads as ", after: " in a food passage.", correct: "der Käse" },
  { before: "'Juice' is written as ", after: " in the reading text.", correct: "der Saft" },
  { before: "'Sweet' reads as ", after: " when describing a taste.", correct: "süß" },
  { before: "'Salty' appears as ", after: " when describing a taste.", correct: "salzig" },
  { before: "'Delicious' reads as ", after: " in the passage.", correct: "lecker" },
];

const MATCH_OPENERS = [
  "Match each food word from the passage to its meaning.",
  "Which meaning goes with which German food word?",
  "Pair each food term with its correct English meaning.",
  "Match the German word to what it means.",
  "Connect each food word from the reading to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about which food or drink each word names.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing food word.",
  "Complete the sentence with the correct German word.",
  "What word completes this sentence about food?",
  "Fill the gap correctly.",
  "Complete this reading fact about food and drinks.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the food passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this conversation about food correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how the conversation naturally flows.",
  " A question about food usually comes before its taste is described.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each word: Food or Drink?",
  "Group these words by whether they are eaten or drunk.",
  "Sort each word into the category it belongs to.",
  "Classify each word from the reading text.",
  "Which category best fits each food or drink word?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about whether you eat it or drink it.",
  " Reread the passage above if you need a reminder.",
  " Some words name food, others name drinks.",
];

const DRINK_WORDS = ["die Milch", "das Wasser", "der Tee", "der Saft"];

export const foodsReading: Skill = {
  id: "g6-de-r-foods",
  code: "R.6",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Guided reading: food and drinks",
  description: "Read short German passages about food preferences and tastes for articulation, recognise food and flavour vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const food = randChoice(rng, FOOD_VOCAB);
    const flavour = randChoice(rng, FLAVOUR_VOCAB.filter((f) => f.word !== "schmecken"));
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b, food, flavour);
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
        hint: "The passage moves from one comment about food to the next.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, FOOD_VOCAB).slice(0, 6);
      const bucketOf = (w: string) => (DRINK_WORDS.includes(w) ? "Drink" : "Food");
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Food", label: "Food" },
          { id: "Drink", label: "Drink" },
        ],
        correctBucket,
        hint: "Milk, water, tea, and juice are drinks; the rest are foods.",
        explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()}.`).join(" "),
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
