import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each teaching from Surah al-Hujurat to what it means.",
  "Pair each teaching with the meaning that fits it.",
  "Connect each teaching below to what it means.",
  "Match each teaching from Surah al-Hujurat to its correct meaning.",
  "Link each teaching to the explanation that fits it.",
  "Choose the correct meaning for each teaching from Surah al-Hujurat.",
];

const TEACHINGS: { teaching: string; meaning: string }[] = [
  { teaching: "Verify before you believe", meaning: "Check the truth of a report before acting on it, especially from an unreliable source" },
  { teaching: "Nations and tribes", meaning: "Allah made people into different nations and tribes so that they may come to know one another" },
  { teaching: "Avoid mockery", meaning: "Do not ridicule others, since one group may be better than another in ways not visible" },
  { teaching: "Avoid suspicion and backbiting", meaning: "Do not spy on others or speak badly of them behind their backs" },
  { teaching: "True honour", meaning: "Righteousness (taqwa) determines honour before Allah, not tribe, wealth, or nationality" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does Surah al-Hujurat teach about verifying news?",
    correct: "To check the truth of any report before acting on it, especially from an unreliable source",
    distractors: ["To always believe rumours immediately", "To ignore any news from other communities", "To only trust news shared by family"],
  },
  {
    q: "According to Surah al-Hujurat, why did Allah make people into different nations and tribes?",
    correct: "So that they may come to know one another",
    distractors: ["So that they may compete for wealth", "So that they may remain permanently separated", "So that only one tribe would be favoured"],
  },
  {
    q: "What does Surah al-Hujurat say about mocking or ridiculing others?",
    correct: "It should be avoided, since one group may be better than another in ways not visible",
    distractors: ["It is acceptable if done in a joking manner", "It is encouraged between rival groups", "It has no consequence in Islam"],
  },
  {
    q: "What behaviour does Surah al-Hujurat warn against regarding others?",
    correct: "Suspicion, spying on others, and backbiting",
    distractors: ["Helping neighbours in need", "Greeting one another with peace", "Sharing food with the poor"],
  },
  {
    q: "According to Surah al-Hujurat, what determines true honour before Allah?",
    correct: "Righteousness (taqwa), not tribe, wealth, or nationality",
    distractors: ["Physical strength", "The size of one's family", "One's place of birth alone"],
  },
];

export const surahHujurat: Skill = {
  id: "ire-q-surah-hujurat",
  code: "Q.2",
  subjectId: "ire",
  strandId: "ire-quran",
  grade: 9,
  title: "Surah Al-Hujurat (Q49)",
  description: "Answer questions about the teachings of Surah al-Hujurat.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TEACHINGS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.teaching, label: t.teaching })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.teaching, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.teaching] = t.teaching;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Surah al-Hujurat gives guidance on how Muslims should treat one another — avoiding suspicion, mockery, and backbiting, and valuing people by their righteousness.",
        explanation: chosen.map((t) => `${t.teaching} — ${t.meaning.toLowerCase()}.`).join(" "),
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
      hint: "Surah al-Hujurat gives guidance on how Muslims should treat one another — avoiding suspicion, mockery, and backbiting, and valuing people by their righteousness.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
