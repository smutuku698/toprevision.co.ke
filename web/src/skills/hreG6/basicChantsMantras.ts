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
    "the five precepts of pancha sila in their traditional order.",
    "these precepts of pancha sila into the order they are traditionally recited.",
    "the pancha sila precepts from the first to the fifth.",
    "these precepts into their correct traditional order.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by which chant or practice it describes.",
    "these facts under the correct chant or practice.",
    "each fact below by whether it is about paying homage, tisarana, or pancha sila.",
    "each fact into the bucket for the practice it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the chant or precept it relates to.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Buddhist chants and mantras.",
    "the correct missing word.",
  ],
);

// The five precepts of pancha sila, in their traditional fixed order — genuine, curriculum-endorsed
// sequential content, not an invented order (matching the precedent set by CRE G6's Ten Commandments).
const PANCHA_SILA = [
  { id: "p1", label: "1st: Refrain from killing living beings" },
  { id: "p2", label: "2nd: Refrain from stealing" },
  { id: "p3", label: "3rd: Refrain from sexual misconduct" },
  { id: "p4", label: "4th: Refrain from false speech" },
  { id: "p5", label: "5th: Refrain from intoxicants that cloud the mind" },
];

interface ChantFact { text: string; practice: "homage" | "tisarana" | "pancha" }
const PRACTICE_LABEL: Record<ChantFact["practice"], string> = {
  homage: "Paying homage to the Buddha",
  tisarana: "Tisarana (Triple Gem)",
  pancha: "Pancha sila (Five Precepts)",
};
const CHANT_FACTS: ChantFact[] = [
  { text: "The homage chant 'Namo Tassa Bhagavato Arahato Sammasambuddhassa' means 'Homage to the Blessed One, the Worthy One, the Perfectly Awakened One'", practice: "homage" },
  { text: "The homage chant is traditionally recited three times before other chants or meditation begin", practice: "homage" },
  { text: "Paying homage to the Buddha is done for spiritual nourishment before other Buddhist practices", practice: "homage" },
  { text: "Tisarana means taking refuge in the 'Triple Gem': the Buddha, the Dhamma (teaching), and the Sangha (community)", practice: "tisarana" },
  { text: "The tisarana chant includes the line 'Buddham saranam gacchami' — 'I go to the Buddha for refuge'", practice: "tisarana" },
  { text: "The tisarana chant includes the line 'Dhammam saranam gacchami' — 'I go to the Dhamma for refuge'", practice: "tisarana" },
  { text: "The tisarana chant includes the line 'Sangham saranam gacchami' — 'I go to the Sangha for refuge'", practice: "tisarana" },
  { text: "Pancha sila lists five precepts that guide moral development for Buddhist practitioners", practice: "pancha" },
  { text: "Pancha sila's first precept is to refrain from killing living beings", practice: "pancha" },
  { text: "Pancha sila's fifth precept is to refrain from intoxicants that cloud the mind", practice: "pancha" },
  { text: "Pancha sila's precept against false speech encourages honesty in daily life", practice: "pancha" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Namo Tassa...", meaning: "The chant paying homage to the Buddha as the Perfectly Awakened One" },
  { term: "Tisarana", meaning: "Taking refuge in the Triple Gem: the Buddha, the Dhamma, and the Sangha" },
  { term: "Buddham saranam gacchami", meaning: "'I go to the Buddha for refuge', a line of the tisarana chant" },
  { term: "Dhammam saranam gacchami", meaning: "'I go to the Dhamma for refuge', a line of the tisarana chant" },
  { term: "Sangham saranam gacchami", meaning: "'I go to the Sangha for refuge', a line of the tisarana chant" },
  { term: "Pancha sila", meaning: "The five precepts guiding moral development for Buddhist practitioners" },
  { term: "Triple Gem", meaning: "The Buddha, the Dhamma, and the Sangha together" },
  { term: "Sangha", meaning: "The community of Buddhist practitioners referred to in the tisarana chant" },
  { term: "Dhamma", meaning: "The Buddha's teaching, one of the three refuges in tisarana" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} finds money dropped by a classmate and considers keeping it. Which pancha sila precept is most relevant here?`,
    correct: "The precept to refrain from stealing",
    wrong: [
      "The precept to refrain from killing living beings",
      "The precept to refrain from intoxicants that cloud the mind",
      "The chant of paying homage to the Buddha",
    ],
    explanation: "Keeping something that belongs to someone else without permission is exactly what pancha sila's second precept, refraining from stealing, addresses.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what the tisarana chant means when it says 'I go to the Sangha for refuge'. What is the best explanation?`,
    correct: "It expresses trust and support found in the community of Buddhist practitioners",
    wrong: [
      "It expresses trust in a single teacher rather than any community",
      "It refers to one of the five precepts of pancha sila",
      "It refers to the traditional homage chant to the Buddha",
    ],
    explanation: "'Sangham saranam gacchami' expresses taking refuge specifically in the Sangha — the community of Buddhist practitioners — one of the three parts of the Triple Gem.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says only monks need to recite the homage chant 'Namo Tassa...' and it has no relevance to ordinary practitioners. Is this accurate?`,
    correct: "No — the homage chant is a widely used practice recited before other Buddhist chants or meditation, not limited to monks alone",
    wrong: [
      "Yes — the homage chant is exclusively reserved for monks",
      "Yes — the homage chant is only used once a year during a specific festival",
      "No — but only because the homage chant has nothing to do with meditation",
    ],
    explanation: "The homage chant is traditionally recited before other chants or meditation as a widely practised act of spiritual nourishment, not one limited to monks.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is offered a drink that clouds the mind at a social gathering and hesitates. Applying pancha sila, what is the relevant guidance?`,
      correct: "The fifth precept advises refraining from intoxicants that cloud the mind",
      wrong: [
        "The first precept advises refraining from killing living beings",
        "The third precept advises refraining from sexual misconduct",
        "The tisarana chant advises taking refuge in the Sangha instead",
      ],
      explanation: "Pancha sila's fifth precept specifically addresses refraining from intoxicants that cloud the mind, directly relevant to this situation.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims tisarana and pancha sila are simply two different names for the exact same practice. Evaluate this claim.`,
    correct: "Flawed — tisarana is about taking refuge in the Triple Gem, while pancha sila is a separate list of five moral precepts to follow",
    wrong: [
      "Sound — both terms describe identical content with no real difference",
      "Sound — pancha sila is just another word used for the homage chant",
      "Flawed — but only because tisarana actually refers to the five precepts",
    ],
    explanation: "Tisarana (taking refuge in the Buddha, Dhamma, and Sangha) and pancha sila (five moral precepts) are two distinct practices, even though both are part of Buddhist worship.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to explain the Triple Gem referred to in tisarana. Which answer is correct?`,
    correct: "The Buddha, the Dhamma, and the Sangha",
    wrong: [
      "The five precepts of pancha sila",
      "The homage chant recited three times",
      "The Bhagwad Gita, Sutta Pitaka, and Sri Guru Granth Sahib ji",
    ],
    explanation: "The Triple Gem specifically refers to the Buddha, the Dhamma (teaching), and the Sangha (community) — the three refuges named in the tisarana chant.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} spreads a rumour about a classmate that is not true. Which pancha sila precept does this go against?`,
      correct: "The precept to refrain from false speech",
      wrong: [
        "The precept to refrain from stealing",
        "The precept to refrain from killing living beings",
        "The precept to refrain from sexual misconduct",
      ],
      explanation: "Spreading an untrue rumour directly goes against pancha sila's precept to refrain from false speech, which encourages honesty in daily life.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that reciting mantras like tisarana and pancha sila has no real connection to moral values or spiritual growth. Is this a fair view?`,
    correct: "No — discussing with peers how chanting these mantras helps develop moral values and spiritual growth is part of this very lesson",
    wrong: [
      "Yes — chants are recited only for their sound, with no connection to meaning",
      "Yes — pancha sila's precepts have no bearing on everyday moral choices",
      "No — but only tisarana, and not pancha sila, connects to moral values",
    ],
    explanation: "This lesson's own learning experiences involve discussing how chanting these mantras helps develop moral values and spiritual growth — both tisarana and pancha sila connect chanting to moral development.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why recitation of chants and mantras matters on Buddhist occasions, per this lesson's key inquiry question. What is the best answer?`,
    correct: "It nourishes spiritual growth and reinforces moral commitments, such as taking refuge and keeping the precepts",
    wrong: [
      "It matters only because the words must sound pleasant, regardless of their meaning",
      "It has no real importance and is simply a tradition without further purpose",
      "It matters only on the one specific day each year that Buddhist occasions are marked",
    ],
    explanation: "Reciting these chants on Buddhist occasions nourishes spiritual growth and reinforces moral commitments — taking refuge through tisarana and upholding the precepts of pancha sila.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is unkind to an insect and later argues that pancha sila's first precept applies only to harming people, not animals. Is this accurate?`,
    correct: "No — the first precept, refraining from killing living beings, is broader than harming people alone",
    wrong: [
      "Yes — pancha sila's precepts apply strictly and only to human beings",
      "Yes — insects are specifically excluded from any Buddhist moral teaching",
      "No — but only because pancha sila does not actually contain a precept about killing",
    ],
    explanation: "Pancha sila's first precept is phrased as refraining from killing 'living beings', a broader scope than harming people alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to write the tisarana chant's three lines in the correct order they are usually recited. Which order is correct?`,
    correct: "Buddham saranam gacchami, then Dhammam saranam gacchami, then Sangham saranam gacchami",
    wrong: [
      "Sangham saranam gacchami, then Buddham saranam gacchami, then Dhammam saranam gacchami",
      "Dhammam saranam gacchami, then Sangham saranam gacchami, then Buddham saranam gacchami",
      "The three lines have no traditional order and may be recited in any sequence",
    ],
    explanation: "Tisarana is traditionally recited taking refuge in the Buddha first, then the Dhamma, then the Sangha — Buddham, Dhammam, Sangham, in that order.",
  }),
];

export const basicChantsMantras: Skill = {
  id: "g6-hre-wo-basic-chants-mantras",
  code: "WO.1",
  subjectId: "hre",
  strandId: "g6-hre-wo",
  grade: 6,
  title: "Basic Chants and Mantras in the Buddh Faith",
  description: "Three basic Buddhist chants and practices — paying homage to the Buddha, tisarana (taking refuge in the Triple Gem), and pancha sila (the five precepts) — and their role in spiritual growth and moral development.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, PANCHA_SILA);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the 1st precept to the 5th.",
        items,
        correctOrder: PANCHA_SILA.map((p) => p.id),
        hint: "The traditional order runs from refraining from killing, through stealing, sexual misconduct, and false speech, to intoxicants.",
        explanation: PANCHA_SILA.map((p) => p.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const homage = shuffle(rng, CHANT_FACTS.filter((f) => f.practice === "homage")).slice(0, 2);
      const tisarana = shuffle(rng, CHANT_FACTS.filter((f) => f.practice === "tisarana")).slice(0, 3);
      const pancha = shuffle(rng, CHANT_FACTS.filter((f) => f.practice === "pancha")).slice(0, 3);
      const chosen = shuffle(rng, [...homage, ...tisarana, ...pancha]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.practice));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "homage", label: PRACTICE_LABEL.homage },
          { id: "tisarana", label: PRACTICE_LABEL.tisarana },
          { id: "pancha", label: PRACTICE_LABEL.pancha },
        ],
        correctBucket,
        hint: "Think about whether each fact is about the homage chant, taking refuge in the Triple Gem, or the five precepts.",
        explanation: chosen.map((f) => `"${f.text}" — ${PRACTICE_LABEL[f.practice]}.`).join(" "),
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
        hint: "Think about whether each term belongs to the homage chant, tisarana, or pancha sila.",
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
        hint: "Think about whether the homage chant, tisarana, or a specific pancha sila precept fits the situation.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The homage chant means 'Homage to the Blessed One, the Worthy One, the Perfectly", after: "One.'", answer: "Awakened", accepted: ["awakened"] },
      { before: "The homage chant is traditionally recited", after: "times before other chants or meditation.", answer: "three", accepted: ["three", "3"] },
      { before: "Tisarana means taking refuge in the", after: "Gem.", answer: "Triple", accepted: ["triple"] },
      { before: "The Triple Gem is made up of the Buddha, the Dhamma, and the", after: ".", answer: "Sangha", accepted: ["sangha"] },
      { before: "'Buddham saranam gacchami' means 'I go to the Buddha for", after: ".'", answer: "refuge", accepted: ["refuge"] },
      { before: "Pancha sila lists", after: "precepts for moral development.", answer: "five", accepted: ["five", "5"] },
      { before: "Pancha sila's 1st precept is to refrain from", after: "living beings.", answer: "killing", accepted: ["killing"] },
      { before: "Pancha sila's 2nd precept is to refrain from", after: ".", answer: "stealing", accepted: ["stealing"] },
      { before: "Pancha sila's 4th precept is to refrain from false", after: ".", answer: "speech", accepted: ["speech"] },
      { before: "Pancha sila's 5th precept is to refrain from intoxicants that", after: "the mind.", answer: "cloud", accepted: ["cloud"] },
      { before: "The Sangha refers to the", after: "of Buddhist practitioners.", answer: "community", accepted: ["community"] },
      { before: "The Dhamma refers to the Buddha's", after: ".", answer: "teaching", accepted: ["teaching"] },
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
      hint: "Recall the homage chant, the tisarana chant, and the five precepts of pancha sila.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
