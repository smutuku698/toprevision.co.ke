import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const REFERENCE_MATERIALS: { name: string; use: string }[] = [
  { name: "Dictionary", use: "Finding the meaning, spelling, or pronunciation of a word" },
  { name: "Encyclopedia", use: "Finding detailed general facts and background information on a topic" },
  { name: "Atlas", use: "Finding maps and geographic information, such as countries, distances, and borders" },
  { name: "Thesaurus", use: "Finding synonyms and antonyms for a word" },
  { name: "Almanac", use: "Finding statistics, dates, and yearly facts, such as rainfall records or public holidays" },
  { name: "Internet search engine", use: "Quickly searching many different sources for almost any topic" },
];

const SCENARIOS: { text: string; material: string }[] = [
  { text: "A student wants to find a synonym for the word 'happy'.", material: "Thesaurus" },
  { text: "A student wants to check the correct spelling of the word 'necessary'.", material: "Dictionary" },
  { text: "A student wants to see the location of countries in East Africa on a map.", material: "Atlas" },
  { text: "A student wants to read a detailed article about how volcanoes form.", material: "Encyclopedia" },
  { text: "A student wants last year's rainfall statistics for their county.", material: "Almanac" },
  { text: "A student wants to quickly find several different websites about recycling.", material: "Internet search engine" },
  { text: "A student cannot pronounce a new word and wants to check how it sounds.", material: "Dictionary" },
  { text: "A student wants to avoid repeating the word 'good' too many times in an essay.", material: "Thesaurus" },
];

const USE_STEPS = [
  { id: "decide", label: "Decide what topic, word, or fact you need information about" },
  { id: "choose", label: "Choose the reference material that best matches your need" },
  { id: "locate", label: "Use the index, guide words, or table of contents to locate it quickly" },
  { id: "read", label: "Read the relevant section closely and note the information you need" },
];

const FILL_ITEMS = [
  { before: "To find synonyms for the word 'brave', Achieng consulted a", after: ".", correctAnswer: "thesaurus" },
  { before: "To check the location of the Rift Valley on a map, Otieno opened an", after: ".", correctAnswer: "atlas" },
  { before: "To find last year's public holiday dates quickly, Wanjiru looked in an", after: ".", correctAnswer: "almanac" },
  { before: "To find the exact spelling of a difficult word, Kiptoo checked a", after: ".", correctAnswer: "dictionary" },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the importance of reference materials?",
    correct: "They help a person find accurate, organised information quickly for a specific purpose",
    distractors: ["They replace the need to think or reason at all", "They are only useful for writing exams", "They can only be used by teachers, not students"],
  },
  {
    q: "How can one use reference materials appropriately?",
    correct: "By choosing the material that matches the task, then using its features, such as an index or guide words, to find information efficiently",
    distractors: ["By reading the entire book from cover to cover every time", "By using only one type of reference material for every task", "By guessing the information instead of looking it up"],
  },
  {
    q: "Why are reference materials important for lifelong learning?",
    correct: "They allow a person to keep finding accurate information and learning new things long after leaving school",
    distractors: ["They are useful only while a person is still in school", "They stop being useful once someone learns to read", "They are only needed for one subject, such as English"],
  },
];

export const referenceMaterials: Skill = {
  id: "g8-eng-r-reference-materials",
  code: "R.9",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Study Skills: Reference Materials",
  description: "Select and use reference materials such as dictionaries, encyclopedias, atlases, thesauruses, almanacs, and search engines for varied tasks.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Match the task to the reference material designed for it: word meanings, maps, synonyms, statistics, general facts, or wide searching.";

    if (branch === "match") {
      const chosen = shuffle(rng, REFERENCE_MATERIALS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.name, label: m.name })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.name, label: m.use })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.name] = m.name;
      return {
        kind: "click-match",
        prompt: "Match each reference material to what it is best used for.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((m) => `${m.name} — ${m.use.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 5);
      const materials = Array.from(new Set(chosen.map((s) => s.material)));
      const buckets = materials.map((m) => ({ id: m, label: m }));
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.material));
      return {
        kind: "categorize",
        prompt: "Sort each task by the reference material that would best help.",
        items,
        buckets,
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}" — best solved using a ${s.material.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, USE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for using a reference material effectively in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: USE_STEPS.map((s) => s.id),
        hint: "First decide what you need, then choose the right material, then locate the section, then read it closely.",
        explanation: USE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing reference material.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const useScenario = rng() < 0.5;
    if (useScenario) {
      const s = randChoice(rng, SCENARIOS);
      const otherMaterials = REFERENCE_MATERIALS.map((m) => m.name).filter((n) => n !== s.material);
      const distractors = shuffle(rng, otherMaterials).slice(0, 3);
      const choices = shuffle(rng, [s.material, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${s.text} Which reference material should they use?`,
        choices,
        correctIndex: choices.indexOf(s.material),
        layout: "list",
        hint,
        explanation: `The correct answer is "${s.material}", since it is designed for tasks like this: ${REFERENCE_MATERIALS.find((m) => m.name === s.material)!.use.toLowerCase()}.`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
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
