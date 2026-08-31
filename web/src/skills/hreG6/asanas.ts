import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

// The 3 named Pranayams and 3 named Asanas are six independent techniques with no single shared
// sequence (unlike a fixed moral code or a narrative), so this skill uses categorize/match/reasoning/
// fill-blank — 4 kinds with a documented reason, per SKILL-QUALITY-STANDARDS.md's allowance.
const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by whether it describes a Pranayam or an Asana.",
    "these facts under the correct heading.",
    "each fact below by whether it is a breathing exercise or a physical posture.",
    "each fact into the bucket for Pranayam or Asana.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the Pranayam or Asana it names.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Pranayam and Asanas.",
    "the correct missing word.",
  ],
);

interface YogaFact { text: string; kind: "pranayam" | "asana" }
const YOGA_FACTS: YogaFact[] = [
  { text: "Bhramari Pranayam involves making a humming sound like a bee while exhaling, used to calm the mind", kind: "pranayam" },
  { text: "Sheetali Pranayam involves inhaling through a curled tongue to cool the body", kind: "pranayam" },
  { text: "Sheet kari Pranayam involves inhaling through clenched teeth, making a hissing sound, for a similar cooling effect", kind: "pranayam" },
  { text: "Practising Pranayam breathing exercises supports both physical and mental wellbeing", kind: "pranayam" },
  { text: "Pranayam refers to breath control practised as part of Yoga", kind: "pranayam" },
  { text: "Bhramari's humming sound is sometimes practised with the ears gently closed using the fingers", kind: "pranayam" },
  { text: "Dhanur Asan (Bow Pose) involves lying on the stomach, holding the ankles, and lifting the chest and thighs to form a bow shape", kind: "asana" },
  { text: "Vajra Asan (Thunderbolt Pose) is a kneeling posture with a straight spine, often practised after meals to aid digestion", kind: "asana" },
  { text: "Chakra chalan Asan involves rotating parts of the body in a circular motion, often used to prepare the joints", kind: "asana" },
  { text: "Dhanur Asan is named after its shape, which resembles a bow", kind: "asana" },
  { text: "Vajra Asan is one of the few Asanas recommended for practice right after eating", kind: "asana" },
  { text: "Practising Asanas correctly under supervision helps develop proper physical postures", kind: "asana" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Bhramari Pranayam", meaning: "A humming-bee breathing exercise used to calm the mind" },
  { term: "Sheetali Pranayam", meaning: "A cooling breathing exercise done by inhaling through a curled tongue" },
  { term: "Sheet kari Pranayam", meaning: "A cooling breathing exercise done by inhaling through clenched teeth" },
  { term: "Dhanur Asan", meaning: "The Bow Pose, formed by lifting the chest and thighs while holding the ankles" },
  { term: "Vajra Asan", meaning: "The Thunderbolt Pose, a kneeling posture often practised after meals" },
  { term: "Chakra chalan Asan", meaning: "A circular rotating movement often used to prepare the joints" },
  { term: "Pranayam", meaning: "Breath control practised as part of Yoga" },
  { term: "Asana", meaning: "A physical posture practised as part of Yoga" },
  { term: "International Yoga Day", meaning: "An annual day when Yoga's practice is celebrated worldwide" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} feels anxious before an exam and wants a Pranayam to help calm the mind. Which is most fitting, based on this lesson?`,
    correct: "Bhramari Pranayam, the humming-bee breath used to calm the mind",
    wrong: [
      "Vajra Asan, practised after meals to aid digestion",
      "Chakra chalan Asan, used to prepare the joints",
      "Dhanur Asan, which stretches the back muscles",
    ],
    explanation: "Bhramari Pranayam's humming-bee breath is specifically described in this lesson as a technique used to calm the mind, making it fitting for anxiety before an exam.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} has just eaten lunch and wants an Asana that is safe and helpful to practise right afterward. Which is most appropriate?`,
    correct: "Vajra Asan, one of the few Asanas recommended for practice right after eating",
    wrong: [
      "Dhanur Asan, which involves lying on the stomach and arching the back",
      "Bhramari Pranayam, a breathing exercise rather than an Asana",
      "Sheet kari Pranayam, a breathing exercise rather than an Asana",
    ],
    explanation: "Vajra Asan is specifically noted as one of the few Asanas recommended right after eating, unlike Dhanur Asan or the two breathing exercises listed here.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to cool down on a very hot afternoon using a Pranayam that involves inhaling through clenched teeth. Which technique matches this description?`,
    correct: "Sheet kari Pranayam",
    wrong: ["Sheetali Pranayam", "Bhramari Pranayam", "Chakra chalan Asan"],
    explanation: "Sheet kari Pranayam is specifically the technique that involves inhaling through clenched teeth, making a hissing sound, for a cooling effect — Sheetali instead uses a curled tongue.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is about to begin a Yoga session and wants to prepare the joints beforehand with gentle circular movements. Which Asana matches this description?`,
      correct: "Chakra chalan Asan",
      wrong: ["Dhanur Asan", "Vajra Asan", "Sheetali Pranayam"],
      explanation: "Chakra chalan Asan specifically involves rotating parts of the body in a circular motion, often used to prepare the joints before other practice.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} confuses Sheetali and Sheet kari Pranayams, thinking they use the exact same technique. Is this accurate?`,
    correct: "No — Sheetali uses a curled tongue to inhale, while Sheet kari uses clenched teeth to inhale, though both produce a cooling effect",
    wrong: [
      "Yes — both techniques are performed in exactly the same way",
      "Yes — both techniques are actually Asanas rather than Pranayams",
      "No — but only because Sheetali has nothing to do with cooling the body",
    ],
    explanation: "Sheetali and Sheet kari both cool the body but differ in technique — Sheetali inhales through a curled tongue, while Sheet kari inhales through clenched teeth.",
  }),
  (rng) => ({
    prompt: `${name(rng)} wants to stretch and strengthen the back muscles using a posture shaped like a bow. Which Asana is this?`,
    correct: "Dhanur Asan (Bow Pose)",
    wrong: ["Vajra Asan (Thunderbolt Pose)", "Chakra chalan Asan", "Bhramari Pranayam"],
    explanation: "Dhanur Asan is named for its bow-like shape, formed by lying on the stomach, holding the ankles, and lifting the chest and thighs — matching the description of stretching the back.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that all three named Pranayams (Bhramari, Sheetali, and Sheet kari) do exactly the same thing. Evaluate this claim.`,
    correct: "Flawed — Bhramari calms the mind through humming, while Sheetali and Sheet kari cool the body through different inhaling techniques",
    wrong: [
      "Sound — all three Pranayams produce identical effects using identical techniques",
      "Sound — only Bhramari is an actual breathing exercise; the other two are Asanas",
      "Flawed — but only because none of the three Pranayams actually affect the body at all",
    ],
    explanation: "Each named Pranayam has a distinct technique and emphasis — Bhramari calms the mind through humming, while Sheetali and Sheet kari cool the body through different inhaling methods.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps a journal recording changes noticed after weeks of practising Pranayam and Asanas, as this lesson suggests. What is the best reason for doing this?`,
      correct: "To acknowledge and track the importance of Pranayam and Asanas for healthy living over time",
      wrong: [
        "To replace the need for actually practising Pranayam and Asanas",
        "To compare results with classmates in a competitive ranking",
        "To record information that has no connection to this lesson's aim",
      ],
      explanation: "This lesson's own aim includes acknowledging the importance of Pranayam and Asanas for healthy living — a journal tracking personal changes over time directly supports that aim.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why Asanas are important in Yoga, per this lesson's key inquiry question. What is the best answer?`,
    correct: "Practising them correctly supports physical wellbeing and helps develop proper posture",
    wrong: [
      "Asanas exist purely for entertainment, with no connection to wellbeing",
      "Asanas are important only when practised without any supervision at all",
      "Asanas have no connection to physical postures or wellbeing",
    ],
    explanation: "This lesson connects practising Asanas correctly, often under supervision, to developing proper physical postures and supporting overall wellbeing.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that Pranayam is simply another word for Asana. Is this accurate?`,
    correct: "No — Pranayam refers to breath control, while Asana refers to a physical posture; they are related but distinct parts of Yoga",
    wrong: [
      "Yes — Pranayam and Asana describe exactly the same practice",
      "Yes — Asana refers only to breath control, and Pranayam refers only to posture",
      "No — but only because Pranayam has no connection to Yoga at all",
    ],
    explanation: "Pranayam (breath control) and Asana (physical posture) are two distinct, related components of Yoga practice, not interchangeable terms.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know what the importance of Pranayam in life is, per this lesson's key inquiry question. Which answer best reflects the lesson's aim?`,
    correct: "Pranayam supports physical wellbeing and helps develop good character through consistent, mindful practice",
    wrong: [
      "Pranayam has no real importance beyond being a fun activity",
      "Pranayam is important only for professional athletes, not ordinary learners",
      "Pranayam matters only once a year, during International Yoga Day",
    ],
    explanation: "This lesson connects Pranayam to physical wellbeing and good character building — an ongoing practice, not a once-a-year or specialist-only activity.",
  }),
];

export const asanas: Skill = {
  id: "g6-hre-yo-asanas",
  code: "YO.1",
  subjectId: "hre",
  strandId: "g6-hre-yo",
  grade: 6,
  title: "Asanas and Pranayam",
  description: "Three Pranayam breathing exercises (Bhramari, Sheetali, Sheet kari) and three Asanas (Dhanur, Vajra, Chakra chalan) — their techniques and their importance for physical and mental wellbeing.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const pranayam = shuffle(rng, YOGA_FACTS.filter((f) => f.kind === "pranayam")).slice(0, 4);
      const asana = shuffle(rng, YOGA_FACTS.filter((f) => f.kind === "asana")).slice(0, 4);
      const chosen = shuffle(rng, [...pranayam, ...asana]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "pranayam", label: "Pranayam (breathing exercise)" },
          { id: "asana", label: "Asana (physical posture)" },
        ],
        correctBucket,
        hint: "A Pranayam is a breathing exercise; an Asana is a physical posture.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "pranayam" ? "a Pranayam" : "an Asana"}.`).join(" "),
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
        hint: "Think about whether each term names a Pranayam, an Asana, or a general Yoga idea.",
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
        hint: "Think about which named Pranayam or Asana best fits the situation described.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Bhramari Pranayam involves making a humming sound like a", after: ".", answer: "bee", accepted: ["bee"] },
      { before: "Sheetali Pranayam involves inhaling through a curled", after: ".", answer: "tongue", accepted: ["tongue"] },
      { before: "Sheet kari Pranayam involves inhaling through clenched", after: ".", answer: "teeth", accepted: ["teeth"] },
      { before: "Dhanur Asan is named after its shape, which resembles a", after: ".", answer: "bow", accepted: ["bow"] },
      { before: "Vajra Asan is a kneeling posture often practised after", after: "to aid digestion.", answer: "meals", accepted: ["meals"] },
      { before: "Chakra chalan Asan involves rotating parts of the body in a", after: "motion.", answer: "circular", accepted: ["circular"] },
      { before: "Pranayam refers to breath", after: "practised as part of Yoga.", answer: "control", accepted: ["control"] },
      { before: "Asana refers to a physical", after: "practised as part of Yoga.", answer: "posture", accepted: ["posture"] },
      { before: "Dhanur Asan is formed by lifting the chest and thighs while holding the", after: ".", answer: "ankles", accepted: ["ankles"] },
      { before: "Chakra chalan Asan is often used to prepare the", after: "before other practice.", answer: "joints", accepted: ["joints"] },
      { before: "Practising Pranayam supports both physical and", after: "wellbeing.", answer: "mental", accepted: ["mental"] },
      { before: "International Yoga", after: "celebrates Yoga's practice worldwide each year.", answer: "Day", accepted: ["day"] },
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
      hint: "Recall the three named Pranayams and the three named Asanas.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
