import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POEM_A = {
  title: "The River That Wept",
  text:
    "The river once ran silver and clean,\nFish leapt bright where the papyrus had been.\nNow oily rags drift on its skin,\nAnd plastic bottles bob and spin.\n\nWho dumped their waste where children swim?\nWho poisoned the banks so cold and dim?\nThe river weeps, though it makes no sound,\nUntil we clean what we have found.",
};

const POEM_B = {
  title: "Smoke Over the Valley",
  text:
    "Smoke over the valley, thick and grey,\nHiding the sun through half the day.\nThe factory hums both night and noon,\nIts breath will choke the sky by June.\n\nCough, cough, cough, the old men say,\nCough, cough, cough, they cannot play.\nLet us build with cleaner hands,\nAnd give clear skies back to our lands.",
};

const STRUCTURE_TERMS: { term: string; definition: string }[] = [
  { term: "Stanza", definition: "A group of lines forming a unit within a poem, like a paragraph" },
  { term: "Line", definition: "A single row of words in a poem" },
  { term: "Rhyme", definition: "The matching of similar sounds at the ends of lines" },
  { term: "Refrain", definition: "A line or phrase repeated at intervals through a poem for emphasis" },
];

const STANZA_ORDER_A = [
  { id: "a1", label: "The river once ran silver and clean," },
  { id: "a2", label: "Fish leapt bright where the papyrus had been." },
  { id: "a3", label: "Now oily rags drift on its skin," },
  { id: "a4", label: "And plastic bottles bob and spin." },
];

const STANZA_ORDER_B = [
  { id: "b1", label: "Smoke over the valley, thick and grey," },
  { id: "b2", label: "Hiding the sun through half the day." },
  { id: "b3", label: "The factory hums both night and noon," },
  { id: "b4", label: "Its breath will choke the sky by June." },
];

const RHYME_FILLS = [
  { poem: POEM_A, before: "The river once ran silver and clean,\nFish leapt bright where the papyrus had been.\nNow oily rags drift on its skin,\nAnd plastic bottles bob and", after: ".", correctAnswer: "spin" },
  { poem: POEM_B, before: "Smoke over the valley, thick and grey,\nHiding the sun through half the", after: ".", correctAnswer: "day" },
];

const MAIN_IDEA_QUESTIONS: { poem: typeof POEM_A; q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    poem: POEM_A,
    q: "What is the main idea of \"The River That Wept\"?",
    correct: "A once-clean river has become polluted with waste, and it needs to be cleaned",
    distractors: ["Fish are the only creatures that live in rivers", "Children should never swim in rivers", "Papyrus plants are harmful to rivers"],
    explanation: "The poem contrasts the river's clean past ('ran silver and clean') with its polluted present ('oily rags,' 'plastic bottles'), calling for it to be cleaned.",
  },
  {
    poem: POEM_B,
    q: "What is the main idea of \"Smoke Over the Valley\"?",
    correct: "Factory smoke is polluting the air and harming people's health, and cleaner practices are needed",
    distractors: ["Factories should run only at night", "Old men should not go outside at all", "The valley has always been covered in smoke"],
    explanation: "The poem describes smoke hiding the sun and old men coughing, then calls to 'build with cleaner hands' and restore clear skies.",
  },
];

const VALUE_QUESTIONS: { poem: typeof POEM_A; q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    poem: POEM_A,
    q: "What value does \"The River That Wept\" encourage in its readers?",
    correct: "Environmental responsibility — taking care not to pollute natural water sources",
    distractors: ["Competing to catch the most fish", "Avoiding rivers altogether out of fear", "Building more factories near rivers"],
    explanation: "By personifying the river as weeping and asking 'until we clean what we have found,' the poem urges readers to take responsibility for keeping water sources clean.",
  },
  {
    poem: POEM_B,
    q: "What value does \"Smoke Over the Valley\" encourage in its readers?",
    correct: "Community action to reduce pollution and protect public health",
    distractors: ["Ignoring pollution since it cannot be controlled", "Moving away from the valley permanently", "Letting factories operate however they choose"],
    explanation: "The poem shows pollution harming everyone ('cough, cough, cough') and ends with a call to 'build with cleaner hands,' urging collective action.",
  },
];

export const poetryStructure: Skill = {
  id: "g8-eng-r-poetry-structure",
  code: "R.6",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Poetry",
  description: "Identify aspects of structure in a poem, recognize its main ideas, and recognize the role of poems in communicating values.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "fill", "mainidea", "value"] as const);
    const hint = "Poems use structure — stanzas, lines, rhyme, and repetition — to build a message about a real issue.";

    if (branch === "match") {
      const tokens = shuffle(rng, STRUCTURE_TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, STRUCTURE_TERMS.map((t) => ({ id: t.term, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of STRUCTURE_TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each structural term used in poetry to its definition.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STRUCTURE_TERMS.map((t) => `${t.term} — ${t.definition.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const useA = rng() < 0.5;
      const stanza = useA ? STANZA_ORDER_A : STANZA_ORDER_B;
      const poem = useA ? POEM_A : POEM_B;
      const items = shuffle(rng, stanza);
      return {
        kind: "ordering",
        prompt: `Arrange the lines of the first stanza of "${poem.title}" in the correct order.`,
        instruction: "Click them in order.",
        items,
        correctOrder: stanza.map((s) => s.id),
        hint: "Read each line and think about which idea would naturally come first, and which lines rhyme at the end of pairs.",
        explanation: stanza.map((s) => s.label).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, RHYME_FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing rhyming word to complete the line.",
        passage: entry.poem.text,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look at the poem above and find the word that completes the rhyme.",
        explanation: `The full line reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "mainidea") {
      const entry = randChoice(rng, MAIN_IDEA_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: entry.poem.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, VALUE_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: entry.poem.text,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: entry.explanation,
    };
  },
};
