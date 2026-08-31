import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 2 "Environmental Conservation", sub-strand 2.3.1
// "Mechanics of writing" (W.2): imperatives, punctuation marks — the hyphen, apostrophe, brackets.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface PunctEntry { text: string; mark: string; use: string }

const PUNCT_EXAMPLES: PunctEntry[] = [
  { text: "eco-friendly practices help the environment.", mark: "Hyphen", use: "joins the compound word eco-friendly" },
  { text: "re-use old bottles for planting seedlings.", mark: "Hyphen", use: "joins the compound word re-use" },
  { text: "a well-known conservation area near the river.", mark: "Hyphen", use: "joins the compound adjective well-known" },
  { text: "the river's banks were lined with litter.", mark: "Apostrophe", use: "shows possession — the banks belonging to the river" },
  { text: "the community's forest needs protecting.", mark: "Apostrophe", use: "shows possession — the forest belonging to the community" },
  { text: "don't litter along the riverbank.", mark: "Apostrophe", use: "forms the contraction don't (do not)" },
  { text: "it's important to recycle plastic.", mark: "Apostrophe", use: "forms the contraction it's (it is)" },
  { text: "the county government (through its environment department) launched a clean-up.", mark: "Brackets", use: "adds extra information about who is involved" },
  { text: "conserve water (especially during the dry season).", mark: "Brackets", use: "adds extra information about when it matters most" },
  { text: "recycling (turning waste into something new) reduces pollution.", mark: "Brackets", use: "adds a brief explanation of what recycling means" },
];

interface FillEntry { after: string; answer: string }

const FILLS: FillEntry[] = [
  { after: "a tree today.", answer: "Plant" },
  { after: "plastic bottles instead of throwing them away.", answer: "Recycle" },
  { after: "water whenever possible.", answer: "Conserve" },
  { after: "waste by reusing old materials.", answer: "Reduce" },
  { after: "the wetlands from pollution.", answer: "Protect" },
  { after: "off lights when leaving a room.", answer: "Turn" },
  { after: "up litter in your local park.", answer: "Clean" },
  { after: "the forest for future generations.", answer: "Preserve" },
  { after: "illegal dumping to the authorities.", answer: "Report" },
  { after: "containers before recycling them.", answer: "Reuse" },
];

const PUNCTUATE_STEPS: { id: string; label: string }[] = [
  { id: "draft", label: "Write the sentence first without worrying about punctuation" },
  { id: "hyphen", label: "Reread the sentence to find compound words needing hyphens" },
  { id: "apostrophe", label: "Check for possessives or contractions needing apostrophes" },
  { id: "brackets", label: "Add brackets around any extra, non-essential information" },
  { id: "recheck", label: "Reread the whole sentence to check the punctuation makes sense" },
  { id: "correct", label: "Correct any mistakes found during the check" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "the rivers banks were lined with litter" without an apostrophe. What is missing?`, correct: "An apostrophe to show possession: \"the river's banks\"", wrong: ["A hyphen joining \"rivers\" and \"banks\"", "Brackets around \"banks\"", "Nothing is missing from the sentence"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "eco friendly practices help the environment" without a hyphen. What is missing?`, correct: "A hyphen joining the compound word: \"eco-friendly\"", wrong: ["An apostrophe after \"eco\"", "Brackets around \"friendly\"", "Nothing is missing from the sentence"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "The county government through its environment department launched a clean-up." without setting apart the extra detail. What punctuation could help?`, correct: "Brackets around \"through its environment department\"", wrong: ["An apostrophe after \"government\"", "A hyphen between \"clean\" and \"up\" only", "No punctuation is needed at all"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "don't litter along the riverbank." by the punctuation mark it uses. Which mark is it?`, correct: "Apostrophe", wrong: ["Hyphen", "Brackets", "None of these"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "conserve water (especially during the dry season)." by the punctuation mark it uses. Which mark is it?`, correct: "Brackets", wrong: ["Hyphen", "Apostrophe", "None of these"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Plant a tree today." What kind of sentence is this?`, correct: "An imperative sentence — it gives a command or instruction", wrong: ["A question, asking for information", "A statement describing a fact", "An apology for something that happened"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "recycling turning waste into something new reduces pollution." without setting apart the explanation. What is missing?`, correct: "Brackets around \"turning waste into something new\"", wrong: ["An apostrophe after \"recycling\"", "A hyphen between \"waste\" and \"into\"", "Nothing is missing"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must choose the correct contraction for "it is important to recycle plastic." Which is correct?`, correct: "It's important to recycle plastic.", wrong: ["Its important to recycle plastic.", "Its' important to recycle plastic.", "It' is important to recycle plastic."] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} uses brackets to add "(especially during the dry season)" to a sentence about conserving water. What is the purpose of the brackets here?`, correct: "To add extra, non-essential information without disrupting the main sentence", wrong: ["To show that the words inside are the most important part", "To replace a full stop at the end of the sentence", "To form a contraction"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "a well known conservation area near the river." without a hyphen. What is missing?`, correct: "A hyphen joining the compound adjective: \"well-known\"", wrong: ["An apostrophe after \"well\"", "Brackets around \"known\"", "Nothing is missing"] }; },
];

export const environmentMechanicsOfWriting: Skill = {
  id: "g6-il-w-environment",
  code: "W.2",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Environmental conservation: mechanics of writing",
  description: "Identify imperatives and use the hyphen, apostrophe, and brackets correctly in writing about conservation.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Hyphens join compound words; apostrophes show possession or contractions; brackets add extra, non-essential information.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each sentence with the punctuation mark it uses.", "each sentence below with its punctuation mark.", "each sentence with what its punctuation is doing.", "each sentence with the mark it demonstrates."];
      const chosen = shuffle(rng, PUNCT_EXAMPLES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `pu${i}`, label: a.text })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `pu${i}`, label: a.mark })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`pu${i}`] = `pu${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.text}" — ${a.mark}, ${a.use}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence below by the punctuation mark it uses.", "each sentence into the correct punctuation group.", "these sentences into their correct groups.", "each sentence by whether it uses a hyphen, an apostrophe, or brackets."];
      const chosen = shuffle(rng, PUNCT_EXAMPLES).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.mark)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `pc${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`pc${i}`] = c.mark));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Look for a joined compound word (hyphen), a possessive or contraction (apostrophe), or extra information set apart (brackets).", explanation: chosen.map((c) => `"${c.text}" — ${c.mark}: ${c.use}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for punctuating a piece of writing in order.", "these punctuation-checking steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, PUNCTUATE_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: PUNCTUATE_STEPS.map((s) => s.id), hint: "Start by drafting the sentence, then check for hyphens, apostrophes, and brackets, then reread and correct.", explanation: PUNCTUATE_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the imperative verb that correctly begins this sentence.", "the missing command word below.", "the word that best begins this instruction.", "the correct imperative to start the sentence.", "the command word that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: "", after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.answer} ${entry.after}` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
