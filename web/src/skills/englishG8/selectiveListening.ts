import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ANNOUNCEMENTS: {
  passage: string;
  specificQ: string;
  specificCorrect: string;
  specificDistractors: string[];
  blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] };
}[] = [
  {
    passage:
      "Attention shoppers: Greenway Supermarket will offer a 20% discount on all cooking oil from Monday 3rd to Friday 7th August. Remember, as a consumer, you have the right to demand a receipt for every purchase you make.",
    specificQ: "What discount is Greenway Supermarket offering on cooking oil?",
    specificCorrect: "20%",
    specificDistractors: ["10%", "50%", "5%"],
    blank: { before: "The cooking oil discount runs from Monday 3rd to Friday", after: "August.", correctAnswer: "7th", acceptedAnswers: ["7"] },
  },
  {
    passage:
      "Consumers are reminded that the price of sugar has been reduced to Ksh 150 per kilogram at Sunrise Stores, effective this Saturday. Shoppers are advised to always compare prices before buying in bulk.",
    specificQ: "According to the announcement, how much does a kilogram of sugar now cost at Sunrise Stores?",
    specificCorrect: "Ksh 150",
    specificDistractors: ["Ksh 50", "Ksh 500", "Ksh 15"],
    blank: { before: "The announcement says sugar now costs Ksh", after: "per kilogram at Sunrise Stores.", correctAnswer: "150" },
  },
  {
    passage:
      "This is a reminder that the Consumer Rights Forum will hold a free workshop on Thursday at 4 p.m. at the community hall. Residents can call 0722 123 456 to reserve a seat.",
    specificQ: "What number should residents call to reserve a seat at the workshop?",
    specificCorrect: "0722 123 456",
    specificDistractors: ["0733 654 321", "0700 000 111", "0711 222 333"],
    blank: { before: "The Consumer Rights Forum workshop starts at", after: "p.m. on Thursday.", correctAnswer: "4" },
  },
];

const SPECIFIC_INFO = ["The sale starts on 3rd August.", "The phone number is 0722 123 456.", "Milk costs Ksh 60 per litre.", "The meeting is at 4 p.m. on Thursday.", "The discount is 20% off."];
const GENERAL_INFO = ["Consumers should always check expiry dates.", "It is important to shop wisely.", "Many people prefer fresh produce.", "Good customer service builds trust.", "Shoppers should compare prices."];

const STRATEGIES: { strategy: string; benefit: string }[] = [
  { strategy: "Listening for numbers and names", benefit: "Helps you capture specific details such as prices, dates and contacts" },
  { strategy: "Listening for the overall topic first", benefit: "Helps you understand the general information being shared" },
  { strategy: "Jotting down key words as you listen", benefit: "Helps you remember specific facts to use later" },
  { strategy: "Predicting content from the title or opening line", benefit: "Helps you focus on the information that is most relevant" },
];

const SELECTIVE_STEPS = [
  { id: "determine", label: "Decide what specific information you need before you start listening" },
  { id: "listen", label: "Listen attentively for keywords related to that information" },
  { id: "note", label: "Note down the specific details as you hear them" },
  { id: "respond", label: "Respond to or use the information you have selected appropriately" },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to get the main points from an oral text?",
    correct: "So you can understand and act on the most relevant information without being overwhelmed by every detail",
    distractors: ["So you can repeat the entire text word for word", "Because the main points are always at the very end", "So you can ignore what the speaker is actually saying"],
  },
  {
    q: "How can you ensure you capture the relevant information from a speaker?",
    correct: "By listening actively for the specific details you need, such as names, dates and figures",
    distractors: ["By writing down every single word the speaker says", "By waiting until the speaker finishes to start paying attention", "By assuming you already know what they will say"],
  },
  {
    q: "What is the main difference between specific and general information in a listening text?",
    correct: "Specific information gives exact facts like numbers or names, while general information gives broad statements or opinions",
    distractors: ["Specific information is always found at the beginning of a text", "General information is always more important than specific information", "There is no real difference between the two"],
  },
];

export const selectiveListening: Skill = {
  id: "g8-eng-ls-selective-listening",
  code: "LS.4",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Listening Comprehension: Selective Listening",
  description: "Distinguish specific from general information and select the relevant details from consumer announcements.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-passage", "categorize", "match", "order", "fill", "mc-kiq"] as const);
    const hint = "Decide what specific detail you are listening for, then listen carefully until you hear it — don't get distracted by general statements.";

    if (branch === "mc-passage") {
      const a = randChoice(rng, ANNOUNCEMENTS);
      const choices = shuffle(rng, [a.specificCorrect, ...a.specificDistractors]);
      return {
        kind: "multiple-choice",
        prompt: a.specificQ,
        passage: a.passage,
        choices,
        correctIndex: choices.indexOf(a.specificCorrect),
        layout: "list",
        hint,
        explanation: `The correct answer is "${a.specificCorrect}", a specific detail stated directly in the announcement.`,
      };
    }

    if (branch === "categorize") {
      const specific = shuffle(rng, SPECIFIC_INFO).slice(0, 3);
      const general = shuffle(rng, GENERAL_INFO).slice(0, 3);
      const items = shuffle(rng, [
        ...specific.map((label) => ({ id: label, label, bucket: "specific" })),
        ...general.map((label) => ({ id: label, label, bucket: "general" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each statement into Specific information or General information.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "specific", label: "Specific information" },
          { id: "general", label: "General information" },
        ],
        correctBucket,
        hint: "Specific information includes exact facts like numbers, names or dates; general information is a broad statement or opinion.",
        explanation: `Specific: ${specific.join(" / ")}. General: ${general.join(" / ")}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, STRATEGIES.map((s) => ({ id: s.strategy, label: s.strategy })));
      const targets = shuffle(rng, STRATEGIES.map((s) => ({ id: s.strategy, label: s.benefit })));
      const correctMap: Record<string, string> = {};
      for (const s of STRATEGIES) correctMap[s.strategy] = s.strategy;
      return {
        kind: "click-match",
        prompt: "Match each listening strategy to the benefit it gives you.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: STRATEGIES.map((s) => `${s.strategy} — ${s.benefit.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SELECTIVE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of selective listening in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: SELECTIVE_STEPS.map((s) => s.id),
        hint: "Selective listening starts with deciding what you need, then listening, noting, and finally responding.",
        explanation: SELECTIVE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const a = randChoice(rng, ANNOUNCEMENTS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing specific detail from the announcement.",
        passage: a.passage,
        before: a.blank.before,
        after: a.blank.after,
        correctAnswer: a.blank.correctAnswer,
        acceptedAnswers: a.blank.acceptedAnswers,
        inputMode: "text",
        hint: "The exact detail is stated directly in the announcement above.",
        explanation: `The announcement gives the specific detail "${a.blank.correctAnswer}".`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
