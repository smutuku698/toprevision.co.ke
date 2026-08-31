import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 7 "Careers and Professions", sub-strand 7.1.1
// "Socialising and Taking Action: Debates and Discussions" (LS.7): imperatives + debating skills.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VocabEntry { word: string; meaning: string; group: string }

const VOCAB: VocabEntry[] = [
  { word: "career", meaning: "a person's chosen path of work over time", group: "Career ideas" },
  { word: "employment", meaning: "paid work that a person does", group: "Career ideas" },
  { word: "profession", meaning: "a job requiring special training or qualification", group: "Career ideas" },
  { word: "occupation", meaning: "a person's usual work or job", group: "Career ideas" },
  { word: "income", meaning: "money earned from work", group: "Career ideas" },
  { word: "honesty", meaning: "being truthful and trustworthy in one's work", group: "Career ideas" },
  { word: "train", meaning: "to learn and practise the skills needed for a job", group: "Career actions" },
  { word: "employ", meaning: "to give someone paid work", group: "Career actions" },
  { word: "teacher", meaning: "a person who instructs learners", group: "Career people" },
  { word: "pilot", meaning: "a person who flies an aircraft", group: "Career people" },
  { word: "doctor", meaning: "a person trained to diagnose and treat illness", group: "Career people" },
  { word: "farmer", meaning: "a person who grows crops and keeps animals", group: "Career people" },
  { word: "artist", meaning: "a person who creates art", group: "Career people" },
  { word: "lawyer", meaning: "a person trained to give legal advice and represent people", group: "Career people" },
];

interface SkillEntry { skill: string; description: string }

const DEBATE_SKILLS: SkillEntry[] = [
  { skill: "Active listening", description: "Paying close attention to what a speaker says" },
  { skill: "Turn-taking", description: "Waiting for your turn to speak instead of interrupting" },
  { skill: "Polite disagreement", description: "Expressing a different opinion respectfully" },
  { skill: "Summarising", description: "Restating the main points made by both sides" },
  { skill: "Clear articulation", description: "Speaking in a way that is easy for others to understand" },
  { skill: "Supporting evidence", description: "Backing up an opinion with facts or reasons" },
  { skill: "Staying on topic", description: "Keeping comments relevant to the debate subject" },
  { skill: "Time management", description: "Keeping remarks within the time given" },
];

interface FillEntry { after: string; answer: string }

const FILLS: FillEntry[] = [
  { after: "a career you are passionate about.", answer: "Choose" },
  { after: "carefully to your teammate's opinion.", answer: "Listen" },
  { after: "other people's career choices.", answer: "Respect" },
  { after: "a profession before committing to it.", answer: "Research" },
  { after: "clearly when presenting your point.", answer: "Speak" },
  { after: "your opinion with a good reason.", answer: "Support" },
  { after: "turns when discussing a topic.", answer: "Take" },
  { after: "interrupting a speaker.", answer: "Avoid" },
  { after: "both sides before concluding a debate.", answer: "Summarise" },
  { after: "calm even if you disagree.", answer: "Stay" },
];

const DEBATE_STEPS: { id: string; label: string }[] = [
  { id: "topic", label: "Choose a topic related to careers and professions" },
  { id: "sides", label: "Divide into two sides — for and against" },
  { id: "prepare", label: "Prepare points and supporting reasons for your side" },
  { id: "present", label: "Take turns presenting points clearly" },
  { id: "listen", label: "Listen respectfully and note points to respond to" },
  { id: "summarise", label: "Summarise the strongest points from both sides" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} interrupts a teammate mid-sentence during a careers debate. Which debating skill has ${who} failed to show?`, correct: "Turn-taking", wrong: ["Time management", "Clear articulation", "Summarising"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} disagrees with a teammate's opinion about careers but says so calmly and respectfully. Which skill is ${who} demonstrating?`, correct: "Polite disagreement", wrong: ["Turn-taking", "Time management", "Active listening"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} says "Choose a career you are passionate about." What kind of sentence is this?`, correct: "An imperative sentence — it gives a command or instruction", wrong: ["A question, asking for information", "An exclamation, showing strong feeling", "A statement describing a fact"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "profession" into a vocabulary group. Which group does it belong to?`, correct: "Career ideas", wrong: ["Career actions", "Career people", "None of these groups"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} restates the main points from both sides of a debate before the class votes. Which debating skill is this?`, correct: "Summarising", wrong: ["Turn-taking", "Polite disagreement", "Staying on topic"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "honesty" means when applied to a career. What is the correct meaning?`, correct: "Being truthful and trustworthy in one's work", wrong: ["Money earned from a job", "A person's usual occupation", "The training required for a job"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} keeps drifting to unrelated topics during a careers debate. Which debating skill is ${who} missing?`, correct: "Staying on topic", wrong: ["Time management", "Clear articulation", "Summarising"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} backs up an opinion about a career choice with a real fact instead of a guess. Which skill is being used?`, correct: "Supporting evidence", wrong: ["Turn-taking", "Time management", "Polite disagreement"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} speaks so quickly and unclearly that classmates cannot follow the argument. Which skill is missing?`, correct: "Clear articulation", wrong: ["Active listening", "Turn-taking", "Staying on topic"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} keeps talking well past the time given for the debate. Which skill has ${who} not shown?`, correct: "Time management", wrong: ["Active listening", "Polite disagreement", "Supporting evidence"] }; },
];

export const careersDebatesDiscussions: Skill = {
  id: "g6-il-ls-careers",
  code: "LS.7",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Careers and professions: debates and discussions",
  description: "Use imperative sentences and apply debating skills when discussing careers and professions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Debating well means listening actively, taking turns, staying on topic, and backing up opinions with real reasons.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each debating skill with its description.", "each skill below with what it actually means.", "each debating skill with the behaviour that shows it.", "each skill with its correct description."];
      const chosen = shuffle(rng, DEBATE_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.skill, label: a.skill })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.skill, label: a.description })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.skill] = a.skill;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.skill} — ${a.description.toLowerCase()}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each word below into the correct careers-vocabulary group.", "each vocabulary word into the group it belongs to.", "these career words into their correct groups.", "each word by whether it names an idea, an action, or a person."];
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.group)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.group));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does the word name a career idea, a career action, or a career person?", explanation: chosen.map((c) => `"${c.word}" — ${c.group.toLowerCase()}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for holding a class debate in order.", "these debate-preparation steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, DEBATE_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: DEBATE_STEPS.map((s) => s.id), hint: "Start by choosing a topic and sides, then prepare, present, listen, and finally summarise.", explanation: DEBATE_STEPS.map((s) => s.label).join(" → ") };
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
