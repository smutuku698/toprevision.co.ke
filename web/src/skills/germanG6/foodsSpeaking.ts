import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FLAVOUR_VOCAB, FOOD_VOCAB, name, place, umlautAccepted } from "./shared";

// LS.6 Food and Drinks (food preferences) — oral food/drink vocabulary practised through matching,
// sorting food vs drink, fill-in, an ordered meal-preference dialogue, reasoning about what someone
// likes to eat, and a dedicated taste-descriptor drill ("Der Kuchen ist süß"; "Die Suppe ist salzig").

const MATCH_OPENERS = ["Match each German word", "Pair every food word", "Connect each vocabulary item", "Link each word below", "Match the German term", "Join each food word"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each item", "Group these German words", "Classify each item", "Decide where each item belongs", "Organise the items below", "Put each item"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German word", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the meal chat", "Order the sentences", "Sequence this exchange", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally be said.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person doing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being said here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on in this exchange?",
  "Work out the purpose of what was said.",
];

const FLAVOUR_PROMPT_POOL = [
  "Which word describes how this tastes?",
  "Choose the correct taste word for this food.",
  "Pick the flavour that matches this food.",
  "Which taste word fits this food correctly?",
  "Select the correct flavour description.",
  "What does this food actually taste like?",
  "Choose the flavour word that fits.",
  "Which option correctly describes the taste?",
  "Pick the correct taste for this German food word.",
  "Select the flavour that this food is known for.",
  "What is the correct way to describe this taste?",
  "Choose the taste that best matches this food.",
];

type Bucket = "Food" | "Drink";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "das Brot", bucket: "Food" },
  { word: "der Kuchen", bucket: "Food" },
  { word: "die Suppe", bucket: "Food" },
  { word: "der Reis", bucket: "Food" },
  { word: "das Fleisch", bucket: "Food" },
  { word: "der Fisch", bucket: "Food" },
  { word: "das Gemüse", bucket: "Food" },
  { word: "das Obst", bucket: "Food" },
  { word: "die Eier", bucket: "Food" },
  { word: "der Honig", bucket: "Food" },
  { word: "der Käse", bucket: "Food" },
  { word: "die Kartoffel", bucket: "Food" },
  { word: "die Milch", bucket: "Drink" },
  { word: "das Wasser", bucket: "Drink" },
  { word: "der Tee", bucket: "Drink" },
  { word: "der Saft", bucket: "Drink" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'Bread' in German is ", after: ".", correct: "das Brot" },
  { before: "'Cake' in German is ", after: ".", correct: "der Kuchen" },
  { before: "'Soup' in German is ", after: ".", correct: "die Suppe" },
  { before: "'Rice' in German is ", after: ".", correct: "der Reis" },
  { before: "'Meat' in German is ", after: ".", correct: "das Fleisch" },
  { before: "'Fish' in German is ", after: ".", correct: "der Fisch" },
  { before: "'Vegetables' in German is ", after: ".", correct: "das Gemüse" },
  { before: "'Fruit' in German is ", after: ".", correct: "das Obst" },
  { before: "'Milk' in German is ", after: ".", correct: "die Milch" },
  { before: "'Water' in German is ", after: ".", correct: "das Wasser" },
  { before: "'Cheese' in German is ", after: ".", correct: "der Käse" },
  { before: "'Juice' in German is ", after: ".", correct: "der Saft" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Was isst du gern? (what do you like eating?)", "Ich esse gern Brot. (I like eating bread)", "Und was trinkst du gern? (and what do you like drinking?)", "Ich trinke gern Saft. (I like drinking juice)"] },
  { lines: ["Magst du Reis? (do you like rice?)", "Ja, ich esse gern Reis mit Fisch. (yes, I like eating rice with fish)", "Ich mag auch Gemüse. (I also like vegetables)", "Gesund und lecker! (healthy and delicious!)"] },
  { lines: ["Isst du gern Kuchen? (do you like eating cake?)", "Ja, der Kuchen ist süß und lecker. (yes, the cake is sweet and delicious)", "Ich esse ihn gern zum Frühstück. (I like eating it for breakfast)", "Das klingt gut! (that sounds good!)"] },
  { lines: ["Was trinkst du am Morgen? (what do you drink in the morning?)", "Ich trinke Tee. (I drink tea)", "Manchmal trinke ich Milch. (sometimes I drink milk)", "Wasser trinke ich den ganzen Tag. (I drink water the whole day)"] },
  { lines: ["Die Suppe ist salzig. (the soup is salty)", "Der Honig ist süß. (the honey is sweet)", "Ich esse gern beides. (I like eating both)", "Was isst du lieber? (which do you prefer eating?)"] },
];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} is asked "Was isst du gern?" and answers "Ich esse gern Brot." What is ${n} describing?`,
    correct: "a food they like eating",
    distractors: ["a drink they like", "a food they dislike", "someone else's favourite food"],
    explanation: `"Ich esse gern Brot" means "I like eating bread" — "esse" (eat) shows this is a food, not a drink.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Ich trinke gern Saft, aber ich trinke nicht gern Tee." What does this reveal?`,
    correct: "${n} likes juice but dislikes tea",
    distractors: ["${n} likes both juice and tea", "${n} dislikes both juice and tea", "${n} likes tea but dislikes juice"],
    explanation: `"Ich trinke gern Saft" (I like drinking juice) is positive; "ich trinke nicht gern Tee" (I don't like drinking tea) is negative.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} at a market points at rice and fish and says "Das ist mein Lieblingsessen." What is ${n} saying?`,
    correct: "that this is their favourite food",
    distractors: ["that this food is too salty", "that they don't like this food", "that this is a drink"],
    explanation: `"Das ist mein Lieblingsessen" means "this is my favourite food" — a statement of preference, not a complaint.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} tastes soup and says "Die Suppe ist salzig." What is ${n} describing?`,
    correct: "the taste of the soup",
    distractors: ["the temperature of the soup", "how much soup there is", "who made the soup"],
    explanation: `"salzig" means "salty" — a taste word, describing flavour rather than temperature or quantity.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} bites into cake and says "Der Kuchen ist süß und lecker." What two things is ${n} saying about the cake?`,
    correct: "that it is sweet and delicious",
    distractors: ["that it is salty and cold", "that it is sour and small", "that it is spicy and large"],
    explanation: `"süß" means "sweet" and "lecker" means "delicious" — both positive taste words, not "salzig" (salty) or "sauer" (sour).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} refuses more vegetables and says "Ich esse nicht gern Gemüse." What is ${n} expressing?`,
    correct: "that they dislike eating vegetables",
    distractors: ["that they like eating vegetables", "that they are full", "that vegetables are too expensive"],
    explanation: `"nicht gern" shows dislike — "Ich esse nicht gern Gemüse" means "I don't like eating vegetables."`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} offers a friend eggs and cheese for breakfast, saying "Frühstück: Eier und Käse." What meal is being described?`,
    correct: "breakfast",
    distractors: ["lunch", "dinner", "a snack before bed"],
    explanation: `"Frühstück" means breakfast — the sentence names a specific meal, not lunch or dinner.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Ich esse gern Obst, besonders Mangos." What preference is being shown?`,
    correct: "a liking for fruit, especially mangoes",
    distractors: ["a dislike of fruit", "a liking for vegetables", "a liking for meat"],
    explanation: `"Ich esse gern Obst" states a liking for fruit ("Obst"), further specified as mangoes.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} pours a glass and says "Ich trinke gern Wasser, es ist gesund." What is being justified?`,
    correct: "a preference for water, because it's healthy",
    distractors: ["a preference for juice", "a dislike of water", "a preference for milk"],
    explanation: `"Ich trinke gern Wasser" states a liking for water, and "es ist gesund" (it's healthy) gives the reason.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Der Honig ist süß, aber der Fisch ist salzig." What contrast is being made?`,
    correct: "a sweet food versus a salty food",
    distractors: ["two sweet foods", "two salty drinks", "a food versus a drink"],
    explanation: `"süß" (sweet) describes honey, while "salzig" (salty) describes fish — two different, contrasting tastes.`,
  }),
];

const FOOD_FLAVOUR_PAIRS: { food: string; flavour: string }[] = [
  { food: "der Kuchen", flavour: "süß" },
  { food: "der Honig", flavour: "süß" },
  { food: "das Obst", flavour: "süß" },
  { food: "der Tee mit Zucker", flavour: "süß" },
  { food: "die Suppe", flavour: "salzig" },
  { food: "der Käse", flavour: "salzig" },
  { food: "der Fisch", flavour: "salzig" },
  { food: "die Kartoffel mit Salz", flavour: "salzig" },
];

export const foodsSpeaking: Skill = {
  id: "g6-de-ls-foods",
  code: "LS.6",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "Food and Drinks (Food Preferences)",
  description: "Speak and recognise German food/drink vocabulary — matching, sorting food vs drink, fill-in, an ordered meal-preference dialogue, reasoning about food likes and dislikes, and a dedicated taste-descriptor drill (Der Kuchen ist süß; Die Suppe ist salzig).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "flavour"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, FOOD_VOCAB).slice(0, 5);
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
        hint: "Notice the article (der/die/das) attached to each food or drink word.",
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
          { id: "Food", label: "Food" },
          { id: "Drink", label: "Drink" },
        ],
        correctBucket,
        hint: "Ask: do you eat it or drink it?",
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
        hint: "Remember the article (der/die/das) that goes with this food or drink word.",
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
        hint: "A question about food/drink preference usually comes before the answer.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n, p);
      const correct = q.correct.replace(/\$\{n\}/g, n);
      const distractors = q.distractors.map((d) => d.replace(/\$\{n\}/g, n));
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Check the verb (esse/trinke) and whether 'gern' or 'nicht gern' is used.",
        explanation: q.explanation,
      };
    }

    const pair = randChoice(rng, FOOD_FLAVOUR_PAIRS);
    const otherFlavours = FLAVOUR_VOCAB.filter((f) => f.word !== pair.flavour && ["süß", "salzig", "sauer", "scharf"].includes(f.word));
    const distractors = shuffle(rng, otherFlavours).slice(0, 3).map((f) => f.word);
    const choices = shuffle(rng, [pair.flavour, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt: `${randChoice(rng, FLAVOUR_PROMPT_POOL)} (${pair.food})`,
      choices,
      correctIndex: choices.indexOf(pair.flavour),
      layout: "row",
      hint: "süß = sweet, salzig = salty, sauer = sour, scharf = spicy.",
      explanation: `"${pair.food}" is typically described as "${pair.flavour}" in German.`,
    };
  },
};
