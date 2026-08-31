import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: truthfulness and forgiveness are two parallel virtues, not a
// curriculum-stated sequence — a 5th QuestionKind is not manufactured here.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as describing truthfulness (Sidq) or forgiveness (Afw).",
  "Group each statement under truthfulness (Sidq) or forgiveness (Afw).",
  "Decide whether each statement is about truthfulness or forgiveness, and sort it there.",
  "Sort each statement into the correct category: truthfulness, or forgiveness.",
  "Place each statement into the right bucket — Sidq, or Afw.",
  "Categorise each statement as truthfulness (Sidq) or forgiveness (Afw).",
];

const MATCH_PROMPTS = [
  "Match each term about truthfulness and forgiveness to its meaning.",
  "Pair each term about truthfulness and forgiveness with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about truthfulness and forgiveness.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface TopicFact {
  text: string;
  topic: "truthfulness" | "forgiveness";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  truthfulness: "About truthfulness (Sidq)",
  forgiveness: "About forgiveness (Afw)",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Truthfulness (Sidq) means speaking and acting honestly, even when it is difficult", topic: "truthfulness" },
  { text: "Truthfulness builds trust between people, which is essential for harmonious co-existence", topic: "truthfulness" },
  { text: "A truthful Muslim earns rewards from Allah for upholding honesty consistently", topic: "truthfulness" },
  { text: "Truthfulness includes honesty in speech, in business dealings, and in keeping promises", topic: "truthfulness" },
  { text: "Being truthful even when it may bring personal disadvantage is a mark of strong character", topic: "truthfulness" },
  { text: "Forgiveness (Afw) means letting go of a wrong done to you, even when you have the right to retaliate", topic: "forgiveness" },
  { text: "Forgiveness helps reduce conflict and supports reconciliation between people", topic: "forgiveness" },
  { text: "Forgiving others is regarded as a way of earning rewards from Allah", topic: "forgiveness" },
  { text: "Forgiveness does not require forgetting a wrong, but choosing not to hold onto resentment", topic: "forgiveness" },
  { text: "A Muslim who forgives easily contributes to a more harmonious, less conflict-ridden society", topic: "forgiveness" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Sidq", meaning: "Truthfulness — honesty in speech and action, even when difficult" },
  { term: "Afw", meaning: "Forgiveness — letting go of a wrong even when one has the right to retaliate" },
  { term: "Trust", meaning: "What truthfulness builds between people in a community" },
  { term: "Reconciliation", meaning: "What forgiveness supports by reducing conflict between people" },
  { term: "Harmonious co-existence", meaning: "What both truthfulness and forgiveness are said to promote in society" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} accidentally breaks a neighbour's window and immediately admits it, even though no one saw what happened and staying quiet would have avoided any blame. What virtue does this show?`,
      correct: "Sidq (truthfulness) — being honest even when it brings personal disadvantage",
      wrong: ["Afw (forgiveness) — this virtue concerns letting go of a wrong done to oneself, not admitting one's own mistake", "No particular virtue — admitting a mistake with no witnesses has no real significance", "Riya — this describes showing off, which does not fit this situation at all"],
      explanation: "Choosing honesty even when silence would have avoided blame is a clear example of Sidq (truthfulness), especially since it comes at personal cost.",
    };
  },
  (rng) => ({
    prompt: `After a classmate spreads a false rumour about ${name(rng)} in ${place(rng)}, they later apologise, and ${name(rng)} chooses to accept the apology and move on without holding a grudge. What virtue does this show?`,
    correct: "Afw (forgiveness) — letting go of the wrong done, even though there was a right to remain upset",
    wrong: ["Sidq (truthfulness) — this virtue concerns honesty in speech and action, not letting go of a grievance", "Weakness of character, since accepting an apology means the wrong did not matter", "Shirk — this term concerns associating partners with Allah, unrelated to this situation"],
    explanation: "Choosing to let go of a wrong after an apology, rather than holding a grudge, is exactly what Afw (forgiveness) means in daily life.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that truthfulness only matters in formal settings like exams or courtrooms, not in everyday small talk. Evaluate this claim.`,
    correct: "Flawed — Sidq is meant to apply across all speech and action, including everyday dealings, not only formal or high-stakes settings",
    wrong: ["Sound — small, everyday dishonesty carries no real weight in Islamic teaching", "Sound — truthfulness only becomes relevant once consequences are severe", "Flawed — but only because formal settings are actually where honesty matters least"],
    explanation: "Truthfulness (Sidq) is described as a consistent standard across speech and action, not one that applies only in formal or high-stakes situations.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says forgiving someone means pretending the wrong never happened. Is this an accurate understanding of Afw?`,
    correct: "No — forgiveness does not require forgetting the wrong, only choosing not to hold onto resentment or seek retaliation",
    wrong: ["Yes — genuine forgiveness always requires acting as if nothing happened", "Yes — otherwise the forgiveness is considered incomplete or invalid", "No — but only because forgiveness actually requires punishing the wrongdoer first"],
    explanation: "Afw is about releasing resentment and not seeking retaliation — it does not require pretending the wrong never occurred.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a shopkeeper's helper in ${place(rng)}, tells a customer the true, higher price of a slightly damaged item rather than staying silent to sell it faster at full value. What does this choice reflect?`,
      correct: "Truthfulness (Sidq) in business dealings, even when it may reduce a sale",
      wrong: ["Afw (forgiveness), since the customer is not owed any apology in this situation", "Poor business sense with no connection to any Islamic virtue", "Riya, since informing the customer was done to be seen as honest"],
      explanation: "Disclosing an item's true condition honestly, even at a cost to the sale, is a direct example of Sidq applied to business dealings.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that forgiving someone means the person can never be held accountable in any way, even through fair, lawful means. Evaluate this claim.`,
    correct: "Flawed — Afw is about releasing personal resentment and the desire for revenge; it does not rule out fair, lawful accountability where appropriate",
    wrong: ["Sound — forgiveness always eliminates any form of accountability entirely", "Sound — Islamic teaching discourages accountability of any kind once forgiveness is given", "Flawed — but only because forgiveness actually requires demanding accountability"],
    explanation: "Forgiveness concerns letting go of personal resentment and revenge, not necessarily ruling out fair and lawful accountability where it is appropriate.",
  }),
  (rng) => ({
    prompt: `${name(rng)} keeps every promise made to friends, even small ones that would be easy to forget or ignore. Which named aspect of truthfulness does this best reflect?`,
    correct: "Truthfulness includes honesty in keeping promises, not only honesty in speech",
    wrong: ["This has nothing to do with truthfulness, since promises are a separate matter entirely", "This reflects forgiveness, since keeping promises is about tolerating others' mistakes", "This reflects shirk, since promises involve trusting another person"],
    explanation: "Truthfulness explicitly includes keeping promises, alongside honest speech and fair business dealings — this scenario reflects that specific aspect.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says forgiving a wrongdoer only benefits the wrongdoer, with no benefit to the person forgiving. Evaluate this reasoning.`,
    correct: "Flawed — forgiving is also described as a way the forgiver earns rewards from Allah and supports their own path toward reconciliation and peace",
    wrong: ["Sound — forgiveness offers no benefit whatsoever to the person who forgives", "Sound — only the wrongdoer gains anything from being forgiven", "Flawed — but only because the wrongdoer actually gains nothing either"],
    explanation: "Forgiveness is described as beneficial to the forgiver too — a way of earning Allah's reward and moving toward reconciliation, not a one-sided benefit.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says truthfulness and forgiveness are unrelated virtues with nothing in common. Evaluate this claim.`,
    correct: "Flawed — both are described as supporting harmonious co-existence in society, even though they concern different situations",
    wrong: ["Sound — the two virtues share absolutely no common purpose", "Sound — truthfulness only concerns worship, while forgiveness only concerns business", "Flawed — but only because the two virtues are actually identical in meaning"],
    explanation: "Truthfulness and forgiveness are distinct virtues, but both are said to support harmonious co-existence in society — they share that common purpose.",
  }),
  (rng) => ({
    prompt: `${name(rng)} tells a difficult truth to a close friend about a mistake they made, doing so gently but honestly rather than staying silent to avoid discomfort. How does this reflect Sidq?`,
    correct: "It reflects truthfulness applied with care — honesty is upheld even when it is socially uncomfortable, rather than avoided for convenience",
    wrong: ["It has no connection to Sidq, since Sidq only concerns one's own actions, never feedback to others", "It reflects forgiveness instead, since a friend's mistake is being addressed", "It contradicts Sidq, since gentleness is discouraged when speaking honestly"],
    explanation: "Sidq calls for honesty even when it is uncomfortable — choosing to speak a difficult truth gently, rather than staying silent, upholds that standard.",
  }),
];

export const virtuesInIslam: Skill = {
  id: "g7-ire-ak-virtues",
  code: "AK.2",
  subjectId: "ire",
  strandId: "g7-ire-akhlaq",
  grade: 7,
  title: "Virtues in Islam — Truthfulness and Forgiveness",
  description: "The Islamic teachings on truthfulness (Sidq) and forgiveness (Afw), and their significance for harmonious co-existence in society.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const truth = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "truthfulness")).slice(0, 5);
      const forgive = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "forgiveness")).slice(0, 5);
      const chosen = shuffle(rng, [...truth, ...forgive]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["truthfulness", "forgiveness"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Truthfulness is about honesty in speech and action; forgiveness is about letting go of a wrong done to you.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the term names a virtue itself or what that virtue helps build in society.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Decide whether the scenario is about being honest, or about releasing resentment toward someone who wronged you.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Truthfulness in Islam is called", after: ".", answer: "Sidq", accepted: ["sidq"] },
      { before: "Forgiveness in Islam is called", after: ".", answer: "Afw", accepted: ["afw"] },
      { before: "Truthfulness builds", after: "between people in a community.", answer: "trust", accepted: ["trust"] },
      { before: "Forgiveness supports", after: "and reduces conflict between people.", answer: "reconciliation", accepted: ["reconciliation"] },
      { before: "Both truthfulness and forgiveness promote harmonious", after: "in society.", answer: "co-existence", accepted: ["co-existence", "coexistence"] },
      { before: "A truthful Muslim is honest even when it is", after: ".", answer: "difficult", accepted: ["difficult"] },
      { before: "Forgiveness means letting go of a wrong even when one has the right to", after: ".", answer: "retaliate", accepted: ["retaliate"] },
      { before: "Truthfulness includes honesty in speech, business dealings, and keeping", after: ".", answer: "promises", accepted: ["promises"] },
      { before: "Practising both virtues is a way of earning", after: "from Allah.", answer: "rewards", accepted: ["rewards", "reward"] },
      { before: "Forgiveness does not require forgetting a wrong, only releasing", after: ".", answer: "resentment", accepted: ["resentment"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the meanings of Sidq and Afw and why each matters for society.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
