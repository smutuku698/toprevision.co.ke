import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 5 "Farm Tools", sub-strand 5.3.1
// "Creative Writing: Creative language" (W.5): proverbs, metaphors, sayings, similes.
// Only genuine, real English proverbs/sayings are used here — none are invented.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface DeviceEntry { example: string; device: string }

const DEVICES: DeviceEntry[] = [
  { example: "The jembe's blade was as sharp as a razor.", device: "Simile" },
  { example: "He worked as steady as a tractor engine.", device: "Simile" },
  { example: "Her hands moved like a well-oiled machine while weeding.", device: "Simile" },
  { example: "The old rake was as stiff as a dry stick.", device: "Simile" },
  { example: "The farm is a treasure chest of food for the family.", device: "Metaphor" },
  { example: "His jembe was his best friend in the field.", device: "Metaphor" },
  { example: "The tractor is the heart of a modern farm.", device: "Metaphor" },
  { example: "Her hands were tools of pure skill.", device: "Metaphor" },
  { example: "You reap what you sow.", device: "Proverb" },
  { example: "Rome was not built in a day.", device: "Proverb" },
  { example: "Make hay while the sun shines.", device: "Proverb" },
  { example: "A bad workman blames his tools.", device: "Proverb" },
  { example: "The early bird catches the worm.", device: "Proverb" },
  { example: "Don't count your chickens before they hatch.", device: "Proverb" },
  { example: "Many hands make light work.", device: "Saying" },
  { example: "Practice makes perfect.", device: "Saying" },
  { example: "Don't put the cart before the horse.", device: "Saying" },
  { example: "Waste not, want not.", device: "Saying" },
];

interface FillEntry { before: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "You reap what you", answer: "sow" },
  { before: "Rome was not built in a", answer: "day" },
  { before: "Make hay while the sun", answer: "shines" },
  { before: "Don't count your chickens before they", answer: "hatch" },
  { before: "Many hands make", answer: "light work" },
  { before: "Practice makes", answer: "perfect" },
  { before: "A bad workman blames his", answer: "tools" },
  { before: "The early bird catches the", answer: "worm" },
  { before: "Don't put the cart before the", answer: "horse" },
  { before: "Waste not, want", answer: "not" },
];

const CREATIVE_STEPS: { id: string; label: string }[] = [
  { id: "choose", label: "Choose the idea you want to describe vividly" },
  { id: "decide", label: "Decide whether a simile, metaphor, proverb, or saying fits best" },
  { id: "write", label: "Write the comparison or saying clearly" },
  { id: "check", label: "Check that the comparison makes sense and is not confusing" },
  { id: "read-aloud", label: "Read the sentence aloud to check it flows naturally" },
  { id: "sparingly", label: "Use the device sparingly, so it stands out rather than feeling overused" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "The jembe's blade was as sharp as a razor." Which creative-language device is this?`, correct: "Simile — it compares two things using \"as\"", wrong: ["Metaphor — it says one thing directly is another", "Proverb — it gives general life advice", "Saying — it is a well-known common phrase"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "The farm is a treasure chest of food for the family." Which creative-language device is this?`, correct: "Metaphor — it says the farm directly IS a treasure chest", wrong: ["Simile — it uses \"like\" or \"as\"", "Proverb — it gives general life advice", "Saying — it is a well-known common phrase"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} uses the proverb "You reap what you sow" in a story about a farmer. What lesson does it teach?`, correct: "Your results reflect the effort and choices you put in earlier", wrong: ["Farms should never grow more than one crop", "Reaping should always happen before sowing", "The proverb has no connection to hard work at all"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "A bad workman blames his tools." into a device category. Which category fits?`, correct: "Proverb", wrong: ["Simile", "Metaphor", "None of these"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "His jembe was his best friend in the field." What makes this a metaphor rather than a simile?`, correct: "It says the jembe directly IS his best friend, without using \"like\" or \"as\"", wrong: ["It uses the word \"as\" to compare two things", "It gives general advice about life", "It is a well-known common phrase"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} uses "Make hay while the sun shines" while writing about farm work. What does this proverb suggest?`, correct: "Take advantage of good conditions or opportunities while they last", wrong: ["Hay should only ever be made at night", "Sunlight has no effect on farm work at all", "Farmers should avoid working whenever the sun is out"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "Her hands moved like a well-oiled machine while weeding." Which device is being used?`, correct: "Simile — it compares her hands to a machine using \"like\"", wrong: ["Metaphor — it says her hands directly ARE a machine", "Proverb — it gives general life advice", "Saying — it is a well-known common phrase"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes far too many similes and metaphors in a single short paragraph about farm tools. What is the risk?`, correct: "The writing may feel overused and confusing instead of vivid", wrong: ["There is no risk — more creative language is always better", "The paragraph will automatically become shorter", "Using many devices always makes writing clearer"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} uses "Practice makes perfect" while encouraging a friend learning to use a jembe. What kind of expression is this?`, correct: "A saying — a commonly used phrase with a widely understood meaning", wrong: ["A simile comparing two unrelated things", "A metaphor describing one thing as another", "A description of the jembe's exact size"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a comparison that does not really make sense when read aloud. What should ${who} do?`, correct: "Revise the comparison so it is clear and makes logical sense", wrong: ["Leave it as it is, since creative language never needs checking", "Delete the whole sentence and topic entirely", "Replace it with an unrelated fact instead"] }; },
];

export const farmToolsCreativeLanguage: Skill = {
  id: "g6-il-w-farm-tools",
  code: "W.5",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Farm tools: creative language",
  description: "Identify and use similes, metaphors, proverbs, and sayings when writing about farm tools and farm work.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A simile compares using \"like\" or \"as\"; a metaphor says one thing directly IS another; proverbs and sayings give general, well-known advice.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each example with the device it uses.", "each example below with its correct device type.", "each sentence with the creative-language device it shows.", "each example with its matching device."];
      const chosen = shuffle(rng, DEVICES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `d${i}`, label: a.example })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `d${i}`, label: a.device })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`d${i}`] = `d${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.example}" — ${a.device}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each example below by the device it uses.", "each example into its correct device group.", "these examples into their correct groups.", "each example by whether it is a simile, metaphor, proverb, or saying."];
      const chosen = shuffle(rng, DEVICES).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.device)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `de${i}`, label: c.example }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`de${i}`] = c.device));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Look for \"like\"/\"as\" (simile), a direct \"is\" comparison (metaphor), or general life advice (proverb/saying).", explanation: chosen.map((c) => `"${c.example}" — ${c.device}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for using creative language effectively in order.", "these creative-writing steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, CREATIVE_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: CREATIVE_STEPS.map((s) => s.id), hint: "Start by choosing the idea, pick the right device, write it, check it makes sense, read it aloud, and use it sparingly.", explanation: CREATIVE_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the proverb or saying with", "Choose and write", "Supply"];
      const CLOSERS = ["the missing word that finishes this proverb.", "the rest of this proverb or saying below.", "the words that correctly complete it.", "the correct ending for the proverb.", "the words that best fit the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: "", correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer}.` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
