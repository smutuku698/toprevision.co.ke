import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS: { term: string; meaning: string }[] = [
  { term: "Sri Sukhmani Sahib", meaning: "A composition within the Sri Guru Granth Sahib ji, whose name means 'Prayer of Peace'" },
  { term: "Ashtpadi", meaning: "A hymn or section made up of eight stanzas" },
  { term: "Sri Guru Granth Sahib ji", meaning: "The central scripture and living guide of the Sikh faith" },
];

const MATCH_PROMPTS = [
  "Match each term to what it means.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning that fits it.",
  "Match each Sikh scripture term to its explanation.",
  "Link each term with the correct definition.",
  "Choose the correct meaning for each term below.",
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is Sri Sukhmani Sahib?",
    correct: "A composition within the Sri Guru Granth Sahib ji whose name means 'Prayer of Peace'",
    distractors: ["A separate holy book from the Sri Guru Granth Sahib ji", "A daily prayer recited only by priests", "A collection of historical dates"],
  },
  {
    q: "What is an Ashtpadi in the Sri Guru Granth Sahib ji?",
    correct: "A hymn or section made up of eight stanzas",
    distractors: ["A type of musical instrument", "A ceremony performed at a Gurdwara", "A daily fasting period"],
  },
  {
    q: "Why do Sikhs study passages like Ashtpadi 17-24 of Sri Sukhmani Sahib?",
    correct: "To gain guidance and deeper spiritual understanding for daily life",
    distractors: ["To learn the history of neighbouring countries", "To prepare for public exams", "To memorise a list of festivals"],
  },
  {
    q: "What role do the Sikh Scriptures play in a Sikh's life?",
    correct: "They serve as a living guide, offering guidance and spiritual direction",
    distractors: ["They are read only once during a lifetime", "They are used only during weddings", "They are stored away and never read"],
  },
];

export const sikhScriptures: Skill = {
  id: "hre-s-sikh-scriptures",
  code: "S.1",
  subjectId: "hre",
  strandId: "hre-scriptures",
  grade: 9,
  title: "Sikh Scriptures",
  description: "Answer questions about Sri Sukhmani Sahib in Sri Guru Granth Sahib ji.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Sri Sukhmani Sahib is a section of the Sri Guru Granth Sahib ji, built up of hymns called Ashtpadis.",
        explanation: TERMS.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Sri Sukhmani Sahib is a section of the Sri Guru Granth Sahib ji, built up of hymns called Ashtpadis.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
