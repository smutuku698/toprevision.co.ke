import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 9 "Patriotism", sub-strand 9.3.1
// "Functional Writing: Apology Letter" (W.9): components, format, writing letters.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ComponentEntry { component: string; example: string; meaning: string }

const COMPONENTS: ComponentEntry[] = [
  { component: "Greeting", example: "Dear Brian,", meaning: "addresses the person being apologised to" },
  { component: "Acknowledgement", example: "I know that during our class unity activity yesterday, I said some unkind things during our disagreement.", meaning: "a clear statement of what actually happened" },
  { component: "Apology statement", example: "I am truly sorry for how I acted and for disrupting our teamwork.", meaning: "an honest expression of remorse for what happened" },
  { component: "Explanation", example: "I was frustrated about losing the game, but that is no excuse for how I spoke to you.", meaning: "briefly explains what led to the situation, without excusing it" },
  { component: "Plan to make amends", example: "I promise to be more patient and to support our class's unity activities from now on.", meaning: "a promise or plan to fix the situation or do better" },
  { component: "Request for forgiveness", example: "I hope you can forgive me and that we can work together again.", meaning: "asks the person to accept the apology" },
  { component: "Closing", example: "Yours sincerely,", meaning: "a polite sign-off before the signature" },
  { component: "Signature", example: "Amina", meaning: "the writer's name at the very end of the letter" },
];

interface FillEntry { after: string; answer: string }

const FILLS: FillEntry[] = [
  { after: "addresses the person being apologised to.", answer: "greeting" },
  { after: "is a clear statement of what actually happened.", answer: "acknowledgement" },
  { after: "is an honest expression of remorse for what happened.", answer: "apology statement" },
  { after: "briefly explains what led to the situation, without excusing it.", answer: "explanation" },
  { after: "is a promise or plan to fix the situation or do better.", answer: "plan to make amends" },
  { after: "asks the person to accept the apology.", answer: "request for forgiveness" },
  { after: "is a polite sign-off before the signature.", answer: "closing" },
  { after: "is the writer's name at the very end of the letter.", answer: "signature" },
];

const APOLOGY_ORDER: { id: string; label: string }[] = COMPONENTS.map((c) => ({ id: c.component, label: `${c.component}: "${c.example}"` }));

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "I am truly sorry for how I acted and for disrupting our teamwork." Which component of an apology letter is this?`, correct: "Apology statement", wrong: ["Acknowledgement", "Explanation", "Closing"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "I know that during our class unity activity yesterday, I said some unkind things." Which component is this?`, correct: "Acknowledgement", wrong: ["Apology statement", "Request for forgiveness", "Signature"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "I promise to be more patient and to support our class's unity activities from now on." Which component is this?`, correct: "Plan to make amends", wrong: ["Greeting", "Acknowledgement", "Closing"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "I hope you can forgive me and that we can work together again." into a component group. Which component is this?`, correct: "Request for forgiveness", wrong: ["Explanation", "Greeting", "Signature"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "I was frustrated about losing the game, but that is no excuse for how I spoke to you." Which component is this?`, correct: "Explanation", wrong: ["Apology statement", "Plan to make amends", "Closing"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes an apology letter that explains what happened, but never actually says "I am sorry." What is missing?`, correct: "A clear apology statement expressing remorse", wrong: ["A greeting, since apology letters never need one", "A signature, since apology letters never need one", "Nothing is missing from the letter"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes an explanation that blames the other person entirely, with no real remorse. What is the problem?`, correct: "An explanation should not be used as an excuse — it should accompany genuine remorse", wrong: ["There is no problem — blaming the other person is always acceptable", "Explanations are never allowed in apology letters", "The letter should have skipped the explanation and greeting both"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "Dear Brian," at the start of an apology letter. Which component is this?`, correct: "Greeting", wrong: ["Closing", "Apology statement", "Request for forgiveness"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked why apology letters matter for patriotism and community unity. What is the best reason?`, correct: "They help repair relationships and restore peaceful cooperation within a community", wrong: ["They have no real connection to unity or community life", "They are only useful for business matters", "They replace the need for genuine remorse"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} signs off an apology letter with "Yours sincerely," before writing their name. Which component is "Yours sincerely,"?`, correct: "Closing", wrong: ["Greeting", "Signature", "Acknowledgement"] }; },
];

export const patriotismApologyLetter: Skill = {
  id: "g6-il-w-patriotism",
  code: "W.9",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Patriotism: writing an apology letter",
  description: "Identify the components of an apology letter and write letters that foster peaceful co-existence and unity.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A good apology letter acknowledges what happened, expresses genuine remorse, and offers a plan to make amends.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each apology-letter component with its meaning.", "each component below with its correct meaning.", "each part of an apology letter with the phrase that defines it.", "each component with what it actually means."];
      const chosen = shuffle(rng, COMPONENTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.component, label: a.component })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.component, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.component] = a.component;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.component} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each example below by which apology-letter component it is.", "each example into the correct component group.", "these examples into their correct component groups.", "each example by which part of an apology letter it represents."];
      const chosen = shuffle(rng, COMPONENTS).slice(0, 6);
      const buckets = chosen.map((c) => ({ id: c.component, label: c.component }));
      const items = chosen.map((c, i) => ({ id: `ap${i}`, label: c.example }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`ap${i}`] = c.component));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask which part of an apology letter this piece of text would appear in.", explanation: chosen.map((c) => `"${c.example}" — ${c.component}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the components of an apology letter in the correct order.", "these letter components into the order they appear.", "the components below into a sensible order.", "these parts as they would actually appear in an apology letter."];
      const items = shuffle(rng, APOLOGY_ORDER);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: APOLOGY_ORDER.map((s) => s.id), hint: "Start with a greeting, acknowledge what happened, apologise, explain, promise to make amends, ask for forgiveness, then close and sign.", explanation: APOLOGY_ORDER.map((s) => s.label).join(" → ") };
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
