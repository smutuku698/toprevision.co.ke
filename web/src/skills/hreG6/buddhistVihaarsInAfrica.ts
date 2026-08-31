import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "these events from the life of the Buddha in the order they happened.",
    "these moments from the Buddha's life into the order they occurred.",
    "these events from the Buddha's life from first to last.",
    "these events as they happened in the Buddha's life.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by whether it describes a feature or a practice/ceremony of a Buddhist Vihaar.",
    "these facts under the correct heading.",
    "each fact below by whether it is a feature or a practice/ceremony.",
    "each fact into the bucket for a Vihaar feature or a Vihaar practice/ceremony.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the feature or practice it relates to.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Buddhist Vihaars.",
    "the correct missing word.",
  ],
);

// The traditional Six Great Events of the Buddha's life, in their standard biographical order — genuine,
// widely taught content directly relevant to why a Vihaar's shrine room and Bodhi tree representation
// matter, not an invented sequence.
const BUDDHA_LIFE = [
  { id: "b1", label: "Born at Lumbini as Prince Siddhartha" },
  { id: "b2", label: "Renounces palace life after seeing an old man, a sick man, a dead man, and an ascetic" },
  { id: "b3", label: "Practises severe self-denial for six years without reaching awakening" },
  { id: "b4", label: "Attains enlightenment while meditating under the Bodhi tree at Bodh Gaya, becoming the Buddha" },
  { id: "b5", label: "Delivers his first sermon at Sarnath, setting the Wheel of Dhamma in motion" },
  { id: "b6", label: "Passes into parinirvana (final death) at Kushinagar" },
];

interface VihaarFact { text: string; kind: "feature" | "practice" }
const VIHAAR_FACTS: VihaarFact[] = [
  { text: "A shrine room housing the main Buddha statue as the focus of worship", kind: "feature" },
  { text: "A stupa, a dome-shaped structure symbolising the Buddha's enlightenment", kind: "feature" },
  { text: "A meditation hall used for group mindfulness practice", kind: "feature" },
  { text: "Quarters for resident monks (bhikkhus) who care for the Vihaar", kind: "feature" },
  { text: "A representation of the Bodhi tree, recalling the tree under which the Buddha attained enlightenment", kind: "feature" },
  { text: "A bell or gong used to mark the start and end of meditation periods", kind: "feature" },
  { text: "Vesak (Wesak) Day, commemorating the Buddha's birth, enlightenment, and death together on one day", kind: "practice" },
  { text: "Uposatha observance days, when practitioners renew their commitment to the precepts and to meditation", kind: "practice" },
  { text: "Dana, the practice of offering alms and requisites to monks", kind: "practice" },
  { text: "Offering flowers, incense, and light at the shrine as symbolic acts", kind: "practice" },
  { text: "Group chanting of Buddhist mantras and scriptures", kind: "practice" },
  { text: "Guided meditation sessions held for the local community", kind: "practice" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Stupa", meaning: "A dome-shaped structure symbolising the Buddha's enlightenment" },
  { term: "Vesak (Wesak) Day", meaning: "The day commemorating the Buddha's birth, enlightenment, and death together" },
  { term: "Dana", meaning: "The practice of offering alms and requisites to monks" },
  { term: "Uposatha", meaning: "A periodic observance day for renewing commitment to the precepts and meditation" },
  { term: "Bodhi tree", meaning: "The tree under which the Buddha attained enlightenment at Bodh Gaya" },
  { term: "Bhikkhu", meaning: "A Buddhist monk who may reside at a Vihaar" },
  { term: "Shrine room", meaning: "The room in a Vihaar that houses the main Buddha statue" },
  { term: "Meditation hall", meaning: "A space in a Vihaar for group mindfulness practice" },
  { term: "Incense offering", meaning: "A symbolic act of purification performed at the shrine" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} visits a Buddhist Vihaar and notices a dome-shaped structure standing separately from the main shrine room. What is this structure most likely to be?`,
    correct: "A stupa, symbolising the Buddha's enlightenment",
    wrong: [
      "A meditation hall used only for chanting",
      "Quarters reserved only for visiting guests",
      "A representation of the Bodhi tree",
    ],
    explanation: "A dome-shaped structure at a Vihaar is characteristically a stupa, a feature symbolising the Buddha's enlightenment.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is confused about why Vesak Day commemorates the Buddha's birth, enlightenment, and death all on the same single day. What is the best explanation?`,
    correct: "Buddhist tradition observes all three events together on one holy day each year, even though they happened at different points in the Buddha's life",
    wrong: [
      "The Buddha's birth, enlightenment, and death actually all occurred on the very same calendar day of his life",
      "Vesak Day only commemorates the Buddha's birth, and the other two events are unrelated",
      "Vesak Day is celebrated on a different day in every single Vihaar",
    ],
    explanation: "Vesak Day traditionally commemorates all three major events of the Buddha's life together on one day each year, even though the events themselves occurred years apart in his actual life.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees monks receiving food and requisites from visitors at a Vihaar. Which practice is being observed?`,
    correct: "Dana, the practice of offering alms to monks",
    wrong: [
      "Uposatha, a periodic observance day",
      "Vesak Day, commemorating three events in the Buddha's life",
      "Tisarana, taking refuge in the Triple Gem",
    ],
    explanation: "Offering food and requisites to monks is specifically the practice of Dana, distinct from Uposatha, Vesak Day, or tisarana.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks why a Vihaar keeps a representation of the Bodhi tree. What is the best answer?`,
      correct: "It recalls the tree under which the Buddha attained enlightenment at Bodh Gaya",
      wrong: [
        "It is simply decorative and unrelated to any event in the Buddha's life",
        "It represents the location of the Buddha's birth at Lumbini",
        "It represents the location of the Buddha's first sermon at Sarnath",
      ],
      explanation: "The Bodhi tree representation specifically recalls the tree under which the Buddha attained enlightenment at Bodh Gaya, not his birth or first sermon, which occurred at different locations.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that a Vihaar's features (like the stupa or shrine room) and its practices (like Dana or chanting) are really the same thing described with different words. Evaluate this claim.`,
    correct: "Flawed — features are physical structures or objects, while practices/ceremonies are the activities carried out at the Vihaar",
    wrong: [
      "Sound — features and practices are always identical at every Vihaar",
      "Sound — a stupa and a chanting session describe the exact same thing",
      "Flawed — but only because Vihaars actually have no physical features at all",
    ],
    explanation: "Features (a stupa, shrine room, meditation hall) are physical parts of a Vihaar, while practices (Dana, Vesak Day, chanting) are activities carried out there — the two are genuinely distinct categories.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why it is important to visit a place of worship, per this lesson's key inquiry question. What is the best answer?`,
    correct: "It builds firsthand understanding of the features, practices, and ceremonies that give the place its spiritual and moral significance",
    wrong: [
      "It matters only for taking photographs to share on social media",
      "It has no educational value beyond what a textbook description already gives",
      "It matters only if the visitor personally practises that faith",
    ],
    explanation: "Visiting a place of worship, as this lesson's own learning experiences suggest, builds firsthand appreciation of its features and practices — an understanding that reading alone cannot fully provide.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} hears a bell rung at a Vihaar and wonders what it signals. What is the most likely explanation?`,
      correct: "It marks the start or end of a meditation period",
      wrong: [
        "It signals that Dana offerings are forbidden that day",
        "It replaces the need for a shrine room at that Vihaar",
        "It is used only during the six years of the Buddha's ascetic practice",
      ],
      explanation: "A bell or gong at a Vihaar is typically used to mark the beginning or end of a meditation period, a practical feature supporting the meditation hall's use.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says Uposatha days and Vesak Day are the exact same observance. Is this accurate?`,
    correct: "No — Uposatha days recur periodically for renewing the precepts and meditation, while Vesak Day is a single annual day commemorating three events of the Buddha's life",
    wrong: [
      "Yes — both terms describe the same single annual observance",
      "Yes — Uposatha is simply another name used only for Vesak Day",
      "No — but only because Uposatha days occur just once in a lifetime",
    ],
    explanation: "Uposatha days are periodic observances for renewing commitment to the precepts and meditation, distinct from Vesak Day, which is a single annual commemoration of the Buddha's birth, enlightenment, and death.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to use digital devices to locate a Buddhist Vihaar in Kenya, as this lesson suggests. What is the most appropriate first step?`,
    correct: "Search using a mapping or search application, then verify the information with a resource person or teacher",
    wrong: [
      "Assume no Buddhist Vihaar exists anywhere in Kenya without searching at all",
      "Visit any place of worship at random regardless of faith",
      "Wait for a classmate to describe one from memory instead of searching",
    ],
    explanation: "This lesson's own learning experiences encourage using digital devices to locate a Buddhist Vihaar in Kenya, then verifying findings — an appropriate, methodical way to carry out the activity.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that after attaining enlightenment under the Bodhi tree, the Buddha immediately passed into parinirvana with no further teaching. Is this an accurate summary of his life?`,
    correct: "No — after enlightenment, he delivered his first sermon at Sarnath and continued teaching for years before his eventual parinirvana at Kushinagar",
    wrong: [
      "Yes — his life ended immediately after the moment of enlightenment",
      "Yes — the first sermon at Sarnath happened before his enlightenment, not after",
      "No — but only because he never delivered any sermon at all",
    ],
    explanation: "After his enlightenment at Bodh Gaya, the Buddha delivered his first sermon at Sarnath and continued teaching for years before his parinirvana at Kushinagar — the two events are separated by an active teaching life, not immediate.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees visitors offering flowers and incense at a Vihaar's shrine and assumes this has no symbolic meaning. Is this a fair assumption?`,
    correct: "No — offering flowers, incense, and light at the shrine are symbolic acts connected to Buddhist practice",
    wrong: [
      "Yes — such offerings are purely decorative with no symbolic role",
      "Yes — only Dana carries any symbolic meaning at a Vihaar",
      "No — but only flowers, not incense or light, carry any symbolic meaning",
    ],
    explanation: "Offering flowers, incense, and light at the shrine are recognised symbolic practices at a Vihaar, not merely decorative acts.",
  }),
];

export const buddhistVihaarsInAfrica: Skill = {
  id: "g6-hre-wo-buddhist-vihaars-in-africa",
  code: "WO.2",
  subjectId: "hre",
  strandId: "g6-hre-wo",
  grade: 6,
  title: "Buddhist Vihaars in Africa",
  description: "Features of a Buddhist Vihaar (shrine room, stupa, meditation hall, Bodhi tree) and the practices and ceremonies held there (Vesak Day, Uposatha, Dana, chanting), plus the Six Great Events of the Buddha's life that give these features meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, BUDDHA_LIFE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from his birth to his parinirvana.",
        items,
        correctOrder: BUDDHA_LIFE.map((b) => b.id),
        hint: "His life runs from birth, through renunciation and self-denial, to enlightenment, his first sermon, and finally parinirvana.",
        explanation: BUDDHA_LIFE.map((b) => b.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const features = shuffle(rng, VIHAAR_FACTS.filter((f) => f.kind === "feature")).slice(0, 4);
      const practices = shuffle(rng, VIHAAR_FACTS.filter((f) => f.kind === "practice")).slice(0, 4);
      const chosen = shuffle(rng, [...features, ...practices]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "feature", label: "A feature of a Buddhist Vihaar" },
          { id: "practice", label: "A practice or ceremony held there" },
        ],
        correctBucket,
        hint: "A feature is a physical part of the Vihaar; a practice or ceremony is an activity carried out there.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "feature" ? "a feature" : "a practice/ceremony"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether each term names a feature, a practice, or a person connected to a Vihaar.",
        explanation: chosen.map((a) => `${a.term} — ${a.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about whether the scenario describes a Vihaar feature, a practice/ceremony, or an event from the Buddha's life.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "A stupa is a dome-shaped structure symbolising the Buddha's", after: ".", answer: "enlightenment", accepted: ["enlightenment"] },
      { before: "Vesak Day commemorates the Buddha's birth, enlightenment, and", after: "together.", answer: "death", accepted: ["death"] },
      { before: "Dana is the practice of offering alms to", after: ".", answer: "monks", accepted: ["monks"] },
      { before: "Uposatha days are for renewing commitment to the precepts and", after: ".", answer: "meditation", accepted: ["meditation"] },
      { before: "The Bodhi tree recalls where the Buddha attained", after: "at Bodh Gaya.", answer: "enlightenment", accepted: ["enlightenment"] },
      { before: "The Buddha was born at", after: "as Prince Siddhartha.", answer: "Lumbini", accepted: ["lumbini"] },
      { before: "The Buddha practised severe self-denial for", after: "years without reaching awakening.", answer: "six", accepted: ["six", "6"] },
      { before: "The Buddha delivered his first sermon at", after: ".", answer: "Sarnath", accepted: ["sarnath"] },
      { before: "The Buddha passed into parinirvana at", after: ".", answer: "Kushinagar", accepted: ["kushinagar"] },
      { before: "A Buddhist monk who may reside at a Vihaar is called a", after: ".", answer: "bhikkhu", accepted: ["bhikkhu"] },
      { before: "The main Buddha statue at a Vihaar is housed in the", after: "room.", answer: "shrine", accepted: ["shrine"] },
      { before: "Offering flowers, incense, and light at the shrine are", after: "acts.", answer: "symbolic", accepted: ["symbolic"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the Vihaar's features, its practices and ceremonies, and the Six Great Events of the Buddha's life.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
