import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The Treaty of Hudaibiya's own chronological sequence — standard, widely-taught Islamic
// history — is real historical order, not invented.
const ORDER_PROMPTS = [
  "Arrange the events of the Treaty of Hudaibiya in the order they happened.",
  "Put these events from the Treaty of Hudaibiya into the order they occurred.",
  "Sequence these events of the Hudaibiya treaty correctly, from first to last.",
  "Order these events as they happened around the Treaty of Hudaibiya.",
  "Sort these events of the Hudaibiya story into the order they occurred.",
  "Arrange these moments from the Treaty of Hudaibiya in the order they took place.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of the Hudaibiya story it describes.",
  "Group each statement under the part of the story it describes.",
  "Decide which part of the Hudaibiya story each statement describes, and sort it there.",
  "Sort each fact into the part of the story it belongs to.",
  "Place each statement under the part it describes.",
  "Read each statement and sort it under the matching part of the story.",
];

const MATCH_PROMPTS = [
  "Match each term about the Treaty of Hudaibiya to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about the treaty.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const HUDAIBIYA_SEQUENCE = [
  { id: "set-out", label: "Muslims set out for Makkah intending to perform Umrah, not war" },
  { id: "blocked", label: "The Quraysh block their path at a place called Hudaibiya" },
  { id: "negotiation", label: "The Prophet (S.A.W.) chooses negotiation over fighting" },
  { id: "treaty-agreed", label: "A 10-year peace treaty is agreed, with terms that initially appear unfavourable to the Muslims" },
  { id: "return-without-umrah", label: "The Muslims return to Madinah without performing Umrah that year" },
  { id: "years-of-peace", label: "The following years of peace allow free interaction between the two sides" },
  { id: "growth", label: "Many more people freely choose to accept Islam during this peaceful period" },
];

interface TopicFact {
  text: string;
  topic: "the-events" | "the-terms" | "the-outcome";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "the-events": "What happened at Hudaibiya",
  "the-terms": "The terms of the treaty",
  "the-outcome": "The treaty's outcome and lessons",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Muslims set out from Madinah intending to perform Umrah in Makkah, not to fight", topic: "the-events" },
  { text: "The Quraysh refused to let the Muslims enter Makkah and blocked their path at Hudaibiya", topic: "the-events" },
  { text: "This happened in 628 CE (6 AH)", topic: "the-events" },
  { text: "The Prophet (S.A.W.) chose to negotiate rather than fight", topic: "the-events" },
  { text: "The treaty was agreed to last for 10 years", topic: "the-terms" },
  { text: "The Muslims agreed to return to Madinah that year without performing Umrah", topic: "the-terms" },
  { text: "The Muslims agreed that a Muslim who fled to Madinah without a guardian's permission would be returned to Makkah, while the reverse was not required of the Quraysh", topic: "the-terms" },
  { text: "The terms appeared, on the surface, unfavourable to the Muslims", topic: "the-terms" },
  { text: "The Qur'an describes the treaty as a 'clear/manifest victory'", topic: "the-outcome" },
  { text: "The following years of peace allowed tribes and individuals to interact and learn about Islam freely", topic: "the-outcome" },
  { text: "More people accepted Islam during this peaceful period than during the years of open conflict before it", topic: "the-outcome" },
  { text: "The treaty shows that choosing peaceful negotiation can lead to greater long-term benefit than immediate conflict", topic: "the-outcome" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Hudaibiya", meaning: "The place where the Quraysh blocked the Muslims' path to Makkah in 628 CE" },
  { term: "Umrah", meaning: "The pilgrimage the Muslims intended to perform when they set out for Makkah" },
  { term: "The Quraysh", meaning: "The Makkan tribe that blocked the Muslims' entry and negotiated the treaty" },
  { term: "10-year treaty", meaning: "The length of the peace agreement reached at Hudaibiya" },
  { term: "Clear/manifest victory", meaning: "How the Qur'an describes the outcome of the Hudaibiya treaty" },
  { term: "628 CE / 6 AH", meaning: "The year the Treaty of Hudaibiya took place" },
  { term: "Peaceful negotiation", meaning: "What the Prophet (S.A.W.) chose instead of fighting at Hudaibiya" },
  { term: "Growth of Islam", meaning: "What increased significantly during the peaceful years that followed the treaty" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, is in a serious disagreement with a classmate and is tempted to escalate it into a fight. Applying the lesson of the Treaty of Hudaibiya, what would be the wiser response?`,
      correct: "Seek a peaceful, negotiated resolution, even if the terms feel unfavourable at first, since this approach led to a far greater long-term benefit at Hudaibiya",
      wrong: [
        "Escalate the conflict immediately, since Hudaibiya shows that fighting always works out best",
        "Refuse to speak to the classmate at all, since Hudaibiya teaches complete avoidance",
        "Wait for someone else to resolve the disagreement, since personal negotiation is never wise",
      ],
      explanation: "The Treaty of Hudaibiya shows that choosing peaceful negotiation, even with seemingly unfavourable terms, led to a much greater long-term benefit than continued conflict would have.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} agrees to a compromise in a group project that seems to favour the other group at first. Applying the lesson of Hudaibiya, how might this turn out?`,
      correct: "The compromise, though it seems unfavourable now, could still lead to a better outcome later, just as the treaty's terms did",
      wrong: [
        "The compromise is guaranteed to fail, since any unfavourable-seeming terms in the story of Hudaibiya always led to failure",
        "Compromises should always be refused immediately, based on the lesson of Hudaibiya",
        "The outcome has nothing to do with the story of Hudaibiya",
      ],
      explanation: "Hudaibiya's terms initially seemed unfavourable to the Muslims, yet the peace it brought led to significant long-term benefit — a lesson about patience with seemingly difficult compromises.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that the Treaty of Hudaibiya was a clear failure for the Muslims, since they agreed to return without performing Umrah that year. Evaluate this reasoning.`,
    correct: "Flawed — despite that immediate setback, the treaty's peace led to significant growth in Islam and is described in the Qur'an as a clear victory",
    wrong: [
      "Sound — the treaty brought no benefit to the Muslims whatsoever",
      "Sound — the Qur'an describes the treaty as a complete defeat",
      "Flawed — but only because the Muslims eventually broke the treaty themselves",
    ],
    explanation: "Although the immediate terms seemed unfavourable, the resulting peace allowed Islam to spread significantly, which is why the Qur'an describes the treaty as a clear/manifest victory.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why more people accepted Islam during the peaceful years after Hudaibiya than during the years of open conflict before it. What is the best explanation?`,
      correct: "Peaceful conditions allowed tribes and individuals to interact and learn about Islam freely, without the backdrop of war",
      wrong: [
        "War conditions always attract more people to a religion than peace does",
        "The number of new Muslims had no connection to the treaty at all",
        "People only accepted Islam because they were forced to under the treaty's terms",
      ],
      explanation: "The years of peace following Hudaibiya allowed free interaction and exposure to Islam's teachings, which is directly connected to the significant growth in acceptance of Islam during that period.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that accepting seemingly unfair terms in a negotiation always means a total loss, with no possibility of a better outcome later. Is this consistent with the lesson of Hudaibiya?`,
    correct: "No — Hudaibiya shows that terms which initially seem unfavourable can still lead to a much better long-term outcome",
    wrong: [
      "Yes — Hudaibiya proves that any unfavourable-seeming terms always mean total loss",
      "Yes — the story of Hudaibiya has nothing to do with negotiation outcomes",
      "No — but only because the terms of Hudaibiya were not actually unfavourable at all",
    ],
    explanation: "The Treaty of Hudaibiya directly contradicts the idea that unfavourable-seeming terms always mean total loss — its long-term outcome was significant benefit for the Muslim community.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to explain why the Prophet (S.A.W.) chose negotiation instead of fighting when the Quraysh blocked the path at Hudaibiya. What is the best explanation?`,
      correct: "He prioritised avoiding unnecessary conflict and sought a peaceful resolution, which the Muslims had originally intended (Umrah, not war) all along",
      wrong: [
        "He had no other choice available at that moment",
        "He wanted to avoid Makkah entirely and never planned to return",
        "Negotiation was required by Quraysh law, not a choice he made",
      ],
      explanation: "The Muslims had set out intending peaceful Umrah, not conflict — choosing negotiation over fighting reflected that original peaceful intention and avoided unnecessary conflict.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims the Treaty of Hudaibiya has no relevant lesson for resolving conflicts today, since it happened many centuries ago. Evaluate this claim.`,
    correct: "Flawed — the treaty's core lesson (choosing peaceful negotiation over conflict, even with difficult terms, for greater long-term benefit) applies to conflict resolution in any era",
    wrong: [
      "Sound — historical events from that era have no possible relevance today",
      "Sound — the treaty was purely a political matter with no moral lesson",
      "Flawed — but only because the treaty's terms would still apply legally today",
    ],
    explanation: "The treaty's underlying lesson about choosing peaceful negotiation for long-term benefit is a timeless principle in conflict resolution, not limited to its specific historical era.",
  }),
];

export const treatyOfHudaibiya: Skill = {
  id: "g6-ire-hi-treaty-of-hudaibiya",
  code: "HI.2",
  subjectId: "ire",
  strandId: "g6-ire-history",
  grade: 6,
  title: "The Treaty of Hudaibiya",
  description: "The Treaty of Hudaibiya (628 CE): the Muslims' blocked path to Makkah, the negotiated 10-year peace treaty and its seemingly unfavourable terms, and its long-term outcome as a 'clear victory' for the growth of Islam.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, HUDAIBIYA_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from setting out for Umrah to the growth of Islam afterward.",
        items,
        correctOrder: HUDAIBIYA_SEQUENCE.map((d) => d.id),
        hint: "It begins with the Muslims setting out for Umrah and ends with many more people accepting Islam during the following peace.",
        explanation: HUDAIBIYA_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const events = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-events")).slice(0, 3);
      const terms = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-terms")).slice(0, 3);
      const outcome = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-outcome")).slice(0, 3);
      const chosen = shuffle(rng, [...events, ...terms, ...outcome]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["the-events", "the-terms", "the-outcome"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about what happened, some about the treaty's terms, and some about its outcome and lessons.",
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
        hint: "Think about what each term refers to in the story of the Treaty of Hudaibiya.",
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
        hint: "Think about what the Treaty of Hudaibiya actually teaches about peaceful negotiation and long-term outcomes.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Muslims set out for Makkah intending to perform", after: ", not war.", answer: "Umrah", accepted: ["umrah"] },
      { before: "The Quraysh blocked the Muslims' path at a place called", after: ".", answer: "Hudaibiya", accepted: ["hudaibiya"] },
      { before: "The Treaty of Hudaibiya was agreed to last for", after: "years.", answer: "10", accepted: ["10", "ten"] },
      { before: "The Muslims agreed to return to Madinah without performing", after: "that year.", answer: "Umrah", accepted: ["umrah"] },
      { before: "The Prophet (S.A.W.) chose", after: "over fighting.", answer: "negotiation", accepted: ["negotiation"] },
      { before: "The Qur'an describes the outcome of the treaty as a clear", after: ".", answer: "victory", accepted: ["victory"] },
      { before: "The Treaty of Hudaibiya took place in the year", after: "CE.", answer: "628", accepted: ["628"] },
      { before: "The years of peace after the treaty allowed tribes to interact and learn about Islam", after: ".", answer: "freely", accepted: ["freely"] },
      { before: "More people accepted Islam during the peaceful years than during the years of open", after: "before it.", answer: "conflict", accepted: ["conflict"] },
      { before: "The tribe that blocked the Muslims' entry to Makkah was the", after: ".", answer: "Quraysh", accepted: ["quraysh"] },
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
      hint: "Recall the events, terms, and long-term outcome of the Treaty of Hudaibiya.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
