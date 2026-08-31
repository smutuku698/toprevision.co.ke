import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Inside Mama Chiku's tailoring shop, dozens of fabrics hang from the rafters — deep purple kitenge, sunflower-yellow cotton, and stiff green ankara patterned with golden circles. The old sewing machine clatters rhythmically as Mama Chiku guides the fabric beneath the needle, her fingers moving with practiced ease. The shop smells of fresh cloth and machine oil, and scraps of thread litter the floor like confetti. Outside, customers wait to be measured for the school's cultural day, when pupils will wear both modern uniforms and traditional dress side by side. Mama Chiku has run the shop for eighteen years and has trained six apprentices.";

const IMAGE_ITEMS: { text: string; isImage: boolean }[] = [
  { text: "Deep purple kitenge, sunflower-yellow cotton, and stiff green ankara hanging from the rafters", isImage: true },
  { text: "The old sewing machine clatters rhythmically", isImage: true },
  { text: "The shop smells of fresh cloth and machine oil", isImage: true },
  { text: "Scraps of thread litter the floor like confetti", isImage: true },
  { text: "Mama Chiku has run the shop for eighteen years", isImage: false },
  { text: "She has trained six apprentices", isImage: false },
  { text: "Customers wait to be measured for the school's cultural day", isImage: false },
  { text: "Pupils will wear both modern uniforms and traditional dress", isImage: false },
];

const SENSE_PHRASES: { sense: string; phrase: string }[] = [
  { sense: "Sight", phrase: "deep purple kitenge, sunflower-yellow cotton, and stiff green ankara patterned with golden circles" },
  { sense: "Sound", phrase: "the old sewing machine clatters rhythmically" },
  { sense: "Smell", phrase: "the shop smells of fresh cloth and machine oil" },
  { sense: "Touch", phrase: "her fingers moving with practiced ease" },
];

const ORDER_ITEMS = [
  { id: "o1", label: "Fabrics hanging from the rafters" },
  { id: "o2", label: "The sewing machine clattering as Mama Chiku works" },
  { id: "o3", label: "The smell of fresh cloth and machine oil" },
  { id: "o4", label: "Customers waiting to be measured for cultural day" },
  { id: "o5", label: "Mama Chiku's eighteen years running the shop" },
];

const VOCAB_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "In the passage, the word 'apprentices' most nearly means",
    correct: "people learning a trade by working under an experienced trainer",
    distractors: ["customers who order new clothes", "old machines used for sewing", "fabrics used to make traditional dress"],
  },
  {
    q: "In the passage, the phrase 'like confetti' helps the reader understand that the thread scraps are",
    correct: "scattered loosely across the floor in small pieces",
    distractors: ["carefully folded into neat piles", "sewn tightly into the fabric", "hidden completely out of sight"],
  },
  {
    q: "In the passage, 'kitenge' and 'ankara' most likely refer to",
    correct: "types of colourful fabric",
    distractors: ["types of sewing machines", "names of the apprentices", "tools used to measure customers"],
  },
];

export const mentalImagesStrategy: Skill = {
  id: "g8-eng-r-mental-images-strategy",
  code: "R.23",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Comprehension Strategies - Mental Images",
  description: "Identify vivid, sensory language that creates mental images in a passage about a tailoring shop, and infer word meanings from context.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "order", "mc", "fill"] as const);
    const hint = "Sensory, descriptive language helps you picture, hear, or smell a scene; plain statements simply state a fact.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, IMAGE_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `i${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`i${i}`] = c.isImage ? "image" : "fact"));
      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each phrase into Creates a strong mental image or States a plain fact.",
        items,
        buckets: [
          { id: "image", label: "Creates a strong mental image" },
          { id: "fact", label: "States a plain fact" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" ${c.isImage ? "creates a vivid mental image using sensory detail" : "simply states a plain fact"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, SENSE_PHRASES.map((s) => ({ id: s.sense, label: s.sense })));
      const targets = shuffle(rng, SENSE_PHRASES.map((s) => ({ id: s.sense, label: s.phrase })));
      const correctMap: Record<string, string> = {};
      for (const s of SENSE_PHRASES) correctMap[s.sense] = s.sense;
      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each sense to the phrase in the passage that appeals to it.",
        tokens,
        targets,
        correctMap,
        hint: "Read each phrase and decide whether it describes something you would see, hear, smell, or feel.",
        explanation: SENSE_PHRASES.map((s) => `${s.sense} — "${s.phrase}."`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_ITEMS);
      return {
        kind: "ordering",
        prompt: "Arrange these details in the order they are mentioned in the passage.",
        instruction: "Click them in order.",
        passage: PASSAGE,
        items,
        correctOrder: ORDER_ITEMS.map((i) => i.id),
        hint: "Reread the passage from the beginning and note which detail comes first, second, and so on.",
        explanation: ORDER_ITEMS.map((i) => i.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the passage.",
        before: "Mama Chiku has run the shop for eighteen years and has trained six",
        after: ".",
        correctAnswer: "apprentices",
        inputMode: "text",
        hint: "The exact word is stated directly in the passage above.",
        explanation: "The passage reads: \"Mama Chiku has run the shop for eighteen years and has trained six apprentices.\"",
      };
    }

    const entry = randChoice(rng, VOCAB_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Look at the words and phrases surrounding the unfamiliar word for clues to its meaning.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
