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
    "these steps of organising a tree-planting drive in the order you would do them.",
    "these tree-planting steps into the order they should be carried out.",
    "these steps for a tree-planting drive from first to last.",
    "these tree-planting steps into their correct order.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by which communal aspect of Yoga it describes.",
    "these facts under the correct heading.",
    "each fact below by whether it is about wellness, harmonious living, or environmental protection.",
    "each fact into the bucket for the communal aspect it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the communal aspect it relates to.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the communal aspects of Yoga.",
    "the correct missing word.",
  ],
);

// A genuine procedural sequence for a tree-planting drive, directly matching the sub-strand's own
// "organise a tree planting drive in school" learning experience.
const TREE_PLANTING_STEPS = [
  { id: "t1", label: "Research the environmental need and choose suitable tree species" },
  { id: "t2", label: "Gather seedlings, tools, and materials needed for planting" },
  { id: "t3", label: "Select and prepare a suitable planting site" },
  { id: "t4", label: "Plant the trees at the correct spacing and depth" },
  { id: "t5", label: "Water the newly planted trees and add mulch if needed" },
  { id: "t6", label: "Monitor and care for the trees as they grow" },
];

interface CommunalFact { text: string; aspect: "wellness" | "harmony" | "environment" }
const ASPECT_LABEL: Record<CommunalFact["aspect"], string> = {
  wellness: "Enhanced wellness",
  harmony: "Harmonious living",
  environment: "Environmental protection",
};
const COMMUNAL_FACTS: CommunalFact[] = [
  { text: "Communal Yoga sessions combine meditation and group exercise to support both mental and physical wellness", aspect: "wellness" },
  { text: "Practising Yoga together as a community can help reduce stress and improve focus", aspect: "wellness" },
  { text: "Regular group meditation supports self-evaluation of personal improvement over time", aspect: "wellness" },
  { text: "Composing and reciting songs or poems on peace in groups helps build harmonious relationships", aspect: "harmony" },
  { text: "Working with a guidance and counselling teacher helps address critical issues learners face, supporting harmony", aspect: "harmony" },
  { text: "Assisting classmates with special needs to safely participate in group activities builds an inclusive, harmonious community", aspect: "harmony" },
  { text: "Participating in a cleaning campaign helps keep the school compound free of pollution", aspect: "environment" },
  { text: "Organising a tree-planting drive helps protect the environment and support future generations", aspect: "environment" },
  { text: "Making posters about conserving the environment raises awareness in the school and wider community", aspect: "environment" },
  { text: "Sensitising the community about noise and air pollution helps protect shared environments", aspect: "environment" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Communal Yoga", meaning: "Group practice of meditation and exercise for shared wellness" },
  { term: "Tree-planting drive", meaning: "An organised activity to plant trees for environmental protection" },
  { term: "Noise pollution", meaning: "Excess sound that can be harmful to people and the environment" },
  { term: "Air pollution", meaning: "Contamination of the air that can be harmful to health" },
  { term: "Guidance and counselling", meaning: "Support for addressing critical issues learners face" },
  { term: "Self-evaluation", meaning: "Assessing one's own improvement over a period of time" },
  { term: "Environmental conservation", meaning: "Protecting natural resources for the benefit of the future" },
  { term: "Case study", meaning: "A real example researched to learn from a community's experience" },
  { term: "Peace poem", meaning: "A creative work composed in a group to promote harmony" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices classmates seem stressed before exams and suggests a group activity from this lesson to help. What is the best suggestion?`,
    correct: "A communal Yoga session combining meditation and group exercise",
    wrong: [
      "A noise-making competition among classmates",
      "An activity that discourages any group participation",
      "Leaving classmates alone with no shared support at all",
    ],
    explanation: "This lesson specifically links communal Yoga sessions, combining meditation and exercise, to reducing stress and supporting wellness.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to help a classmate who keeps littering near the school compound understand the impact of their actions. Which communal aspect of Yoga does addressing this connect to?`,
    correct: "Environmental protection",
    wrong: ["Enhanced wellness", "Harmonious living", "None of the three communal aspects"],
    explanation: "Addressing litter and pollution near the school compound connects directly to environmental protection, one of the three communal aspects covered in this lesson.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} organises classmates to compose and recite a poem about peace together. Which communal aspect does this activity best support?`,
    correct: "Harmonious living",
    wrong: ["Enhanced wellness", "Environmental protection", "None of the three communal aspects"],
    explanation: "Composing and reciting peace poems in groups is specifically linked in this lesson to building harmonious relationships.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to plant trees in the school compound but is unsure what to do first. Based on the correct order of a tree-planting drive, what should come first?`,
      correct: "Researching the environmental need and choosing suitable tree species",
      wrong: [
        "Planting the trees immediately without any research or preparation",
        "Monitoring the trees' growth before any tree has been planted",
        "Watering an area of ground where no seedlings have been placed",
      ],
      explanation: "A tree-planting drive begins with research and choosing suitable species, before gathering materials, preparing the site, planting, watering, and monitoring growth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that communal Yoga, harmonious living activities, and environmental protection activities are really all the exact same activity with different names. Evaluate this claim.`,
    correct: "Flawed — each communal aspect targets a distinct goal: wellness through Yoga, harmony through peaceful group activities, and protection through caring for the environment",
    wrong: [
      "Sound — all three communal aspects describe one identical activity",
      "Sound — environmental protection and harmonious living cannot be distinguished at all",
      "Flawed — but only because this lesson actually covers just one single communal aspect",
    ],
    explanation: "The three communal aspects — enhanced wellness, harmonious living, and environmental protection — are distinct, even though all three fall under the broader theme of the communal aspect of Yoga.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} helps a classmate with special needs safely join a group game during break time. Which communal aspect does this action best reflect?`,
    correct: "Harmonious living",
    wrong: ["Enhanced wellness", "Environmental protection", "None of the three communal aspects"],
    explanation: "Assisting classmates with special needs to safely participate in group activities is specifically linked in this lesson to building an inclusive, harmonious community.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how the different aspects of Yoga are beneficial to society, per this lesson's key inquiry question. What is the best answer?`,
      correct: "They support wellness, build harmonious relationships, and encourage protecting the shared environment",
      wrong: [
        "Yoga's communal aspects have no meaningful benefit to wider society",
        "Only enhanced wellness benefits society; the other two aspects do not",
        "Communal Yoga benefits only the individual practising it, never the wider community",
      ],
      explanation: "This lesson's key inquiry question is answered by seeing that the communal aspects of Yoga — wellness, harmony, and environmental protection — each benefit the wider community, not just the individual.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says a school poster campaign about conserving the environment has no real value unless it stops all pollution immediately. Is this a fair standard?`,
    correct: "No — raising awareness through posters is a meaningful contribution to environmental protection, even if it does not eliminate pollution instantly",
    wrong: [
      "Yes — any activity that fails to end pollution immediately has no value at all",
      "Yes — posters have no connection to environmental protection in this lesson",
      "No — but only because poster campaigns are actually classified as a wellness activity",
    ],
    explanation: "This lesson lists making posters about conserving the environment as a genuine way to raise awareness — its value does not depend on eliminating pollution instantly.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps a record over several weeks of how calmer and more focused they feel after joining communal Yoga sessions. What is this practice an example of?`,
    correct: "Self-evaluation of improvements observed over a specific period",
    wrong: [
      "Environmental protection through record-keeping",
      "A tree-planting drive documented in written form",
      "A poem composed to promote harmonious living",
    ],
    explanation: "This lesson specifically names assessing improvements observed in oneself over a period of time as self-evaluation, which is exactly what this record-keeping practice describes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that working with a guidance and counselling teacher has nothing to do with the communal aspects of Yoga covered in this lesson. Is this accurate?`,
    correct: "No — this lesson specifically links working with a guidance and counselling teacher to addressing critical issues learners face, supporting harmonious living",
    wrong: [
      "Yes — guidance and counselling is entirely unrelated to any communal aspect in this lesson",
      "Yes — guidance and counselling only relates to environmental protection, not harmony",
      "No — but only because guidance and counselling relates to enhanced wellness, not harmony",
    ],
    explanation: "This lesson explicitly connects working with a guidance and counselling teacher to addressing critical issues and supporting harmonious living, one of the three communal aspects.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know how Yoga and meditation influence one's life, per this lesson's key inquiry question. What is the best answer?`,
    correct: "They support wellness, self-evaluation, and a calmer, more harmonious approach to daily life",
    wrong: [
      "Yoga and meditation have no influence on daily life once a session ends",
      "Only physical fitness is influenced; mental wellbeing is unaffected",
      "Yoga and meditation influence only professional practitioners, not learners",
    ],
    explanation: "This lesson connects Yoga and meditation to lasting effects on wellness, self-evaluation, and harmonious living — an influence that extends beyond a single session.",
  }),
];

export const communalAspectOfYoga: Skill = {
  id: "g6-hre-yo-communal-aspect",
  code: "YO.2",
  subjectId: "hre",
  strandId: "g6-hre-yo",
  grade: 6,
  title: "Communal Aspect of Yoga",
  description: "The three communal aspects of Yoga — enhanced wellness, harmonious living, and environmental protection — and how communal Yoga, peer support, and environmental action bring them to life.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, TREE_PLANTING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the first step to the last.",
        items,
        correctOrder: TREE_PLANTING_STEPS.map((t) => t.id),
        hint: "A tree-planting drive starts with research and gathering materials, then site preparation, planting, watering, and ongoing care.",
        explanation: TREE_PLANTING_STEPS.map((t) => t.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const aspects: CommunalFact["aspect"][] = ["wellness", "harmony", "environment"];
      const chosen = shuffle(rng, aspects.flatMap((a) => shuffle(rng, COMMUNAL_FACTS.filter((f) => f.aspect === a)).slice(0, 2)));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.aspect));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: aspects.map((a) => ({ id: a, label: ASPECT_LABEL[a] })),
        correctBucket,
        hint: "Think about whether each fact is about wellness, harmony, or environmental protection.",
        explanation: chosen.map((f) => `"${f.text}" — ${ASPECT_LABEL[f.aspect]}.`).join(" "),
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
        hint: "Think about which communal aspect each term is connected to.",
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
        hint: "Think about whether the scenario relates to wellness, harmony, or environmental protection.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Communal Yoga sessions combine meditation and group", after: "for shared wellness.", answer: "exercise", accepted: ["exercise"] },
      { before: "Regular group meditation supports", after: "of personal improvement over time.", answer: "self-evaluation", accepted: ["self-evaluation", "self evaluation"] },
      { before: "Composing and reciting songs or poems on", after: "helps build harmonious relationships.", answer: "peace", accepted: ["peace"] },
      { before: "A guidance and counselling teacher helps address critical", after: "learners face.", answer: "issues", accepted: ["issues"] },
      { before: "Assisting classmates with special needs builds an inclusive,", after: "community.", answer: "harmonious", accepted: ["harmonious"] },
      { before: "Participating in a cleaning campaign keeps the school compound free of", after: ".", answer: "pollution", accepted: ["pollution"] },
      { before: "Organising a tree-planting drive helps protect the environment for future", after: ".", answer: "generations", accepted: ["generations"] },
      { before: "Making posters about conserving the environment raises", after: "in the community.", answer: "awareness", accepted: ["awareness"] },
      { before: "Sensitising the community about noise and", after: "pollution protects shared environments.", answer: "air", accepted: ["air"] },
      { before: "A tree-planting drive begins with researching the environmental need and choosing suitable tree", after: ".", answer: "species", accepted: ["species"] },
      { before: "The three communal aspects of Yoga are enhanced wellness, harmonious living, and environmental", after: ".", answer: "protection", accepted: ["protection"] },
      { before: "Practising Yoga together as a community can help reduce", after: "and improve focus.", answer: "stress", accepted: ["stress"] },
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
      hint: "Recall whether the fact is about wellness, harmony, or environmental protection.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
