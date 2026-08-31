import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGES: { id: string; topic: string; text: string; mainIdea: string; details: string[]; keyword: string; acceptedKeywords?: string[] }[] = [
  {
    id: "market",
    topic: "Wakulima Market",
    text: "Nakuru's Wakulima Market comes alive early every morning. Traders arrange bright tomatoes, onions, and mangoes in neat pyramids along the aisles. Buyers haggle cheerfully over prices, while porters wheel handcarts loaded with sacks of maize. By midday, the market is crowded, noisy, and full of colour.",
    mainIdea: "Wakulima Market is a busy, colourful place full of activity every morning.",
    details: [
      "Traders arrange tomatoes, onions, and mangoes in pyramids.",
      "Buyers haggle cheerfully over prices.",
      "Porters wheel handcarts loaded with sacks of maize.",
    ],
    keyword: "Wakulima Market",
  },
  {
    id: "migration",
    topic: "The wildebeest migration",
    text: "As the sun rises over the Maasai Mara, a herd of wildebeest crosses the Mara River in a thundering rush. Crocodiles lie hidden beneath the surface, waiting patiently. Tourists in safari vehicles watch in stunned silence, cameras raised. The annual wildebeest migration is one of nature's most dramatic spectacles.",
    mainIdea: "The wildebeest migration across the Mara River is a dramatic natural spectacle.",
    details: [
      "A herd of wildebeest crosses the Mara River.",
      "Crocodiles wait hidden beneath the surface.",
      "Tourists watch from safari vehicles with cameras raised.",
    ],
    keyword: "the wildebeest migration",
  },
  {
    id: "sportsday",
    topic: "Green Hills Primary's sports day",
    text: "Green Hills Primary School's sports day began with a colourful march past by every class. Athletes lined up nervously for the 100-metre race, while parents cheered from the shaded stands. The tug-of-war between Form Two and Form Three drew the loudest applause of the day. By the closing ceremony, pupils were already looking forward to next year's competition.",
    mainIdea: "Green Hills Primary School held an exciting, well-attended sports day.",
    details: [
      "Every class took part in a march past.",
      "Athletes lined up for the 100-metre race.",
      "The tug-of-war between Form Two and Form Three drew loud applause.",
    ],
    keyword: "sports day",
  },
  {
    id: "tana",
    topic: "The Tana River",
    text: "The Tana River winds through several counties before reaching the Indian Ocean. Fishermen paddle wooden canoes along its banks each morning, casting nets for tilapia. Farmers depend on its waters to irrigate rice paddies during the dry season. For thousands of families, the river is the backbone of daily life.",
    mainIdea: "The Tana River is central to the daily lives of the communities along its banks.",
    details: [
      "Fishermen paddle canoes and cast nets for tilapia.",
      "Farmers use its waters to irrigate rice paddies.",
      "It flows through several counties to the Indian Ocean.",
    ],
    keyword: "the Tana River",
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to identify the main idea of a talk or passage before focusing on its details?",
    correct: "The main idea gives an overall understanding that helps the listener make sense of every detail that follows",
    distractors: ["Details are always more important than the main idea", "The main idea is usually unrelated to the details", "Listening for the main idea wastes time better spent memorising every word"],
  },
  {
    q: "What is a 'signal phrase' such as 'this talk is about...' or 'today, I will describe...' used for in a listening text?",
    correct: "It tells the listener the overall topic or main idea before the details are given",
    distractors: ["It is only used at the very end of a talk", "It introduces an unrelated topic to confuse listeners", "It replaces the need for any supporting details"],
  },
];

export const listeningForMainIdea: Skill = {
  id: "g7-eng-ls-listening-for-main-idea",
  code: "LS.3",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Listening for the Main Idea",
  description: "Identify the main idea and pick out specific information from varied descriptive texts.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc-summary", "match", "fill", "concept"] as const);
    const hint = "The main idea sums up what the whole passage is mostly about; supporting details are the smaller facts that back it up.";

    if (branch === "categorize") {
      const passage = randChoice(rng, PASSAGES);
      const items = shuffle(rng, [
        { id: "main", label: passage.mainIdea },
        ...passage.details.map((d, i) => ({ id: `d${i}`, label: d })),
      ]);
      const correctBucket: Record<string, string> = { main: "main" };
      passage.details.forEach((_, i) => (correctBucket[`d${i}`] = "detail"));
      return {
        kind: "categorize",
        prompt: "Sort each sentence into Main Idea or Supporting Detail.",
        passage: passage.text,
        items,
        buckets: [
          { id: "main", label: "Main idea" },
          { id: "detail", label: "Supporting detail" },
        ],
        correctBucket,
        hint,
        explanation: `"${passage.mainIdea}" is the main idea — it sums up the whole passage. The other sentences are supporting details that back it up.`,
      };
    }

    if (branch === "mc-summary") {
      const passage = randChoice(rng, PASSAGES);
      const otherPassage = randChoice(rng, PASSAGES.filter((p) => p.id !== passage.id));
      const detailOptions = shuffle(rng, passage.details).slice(0, 2);
      const choices = shuffle(rng, [passage.mainIdea, ...detailOptions, otherPassage.mainIdea]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence best summarises the main idea of this passage?",
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.mainIdea),
        layout: "list",
        hint: "The best summary covers the whole passage, not just one small detail.",
        explanation: `"${passage.mainIdea}" is the best summary because it covers the whole passage, not just one detail.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, PASSAGES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.topic })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.mainIdea })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Match each topic to the main idea that best describes it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `${p.topic}: ${p.mainIdea}`).join(" "),
      };
    }

    if (branch === "fill") {
      const passage = randChoice(rng, PASSAGES);
      return {
        kind: "fill-blank",
        prompt: "Complete the signal phrase that introduces the topic of this passage.",
        passage: passage.text,
        before: "This talk is mainly about ",
        after: ".",
        correctAnswer: passage.keyword,
        acceptedAnswers: passage.acceptedKeywords,
        inputMode: "text",
        hint: "Think of the shortest phrase that names what the whole passage describes.",
        explanation: `The passage is mainly about ${passage.keyword}, since every detail in it relates back to that topic.`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
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
