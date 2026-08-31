import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Brian : Quel temps fait-il aujourd'hui, Mumbi ?",
  "Mumbi : Il fait beau et chaud. Le ciel est bleu.",
  "Brian : Et hier, quel temps faisait-il ?",
  "Mumbi : Il pleuvait beaucoup et il y avait du vent.",
  "Brian : C'était un temps difficile pour jouer dehors !",
  "Mumbi : Oui, et il faisait nuageux aussi le matin.",
  "Brian : Je préfère quand il fait beau, comme aujourd'hui.",
  "Mumbi : Moi aussi. Le vent fort peut être dangereux.",
  "Brian : C'est vrai. La pluie légère est agréable, mais la tempête, non.",
  "Mumbi : Exactement. Il faut classer le temps entre amical et rude.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Today the weather is nice and hot.", isTrue: true },
  { text: "The sky is grey today.", isTrue: false },
  { text: "It rained a lot yesterday.", isTrue: true },
  { text: "Yesterday was calm with no wind.", isTrue: false },
  { text: "It was hard weather to play outside in yesterday.", isTrue: true },
  { text: "It was sunny all day yesterday.", isTrue: false },
  { text: "It was cloudy yesterday morning.", isTrue: true },
  { text: "Brian prefers rainy days.", isTrue: false },
  { text: "Strong wind can be dangerous, according to Mumbi.", isTrue: true },
  { text: "Brian says a storm is pleasant.", isTrue: false },
  { text: "Brian says light rain is pleasant.", isTrue: true },
  { text: "Weather can be classified as friendly or harsh, according to Mumbi.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Quel temps fait-il aujourd'hui ?", meaning: "What's the weather like today?" },
  { phrase: "Il fait beau et chaud.", meaning: "It's nice and hot." },
  { phrase: "Le ciel est bleu.", meaning: "The sky is blue." },
  { phrase: "Il pleuvait beaucoup.", meaning: "It was raining a lot." },
  { phrase: "Il y avait du vent.", meaning: "There was wind." },
  { phrase: "C'était un temps difficile pour jouer dehors.", meaning: "It was hard weather to play outside in." },
  { phrase: "Il faisait nuageux le matin.", meaning: "It was cloudy in the morning." },
  { phrase: "Je préfère quand il fait beau.", meaning: "I prefer when the weather is nice." },
  { phrase: "Le vent fort peut être dangereux.", meaning: "Strong wind can be dangerous." },
  { phrase: "La pluie légère est agréable.", meaning: "Light rain is pleasant." },
  { phrase: "La tempête, non.", meaning: "A storm, no (not pleasant)." },
  { phrase: "Il faut classer le temps entre amical et rude.", meaning: "We must classify weather as friendly or harsh." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel temps fait-il aujourd'hui, selon Mumbi ?",
    correct: "Il fait beau et chaud",
    distractors: ["Il pleut beaucoup", "Il fait nuageux", "Il y a une tempête"],
    explanation: "Mumbi says: \"Il fait beau et chaud. Le ciel est bleu.\"",
  },
  {
    q: "Quel temps faisait-il hier ?",
    correct: "Il pleuvait et il y avait du vent",
    distractors: ["Il faisait beau et chaud", "Il faisait très froid sans vent", "Il n'y avait pas de nuages"],
    explanation: "Mumbi says: \"Il pleuvait beaucoup et il y avait du vent.\"",
  },
  {
    q: "Selon Mumbi, qu'est-ce qui peut être dangereux ?",
    correct: "Le vent fort",
    distractors: ["Le ciel bleu", "La pluie légère", "Le temps calme"],
    explanation: "Mumbi says: \"Le vent fort peut être dangereux.\"",
  },
  {
    q: "Comment faut-il classer le temps, selon Mumbi ?",
    correct: "Entre amical et rude",
    distractors: ["Entre chaud et froid seulement", "Entre jour et nuit", "Entre facile et difficile à prévoir"],
    explanation: "Mumbi says: \"Il faut classer le temps entre amical et rude.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Brian : Quel temps fait-il ", after: ", Mumbi ?", answer: "aujourd'hui", gloss: "What's the weather like today, Mumbi?" },
  { before: "Mumbi : Il fait beau et ", after: ". Le ciel est bleu.", answer: "chaud", gloss: "It's nice and hot. The sky is blue." },
  { before: "Mumbi : Il fait beau et chaud. Le ciel est ", after: ".", answer: "bleu", gloss: "It's nice and hot. The sky is blue." },
  { before: "Mumbi : Il pleuvait beaucoup et il y avait du ", after: ".", answer: "vent", gloss: "It was raining a lot and it was windy." },
  { before: "Brian : C'était un temps difficile pour jouer ", after: " !", answer: "dehors", gloss: "That was hard weather to play outside in!" },
  { before: "Mumbi : Oui, et il faisait ", after: " aussi le matin.", answer: "nuageux", gloss: "Yes, and it was cloudy in the morning too." },
  { before: "Brian : Je préfère quand il fait ", after: ", comme aujourd'hui.", answer: "beau", gloss: "I prefer when the weather is nice, like today." },
  { before: "Mumbi : Moi aussi. Le vent fort peut être ", after: ".", answer: "dangereux", gloss: "Me too. Strong wind can be dangerous." },
  { before: "Brian : La pluie légère est agréable, mais la ", after: ", non.", answer: "tempête", gloss: "Light rain is pleasant, but a storm, no." },
  { before: "Mumbi : Il faut classer le temps entre amical et ", after: ".", answer: "rude", gloss: "We must classify weather as friendly or harsh." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "fait", "beau", "et", "chaud", "."], sentence: "Il fait beau et chaud." },
  { chunks: ["Il", "pleuvait", "beaucoup", "et", "il", "y", "avait", "du", "vent", "."], sentence: "Il pleuvait beaucoup et il y avait du vent." },
];

/** Separate pool for the friendly-vs-harsh categorization angle explicitly named in the
 * Grade 6 French design (Reading 2.8: "jointly read texts and categorize weather patterns
 * into friendly and harsh"). Distinct content from TRUE_FALSE — general weather conditions,
 * not lines lifted from the dialogue. */
const WEATHER_CONDITIONS: { text: string; category: "Friendly" | "Harsh" }[] = [
  { text: "Il fait beau.", category: "Friendly" },
  { text: "Il fait chaud et sec.", category: "Friendly" },
  { text: "Le ciel est bleu et dégagé.", category: "Friendly" },
  { text: "Il y a une brise légère.", category: "Friendly" },
  { text: "La pluie est légère et douce.", category: "Friendly" },
  { text: "Il fait nuageux mais calme.", category: "Friendly" },
  { text: "Il y a une tempête violente.", category: "Harsh" },
  { text: "Le vent est très fort et casse les arbres.", category: "Harsh" },
  { text: "Il y a de la grêle.", category: "Harsh" },
  { text: "Il fait une chaleur extrême (canicule).", category: "Harsh" },
  { text: "Il y a une inondation soudaine.", category: "Harsh" },
  { text: "Il y a un orage avec tonnerre et éclairs.", category: "Harsh" },
];

export const weatherReading: Skill = {
  id: "g6-fr-r-weather",
  code: "R.8",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: weather and environment",
  description: "Read a short French dialogue between Brian and Mumbi about today's and yesterday's weather, and classify weather conditions as friendly or harsh.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize-tf", "categorize-weather", "click-match", "ordering", "fill-blank", "multiple-choice"] as const);

    if (branch === "categorize-tf") {
      const chosen = shuffle(rng, TRUE_FALSE).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check what it says about today and yesterday.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "categorize-weather") {
      const chosen = shuffle(rng, WEATHER_CONDITIONS).slice(0, 7);
      const items = chosen.map((s, i) => ({ id: `w${i}`, label: s.text, bucket: s.category }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each weather condition as Friendly or Harsh, the way Brian and Mumbi discuss classifying the weather.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Friendly", label: "Friendly" },
          { id: "Harsh", label: "Harsh" },
        ],
        correctBucket,
        hint: "A friendly condition is calm and safe; a harsh condition is extreme or dangerous.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.category === "Friendly" ? "a friendly" : "a harsh"} weather condition.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put the pieces in order to rebuild this line from the dialogue.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the dialogue above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from this line of the dialogue.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what each speaker actually says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
