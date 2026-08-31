import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type ItemCategory = "component" | "technique";

const FLUENCY_ITEMS: { name: string; category: ItemCategory; description: string }[] = [
  { name: "Accuracy", category: "component", description: "Reading each word correctly, without mistakes or skipped words" },
  { name: "Reading rate", category: "component", description: "Reading at a pace that is neither too slow nor too rushed, matching natural speech" },
  { name: "Expression", category: "component", description: "Using tone, stress, and pausing that reflect the meaning and feeling of the text" },
  { name: "Readers' theatre", category: "technique", description: "Learners read a script aloud in character, using voice alone to bring dialogue to life" },
  { name: "Paired reading", category: "technique", description: "Two learners take turns reading the same passage aloud, supporting each other" },
  { name: "Echo reading", category: "technique", description: "A learner repeats a line right after a model reader, copying the pace and expression" },
  { name: "Choral reading", category: "technique", description: "A whole class or group reads the same text aloud together in unison" },
];

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  component: "Fluency component",
  technique: "Fluency-building technique",
};

const ORDER_STEPS = [
  { id: "preview", label: "Preview the text and note any difficult or unfamiliar words before reading aloud" },
  { id: "silent", label: "Read the text silently first to understand its meaning and tone" },
  { id: "accuracy", label: "Practise reading aloud slowly, focusing on accuracy first" },
  { id: "natural", label: "Reread the passage at a natural pace, adding appropriate expression" },
  { id: "perform", label: "Share the reading fluently, adjusting speed and stress to fit the meaning" },
];

const FIX_ITEMS: { desc: string; fix: string; distractors: string[] }[] = [
  {
    desc: "Kevin read the anti-drug awareness poem in a flat monotone voice, rushing through every line without pausing, even during the emotional final stanza.",
    fix: "Expression",
    distractors: ["Accuracy", "Choral reading", "Paired reading"],
  },
  {
    desc: "Faith stumbled over several words in the passage about resisting peer pressure, often reading the wrong word entirely and confusing her listeners.",
    fix: "Accuracy",
    distractors: ["Expression", "Reading rate", "Echo reading"],
  },
  {
    desc: "Otieno read the warning notice about substance abuse so quickly that his classmates could not follow what he was saying.",
    fix: "Reading rate",
    distractors: ["Accuracy", "Readers' theatre", "Choral reading"],
  },
  {
    desc: "A shy new learner was too nervous to read the drug-awareness dialogue alone, so his teacher had him read each line just after a confident classmate modelled it first.",
    fix: "Echo reading",
    distractors: ["Choral reading", "Paired reading", "Reading rate"],
  },
  {
    desc: "The class wanted every learner to practise the same anti-drug poem's rhythm and pace together, without anyone reading alone in front of the class.",
    fix: "Choral reading",
    distractors: ["Readers' theatre", "Echo reading", "Accuracy"],
  },
  {
    desc: "Two classmates wanted to build each other's confidence, so they took turns reading paragraphs of a passage about saying no to drugs, helping each other with tricky words.",
    fix: "Paired reading",
    distractors: ["Choral reading", "Expression", "Reading rate"],
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is reading fluency important when reading aloud a warning about drug and substance abuse?",
    correct: "Fluent, expressive reading helps the listener understand the seriousness of the message and stay engaged",
    distractors: [
      "Fluency only matters when reading fictional stories, never serious warnings",
      "Fluent reading always requires reading as fast as possible",
      "Fluency has no real effect on how a listener understands a message",
    ],
  },
  {
    q: "What is the main difference between reading accuracy and reading expression?",
    correct: "Accuracy means reading the words correctly, while expression means using tone and stress to convey meaning and feeling",
    distractors: [
      "Accuracy and expression mean exactly the same thing",
      "Accuracy is about speed, while expression is about correct spelling",
      "Expression means reading as loudly as possible at all times",
    ],
  },
  {
    q: "Why might a class use choral reading when practising a passage about resisting peer pressure to use drugs?",
    correct: "Reading together builds confidence and lets every learner practise pace and expression as a group",
    distractors: [
      "Choral reading is only used for reading numbers aloud",
      "It ensures only the strongest reader in the class is ever heard",
      "It removes the need for anyone to understand the passage's meaning",
    ],
  },
  {
    q: "What happens to a listener's understanding when a reader reads a serious passage far too fast, without pausing?",
    correct: "The listener struggles to follow the meaning, since there is no time to process pauses or emphasis",
    distractors: [
      "The listener understands the passage more clearly and quickly",
      "Reading speed has no effect at all on a listener's understanding",
      "The passage automatically becomes more accurate when read faster",
    ],
  },
  {
    q: "A learner reads every word of a passage correctly but in a flat, expressionless voice. What fluency component is this learner missing?",
    correct: "Expression — using tone, stress, and pausing to reflect the text's meaning and feeling",
    distractors: [
      "Accuracy — reading each word correctly without mistakes",
      "Nothing — reading every word correctly is the only requirement for fluency",
      "Choral reading — reading the same text together as a group",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Reading each word correctly without errors is called reading ", after: ".", correctAnswer: "accuracy" },
  { before: "Reading at a pace that matches natural speech, not too fast or too slow, is called reading ", after: ".", correctAnswer: "rate", acceptedAnswers: ["speed", "reading rate"] },
  { before: "Using tone, stress, and pauses that reflect a text's meaning and feeling is called reading with ", after: ".", correctAnswer: "expression" },
  { before: "When a whole class reads the same passage aloud together in unison, this technique is called ", after: " reading.", correctAnswer: "choral" },
  { before: "When a learner repeats a line right after a model reader, copying the pace and expression, this is called ", after: " reading.", correctAnswer: "echo" },
];

export const readingFluencyExpression: Skill = {
  id: "g7-eng-r-reading-fluency-expression",
  code: "R.6",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Reading Fluency: Speed, Accuracy and Expression",
  description: "Identify instances of expressive reading, read a text at the right speed, accurately and with expression, and appreciate the importance of reading fluency in communication.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "fix", "order", "fill", "concept"] as const);
    const hint = "Reading fluency combines three components — accuracy, rate, and expression — often built through techniques like paired, echo, or choral reading.";

    if (branch === "categorize") {
      const components = shuffle(rng, FLUENCY_ITEMS.filter((f) => f.category === "component"));
      const techniques = shuffle(rng, FLUENCY_ITEMS.filter((f) => f.category === "technique")).slice(0, 3);
      const chosen = shuffle(rng, [...components, ...techniques]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: "Sort each item into Fluency component or Fluency-building technique.",
        items,
        buckets: [
          { id: "component", label: CATEGORY_LABEL.component },
          { id: "technique", label: CATEGORY_LABEL.technique },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.name}" is a ${CATEGORY_LABEL[f.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, FLUENCY_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.name, label: f.name })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.name, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.name] = f.name;
      return {
        kind: "click-match",
        prompt: "Match each reading fluency term to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((f) => `${f.name} — ${f.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fix") {
      const entry = randChoice(rng, FIX_ITEMS);
      const choices = shuffle(rng, [entry.fix, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${entry.desc} Which fluency component or technique is most relevant here?`,
        choices,
        correctIndex: choices.indexOf(entry.fix),
        layout: "list",
        hint: "Decide whether the description is missing accuracy, rate, or expression — or whether it describes a specific reading technique.",
        explanation: `${entry.fix} best fits this situation.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps a learner follows when practising to read a passage fluently, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Understanding comes before accuracy, and accuracy comes before adding natural pace and expression.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about reading fluency.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
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
