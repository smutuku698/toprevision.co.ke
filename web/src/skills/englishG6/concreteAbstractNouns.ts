import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./grammarSharedA";

type NounItem = { word: string; kind: "concrete" | "abstract" };

// 32 nouns — well above the Grade 6 30+ floor — half concrete (can be seen/touched), half abstract
// (cannot be seen/touched), matching the theme's own key inquiry question.
const NOUNS: NounItem[] = [
  { word: "chair", kind: "concrete" }, { word: "book", kind: "concrete" }, { word: "mango", kind: "concrete" },
  { word: "goat", kind: "concrete" }, { word: "river", kind: "concrete" }, { word: "shoe", kind: "concrete" },
  { word: "table", kind: "concrete" }, { word: "bicycle", kind: "concrete" }, { word: "drum", kind: "concrete" },
  { word: "flower", kind: "concrete" }, { word: "cup", kind: "concrete" }, { word: "mountain", kind: "concrete" },
  { word: "basket", kind: "concrete" }, { word: "dog", kind: "concrete" }, { word: "school", kind: "concrete" },
  { word: "guitar", kind: "concrete" },
  { word: "happiness", kind: "abstract" }, { word: "honesty", kind: "abstract" }, { word: "courage", kind: "abstract" },
  { word: "freedom", kind: "abstract" }, { word: "love", kind: "abstract" }, { word: "friendship", kind: "abstract" },
  { word: "peace", kind: "abstract" }, { word: "anger", kind: "abstract" }, { word: "wisdom", kind: "abstract" },
  { word: "kindness", kind: "abstract" }, { word: "patience", kind: "abstract" }, { word: "fear", kind: "abstract" },
  { word: "joy", kind: "abstract" }, { word: "trust", kind: "abstract" }, { word: "pride", kind: "abstract" },
  { word: "hope", kind: "abstract" },
];

// Scenario templates using each noun in a natural sentence, matching the theme's Scenario+Hook
// requirement (not a bare word list). 16 templates, well above the floor.
const SCENARIOS: { noun: string; kind: "concrete" | "abstract"; sentence: (n: string, p: string) => string }[] = [
  { noun: "chair", kind: "concrete", sentence: (n) => `${n} sat on a wooden ___ in the classroom.` },
  { noun: "mango", kind: "concrete", sentence: (n) => `${n} picked a ripe ___ from the tree.` },
  { noun: "river", kind: "concrete", sentence: (n, p) => `The ___ near ${p} was full after the heavy rains.` },
  { noun: "goat", kind: "concrete", sentence: (n) => `${n} led the ___ back to its pen.` },
  { noun: "bicycle", kind: "concrete", sentence: (n) => `${n} rode a new ___ to school.` },
  { noun: "drum", kind: "concrete", sentence: () => `The performer beat the ___ during the festival.` },
  { noun: "basket", kind: "concrete", sentence: (n) => `${n} carried a ___ full of vegetables.` },
  { noun: "school", kind: "concrete", sentence: (n, p) => `${n} walks to the ___ in ${p} every morning.` },
  { noun: "happiness", kind: "abstract", sentence: (n) => `Winning the match filled ${n} with great ___.` },
  { noun: "honesty", kind: "abstract", sentence: () => `The teacher praised the pupil's ___ for admitting the mistake.` },
  { noun: "courage", kind: "abstract", sentence: (n) => `It took a lot of ___ for ${n} to speak in front of the class.` },
  { noun: "freedom", kind: "abstract", sentence: () => `Kenyans celebrate their ___ every Jamhuri Day.` },
  { noun: "friendship", kind: "abstract", sentence: (n) => `${n} valued the ___ built over many years at school.` },
  { noun: "peace", kind: "abstract", sentence: () => `The elders called for ___ between the two villages.` },
  { noun: "kindness", kind: "abstract", sentence: (n) => `${n} showed great ___ by helping the injured stranger.` },
  { noun: "wisdom", kind: "abstract", sentence: () => `The grandmother's ___ guided the whole family.` },
];

export const concreteAbstractNouns: Skill = {
  id: "g6-eng-grammar-concrete-abstract-nouns",
  code: "G.2",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Concrete and Abstract Nouns",
  description: "Identify and use concrete nouns (things you can see and touch) and abstract nouns (things you cannot see or touch) correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-identify", "categorize", "click-match", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, SCENARIOS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const full = item.sentence(name, place);
      const [before, after] = full.split("___");
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence using a ${item.kind} noun that fits.`,
        before,
        after,
        correctAnswer: item.noun,
        inputMode: "text",
        hint: item.kind === "concrete" ? "This noun names something you can see and touch." : "This noun names an idea, quality or feeling you cannot see or touch.",
        explanation: `"${item.noun}" is a ${item.kind} noun — ${item.kind === "concrete" ? "it names a physical thing you can see and touch" : "it names an idea, quality, or feeling that has no physical form"}.`,
      };
    }

    if (branch === "mc-identify") {
      const item = randChoice(rng, NOUNS);
      const sameKindPool = NOUNS.filter((n) => n.kind === item.kind && n.word !== item.word);
      const otherKindPool = NOUNS.filter((n) => n.kind !== item.kind);
      // Curated confusable cluster: 1 correct + 2 same-kind distractors + 1 opposite-kind distractor,
      // so the question tests recognizing THIS specific word, not just guessing kind.
      const distractors = shuffle(rng, [...shuffle(rng, sameKindPool).slice(0, 2).map((n) => n.word), shuffle(rng, otherKindPool)[0].word]);
      const choices = shuffle(rng, [item.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these is a${item.kind === "abstract" ? "n" : ""} ${item.kind} noun?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: item.kind === "concrete" ? "Look for something physical you could pick up." : "Look for a feeling, quality, or idea.",
        explanation: `"${item.word}" is ${item.kind === "abstract" ? "an" : "a"} ${item.kind} noun.`,
      };
    }

    if (branch === "categorize") {
      const pool = shuffle(rng, NOUNS).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const n of pool) correctBucket[n.word] = n.kind;
      return {
        kind: "categorize",
        prompt: "Sort these nouns: is it CONCRETE (you can see/touch it), or ABSTRACT (you cannot see/touch it)?",
        items: pool.map((n) => ({ id: n.word, label: n.word })),
        buckets: [
          { id: "concrete", label: "Concrete" },
          { id: "abstract", label: "Abstract" },
        ],
        correctBucket,
        hint: "Ask yourself: can I physically touch this?",
        explanation: pool.map((n) => `"${n.word}" is ${n.kind}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const concretePool = shuffle(rng, NOUNS.filter((n) => n.kind === "concrete")).slice(0, 4);
      const abstractPool = shuffle(rng, NOUNS.filter((n) => n.kind === "abstract")).slice(0, 4);
      const pool = shuffle(rng, [...concretePool, ...abstractPool]);
      const tokens = shuffle(rng, pool.map((n) => ({ id: n.word, label: n.word })));
      const targets = shuffle(rng, pool.map((n) => ({ id: n.word, label: n.kind === "concrete" ? "Concrete (physical thing)" : "Abstract (idea or feeling)" })));
      const correctMap: Record<string, string> = {};
      for (const n of pool) correctMap[n.word] = n.word;
      return {
        kind: "click-match",
        prompt: "Match each noun to whether it is concrete or abstract.",
        tokens,
        targets,
        correctMap,
        hint: "A concrete noun names a physical thing; an abstract noun names an idea or feeling.",
        explanation: pool.map((n) => `"${n.word}" is ${n.kind}.`).join(" "),
      };
    }

    const item = randChoice(rng, SCENARIOS);
    const name = randChoice(rng, KENYAN_NAMES);
    const place = randChoice(rng, KENYAN_PLACES);
    const full = item.sentence(name, place).replace("___", item.noun);
    const words = full.replace(".", "").split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct sentence.",
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: `The noun "${item.noun}" is ${item.kind} — it fits naturally into the sentence.`,
      explanation: `The correct sentence is: "${cap(full)}"`,
    };
  },
};
