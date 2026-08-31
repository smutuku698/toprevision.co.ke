import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 8 "Technology", sub-strand 8.3.1
// "Functional Writing: Formal Letter" (W.8): features, components, composing letters.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ComponentEntry { component: string; example: string; meaning: string }

const COMPONENTS: ComponentEntry[] = [
  { component: "Sender's address", example: "P.O. Box 123, Nairobi", meaning: "the writer's own address, placed at the top of the letter" },
  { component: "Date", example: "14th March 2026", meaning: "states when the letter was written" },
  { component: "Receiver's address", example: "The Principal, Green Valley Primary School, P.O. Box 456, Nakuru", meaning: "the address of the person or organisation the letter is sent to" },
  { component: "Salutation", example: "Dear Sir/Madam,", meaning: "the greeting at the start of the letter" },
  { component: "Subject/heading", example: "RE: REQUEST FOR A COMPUTER LAB", meaning: "a short line briefly stating what the letter is about" },
  { component: "Body", example: "I am writing to request the school consider setting up a computer lab for learners to develop digital skills.", meaning: "the main part of the letter, explaining its purpose" },
  { component: "Closing", example: "Yours faithfully,", meaning: "a polite sign-off before the signature" },
  { component: "Signature", example: "Amina Wanjiru", meaning: "the writer's name at the very end of the letter" },
];

interface FillEntry { after: string; answer: string }

const FILLS: FillEntry[] = [
  { after: "is the writer's own address, placed at the top of the letter.", answer: "sender's address" },
  { after: "states when the letter was written.", answer: "date" },
  { after: "is the address of the person the letter is sent to.", answer: "receiver's address" },
  { after: "is the greeting, such as \"Dear Sir/Madam,\".", answer: "salutation" },
  { after: "briefly states what the letter is about.", answer: "subject" },
  { after: "is the main part explaining the letter's purpose.", answer: "body" },
  { after: "is a polite sign-off, such as \"Yours faithfully,\".", answer: "closing" },
  { after: "is the writer's name at the very end of the letter.", answer: "signature" },
];

const LETTER_ORDER: { id: string; label: string }[] = COMPONENTS.map((c) => ({ id: c.component, label: `${c.component}: "${c.example}"` }));

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "RE: REQUEST FOR A COMPUTER LAB" near the top of a formal letter. Which component is this?`, correct: "Subject/heading", wrong: ["Salutation", "Closing", "Signature"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "Yours faithfully," near the end of a formal letter. Which component is this?`, correct: "Closing", wrong: ["Salutation", "Subject/heading", "Sender's address"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "Dear Sir/Madam," at the start of a formal letter. Which component is this?`, correct: "Salutation", wrong: ["Closing", "Subject/heading", "Body"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "The Principal, Green Valley Primary School, P.O. Box 456, Nakuru" into a component group. Which component is this?`, correct: "Receiver's address", wrong: ["Sender's address", "Date", "Signature"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} forgets to include a date on a formal letter requesting a computer lab. What is missing?`, correct: "Information about when the letter was written", wrong: ["Information about who wrote the letter", "The letter's subject line", "The letter's closing"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes the main explanation of why a computer lab is needed. Which component is this?`, correct: "Body", wrong: ["Salutation", "Subject/heading", "Signature"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes their own name at the very end of a formal letter, after the closing. Which component is this?`, correct: "Signature", wrong: ["Sender's address", "Salutation", "Subject/heading"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} places "P.O. Box 123, Nairobi" at the very top of a formal letter. Which component is this?`, correct: "Sender's address", wrong: ["Receiver's address", "Date", "Body"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a formal letter but skips the subject/heading entirely. What is the likely effect?`, correct: "The reader may not immediately know what the letter is about", wrong: ["There is no effect — subject headings are never useful", "The letter will automatically be rejected", "The salutation will disappear as a result"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked why formal letters use a fixed order of components. What is the best reason?`, correct: "It makes the letter clear, organised, and easy for the reader to follow", wrong: ["It has no real purpose — any order would work equally well", "It is only a tradition with no practical benefit", "It only matters for letters about technology"] }; },
];

export const technologyFormalLetter: Skill = {
  id: "g6-il-w-technology",
  code: "W.8",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Technology: writing a formal letter",
  description: "Identify the components of a formal letter and compose a well-structured letter about a technology topic.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A formal letter follows a fixed order: sender's address, date, receiver's address, salutation, subject, body, closing, signature.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each letter component with its meaning.", "each component below with its correct meaning.", "each formal-letter part with the phrase that defines it.", "each component with what it actually means."];
      const chosen = shuffle(rng, COMPONENTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.component, label: a.component })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.component, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.component] = a.component;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.component} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each example below by which letter component it is.", "each example into the correct component group.", "these examples into their correct component groups.", "each example by which part of a formal letter it represents."];
      const chosen = shuffle(rng, COMPONENTS).slice(0, 6);
      const buckets = chosen.map((c) => ({ id: c.component, label: c.component }));
      const items = chosen.map((c, i) => ({ id: `ex${i}`, label: c.example }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`ex${i}`] = c.component));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask which part of a formal letter this piece of text would appear in.", explanation: chosen.map((c) => `"${c.example}" — ${c.component}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the components of a formal letter in the correct order.", "these letter components into the order they appear.", "the components below into a sensible order.", "these parts as they would actually appear in a formal letter."];
      const items = shuffle(rng, LETTER_ORDER);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: LETTER_ORDER.map((s) => s.id), hint: "Start with the sender's address, then the date, receiver's address, salutation, subject, body, closing, and signature.", explanation: LETTER_ORDER.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the letter component that correctly completes this sentence.", "the missing component name below.", "the word that best completes this sentence.", "the correct component to finish the sentence.", "the component name that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: "The", after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `The ${entry.answer} ${entry.after}` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
