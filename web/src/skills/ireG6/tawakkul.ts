import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists for this sub-strand, so the ordering branch uses a
// curriculum-reasonable real-world sequence: the two-step balance tawakkul actually describes
// (genuine effort, then trust in the outcome), followed by the calm response that results.
const ORDER_PROMPTS = [
  "Arrange these steps of tawakkul in the order they should happen.",
  "Put these steps of practising tawakkul into the correct order.",
  "Sequence these steps of tawakkul, from first to last.",
  "Order these steps for how tawakkul should be practised.",
  "Sort these steps of tawakkul into the order they occur.",
  "Arrange these steps of relying on Allah in the order they should be taken.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of tawakkul it describes.",
  "Group each statement under the aspect of tawakkul it describes.",
  "Decide which aspect of tawakkul each statement describes, and sort it there.",
  "Sort each fact into the aspect of tawakkul it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of tawakkul.",
];

const MATCH_PROMPTS = [
  "Match each quality of a mutawakkil to what it means.",
  "Pair each quality with the meaning that fits it.",
  "Connect each quality below to what it means.",
  "Match each quality to its correct meaning.",
  "Link each quality to the description that fits it.",
  "Choose the correct meaning for each quality of a mutawakkil.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const TAWAKKUL_STEPS = [
  { id: "identify-goal", label: "Identify a genuine goal or need, such as passing an exam or recovering from illness" },
  { id: "take-means", label: "Take real, sincere effort and practical action toward it — studying, seeking treatment, and so on" },
  { id: "entrust-outcome", label: "After doing the work, entrust the final outcome to Allah (S.W.T.)" },
  { id: "stay-calm", label: "Remain calm and accepting, rather than anxious, about whatever result Allah decides" },
];

interface TopicFact {
  text: string;
  topic: "meaning" | "balance" | "significance";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  meaning: "What tawakkul means",
  balance: "Balancing effort and trust",
  significance: "Why tawakkul matters",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Tawakkul means reliance or trust in Allah (S.W.T.)", topic: "meaning" },
  { text: "A person with tawakkul is called a mutawakkil", topic: "meaning" },
  { text: "Tawakkul is not the same as giving up or being passive", topic: "meaning" },
  { text: "A mutawakkil takes real, practical action toward a goal before relying on Allah for the outcome", topic: "balance" },
  { text: "Tawakkul does not mean skipping effort and expecting results anyway", topic: "balance" },
  { text: "A student practising tawakkul still studies hard, then trusts Allah with the exam result", topic: "balance" },
  { text: "Someone who is sick and practises tawakkul still seeks treatment, then trusts Allah with the outcome", topic: "balance" },
  { text: "Tawakkul is described as a condition for success in this life and the Hereafter", topic: "significance" },
  { text: "Trusting Allah brings inner calm, especially in situations outside a person's control", topic: "significance" },
  { text: "Allah is described as sufficient for those who rely on Him", topic: "significance" },
  { text: "A mutawakkil is described as loved and supported by Allah", topic: "significance" },
  { text: "Allah provides for those who rely on Him, sometimes from sources they do not expect", topic: "significance" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Tawakkul", meaning: "Reliance or trust in Allah (S.W.T.), after genuine effort has been made" },
  { term: "Mutawakkil", meaning: "A person who shows tawakkul — trust in Allah after doing their part" },
  { term: "Taking the means", meaning: "The practical effort a mutawakkil makes before relying on Allah for the result" },
  { term: "Inner calm", meaning: "The peace a mutawakkil feels about situations outside their control" },
  { term: "Passivity", meaning: "Giving up effort entirely — something tawakkul is NOT, despite the misconception" },
  { term: "Sufficiency of Allah", meaning: "The idea that Allah is enough for those who truly rely on Him" },
  { term: "Unexpected provision", meaning: "Support Allah gives to a mutawakkil from sources they did not expect" },
  { term: "Success in the Hereafter", meaning: "What tawakkul is described as a condition for, alongside success in this life" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, has a major exam coming up but decides not to study at all, saying "I will just rely on Allah." Is this a correct application of tawakkul?`,
      correct: "No — true tawakkul means studying hard first, then trusting Allah with the result, not skipping effort altogether",
      wrong: [
        "Yes — tawakkul means avoiding effort entirely and expecting a good result",
        "Yes — studying actually shows a lack of trust in Allah",
        "No — tawakkul actually means effort matters but the outcome does not",
      ],
      explanation: "Tawakkul balances genuine effort with trust in the outcome — skipping preparation and calling it 'trust in Allah' misunderstands the concept.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} falls ill and, after taking prescribed medicine and resting as advised, remains anxious and constantly fearful about the outcome. Applying tawakkul, what would be a better mindset?`,
      correct: "Having taken the appropriate steps, calmly trust Allah with the outcome rather than remaining anxious",
      wrong: [
        "Refuse treatment entirely, since tawakkul means relying on Allah alone with no medicine",
        "Continue being anxious, since tawakkul has nothing to do with a person's emotional state",
        "Seek unlimited additional treatments beyond what is advised, since more effort always guarantees peace of mind",
      ],
      explanation: "Tawakkul is completed by trusting Allah's decision after appropriate action has been taken — remaining calm, not anxious, once the effort has genuinely been made.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says relying on Allah means a farmer should not bother planting seeds, since the harvest is up to Allah anyway. Evaluate this reasoning.`,
    correct: "Flawed — tawakkul requires taking the practical means (planting) first, then trusting Allah with the harvest's outcome",
    wrong: [
      "Sound — planting seeds actually shows distrust in Allah",
      "Sound — a true mutawakkil avoids all practical effort",
      "Flawed — tawakkul actually forbids farming altogether",
    ],
    explanation: "A mutawakkil takes real practical action — like planting — and then relies on Allah for the outcome, rather than skipping the action itself.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} works hard preparing a class presentation but still feels calm rather than anxious the night before, trusting the outcome to Allah after doing their best. What quality does this best reflect?`,
      correct: "Tawakkul — genuine effort followed by calm trust in Allah's decision about the outcome",
      wrong: [
        "Carelessness, since feeling calm before an important task means insufficient preparation",
        "Overconfidence, since tawakkul discourages any sense of calm before an outcome",
        "Laziness, since only anxious learners are considered to have worked hard",
      ],
      explanation: "Feeling calm after genuine, sincere preparation — rather than anxious — is exactly the inner peace tawakkul is meant to bring.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why tawakkul is described as bringing a mutawakkil's needs from sources they do not expect. What is the best explanation of this idea?`,
    correct: "It illustrates that Allah's support for those who truly rely on Him is not limited to the obvious or expected paths a person plans for",
    wrong: [
      "It means a mutawakkil should stop planning entirely and wait for random events",
      "It means only wealthy people can practise tawakkul successfully",
      "It has no real meaning and is simply a figure of speech with no lesson",
    ],
    explanation: "This idea highlights that Allah's provision for someone who genuinely relies on Him can come through unexpected means — encouraging trust rather than only relying on visible, predictable outcomes.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} trains diligently for weeks before a school sports competition, and afterward accepts the result calmly whether they win or lose. Which stage of tawakkul does the calm acceptance represent?`,
      correct: "Entrusting the outcome to Allah after genuine effort has already been made",
      wrong: [
        "Skipping the training itself, since accepting the result requires no preparation",
        "Doubting whether the effort was worthwhile in the first place",
        "Refusing to compete again in the future regardless of the outcome",
      ],
      explanation: "Calmly accepting the outcome after sincere, prepared effort is exactly the trust-in-outcome stage of tawakkul, following the earlier stage of genuine effort.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that a mutawakkil should feel devastated if an outcome does not go as hoped, since that shows they cared enough. Is this consistent with tawakkul?`,
    correct: "No — tawakkul is meant to bring calm acceptance of Allah's decision, not devastation, even when an outcome is disappointing",
    wrong: [
      "Yes — devastation is the expected, correct response for a true mutawakkil",
      "Yes — tawakkul requires strong negative emotion to prove sincerity",
      "No — tawakkul actually means feeling nothing at all about any outcome",
    ],
    explanation: "Tawakkul is meant to bring inner calm and acceptance of Allah's decision, even in disappointment — not devastation, and not complete emotional detachment either.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says tawakkul and taking practical action are opposites, and a truly religious person should only ever choose one or the other. Evaluate this claim.`,
    correct: "Flawed — tawakkul combines genuine practical effort with trust in Allah for the outcome; the two work together, not against each other",
    wrong: [
      "Sound — tawakkul requires abandoning all practical action completely",
      "Sound — practical action always shows a lack of faith",
      "Flawed — tawakkul actually forbids trusting Allah at all",
    ],
    explanation: "Tawakkul is precisely the combination of sincere effort and trust in the outcome — treating them as opposites misunderstands the balance the concept teaches.",
  }),
];

export const tawakkul: Skill = {
  id: "g6-ire-pi-tawakkul",
  code: "PI.4",
  subjectId: "ire",
  strandId: "g6-ire-iman",
  grade: 6,
  title: "Tawakkul (Reliance on Allah)",
  description: "Tawakkul (reliance on Allah): balancing genuine effort with trust in Allah for the outcome, the qualities of a mutawakkil, and why tawakkul brings inner calm and is a condition for success.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, TAWAKKUL_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from identifying the goal to staying calm about the outcome.",
        items,
        correctOrder: TAWAKKUL_STEPS.map((s) => s.id),
        hint: "Tawakkul starts with a genuine goal, moves through real effort, and ends with calm trust in the outcome.",
        explanation: TAWAKKUL_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const balance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "balance")).slice(0, 3);
      const significance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "significance")).slice(0, 3);
      const chosen = shuffle(rng, [...meaning, ...balance, ...significance]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["meaning", "balance", "significance"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about what tawakkul means, some about balancing effort and trust, and some about why it matters.",
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
        hint: "Think about what each term refers to in the meaning and practice of tawakkul.",
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
        hint: "Think about whether the situation balances genuine effort with trust in Allah, or gets one of the two wrong.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Tawakkul means reliance or trust in", after: ".", answer: "Allah", accepted: ["allah"] },
      { before: "A person who shows tawakkul is called a", after: ".", answer: "mutawakkil", accepted: ["mutawakkil"] },
      { before: "A mutawakkil takes real, practical action before relying on Allah for the", after: ".", answer: "outcome", accepted: ["outcome", "result"] },
      { before: "Tawakkul is not the same as giving up", after: "entirely.", answer: "effort", accepted: ["effort"] },
      { before: "Trusting Allah brings inner", after: ", especially in situations outside a person's control.", answer: "calm", accepted: ["calm"] },
      { before: "Allah is described as", after: "for those who rely on Him.", answer: "sufficient", accepted: ["sufficient"] },
      { before: "Allah provides for those who rely on Him, sometimes from sources they do not", after: ".", answer: "expect", accepted: ["expect"] },
      { before: "Tawakkul is described as a condition for success in this life and the", after: ".", answer: "Hereafter", accepted: ["hereafter"] },
      { before: "A student practising tawakkul still studies hard, then", after: "Allah with the exam result.", answer: "trusts", accepted: ["trusts", "trust"] },
      { before: "A mutawakkil is described as loved and", after: "by Allah.", answer: "supported", accepted: ["supported"] },
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
      hint: "Recall the meaning of tawakkul and the balance between effort and trust.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
