import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.7 Guided Writing: Poetry — distinguishing a poem from prose, and composing a
// simple descriptive poem about oneself using body-part/descriptor vocabulary.

const POEM_FEATURES: { term: string; meaning: string }[] = [
  { term: "line", meaning: "one row of words in a poem, often shorter than a prose sentence" },
  { term: "stanza", meaning: "a group of lines in a poem, like a paragraph in prose" },
  { term: "rhyme", meaning: "words at the end of lines that sound alike" },
  { term: "rhythm", meaning: "the pattern of beats or stresses when a poem is read aloud" },
  { term: "prose", meaning: "ordinary writing in full sentences and paragraphs, without a line/stanza structure" },
];

const POEM_VS_PROSE: { text: string; bucket: "Poem" | "Prose" }[] = [
  { text: "My ra's is small, my yad is strong,\nI walk the tareeq all day long.", bucket: "Poem" },
  { text: "My head is small and my hands are strong. I walk on the road every day.", bucket: "Prose" },
  { text: "Tawil and nasheet, that's just me,\nRunning fast and feeling free.", bucket: "Poem" },
  { text: "I am tall and energetic. I like running fast and feeling free.", bucket: "Prose" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "A group of lines in a poem is called a ", after: ".", answer: "stanza" },
  { before: "Words at the end of lines that sound alike create ", after: ".", answer: "rhyme" },
  { before: "Ordinary writing in full sentences, without a line/stanza structure, is called ", after: ".", answer: "prose" },
  { before: "One row of words in a poem is called a ", after: ".", answer: "line" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["My ra's is small,", "my yad is strong,", "I walk the tareeq", "all day long."], sentence: "My ra's is small, my yad is strong, I walk the tareeq all day long." },
  { chunks: ["Tawil and nasheet,", "that's just me,", "Running fast", "and feeling free."], sentence: "Tawil and nasheet, that's just me, Running fast and feeling free." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which of these is written as a poem, not prose?",
    correct: "My ra's is small, my yad is strong,\nI walk the tareeq all day long.",
    distractors: ["My head is small and my hands are strong.", "I am tall and energetic.", "I walk on the road every day."],
    explanation: "The poem version is broken into short rhyming lines, unlike the flowing sentences of prose.",
  },
  {
    prompt: "What makes 'strong' and 'long' a rhyme in a poem describing your body?",
    correct: "They end with the same sound",
    distractors: ["They both start with the letter S", "They have the same number of letters", "They are both adjectives"],
    explanation: "Rhyme is about matching end-sounds, not spelling length or word type.",
  },
  {
    prompt: "You want to write a simple poem describing yourself using 'tawil' (tall). Which line fits a poem's style best?",
    correct: "Tawil and nasheet, that's just me,",
    distractors: ["I am a person who is described as tall and also energetic in general.", "The word tawil is an Arabic adjective meaning tall.", "Height and energy are two separate physical traits."],
    explanation: "A poem line is short, rhythmic, and personal — not a flat, explanatory sentence.",
  },
];

export const bodyWriting: Skill = {
  id: "g7-ar-w-body",
  code: "W.7",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Guided writing: poetry (my body)",
  description: "Learn the features that distinguish a poem from prose, and practise composing a simple self-descriptive poem.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, POEM_FEATURES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each poetry term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "A 'line' is small, a 'stanza' is a group of lines — like a word and a paragraph.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, POEM_VS_PROSE);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each piece of writing as a Poem or Prose.",
        items,
        buckets: [
          { id: "Poem", label: "Poem" },
          { id: "Prose", label: "Prose" },
        ],
        correctBucket,
        hint: "A poem is broken into short, often rhyming lines; prose flows in full sentences.",
        explanation: chosen.map((p) => `"${p.text.replace(/\n/g, " / ")}" is ${p.bucket === "Poem" ? "a poem" : "prose"}.`).join(" "),
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the pieces to form a short rhyming poem about yourself.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Look for which pieces rhyme with each other — they usually come at the end of pairs of lines.",
        explanation: `The correct poem is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing poetry term.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about the parts that make up a poem's structure.",
        explanation: `${item.before}${item.answer}${item.after}`,
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
      hint: "Think about what makes a poem's style different from a plain explanatory sentence.",
      explanation: q.explanation,
    };
  },
};
