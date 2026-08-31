import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists for this sub-strand, so the ordering branch uses a
// curriculum-reasonable real-world sequence: steps for curbing corruption in daily life.
const ORDER_PROMPTS = [
  "Arrange these steps for curbing corruption in a sensible order.",
  "Put these steps for promoting honesty into a sensible order.",
  "Sequence these steps for curbing corruption, from first to last.",
  "Order these steps for building a corruption-free environment.",
  "Sort these steps for curbing corruption into a sensible order.",
  "Arrange these anti-corruption steps in a sensible order.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of corruption it describes.",
  "Group each statement under the aspect it describes.",
  "Decide which aspect each statement describes, and sort it there.",
  "Sort each fact into the aspect of corruption it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect.",
];

const MATCH_PROMPTS = [
  "Match each form of corruption to its description.",
  "Pair each form with the description that fits it.",
  "Connect each form below to what it means.",
  "Match each form of corruption to its correct description.",
  "Link each form of corruption to the description that fits it.",
  "Choose the correct description for each form of corruption.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const CURBING_STEPS = [
  { id: "notice", label: "Notice small, everyday dishonesty, not just large-scale corruption" },
  { id: "practise-honesty", label: "Practise honesty consistently in small daily dealings" },
  { id: "speak-up", label: "Speak up against dishonest practices when encountered" },
  { id: "model-integrity", label: "Model and encourage integrity for others to see" },
  { id: "internal-check", label: "Rely on taqwa (God-consciousness) as an inner check, even when unobserved" },
];

const CORRUPTION_FORMS = [
  { name: "Exam cheating", meaning: "Dishonestly copying answers or using unauthorised help during a test" },
  { name: "Inflating bus fare", meaning: "Dishonestly charging a passenger more than the correct fare" },
  { name: "Withholding shopping balance", meaning: "Dishonestly keeping change owed to a customer" },
  { name: "Election dishonesty", meaning: "Unfair or dishonest practices during an election process" },
  { name: "Deceiving parents about levies", meaning: "Lying to parents about the amount owed for school fees or levies to keep the difference" },
];

interface TopicFact {
  text: string;
  topic: "forms" | "effects" | "curbing";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  forms: "Everyday forms of corruption",
  effects: "Effects of corruption",
  curbing: "Ways of curbing corruption",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Exam cheating is an everyday form of corruption relevant to a learner's own environment", topic: "forms" },
  { text: "Inflating bus fare dishonestly is a named form of corruption", topic: "forms" },
  { text: "Withholding shopping change owed to a customer is a named form of corruption", topic: "forms" },
  { text: "Deceiving parents about school levies to keep the difference is a named form of corruption", topic: "forms" },
  { text: "Corruption causes unfairness and loss of trust between people", topic: "effects" },
  { text: "Corruption harms those who are cheated, especially the vulnerable", topic: "effects" },
  { text: "Corruption erodes honesty and good values in a community", topic: "effects" },
  { text: "Corruption creates unequal opportunities, undermining those who work honestly", topic: "effects" },
  { text: "Honesty in small, everyday dealings helps curb corruption, not just addressing 'big' cases", topic: "curbing" },
  { text: "Speaking up against dishonest practices is a way to curb corruption", topic: "curbing" },
  { text: "Practising and modelling integrity helps build a corruption-free community", topic: "curbing" },
  { text: "Taqwa (God-consciousness) acts as an internal check on behaviour even when no one is watching", topic: "curbing" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, is given more shopping change than they are owed by a shopkeeper who did not notice the mistake. What should ${who} do, applying Islamic teaching against corruption?`,
      correct: "Return the extra change, since keeping it dishonestly would be a form of corruption even though it seems small",
      wrong: [
        "Keep the extra change, since it was the shopkeeper's mistake, not the learner's",
        "Keep the extra change only if the amount is very small",
        "Ask a friend whether keeping it is acceptable before deciding",
      ],
      explanation: "Withholding money that is not rightfully yours — even change given by mistake — is exactly the kind of everyday dishonesty this sub-strand warns against.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is offered the answers to an exam by a classmate before the test begins. Applying Islamic teaching against corruption, what should ${who} do?`,
      correct: "Refuse the answers and rely on their own honest preparation and effort",
      wrong: [
        "Accept the answers, since exam cheating is not considered a real form of corruption",
        "Accept the answers only if the classmate offers them for free",
        "Accept the answers but avoid telling anyone else about it",
      ],
      explanation: "Exam cheating is explicitly named as a form of corruption relevant to a learner's environment — refusing it and relying on honest effort is the correct response.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} tells their parents that school levies cost more than they actually do, planning to keep the extra money. What effect of corruption does this most directly illustrate?`,
    correct: "Loss of trust between people, since deceiving parents damages the honesty of that relationship",
    wrong: [
      "Improved family finances, since keeping extra money always benefits everyone",
      "No real effect, since this is too minor to count as corruption",
      "Increased respect from parents, since resourcefulness is always admired",
    ],
    explanation: "Deceiving parents about levies to keep the difference is a named form of corruption that directly damages trust — exactly the kind of harm corruption causes.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} witnesses a matatu conductor charging an elderly passenger more than the correct fare. What form of corruption does this illustrate, and how should a bystander respond, applying Islamic teaching?`,
      correct: "This is inflating bus fare, a named form of corruption; a bystander should not stay silently complicit and should support fair treatment where appropriate",
      wrong: [
        "This is not a form of corruption at all, since transport fares are always negotiable",
        "This is acceptable since only large-scale corruption matters religiously",
        "This is the elderly passenger's own responsibility to avoid, with no wider concern",
      ],
      explanation: "Inflating bus fare is explicitly named as a form of corruption in this sub-strand, and Islamic teaching calls for honesty and fairness, not silent acceptance of such practices.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that corruption is only a concern for government officials and has nothing to do with an ordinary Grade 6 learner's daily life. Evaluate this reasoning.`,
    correct: "Flawed — the sub-strand names everyday forms of corruption directly relevant to a learner, such as exam cheating and shortchanging",
    wrong: [
      "Sound — only large-scale government corruption is ever discussed in Islamic teaching",
      "Sound — ordinary learners are entirely unaffected by dishonesty in daily life",
      "Flawed — but only because learners are actually the main cause of government corruption",
    ],
    explanation: "This sub-strand specifically names everyday forms of corruption relevant to a learner's own environment, showing corruption is not limited to government-level issues.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Islam links avoiding corruption to taqwa (God-consciousness) rather than only to fear of being caught. What is the best explanation?`,
      correct: "Because taqwa provides an inner check on behaviour even when no one else is watching, unlike fear of punishment which only works when detection is likely",
      wrong: [
        "Because taqwa has no real connection to honesty or corruption",
        "Because fear of being caught is always a stronger motivator than taqwa",
        "Because taqwa applies only to religious leaders, not ordinary Muslims",
      ],
      explanation: "Taqwa is an inner awareness of Allah that shapes honest behaviour regardless of whether anyone is watching — a deeper foundation than relying solely on fear of being caught.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says speaking up against a dishonest practice they witness is pointless since it will not change anything. Is this the correct attitude, applying this sub-strand's teaching?`,
    correct: "No — speaking up against dishonest practices is named as one of the ways of curbing corruption, even if change does not happen immediately",
    wrong: [
      "Yes — silence is always the wisest response to witnessed dishonesty",
      "Yes — speaking up is discouraged in Islamic teaching on corruption",
      "No — but only reporting to authorities counts, never speaking up personally",
    ],
    explanation: "The sub-strand names speaking up against dishonest practices as a genuine way of curbing corruption, regardless of whether immediate change results.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that corruption only harms the person who is cheated, with no wider effect on society. Evaluate this claim.`,
    correct: "Flawed — corruption also erodes honesty and good values across a community and creates unequal opportunities for everyone",
    wrong: [
      "Sound — corruption's effects are always limited to a single individual",
      "Sound — society as a whole is never affected by individual dishonesty",
      "Flawed — but only because corruption benefits everyone except the direct victim",
    ],
    explanation: "Corruption's effects extend beyond the individual directly cheated — it erodes community trust and values and creates unequal opportunities more broadly.",
  }),
];

export const corruption: Skill = {
  id: "g6-ire-mu-corruption",
  code: "MU.3",
  subjectId: "ire",
  strandId: "g6-ire-muamalat",
  grade: 6,
  title: "Corruption",
  description: "Everyday forms of corruption relevant to a learner's environment (exam cheating, inflating fares, withholding change, deceiving parents about levies), its effects, and ways of curbing it.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, CURBING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in a sensible order for curbing corruption.",
        items,
        correctOrder: CURBING_STEPS.map((s) => s.id),
        hint: "Curbing corruption starts with noticing everyday dishonesty and builds toward relying on taqwa as an inner check.",
        explanation: CURBING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const forms = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "forms")).slice(0, 3);
      const effects = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "effects")).slice(0, 3);
      const curbing = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "curbing")).slice(0, 3);
      const chosen = shuffle(rng, [...forms, ...effects, ...curbing]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["forms", "effects", "curbing"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about everyday forms of corruption, some about its effects, and some about curbing it.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CORRUPTION_FORMS);
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
        hint: "Think about what each named form of corruption actually involves.",
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
        hint: "Think about which named form of corruption the situation involves, and what a genuinely honest response looks like.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Exam", after: "is a named everyday form of corruption.", answer: "cheating", accepted: ["cheating"] },
      { before: "Dishonestly charging a passenger more than the correct fare is called", after: ".", answer: "inflating bus fare", accepted: ["inflating bus fare", "inflating fare"] },
      { before: "Corruption causes unfairness and loss of", after: "between people.", answer: "trust", accepted: ["trust"] },
      { before: "Corruption erodes honesty and good", after: "in a community.", answer: "values", accepted: ["values"] },
      { before: "Corruption creates unequal", after: ", undermining those who work honestly.", answer: "opportunities", accepted: ["opportunities"] },
      { before: "Islam links avoiding corruption to", after: "— inner accountability to Allah.", answer: "taqwa", accepted: ["taqwa"] },
      { before: "Speaking up against dishonest practices is a way to", after: "corruption.", answer: "curb", accepted: ["curb"] },
      { before: "Practising honesty in small, everyday", after: "helps curb corruption.", answer: "dealings", accepted: ["dealings"] },
      { before: "Withholding shopping", after: "owed to a customer is a named form of corruption.", answer: "balance", accepted: ["balance", "change"] },
      { before: "Deceiving parents about school", after: "is a named form of corruption.", answer: "levies", accepted: ["levies"] },
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
      hint: "Recall the everyday forms of corruption named in this sub-strand, its effects, and ways of curbing it.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
