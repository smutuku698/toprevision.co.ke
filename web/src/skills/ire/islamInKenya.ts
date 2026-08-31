import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each factor to how it helped spread Islam in Kenya.",
  "Pair each factor with how it helped spread Islam in Kenya.",
  "Connect each factor below to its role in spreading Islam.",
  "Match each factor to the correct description of its role.",
  "Link each factor to how it contributed to Islam's spread in Kenya.",
  "Choose the correct description for each factor.",
];

const FACTORS: { factor: string; description: string }[] = [
  { factor: "Trade", description: "Arab and Persian merchants brought Islam through Indian Ocean coastal trade" },
  { factor: "Intermarriage", description: "Marriages between traders and local communities blended cultures and beliefs" },
  { factor: "Teaching", description: "Religious teachers and scholars spread knowledge of Islam inland from the coast" },
  { factor: "Migration and settlement", description: "Muslim traders and settlers who moved inland carried their faith with them" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Through which activity did Islam first spread to the Kenyan coast?",
    correct: "Trade contacts with Arab and Persian merchants along the Indian Ocean coast",
    distractors: ["Colonial government policy", "Radio broadcasts", "Organised colonial-era missions"],
  },
  {
    q: "What was one effect of contact between early Muslims and native communities in Kenya?",
    correct: "The growth of Swahili culture and language, blending Arab and African influences",
    distractors: ["The disappearance of all local languages", "No cultural exchange took place", "The end of trade along the coast"],
  },
  {
    q: "Besides the Coast, which other regions of Kenya are noted for the historical spread of Islam?",
    correct: "Western, Central, and North Eastern Kenya",
    distractors: ["Only the Rift Valley", "Only Nairobi", "Areas entirely outside Kenya"],
  },
  {
    q: "What was a challenge faced by early Muslims propagating Islam in Kenya?",
    correct: "Communicating across different languages and unfamiliar local customs",
    distractors: ["An oversupply of religious teachers", "Too much government support", "No interest from any communities"],
  },
];

export const islamInKenya: Skill = {
  id: "ire-ih-islam-in-kenya",
  code: "IH.1",
  subjectId: "ire",
  strandId: "ire-heritage",
  grade: 9,
  title: "Islam in Kenya",
  description: "Answer questions about the spread of Islam in Kenya and its impact.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, FACTORS);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.factor, label: f.factor })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.factor, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.factor] = f.factor;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Trade, intermarriage, teaching, and migration all played a role in spreading Islam across Kenya.",
        explanation: chosen.map((f) => `${f.factor} — ${f.description.toLowerCase()}.`).join(" "),
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
      hint: "Islam spread to Kenya first through coastal trade, and its presence today reaches the Coast, Western, Central, and North Eastern regions.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
