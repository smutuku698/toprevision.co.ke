import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGES: { id: string; topic: string; text: string }[] = [
  {
    id: "mashujaa",
    topic: "Mashujaa Day 2023",
    text: "Kenya celebrates Mashujaa Day on 20th October each year, honouring heroes who fought for the country's independence and those who continue to serve the nation with integrity. During the 2023 celebrations at Nyayo Stadium, leaders called on young people to practise honesty and accountability. Over ten thousand people attended the event, including student leaders from schools across the country.",
  },
  {
    id: "fatuma",
    topic: "Fatuma Ali's leadership",
    text: "Fatuma Ali was elected as the first female head girl of her school in 2022. She introduced a peer-mentorship programme that paired every Form One pupil with a Form Four leader. Under her leadership, the school's debate club won the regional championship for three years in a row. Teachers praised her for listening carefully to pupils' concerns before making decisions.",
  },
  {
    id: "musyoka",
    topic: "Chief Musyoka's leadership",
    text: "Chief Musyoka has led Kavutiri village for fifteen years. He is known for resolving land disputes fairly and organising monthly barazas where residents can raise concerns directly. Last year, he mobilised over two hundred villagers to build a new footbridge across the seasonal river, cutting the children's walk to school by half.",
  },
  {
    id: "ngcdf",
    topic: "NG-CDF public participation",
    text: "The National Government Constituency Development Fund requires each constituency committee to hold public participation forums before approving new projects. In Turkana North, the committee approved fourteen new boreholes in 2024 after hearing directly from residents about water shortages. Good leaders, the committee chairman explained, listen to the people they serve.",
  },
];

const FACT_QUESTIONS: { passageId: string; q: string; correct: string; distractors: string[] }[] = [
  { passageId: "mashujaa", q: "On what date is Mashujaa Day celebrated in Kenya?", correct: "20th October", distractors: ["1st June", "12th December", "10th October"] },
  { passageId: "fatuma", q: "In what year was Fatuma Ali elected head girl?", correct: "2022", distractors: ["2019", "2020", "2024"] },
  { passageId: "musyoka", q: "For how many years has Chief Musyoka led Kavutiri village?", correct: "Fifteen years", distractors: ["Five years", "Twenty years", "Ten years"] },
  { passageId: "ngcdf", q: "How many new boreholes did the Turkana North committee approve in 2024?", correct: "Fourteen", distractors: ["Four", "Forty", "Twenty-four"] },
];

const FILL_FACTS: { passageId: string; before: string; after: string; correctAnswer: string }[] = [
  { passageId: "mashujaa", before: "Mashujaa Day is celebrated in Kenya on ", after: " each year.", correctAnswer: "20th October" },
  { passageId: "fatuma", before: "Fatuma Ali was elected head girl in ", after: ".", correctAnswer: "2022" },
  { passageId: "musyoka", before: "Chief Musyoka has led Kavutiri village for ", after: ".", correctAnswer: "fifteen years" },
  { passageId: "ngcdf", before: "In 2024, the Turkana North committee approved ", after: " new boreholes.", correctAnswer: "fourteen" },
];

const KEY_FACTS: { passageId: string; fact: string }[] = [
  { passageId: "mashujaa", fact: "Celebrated on 20th October, with over ten thousand people attending the 2023 event at Nyayo Stadium" },
  { passageId: "fatuma", fact: "Elected head girl in 2022 and led the debate club to three regional championships in a row" },
  { passageId: "musyoka", fact: "Has led the village for fifteen years and mobilised two hundred villagers to build a footbridge" },
  { passageId: "ngcdf", fact: "Approved fourteen new boreholes in Turkana North in 2024 after public forums" },
];

const GS_ITEMS: { text: string; type: "general" | "specific" }[] = [
  { text: "Kenya has many respected leaders.", type: "general" },
  { text: "Leaders spoke at Nyayo Stadium on Mashujaa Day 2023.", type: "specific" },
  { text: "Good leaders listen to the people they serve.", type: "general" },
  { text: "Chief Musyoka has led Kavutiri village for fifteen years.", type: "specific" },
  { text: "Leadership requires honesty and accountability.", type: "general" },
  { text: "Fatuma Ali introduced a peer-mentorship programme in 2022.", type: "specific" },
  { text: "Community leaders often organise meetings.", type: "general" },
  { text: "The Turkana North committee approved fourteen new boreholes in 2024.", type: "specific" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is selective listening an important skill when following a speech about leadership?",
    correct: "It helps the listener pick out key facts and figures without getting lost in every detail",
    distractors: ["It means ignoring everything the speaker says", "It is only useful for very short speeches", "It prevents the listener from understanding the topic"],
  },
  {
    q: "What is the main difference between general and specific information in a listening text?",
    correct: "General information gives a broad idea, while specific information gives exact facts such as names, dates, or numbers",
    distractors: ["General information is always false", "Specific information is always about people only", "There is no real difference between them"],
  },
];

function findPassage(id: string) {
  return PASSAGES.find((p) => p.id === id)!;
}

export const selectiveListening: Skill = {
  id: "g7-eng-ls-selective-listening",
  code: "LS.4",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Listening Comprehension: Selective Listening",
  description: "Distinguish specific from general information, select specific information, and listen and respond to texts on leadership.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc-fact", "fill", "match", "concept"] as const);
    const hint = "Selective listening means picking out the exact facts, such as names, numbers, and dates, rather than only the general idea.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, GS_ITEMS).slice(0, 6);
      const items = chosen.map((g, i) => ({ id: `g${i}`, label: g.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((g, i) => (correctBucket[`g${i}`] = g.type));
      return {
        kind: "categorize",
        prompt: "Sort each statement into General or Specific information.",
        items,
        buckets: [
          { id: "general", label: "General information" },
          { id: "specific", label: "Specific information" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((g) => `"${g.text}" is ${g.type} information.`).join(" "),
      };
    }

    if (branch === "mc-fact") {
      const entry = randChoice(rng, FACT_QUESTIONS);
      const passage = findPassage(entry.passageId);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `According to the passage, the correct specific fact is "${entry.correct}".`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_FACTS);
      const passage = findPassage(entry.passageId);
      return {
        kind: "fill-blank",
        prompt: "Listen carefully (read the passage) and fill in the exact fact that is missing.",
        passage: passage.text,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Find the exact name, date, or number in the passage above.",
        explanation: `The passage states: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, KEY_FACTS);
      const topicOf = (id: string) => findPassage(id).topic;
      const tokens = shuffle(rng, chosen.map((k) => ({ id: k.passageId, label: topicOf(k.passageId) })));
      const targets = shuffle(rng, chosen.map((k) => ({ id: k.passageId, label: k.fact })));
      const correctMap: Record<string, string> = {};
      for (const k of chosen) correctMap[k.passageId] = k.passageId;
      return {
        kind: "click-match",
        prompt: "Match each topic to the specific fact it is best known for.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((k) => `${topicOf(k.passageId)}: ${k.fact}`).join(" "),
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
