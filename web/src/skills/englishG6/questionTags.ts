import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, cap } from "./grammarSharedA";

type VerbType = "be" | "have" | "do" | "modal";

// 28 environment-conservation-themed statements with their correct question tags, per the source sub-strand.
// Rule: a positive statement takes a negative tag, and a negative statement takes a positive tag.
type Item = { subject: string; statement: (n: string) => string; tag: string; verbType: VerbType; positive: boolean };
const ITEMS: Item[] = [
  { subject: "the pupils", statement: () => `The pupils are planting trees`, tag: "aren't they", verbType: "be", positive: true },
  { subject: "she", statement: (n) => `${n} is recycling the plastic bottles`, tag: "isn't she", verbType: "be", positive: true },
  { subject: "the river", statement: () => `The river was polluted by the factory`, tag: "wasn't it", verbType: "be", positive: true },
  { subject: "the forests", statement: () => `The forests were not protected last year`, tag: "were they", verbType: "be", positive: false },
  { subject: "he", statement: (n) => `${n} is not conserving water at home`, tag: "is he", verbType: "be", positive: false },
  { subject: "the county", statement: () => `The county is not restoring the wetland`, tag: "is it", verbType: "be", positive: false },
  { subject: "the community", statement: () => `The community has cleaned up the gullies`, tag: "hasn't it", verbType: "have", positive: true },
  { subject: "they", statement: () => `They have planted a thousand seedlings`, tag: "haven't they", verbType: "have", positive: true },
  { subject: "the school", statement: () => `The school has not recycled the garbage`, tag: "has it", verbType: "have", positive: false },
  { subject: "she", statement: (n) => `${n} has not sorted the refuse properly`, tag: "has she", verbType: "have", positive: false },
  { subject: "the farmers", statement: () => `The farmers had reforested the hillside by June`, tag: "hadn't they", verbType: "have", positive: true },
  { subject: "he", statement: (n) => `${n} recycles the sewage water carefully`, tag: "doesn't he", verbType: "do", positive: true },
  { subject: "the factory", statement: () => `The factory dumps garbage into the river`, tag: "doesn't it", verbType: "do", positive: true },
  { subject: "they", statement: () => `They do not sustain the forest reserve well`, tag: "do they", verbType: "do", positive: false },
  { subject: "she", statement: (n) => `${n} does not preserve the wildlife sanctuary`, tag: "does she", verbType: "do", positive: false },
  { subject: "the pupils", statement: () => `The pupils collected garbage during the clean-up`, tag: "didn't they", verbType: "do", positive: true },
  { subject: "the warden", statement: () => `The warden did not safeguard the gullies`, tag: "did he", verbType: "do", positive: false },
  { subject: "he", statement: (n) => `${n} can restore the dry riverbank`, tag: "can't he", verbType: "modal", positive: true },
  { subject: "the pupils", statement: () => `The pupils will preserve the wetland`, tag: "won't they", verbType: "modal", positive: true },
  { subject: "the community", statement: () => `The community should conserve the drought-hit land`, tag: "shouldn't it", verbType: "modal", positive: true },
  { subject: "the workers", statement: () => `The workers cannot sustain the reforestation project alone`, tag: "can they", verbType: "modal", positive: false },
  { subject: "she", statement: (n) => `${n} will not pollute the well again`, tag: "will she", verbType: "modal", positive: false },
  { subject: "the county", statement: () => `The county must safeguard the nature reserve`, tag: "mustn't it", verbType: "modal", positive: true },
  { subject: "they", statement: () => `They must not refuse to recycle their garbage`, tag: "must they", verbType: "modal", positive: false },
  { subject: "the sewage plant", statement: () => `The sewage plant is not sustaining safe water levels`, tag: "is it", verbType: "be", positive: false },
  { subject: "he", statement: (n) => `${n} was planting trees along the gully`, tag: "wasn't he", verbType: "be", positive: true },
  { subject: "the reserve", statement: () => `The reserve has restored its wildlife population`, tag: "hasn't it", verbType: "have", positive: true },
  { subject: "they", statement: () => `They preserve the forest every dry season`, tag: "don't they", verbType: "do", positive: true },
];

const VERB_LABELS: Record<VerbType, string> = { be: "a form of 'to be' (is/was/are/were)", have: "a form of 'to have' (has/have/had)", do: "a form of 'to do' (do/does/did)", modal: "a modal verb (can/will/should/must)" };

const FILL_PROMPTS = [
  "Add the correct question tag to complete this sentence.",
  "Complete the sentence with the right question tag.",
  "Fill in the missing question tag for this statement.",
  "What tag correctly completes this sentence?",
  "Supply the question tag that fits this statement.",
];

const MC_PROMPTS = [
  "Which question tag correctly completes this sentence?",
  "Choose the correct tag for this statement.",
  "Select the question tag that fits this sentence.",
  "Which of these tags belongs at the end of this sentence?",
  "Pick the correct question tag below.",
];

export const questionTags: Skill = {
  id: "g6-eng-grammar-question-tags",
  code: "G.12",
  subjectId: "english",
  strandId: "g6-eng-grammar",
  grade: 6,
  title: "Question Tags",
  description: "Form and use question tags correctly with verbs to be, verbs to have, verbs to do, and modals in sentences about environment conservation.",
  generate(rng) {
    const branch = randChoice(rng, ["fill-blank", "mc-choose", "categorize-verb-type", "categorize-polarity", "ordering"] as const);

    if (branch === "fill-blank") {
      const item = randChoice(rng, ITEMS);
      const statement = item.statement(randChoice(rng, KENYAN_NAMES));
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: `${statement}, `,
        after: "?",
        correctAnswer: item.tag,
        inputMode: "text",
        hint: item.positive ? "A positive statement takes a negative tag." : "A negative statement takes a positive tag.",
        explanation: `"${statement}, ${item.tag}?" is correct — the statement is ${item.positive ? "positive, so the tag is negative" : "negative, so the tag is positive"}, using ${VERB_LABELS[item.verbType]}.`,
      };
    }

    if (branch === "mc-choose") {
      const item = randChoice(rng, ITEMS);
      const statement = item.statement(randChoice(rng, KENYAN_NAMES));
      const wrongPool = shuffle(rng, ITEMS.filter((i) => i.tag !== item.tag)).slice(0, 3).map((i) => i.tag);
      const choices = shuffle(rng, [item.tag, ...wrongPool]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_PROMPTS)}\n"${statement}, ____?"`,
        choices,
        correctIndex: choices.indexOf(item.tag),
        layout: "list",
        hint: item.positive ? "This statement is positive, so it needs a negative tag." : "This statement is negative, so it needs a positive tag.",
        explanation: `"${item.tag}" is correct — it matches the subject and ${item.positive ? "negates" : "confirms"} the ${item.positive ? "positive" : "negative"} statement.`,
      };
    }

    if (branch === "categorize-verb-type") {
      const pool = shuffle(rng, ITEMS).slice(0, 8);
      const items = pool.map((it, i) => ({ id: `t-${i}`, label: it.tag }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((it, i) => (correctBucket[`t-${i}`] = it.verbType));
      return {
        kind: "categorize",
        prompt: "Sort these question tags by the type of verb they use.",
        items,
        buckets: [
          { id: "be", label: "Verb 'to be'" },
          { id: "have", label: "Verb 'to have'" },
          { id: "do", label: "Verb 'to do'" },
          { id: "modal", label: "Modal Verb" },
        ],
        correctBucket,
        hint: "Look at the auxiliary verb inside the tag: is/was/are/were = be; has/have/had = have; do/does/did = do; can/will/should/must = modal.",
        explanation: "Tags with is/was/are/were use 'to be'; has/have/had use 'to have'; do/does/did use 'to do'; can/will/should/must are modals.",
      };
    }

    if (branch === "categorize-polarity") {
      const pool = shuffle(rng, ITEMS).slice(0, 8);
      const items = pool.map((it, i) => ({ id: `p-${i}`, label: `${it.statement(randChoice(rng, KENYAN_NAMES))}, ${it.tag}?` }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((it, i) => (correctBucket[`p-${i}`] = it.positive ? "positive-negative" : "negative-positive"));
      return {
        kind: "categorize",
        prompt: "Sort these tag questions: does the statement have a POSITIVE or NEGATIVE form?",
        items,
        buckets: [
          { id: "positive-negative", label: "Positive Statement" },
          { id: "negative-positive", label: "Negative Statement" },
        ],
        correctBucket,
        hint: "Check the statement itself, before the comma — does it contain 'not' or a contracted 'not'?",
        explanation: "A positive statement (no 'not') takes a negative tag; a negative statement (with 'not') takes a positive tag.",
      };
    }

    const item = randChoice(rng, ITEMS);
    const statement = item.statement(randChoice(rng, KENYAN_NAMES));
    const full = `${statement}, ${item.tag}`;
    const words = full.split(" ");
    const orderItems = words.map((w, i) => ({ id: `${i}-${w}`, label: w.replace(",", "") }));
    return {
      kind: "ordering",
      prompt: "Arrange these words to form a correct tag question.",
      instruction: "Click the words in the correct order. The question tag goes at the end.",
      items: shuffle(rng, orderItems),
      correctOrder: orderItems.map((i) => i.id),
      hint: "The question tag comes after a comma, at the very end of the sentence.",
      explanation: `The correct sentence is: "${cap(full)}?"`,
    };
  },
};
