import { shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Passage {
  text: string;
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
}

const PASSAGES: Passage[] = [
  {
    text: "A retired soldier named Baraka spends his weekends repairing the water pump that serves his village. He learned mechanics during his years of service and now fixes the pump for free whenever it breaks down. Villagers say that without him, they would often go days without clean water. Baraka insists he is only doing what any neighbor should do.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A retired soldier who keeps his village's water pump working for free",
          "A soldier who refuses to help his neighbors",
          "A village building a brand-new water pump",
          "Villagers learning mechanics from a training course",
        ],
        correctIndex: 0,
        explanation: "The passage centers on Baraka's free repair work on the village water pump, not on a new pump or a training course.",
      },
      {
        prompt: "According to the passage, where did Baraka learn mechanics?",
        choices: ["During his years of military service", "From a village training course", "From his father", "From a book"],
        correctIndex: 0,
        explanation: "The passage states he \"learned mechanics during his years of service.\"",
      },
    ],
    trueFalse: [
      { text: "Baraka repairs the water pump for free.", isTrue: true },
      { text: "Baraka learned mechanics while serving as a soldier.", isTrue: true },
      { text: "Baraka charges villagers a fee for every repair.", isTrue: false },
      { text: "The village never has water problems.", isTrue: false },
    ],
  },
  {
    text: "When a fire broke out at the market, a fruit seller named Achieng grabbed a jerrycan of water and began dousing the flames before they could spread to the neighboring stalls. Other traders joined in, forming a bucket line from a nearby tap. Firefighters later said the quick action likely saved half the market from burning down.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Traders acting quickly to stop a market fire from spreading",
          "Firefighters arriving before anyone else could react",
          "A market being completely destroyed by fire",
          "Achieng starting a fire accidentally",
        ],
        correctIndex: 0,
        explanation: "The passage follows Achieng and other traders' quick response, which the firefighters credit with limiting the damage.",
      },
      {
        prompt: "How did the traders form a way to fight the fire?",
        choices: ["By forming a bucket line from a nearby tap", "By calling the fire brigade and waiting", "By using sand from the road", "By closing all the market gates"],
        correctIndex: 0,
        explanation: "The passage says other traders \"joined in, forming a bucket line from a nearby tap.\"",
      },
    ],
    trueFalse: [
      { text: "Achieng began dousing the fire with water.", isTrue: true },
      { text: "Other traders helped by forming a bucket line.", isTrue: true },
      { text: "The whole market burned down completely.", isTrue: false },
      { text: "Firefighters said the traders' actions made no difference.", isTrue: false },
    ],
  },
  {
    text: "A university student named Njoroge spends his holidays tutoring primary school children in his rural home area for free. He noticed many pupils were falling behind because their school lacked enough teachers. Word of his tutoring spread, and now over fifty children attend his sessions under a large mango tree every school break.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A student who tutors local children for free during school holidays",
          "A school hiring more teachers",
          "Children refusing to attend school",
          "A university closing for the holidays",
        ],
        correctIndex: 0,
        explanation: "The passage focuses on Njoroge's free tutoring sessions, not on the school hiring staff.",
      },
      {
        prompt: "Why did Njoroge start tutoring the children?",
        choices: [
          "He noticed pupils were falling behind due to a shortage of teachers",
          "He was paid a large salary to do it",
          "The government ordered him to",
          "He wanted to avoid going home",
        ],
        correctIndex: 0,
        explanation: "The passage explains he \"noticed many pupils were falling behind because their school lacked enough teachers.\"",
      },
    ],
    trueFalse: [
      { text: "Njoroge tutors children for free during school holidays.", isTrue: true },
      { text: "The sessions happen under a mango tree.", isTrue: true },
      { text: "Only five children attend his sessions.", isTrue: false },
      { text: "Njoroge charges a high fee for tutoring.", isTrue: false },
    ],
  },
];

export const heroesComprehension: Skill = {
  id: "il-r-heroes-comprehension",
  code: "R.1",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "Community heroes: reading comprehension",
  description: "Read a short story about a community hero or heroine and answer comprehension questions about it.",
  generate(rng) {
    const index = Math.floor(rng() * PASSAGES.length);
    const passage = PASSAGES[index];

    if (rng() < 0.4) {
      const items = passage.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: passage.text,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage and check each statement carefully against what it actually says.",
        explanation: passage.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the passage.`).join(" "),
      };
    }

    const q = passage.questions[Math.floor(rng() * passage.questions.length)];
    const correctText = q.choices[q.correctIndex];
    const choices = shuffle(rng, q.choices);

    return {
      kind: "multiple-choice",
      passage: passage.text,
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(correctText),
      layout: "list",
      hint: "Reread the passage and look for the sentence that directly relates to the question.",
      explanation: q.explanation,
    };
  },
};
