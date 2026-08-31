import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const SMART_LETTERS = [
  { id: "specific", letter: "S", label: "Specific", meaning: "Clearly stating exactly what is to be achieved" },
  { id: "measurable", letter: "M", label: "Measurable", meaning: "Able to track progress with a number or amount" },
  { id: "achievable", letter: "A", label: "Achievable", meaning: "Realistic given the person's income and resources" },
  { id: "relevant", letter: "R", label: "Relevant", meaning: "Relevant to the person's actual needs and circumstances" },
  { id: "time-bound", letter: "T", label: "Time-bound", meaning: "Has a clear deadline for achieving it" },
] as const;

const GOAL_EXAMPLES = [
  { text: "Saving KES 500 to buy new school shoes next month", bucket: "short" },
  { text: "Saving KES 2,000 for a school trip in two months", bucket: "short" },
  { text: "Saving KES 800 to buy new exercise books before term starts", bucket: "short" },
  { text: "Saving KES 15,000 over eight months to buy a bicycle", bucket: "medium" },
  { text: "Saving for three years to buy a motorcycle for a boda-boda business", bucket: "medium" },
  { text: "Saving KES 20,000 over one year for a family goat-rearing project", bucket: "medium" },
  { text: "Saving over six years to pay for a university course", bucket: "long" },
  { text: "Saving for five years to start a small retail shop", bucket: "long" },
  { text: "Saving over ten years towards building a family home", bucket: "long" },
  { text: "Saving for four years towards buying a plot of land", bucket: "long" },
] as const;

const GOAL_LABELS: Record<string, string> = {
  short: "Short-term goal",
  medium: "Medium-term goal",
  long: "Long-term goal",
};

const SMART_CHECK = [
  {
    prompt: "Which of these is an example of a SMART financial goal?",
    correct: "Save KES 3,000 in 6 months to buy a new phone",
    wrong: ["Save some money someday", "Try to have more money in the future", "Spend less, maybe"],
    explanation: "This goal is specific (KES 3,000 for a phone), measurable, and time-bound (6 months) — the features of a SMART goal.",
  },
  {
    prompt: "Which of these is NOT written as a SMART financial goal?",
    correct: "Save some money someday",
    wrong: ["Save KES 6,000 in 12 months for school fees", "Save KES 1,000 in 4 months for a bicycle repair", "Save KES 10,000 in 2 years for a laptop"],
    explanation: "\"Save some money someday\" has no specific amount and no deadline, so it is not measurable or time-bound.",
  },
  {
    prompt: "A learner writes the goal \"I want to have a lot of money.\" Which SMART element is most clearly missing?",
    correct: "Specific and Measurable — there is no exact amount stated",
    wrong: ["Time-bound only — everything else is fine", "Achievable only — everything else is fine", "Nothing is missing; this is already a SMART goal"],
    explanation: "\"A lot of money\" has no specific, measurable amount, so it fails both the Specific and Measurable elements of a SMART goal.",
  },
  {
    prompt: "A learner earning KES 200 a week writes the goal \"Save KES 50,000 in one month.\" Which SMART element does this goal fail?",
    correct: "Achievable — the amount is unrealistic given the learner's actual income",
    wrong: ["Specific — the goal already states a clear amount", "Time-bound — the goal already states a deadline", "Measurable — the goal already states a number"],
    explanation: "The goal is specific, measurable and time-bound, but saving KES 50,000 in a month is not realistic on a KES 200 weekly income — it fails the Achievable element.",
  },
  {
    prompt: "Which of these financial goals best demonstrates all five SMART elements together?",
    correct: "Save KES 4,000 in 4 months, from my KES 250 weekly allowance, to buy a school bag",
    wrong: ["Save money for something nice eventually", "Buy a school bag as soon as possible", "Save whatever is left over each week, no target"],
    explanation: "This goal names a specific amount and item, is measurable, is realistic given the stated income, is relevant to a real need, and has a clear deadline — all five SMART elements.",
  },
] as const;

const DISCIPLINE_QUESTIONS = [
  {
    prompt: "Which of these habits shows good financial discipline?",
    correct: "Tracking spending in a notebook and sticking to a budget",
    wrong: ["Borrowing money whenever you want something", "Spending all income immediately after receiving it", "Ignoring how much has been saved so far"],
    explanation: "Tracking spending and sticking to a budget are examples of financial discipline that help a person reach their financial goals.",
  },
  {
    prompt: "Which factor should be considered when setting a personal financial goal?",
    correct: "The person's income and how much they can realistically save",
    wrong: ["The colour of the notes and coins used", "How many people share the same name", "The day of the week the goal is written down"],
    explanation: "A realistic financial goal must be based on the person's actual income and how much they can afford to save.",
  },
  {
    prompt: "A learner receives an unexpected gift of money. What shows the most financial discipline in how they use it?",
    correct: "Putting some or all of it towards an existing savings goal, rather than spending it all immediately",
    wrong: ["Spending it all immediately on something not planned for", "Hiding it and forgetting about it completely", "Giving it away without any thought about their own goals"],
    explanation: "Financial discipline means directing money, including unexpected income, towards planned goals rather than spending impulsively.",
  },
  {
    prompt: "A learner saving towards a goal notices they are consistently short of their monthly target. What is the most disciplined next step?",
    correct: "Review their spending and either reduce non-essential expenses or realistically adjust the goal's timeline",
    wrong: ["Give up on the goal completely without adjusting anything", "Borrow money to cover the shortfall every month", "Ignore the shortfall and hope it corrects itself"],
    explanation: "Financial discipline means actively reviewing and adjusting a plan when it isn't working, rather than giving up or ignoring the problem.",
  },
  {
    prompt: "Why is it useful to separate money for a savings goal from money for daily spending?",
    correct: "It reduces the temptation to spend the savings on unplanned items",
    wrong: ["It has no real effect on how the money is used", "It is only useful for people with very high incomes", "It makes the total amount of money increase automatically"],
    explanation: "Keeping savings separate from spending money reduces the temptation to dip into it, helping a person stay disciplined towards their goal.",
  },
] as const;

const GOAL_STEPS = [
  { id: "decide", label: "Decide specifically what you want to achieve and how much it costs" },
  { id: "amount", label: "Set a realistic amount you can actually save, based on your income" },
  { id: "deadline", label: "Decide on a clear deadline (time frame) for the goal" },
  { id: "track", label: "Track your progress and adjust the plan if needed" },
] as const;

export const financialGoals: Skill = {
  id: "g7-pt-ent-financial-goals",
  code: "ENT.3",
  subjectId: "pre-technical",
  strandId: "g7-pt-entrepreneurship",
  grade: 7,
  title: "Financial goals",
  description: "The SMART framework for setting financial goals, categorising goals as short-, medium- or long-term, factors to consider when setting a goal, and habits that show financial discipline.",
  generate(rng) {
    const branch = randChoice(rng, ["smart-match", "term-sort", "smart-check", "discipline", "goal-order", "fill-smart"] as const);

    if (branch === "smart-match") {
      const tokens = shuffle(rng, SMART_LETTERS.map((s) => ({ id: s.id, label: `${s.letter} — ${s.label}` })));
      const targets = shuffle(rng, SMART_LETTERS.map((s) => ({ id: s.id, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of SMART_LETTERS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: "Match each letter of the SMART goal framework to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "S-M-A-R-T stands for Specific, Measurable, Achievable, Relevant, Time-bound.",
        explanation: SMART_LETTERS.map((s) => `${s.letter} (${s.label}) — ${s.meaning}.`).join(" "),
      };
    }

    if (branch === "term-sort") {
      const chosen = shuffle(rng, GOAL_EXAMPLES);
      const items = chosen.map((g, i) => ({ id: `g${i}`, label: g.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((g, i) => (correctBucket[`g${i}`] = g.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each financial goal as short-term, medium-term, or long-term.",
        items,
        buckets: [
          { id: "short", label: "Short-term" },
          { id: "medium", label: "Medium-term" },
          { id: "long", label: "Long-term" },
        ],
        correctBucket,
        hint: "Short-term goals take a few weeks or months; medium-term takes a few years; long-term takes many years.",
        explanation: chosen.map((g) => `"${g.text}" is a ${GOAL_LABELS[g.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "smart-check") {
      const q = randChoice(rng, SMART_CHECK);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        explanation: q.explanation,
      };
    }

    if (branch === "discipline") {
      const q = randChoice(rng, DISCIPLINE_QUESTIONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        explanation: q.explanation,
      };
    }

    if (branch === "goal-order") {
      const shuffled = shuffle(rng, GOAL_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for setting a financial goal correctly, from first to last.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: GOAL_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Decide what you want first, then how much, then by when, then track it.",
        explanation: `The correct order is: ${GOAL_STEPS.map((s) => s.label).join("; ")}.`,
      };
    }

    const s = randChoice(rng, SMART_LETTERS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: `In the SMART goal framework, the letter '${s.letter}' stands for `,
      after: ".",
      correctAnswer: s.label,
      acceptedAnswers: [s.label, s.label.toLowerCase()],
      inputMode: "text",
      hint: `This describes: ${s.meaning.toLowerCase()}.`,
      explanation: `In the SMART framework, '${s.letter}' stands for ${s.label} — ${s.meaning.toLowerCase()}.`,
    };
  },
};
