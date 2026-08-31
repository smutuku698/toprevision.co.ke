import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists for this sub-strand, so the ordering branch uses a
// curriculum-reasonable real-world sequence: steps for guarding against israf in daily life.
const ORDER_PROMPTS = [
  "Arrange these steps for guarding against israf in a sensible order.",
  "Put these steps for avoiding wastefulness into a sensible order.",
  "Sequence these steps for using resources wisely, from first to last.",
  "Order these steps for guarding against israf.",
  "Sort these steps for avoiding waste into a sensible order.",
  "Arrange these resource-saving steps in a sensible order.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which resource of israf it relates to.",
  "Group each statement under the resource it relates to.",
  "Decide which resource each statement relates to, and sort it there.",
  "Sort each fact into the resource it belongs to.",
  "Place each statement under the resource it relates to.",
  "Read each statement and sort it under the matching resource.",
];

const MATCH_PROMPTS = [
  "Match each example of israf to the resource it wastes.",
  "Pair each example with the resource it wastes.",
  "Connect each example below to the resource it wastes.",
  "Match each example to its correct resource.",
  "Link each example to the resource it relates to.",
  "Choose the correct resource for each example of israf.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const GUARD_STEPS = [
  { id: "notice", label: "Notice where resources like food, water, money, or electricity are being used carelessly" },
  { id: "take-only-needed", label: "Take or use only what is genuinely needed" },
  { id: "turn-off", label: "Turn off unused electronics and taps promptly" },
  { id: "plan-ahead", label: "Plan meals, spending, or usage ahead of time to avoid waste" },
  { id: "remind-others", label: "Remind others (e.g. with a poster or a gentle word) to avoid wasteful habits too" },
];

interface TopicFact {
  text: string;
  topic: "food-water" | "money-electricity" | "principle";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "food-water": "Wasting food and water",
  "money-electricity": "Wasting money and electricity",
  principle: "The general principle of israf",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Israf means extravagance or wastefulness — using more of a resource than needed, or using it carelessly", topic: "principle" },
  { text: "Islamic teaching calls for moderation even in things that are permitted and abundant", topic: "principle" },
  { text: "Not using excessive water even while performing wudhu, even at a flowing river, is a well-known example of avoiding israf", topic: "principle" },
  { text: "Avoiding israf is described as a way to earn Allah's reward", topic: "principle" },
  { text: "Cooking or serving more food than will actually be eaten wastes that resource", topic: "food-water" },
  { text: "Leaving taps running unnecessarily wastes water", topic: "food-water" },
  { text: "Using only the water genuinely needed, even during an act of worship, avoids israf", topic: "food-water" },
  { text: "Planning meals carefully can help avoid food waste", topic: "food-water" },
  { text: "Spending money carelessly on unnecessary things is a form of israf", topic: "money-electricity" },
  { text: "Leaving lights or a television on when not in use wastes electricity", topic: "money-electricity" },
  { text: "Budgeting money carefully helps avoid wasteful spending", topic: "money-electricity" },
  { text: "Turning off unused electronics is a practical way to guard against israf", topic: "money-electricity" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Israf", meaning: "Extravagance or wastefulness — using more of a resource than is needed" },
  { term: "Moderation", meaning: "Using resources in a balanced way, avoiding both waste and excessive restriction" },
  { term: "Wudhu (in this context)", meaning: "The act during which even using a flowing water source excessively is still discouraged as israf" },
  { term: "Stewardship", meaning: "Careful, responsible use of what Allah has provided" },
  { term: "Budgeting", meaning: "Planning money use carefully to avoid careless or wasteful spending" },
  { term: "Signage/posters", meaning: "A suggested tool for reminding people to avoid wasteful habits, like turning off taps" },
  { term: "Gratitude", meaning: "An attitude connected to avoiding waste, since careful use honours the resources Allah has provided" },
  { term: "Reward from Allah", meaning: "What avoiding israf is described as a way of earning" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, lives near a large, plentiful river and lets the tap run continuously while performing wudhu, reasoning that "there is more than enough water here." Is this correct, applying Islamic teaching on israf?`,
      correct: "No — Islamic teaching discourages wasteful use of water even at an abundant source, since israf applies regardless of how much is available",
      wrong: [
        "Yes — israf only applies when a resource is scarce, not when it is abundant",
        "Yes — wudhu is exempt from any concern about water use",
        "No — but only because running water is always considered wasteful under any use",
      ],
      explanation: "The well-known example of not wasting water during wudhu even at a flowing river shows that israf applies regardless of how abundant a resource seems.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} cooks far more food than anyone can eat at every meal, and much of it is thrown away. What does this reflect, and what would be better?`,
      correct: "This reflects israf; planning meals to match what will actually be eaten would avoid the waste",
      wrong: [
        "This reflects generosity, since cooking extra food is always praised regardless of waste",
        "This has no connection to israf, since food waste is unrelated to Islamic teaching",
        "This is acceptable as long as the family can afford the extra food",
      ],
      explanation: "Cooking or serving more food than will be eaten is a direct example of israf — planning ahead to match actual need avoids this waste.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} leaves the television and lights on in an empty room every day, saying it "doesn't cost that much." Applying the teaching on israf, is this reasoning sound?`,
    correct: "No — israf is about the habit of wasteful use itself, not only about whether the cost feels significant",
    wrong: [
      "Yes — israf only applies when the cost of waste is very high",
      "Yes — electricity is not considered a resource covered by israf",
      "No — but only because televisions specifically are always forbidden in Islam",
    ],
    explanation: "Israf concerns the habit of wasteful use, regardless of whether the cost feels small — leaving electronics on unnecessarily is exactly the kind of everyday waste this teaching discourages.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} receives pocket money and spends all of it immediately on things not actually needed, with nothing saved. Applying the teaching on israf, what would be a wiser approach?`,
      correct: "Budget the money carefully, spending on what is needed and saving or giving part of it",
      wrong: [
        "Spend everything immediately, since money has no value until fully spent",
        "Refuse to spend any money at all, since any spending counts as israf",
        "Give away the money to whoever asks first, without any planning",
      ],
      explanation: "Careless spending on unnecessary things is a form of israf — thoughtful budgeting, including saving, reflects the moderation this teaching calls for.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that avoiding israf means a Muslim should never enjoy nice things or spend money on anything beyond bare survival. Evaluate this reasoning.`,
    correct: "Flawed — israf is about avoiding wasteful, careless use of resources, not about forbidding all enjoyment or reasonable spending",
    wrong: [
      "Sound — Islamic teaching on israf forbids any spending beyond bare survival",
      "Sound — moderation means the same thing as complete deprivation",
      "Flawed — israf actually has nothing to do with spending money at all",
    ],
    explanation: "Avoiding israf calls for moderation and thoughtful use of resources, not extreme deprivation — the teaching targets wastefulness, not reasonable enjoyment.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} makes a poster reminding classmates to turn off taps and lights when leaving a room. What prevention strategy for israf does this reflect?`,
      correct: "Using signage/reminders to encourage others to avoid wasteful habits",
      wrong: [
        "A strategy unrelated to israf, since posters have no effect on behaviour",
        "A punishment for those who have already wasted resources",
        "A method used only by teachers, never by learners",
      ],
      explanation: "Making posters or signage reminding others to avoid waste (e.g. turning off taps when not in use) is a suggested, practical way of guarding against israf.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says avoiding israf only matters for very wealthy people, since only they have enough resources to waste. Is this an accurate view?`,
    correct: "No — israf can apply to anyone's use of food, water, time, or money, regardless of how much they have",
    wrong: [
      "Yes — poorer households are automatically exempt from any concern about waste",
      "Yes — israf is only a concern in matters of large-scale wealth",
      "No — but only wealthy households ever actually commit israf in practice",
    ],
    explanation: "Israf concerns the habit of wasteful use itself — food, water, time, money — which applies to anyone's resources, not only those with great wealth.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that since Islam teaches moderation, saving every last coin and never spending on anything is the ideal Muslim habit. Evaluate this claim.`,
    correct: "Flawed — moderation means balanced, thoughtful use, not extreme hoarding or refusing all reasonable spending",
    wrong: [
      "Sound — Islamic teaching requires never spending money under any circumstance",
      "Sound — moderation and extreme hoarding mean exactly the same thing",
      "Flawed — but only because saving money is actually discouraged in Islam",
    ],
    explanation: "Moderation is a balance between wastefulness and extreme restriction — neither careless spending nor refusing all reasonable spending reflects the teaching on israf.",
  }),
];

export const israf: Skill = {
  id: "g6-ire-ak-israf",
  code: "AK.4",
  subjectId: "ire",
  strandId: "g6-ire-akhlaq",
  grade: 6,
  title: "Israf (Extravagance)",
  description: "Israf (extravagance/wastefulness): the Islamic call for moderation, everyday examples with food, water, money and electricity, and ways of guarding against waste.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, GUARD_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in a sensible order for guarding against israf.",
        items,
        correctOrder: GUARD_STEPS.map((s) => s.id),
        hint: "Guarding against israf starts with noticing waste and builds toward reminding others too.",
        explanation: GUARD_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const foodWater = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "food-water")).slice(0, 3);
      const moneyElectricity = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "money-electricity")).slice(0, 3);
      const principle = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "principle")).slice(0, 3);
      const chosen = shuffle(rng, [...foodWater, ...moneyElectricity, ...principle]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["food-water", "money-electricity", "principle"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about food/water waste, some about money/electricity waste, and some about the general principle.",
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
        hint: "Think about what each term refers to in the teaching on israf.",
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
        hint: "Think about whether the situation shows wasteful use or thoughtful, moderate use of a resource.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Israf means extravagance or", after: ".", answer: "wastefulness", accepted: ["wastefulness"] },
      { before: "Islamic teaching calls for moderation even in things that are permitted and", after: ".", answer: "abundant", accepted: ["abundant"] },
      { before: "A well-known example is not using excessive water even while performing", after: ".", answer: "wudhu", accepted: ["wudhu"] },
      { before: "Avoiding israf is described as a way to earn", after: "from Allah.", answer: "reward", accepted: ["reward"] },
      { before: "Cooking or serving more food than will be", after: "wastes that resource.", answer: "eaten", accepted: ["eaten"] },
      { before: "Leaving taps running unnecessarily wastes", after: ".", answer: "water", accepted: ["water"] },
      { before: "Spending money carelessly on unnecessary things is a form of", after: ".", answer: "israf", accepted: ["israf"] },
      { before: "Leaving lights or a television on when not in use wastes", after: ".", answer: "electricity", accepted: ["electricity"] },
      { before: "Careful", after: "of money helps avoid wasteful spending.", answer: "budgeting", accepted: ["budgeting"] },
      { before: "Israf applies regardless of how much of a resource is", after: ".", answer: "available", accepted: ["available"] },
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
      hint: "Recall what israf means and the everyday examples of avoiding it.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
