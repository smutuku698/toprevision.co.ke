import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 4 "Peer Influence", sub-strand 4.3.1
// "Creative Writing: Topical Essay" (W.4): features, writing a topical essay.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "topic", meaning: "the single subject a piece of writing focuses on throughout" },
  { concept: "focus", meaning: "staying on one clear subject without wandering off" },
  { concept: "relevance", meaning: "how closely a point relates to the topic" },
  { concept: "digression", meaning: "a part of writing that wanders away from the main topic" },
  { concept: "thesis", meaning: "the main argument or point an essay makes about its topic" },
  { concept: "supporting point", meaning: "a reason or example that backs up the essay's main idea" },
  { concept: "title", meaning: "the essay's name, reflecting what it is about" },
  { concept: "audience", meaning: "the readers a piece of writing is meant for" },
  { concept: "tone", meaning: "the writer's attitude towards the topic, shown through word choice" },
  { concept: "unity", meaning: "when every part of an essay relates back to the same topic" },
];

interface ExcerptEntry { text: string; type: string }

const EXCERPTS: ExcerptEntry[] = [
  { text: "Good friends encourage each other to study hard and avoid risky behaviour.", type: "On-topic" },
  { text: "My favourite food is ugali with sukuma wiki.", type: "Off-topic" },
  { text: "A positive peer can help you make better choices under pressure.", type: "On-topic" },
  { text: "The weather in December is usually sunny in most parts of Kenya.", type: "Off-topic" },
  { text: "Choosing friends who value honesty strengthens good behaviour.", type: "On-topic" },
  { text: "Elephants are the largest land animals in the world.", type: "Off-topic" },
  { text: "A mentor's guidance often shapes a young person's decisions positively.", type: "On-topic" },
  { text: "My uncle recently bought a new bicycle.", type: "Off-topic" },
  { text: "Standing up to negative peer pressure takes courage and practice.", type: "On-topic" },
  { text: "Football is played with eleven players on each team.", type: "Off-topic" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "A topical essay stays focused on one clear", after: "throughout.", answer: "topic" },
  { before: "A sentence about food in an essay about peer influence is a", after: ".", answer: "digression" },
  { before: "The", after: "of an essay is its name, reflecting what it is about.", answer: "title" },
  { before: "A good supporting point is", after: "to the essay's main topic.", answer: "relevant" },
  { before: "Every paragraph in a unified essay relates back to the", after: ".", answer: "topic" },
  { before: "The writer's attitude, shown through word choice, is called", after: ".", answer: "tone" },
  { before: "The readers a piece of writing is meant for are called the", after: ".", answer: "audience" },
  { before: "The main argument an essay makes about its topic is called its", after: ".", answer: "thesis" },
  { before: "A reason or example that backs up the main idea is called a supporting", after: ".", answer: "point" },
  { before: "When every part of an essay relates back to the same topic, the essay has", after: ".", answer: "unity" },
];

const ESSAY_STEPS: { id: string; label: string }[] = [
  { id: "choose", label: "Choose a clear, specific topic" },
  { id: "title", label: "Write a title that reflects the topic" },
  { id: "thesis", label: "State the main point in the introduction" },
  { id: "support", label: "Develop supporting points that stay relevant to the topic" },
  { id: "avoid", label: "Avoid digressions that wander away from the topic" },
  { id: "conclude", label: "Conclude by relating back to the original topic" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes an essay titled "Good Peer Influence" but includes a paragraph about a football match. What is the problem?`, correct: "The paragraph is a digression — it does not relate to the essay's topic", wrong: ["There is no problem — any topic can be added to any essay", "The essay should have been about football instead", "The title needs to be changed to match the football paragraph"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "A positive peer can help you make better choices under pressure." into a topic-relevance group. Which group fits?`, correct: "On-topic", wrong: ["Off-topic", "Neither group", "Both groups equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "My favourite food is ugali with sukuma wiki." into a topic-relevance group for an essay on peer influence. Which group fits?`, correct: "Off-topic", wrong: ["On-topic", "Neither group", "Both groups equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "thesis" means in a topical essay. What is the correct meaning?`, correct: "The main argument or point the essay makes about its topic", wrong: ["The essay's title only", "A digression from the topic", "The readers the essay is written for"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a conclusion that relates back to the essay's original topic about resisting peer pressure. What quality does this show?`, correct: "Unity — every part of the essay connects to the same topic", wrong: ["Digression — it wanders off the topic", "Irrelevance — it has nothing to do with the topic", "A missing thesis"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} adds a supporting point about honest friendships to an essay on positive peer influence. What quality does this show?`, correct: "Relevance — the point closely relates to the essay's topic", wrong: ["Digression from the essay's topic", "A change of the essay's title", "A shift in the intended audience"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} chooses a very broad, unclear subject for a topical essay instead of a specific one. What might go wrong?`, correct: "The essay may lose focus and become hard to follow", wrong: ["The essay will automatically become better organised", "Broad topics always make essays clearer", "There is no possible downside to a broad topic"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes for classmates their own age about resisting peer pressure. What is this group of readers called?`, correct: "The audience", wrong: ["The thesis", "The digression", "The title"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes an essay using serious, caring word choices when discussing peer pressure. What does this word choice reflect?`, correct: "The writer's tone", wrong: ["The essay's title only", "The essay's audience only", "A digression"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} titles an essay "Choosing Good Friends" but the essay itself mostly discusses unrelated hobbies. What is the mismatch?`, correct: "The title does not reflect what the essay actually focuses on", wrong: ["There is no mismatch — titles never need to match content", "The essay needs no supporting points at all", "The audience is incorrectly identified"] }; },
];

export const peerInfluenceTopicalEssay: Skill = {
  id: "g6-il-w-peer-influence",
  code: "W.4",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Peer influence: writing a topical essay",
  description: "Identify the features of a topical essay and write focused essays about peer influence that stay on topic.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A good topical essay stays focused on one clear topic — every point, and the conclusion, should relate back to it.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each essay-writing term with its meaning.", "each term below with its correct meaning.", "each topical-essay term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence below by whether it fits an essay on peer influence.", "each sentence into the correct relevance group.", "these sentences into their correct groups.", "each sentence by whether it stays on the topic of peer influence."];
      const chosen = shuffle(rng, EXCERPTS).slice(0, 8);
      const buckets = [{ id: "On-topic", label: "On-topic" }, { id: "Off-topic", label: "Off-topic" }];
      const items = chosen.map((c, i) => ({ id: `e${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`e${i}`] = c.type));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this sentence relate to peer influence, or does it wander off to an unrelated subject?", explanation: chosen.map((c) => `"${c.text}" — ${c.type}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for writing a focused topical essay in order.", "these essay-writing steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, ESSAY_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: ESSAY_STEPS.map((s) => s.id), hint: "Start by choosing a topic and title, state your point, support it relevantly, avoid digressions, and conclude on-topic.", explanation: ESSAY_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the essay term that correctly completes this sentence.", "the missing term below.", "the word that best completes this sentence.", "the correct term to finish the sentence.", "the term that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
