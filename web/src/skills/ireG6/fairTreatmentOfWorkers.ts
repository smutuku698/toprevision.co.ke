import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The Hadith (Bukhari) on the rights of workers unfolds as an explicit, curriculum-endorsed
// sequence of ideas — brotherhood, then food, then dress, then workload, then help — not an
// invented order.
const ORDER_PROMPTS = [
  "Arrange these ideas from the Hadith on workers' rights in the order they appear.",
  "Put these parts of the Hadith on workers' rights into the order they appear.",
  "Sequence these parts of the Hadith on workers' rights correctly, from first to last.",
  "Order these ideas from the Hadith on workers' rights as they appear.",
  "Sort these parts of the Hadith on workers' rights into the order they occur.",
  "Arrange these teachings on workers' rights in the order the Hadith presents them.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of fair treatment of workers it describes.",
  "Group each statement under the aspect of workers' rights it describes.",
  "Decide which aspect of fair treatment each statement describes, and sort it there.",
  "Sort each fact into the aspect of fair treatment of workers it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of fair treatment.",
];

const MATCH_PROMPTS = [
  "Match each term about workers' rights to its meaning.",
  "Pair each term about fair treatment of workers with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about workers' rights.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const SECOND_MC_PROMPTS = [
  "Which statement best matches the teaching of this Hadith?",
  "Which of these best reflects what the Hadith on workers' rights teaches?",
  "Which statement correctly applies this Hadith's teaching?",
  "Based on the Hadith, which statement is correct?",
  "Which of these best fits the Hadith's teaching on workers?",
];

const HADITH_SEQUENCE = [
  { id: "brothers", label: "The Prophet (S.A.W.) said: \"Your brothers are your responsibility\"" },
  { id: "under-hands", label: "He explained: \"Allah has made them under your hands\"" },
  { id: "food", label: "\"So, whosoever has a brother under his hand, let him give him food as he eats\"" },
  { id: "dress", label: "\"...and dress as he dresses\"" },
  { id: "no-overburden", label: "\"Do not give them work that will overburden them\"" },
  { id: "assist", label: "\"...and if you give them such tasks, then provide assistance\"" },
];

interface TopicFact {
  text: string;
  topic: "rights" | "treatment" | "lessons";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  rights: "Rights of workers named in the Hadith",
  treatment: "Ways of treating workers fairly",
  lessons: "Lessons from this teaching",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "A worker should be given food of a similar standard to what the employer themselves eats", topic: "rights" },
  { text: "A worker should be given dress of a similar standard to what the employer themselves wears", topic: "rights" },
  { text: "A worker should not be given work that will overburden them", topic: "rights" },
  { text: "A worker who is given a demanding task should be provided with assistance", topic: "rights" },
  { text: "A worker has the right to be treated with dignity and respect, not exploited", topic: "rights" },
  { text: "Paying wages promptly and fairly is a practical way of honouring a worker's rights", topic: "treatment" },
  { text: "Giving workers adequate rest and breaks during the day shows fair treatment", topic: "treatment" },
  { text: "Treating workers with courtesy and listening to their concerns builds a respectful workplace", topic: "treatment" },
  { text: "Not overworking domestic help or support staff at home is a direct, everyday application of this Hadith", topic: "treatment" },
  { text: "The Hadith calls a worker your \"brother,\" framing the relationship as shared humanity, not just a transaction", topic: "lessons" },
  { text: "Fairness to workers includes both material treatment (food, pay, workload) and dignity/respect", topic: "lessons" },
  { text: "Practising fairness toward household help is a way a Grade 6 learner can apply this teaching today", topic: "lessons" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "\"Your brothers are your responsibility\"", meaning: "The Hadith's opening phrase, framing workers as fellow human beings under one's care" },
  { term: "\"Allah has made them under your hands\"", meaning: "The idea that authority over a worker is a trust from Allah, not a licence to exploit them" },
  { term: "\"Let him give him food as he eats\"", meaning: "The instruction that a worker's food should match the standard the employer eats themselves" },
  { term: "\"...and dress as he dresses\"", meaning: "The instruction that a worker's clothing should match the standard the employer wears themselves" },
  { term: "\"Do not overburden them\"", meaning: "The command against giving workers more work than they can reasonably manage" },
  { term: "\"Provide assistance\"", meaning: "The instruction to help a worker who has been given a demanding task" },
  { term: "Fair wages", meaning: "Payment given promptly and in a fair amount for the work a person has done" },
  { term: "Dignity at work", meaning: "Being treated with respect and courtesy, not merely as a tool for labour" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} employs a house help who works long hours without any breaks. Applying the Prophet's (S.A.W.) teaching on workers, what should the family do?`,
    correct: "Give the house help adequate rest and avoid overburdening her with excessive work",
    wrong: [
      "Continue as normal, since paying a salary already fulfils all obligations to a worker",
      "Reduce her food instead, since long hours are the worker's own choice to accept",
      "Add more tasks, since a busy worker is a more valuable worker",
    ],
    explanation: "The Hadith explicitly commands against overburdening a worker and calls for assistance with demanding tasks — rest and manageable workload are part of fair treatment.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s uncle in ${place(rng)} runs a small shop and eats a good meal at lunch but gives his shop assistant only leftover bread. Applying the Hadith's teaching, what is wrong with this?`,
      correct: "The assistant should be given food of a similar standard to what the employer eats, not lesser leftovers",
      wrong: [
        "Nothing is wrong, since employers are always entitled to better food than their workers",
        "The problem is only that the assistant should ask for a pay rise instead",
        "Nothing is wrong, since the Hadith only discusses dress, not food",
      ],
      explanation: "The Hadith specifically says to give a worker food like the employer eats — a clear standard of parity, not leftovers.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} hires a mason for a demanding, physically heavy construction task and gives him no helper at all. What does the Hadith say about this situation?`,
    correct: "The employer should provide assistance for such a demanding task, as the Hadith instructs",
    wrong: [
      "The Hadith only applies to household chores, not skilled labour like masonry",
      "The mason should simply work faster instead of expecting help",
      "Providing assistance is optional kindness, not something the Hadith actually requires",
    ],
    explanation: "The Hadith directly states that if a worker is given a demanding task, the employer must provide assistance — this is a clear instruction, not optional kindness.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} overhears an employer in ${place(rng)} say workers are just tools to get a job done, with no real relationship owed to them. How does the Hadith's teaching respond to this view?`,
      correct: "The Hadith calls a worker your \"brother,\" showing the relationship is one of shared humanity, not a mere transaction",
      wrong: [
        "The Hadith agrees, since workers exist mainly to serve the employer's goals",
        "The Hadith is silent on how employers should view their workers",
        "The Hadith only applies to relationships between blood relatives, not employers and workers",
      ],
      explanation: "By calling the worker \"your brother,\" the Hadith frames the employer-worker relationship as human and caring, directly opposing the view that workers are mere tools.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s employer in ${place(rng)} delays paying wages for two months, saying the money will come "eventually." Which value from the Hadith's teaching on workers does this violate?`,
    correct: "Fair and prompt treatment — a worker's dues should not be withheld or delayed unreasonably",
    wrong: [
      "None, since the Hadith never discusses payment or wages at all",
      "It violates only dress-related rights, not payment",
      "It is acceptable as long as the worker is eventually paid in full, however late",
    ],
    explanation: "Prompt, fair payment is part of treating a worker with the dignity and care the Hadith describes — unreasonable delay undermines that fairness.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, notices their family's gardener is scolded harshly in front of guests for a small mistake. What does the spirit of this Hadith suggest ${who}'s family should do instead?`,
      correct: "Address the mistake privately and with respect, since the worker deserves dignity like any \"brother\"",
      wrong: [
        "Continue scolding him publicly, since mistakes must be corrected immediately regardless of setting",
        "Dismiss him at once, since any mistake shows he cannot be trusted",
        "Ignore the mistake completely, since correcting workers is never appropriate",
      ],
      explanation: "Treating a worker as a \"brother\" means correcting mistakes with respect and dignity, not public humiliation — the Hadith calls for care, not harshness.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that since employers pay a salary, they are free to demand any amount of work, however excessive, from their workers. Evaluate this reasoning against the Hadith's teaching.`,
    correct: "Flawed — the Hadith explicitly forbids overburdening a worker, regardless of what salary is paid",
    wrong: [
      "Sound — a salary fully justifies unlimited demands on a worker's time and effort",
      "Sound — the Hadith only limits unpaid work, not paid work",
      "Flawed — the Hadith says salary itself is unnecessary if food and dress are provided",
    ],
    explanation: "Paying a salary does not remove the Hadith's clear instruction against overburdening a worker — fair treatment applies regardless of pay.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A teacher in ${place(rng)} asks ${who}'s class to give an everyday example of applying this Hadith at home. Which example best fits the teaching?`,
      correct: "Making sure a young house help gets enough rest, proper meals, and help with heavy chores",
      wrong: [
        "Assigning a house help extra chores whenever the family is busy, without adjustment",
        "Giving a house help simple instructions but no food breaks during the day",
        "Praising a house help's hard work verbally, while still overloading their schedule",
      ],
      explanation: "Ensuring rest, proper meals, and help with heavy chores directly reflects the Hadith's instructions on food, workload, and assistance.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says this Hadith is only relevant to large businesses with many employees, not ordinary families. Is this reasoning correct?`,
    correct: "No — the Hadith applies to anyone with a worker under their care, including families with household help",
    wrong: [
      "Yes — the Hadith specifically names business owners as the only audience",
      "Yes — small households have no responsibility toward the people who work for them",
      "No — but only because Islamic law treats businesses and households identically in every other way",
    ],
    explanation: "The Hadith speaks generally of anyone who \"has a brother under his hand\" — this includes households employing help, not only large businesses.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders why the Hadith links food and dress standards directly to what the employer themselves has, rather than just saying "give them enough." What is the best explanation?`,
      correct: "Linking it to the employer's own standard sets a clear, hard-to-lower benchmark for fairness, rather than a vague minimum",
      wrong: [
        "It is meant only as a suggestion with no real practical effect",
        "It means workers should always receive better food and dress than the employer",
        "It applies only to Muslim workers, not workers of any other background",
      ],
      explanation: "Tying the standard to what the employer themselves has creates a concrete, meaningful measure of fairness rather than a vague or easily-lowered minimum.",
    };
  },
];

export const fairTreatmentOfWorkers: Skill = {
  id: "g6-ire-mu-fair-treatment-of-workers",
  code: "MU.1",
  subjectId: "ire",
  strandId: "g6-ire-muamalat",
  grade: 6,
  title: "Fair Treatment of Workers",
  description: "Islamic teaching on the rights of workers and how employers should treat them fairly, based on the Hadith on workers being one's \"brothers.\"",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "reasoning2", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, HADITH_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the opening idea to the closing instruction.",
        items,
        correctOrder: HADITH_SEQUENCE.map((d) => d.id),
        hint: "It opens by calling workers \"brothers,\" then covers food, then dress, then workload, then assistance.",
        explanation: HADITH_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const rights = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "rights")).slice(0, 3);
      const treatment = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "treatment")).slice(0, 3);
      const lessons = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "lessons")).slice(0, 3);
      const chosen = shuffle(rng, [...rights, ...treatment, ...lessons]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["rights", "treatment", "lessons"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements name a worker's right directly, some describe practical fair treatment, and some are wider lessons.",
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
        hint: "Think about what each phrase from the Hadith is actually instructing.",
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
        hint: "Think about what the Hadith actually instructs about food, dress, workload, and assistance.",
        explanation: q.explanation,
      };
    }

    if (branch === "reasoning2") {
      const pairs: { correct: string; wrong: string[]; explanation: string }[] = [
        {
          correct: "Workers should be given food and dress of a standard similar to the employer's own",
          wrong: [
            "Workers should always receive whatever food and dress happens to be left over",
            "Food and dress are entirely the worker's own responsibility to provide",
            "The Hadith leaves food and dress standards completely undefined",
          ],
          explanation: "The Hadith is explicit: give a worker food as you eat and dress as you dress — a standard tied to the employer's own.",
        },
        {
          correct: "A worker should not be overburdened, and must be helped with demanding tasks",
          wrong: [
            "A worker should be given as much work as physically possible each day",
            "Assistance with demanding tasks is a matter of personal choice for the employer",
            "The Hadith only discusses food and dress, not workload at all",
          ],
          explanation: "The Hadith clearly states workers should not be overburdened and should be helped when given demanding tasks.",
        },
        {
          correct: "The Hadith frames the employer-worker relationship as one of shared humanity, calling the worker a \"brother\"",
          wrong: [
            "The Hadith frames workers as property that belongs entirely to the employer",
            "The Hadith treats the employer-worker relationship as purely financial, with no other dimension",
            "The Hadith discourages any personal relationship between an employer and a worker",
          ],
          explanation: "By calling the worker \"your brother,\" the Hadith establishes a relationship of shared humanity and mutual care, not mere ownership or transaction.",
        },
        {
          correct: "Treating workers well includes both material care (food, pay, workload) and dignity/respect",
          wrong: [
            "Treating workers well means only paying the agreed wage, nothing more",
            "Dignity and respect matter more than any material provision for a worker",
            "Material care and dignity are unrelated ideas in this Hadith",
          ],
          explanation: "The Hadith combines material provisions (food, dress, manageable workload) with dignity — fairness includes both dimensions together.",
        },
        {
          correct: "This Hadith applies to everyday situations, such as how a family treats its house help",
          wrong: [
            "This Hadith applies only to formal business employment, never to households",
            "This Hadith is a historical rule no longer relevant to modern life",
            "This Hadith applies only to adult workers, never to any household duties",
          ],
          explanation: "The Hadith speaks generally about anyone who has a worker \"under their hand,\" which includes everyday household situations.",
        },
      ];
      const q = randChoice(rng, pairs);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, SECOND_MC_PROMPTS),
        choices,
        correctIndex,
        layout: "list",
        hint: "Recall exactly what the Hadith on workers' rights instructs.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Prophet (S.A.W.) said: \"Your brothers are your", after: ".\"", answer: "responsibility", accepted: ["responsibility"] },
      { before: "He said Allah has made them under your", after: ".", answer: "hands", accepted: ["hands"] },
      { before: "A worker should be given food as the employer", after: ".", answer: "eats", accepted: ["eats"] },
      { before: "A worker should be given dress as the employer", after: ".", answer: "dresses", accepted: ["dresses"] },
      { before: "The Hadith says do not give workers work that will", after: "them.", answer: "overburden", accepted: ["overburden"] },
      { before: "If a demanding task is given, the employer must provide", after: ".", answer: "assistance", accepted: ["assistance", "help"] },
      { before: "The Hadith comes from the collection of", after: ".", answer: "Bukhari", accepted: ["bukhari"] },
      { before: "The Hadith calls a worker your", after: ".", answer: "brother", accepted: ["brother"] },
      { before: "Wages should be paid", after: "and fairly.", answer: "promptly", accepted: ["promptly", "on time"] },
      { before: "Fair treatment of workers includes giving them adequate rest and", after: ".", answer: "breaks", accepted: ["breaks"] },
      { before: "A worker deserves to be treated with dignity and", after: ".", answer: "respect", accepted: ["respect"] },
      { before: "Not overworking household help is an everyday example of applying this", after: ".", answer: "Hadith", accepted: ["hadith"] },
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
      hint: "Recall the Hadith on workers' rights and its instructions on food, dress, workload, and assistance.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
