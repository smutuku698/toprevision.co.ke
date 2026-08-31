import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { term: string; definition: string }[] = [
  { term: "Rhyme", definition: "matching sounds at the ends of lines, e.g. 'share' and 'care'" },
  { term: "Rhythm", definition: "the beat or musical pattern created by stressed and unstressed syllables" },
  { term: "Repetition", definition: "a word, line, or phrase repeated on purpose for emphasis" },
  { term: "Imagery", definition: "descriptive language that helps the reader picture, hear, or feel something" },
  { term: "Stanza", definition: "a group of lines forming one unit of a poem, like a paragraph" },
];

// A short community-values poem, split into ordered lines (unity theme).
const POEM_LINES: { id: string; label: string }[] = [
  { id: "l1", label: "In our village we stand as one," },
  { id: "l2", label: "Sharing labour till the work is done." },
  { id: "l3", label: "Respect for elders, kindness for all," },
  { id: "l4", label: "Together we rise, together we stand tall." },
];

// Example lines to sort as showing a value or as a stylistic feature used in the poem.
const EXAMPLES: { text: string; category: "unity" | "hard-work" | "respect" }[] = [
  { text: "Hand in hand we till the land as one,", category: "unity" },
  { text: "Sweat and toil until the harvest is won,", category: "hard-work" },
  { text: "Bow to the elder, heed the wise word spoken,", category: "respect" },
  { text: "Neighbours united, no bond ever broken,", category: "unity" },
  { text: "Early to rise, the fields call our name,", category: "hard-work" },
  { text: "Honour the aged, for their counsel is a flame,", category: "respect" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is rhyme in a poem?",
    correct: "Matching sounds at the ends of lines",
    distractors: ["The number of stanzas in a poem", "A poem written without any lines", "The title of the poem"],
  },
  {
    q: "Why do poets use repetition?",
    correct: "To emphasise an important word, line, or idea",
    distractors: ["To make the poem longer with no purpose", "To confuse the reader", "Because rhyme is not allowed alongside it"],
  },
  {
    q: "What is a stanza?",
    correct: "A group of lines forming one unit of a poem, like a paragraph",
    distractors: ["A single word used for rhyme", "The poem's title", "A type of punctuation used only in poems"],
  },
  {
    q: "Why are poems important in transmitting community values?",
    correct: "Their rhythm and imagery make values like unity and respect memorable and easy to pass on",
    distractors: ["Poems cannot express real values, only fiction", "Poems are only used for entertainment with no message", "Poems must always be written in a foreign language"],
  },
];

export const communityValuesPoetry: Skill = {
  id: "g8-il-w-community-values",
  code: "W.5",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Common Community Values: Creative writing - Poetry",
  description: "Identify features of a poem and write a simple poem celebrating community values such as unity, hard work, and respect.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.term })));
      const targets = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURES) correctMap[f.term] = f.term;
      return {
        kind: "click-match",
        prompt: "Match each feature/aspect of style in a poem to its definition.",
        tokens,
        targets,
        correctMap,
        hint: "Think about sound patterns (rhyme, rhythm), repeated words, descriptive language, and how lines are grouped.",
        explanation: FEATURES.map((f) => `${f.term} — ${f.definition}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, POEM_LINES);
      return {
        kind: "ordering",
        prompt: "Arrange the lines of this short poem on community unity in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: POEM_LINES.map((l) => l.id),
        hint: "Read the lines for a sense that flows and rhymes: line 2 should rhyme with line 1's ending sound pattern, and line 4 with line 3.",
        explanation: POEM_LINES.map((l) => l.label).join(" / "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, EXAMPLES);
      const buckets = [
        { id: "unity", label: "Unity" },
        { id: "hard-work", label: "Hard work" },
        { id: "respect", label: "Respect" },
      ];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each poem line by the community value it expresses.",
        items,
        buckets,
        correctBucket,
        hint: "Look for words about working together, working hard, or honouring elders.",
        explanation: chosen.map((c) => `"${c.text}" — expresses ${c.category.replace("-", " ")}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: "Descriptive language that helps the reader picture, hear, or feel something in a poem is called",
        after: ".",
        correctAnswer: "imagery",
        acceptedAnswers: [],
        inputMode: "text",
        hint: "It comes from the word 'image' — language that creates a picture in the mind.",
        explanation: "Imagery is descriptive language in a poem that helps the reader picture, hear, or feel something being described.",
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
      hint: "Poems use rhyme, rhythm, repetition, imagery, and stanzas to express ideas memorably.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
