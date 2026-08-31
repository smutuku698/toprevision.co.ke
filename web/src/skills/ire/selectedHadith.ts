import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each Hadith to its core teaching.",
  "Pair each Hadith with its core teaching.",
  "Connect each Hadith below to its teaching.",
  "Match each Hadith to the teaching it carries.",
  "Link each Hadith to its correct teaching.",
  "Choose the correct teaching for each Hadith.",
];

const HADITH: { name: string; teaching: string }[] = [
  { name: "Hadith on unity (Muslim)", teaching: "Believers are like one body — when one part aches, the whole body feels it" },
  { name: "Hadith on avoidance of ill motives (Bukhari)", teaching: "Beware of suspicion, avoid spying, and do not desert one another as brothers" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does the Hadith on unity compare the believers to?",
    correct: "One body — when one part aches, the whole body feels it",
    distractors: ["A flock of birds flying separately", "A group of strangers passing by", "A row of unrelated trees"],
  },
  {
    q: "According to the Hadith on avoiding ill motives, what should Muslims beware of?",
    correct: "Suspicion, since it is 'the worst of false tales'",
    distractors: ["Eating too much food", "Travelling long distances", "Wearing bright colours"],
  },
  {
    q: "Which of these does the Hadith on ill motives warn against?",
    correct: "Spying on one another and looking for others' faults",
    distractors: ["Greeting each other warmly", "Sharing meals together", "Praying together in congregation"],
  },
  {
    q: "What does the Hadith on unity teach about the relationship between believers?",
    correct: "They should feel each other's pain and joy, like limbs of one body",
    distractors: ["They should compete for status", "They should live entirely separate lives", "They should only care for their immediate family"],
  },
  {
    q: "What does the Hadith on ill motives call believers to be towards one another?",
    correct: "Brothers, avoiding jealousy, hatred, and desertion",
    distractors: ["Rivals in business only", "Silent strangers", "Judges over each other's faith"],
  },
];

export const selectedHadith: Skill = {
  id: "ire-h-selected-hadith",
  code: "H.2",
  subjectId: "ire",
  strandId: "ire-hadith",
  grade: 9,
  title: "Selected Hadith on unity and avoidance of ill motives",
  description: "Answer questions about the Hadith on unity and the Hadith on avoidance of ill motives.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, HADITH.map((h) => ({ id: h.name, label: h.name })));
      const targets = shuffle(rng, HADITH.map((h) => ({ id: h.name, label: h.teaching })));
      const correctMap: Record<string, string> = {};
      for (const h of HADITH) correctMap[h.name] = h.name;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "One Hadith teaches unity among believers; the other warns against suspicion and ill motives.",
        explanation: HADITH.map((h) => `${h.name} — ${h.teaching.toLowerCase()}.`).join(" "),
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
      hint: "These two Hadith teach that believers should be united like one body, and should avoid suspicion, spying, and jealousy towards one another.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
