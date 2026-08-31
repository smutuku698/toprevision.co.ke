import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Group = "choosing" | "lasting" | "attention";

const PHRASAL_VERBS: { verb: string; meaning: string; sentence: string; group: Group }[] = [
  { verb: "try on", meaning: "to put on clothing to see if it fits", sentence: "Before buying the jacket, she decided to ___ a smaller size.", group: "choosing" },
  { verb: "put on", meaning: "to place a piece of clothing on your body", sentence: "She hurried to ___ her new sneakers before the bell rang.", group: "choosing" },
  { verb: "pick out", meaning: "to choose something carefully from a group", sentence: "It took her ages to ___ the perfect outfit for the interview.", group: "choosing" },
  { verb: "dress up", meaning: "to wear special or formal clothes", sentence: "The students chose to ___ for the school's fashion show.", group: "choosing" },
  { verb: "go with", meaning: "to match or suit something else", sentence: "These sandals really ___ that summer dress.", group: "lasting" },
  { verb: "fall apart", meaning: "to break into pieces because of wear or poor quality", sentence: "The cheap belt began to ___ after only two weeks.", group: "lasting" },
  { verb: "wear out", meaning: "to become damaged or unusable through continued use", sentence: "His favourite trainers finally began to ___ after years of daily use.", group: "lasting" },
  { verb: "throw away", meaning: "to discard something no longer wanted", sentence: "He decided to ___ the torn shirt instead of mending it again.", group: "lasting" },
  { verb: "take after", meaning: "to resemble a parent or relative in appearance or character", sentence: "Everyone says he loves bold prints because he ___ his stylish grandmother.", group: "attention" },
  { verb: "stand out", meaning: "to be noticeably different or better than others", sentence: "Her bright kitenge design made her ___ at the graduation ceremony.", group: "attention" },
  { verb: "show off", meaning: "to display something proudly to impress others", sentence: "He loves to ___ his new limited-edition sneakers.", group: "attention" },
  { verb: "keep up with", meaning: "to stay updated or not fall behind", sentence: "It can be expensive to ___ the latest fashion trends every season.", group: "attention" },
  { verb: "catch up", meaning: "to reach the same standard or level as others", sentence: "After missing a whole season, the boutique had to ___ with current styles.", group: "attention" },
  { verb: "hand down", meaning: "to pass an item from an older person to a younger one", sentence: "The beaded necklace was ___ from mother to daughter for generations.", group: "attention" },
] as const;

const GROUP_LABEL: Record<Group, string> = {
  choosing: "About choosing or putting on clothes",
  lasting: "About how clothes look, match, or last",
  attention: "About people, trends, or attention",
};

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How are most phrasal verbs formed?",
    correct: "By combining a verb with one or more particles (small words like 'up', 'on', 'out', or 'down')",
    distractors: [
      "By joining two nouns together",
      "By adding a prefix to an adjective",
      "By combining two verbs with the same meaning",
    ],
  },
  {
    q: "How can one usually tell the meaning of a phrasal verb?",
    correct: "By learning it as a whole unit, since its meaning is often different from the individual words",
    distractors: [
      "By translating each word separately and adding the meanings together",
      "By ignoring the particle completely",
      "Phrasal verbs always mean exactly what the main verb alone means",
    ],
  },
  {
    q: "Why do phrasal verbs help make conversations more interesting?",
    correct: "They sound natural and are commonly used in everyday spoken English",
    distractors: [
      "They are only used in very formal academic writing",
      "They make sentences longer without adding any meaning",
      "They are rarely used by native speakers",
    ],
  },
];

export const phrasalVerbs: Skill = {
  id: "g8-eng-g-phrasal-verbs",
  code: "G.12",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Phrasal Verbs",
  description: "Identify phrasal verbs and use them correctly in sentences about fashion and style.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "mc", "concept"] as const);
    const hint = "Read the sentence with the phrasal verb in place — its meaning often differs from the verb alone.";

    if (branch === "match") {
      const chosen = shuffle(rng, PHRASAL_VERBS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.verb, label: p.verb })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.verb, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.verb] = p.verb;
      return {
        kind: "click-match",
        prompt: "Match each phrasal verb to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.verb}" means ${p.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const groups: Group[] = ["choosing", "lasting", "attention"];
      const chosen = shuffle(rng, groups.flatMap((g) => shuffle(rng, PHRASAL_VERBS.filter((p) => p.group === g)).slice(0, 2)));
      const buckets = groups.map((g) => ({ id: g, label: GROUP_LABEL[g] }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.verb }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.group));
      return {
        kind: "categorize",
        prompt: "Sort each phrasal verb by what it is mainly about.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the verb is about choosing/wearing clothes, how clothes look or last, or people and trends.",
        explanation: chosen.map((c) => `"${c.verb}" (${c.meaning}) fits: ${GROUP_LABEL[c.group].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, PHRASAL_VERBS);
      return {
        kind: "fill-blank",
        prompt: `Fill in the phrasal verb meaning "${entry.meaning}" to complete the sentence.`,
        before: entry.sentence.split("___")[0],
        after: entry.sentence.split("___")[1],
        correctAnswer: entry.verb,
        inputMode: "text",
        hint,
        explanation: `"${entry.verb}" means "${entry.meaning}": "${entry.sentence.replace("___", entry.verb)}"`,
      };
    }

    if (branch === "mc") {
      const entry = randChoice(rng, PHRASAL_VERBS);
      const distractorPool = PHRASAL_VERBS.filter((p) => p.verb !== entry.verb);
      const distractors = shuffle(rng, distractorPool).slice(0, 3).map((d) => d.verb);
      const choices = shuffle(rng, [entry.verb, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Choose the phrasal verb that means "${entry.meaning}" and completes this sentence: "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.verb),
        layout: "list",
        hint,
        explanation: `"${entry.verb}" means "${entry.meaning}", so the sentence reads: "${entry.sentence.replace("___", entry.verb)}"`,
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
