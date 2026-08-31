import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Poem {
  id: string;
  title: string;
  lines: string[];
  theme: string;
  /** Pairs of line indices whose end-words rhyme with each other. */
  rhymeLinePairs: [number, number][];
}

/** Extracts the final word of a poem line, stripped of trailing punctuation. */
function lastWord(line: string): string {
  const m = line.match(/([A-Za-z']+)[.,!?;:]*\s*$/);
  return m ? m[1] : "";
}

const POEMS: Poem[] = [
  {
    id: "handwash",
    title: "Wash Well",
    lines: ["Wash your hands, wash them well,", "Soap and water, a story to tell,", "Germs will vanish, germs will flee,", "Healthy hands for you and me."],
    theme: "The importance of washing hands to stay healthy and free of germs",
    rhymeLinePairs: [[0, 1], [2, 3]],
  },
  {
    id: "stigma",
    title: "Ask and Know",
    lines: ["Ask, and you shall know the truth,", "Fear not the words, seek them in youth,", "A test, a talk, a caring friend,", "Together we shall stigma end."],
    theme: "Seeking knowledge about HIV/AIDS and standing against stigma with kindness",
    rhymeLinePairs: [[0, 1], [2, 3]],
  },
  {
    id: "diet",
    title: "A Balanced Plate",
    lines: ["Sukuma green upon my plate,", "Beans and maize, I will not wait,", "Fruits for snacks instead of sweets,", "A balanced meal is hard to beat."],
    theme: "Choosing a balanced diet of vegetables, grains, and fruit for good health",
    rhymeLinePairs: [[0, 1], [2, 3]],
  },
  {
    id: "exercise",
    title: "Run at Dawn",
    lines: ["Run at dawn while the sky turns gold,", "Strong legs carry the brave and bold,", "Skip and stretch before the sun climbs high,", "A healthy body reaches for the sky."],
    theme: "Exercising daily to build a strong, healthy body",
    rhymeLinePairs: [[0, 1], [2, 3]],
  },
  {
    id: "sleep",
    title: "Rest Well",
    lines: ["When the sun sets and stars appear,", "Close your eyes, let dreams draw near,", "Eight hours rest will help you grow,", "A well-slept mind will surely glow."],
    theme: "Getting enough sleep to grow and stay healthy in mind and body",
    rhymeLinePairs: [[0, 1], [2, 3]],
  },
];

const PROSE_EXCERPTS = [
  "Washing your hands with soap and clean water removes germs that can make you sick. Health workers recommend washing hands before eating and after using the toilet.",
  "A balanced diet includes vegetables, grains, proteins, and fruits. Eating a variety of foods every day gives the body the nutrients it needs to stay strong.",
  "Regular exercise, such as running or skipping, strengthens the heart and muscles. Doctors recommend that learners stay physically active every day.",
  "Getting enough sleep each night helps the body and brain rest and recover. Most learners need about eight hours of sleep to feel refreshed in the morning.",
  "People living with HIV can lead full, healthy lives with proper medical care. Testing and honest conversation help reduce fear and unfair treatment of those affected.",
];

const FEATURES: { name: string; description: string }[] = [
  { name: "Stanza", description: "A group of lines forming a unit within a poem, similar to a paragraph in prose" },
  { name: "Rhyme", description: "Words, often at the end of lines, that share similar ending sounds" },
  { name: "Line break", description: "Where a line of a poem ends before reaching the margin, to control pace and emphasis" },
  { name: "Rhythm", description: "A regular pattern of beats or stresses that gives a poem a musical quality" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can you tell that a piece of writing is a poem rather than prose?",
    correct: "It is arranged in lines and stanzas, often with rhyme and rhythm, instead of continuous sentences in paragraphs",
    distractors: [
      "It always uses longer words than prose does",
      "It is always written by a famous author",
      "It never has any punctuation marks at all",
    ],
  },
  {
    q: "Why do learners often recite poems together as a class or group?",
    correct: "It builds teamwork and lets everyone share in the rhythm and message of the poem together",
    distractors: [
      "It is the only way a poem can ever be read",
      "It makes the poem's words change meaning",
      "It is required so that no one has to memorise the poem alone forever",
    ],
  },
  {
    q: "What is one good reason to read simple poems for enjoyment, outside of a lesson?",
    correct: "Poems can entertain, move, or inform a reader through rhythm and carefully chosen words",
    distractors: [
      "Poems have no purpose beyond passing an examination",
      "Poems must always be read silently and never aloud",
      "Poems are only appropriate for very young children",
    ],
  },
];

export const simplePoems: Skill = {
  id: "g7-eng-r-simple-poems",
  code: "R.2",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Simple Poems",
  description: "Distinguish poems from prose, recite simple health-themed poems, and identify rhyme, stanza, and rhythm.",
  generate(rng) {
    const branch = randChoice(rng, ["features", "sort", "theme", "rhyme-fill", "rhyme-match", "order", "concept"] as const);
    const hint = "A poem is written in lines and stanzas, often with rhyme and rhythm — prose flows in continuous sentences and paragraphs.";

    if (branch === "features") {
      const tokens = shuffle(rng, FEATURES.map((f) => ({ id: f.name, label: f.name })));
      const targets = shuffle(rng, FEATURES.map((f) => ({ id: f.name, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURES) correctMap[f.name] = f.name;
      return {
        kind: "click-match",
        prompt: "Match each feature of a poem to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: FEATURES.map((f) => `${f.name} — ${f.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const poemLine = randChoice(rng, POEMS);
      const proseLine = randChoice(rng, PROSE_EXCERPTS);
      const otherPoems = shuffle(rng, POEMS.filter((p) => p.id !== poemLine.id)).slice(0, 2);
      const otherProse = shuffle(rng, PROSE_EXCERPTS.filter((p) => p !== proseLine)).slice(0, 1);
      const chosen = shuffle(rng, [
        { text: poemLine.lines.join(" "), bucket: "poem" as const },
        ...otherPoems.map((p) => ({ text: p.lines.join(" "), bucket: "poem" as const })),
        { text: proseLine, bucket: "prose" as const },
        ...otherProse.map((p) => ({ text: p, bucket: "prose" as const })),
      ]);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each passage into Poem or Prose based on its form.",
        items,
        buckets: [
          { id: "poem", label: "Poem" },
          { id: "prose", label: "Prose" },
        ],
        correctBucket,
        hint: "Poems are broken into short lines with rhyme and rhythm; prose reads as continuous, full sentences.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "poem" ? "a poem, written in short rhyming lines" : "prose, written in continuous sentences"}.`).join(" "),
      };
    }

    if (branch === "theme") {
      const poem = randChoice(rng, POEMS);
      const otherThemes = shuffle(rng, POEMS.filter((p) => p.id !== poem.id).map((p) => p.theme)).slice(0, 3);
      const choices = shuffle(rng, [poem.theme, ...otherThemes]);
      return {
        kind: "multiple-choice",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: "Which of these best describes the theme or message of this poem?",
        choices,
        correctIndex: choices.indexOf(poem.theme),
        layout: "list",
        hint: "Look at the words and images the poem repeats to work out its central message.",
        explanation: `The poem "${poem.title}" is about: ${poem.theme.toLowerCase()}.`,
      };
    }

    if (branch === "rhyme-fill") {
      const poem = randChoice(rng, POEMS);
      const [firstLineIdx, secondLineIdx] = randChoice(rng, poem.rhymeLinePairs);
      const firstWord = lastWord(poem.lines[firstLineIdx]);
      const line = poem.lines[secondLineIdx];
      const secondWord = lastWord(line);
      const wordStart = line.toLowerCase().lastIndexOf(secondWord.toLowerCase());
      const before = line.slice(0, wordStart);
      const after = line.slice(wordStart + secondWord.length);
      return {
        kind: "fill-blank",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: `Fill in the missing rhyming word to complete the poem's line, which should rhyme with "${firstWord}".`,
        before: `${poem.lines.slice(0, secondLineIdx).join(" ")} ${before}`.trim(),
        after,
        correctAnswer: secondWord,
        inputMode: "text",
        hint: `Look at the earlier line ending in "${firstWord}" — the missing word should rhyme with it.`,
        explanation: `The line reads "${line}", where "${secondWord}" rhymes with "${firstWord}" earlier in the poem.`,
      };
    }

    if (branch === "rhyme-match") {
      const poem = randChoice(rng, POEMS);
      const others = shuffle(rng, POEMS.filter((p) => p.id !== poem.id)).slice(0, 2);
      const sourced: { poem: Poem; pair: [number, number] }[] = [
        ...poem.rhymeLinePairs.map((pair) => ({ poem, pair })),
        ...others.map((p) => ({ poem: p, pair: p.rhymeLinePairs[0] })),
      ];
      const allPairs = sourced.map(({ poem: p, pair: [a, b] }) => [lastWord(p.lines[a]), lastWord(p.lines[b])] as [string, string]);
      const tokens = shuffle(rng, allPairs.map((p, i) => ({ id: `t${i}`, label: p[0] })));
      const targets = shuffle(rng, allPairs.map((p, i) => ({ id: `t${i}`, label: p[1] })));
      const correctMap: Record<string, string> = {};
      allPairs.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        passage: `"${poem.title}"\n${poem.lines.join("\n")}`,
        prompt: "Match each word to the word it rhymes with.",
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud — rhyming words share the same ending sound.",
        explanation: allPairs.map((p) => `"${p[0]}" rhymes with "${p[1]}".`).join(" "),
      };
    }

    if (branch === "order") {
      const poem = randChoice(rng, POEMS);
      const items = shuffle(rng, poem.lines.map((label, i) => ({ id: `l${i}`, label })));
      return {
        kind: "ordering",
        prompt: `Arrange the lines of the poem "${poem.title}" in the correct order for recitation.`,
        instruction: "Click them in order.",
        items,
        correctOrder: poem.lines.map((_, i) => `l${i}`),
        hint: "Read each line for meaning and listen for which rhymes come first, to rebuild the poem's flow.",
        explanation: poem.lines.join(" "),
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
