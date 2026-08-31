import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term to what it means.",
  "Pair each term with its correct meaning.",
  "Connect each term below to what it means.",
  "Match each term to the meaning that fits it.",
  "Link each term with the correct definition.",
  "Choose the correct meaning for each term below.",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Qadar", meaning: "Allah's decree — His full knowledge and measure of all that will happen" },
  { term: "Qadha", meaning: "The actual occurrence of what Allah has decreed" },
  { term: "Patience (Sabr)", meaning: "The response Qadar encourages when facing hardship, alongside continued effort" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does belief in Qadar mean for a Muslim?",
    correct: "That Allah has full knowledge and control over all that happens, though people are still responsible for their choices",
    distractors: ["That nothing a person does matters at all", "That the future is unknown even to Allah", "That only some events are decided by Allah"],
  },
  {
    q: "What is Qadha, in relation to Qadar?",
    correct: "The actual occurrence of what Allah has decreed",
    distractors: ["A separate religion practised alongside Islam", "A type of daily prayer", "A punishment for disbelief"],
  },
  {
    q: "What attitude does belief in Qadar encourage in a Muslim facing hardship?",
    correct: "Patience and acceptance of Allah's will, while still striving to do good",
    distractors: ["Giving up on all effort", "Blaming others for everything", "Ignoring the hardship completely"],
  },
  {
    q: "Why is belief in Qadar considered part of the pillars of Iman?",
    correct: "It is part of the core of Islamic faith, alongside belief in Allah, the angels, the books, and the prophets",
    distractors: ["It is optional for most Muslims", "It only applies to religious scholars", "It was added recently to Islamic teaching"],
  },
];

export const beliefInQadar: Skill = {
  id: "ire-pi-qadar",
  code: "PI.2",
  subjectId: "ire",
  strandId: "ire-iman",
  grade: 9,
  title: "Belief in Qadar",
  description: "Answer questions about the Islamic belief in Qadar and Qadha.",
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
        hint: "Qadar is Allah's decree, and Qadha is that decree coming to pass — believing in both encourages patience and acceptance, without removing personal responsibility.",
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
      hint: "Qadar is Allah's decree, and Qadha is that decree coming to pass — believing in both encourages patience and acceptance, without removing personal responsibility.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
