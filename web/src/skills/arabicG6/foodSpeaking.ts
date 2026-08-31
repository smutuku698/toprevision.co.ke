import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { FOOD_VOCAB, name, place } from "./shared";

// Sub-strand 1.6 Phonological Awareness: Pronunciation — Theme: Food and Drinks.
// Content: pronounce food words accurately, describe food preferences with correct intonation
// (source example register: "I like rice than ugali, I don't like chips").

const PREFERENCE_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-ruzz akthar min al-khubz." What is ${n} expressing?`,
    correct: "preferring rice over bread",
    distractors: ["preferring bread over rice", "disliking both foods", "liking neither food"],
    explanation: `"Uhibbu al-ruzz akthar min al-khubz" means "I like rice more than bread".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Laa uhibbu al-samak." What is ${n} expressing?`,
    correct: "disliking fish",
    distractors: ["liking fish", "liking meat", "disliking meat"],
    explanation: `"Laa uhibbu al-samak" means "I don't like fish" — "laa" negates the liking.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-laban jiddan." How strongly does ${n} like milk?`,
    correct: "very much",
    distractors: ["only a little", "not at all", "the sentence does not say"],
    explanation: `"jiddan" means "very much" — intensifying "Uhibbu" (I like).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Laa uhibbu al-qahwa, lakin uhibbu al-shay." What does ${n} like?`,
    correct: "tea, not coffee",
    distractors: ["coffee, not tea", "both equally", "neither"],
    explanation: `The sentence means "I don't like coffee, but I like tea" — "lakin" means "but".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} asks a friend "Hal tuhibbu al-fawakih?" What is ${n} asking?`,
    correct: "do you like fruits?",
    distractors: ["I like fruits", "I don't like fruits", "let's eat now"],
    explanation: `"Hal tuhibbu al-fawakih?" means "Do you like fruits?" — "hal" marks a yes/no question.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-ruzz akthar min al-ugali, laa uhibbu al-chips." What is being expressed here?`,
    correct: "a ranked preference: rice most, then ugali, chips disliked",
    distractors: ["equal liking for all three foods", "disliking rice and ugali equally", "liking only chips"],
    explanation: `This mirrors the source example: comparing "more than" (akthar min) alongside a flat dislike (laa uhibbu).`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-khudra akthar min al-lahm." What is ${n} comparing?`,
    correct: "preferring vegetables over meat",
    distractors: ["preferring meat over vegetables", "disliking both foods", "liking neither food"],
    explanation: `"Uhibbu al-khudra akthar min al-lahm" means "I like vegetables more than meat".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Uhibbu al-asal fi al-sabah." When does ${n} like honey?`,
    correct: "in the morning",
    distractors: ["in the evening", "only at night", "the sentence does not say"],
    explanation: `"fi al-sabah" means "in the morning".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Sadeeqi yuhibbu al-bayd, lakinnani uhibbu al-samak." What is being contrasted?`,
    correct: `${n}'s friend likes eggs, but ${n} likes fish`,
    distractors: [`Both like eggs`, `Both like fish`, `Neither likes any food`],
    explanation: `"lakinnani" (but I) signals a contrast between the friend's preference and ${n}'s own preference.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} says "Laa uhibbu al-maa al-barid, uhibbu al-shay al-saakhin." What does ${n} actually like?`,
    correct: "hot tea, not cold water",
    distractors: ["cold water, not hot tea", "both equally", "neither drink"],
    explanation: `The sentence contrasts a dislike (cold water) with a liking (hot tea).`,
  }),
];

const PRONOUNCE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "When pronouncing food words accurately, what should you pay attention to besides the sounds themselves?", correct: "correct intonation, especially when stating a preference", distractors: ["speaking as fast as possible", "whispering every word", "only the first letter of each word"], explanation: "The sub-strand targets both accurate sounds and correct intonation when describing food preferences." },
  { q: "Which sentence uses correct intonation to show a strong dislike?", correct: "\"Laa uhibbu al-samak\" said with a falling, firm tone", distractors: ["\"Uhibbu al-samak\" said with a rising, excited tone", "the same word said with no change in tone at all", "shouting the word with no clear meaning"], explanation: "Intonation should match meaning — a dislike statement is said firmly and clearly, not like an excited liking." },
  { q: "Why does accurate pronunciation of food words matter when ordering or describing food?", correct: "so listeners understand exactly which food is meant", distractors: ["it doesn't matter as long as you point", "only written spelling matters, not speech", "it only matters for teachers, not students"], explanation: "Accurate pronunciation ensures the listener understands which specific food word was said." },
  { q: "What is the purpose of practising 'akthar min' (more than) in speaking practice?", correct: "to compare two food preferences clearly", distractors: ["to ask a yes/no question", "to say goodbye politely", "to name a body part"], explanation: "'akthar min' is a comparison phrase used to rank food preferences." },
  { q: "A learner says 'uhibbu' but drops the final vowel sound. What is affected?", correct: "the pronunciation becomes less accurate", distractors: ["nothing changes at all", "the meaning becomes the opposite", "it becomes a question instead"], explanation: "Dropping sounds reduces pronunciation accuracy, even if the general word is recognisable." },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'I like' in Arabic is ", after: ".", correct: "uhibbu" },
  { before: "'I don't like' in Arabic is ", after: ".", correct: "laa uhibbu" },
  { before: "'More than' in Arabic is ", after: ".", correct: "akthar min" },
  { before: "'Rice' in Arabic is ", after: ".", correct: "ruzz" },
  { before: "'Bread' in Arabic is ", after: ".", correct: "khubz" },
  { before: "'Milk' in Arabic is ", after: ".", correct: "laban" },
  { before: "'Water' in Arabic is ", after: ".", correct: "maa" },
  { before: "'Fish' in Arabic is ", after: ".", correct: "samak" },
  { before: "'But' in Arabic is ", after: ".", correct: "lakin" },
];

const DRINK_VS_SOLID: { word: string; type: "Drink" | "Solid food" }[] = [
  { word: "laban", type: "Drink" }, { word: "maa", type: "Drink" }, { word: "shay", type: "Drink" }, { word: "qahwa", type: "Drink" },
  { word: "ruzz", type: "Solid food" }, { word: "khubz", type: "Solid food" }, { word: "lahm", type: "Solid food" }, { word: "samak", type: "Solid food" }, { word: "khudra", type: "Solid food" }, { word: "fawakih", type: "Solid food" }, { word: "bayd", type: "Solid food" },
];

export const foodSpeaking: Skill = {
  id: "g6-ar-ls-food",
  code: "LS.6",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Phonological awareness: pronunciation (food and drinks)",
  description: "Pronounce food and drink words accurately and describe food preferences with correct intonation.",
  generate(rng) {
    const branch = randChoice(rng, ["preference", "pronounce", "fill", "match", "categorize"] as const);

    if (branch === "preference") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, PREFERENCE_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          "Listen to what is being said and choose what it means.",
          "Work out what preference is being expressed.",
          "What is being expressed in this exchange?",
          "Read the situation and pick the correct meaning.",
          "Choose the meaning that matches this spoken sentence.",
        ]) + " " + q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "'Uhibbu' = I like, 'Laa uhibbu' = I don't like, 'akthar min' = more than, 'lakin' = but.",
        explanation: q.explanation,
      };
    }

    if (branch === "pronounce") {
      const q = randChoice(rng, PRONOUNCE_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about how tone of voice and clear sounds change how a preference is understood.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing Arabic word or phrase.",
          "Complete the sentence with the correct Arabic word.",
          "What Arabic word completes this sentence?",
          "Fill the gap with the romanized Arabic word.",
          "Complete this food-vocabulary fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the food/drink vocabulary and preference phrases you've practised speaking.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, FOOD_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each food/drink word to its meaning.",
          "Match the spoken word to what it means.",
          "Which meaning goes with which food word?",
          "Pair each food/drink word with its correct meaning.",
          "Match each word you hear to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    const chosen2 = shuffle(rng, DRINK_VS_SOLID).slice(0, 7);
    const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Sort each item: Drink, or Solid food?",
        "Group these food/drink words by category.",
        "Which category does each word belong to?",
        "Sort each word into the correct category.",
        "Classify each food or drink word below.",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Drink", label: "Drink" },
        { id: "Solid food", label: "Solid food" },
      ],
      correctBucket,
      hint: "Milk, water, tea, and coffee are drinks; the rest are solid foods.",
      explanation: chosen2.map((c) => `"${c.word}" is a ${c.type.toLowerCase()}.`).join(" "),
    };
  },
};
