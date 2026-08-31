import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 5 "Farm Tools", sub-strand 5.2.1
// "Reading for Information" (R.5): vocabulary building, adverbs of time and degree, advertisements.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface AdverbEntry { adverb: string; category: string }

const ADVERBS: AdverbEntry[] = [
  { adverb: "today", category: "Time" }, { adverb: "yesterday", category: "Time" }, { adverb: "soon", category: "Time" }, { adverb: "daily", category: "Time" }, { adverb: "recently", category: "Time" }, { adverb: "weekly", category: "Time" },
  { adverb: "very", category: "Degree" }, { adverb: "extremely", category: "Degree" }, { adverb: "quite", category: "Degree" }, { adverb: "almost", category: "Degree" }, { adverb: "completely", category: "Degree" }, { adverb: "barely", category: "Degree" }, { adverb: "entirely", category: "Degree" },
];

const ADVERT_TEXT = "GREEN ACRES TOOL STORE — Quality jembes, slashers, rakes, and tractors at fair prices! Visit us in Kericho, open daily from 7am to 6pm. Ask about our weekly discount on traditional tools. Call 0712 345 678 for delivery.";

interface QAEntry { question: string; answer: string }

const ADVERT_FACTS: QAEntry[] = [
  { question: "What is the name of the store in the advert?", answer: "Green Acres Tool Store" },
  { question: "Which town is the store located in?", answer: "Kericho" },
  { question: "What time does the store open?", answer: "7am" },
  { question: "What time does the store close?", answer: "6pm" },
  { question: "How often is the store open?", answer: "Daily" },
  { question: "What kind of tools get a weekly discount?", answer: "Traditional tools" },
  { question: "What phone number should a customer call for delivery?", answer: "0712 345 678" },
  { question: "What does the advert say about the store's prices?", answer: "That they are fair" },
  { question: "What should a customer do to arrange delivery?", answer: "Call the phone number given" },
  { question: "Name one tool sold at the store, according to the advert.", answer: "A jembe, slasher, rake, or tractor" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The farmer sharpens the jembe", after: ", every single day.", answer: "daily" },
  { before: "The tractor was", after: "out of fuel by the end of the day.", answer: "almost" },
  { before: "The new rake is", after: "different from the old one.", answer: "completely" },
  { before: "The tool store received new stock just", after: ".", answer: "yesterday" },
  { before: "The slasher blade is", after: "sharp enough for the tall grass.", answer: "barely" },
  { before: "The advert says the tractor will arrive", after: ".", answer: "soon" },
  { before: "She checked the tool store's prices", after: ".", answer: "recently" },
  { before: "The rake was", after: "worn out after years of use.", answer: "entirely" },
  { before: "The farmer plans to buy a new jembe", after: ".", answer: "today" },
  { before: "The tools at the store are inspected", after: ", every single week.", answer: "weekly" },
];

const ADVERT_STEPS: { id: string; label: string }[] = [
  { id: "heading", label: "Read the advert's heading to identify what is being advertised" },
  { id: "seller", label: "Look for the seller's name and location" },
  { id: "offer", label: "Note the price, discount, or offer mentioned" },
  { id: "times", label: "Check the opening times or availability" },
  { id: "contact", label: "Find the contact details for more information" },
  { id: "relevant", label: "Decide whether the advert is relevant to what you need" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the advert "${ADVERT_TEXT}" and wants to know the store's location. Where is the store based?`, correct: "Kericho", wrong: ["Nairobi", "Nakuru", "Mombasa"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the same tool-store advert and wants to arrange a delivery. What should ${who} do?`, correct: "Call 0712 345 678", wrong: ["Visit the store's website", "Send a letter by post", "Wait for the store to contact them"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads that the store is "open daily from 7am to 6pm." What does "daily" tell the reader?`, correct: "That the store is open every day", wrong: ["That the store is open only on Mondays", "That the store is open once a week", "That the store is closing down soon"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads that the jembe blade was "barely sharp enough." What does "barely" suggest?`, correct: "That the blade was only just sharp enough, and not by much", wrong: ["That the blade was extremely sharp", "That the blade had no edge at all", "That the blade's sharpness has nothing to do with cutting"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "recently" into an adverb category. Which category does it belong to?`, correct: "Time", wrong: ["Degree", "Neither category", "Both categories equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "extremely" into an adverb category. Which category does it belong to?`, correct: "Degree", wrong: ["Time", "Neither category", "Both categories equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the advert and wants to know which tools get a weekly discount. What is the answer?`, correct: "Traditional tools", wrong: ["Only tractors", "Every item in the store", "Nothing is ever discounted"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} skims the advert quickly and misses the store's opening hours. What should ${who} do?`, correct: "Reread the advert carefully to find the specific opening times", wrong: ["Assume the store is open at all hours", "Give up on finding the information", "Guess the hours without checking the advert again"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads that a rake was "completely worn out." What does this description tell the reader?`, correct: "That the rake was fully, entirely worn out, with nothing left of its original condition", wrong: ["That the rake was only slightly worn", "That the rake was brand new", "That the rake's condition is not being described at all"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the advert's heading "GREEN ACRES TOOL STORE" before reading the rest. What is the purpose of a heading like this?`, correct: "To quickly tell the reader what or who the advert is about", wrong: ["To give the full opening hours", "To list every item's exact price", "To replace the need to read the rest of the advert"] }; },
];

export const farmToolsReadingForInformation: Skill = {
  id: "g6-il-r-farm-tools",
  code: "R.5",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Farm tools: reading for information",
  description: "Identify adverbs of time and degree, and read and interpret a farm-tools advertisement for information.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Reread the advert carefully — look for who, where, when, how much, and how to contact them.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = [`each question about the advert with its correct answer.`, `each question below with the fact it asks about.`, `each question with the correct answer from the advert.`, `each question with its matching answer.`];
      const chosen = shuffle(rng, ADVERT_FACTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `q${i}`, label: a.question })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `q${i}`, label: a.answer })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`q${i}`] = `q${i}`));
      return { kind: "click-match", prompt: `${randChoice(rng, withEach(OPENERS, CLOSERS))} Advert: "${ADVERT_TEXT}"`, tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.question}" — ${a.answer}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each adverb below into Time or Degree.", "each adverb into the group it belongs to.", "these adverbs into their correct categories.", "each adverb by whether it tells us when or how much."];
      const chosen = shuffle(rng, ADVERBS).slice(0, 8);
      const buckets = [{ id: "Time", label: "Time" }, { id: "Degree", label: "Degree" }];
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.adverb }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.category));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this word tell us WHEN something happens, or HOW MUCH of a quality it has?", explanation: chosen.map((c) => `"${c.adverb}" — ${c.category}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for reading and interpreting an advertisement in order.", "these advert-reading steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, ADVERT_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: ADVERT_STEPS.map((s) => s.id), hint: "Start with the heading, then find the seller, the offer, the times, the contact, and finally decide if it's relevant.", explanation: ADVERT_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the adverb that correctly completes this sentence.", "the missing adverb below.", "the word that best completes this sentence.", "the correct adverb to finish the sentence.", "the adverb that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
