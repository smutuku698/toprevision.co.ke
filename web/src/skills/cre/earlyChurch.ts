import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each event from the story of Paul and Silas to what happened as a result.",
  "Pair each event in the Philippi prison story with its outcome.",
  "Connect each moment from Acts 16 to what followed it.",
  "Match each event below to its correct result.",
  "Link each event from the story to what happened next.",
  "Match each part of the Paul and Silas story to its consequence.",
];

const EVENTS: { event: string; outcome: string }[] = [
  { event: "Paul casts an evil spirit out of a slave girl", outcome: "Her owners, angry at losing their profit, had Paul and Silas arrested" },
  { event: "An earthquake strikes at midnight", outcome: "While Paul and Silas prayed and sang, the prison chains came loose and the doors opened" },
  { event: "The jailer asks 'What must I do to be saved?'", outcome: "Paul and Silas told him to believe in the Lord Jesus Christ" },
  { event: "The jailer believes", outcome: "He and his household were baptised that same night" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What did the believers in the Early Church devote themselves to, according to Acts 2:42-47?",
    correct: "The apostles' teaching, fellowship, breaking of bread, and prayer",
    distractors: ["Building large temples", "Political campaigns", "Trading with foreign nations"],
  },
  {
    q: "How did the Early Church share their resources with one another?",
    correct: "They had everything in common and shared with anyone in need",
    distractors: ["Everyone kept their possessions strictly private", "Only the apostles were allowed to own property", "They paid taxes directly to Rome"],
  },
  {
    q: "In Acts 16, why were Paul and Silas imprisoned in Philippi?",
    correct: "After Paul cast an evil spirit out of a slave girl, her owners had them arrested",
    distractors: ["They refused to pay a debt", "They were caught stealing from the temple", "They were accused of treason against Rome"],
  },
  {
    q: "What happened at midnight while Paul and Silas were praying and singing hymns in prison?",
    correct: "A violent earthquake shook the prison, and everyone's chains came loose",
    distractors: ["The prison guards released them out of pity", "They fell asleep and escaped unnoticed", "A fire broke out and destroyed the prison"],
  },
  {
    q: "What did the Philippian jailer ask Paul and Silas after the earthquake?",
    correct: "\"What must I do to be saved?\"",
    distractors: ["\"Where is the nearest city?\"", "\"How can I become a Roman citizen?\"", "\"Who sent you to destroy my prison?\""],
  },
];

export const earlyChurch: Skill = {
  id: "cre-ch-early-church",
  code: "CH.1",
  subjectId: "cre",
  strandId: "cre-church",
  grade: 9,
  title: "The Early Church",
  description: "Answer questions about the characteristics of the Early Church and the story of Paul and Silas.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, EVENTS.map((e) => ({ id: e.event, label: e.event })));
      const targets = shuffle(rng, EVENTS.map((e) => ({ id: e.event, label: e.outcome })));
      const correctMap: Record<string, string> = {};
      for (const e of EVENTS) correctMap[e.event] = e.event;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "This story from Acts 16 shows God's power at work through the Early Church, even in prison.",
        explanation: EVENTS.map((e) => `${e.event} — ${e.outcome.toLowerCase()}.`).join(" "),
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
      hint: "The Early Church was known for devoted fellowship, prayer, and sharing — and for God's miraculous power, as shown through Paul and Silas in Philippi.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
