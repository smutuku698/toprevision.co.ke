import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 8 "Technology", sub-strand 8.2.1
// "Reading for Information: Visuals" (R.8): summarising information, interpreting visuals.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VisualEntry { type: string; description: string; group: string }

const VISUALS: VisualEntry[] = [
  { type: "bar chart", description: "uses bars of different heights to compare amounts", group: "Shows quantities or comparisons" },
  { type: "pie chart", description: "is a circle divided into slices to show proportions of a whole", group: "Shows quantities or comparisons" },
  { type: "picture graph", description: "uses small pictures or icons to represent quantities", group: "Shows quantities or comparisons" },
  { type: "table", description: "arranges information in rows and columns for easy comparison", group: "Shows quantities or comparisons" },
  { type: "flowchart", description: "uses boxes and arrows to show a sequence of steps", group: "Shows order, steps, or change" },
  { type: "line graph", description: "shows how a value changes over time using a connected line", group: "Shows order, steps, or change" },
  { type: "timeline", description: "is marked with events in the order they happened", group: "Shows order, steps, or change" },
];

interface ScenarioEntry { scenario: string; visual: string }

const SCENARIOS: ScenarioEntry[] = [
  { scenario: "Show how many households in a village own a phone, a computer, and a television.", visual: "bar chart" },
  { scenario: "Show the steps to follow when setting up a new mobile phone.", visual: "flowchart" },
  { scenario: "Show how internet use in a school changed over the past five years.", visual: "line graph" },
  { scenario: "Show related ideas connected to \"technology in daily life\" — communication, learning, entertainment.", visual: "mind map" },
  { scenario: "Show what percentage of learners use a computer, tablet, or phone most often.", visual: "pie chart" },
  { scenario: "List the price, brand, and features of different printers for comparison.", visual: "table" },
  { scenario: "Show the number of computers in each classroom using small icons.", visual: "picture graph" },
  { scenario: "Show major inventions in technology in the order they happened.", visual: "timeline" },
];

interface FillEntry { after: string; answer: string }

const FILLS: FillEntry[] = [
  { after: "uses bars of different heights to compare amounts.", answer: "bar chart" },
  { after: "is a circle divided into slices to show proportions of a whole.", answer: "pie chart" },
  { after: "uses boxes and arrows to show a sequence of steps.", answer: "flowchart" },
  { after: "shows how a value changes over time using a connected line.", answer: "line graph" },
  { after: "arranges information in rows and columns.", answer: "table" },
  { after: "uses small pictures or icons to represent quantities.", answer: "picture graph" },
  { after: "is marked with events in the order they happened.", answer: "timeline" },
  { after: "connects a central idea to related ideas using branches.", answer: "mind map" },
];

const VISUAL_STEPS: { id: string; label: string }[] = [
  { id: "identify", label: "Identify the key information you want to show" },
  { id: "decide", label: "Decide what kind of information it is — amounts, steps, relationships, or changes over time" },
  { id: "choose", label: "Choose the visual type that best fits that kind of information" },
  { id: "create", label: "Draw or create the visual clearly, with labels" },
  { id: "check", label: "Check the visual accurately represents the information" },
  { id: "share", label: "Share the visual with others for feedback" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to show how many households own a phone, a computer, and a television. Which visual fits best?`, correct: "A bar chart", wrong: ["A timeline", "A mind map", "A flowchart"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to show the steps for setting up a new mobile phone. Which visual fits best?`, correct: "A flowchart", wrong: ["A pie chart", "A picture graph", "A bar chart"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to show how internet use in a school changed over five years. Which visual fits best?`, correct: "A line graph", wrong: ["A table", "A mind map", "A pie chart"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "table" into a visual group. Which group does it belong to?`, correct: "Shows quantities or comparisons", wrong: ["Shows order, steps, or change", "Neither group", "Both groups equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "timeline" into a visual group. Which group does it belong to?`, correct: "Shows order, steps, or change", wrong: ["Shows quantities or comparisons", "Neither group", "Both groups equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to show related ideas connected to "technology in daily life." Which visual fits best?`, correct: "A mind map", wrong: ["A line graph", "A table", "A timeline"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} interprets a pie chart showing device use among learners. What does each slice of the pie chart represent?`, correct: "A proportion or share of the total", wrong: ["A single step in a process", "An event that happened in the past", "A relationship between two unrelated ideas"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must compare the price, brand, and features of several printers. Which visual fits best?`, correct: "A table", wrong: ["A timeline", "A mind map", "A line graph"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} chooses a bar chart to show major technology inventions in the order they happened. Is this the best choice?`, correct: "No — a timeline fits sequences of events over time better than a bar chart", wrong: ["Yes — bar charts are always the best choice for any information", "Yes — because bar charts never show comparisons", "No — a pie chart would be even better for this"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} creates a visual but forgets to add labels explaining what it shows. What is the effect?`, correct: "Readers may not understand what the visual is meant to represent", wrong: ["There is no effect — visuals are always self-explanatory", "The visual will automatically add its own labels", "The information becomes more accurate without labels"] }; },
];

export const technologyReadingVisuals: Skill = {
  id: "g6-il-r-technology",
  code: "R.8",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Technology: reading information from visuals",
  description: "Interpret and choose the right visual (chart, graph, mind map, timeline) to summarise technology information.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Ask what kind of information you have: an amount to compare, a sequence of steps, a change over time, or related ideas.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each situation with the visual that best summarises it.", "each scenario below with the best visual type.", "each situation with the type of visual that fits it best.", "each scenario with its correct visual type."];
      const chosen = shuffle(rng, SCENARIOS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `sc${i}`, label: a.scenario })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `sc${i}`, label: a.visual })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`sc${i}`] = `sc${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.scenario}" — best shown with a ${a.visual}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each visual type below into its correct group.", "each visual type into the group it belongs to.", "these visual types into their correct groups.", "each visual type by what it is mainly used for."];
      const chosen = shuffle(rng, VISUALS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.group)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `vt${i}`, label: c.type }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`vt${i}`] = c.group));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this visual mainly compare amounts, or show a sequence, steps, or change over time?", explanation: chosen.map((c) => `${c.type} — ${c.description} (${c.group}).`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for summarising information using a visual in order.", "these visual-summarising steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, VISUAL_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: VISUAL_STEPS.map((s) => s.id), hint: "Start by identifying the information, choose the right visual type, create it, check it, and share it.", explanation: VISUAL_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the visual type that correctly completes this description.", "the missing visual type below.", "the visual type that best matches this description.", "the correct visual type to finish the sentence.", "the visual type that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: "A", after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `A ${entry.answer} ${entry.after}` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
