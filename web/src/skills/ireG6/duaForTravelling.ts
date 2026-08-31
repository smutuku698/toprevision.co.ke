import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists in the dua's meaning itself, so the ordering branch uses a
// curriculum-reasonable real-world sequence: safe practices a passenger should observe, named
// explicitly in the sub-strand's own suggested learning experiences.
const ORDER_PROMPTS = [
  "Arrange these safe travel practices in a sensible order.",
  "Put these safe passenger practices into a sensible order.",
  "Sequence these travel safety steps, from boarding to arrival.",
  "Order these safe practices for a passenger in a vehicle.",
  "Sort these travel safety steps into a sensible order.",
  "Arrange these passenger safety steps in a sensible order.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of this sub-strand it describes.",
  "Group each statement under the aspect it describes.",
  "Decide which aspect each statement describes, and sort it there.",
  "Sort each fact into the aspect it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect.",
];

const MATCH_PROMPTS = [
  "Match each term about travel and the dua to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about travelling.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const SAFETY_STEPS = [
  { id: "board-through-door", label: "Board the vehicle through the door" },
  { id: "recite-dua", label: "Recite the dua for travelling once seated" },
  { id: "stay-seated", label: "Remain seated while the vehicle is in motion" },
  { id: "avoid-distracting", label: "Avoid distracting the driver during the journey" },
];

interface TopicFact {
  text: string;
  topic: "the-dua" | "meaning" | "safety";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "the-dua": "About the dua itself",
  meaning: "What the dua means and teaches",
  safety: "Safe travel practices",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The dua for travelling is recited before or when starting a journey", topic: "the-dua" },
  { text: "The dua acknowledges Allah's control over the vehicle/journey", topic: "the-dua" },
  { text: "This dua for travelling was narrated by Muslim", topic: "the-dua" },
  { text: "The dua notes that humans 'were unable to control' the vehicle themselves without Allah enabling it", topic: "meaning" },
  { text: "The dua expresses humility and reliance on Allah for a safe journey", topic: "meaning" },
  { text: "The dua reminds the traveller of their ultimate return to Allah", topic: "meaning" },
  { text: "Even an everyday activity like travelling can become a moment of worship through this dua", topic: "meaning" },
  { text: "A passenger should board a vehicle through the door", topic: "safety" },
  { text: "A passenger should remain seated while the vehicle is in motion", topic: "safety" },
  { text: "A passenger should avoid distracting the driver", topic: "safety" },
  { text: "Safe travel practices are a practical companion to the spiritual practice of reciting the dua", topic: "safety" },
  { text: "Reciting the dua and observing safe practices can both be part of the same journey", topic: "safety" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "The dua for travelling", meaning: "A supplication recited before or when starting a journey, seeking Allah's protection" },
  { term: "Muslim (the narrator)", meaning: "The collector of Hadith who recorded this dua" },
  { term: "Humility", meaning: "The attitude the dua expresses by acknowledging humans could not control the vehicle without Allah" },
  { term: "Boarding through the door", meaning: "One of the safe practices a passenger should observe" },
  { term: "Staying seated", meaning: "A safe practice observed while the vehicle is in motion" },
  { term: "Not distracting the driver", meaning: "A safe practice that helps keep everyone in the vehicle safe" },
  { term: "Ultimate return", meaning: "What the dua reminds the traveller of — that they will return to Allah" },
  { term: "Everyday worship", meaning: "Turning an ordinary activity, like travelling, into an act of gratitude through dua" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, boards a school bus for a field trip and, once seated, quietly recites the dua for travelling. What does this act reflect?`,
      correct: "A moment of everyday worship — acknowledging Allah's role in the journey, as this dua teaches",
      wrong: [
        "An unnecessary act, since dua only applies to formal worship like prayer",
        "A superstition unrelated to Islamic teaching",
        "A requirement only for very long journeys, not short bus rides",
      ],
      explanation: "Reciting the dua when starting any journey — even a short school trip — reflects turning an everyday activity into a moment of gratitude and worship.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps standing and moving around while the matatu (public transport vehicle) is in motion. What safe practice named in this sub-strand is being ignored?`,
      correct: "Remaining seated while the vehicle is in motion",
      wrong: [
        "Boarding through the door, which is unrelated to standing while moving",
        "Reciting the dua, which has no connection to physical safety",
        "Avoiding distraction of the driver, which is about talking, not standing",
      ],
      explanation: "Standing and moving around while a vehicle is in motion goes directly against the safe practice of remaining seated during the journey.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} repeatedly leans forward to talk loudly to the driver during a journey, distracting them from the road. What does this go against?`,
    correct: "The safe practice of avoiding distraction of the driver",
    wrong: [
      "The practice of boarding through the door, which is about entry, not conversation",
      "The dua's meaning, which has nothing to do with passenger behaviour",
      "Nothing in particular, since talking to a driver is always harmless",
    ],
    explanation: "Repeatedly distracting the driver directly contradicts the named safe practice of avoiding distraction during the journey, which protects everyone in the vehicle.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says the dua for travelling is pointless since modern vehicles are entirely controlled by human engineering, not Allah. Evaluate this reasoning.`,
      correct: "Flawed — the dua acknowledges that Allah ultimately enabled humans to design and control such vehicles in the first place, not that engineering itself is irrelevant",
      wrong: [
        "Sound — modern vehicles have no religious significance at all",
        "Sound — the dua only applied to animals like camels, never to modern transport",
        "Flawed — but only because engineers are considered prophets in this teaching",
      ],
      explanation: "The dua's point is that humans 'were unable to control' such transportation without Allah's enabling — this includes the very human ingenuity that made engineering possible.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that safe passenger practices (like staying seated) and reciting the dua are unrelated and should never be discussed together. Is this accurate?`,
    correct: "No — the sub-strand presents them together, since safe practices are a practical companion to the spiritual practice of reciting the dua",
    wrong: [
      "Yes — spiritual practices and physical safety are always treated separately in Islamic teaching",
      "Yes — only one of the two can ever be relevant on a single journey",
      "No — but only because safe practices are actually part of the dua's wording itself",
    ],
    explanation: "This sub-strand explicitly pairs the dua with safe travel practices, presenting them as complementary parts of preparing for a journey responsibly.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} boards a vehicle by climbing through an open window rather than using the door, to save time. What does this go against?`,
      correct: "The safe practice of boarding a vehicle through the door",
      wrong: [
        "The practice of staying seated, which applies only once already inside",
        "The dua's meaning, which has nothing to do with how someone boards",
        "Nothing in particular, since the method of boarding does not matter",
      ],
      explanation: "Boarding through a window instead of the door directly contradicts the named safe practice of boarding a vehicle through the door.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the dua's mention of "returning to our Lord" is only about death and has no connection to an everyday bus ride. Evaluate this reasoning.`,
    correct: "Flawed — the dua deliberately connects an everyday journey to the reminder of ultimate return to Allah, giving spiritual meaning to ordinary travel",
    wrong: [
      "Sound — the phrase about returning to Allah has no place in a dua about everyday travel",
      "Sound — the dua is only recited during Hajj, never for ordinary journeys",
      "Flawed — but only because the dua actually forbids thinking about death at all",
    ],
    explanation: "The dua intentionally links an everyday journey to the reminder of returning to Allah, turning a routine activity into a moment of reflection and gratitude.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says safety practices like staying seated only matter for long journeys, not short ones. Is this correct?`,
    correct: "No — the safe practices named (boarding through the door, staying seated, not distracting the driver) apply to any journey, regardless of length",
    wrong: [
      "Yes — short journeys carry no risk requiring safe practices",
      "Yes — the sub-strand specifically limits safe practices to long-distance travel",
      "No — but only because short journeys actually require more caution than long ones",
    ],
    explanation: "The safe practices named in this sub-strand apply generally to any journey in a vehicle, not only to long-distance travel.",
  }),
];

export const duaForTravelling: Skill = {
  id: "g6-ire-ak-dua-for-travelling",
  code: "AK.5",
  subjectId: "ire",
  strandId: "g6-ire-akhlaq",
  grade: 6,
  title: "Dua for Travelling",
  description: "The dua recited when starting a journey, seeking Allah's protection, and the safe practices a passenger should observe while travelling.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, SAFETY_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from boarding to the journey being underway.",
        items,
        correctOrder: SAFETY_STEPS.map((s) => s.id),
        hint: "It starts with boarding through the door and continues through the journey with the dua and safe conduct.",
        explanation: SAFETY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const theDua = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-dua")).slice(0, 3);
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const safety = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "safety")).slice(0, 3);
      const chosen = shuffle(rng, [...theDua, ...meaning, ...safety]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["the-dua", "meaning", "safety"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the dua itself, some about its meaning, and some about safe travel practices.",
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
        hint: "Think about what each term refers to in the dua and its safe-travel companion practices.",
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
        hint: "Think about which safe practice or aspect of the dua's meaning the situation involves.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The dua for travelling was narrated by", after: ".", answer: "Muslim", accepted: ["muslim"] },
      { before: "The dua acknowledges that Allah has brought the vehicle under our", after: ".", answer: "control", accepted: ["control"] },
      { before: "The dua notes that we were unable to control the vehicle", after: ".", answer: "ourselves", accepted: ["ourselves"] },
      { before: "The dua reminds the traveller that to our Lord we will surely", after: ".", answer: "return", accepted: ["return"] },
      { before: "A passenger should board a vehicle through the", after: ".", answer: "door", accepted: ["door"] },
      { before: "A passenger should remain seated while the vehicle is in", after: ".", answer: "motion", accepted: ["motion"] },
      { before: "A passenger should avoid", after: "the driver during the journey.", answer: "distracting", accepted: ["distracting"] },
      { before: "The dua expresses", after: "and reliance on Allah for a safe journey.", answer: "humility", accepted: ["humility"] },
      { before: "Reciting the dua turns an everyday activity like travelling into a moment of", after: ".", answer: "worship", accepted: ["worship"] },
      { before: "Safe practices are a practical companion to the", after: "practice of reciting the dua.", answer: "spiritual", accepted: ["spiritual"] },
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
      hint: "Recall the dua for travelling, its meaning, and the safe passenger practices named alongside it.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
