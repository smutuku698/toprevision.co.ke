import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No single fixed sequence exists for zakat as a whole, so the ordering branch uses a
// curriculum-reasonable real-world sequence: the practical steps a Muslim takes to pay zakat.
const ORDER_PROMPTS = [
  "Arrange these steps for paying zakat in the order they should happen.",
  "Put these steps for calculating and paying zakat into the correct order.",
  "Sequence these steps of paying zakat, from first to last.",
  "Order these steps for how zakat should be paid.",
  "Sort these steps of paying zakat into the order they occur.",
  "Arrange these steps for fulfilling zakat in the order they should be taken.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of zakat it describes.",
  "Group each statement under the aspect of zakat it describes.",
  "Decide which aspect of zakat each statement describes, and sort it there.",
  "Sort each fact into the aspect of zakat it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of zakat.",
];

const MATCH_PROMPTS = [
  "Match each recipient category of zakat to its description.",
  "Pair each recipient category with the description that fits it.",
  "Connect each recipient category below to what it means.",
  "Match each category to its correct description.",
  "Link each recipient category to the description that fits it.",
  "Choose the correct description for each recipient category of zakat.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const ZAKAT_STEPS = [
  { id: "check-nisab", label: "Check whether your qualifying wealth has reached the minimum threshold (nisab)" },
  { id: "wait-year", label: "Confirm the wealth has been held for a full lunar year" },
  { id: "calculate", label: "Calculate the required portion of that wealth owed as zakat" },
  { id: "identify-recipient", label: "Identify a recipient from the eight categories named in the Qur'an" },
  { id: "give", label: "Give the zakat to the chosen recipient" },
];

const EIGHT_RECIPIENTS = [
  { name: "The poor (al-fuqara)", meaning: "People with very little means to support themselves" },
  { name: "The needy (al-masakin)", meaning: "People in hardship, though perhaps not as destitute as the poor" },
  { name: "Zakat administrators", meaning: "Those employed to collect and manage zakat funds" },
  { name: "Those whose hearts are to be reconciled", meaning: "New or potential converts, or those inclined toward good relations with Muslims" },
  { name: "Freeing captives", meaning: "Historically used to free people from slavery or bondage" },
  { name: "Those in debt", meaning: "People genuinely burdened by debt they cannot repay" },
  { name: "In the cause of Allah", meaning: "Good works that serve the broader Muslim community" },
  { name: "The stranded traveller", meaning: "A traveller in need, even if wealthy at home" },
];

interface TopicFact {
  text: string;
  topic: "what-is-zakat" | "recipients" | "zakat-vs-sadaqa";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "what-is-zakat": "What zakat is",
  recipients: "The recipients of zakat",
  "zakat-vs-sadaqa": "Zakat compared to sadaqa",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Zakat is obligatory almsgiving on a Muslim's qualifying wealth that reaches a minimum threshold (nisab)", topic: "what-is-zakat" },
  { text: "Zakat is given annually, not just whenever a person feels like giving", topic: "what-is-zakat" },
  { text: "Zakat purifies wealth and redistributes it to support those in need", topic: "what-is-zakat" },
  { text: "The Qur'an (Q9:60) names eight specific categories of zakat recipients", topic: "recipients" },
  { text: "Zakat can go to the poor, the needy, and people in genuine debt", topic: "recipients" },
  { text: "Zakat can also go to zakat administrators and to the stranded traveller", topic: "recipients" },
  { text: "Zakat's eight categories show it supports more than just 'the poor' alone", topic: "recipients" },
  { text: "Zakat is obligatory, with a fixed minimum wealth threshold and a fixed rate", topic: "zakat-vs-sadaqa" },
  { text: "Sadaqa is voluntary charity, with no fixed amount or fixed recipient categories", topic: "zakat-vs-sadaqa" },
  { text: "Sadaqa can be given at any time, to anyone in need", topic: "zakat-vs-sadaqa" },
  { text: "Zakat must go to one of the eight named categories, unlike sadaqa which has no such restriction", topic: "zakat-vs-sadaqa" },
  { text: "Both zakat and sadaqa inculcate the spirit of giving in a Muslim", topic: "zakat-vs-sadaqa" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Zakat", meaning: "Obligatory almsgiving on qualifying wealth, given annually to specified recipients" },
  { term: "Sadaqa", meaning: "Voluntary charity, given any time, in any amount, to anyone in need" },
  { term: "Nisab", meaning: "The minimum threshold of wealth a Muslim must reach before zakat becomes due" },
  { term: "Q9:60", meaning: "The verse of the Qur'an that names the eight categories of zakat recipients" },
  { term: "The poor (al-fuqara)", meaning: "One of the eight named categories — people with very little means" },
  { term: "The stranded traveller", meaning: "One of the eight named categories — a traveller in need, even if wealthy at home" },
  { term: "In the cause of Allah", meaning: "One of the eight named categories — good works serving the Muslim community" },
  { term: "Zakat administrators", meaning: "One of the eight named categories — those employed to collect and manage zakat" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, hears that a traveller passing through town has run out of money, even though the traveller is actually wealthy back home. Can this traveller receive zakat?`,
      correct: "Yes — the stranded traveller is one of the eight categories named in the Qur'an, even if they are wealthy at home",
      wrong: [
        "No — zakat can never go to someone who is wealthy under any circumstance",
        "No — only the permanently poor can ever receive zakat",
        "Yes — but only if the traveller happens to also be a zakat administrator",
      ],
      explanation: "The Qur'an's eight zakat categories specifically include the stranded traveller, regardless of their wealth back home, since they are genuinely in need at that moment.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} donates a small amount of money to a classmate spontaneously, with no fixed schedule or amount required. What is this an example of?`,
      correct: "Sadaqa — voluntary charity, since it was spontaneous and not tied to a fixed obligatory amount or schedule",
      wrong: [
        "Zakat, since any act of giving counts automatically as zakat",
        "Neither, since giving without a schedule has no religious value",
        "A form of nisab, which is actually a wealth threshold, not an act of giving",
      ],
      explanation: "Spontaneous, flexible giving with no fixed amount or schedule is sadaqa — zakat, by contrast, is a fixed, obligatory, annual payment on qualifying wealth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that zakat only ever goes to poor individuals, and no other category of person could ever qualify. Evaluate this claim.`,
    correct: "Flawed — the Qur'an names eight categories, including debt relief, zakat administrators, and stranded travellers, not only the poor",
    wrong: [
      "Sound — the Qur'an names only one category for zakat: the poor",
      "Sound — categories beyond 'the poor' were added later and are not in the Qur'an",
      "Flawed — the Qur'an actually names zakat recipients as only wealthy individuals",
    ],
    explanation: "Q9:60 names eight distinct categories — the poor, the needy, administrators, those to be reconciled, freeing captives, those in debt, the cause of Allah, and the stranded traveller — not just 'the poor' alone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} has wealth that has reached the nisab threshold and been held for a full year. What should they do next, according to how zakat works?`,
      correct: "Calculate the required portion owed as zakat and give it to one of the eight named categories of recipients",
      wrong: [
        "Wait indefinitely, since zakat has no connection to reaching nisab",
        "Give the entire amount of wealth away, since zakat requires everything to be donated",
        "Give it only to relatives, since the eight categories do not actually apply",
      ],
      explanation: "Once wealth reaches nisab and has been held for a year, the next step is calculating and paying the required portion as zakat to one of the eight named categories.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that since sadaqa has no fixed amount, it must be a lesser or less important form of giving than zakat. Is this reasoning sound?`,
    correct: "No — sadaqa's flexibility (no fixed amount or time) makes it a different kind of giving from zakat, not a lesser one; both are valued in Islam",
    wrong: [
      "Yes — only zakat has any real religious value",
      "Yes — sadaqa given without a fixed amount does not count as charity at all",
      "No — sadaqa is actually more obligatory than zakat",
    ],
    explanation: "Zakat (obligatory, fixed) and sadaqa (voluntary, flexible) serve different but both valued purposes in Islam — flexibility does not make sadaqa less meaningful.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to explain why zakat has a fixed nisab threshold rather than applying to every Muslim's wealth, however small. What is the best explanation?`,
      correct: "So that zakat is only obligatory on those who have enough wealth to genuinely afford giving, protecting those with very little from being burdened",
      wrong: [
        "So that only the wealthiest people in a country are ever required to give anything at all",
        "Because nisab has no real purpose and is simply a random rule",
        "So that zakat can be avoided entirely by anyone who chooses to",
      ],
      explanation: "The nisab threshold ensures zakat is only required from those whose wealth genuinely allows them to give, rather than burdening those with very little.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says a person burdened by genuine debt could never be helped through zakat. Is this correct?`,
    correct: "No — 'those in debt' is one of the eight named categories of zakat recipients in the Qur'an",
    wrong: [
      "Yes — debt relief has nothing to do with zakat",
      "Yes — only the poor and needy categories exist in the Qur'an's list",
      "No — but debt relief only applies to zakat administrators, not ordinary people",
    ],
    explanation: "The Qur'an explicitly names 'those in debt' as one of the eight zakat categories, so genuine debt relief is a legitimate use of zakat.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} donates food to a mosque's general community fund used for various good works that benefit local Muslims. Which zakat category would this most likely fall under?`,
    correct: "In the cause of Allah — good works that serve the broader Muslim community",
    wrong: [
      "The stranded traveller, since the fund is not about travel at all",
      "Freeing captives, which is a historical category unrelated to a community fund",
      "Zakat administrators, since donating food does not make someone a collector",
    ],
    explanation: "General good works benefiting the wider Muslim community fall under 'in the cause of Allah,' one of the eight named zakat categories.",
  }),
];

export const zakat: Skill = {
  id: "g6-ire-da-zakat",
  code: "DA.2",
  subjectId: "ire",
  strandId: "g6-ire-devotional",
  grade: 6,
  title: "Zakat",
  description: "Zakat: obligatory almsgiving on qualifying wealth, the eight recipient categories named in the Qur'an (Q9:60), and the difference between zakat and sadaqa.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, ZAKAT_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from checking nisab to giving the zakat.",
        items,
        correctOrder: ZAKAT_STEPS.map((s) => s.id),
        hint: "Paying zakat starts with checking nisab and ends with giving it to a recipient.",
        explanation: ZAKAT_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const whatIsZakat = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "what-is-zakat")).slice(0, 3);
      const recipients = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "recipients")).slice(0, 3);
      const zakatVsSadaqa = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "zakat-vs-sadaqa")).slice(0, 3);
      const chosen = shuffle(rng, [...whatIsZakat, ...recipients, ...zakatVsSadaqa]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["what-is-zakat", "recipients", "zakat-vs-sadaqa"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about what zakat is, some about who receives it, and some about how it compares to sadaqa.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, EIGHT_RECIPIENTS).slice(0, 5);
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
        hint: "Think about who each of the eight named categories describes.",
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
        hint: "Think about which of the eight recipient categories applies, or whether the giving described is zakat or sadaqa.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Zakat is obligatory almsgiving on a Muslim's qualifying", after: ".", answer: "wealth", accepted: ["wealth"] },
      { before: "The minimum threshold of wealth before zakat becomes due is called", after: ".", answer: "nisab", accepted: ["nisab"] },
      { before: "The Qur'an verse naming the eight recipients of zakat is", after: ".", answer: "Q9:60", accepted: ["q9:60", "9:60"] },
      { before: "The Qur'an names", after: "categories of zakat recipients.", answer: "eight", accepted: ["eight", "8"] },
      { before: "Zakat is given", after: ", not just whenever a person feels like giving.", answer: "annually", accepted: ["annually"] },
      { before: "Voluntary charity with no fixed amount or recipient category is called", after: ".", answer: "sadaqa", accepted: ["sadaqa"] },
      { before: "One of the eight zakat categories is the stranded", after: ".", answer: "traveller", accepted: ["traveller", "traveler"] },
      { before: "One of the eight zakat categories is those in", after: ".", answer: "debt", accepted: ["debt"] },
      { before: "Zakat administrators are those employed to", after: "and manage zakat.", answer: "collect", accepted: ["collect"] },
      { before: "Zakat, unlike sadaqa, has a fixed minimum threshold and a fixed", after: ".", answer: "rate", accepted: ["rate"] },
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
      hint: "Recall what zakat is, the eight recipient categories, and how zakat differs from sadaqa.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
