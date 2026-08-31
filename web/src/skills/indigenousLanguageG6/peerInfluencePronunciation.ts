import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 4 "Peer Influence", sub-strand 4.1.1
// "Self-expression: Pronunciation" (LS.4): punctuation marks, pause, and intonation.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VocabEntry { word: string; meaning: string; group: string }

const VOCAB: VocabEntry[] = [
  { word: "peers", meaning: "people of the same age or social group", group: "People" },
  { word: "friends", meaning: "people you know well and care about", group: "People" },
  { word: "mentor", meaning: "an experienced person who guides and advises someone younger", group: "People" },
  { word: "clique", meaning: "a small, exclusive group of friends that leaves others out", group: "People" },
  { word: "influence", meaning: "the power to affect someone's behaviour or decisions", group: "Ideas and behaviour" },
  { word: "behavior", meaning: "the way a person acts", group: "Ideas and behaviour" },
  { word: "risky", meaning: "likely to cause harm or danger", group: "Ideas and behaviour" },
  { word: "adolescence", meaning: "the period of life between childhood and adulthood", group: "Ideas and behaviour" },
  { word: "rules", meaning: "guidelines that tell people what they should or should not do", group: "Choices and outcomes" },
  { word: "consequences", meaning: "results that follow from an action or decision", group: "Choices and outcomes" },
  { word: "discipline", meaning: "controlled, well-managed behaviour", group: "Choices and outcomes" },
  { word: "dress", meaning: "the clothing a person chooses to wear", group: "Choices and outcomes" },
];

interface SentenceEntry { text: string; mark: string; cue: string }

const SENTENCES: SentenceEntry[] = [
  { text: "Would you go along with that risky dare", mark: "?", cue: "Question — the voice rises at the end" },
  { text: "Never let peer pressure control your choices", mark: "!", cue: "Exclamation — spoken with strong emphasis" },
  { text: "My mentor advised me to think before acting", mark: ".", cue: "Statement — the voice falls, with a full pause" },
  { text: "Watch out, that decision could be risky", mark: "!", cue: "Exclamation — spoken with strong emphasis" },
  { text: "Do you know the school's dress code rules", mark: "?", cue: "Question — the voice rises at the end" },
  { text: "Good friends encourage good behaviour", mark: ".", cue: "Statement — the voice falls, with a full pause" },
  { text: "Stand up for what you believe in", mark: "!", cue: "Exclamation — spoken with strong emphasis" },
  { text: "Would your true friends pressure you to break the rules", mark: "?", cue: "Question — the voice rises at the end" },
  { text: "A clique can leave other learners feeling left out", mark: ".", cue: "Statement — the voice falls, with a full pause" },
  { text: "That's amazing, you resisted the peer pressure", mark: "!", cue: "Exclamation — spoken with strong emphasis" },
  { text: "Discipline helps a person make wise choices", mark: ".", cue: "Statement — the voice falls, with a full pause" },
  { text: "Can a mentor really change someone's behaviour", mark: "?", cue: "Question — the voice rises at the end" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "Would you go along with a risky dare from your friends", after: "", answer: "?" },
  { before: "Never let peer pressure control your choices", after: "", answer: "!" },
  { before: "My mentor advised me to think before acting", after: "", answer: "." },
  { before: "Before joining a clique, think about its values", after: "", answer: "." },
  { before: "Watch out, that decision could be risky", after: "", answer: "!" },
  { before: "After weighing the consequences", after: "I chose to walk away from the dare.", answer: "," },
  { before: "My friends value honesty", after: "respect, and kindness.", answer: "," },
  { before: "Do you know the rules about dress code at school", after: "", answer: "?" },
  { before: "Stand up for what you believe in, even under pressure", after: "", answer: "!" },
  { before: "Good friends encourage good behaviour", after: "", answer: "." },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "silent", label: "Read the sentence silently first to understand its meaning" },
  { id: "notice", label: "Notice the punctuation mark at the end of the sentence" },
  { id: "decide", label: "Decide whether your voice should rise, fall, or sound emphatic" },
  { id: "pause", label: "Read the sentence aloud, pausing briefly at any commas" },
  { id: "match", label: "Match your tone of voice to the punctuation mark used" },
  { id: "feedback", label: "Ask a partner for feedback on your pronunciation" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Would you go along with that risky dare?" aloud. What should ${who}'s voice do at the end?`, correct: "Rise in pitch, because it is a question", wrong: ["Fall sharply, as if it were a statement", "Stay completely flat throughout", "Stop suddenly with no sound at all"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} sees the sentence "Never let peer pressure control your choices!" What does the exclamation mark tell ${who} about how to say it?`, correct: "To read it with strong emphasis, showing feeling", wrong: ["To read it in a whisper", "To pause for a long time before starting", "To read it exactly like a question"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is unsure what "consequences" means after hearing it used about peer influence. What is the correct meaning?`, correct: "Results that follow from an action or decision", wrong: ["People of the same age group", "The clothing a person chooses to wear", "An experienced person who gives advice"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} must sort the word "mentor" into the correct vocabulary group. Which group does it belong to?`, correct: "People", wrong: ["Ideas and behaviour", "Choices and outcomes", "None of these groups"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "My friends value honesty, respect, and kindness." What should ${who} do at each comma?`, correct: "Take a brief pause before continuing", wrong: ["Stop reading completely", "Raise the voice sharply", "Repeat the previous word"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `A classmate in ${where} tells ${who} that punctuation marks only matter in writing, not in speaking. Is the classmate correct?`, correct: "No — punctuation guides pause, tone, and intonation when reading aloud too", wrong: ["Yes — punctuation has no effect on how a sentence is spoken", "Yes — only capital letters affect pronunciation", "No — punctuation only matters when whispering"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Good friends encourage good behaviour." with a rising tone at the end, like a question. What is the problem?`, correct: "The sentence is a statement, so the tone should fall, not rise", wrong: ["There is no problem — statements always rise at the end", "The sentence is missing a comma", "The sentence should be read in a whisper"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} keeps chatting with a deskmate during a pronunciation practice session. What is the likely effect on ${who}'s learning?`, correct: `${who} will likely miss the chance to practise matching tone to punctuation correctly`, wrong: ["There will be no effect, since pronunciation cannot be practised aloud anyway", "It will help improve pronunciation faster", "It will make the practice session finish sooner"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} explains what a "clique" is to a younger learner. Which explanation is correct?`, correct: "A small, exclusive group of friends that leaves others out", wrong: ["A rule that must never be broken", "A result that follows a decision", "A period of life between childhood and adulthood"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} practises reading "Stand up for what you believe in!" Which quality of the voice matters MOST here?`, correct: "Emphasis and energy, since it is an exclamation", wrong: ["A rising pitch at the very start only", "Complete silence throughout", "Reading it as slowly as possible with no expression"] }; },
];

export const peerInfluencePronunciation: Skill = {
  id: "g6-il-ls-peer-influence",
  code: "LS.4",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Peer influence: self-expression and pronunciation",
  description: "Use punctuation marks, pause, and intonation to pronounce sentences about peer influence accurately.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Notice the punctuation mark at the end of a sentence: it tells you whether your voice should rise, fall, or sound emphatic.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each word with the meaning that explains it.", "each word below with its correct meaning.", "each peer-influence word with the phrase that defines it.", "each word with what it actually means."];
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.word })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.word] = a.word;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.word} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence by the punctuation mark it should end with.", "each sentence below into the correct punctuation group.", "these sentences by whether they are a question, statement, or exclamation.", "each sentence into its matching punctuation-mark group."];
      const chosen = shuffle(rng, SENTENCES).slice(0, 8);
      const buckets = [{ id: "?", label: "Question (?)" }, { id: "!", label: "Exclamation (!)" }, { id: ".", label: "Statement (.)" }];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.mark));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: is this sentence asking something, showing strong feeling, or simply stating a fact?", explanation: chosen.map((c) => `"${c.text}${c.mark}" — ${c.cue}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for reading a sentence aloud with correct pronunciation.", "these reading-practice steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, READING_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: READING_STEPS.map((s) => s.id), hint: "Start by reading silently, then notice the punctuation, decide your tone, pause at commas, match your tone, and get feedback.", explanation: READING_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the correct punctuation mark.", "the missing punctuation mark below.", "the mark that best fits this sentence.", "the correct mark to finish the sentence.", "the punctuation mark that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      const filled = `${entry.before}${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim();
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${filled} — the mark "${entry.answer}" fits this sentence.` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
