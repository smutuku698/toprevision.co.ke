import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STANZA_1 = "Before we eat, before we play,\nWash your hands the healthy way.\nSoap and water, rub with care,\nGerms and dirt vanish in the air.";
const STANZA_2 = "After the toilet, after we sneeze,\nClean hands stop the coughs and wheeze.\nFingernails short, and faces bright,\nKeep sickness far away tonight.";
const STANZA_3 = "A simple habit, small and true,\nProtects your family, me, and you.\nSo scrub and rinse, and dry them well,\nGood hygiene is a story we tell.";

const POEM_TEXT = `${STANZA_1}\n\n${STANZA_2}\n\n${STANZA_3}`;

const STANZAS = [
  { id: "s1", label: STANZA_1 },
  { id: "s2", label: STANZA_2 },
  { id: "s3", label: STANZA_3 },
];

const STRUCTURE_TERMS: { term: string; def: string }[] = [
  { term: "Stanza", def: "A group of lines forming a unit within a poem, similar to a paragraph" },
  { term: "Line", def: "A single row of words within a stanza of a poem" },
  { term: "Rhyme", def: "Words at the ends of lines that share similar ending sounds" },
  { term: "Refrain", def: "A word or idea repeated at intervals throughout a poem for emphasis" },
];

const STRUCTURE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "How many stanzas does this poem have?",
    correct: "3",
    distractors: ["2", "4", "5"],
    explanation: "The poem is divided into three groups of lines separated by blank lines — each group is a stanza.",
  },
  {
    q: "How many lines are in each stanza of this poem?",
    correct: "4",
    distractors: ["2", "3", "6"],
    explanation: "Each of the three stanzas has exactly four lines.",
  },
  {
    q: "How many lines does this poem have in total?",
    correct: "12",
    distractors: ["8", "9", "16"],
    explanation: "There are 3 stanzas with 4 lines each, so 3 × 4 = 12 lines in total.",
  },
];

const RHYME_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which pair of words rhymes at the end of the first stanza's lines?",
    correct: "care / air",
    distractors: ["care / play", "way / air", "eat / play"],
    explanation: "In the first stanza, 'care' ends the third line and 'air' ends the fourth line — they rhyme.",
  },
  {
    q: "Which pair of words rhymes at the end of the third stanza's lines?",
    correct: "well / tell",
    distractors: ["true / well", "you / true", "small / you"],
    explanation: "In the third stanza, 'well' ends the third line and 'tell' ends the fourth line — they rhyme.",
  },
];

const MESSAGE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why might the poet use short, rhyming lines grouped into stanzas throughout this poem about hygiene?",
    correct: "The steady rhythm and rhyme make the hygiene message easy to remember and recite",
    distractors: [
      "Short lines make the poem harder to understand",
      "Rhyme has no effect on how a poem is remembered",
      "Stanzas are only used to make a poem look longer",
    ],
    explanation: "Rhyme and a regular stanza structure create a rhythm that makes a message — like washing hands — easier for readers, especially children, to remember and repeat.",
  },
  {
    q: "Why does the poet organise the poem into three separate stanzas instead of one long block of lines?",
    correct: "Each stanza focuses on a different moment for practising hygiene, making the ideas easier to follow",
    distractors: [
      "To make the poem more difficult to read aloud",
      "Because poems are never allowed to have more than one stanza",
      "To hide the poem's message from the reader",
    ],
    explanation: "Stanza 1 focuses on eating/playing, stanza 2 on the toilet/sneezing, and stanza 3 on the overall habit — separating them into stanzas organises these related but distinct ideas.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Before we eat, before we play,\nWash your hands the healthy", after: ".", correctAnswer: "way" },
  { before: "After the toilet, after we sneeze,\nClean hands stop the coughs and", after: ".", correctAnswer: "wheeze" },
  { before: "So scrub and rinse, and dry them well,\nGood hygiene is a story we", after: ".", correctAnswer: "tell" },
];

export const poetryStructure: Skill = {
  id: "g7-eng-r-poetry-structure",
  code: "R.18",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Poetry Structure",
  description: "Explain and analyse the structure of simple poems — stanzas, lines, and rhyme — and appreciate how structure helps communicate a message about hygiene.",
  generate(rng) {
    const branch = randChoice(rng, ["structure", "term", "rhyme", "message", "fill", "order"] as const);
    const hint = "A stanza is a group of lines; count carefully and look at how the lines are grouped and how they end.";

    if (branch === "structure") {
      const entry = randChoice(rng, STRUCTURE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM_TEXT,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "term") {
      const tokens = shuffle(rng, STRUCTURE_TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, STRUCTURE_TERMS.map((t) => ({ id: t.term, label: t.def })));
      const correctMap: Record<string, string> = {};
      for (const t of STRUCTURE_TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each term about poetry structure to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about how a poem is built, from single lines up to the whole poem.",
        explanation: STRUCTURE_TERMS.map((t) => `${t.term} — ${t.def.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "rhyme") {
      const entry = randChoice(rng, RHYME_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM_TEXT,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Read the last word of each line in that stanza aloud and listen for matching sounds.",
        explanation: entry.explanation,
      };
    }

    if (branch === "message") {
      const entry = randChoice(rng, MESSAGE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM_TEXT,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about how the way a poem is built helps its message stick in a reader's mind.",
        explanation: entry.explanation,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word that completes the line and its rhyme.",
        passage: POEM_TEXT,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the word in the poem above, and notice it rhymes with the line before it.",
        explanation: `The line reads: "...${entry.correctAnswer}${entry.after}"`,
      };
    }

    const items = shuffle(rng, STANZAS);
    return {
      kind: "ordering",
      prompt: "Arrange the three stanzas of the hygiene poem in their original order.",
      instruction: "Click them in order.",
      items,
      correctOrder: STANZAS.map((s) => s.id),
      hint: "The poem moves from washing before eating and playing, to after the toilet and sneezing, to the overall habit of hygiene.",
      explanation: "The original order is: stanza about eating/playing, then the toilet/sneezing stanza, then the closing stanza about the habit of hygiene.",
    };
  },
};
