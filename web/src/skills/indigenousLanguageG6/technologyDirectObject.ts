import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 8 "Technology", sub-strand 8.1.1
// "Expressing Personal Opinions: Direct Object" (LS.8).

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface DoSentence { sentence: string; directObject: string }

const DO_SENTENCES: DoSentence[] = [
  { sentence: "The learner cleaned the computer.", directObject: "the computer" },
  { sentence: "She browsed the internet for information.", directObject: "the internet" },
  { sentence: "The teacher switched off the television.", directObject: "the television" },
  { sentence: "He charged his mobile phone overnight.", directObject: "his mobile phone" },
  { sentence: "The technician repaired the printer.", directObject: "the printer" },
  { sentence: "The driver started the vehicle.", directObject: "the vehicle" },
  { sentence: "The user opened the application.", directObject: "the application" },
  { sentence: "The engineer designed a new machine.", directObject: "a new machine" },
  { sentence: "The class shared the computer during the lesson.", directObject: "the computer" },
  { sentence: "She downloaded a document from the internet.", directObject: "a document" },
  { sentence: "The librarian printed the report.", directObject: "the report" },
  { sentence: "The student saved the file on the computer.", directObject: "the file" },
];

interface OpinionPhrase { phrase: string; style: string }

const OPINION_PHRASES: OpinionPhrase[] = [
  { phrase: "In my opinion, digital devices should be used carefully.", style: "Respectful" },
  { phrase: "I believe that everyone should learn basic computer skills.", style: "Respectful" },
  { phrase: "I respectfully disagree, because both views have merit.", style: "Respectful" },
  { phrase: "I understand your view, but I see it differently.", style: "Respectful" },
  { phrase: "From my perspective, technology can help learners a lot.", style: "Respectful" },
  { phrase: "I feel that we should share devices fairly in class.", style: "Respectful" },
  { phrase: "You're just wrong about that.", style: "Disrespectful" },
  { phrase: "That's a silly idea, obviously.", style: "Disrespectful" },
  { phrase: "Nobody asked what you think.", style: "Disrespectful" },
  { phrase: "You always say things that make no sense.", style: "Disrespectful" },
  { phrase: "That opinion is stupid and not worth hearing.", style: "Disrespectful" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The learner cleaned the", after: "before the lesson began.", answer: "computer" },
  { before: "She browsed the", after: "to find information for her project.", answer: "internet" },
  { before: "The teacher switched off the", after: "after the news ended.", answer: "television" },
  { before: "He charged his mobile", after: "overnight so it would be ready.", answer: "phone" },
  { before: "The technician repaired the", after: "so it could print again.", answer: "printer" },
  { before: "The driver started the", after: "before setting off to school.", answer: "vehicle" },
  { before: "The engineer designed a new", after: "to help farmers dig faster.", answer: "machine" },
  { before: "Every", after: "should keep their password private.", answer: "user" },
  { before: "The class shared one", after: "during the computer lesson.", answer: "computer" },
  { before: "She downloaded a document from the", after: "for her homework.", answer: "internet" },
];

const IDENTIFY_STEPS: { id: string; label: string }[] = [
  { id: "verb", label: "Find the main verb — the action word — in the sentence" },
  { id: "ask", label: "Ask \"what?\" or \"whom?\" right after the verb" },
  { id: "answer", label: "The word or phrase that answers that question is the direct object" },
  { id: "receives", label: "Check that the direct object receives the action directly" },
  { id: "not-subject", label: "Confirm the direct object is not the subject doing the action" },
  { id: "reread", label: "Reread the sentence with the direct object to confirm it makes sense" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The technician repaired the printer." What is the direct object of this sentence?`, correct: "the printer", wrong: ["the technician", "repaired", "the sentence has no direct object"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "She browsed the internet for information." What receives the action of browsing?`, correct: "the internet", wrong: ["She", "information", "browsed"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must identify the direct object in "The driver started the vehicle." Which word or phrase is it?`, correct: "the vehicle", wrong: ["The driver", "started", "there is no direct object"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} shares an opinion about screen time by saying "That's a silly idea, obviously." Is this a respectful way to express an opinion?`, correct: "No — it dismisses the other person's idea without giving a reason", wrong: ["Yes — because it states an opinion clearly", "Yes — because it uses the word \"obviously\"", "No — because it is too long"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} wants to disagree with a classmate's opinion about technology respectfully. Which phrase is the best choice?`, correct: `"I respectfully disagree, because both views have merit."`, wrong: [`"You're just wrong about that."`, `"That opinion is stupid."`, `"Nobody asked what you think."`] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "browse" into a vocabulary group. Which group does it belong to?`, correct: "Technology ideas and people", wrong: ["Technology devices", "None of these groups", "Both groups equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The engineer designed a new machine." A classmate says "the engineer" is the direct object. Is the classmate correct?`, correct: "No — \"the engineer\" is the subject, doing the action; \"a new machine\" is the direct object, receiving it", wrong: ["Yes — because it appears at the start of the sentence", "Yes — because it is a person, not a thing", "No — because the sentence has no direct object at all"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is unsure what "user" means when discussing technology. What is the correct meaning?`, correct: "A person who uses a device or service", wrong: ["A machine that processes data", "A global network connecting computers", "A device that displays broadcast programmes"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} disagrees with a classmate but shouts "You always say things that make no sense." What is the problem with this response?`, correct: "It attacks the person instead of respectfully addressing the opinion", wrong: ["There is no problem — strong opinions should always be shouted", "It is too short to be understood", "It does not use a direct object"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "She downloaded a document from the internet." What is the direct object?`, correct: "a document", wrong: ["the internet", "She", "downloaded"] }; },
];

export const technologyDirectObject: Skill = {
  id: "g6-il-ls-technology",
  code: "LS.8",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Technology: direct object and expressing opinions",
  description: "Identify the direct object in sentences about technology, and express personal opinions respectfully.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "To find the direct object, find the verb, then ask \"what?\" or \"whom?\" right after it.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each sentence with its direct object.", "each sentence below with the word or phrase it acts on.", "each technology sentence with its correct direct object.", "each sentence with what receives the action."];
      const chosen = shuffle(rng, DO_SENTENCES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `d${i}`, label: a.sentence })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `d${i}`, label: a.directObject })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`d${i}`] = `d${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.sentence}" — direct object: ${a.directObject}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each phrase below by whether it is a respectful or disrespectful way to share an opinion.", "each phrase into the correct group.", "these opinion phrases into their correct groups.", "each phrase by how it would make the listener feel."];
      const chosen = shuffle(rng, OPINION_PHRASES).slice(0, 8);
      const buckets = [{ id: "Respectful", label: "Respectful" }, { id: "Disrespectful", label: "Disrespectful" }];
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.phrase }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.style));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this phrase attack the person, or does it share a view calmly and give room for other opinions?", explanation: chosen.map((c) => `"${c.phrase}" — ${c.style}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for identifying a direct object in order.", "these identification steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, IDENTIFY_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: IDENTIFY_STEPS.map((s) => s.id), hint: "Start by finding the verb, then ask what/whom, identify the answer, and confirm it receives the action.", explanation: IDENTIFY_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the direct object that correctly completes this sentence.", "the missing word below.", "the word that best completes this sentence.", "the correct word to finish the sentence.", "the word that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
