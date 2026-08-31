import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COMMA_ITEMS: { correct: string; distractors: string[] }[] = [
  {
    correct: "The scientist tested oxygen, nitrogen, and carbon dioxide in the lab.",
    distractors: [
      "The scientist tested oxygen nitrogen, and carbon dioxide in the lab.",
      "The scientist tested, oxygen nitrogen and carbon dioxide in the lab.",
      "The scientist tested oxygen, nitrogen and, carbon dioxide in the lab.",
    ],
  },
  {
    correct: "After months of testing, the invention finally worked.",
    distractors: [
      "After months of testing the invention, finally worked.",
      "After months, of testing the invention finally worked.",
      "After months of testing the invention finally, worked.",
    ],
  },
  {
    correct: "The prototype failed, but the engineers learned valuable lessons.",
    distractors: [
      "The prototype failed but, the engineers learned valuable lessons.",
      "The prototype failed but the engineers, learned valuable lessons.",
      "The prototype, failed but the engineers learned valuable lessons.",
    ],
  },
  {
    correct: "Dr. Wanjiru, the lead researcher, presented the new solar charger.",
    distractors: [
      "Dr. Wanjiru the lead researcher, presented the new solar charger.",
      "Dr. Wanjiru, the lead researcher presented the new solar charger.",
      "Dr. Wanjiru the lead researcher presented, the new solar charger.",
    ],
  },
];

const APOSTROPHE_ITEMS: { text: string; type: "possession" | "contraction" }[] = [
  { text: "the engineer's report", type: "possession" },
  { text: "the robot's arm", type: "possession" },
  { text: "the students' project", type: "possession" },
  { text: "the laboratory's equipment", type: "possession" },
  { text: "it's a breakthrough invention", type: "contraction" },
  { text: "they're testing a new drone", type: "contraction" },
  { text: "don't touch the exposed wires", type: "contraction" },
  { text: "we've built a working prototype", type: "contraction" },
];

const CAPITAL_RULES: { rule: string; example: string }[] = [
  { rule: "Begin every sentence with a capital letter", example: "The team launched the satellite yesterday." },
  { rule: "Capitalise proper nouns (specific names of people, places, and organisations)", example: "Dr. Wangari Maathai founded the Green Belt Movement in Kenya." },
  { rule: "Capitalise the pronoun 'I'", example: "When I finish the experiment, I will publish the results." },
  { rule: "Capitalise the first word of a direct quotation", example: "The engineer said, \"The bridge design is complete.\"" },
];

const ITS_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "The laboratory tested the new drone, and", after: "battery lasted six hours during the flight.", correctAnswer: "its", acceptedAnswers: ["its"] },
  { before: "The engineer said", after: "important to record every observation carefully.", correctAnswer: "it's", acceptedAnswers: ["it's", "it is"] },
  { before: "The solar panel lost", after: "charge after the storm damaged the wiring.", correctAnswer: "its", acceptedAnswers: ["its"] },
  { before: "Everyone agrees that", after: "a remarkable invention for rural clinics.", correctAnswer: "it's", acceptedAnswers: ["it's", "it is"] },
];

const MEANING_EXAMPLES: { a: string; b: string; question: string; correct: "a" | "b"; explanation: string }[] = [
  {
    a: "Let's eat, Grandma!",
    b: "Let's eat Grandma!",
    question: "Which sentence correctly invites Grandma to come and eat, rather than suggesting the family eat Grandma herself?",
    correct: "a",
    explanation: "The comma before \"Grandma\" shows she is being spoken to directly. Without the comma, the sentence reads as if the family plans to eat Grandma — punctuation changes the whole meaning.",
  },
  {
    a: "I helped my uncle Jack up the car.",
    b: "I helped my uncle, Jack, up the car.",
    question: "Which sentence means the writer helped a person named Jack to lift the car?",
    correct: "b",
    explanation: "The commas around \"Jack\" show it renames \"uncle\" — the writer's uncle, named Jack, was helped to lift the car. Without the commas, \"Jack up\" reads as the phrasal verb meaning \"to lift with a jack\", changing the meaning completely.",
  },
];

export const punctuation: Skill = {
  id: "g8-eng-w-punctuation",
  code: "W.2",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Mechanics of Writing: Punctuation",
  description: "Use commas, apostrophes, and capital letters correctly, and recognise how punctuation changes meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["comma-mc", "apostrophe-categorize", "capital-match", "its-fill", "meaning-mc"] as const);
    const hint = "Commas separate items and clauses, apostrophes show possession or missing letters, and capital letters start sentences, quotations, and proper nouns.";

    if (branch === "comma-mc") {
      const entry = randChoice(rng, COMMA_ITEMS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence uses commas correctly?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correctly punctuated sentence is: "${entry.correct}"`,
      };
    }

    if (branch === "apostrophe-categorize") {
      const possession = shuffle(rng, APOSTROPHE_ITEMS.filter((i) => i.type === "possession")).slice(0, 3);
      const contraction = shuffle(rng, APOSTROPHE_ITEMS.filter((i) => i.type === "contraction")).slice(0, 3);
      const items = shuffle(rng, [...possession, ...contraction]).map((i, idx) => ({ id: `a${idx}`, label: i.text, type: i.type }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.type;
      return {
        kind: "categorize",
        prompt: "Sort each phrase by how its apostrophe is used: to show Possession or to form a Contraction.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "possession", label: "Possession" },
          { id: "contraction", label: "Contraction" },
        ],
        correctBucket,
        hint: "Possession shows ownership (the robot's arm). A contraction is two words shortened into one, with the apostrophe replacing missing letters (it's = it is).",
        explanation: `Possession: ${possession.map((p) => p.text).join(" / ")}. Contraction: ${contraction.map((c) => c.text).join(" / ")}.`,
      };
    }

    if (branch === "capital-match") {
      const tokens = shuffle(rng, CAPITAL_RULES.map((r, i) => ({ id: `r${i}`, label: r.rule })));
      const targets = shuffle(rng, CAPITAL_RULES.map((r, i) => ({ id: `r${i}`, label: r.example })));
      const correctMap: Record<string, string> = {};
      CAPITAL_RULES.forEach((_, i) => (correctMap[`r${i}`] = `r${i}`));
      return {
        kind: "click-match",
        prompt: "Match each capitalisation rule to an example that follows it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CAPITAL_RULES.map((r) => `${r.rule}: "${r.example}"`).join(" "),
      };
    }

    if (branch === "its-fill") {
      const entry = randChoice(rng, ITS_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word: 'its' (possessive) or \"it's\" (short for 'it is').",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint: "'Its' shows possession, with no apostrophe. \"It's\" is a contraction of 'it is', and always has an apostrophe.",
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}" — ${entry.correctAnswer === "its" ? "'its' shows possession here, so it takes no apostrophe." : "\"it's\" is short for 'it is' here, so it needs the apostrophe."}`,
      };
    }

    const entry = randChoice(rng, MEANING_EXAMPLES);
    const choices = shuffle(rng, [entry.a, entry.b]);
    const correctText = entry.correct === "a" ? entry.a : entry.b;
    return {
      kind: "multiple-choice",
      prompt: entry.question,
      choices,
      correctIndex: choices.indexOf(correctText),
      layout: "list",
      hint: "Read both sentences carefully — a single comma can completely change who or what is being addressed.",
      explanation: entry.explanation,
    };
  },
};
