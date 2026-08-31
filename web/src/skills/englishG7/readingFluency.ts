import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Strategy = "previewing" | "skimming" | "scanning";

const STRATEGIES: { name: string; category: Strategy; description: string }[] = [
  { name: "Previewing", category: "previewing", description: "Looking at the title, headings, and pictures before reading, to predict what a text will be about" },
  { name: "Skimming", category: "skimming", description: "Reading quickly through a whole text to get its general idea, without reading every word" },
  { name: "Scanning", category: "scanning", description: "Moving your eyes quickly over a text to find one specific piece of information, such as a date or a name" },
];

const CATEGORY_LABEL: Record<Strategy, string> = {
  previewing: "Previewing",
  skimming: "Skimming",
  scanning: "Scanning",
};

const TASK_SCENARIOS: { task: string; strategy: Strategy }[] = [
  { task: "Faith has just picked up a brochure about Maasai Mara National Reserve and wants a quick idea of what it covers before deciding whether to read it fully.", strategy: "previewing" },
  { task: "Otieno has ten minutes to find out the exact opening hours of Fort Jesus Museum printed somewhere in a long visitor guide.", strategy: "scanning" },
  { task: "Amina wants to quickly get the general idea of a long magazine article about Diani Beach without reading every single sentence.", strategy: "skimming" },
  { task: "Before reading a whole article on Amboseli National Park, Kevin first looks at its title, subheadings, and photographs to guess what it discusses.", strategy: "previewing" },
  { task: "Wanjiku needs to find only the entry fee for adults listed somewhere within a long Lake Nakuru National Park pamphlet.", strategy: "scanning" },
  { task: "Brian reads through a whole passage about Hell's Gate National Park quickly, just to understand its overall topic before a class discussion.", strategy: "skimming" },
];

const PASSAGE = {
  heading: "Visiting the Nairobi National Museum",
  text: "The Nairobi National Museum, located near the city centre, opens daily from 8:30 a.m. to 5:30 p.m. It houses exhibits on Kenya's history, culture, and wildlife, including a renowned collection of prehistoric fossils. Adult entry costs 1,200 shillings, while children and students pay a reduced rate. A snake park and botanical garden sit within the same grounds, making it possible to spend a full day exploring.",
};

const SCAN_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "According to the passage, what time does the Nairobi National Museum close?", correct: "5:30 p.m.", distractors: ["8:30 a.m.", "6:00 p.m.", "4:30 p.m."] },
  { q: "According to the passage, how much does adult entry to the museum cost?", correct: "1,200 shillings", distractors: ["800 shillings", "1,500 shillings", "500 shillings"] },
  { q: "According to the passage, what two attractions sit within the same grounds as the museum?", correct: "A snake park and botanical garden", distractors: ["A swimming pool and gift shop", "A theatre and library", "A zoo and aquarium"] },
];

const ORDER_STEPS = [
  { id: "preview", label: "Preview the text's title, headings, and any images to predict its topic" },
  { id: "purpose", label: "Decide your purpose for reading — do you need the general idea, or one specific fact?" },
  { id: "skim-or-scan", label: "Skim the whole text for its general idea, or scan it for the one specific detail you need" },
  { id: "confirm", label: "Reread the relevant part closely to confirm you found the correct information" },
  { id: "use", label: "Use the information you found for your task, such as planning a visit" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is scanning a more efficient strategy than reading every word when looking for a museum's opening hours?",
    correct: "Scanning lets a reader find one specific detail quickly, without spending time on unrelated information",
    distractors: [
      "Scanning always takes longer than reading a whole text word for word",
      "Scanning replaces the need to ever read the text at all",
      "Scanning only works for texts that have no headings",
    ],
  },
  {
    q: "How does previewing a travel brochure before reading it help a reader?",
    correct: "It gives the reader a quick prediction of the topic and content, helping them decide how to approach the full text",
    distractors: [
      "Previewing tells the reader every fact in the text before they even start",
      "Previewing is only useful for fictional stories, never factual brochures",
      "Previewing has no real effect on how a reader approaches a text",
    ],
  },
  {
    q: "Kevin needs to write a short summary of what a long article about Amboseli National Park is generally about, without much time to read every sentence. Which strategy suits his task best?",
    correct: "Skimming, since it gives the general idea of a text quickly",
    distractors: [
      "Scanning, since it is only used to find single facts, not general ideas",
      "Reading every word slowly, since summaries require complete accuracy",
      "Previewing alone, since it does not cover the text's actual content",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Looking at a text's title and headings before reading it, to predict its content, is called ", after: ".", correctAnswer: "previewing" },
  { before: "Reading quickly through a whole text to understand its general idea is called ", after: ".", correctAnswer: "skimming" },
  { before: "Moving your eyes quickly over a text to find one specific fact is called ", after: ".", correctAnswer: "scanning" },
];

export const readingFluency: Skill = {
  id: "g7-eng-r-reading-fluency",
  code: "R.15",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Reading Strategies: Previewing, Skimming and Scanning",
  description: "Apply previewing, skimming, and scanning strategies to locate information efficiently in texts about Kenya's tourist attraction sites, and appreciate their value for effective reading.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "scan-passage", "order", "fill", "concept"] as const);
    const hint = "Preview a text before reading to predict its topic, skim it for the general idea, or scan it to find one specific fact quickly.";

    if (branch === "match") {
      const tokens = shuffle(rng, STRATEGIES.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, STRATEGIES.map((s) => ({ id: s.name, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of STRATEGIES) correctMap[s.name] = s.name;
      return {
        kind: "click-match",
        prompt: "Match each reading strategy to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STRATEGIES.map((s) => `${s.name} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, TASK_SCENARIOS);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.task }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t, i) => (correctBucket[`t${i}`] = t.strategy));
      return {
        kind: "categorize",
        prompt: "Sort each reading task about Kenyan tourist attractions by the strategy it calls for.",
        items,
        buckets: [
          { id: "previewing", label: CATEGORY_LABEL.previewing },
          { id: "skimming", label: CATEGORY_LABEL.skimming },
          { id: "scanning", label: CATEGORY_LABEL.scanning },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((t) => `"${t.task}" calls for ${CATEGORY_LABEL[t.strategy].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scan-passage") {
      const entry = randChoice(rng, SCAN_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: `${PASSAGE.heading}\n\n${PASSAGE.text}`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Scan the passage for the exact detail asked about, rather than rereading it from the start.",
        explanation: `The correct answer is "${entry.correct}", found by scanning the passage for that specific detail.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps a reader follows when approaching a factual text about a tourist attraction, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Start by previewing the text and deciding your purpose, before choosing to skim or scan, and finally confirming what you found.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing reading strategy term.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
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
