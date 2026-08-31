import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The well-known rites of Hajj have a real, widely-taught order — good material for the
// ordering branch, not an invented sequence.
const ORDER_PROMPTS = [
  "Arrange these rites of Hajj in the order they are performed.",
  "Put these rites of Hajj into the correct order.",
  "Sequence these rites of Hajj, from first to last.",
  "Order these rites as they are performed during Hajj.",
  "Sort these rites of Hajj into the order they occur.",
  "Arrange these Hajj rites in the order a pilgrim performs them.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of Hajj it describes.",
  "Group each statement under the aspect of Hajj it describes.",
  "Decide which aspect of Hajj each statement describes, and sort it there.",
  "Sort each fact into the aspect of Hajj it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of Hajj.",
];

const MATCH_PROMPTS = [
  "Match each type of Hajj to its description.",
  "Pair each type of Hajj with the description that fits it.",
  "Connect each type below to what it means.",
  "Match each type of Hajj to its correct description.",
  "Link each type of Hajj to the description that fits it.",
  "Choose the correct description for each type of Hajj.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const HAJJ_SEQUENCE = [
  { id: "ihram", label: "Entering the state of Ihram (the pilgrim's ritual state and dress)" },
  { id: "tawaf", label: "Performing Tawaf — circling the Kaaba seven times" },
  { id: "sai", label: "Performing Sa'i — walking between the hills of Safa and Marwah seven times" },
  { id: "arafat", label: "Standing at Arafat (Wuquf), the central rite of Hajj, on the 9th day of Dhul-Hijjah" },
  { id: "muzdalifah", label: "Staying overnight at Muzdalifah" },
  { id: "jamarat", label: "Stoning the pillars at Mina (Jamarat)" },
  { id: "sacrifice", label: "Offering a sacrifice (Qurbani)" },
  { id: "final-tawaf", label: "Performing a final Tawaf" },
];

const HAJJ_TYPES = [
  { name: "Ifrad", meaning: "Performing Hajj alone, without combining it with Umrah" },
  { name: "Tamattu", meaning: "Performing Umrah first, then beginning Hajj rites separately — the most common type for pilgrims from outside Makkah" },
  { name: "Qiran", meaning: "Combining Hajj and Umrah together in one continuous state of Ihram, without breaking it in between" },
];

interface TopicFact {
  text: string;
  topic: "conditions" | "types" | "significance";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  conditions: "Conditions for Hajj being obligatory",
  types: "The three types of Hajj",
  significance: "The significance of Hajj",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Being Muslim is one of the conditions for Hajj being obligatory on a person", topic: "conditions" },
  { text: "Being of sound mind (sane) is one of the conditions for Hajj", topic: "conditions" },
  { text: "Having reached maturity/adulthood (baligh) is one of the conditions for Hajj", topic: "conditions" },
  { text: "Being financially and physically able to make the journey (istita'ah) is one of the conditions for Hajj", topic: "conditions" },
  { text: "Ifrad means performing Hajj alone, without combining it with Umrah", topic: "types" },
  { text: "Tamattu means performing Umrah first, then beginning Hajj rites separately", topic: "types" },
  { text: "Qiran means combining Hajj and Umrah in one continuous state of Ihram", topic: "types" },
  { text: "Tamattu is the most common type for pilgrims travelling from outside Makkah", topic: "types" },
  { text: "Hajj is a pillar of Islam, obligatory once in a lifetime for those who meet its conditions", topic: "significance" },
  { text: "Hajj is described as a unifying act of worship, bringing Muslims from around the world together", topic: "significance" },
  { text: "The pre-conditions for Hajj mean it is not obligatory on everyone at all times, only those who genuinely meet the requirements", topic: "significance" },
  { text: "Standing at Arafat (Wuquf) is considered the central rite of Hajj", topic: "significance" },
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
      prompt: `${who}'s uncle in ${place(rng)} is a Muslim adult of sound mind, but does not have enough savings to afford the journey to Makkah and cover his family's needs while away. Is Hajj obligatory on him this year?`,
      correct: "No — Hajj is only obligatory on those who are financially and physically able (istita'ah), which he currently is not",
      wrong: [
        "Yes — every adult Muslim must perform Hajj every single year regardless of finances",
        "Yes — financial ability has nothing to do with whether Hajj is obligatory",
        "No — but only because he has not reached adulthood yet",
      ],
      explanation: "Being financially and physically able to make the journey (istita'ah), without leaving dependents unsupported, is one of the conditions for Hajj being obligatory.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} plans to perform Umrah first and then begin the separate Hajj rites afterward, during the same trip. Which type of Hajj is ${who} performing?`,
      correct: "Tamattu — performing Umrah first, then beginning Hajj rites separately",
      wrong: [
        "Ifrad — performing Hajj alone without any Umrah",
        "Qiran — combining Hajj and Umrah in one unbroken state of Ihram",
        "None of the three named types apply to this plan",
      ],
      explanation: "Performing Umrah first, then beginning Hajj rites separately, is exactly what Tamattu describes — the most common type for pilgrims from outside Makkah.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Hajj's pre-conditions (being Muslim, sane, adult, and able) make the pillar unfairly exclusive. Evaluate this reasoning.`,
    correct: "Flawed — the conditions ensure Hajj is only obligatory on those who can genuinely fulfil it, which is a matter of fairness, not exclusion",
    wrong: [
      "Sound — the conditions exist purely to prevent most Muslims from ever performing Hajj",
      "Sound — Hajj should be obligatory on every Muslim regardless of ability",
      "Flawed — the conditions actually apply only to non-Muslims",
    ],
    explanation: "The conditions (Muslim, sane, adult, able) ensure the obligation only falls on those who can genuinely fulfil it without hardship — a fair accommodation, not an exclusion.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sees a photo of pilgrims walking seven times between two hills during Hajj. Which rite is this?`,
      correct: "Sa'i — walking between the hills of Safa and Marwah seven times",
      wrong: [
        "Tawaf, which is circling the Kaaba, not walking between hills",
        "Wuquf, which is standing at Arafat, not walking between hills",
        "Jamarat, which is stoning the pillars at Mina, not walking between hills",
      ],
      explanation: "Sa'i is the rite of walking seven times between the hills of Safa and Marwah, distinct from Tawaf (circling the Kaaba) or standing at Arafat.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the type of Hajj a pilgrim chooses (Ifrad, Tamattu, or Qiran) makes no real difference and is purely a matter of preference with no distinct meaning. Is this accurate?`,
    correct: "No — each type differs in whether and how Umrah is combined with Hajj, which is a meaningful, defined distinction, not an arbitrary choice",
    wrong: [
      "Yes — the three types are identical in every respect",
      "Yes — only Ifrad is a real type; the other two names are unofficial",
      "No — but the difference is only about which hill a pilgrim walks near",
    ],
    explanation: "Ifrad, Tamattu, and Qiran are each defined by a distinct relationship between Hajj and Umrah — a meaningful structural difference, not simply personal preference with no distinction.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Hajj is described as a unifying act of worship. What is the best explanation?`,
      correct: "Because it brings Muslims from many different countries and backgrounds together to perform the same shared rites at the same time",
      wrong: [
        "Because only pilgrims from one specific country are permitted to attend",
        "Because Hajj is performed entirely alone, with no other pilgrims present",
        "Because it has no connection to community or shared experience at all",
      ],
      explanation: "Hajj gathers Muslims from around the world to perform the same rites together, which is exactly why it is described as a unifying act of worship.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that once a Muslim reaches adulthood, Hajj becomes obligatory immediately regardless of any other condition. Evaluate this claim.`,
    correct: "Flawed — reaching adulthood (baligh) is only one of several conditions; being sane and financially/physically able are also required",
    wrong: [
      "Sound — adulthood is the only condition that matters for Hajj",
      "Sound — being financially able has nothing to do with Hajj's obligation",
      "Flawed — actually, adulthood has no connection to Hajj at all",
    ],
    explanation: "Hajj's obligation depends on several conditions together — being Muslim, sane, an adult, and financially/physically able — not adulthood alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} watches a video of pilgrims standing together at a specific location on the 9th day of Dhul-Hijjah, described as the central rite of Hajj. Which rite is being shown?`,
    correct: "Wuquf — standing at Arafat",
    wrong: [
      "Sa'i — walking between Safa and Marwah",
      "Tawaf — circling the Kaaba",
      "Jamarat — stoning the pillars at Mina",
    ],
    explanation: "Standing at Arafat (Wuquf) on the 9th day of Dhul-Hijjah is described as the central rite of Hajj, distinct from Sa'i, Tawaf, or the stoning at Mina.",
  }),
];

export const hajj: Skill = {
  id: "g6-ire-da-hajj",
  code: "DA.4",
  subjectId: "ire",
  strandId: "g6-ire-devotional",
  grade: 6,
  title: "Hajj",
  description: "Hajj: the conditions for it being obligatory, the three recognised types (Ifrad, Tamattu, Qiran), and the sequence of its main rites.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, HAJJ_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from entering Ihram to the final Tawaf.",
        items,
        correctOrder: HAJJ_SEQUENCE.map((s) => s.id),
        hint: "It begins with entering Ihram and ends with a final Tawaf.",
        explanation: HAJJ_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const conditions = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "conditions")).slice(0, 3);
      const types = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "types")).slice(0, 3);
      const significance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "significance")).slice(0, 3);
      const chosen = shuffle(rng, [...conditions, ...types, ...significance]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["conditions", "types", "significance"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the conditions for Hajj, some about its three types, and some about its significance.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, HAJJ_TYPES);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about how each type combines (or does not combine) Hajj and Umrah.",
        explanation: chosen.map((t) => `${t.name} — ${t.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about the conditions for Hajj, the three types, or the specific rites and what each one is.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Being financially and physically able to make the journey is called", after: ".", answer: "istita'ah", accepted: ["istita'ah", "istitaah"] },
      { before: "Performing Hajj alone, without combining it with Umrah, is called", after: ".", answer: "Ifrad", accepted: ["ifrad"] },
      { before: "Performing Umrah first, then beginning Hajj rites separately, is called", after: ".", answer: "Tamattu", accepted: ["tamattu"] },
      { before: "Combining Hajj and Umrah in one continuous state of Ihram is called", after: ".", answer: "Qiran", accepted: ["qiran"] },
      { before: "The pilgrim's ritual state and dress is called", after: ".", answer: "Ihram", accepted: ["ihram"] },
      { before: "Circling the Kaaba seven times is called", after: ".", answer: "Tawaf", accepted: ["tawaf"] },
      { before: "Walking between the hills of Safa and Marwah seven times is called", after: ".", answer: "Sa'i", accepted: ["sa'i", "sai"] },
      { before: "Standing at Arafat, the central rite of Hajj, is called", after: ".", answer: "Wuquf", accepted: ["wuquf"] },
      { before: "Stoning the pillars at Mina is called", after: ".", answer: "Jamarat", accepted: ["jamarat"] },
      { before: "Hajj is a pillar of Islam, obligatory once in a", after: "for those who meet its conditions.", answer: "lifetime", accepted: ["lifetime"] },
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
      hint: "Recall the conditions for Hajj, its three types, and the sequence of its main rites.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
