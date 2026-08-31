import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The curriculum design's own process for practising adalah in a real dispute — hear both sides,
// set bias aside, judge by fact, apply one standard, then explain the decision — is the natural
// sequence used here, not an invented order.
const ORDER_PROMPTS = [
  "Arrange these steps for settling a dispute justly, in the correct order.",
  "Put these steps of practising adalah into the order they should happen.",
  "Sequence these steps for judging a situation fairly, from first to last.",
  "Order these steps for resolving a disagreement the way adalah requires.",
  "Sort these steps of practising fairness into the order they occur.",
  "Arrange these steps for reaching a just decision in the order they happen.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by what it says about adalah (justice).",
  "Group each statement under what it describes about adalah.",
  "Decide what each statement is about, and sort it there.",
  "Sort each fact into the idea about adalah it belongs to.",
  "Place each statement under the aspect of justice it describes.",
  "Read each statement and sort it under the matching idea about adalah.",
];

const MATCH_PROMPTS = [
  "Match each term about adalah to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about justice in Islam.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const JUSTICE_SEQUENCE = [
  { id: "listen", label: "Listen carefully to both sides of the disagreement before forming an opinion" },
  { id: "set-aside-bias", label: "Set aside personal bias or closeness to either person involved" },
  { id: "judge-facts", label: "Judge the situation based on the facts, not on who is involved" },
  { id: "apply-same-standard", label: "Apply the same standard fairly to both sides, even a close friend or relative" },
  { id: "explain-decision", label: "Reach and explain a decision that matches the facts of what happened" },
];

interface TopicFact {
  text: string;
  topic: "meaning" | "school-examples" | "benefits";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  meaning: "What adalah means",
  "school-examples": "Adalah in everyday school life",
  benefits: "Benefits of observing adalah",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Adalah means justice or fairness, a core value emphasised in Islam", topic: "meaning" },
  { text: "The Qur'an calls on believers to stand firmly for justice even when it is inconvenient to do so", topic: "meaning" },
  { text: "A Muslim is called to be just even toward their own parents or close relatives, not only toward strangers", topic: "meaning" },
  { text: "Justice in Islam must not be bent to favour people simply because they are close to you", topic: "meaning" },
  { text: "Settling a dispute between two classmates by listening to both sides fairly is an example of adalah", topic: "school-examples" },
  { text: "Treating all classmates or siblings equally, without favouritism, reflects adalah", topic: "school-examples" },
  { text: "Judging a situation based on facts rather than personal bias toward a friend reflects adalah", topic: "school-examples" },
  { text: "Making sure a punishment or consequence matches the wrongdoing, rather than being too harsh or too lenient, reflects adalah", topic: "school-examples" },
  { text: "Observing adalah builds trust and cooperation between members of a community", topic: "benefits" },
  { text: "A just society reduces conflict, since people feel they are being treated fairly", topic: "benefits" },
  { text: "Practising fairness in small daily situations builds the habit of justice for bigger responsibilities later in life", topic: "benefits" },
  { text: "Upholding adalah is described as a way of earning Allah's reward, showing it is a spiritual as well as social value", topic: "benefits" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Adalah", meaning: "Justice or fairness — a core Islamic value that applies consistently to everyone" },
  { term: "Impartiality", meaning: "Judging a situation without bias toward people who are close to you" },
  { term: "Favouritism (avoiding it)", meaning: "Not giving an unfair advantage to a friend, sibling, or relative in a decision" },
  { term: "Dispute resolution", meaning: "Settling a disagreement fairly by hearing all sides before deciding" },
  { term: "Bias", meaning: "Unfairly favouring one side because of personal feelings, something adalah requires setting aside" },
  { term: "Consistency (in justice)", meaning: "Applying the same standard to everyone, regardless of who they are" },
  { term: "Evidence-based judgement", meaning: "Deciding a matter according to the facts of what actually happened" },
  { term: "Fair consequence", meaning: "A punishment or outcome that matches the seriousness of the wrongdoing, not too harsh or too lenient" },
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
      prompt: `${who}, a class monitor in ${place(rng)}, must report who broke a window during break time — but one of the two suspects is ${who}'s close friend. Applying adalah, what should ${who} do?`,
      correct: "Report what actually happened based on the facts, even though it involves a close friend",
      wrong: [
        "Protect the close friend and blame the other suspect instead",
        "Refuse to report anything at all, to avoid choosing between the two",
        "Report the friend only if a teacher directly demands an answer",
      ],
      explanation: "The Qur'an's call to justice includes being just even toward people close to you — adalah is not set aside because a friend is involved.",
    };
  },
  (rng) => ({
    prompt: `Two siblings in ${place(rng)} argue over a shared toy. Their parent gives in to the older sibling every time simply because they are older. Applying adalah, what is the problem with this pattern?`,
    correct: "It shows favouritism instead of judging each disagreement based on the facts of who is actually in the right",
    wrong: [
      "There is no problem, since older siblings should always be favoured in a dispute",
      "The problem is only that the toy should have been thrown away",
      "The problem is that the parent should stay out of children's disputes entirely",
    ],
    explanation: "Adalah requires judging by the facts of each situation, not by a fixed rule that always favours one person regardless of what happened.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `During group work in ${place(rng)}, ${who} notices the teacher always assigns the best group roles to their favourite students. What does adalah teach about this kind of decision-making?`,
      correct: "Decisions should be made consistently and fairly for everyone, not based on who the teacher personally favours",
      wrong: [
        "It is acceptable, since teachers are allowed to reward their favourite students",
        "It is only a problem if the favoured students perform badly",
        "Adalah applies only to religious matters, not to classroom decisions",
      ],
      explanation: "Adalah calls for consistency and fairness in everyday decisions, including how a teacher assigns roles — not favouritism toward particular students.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to settle an argument between two friends but only hears one side before deciding who is at fault. What is the flaw in this approach?`,
    correct: "A fair decision requires listening to both sides of the disagreement, not deciding after hearing from only one person",
    wrong: [
      "There is no flaw, since the first person to speak is usually correct",
      "The flaw is that the argument should have been ignored completely",
      "The flaw is only that the decision was made too quickly, not that one side was unheard",
    ],
    explanation: "Practising adalah in a dispute starts with hearing all sides — deciding after only one account risks an unfair, biased judgement.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A football team in ${place(rng)} is picking players for a match, and the captain, ${who}, is tempted to pick a weaker player simply because they are a close friend. Applying adalah, what should ${who} do?`,
      correct: "Select players based on fair, relevant criteria such as skill and effort, not personal closeness",
      wrong: [
        "Pick the friend anyway, since loyalty to friends matters more than fairness",
        "Cancel the match entirely to avoid making the selection",
        "Pick the friend, but only if no one else notices the decision",
      ],
      explanation: "Adalah requires that decisions be made on relevant, fair grounds rather than favouring someone simply because of a personal relationship.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that adalah only matters in big, formal matters like courts, and has nothing to do with everyday school situations. Evaluate this reasoning.`,
    correct: "Flawed — practising fairness in small daily situations, like school disputes or sharing, builds the habit of justice for bigger responsibilities later",
    wrong: [
      "Sound — adalah is only relevant to formal legal settings",
      "Sound — school-age children are not expected to practise adalah at all",
      "Flawed — but only because school situations are actually more important than formal courts",
    ],
    explanation: "The curriculum links adalah directly to everyday situations like school disputes — practising fairness there builds the habit for larger responsibilities.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A market trader in ${place(rng)} is caught giving customers less than the correct weight of goods. A committee decides on a consequence. Applying adalah, which response best fits a just consequence?`,
      correct: "A consequence that reasonably matches the seriousness of the trader's dishonesty, neither excessively harsh nor too lenient",
      wrong: [
        "No consequence at all, since the amount involved was small",
        "The harshest possible punishment available, regardless of the seriousness of the offence",
        "A consequence decided by how well-liked the trader is in the community",
      ],
      explanation: "Adalah calls for a punishment or consequence that matches the wrongdoing — not one decided by popularity or applied without regard to proportion.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that if a decision benefits people they personally like, it must be the fair decision. What is wrong with this thinking?`,
    correct: "Fairness is judged by facts and consistent standards, not by whether the outcome favours people one personally likes",
    wrong: [
      "Nothing is wrong — a decision that benefits people you like is automatically the fair one",
      "The thinking is wrong only when strangers are involved, not friends",
      "The thinking is wrong because personal preference should decide fairness instead of facts",
    ],
    explanation: "Adalah requires judging by facts and applying one standard to everyone — an outcome is not fair merely because it favours people one likes.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is chosen to lead a class election in ${place(rng)} and is told privately by a friend to help them win unfairly. Applying adalah, how should ${who} respond?`,
      correct: "Refuse, and ensure the election is conducted fairly for every candidate regardless of friendship",
      wrong: [
        "Agree quietly, since helping a friend win is more important than fairness",
        "Agree only if the friend promises to return the favour later",
        "Cancel the election instead of dealing with the request",
      ],
      explanation: "Adalah must not be bent to favour someone close to you — a fair election process should apply the same standard to every candidate.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} shares out chores among siblings but always gives the easiest tasks to the youngest sibling regardless of ability. A classmate asks whether this is adalah. What is the best answer?`,
    correct: "It could still be just if the division reasonably fits each sibling's actual ability, but not if it is based purely on favouritism toward the youngest",
    wrong: [
      "Yes, always — the youngest sibling should always receive the easiest tasks in every family",
      "No, never — chores must always be divided completely equally with no consideration of ability",
      "Adalah does not apply to sharing chores at home, only to school and public matters",
    ],
    explanation: "What makes a division just is whether it is based on fair, relevant reasoning (such as ability), not an automatic rule that always favours one person.",
  }),
];

export const adalah: Skill = {
  id: "g6-ire-ak-adalah",
  code: "AK.2",
  subjectId: "ire",
  strandId: "g6-ire-akhlaq",
  grade: 6,
  title: "Adalah (Justice)",
  description: "The meaning and importance of adalah (justice/fairness) in Islam, and how a Muslim can practise it in everyday situations such as school disputes.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, JUSTICE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from hearing both sides to explaining the decision.",
        items,
        correctOrder: JUSTICE_SEQUENCE.map((s) => s.id),
        hint: "It begins with listening to both sides and ends with explaining a fact-based decision.",
        explanation: JUSTICE_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const school = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "school-examples")).slice(0, 3);
      const benefits = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "benefits")).slice(0, 3);
      const chosen = shuffle(rng, [...meaning, ...school, ...benefits]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["meaning", "school-examples", "benefits"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements explain what adalah means, some are school examples of it, and some are its benefits.",
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
        hint: "Think about what each term refers to in Islam's teaching on justice.",
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
        hint: "Think about whether the decision is based on facts and applied consistently, or bent by favouritism.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Adalah means", after: "or fairness, a core value emphasised in Islam.", answer: "justice", accepted: ["justice"] },
      { before: "The Qur'an calls on believers to stand firmly for justice even when it is", after: ".", answer: "inconvenient", accepted: ["inconvenient"] },
      { before: "A Muslim is called to be just even toward their own", after: "or close relatives, not only strangers.", answer: "parents", accepted: ["parents"] },
      { before: "Justice in Islam must not be bent to", after: "people close to you.", answer: "favour", accepted: ["favour", "favor"] },
      { before: "Settling a dispute between two classmates by listening to both sides fairly is an example of", after: ".", answer: "adalah", accepted: ["adalah", "justice"] },
      { before: "Treating all classmates or siblings equally, without", after: ", reflects adalah.", answer: "favouritism", accepted: ["favouritism", "favoritism"] },
      { before: "Judging a situation based on", after: "rather than personal bias reflects adalah.", answer: "facts", accepted: ["facts"] },
      { before: "A fair consequence should", after: "the seriousness of the wrongdoing.", answer: "match", accepted: ["match"] },
      { before: "Observing adalah builds", after: "and cooperation between members of a community.", answer: "trust", accepted: ["trust"] },
      { before: "Practising fairness in small daily situations builds the", after: "of justice for bigger responsibilities later.", answer: "habit", accepted: ["habit"] },
      { before: "Upholding adalah is described as a way of earning Allah's", after: ".", answer: "reward", accepted: ["reward"] },
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
      hint: "Recall what adalah means and how it should be practised, even toward people close to you.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
