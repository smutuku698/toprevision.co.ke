import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.5 Guided Writing: Imaginative Composition — identifying features of imaginative
// writing, and creating a short imaginative text about fun/leisure activities.

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "The Arabic word for \"reading\" is ", after: ".", answer: "al-qiraa'a" },
  { before: "The Arabic word for \"swimming\" is ", after: ".", answer: "as-sibaaha" },
  { before: "The Arabic word for \"drawing\" is ", after: ".", answer: "ar-rasm" },
  { before: "The Arabic word for \"music\" is ", after: ".", answer: "al-musiqa" },
  { before: "The Arabic word for \"trip / excursion\" is ", after: ".", answer: "ar-rihla" },
];

const COMPOSITION_FEATURES: { term: string; meaning: string }[] = [
  { term: "opening", meaning: "the first part that introduces the character, place, or situation" },
  { term: "description", meaning: "vivid detail that helps the reader picture the scene" },
  { term: "imagination", meaning: "ideas and events created in the writer's own mind, not just facts" },
  { term: "ending", meaning: "the final part that closes the story or idea" },
  { term: "feeling words", meaning: "words that describe emotions, e.g. excited, happy, nervous" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["One sunny day,", "I went to ar-rihla", "with my friends", "and we felt very happy."], sentence: "One sunny day, I went to ar-rihla with my friends and we felt very happy." },
  { chunks: ["After school,", "I love as-sibaaha", "at the pool", "because it makes me feel free."], sentence: "After school, I love as-sibaaha at the pool because it makes me feel free." },
  { chunks: ["On the weekend,", "my brother and I do ar-rasm", "in the garden", "and imagine amazing creatures."], sentence: "On the weekend, my brother and I do ar-rasm in the garden and imagine amazing creatures." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which part of a composition introduces the character, place, or situation?",
    correct: "The opening",
    distractors: ["The ending", "A feeling word", "A punctuation mark"],
    explanation: "The opening is the first part of a composition — it sets up who, where, and what is happening.",
  },
  {
    prompt: "Which sentence uses the most vivid description?",
    correct: "The golden sunset painted the whole beach orange as I played as-sibaaha.",
    distractors: ["I did as-sibaaha.", "I like swimming a lot.", "Swimming is fun."],
    explanation: "Vivid description uses specific, sensory detail (like \"golden sunset painted the whole beach orange\") rather than a bare, flat statement.",
  },
  {
    prompt: "Which word best expresses a feeling?",
    correct: "excited",
    distractors: ["madrasa", "as-sibaaha", "ar-rasm"],
    explanation: "\"Excited\" is a feeling word; the others are vocabulary for a place or an activity, not an emotion.",
  },
  {
    prompt: "You are writing an imaginative story about a magical ar-rihla. Which idea fits imaginative writing best?",
    correct: "The trip led to a hidden cave full of glowing crystals",
    distractors: ["The trip was exactly like every school trip before it", "The trip only listed the bus timetable", "The trip had no characters or events at all"],
    explanation: "Imaginative writing invents events beyond plain, ordinary facts — a hidden cave of glowing crystals is a genuinely imaginative idea.",
  },
];

export const funWriting: Skill = {
  id: "g7-ar-w-fun",
  code: "W.5",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: imaginative composition (fun and enjoyment)",
  description: "Learn the features of an imaginative composition and practise building short imaginative sentences about leisure activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, COMPOSITION_FEATURES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each composition feature to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the parts of a story: how it starts, how it looks/feels, and how it ends.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const bucketItems = [
        { id: "vocab", label: "Leisure activity word", items: ["al-qiraa'a", "as-sibaaha", "ar-rasm", "al-musiqa", "ar-rihla"] },
        { id: "feature", label: "Composition feature", items: ["opening", "description", "ending", "feeling words"] },
      ];
      const picks: { id: string; label: string; bucket: string }[] = [];
      bucketItems.forEach((b) => {
        shuffle(rng, b.items).slice(0, 3).forEach((item, i) => picks.push({ id: `${b.id}-${i}-${item}`, label: item, bucket: b.id }));
      });
      const items = shuffle(rng, picks.map((p) => ({ id: p.id, label: p.label })));
      const buckets = bucketItems.map((b) => ({ id: b.id, label: b.label }));
      const correctBucket: Record<string, string> = {};
      picks.forEach((p) => (correctBucket[p.id] = p.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each word: is it a leisure activity, or a feature of a composition?",
        items,
        buckets,
        correctBucket,
        hint: "A leisure activity is something you do for fun; a composition feature is a writing-craft term.",
        explanation: picks
          .map((p) => `"${p.label}" is a ${bucketItems.find((b) => b.id === p.bucket)!.label.toLowerCase()}.`)
          .join(" "),
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the pieces to form a coherent imaginative sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Start with when/where, then the activity, then the feeling it creates.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing Arabic word to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the leisure-activity words you've learned.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    const q = randChoice(rng, MC_ITEMS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Think about what makes writing feel imaginative, not just a bare list of facts.",
      explanation: q.explanation,
    };
  },
};
