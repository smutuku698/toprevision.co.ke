import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 1.0 Child Rights and Responsibilities, sub-strand 1.2 Extensive Reading:
// Reference Materials — dictionaries, junior encyclopaedias, subject-specific encyclopaedias; dictionary
// skills. See curriculum-reference/grade-5/english.json.

const RESOURCES: { name: string; use: string }[] = [
  { name: "dictionary", use: "find the meaning, spelling and pronunciation of a word" },
  { name: "thesaurus", use: "find words that mean the same (synonyms) or the opposite (antonyms)" },
  { name: "junior encyclopaedia", use: "read a short article about a topic, person or place" },
  { name: "subject-specific encyclopaedia", use: "read detailed articles about one subject, such as science or history" },
  { name: "atlas", use: "find maps and information about countries and places" },
  { name: "glossary", use: "look up special words used in one particular book" },
  { name: "index", use: "find which page of a book a topic is on" },
];

const LOOKUP: { need: string; answer: string }[] = [
  { need: "You want to know what the word 'justice' means.", answer: "dictionary" },
  { need: "You want another word for 'unfair'.", answer: "thesaurus" },
  { need: "You want to read a short article about children's rights around the world.", answer: "junior encyclopaedia" },
  { need: "You want to know which page of your Social Studies book explains 'the Constitution'.", answer: "index" },
  { need: "You want to check how to say the word 'community' aloud.", answer: "dictionary" },
  { need: "You want detailed articles only about law and government.", answer: "subject-specific encyclopaedia" },
  { need: "You want to find where a country is on a map.", answer: "atlas" },
  { need: "You want the meaning of a hard word listed at the back of your reader.", answer: "glossary" },
];

// alphabetical ordering practice — theme vocabulary
const WORD_SETS: string[][] = [
  ["abuse", "adopt", "citizen", "community", "duties"],
  ["education", "equal", "freedom", "harm", "justice"],
  ["law", "needs", "protect", "rescue", "respect"],
  ["responsible", "rights", "security", "shelter", "unfair"],
];

// guide words: a headword falls on a page whose guide words are X ... Y if X <= word <= Y alphabetically
const GUIDE: { left: string; right: string; onPage: string; notOnPage: string }[] = [
  { left: "care", right: "clothing", onPage: "citizen", notOnPage: "duties" },
  { left: "danger", right: "freedom", onPage: "education", notOnPage: "abuse" },
  { left: "harm", right: "law", onPage: "justice", notOnPage: "rescue" },
  { left: "protect", right: "shelter", onPage: "respect", notOnPage: "unfair" },
];

export const referenceMaterials: Skill = {
  id: "g5-eng-reading-reference-materials",
  code: "R.1",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Using Reference Materials",
  description: "Choose the right reference material (dictionary, thesaurus, encyclopaedia, atlas, index, glossary) for a task, and use dictionary skills — alphabetical order and guide words.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-resource", "fill-resource", "sort-alpha", "match", "order-alpha", "reason-guide"] as const);

    if (branch === "mc-resource") {
      const l = randChoice(rng, LOOKUP);
      const wrong = shuffle(rng, RESOURCES.filter((r) => r.name !== l.answer)).slice(0, 3).map((r) => r.name);
      const { choices, correctIndex } = mcFromCluster(rng, l.answer, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, l.need, "Which reference material should you use?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Meaning of a word → dictionary. Same/opposite words → thesaurus. Facts about a topic → encyclopaedia. Page number in a book → index.",
        explanation: `Use a ${l.answer} — to ${RESOURCES.find((r) => r.name === l.answer)?.use}.`,
      };
    }

    if (branch === "fill-resource") {
      const r = randChoice(rng, RESOURCES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the reference material for this task (one or two words)"),
        before: `To ${r.use}, you would use a `,
        after: ".",
        correctAnswer: r.name,
        acceptedAnswers: [r.name],
        inputMode: "text",
        hint: "Match the task to the book made for it.",
        explanation: `A ${r.name} is used to ${r.use}.`,
      };
    }

    if (branch === "sort-alpha") {
      const set = randChoice(rng, WORD_SETS);
      const half = Math.ceil(set.length / 2);
      const items = shuffle(rng, set.map((w, i) => ({ id: `w${i}`, label: w, orig: i })));
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.orig < half ? "first" : "second"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each word comes in the first half or the second half of the dictionary for this list"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "first", label: "First half (nearer A)" },
          { id: "second", label: "Second half (nearer Z)" },
        ],
        correctBucket,
        hint: "Compare the first letters; if they are the same, compare the second letters.",
        explanation: `In alphabetical order: ${set.join(", ")}. The first ${half} come in the first half.`,
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, RESOURCES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((r) => ({ id: r.name, label: r.name })));
      const targets = shuffle(rng, pool.map((r) => ({ id: r.name, label: r.use })));
      const correctMap: Record<string, string> = {};
      pool.forEach((r) => (correctMap[r.name] = r.name));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "reference material to what it is used for"),
        tokens,
        targets,
        correctMap,
        hint: "Each reference book is built for a different job.",
        explanation: pool.map((r) => `${r.name}: ${r.use}`).join("  "),
      };
    }

    if (branch === "order-alpha") {
      const set = randChoice(rng, WORD_SETS);
      const items = set.map((w) => ({ id: w, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "these words in alphabetical order, as they would appear in a dictionary"),
        instruction: "Click the words in alphabetical order.",
        items: shuffle(rng, items),
        correctOrder: [...set],
        hint: "Look at the first letter; if two words share it, look at the next letter.",
        explanation: `Alphabetical order: ${set.join(" → ")}`,
      };
    }

    // reason — Apply: guide words. Would this word be on the page?
    const g = randChoice(rng, GUIDE);
    const target = rng() < 0.5 ? g.onPage : g.notOnPage;
    const isOn = target === g.onPage;
    const correct = isOn ? "Yes — it comes between the guide words" : "No — it does not come between the guide words";
    const { choices, correctIndex } = mcFromCluster(rng, correct, [isOn ? "No — it does not come between the guide words" : "Yes — it comes between the guide words"], 1);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `A dictionary page has the guide words "${g.left}" and "${g.right}" at the top.`, `Would you find the word "${target}" on this page?`),
      choices,
      correctIndex,
      layout: "row",
      hint: "A word is on the page only if it falls alphabetically between the two guide words.",
      explanation: `"${target}" ${isOn ? "does" : "does not"} come between "${g.left}" and "${g.right}" in alphabetical order, so it ${isOn ? "would" : "would not"} be on that page.`,
    };
  },
};
