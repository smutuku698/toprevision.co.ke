import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The curriculum design frames work-as-ibadah as a widening chain: choose lawful means, work
// honestly, meet one's own needs, meet the family's needs, then the wider Ummah benefits — not an
// invented order, this is the design's own reasoning for why work matters at each scope.
const ORDER_PROMPTS = [
  "Arrange how honest work builds up from an individual to the whole Ummah, in order.",
  "Put these steps of honest work in the order they build on each other.",
  "Sequence these effects of lawful work correctly, from the individual outward.",
  "Order these ideas about work as Ibadah from the most personal to the widest impact.",
  "Sort these steps of honest work into the order they naturally build up.",
  "Arrange these stages of lawful work in the order they widen in impact.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by what it says about work in Islam.",
  "Group each statement under what it describes about work as Ibadah.",
  "Decide what each statement is about, and sort it there.",
  "Sort each fact into the idea about work it belongs to.",
  "Place each statement under the aspect of work it describes.",
  "Read each statement and sort it under the matching idea about work.",
];

const MATCH_PROMPTS = [
  "Match each term about work as Ibadah to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about work in Islam.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const WORK_SEQUENCE = [
  { id: "choose-halal", label: "A Muslim seeks out honest, lawful (halal) work rather than an unlawful way of earning" },
  { id: "work-ethically", label: "The work is carried out with honesty and fairness, not by cutting corners or exploiting others" },
  { id: "provide-self", label: "The lawful earning provides for the person's own needs, reducing dependence on others" },
  { id: "provide-family", label: "The income also supports the person's family" },
  { id: "build-ummah", label: "Multiplied across many households, this honest effort contributes to the development and self-sufficiency of the wider Ummah" },
];

interface TopicFact {
  text: string;
  topic: "why-valued" | "halal-examples" | "haram-examples";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "why-valued": "Why honest work is valued as Ibadah",
  "halal-examples": "Examples and ethics of halal work",
  "haram-examples": "Examples of haram earning",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Honest, lawful work reduces a person's dependence on others for their needs", topic: "why-valued" },
  { text: "Working productively keeps a Muslim occupied rather than idle", topic: "why-valued" },
  { text: "Lawful work by individuals contributes to the development and self-sufficiency of the whole Ummah (Muslim community)", topic: "why-valued" },
  { text: "Earning through halal effort is treated in Islam as an act of worship, not merely a worldly necessity", topic: "why-valued" },
  { text: "Farming a piece of land and selling the honest produce is an example of halal work", topic: "halal-examples" },
  { text: "Trading goods fairly, without cheating customers on price or quality, is halal work", topic: "halal-examples" },
  { text: "Teaching others a skill or subject for fair pay is halal work", topic: "halal-examples" },
  { text: "Providing a genuine service, such as repairing something well and charging a fair price, is halal work", topic: "halal-examples" },
  { text: "Earning money through theft is haram, no matter how small the amount taken", topic: "haram-examples" },
  { text: "Cheating or defrauding customers in a business deal makes the earning haram", topic: "haram-examples" },
  { text: "Dealing in goods that Islam prohibits makes the trade haram, even if it is profitable", topic: "haram-examples" },
  { text: "Breaking an agreed contract or short-changing a worker's pay is a form of haram dealing", topic: "haram-examples" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Ibadah", meaning: "Worship — an act performed for Allah's sake, which honest, lawful work is considered to be" },
  { term: "Halal (work)", meaning: "Lawful — earning through honest, permitted effort such as farming, fair trade, teaching, or genuine service" },
  { term: "Haram (work)", meaning: "Unlawful — earning through prohibited or dishonest means, such as theft or fraud" },
  { term: "Ummah", meaning: "The wider Muslim community, whose development and self-sufficiency lawful work contributes to" },
  { term: "Idleness (avoiding it)", meaning: "Staying unproductive, something honest work is meant to guard a Muslim against" },
  { term: "Fair value for pay", meaning: "Giving genuine effort and quality that matches what one is paid, an ethic that should guide work" },
  { term: "Fulfilling agreements", meaning: "Honouring contracts and promises made in a work deal, part of Islamic work ethics" },
  { term: "Exploiting others (avoiding it)", meaning: "Not taking unfair advantage of an employer, employee, or customer in a work relationship" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, says that farming is "just work" and does not really count as worship, so only prayer matters. Evaluate this reasoning.`,
    correct: "Flawed — honest, lawful work such as farming is itself considered a form of Ibadah in Islam, not merely a worldly task set apart from worship",
    wrong: [
      "Sound — no form of daily work can ever count as worship in Islam",
      "Sound — only work done inside a mosque counts as Ibadah",
      "Flawed — Ibadah refers only to prayer and fasting, so work is unrelated to religion at all",
    ],
    explanation: "Islam treats honest, lawful work as a form of worship in its own right, alongside acts like prayer, not as a separate worldly activity outside religion.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} runs a small shop in ${place(rng)} and starts giving customers slightly less than the weight they pay for. Applying the Islamic view of halal work, what is true about this earning?`,
      correct: "The earning becomes haram, because cheating customers on weight or quality is a form of fraud, even if the shop still makes a profit",
      wrong: [
        "The earning stays halal, since running a shop is a lawful business regardless of how customers are treated",
        "The earning is only a problem if the customer notices and complains",
        "The earning is halal as long as the shopkeeper gives correctly on some days",
      ],
      explanation: "Fair dealing is part of what makes work halal — short-changing customers on weight or quality turns an otherwise lawful business into haram earning.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s father in ${place(rng)} works as a night watchman, and some classmates say it is "unimportant work." What does Islam's teaching on work as Ibadah say about this?`,
    correct: "Any honest, lawful work — however humble it seems — has dignity and religious value in Islam",
    wrong: [
      "Only highly paid professions count as valuable work in Islam",
      "Work only has value if it involves teaching or leading others",
      "Humble jobs are tolerated in Islam but never actually praised",
    ],
    explanation: "Islam does not rank the value of honest work by how prestigious it looks — any lawful, honest effort carries real dignity and religious value.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is short of pocket money and considers taking mangoes from a neighbour's tree to sell, instead of doing paid chores. Applying the halal-haram distinction, what should ${who} do?`,
      correct: "Choose the paid chores instead, since taking and selling the mangoes without permission would be earning through theft, which is haram",
      wrong: [
        "Take the mangoes, since the amount is too small to really count as theft",
        "Take the mangoes, since any way of earning money is acceptable if the need is genuine",
        "Do neither, since Islam discourages a Grade 6 learner from earning any money at all",
      ],
      explanation: "Islam distinguishes work by how it is earned, not just by the amount involved — the paid chores are halal, while taking the mangoes without permission is theft.",
    };
  },
  (rng) => ({
    prompt: `A trader in ${place(rng)} offers ${name(rng)}'s family extra profit if they help sell goods that Islam prohibits. What is the correct response, applying the teaching on halal and haram work?`,
    correct: "Decline the offer, since dealing in prohibited goods makes the earning haram no matter how profitable it is",
    wrong: [
      "Accept, since higher profit always makes a deal more acceptable",
      "Accept, but only sell the goods occasionally to reduce the problem",
      "Decline only if a religious leader is present to witness the refusal",
    ],
    explanation: "Profitability does not make an earning lawful — dealing in goods Islam prohibits keeps the trade haram regardless of how much money it brings in.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that since Allah provides for everyone, there is no real need for a Muslim to work hard. Is this reasoning sound?`,
    correct: "No — Islam still calls a Muslim to work honestly, since productive work keeps a person from idleness and builds self-sufficiency for their family and the Ummah",
    wrong: [
      "Yes — trusting Allah's provision means effort in this life is unnecessary",
      "Yes — only religious scholars are expected to work, since Allah provides for everyone else",
      "No — but only because working hard earns more money, with no other reason given in Islam",
    ],
    explanation: "Trusting Allah's provision does not remove the value Islam places on honest effort — work still guards against idleness and builds self-sufficiency.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a tailor's assistant in ${place(rng)}, is asked to finish an order quickly by using poor stitching the customer will not immediately notice, while charging the full agreed price. What does Islamic work ethics say about this?`,
      correct: "This is wrong — giving fair value for the pay received is an ethic that should guide work, so quality should match what was agreed and charged for",
      wrong: [
        "This is acceptable, since the customer has already agreed to pay the full price",
        "This is acceptable, as long as the poor stitching is not discovered",
        "This is only a problem if the customer complains directly to the tailor",
      ],
      explanation: "Islamic work ethics call for giving fair value for pay received — quietly lowering quality while charging full price breaks that fairness even if it goes unnoticed.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} debates whether their son should stop helping in the family shop and only focus on religious study, since they believe only religious activity counts as Ibadah. What is the flaw in this view?`,
    correct: "It overlooks that honest, lawful work such as helping in the family shop is itself considered a form of Ibadah, alongside religious study",
    wrong: [
      "There is no flaw — only religious study should ever be called Ibadah",
      "The flaw is that religious study has no value at all compared to work",
      "The flaw is that helping in a shop is haram for a student to do",
    ],
    explanation: "Islam does not set honest work and religious study against each other as competing forms of Ibadah — lawful work is itself worship.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} takes an order for school uniforms, collects payment upfront, then delivers late and of lower quality than promised, without telling the customers in advance. Which work ethic does this most clearly break?`,
      correct: "Fulfilling agreements — the work fell short of the contract the customers had agreed to and paid for",
      wrong: [
        "Avoiding idleness — the tailor was still actively working on the order",
        "Contributing to the Ummah — this ethic only applies to charitable giving, not paid work",
        "None of the work ethics were broken, since payment was still collected fairly",
      ],
      explanation: "Honouring agreements and contracts is a core work ethic in Islam — delivering late and of lower quality than promised, without informing the customer, breaks that agreement.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that only unpaid volunteering, such as helping at a mosque for free, counts as Ibadah, while a paid labourer's honest work does not. Is this reasoning correct?`,
    correct: "No — honest, lawful paid work is also considered Ibadah in Islam; being unpaid is not what makes an act worship",
    wrong: [
      "Yes — payment always removes the religious value of an act in Islam",
      "Yes — only mosque-based activities can ever count as Ibadah",
      "No — but only volunteering and paid work both fail to count as Ibadah",
    ],
    explanation: "What makes work Ibadah is that it is honest and lawful, not whether it is paid — a labourer's fairly earned wage does not cancel the work's religious value.",
  }),
];

export const workAsIbadah: Skill = {
  id: "g6-ire-ak-work-as-ibadah",
  code: "AK.1",
  subjectId: "ire",
  strandId: "g6-ire-akhlaq",
  grade: 6,
  title: "Work as a Form of Ibadah",
  description: "Why honest, lawful (halal) work is considered a form of worship in Islam, the difference between halal and haram earning, and the ethics that should guide work.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, WORK_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from choosing lawful work to its widest impact.",
        items,
        correctOrder: WORK_SEQUENCE.map((s) => s.id),
        hint: "It starts with choosing honest, lawful work and widens outward: self, family, then the whole Ummah.",
        explanation: WORK_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const whyValued = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "why-valued")).slice(0, 3);
      const halal = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "halal-examples")).slice(0, 3);
      const haram = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "haram-examples")).slice(0, 3);
      const chosen = shuffle(rng, [...whyValued, ...halal, ...haram]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["why-valued", "halal-examples", "haram-examples"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements explain why work is valued, some describe halal work, and some describe haram earning.",
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
        hint: "Think about what each term refers to in Islam's teaching on work.",
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
        hint: "Think about whether the earning is honest and lawful, and whether it is being treated as Ibadah.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In Islam, honest and lawful work is considered a form of", after: ".", answer: "ibadah", accepted: ["ibadah", "worship"] },
      { before: "Lawful, permitted work in Islam is called", after: "work.", answer: "halal", accepted: ["halal"] },
      { before: "Earning through theft, fraud, or other unlawful means is called", after: "work.", answer: "haram", accepted: ["haram"] },
      { before: "Honest work reduces a person's", after: "on others for their needs.", answer: "dependence", accepted: ["dependence"] },
      { before: "Productive work helps a Muslim avoid", after: ".", answer: "idleness", accepted: ["idleness"] },
      { before: "Lawful work by individuals contributes to the development and self-sufficiency of the", after: "(Muslim community).", answer: "Ummah", accepted: ["ummah"] },
      { before: "Fair trading means never", after: "customers on price or quality.", answer: "cheating", accepted: ["cheating", "defrauding"] },
      { before: "A key work ethic in Islam is fulfilling agreements and", after: "made with others.", answer: "contracts", accepted: ["contracts", "agreements"] },
      { before: "Giving fair value for the pay one receives is an important work", after: "in Islam.", answer: "ethic", accepted: ["ethic"] },
      { before: "Dealing in goods that Islam prohibits makes an earning", after: ".", answer: "haram", accepted: ["haram"] },
      { before: "Even humble, lawful work has", after: "and religious value in Islam.", answer: "dignity", accepted: ["dignity"] },
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
      hint: "Recall why work is valued in Islam, and the difference between halal and haram earning.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
