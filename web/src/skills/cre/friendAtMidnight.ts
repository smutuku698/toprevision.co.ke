import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each element of the parable of the friend at midnight to what it represents.",
  "Pair each part of the friend-at-midnight parable with its meaning.",
  "Connect each detail from the parable to what it stands for.",
  "Match each item below to its correct explanation in the parable.",
  "Link each element of the parable to the meaning Jesus gave it.",
  "Match each part of the story to what it teaches.",
];

const ELEMENTS: { term: string; meaning: string }[] = [
  { term: "The friend's request", meaning: "Asking for three loaves of bread for an unexpected guest" },
  { term: "Midnight", meaning: "The inconvenient time the man chose to keep asking" },
  { term: "Shameless persistence", meaning: "The reason the friend inside eventually gets up to help" },
  { term: "The Holy Spirit", meaning: "What Jesus says God will freely give to those who ask" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "In the parable of the friend at midnight, why does the man go to his friend's house?",
    correct: "A friend has arrived on a journey and he has nothing to set before him",
    distractors: ["He needs to borrow money", "He is fleeing from danger", "He wants to deliver a message"],
  },
  {
    q: "What does the man ask his friend for at midnight?",
    correct: "Three loaves of bread",
    distractors: ["A donkey to travel with", "A place to sleep", "A lamp for light"],
  },
  {
    q: "Why does the friend inside eventually get up and help, according to the parable?",
    correct: "Because of the man's shameless persistence in asking",
    distractors: ["Because the man threatened him", "Because it was daylight", "Because the friend felt guilty"],
  },
  {
    q: "What is the main lesson Jesus teaches through the parable of the friend at midnight?",
    correct: "Christians should pray persistently and with confidence that God will answer",
    distractors: ["Christians should never ask others for help", "Neighbours should always share food equally", "It is wrong to sleep late at night"],
  },
  {
    q: "According to Jesus' teaching after this parable, what will God give to those who ask?",
    correct: "The Holy Spirit, to those who ask him",
    distractors: ["Unlimited wealth", "A long life on earth", "Freedom from all hardship"],
  },
];

export const friendAtMidnight: Skill = {
  id: "cre-jc-friend-at-midnight",
  code: "JC.3",
  subjectId: "cre",
  strandId: "cre-jesus",
  grade: 9,
  title: "The parable of the friend at midnight",
  description: "Answer questions about Jesus' parable on prayer, the friend at midnight (Luke 11:5-13).",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, ELEMENTS.map((e) => ({ id: e.term, label: e.term })));
      const targets = shuffle(rng, ELEMENTS.map((e) => ({ id: e.term, label: e.meaning })));
      const correctMap: Record<string, string> = {};
      for (const e of ELEMENTS) correctMap[e.term] = e.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Jesus told this parable to teach that Christians should pray boldly and persistently, trusting that God will respond.",
        explanation: ELEMENTS.map((e) => `${e.term} — ${e.meaning.toLowerCase()}.`).join(" "),
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
      hint: "Jesus told this parable to teach that Christians should pray boldly and persistently, trusting that God will respond.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
