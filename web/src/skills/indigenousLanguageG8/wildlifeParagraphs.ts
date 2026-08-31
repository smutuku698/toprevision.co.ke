import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { term: string; definition: string }[] = [
  { term: "Topic sentence", definition: "the first sentence of a paragraph, stating its one main idea" },
  { term: "Supporting details", definition: "facts or examples that explain and back up the topic sentence" },
  { term: "Concluding sentence", definition: "the final sentence that sums up the paragraph or links to the next one" },
  { term: "Paragraph unity", definition: "the quality of every sentence in a paragraph relating to the same main idea" },
];

const PARAGRAPH_STEPS: { id: string; label: string }[] = [
  { id: "topic", label: "Write a topic sentence stating the paragraph's main idea about wildlife" },
  { id: "detail1", label: "Add a supporting detail or example explaining the main idea" },
  { id: "detail2", label: "Add a second supporting detail or example" },
  { id: "conclude", label: "End with a concluding sentence that sums up the point" },
];

// Sentences that either belong (on-topic) or break unity (off-topic) within one paragraph about wildlife.
const SENTENCES: { text: string; category: "on-topic" | "off-topic" }[] = [
  { text: "Elephants in Tsavo travel in large family herds led by an experienced matriarch.", category: "on-topic" },
  { text: "The herd relies on the matriarch's memory of water sources during the dry season.", category: "on-topic" },
  { text: "My cousin prefers playing football over watching documentaries.", category: "off-topic" },
  { text: "Rhinos in Kenya are protected in sanctuaries because poaching nearly wiped them out.", category: "on-topic" },
  { text: "Community rangers patrol these sanctuaries daily to guard the rhinos from poachers.", category: "on-topic" },
  { text: "The market in town sells maize, beans, and secondhand clothes on Saturdays.", category: "off-topic" },
  { text: "Migratory birds visit Lake Nakuru every year to feed on its algae-rich waters.", category: "on-topic" },
  { text: "Simon's bicycle has a flat tyre that he has not yet repaired.", category: "off-topic" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does the topic sentence of a paragraph do?",
    correct: "States the paragraph's one main idea",
    distractors: ["Lists every idea the whole essay will cover", "Always asks a rhetorical question", "Must be the shortest sentence in the paragraph"],
  },
  {
    q: "What are supporting details in a paragraph about wildlife conservation?",
    correct: "Facts or examples that explain and back up the topic sentence",
    distractors: ["Sentences on any topic, related or not", "Only statistics with no explanation", "Repeats of the topic sentence"],
  },
  {
    q: "What is paragraph unity?",
    correct: "Every sentence in the paragraph relates to the same main idea",
    distractors: ["Using the same word in every sentence", "Writing paragraphs of exactly the same length", "Combining two unrelated topics into one paragraph"],
  },
  {
    q: "Why is writing about wildlife important, according to the theme?",
    correct: "It helps address the pertinent issue of preserving wildlife for future generations",
    distractors: ["It has no real purpose beyond filling pages", "It is only useful for scientists, not ordinary writers", "It replaces the need for wildlife conservation itself"],
  },
];

export const wildlifeParagraphs: Skill = {
  id: "g8-il-w-wildlife",
  code: "W.3",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Wildlife: Writing for information - Paragraphs",
  description: "Identify the features of a well-developed paragraph and sequence paragraphs on wildlife for information.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.term })));
      const targets = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURES) correctMap[f.term] = f.term;
      return {
        kind: "click-match",
        prompt: "Match each feature of a well-developed paragraph to its definition.",
        tokens,
        targets,
        correctMap,
        hint: "A good paragraph opens with its main idea, explains it, and closes it off — and every sentence stays on that idea.",
        explanation: FEATURES.map((f) => `${f.term} — ${f.definition}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SENTENCES).slice(0, 5);
      const buckets = [
        { id: "on-topic", label: "Belongs in the wildlife paragraph" },
        { id: "off-topic", label: "Breaks paragraph unity" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.category));
      return {
        kind: "categorize",
        prompt: "This paragraph is about wildlife in Kenya. Sort each sentence by whether it belongs or breaks the paragraph's unity.",
        items,
        buckets,
        correctBucket,
        hint: "A sentence belongs only if it relates to the wildlife idea being discussed.",
        explanation: chosen.map((s) => `"${s.text}" — ${s.category === "on-topic" ? "belongs, since it relates to the wildlife idea" : "breaks unity, since it is unrelated to wildlife"}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, PARAGRAPH_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of composing a well-developed paragraph on wildlife in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: PARAGRAPH_STEPS.map((s) => s.id),
        hint: "Start with the main idea, explain it with details, then close it off.",
        explanation: PARAGRAPH_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: "Every sentence in a well-developed paragraph should relate to the same main idea — this quality is called paragraph",
        after: ".",
        correctAnswer: "unity",
        acceptedAnswers: ["coherence"],
        inputMode: "text",
        hint: "It describes sentences all sticking to one shared idea.",
        explanation: "Paragraph unity means every sentence in the paragraph relates to the same main idea, so the writing does not wander off-topic.",
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "A well-developed paragraph has a topic sentence, supporting details, a concluding sentence, and unity.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
