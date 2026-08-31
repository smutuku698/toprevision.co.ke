import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Passage {
  text: string;
  question: { prompt: string; choices: string[]; correctIndex: number; explanation: string };
  adjectives: string[];
  otherWords: string[];
}

const PASSAGES: Passage[] = [
  {
    text: "Legend tells of a fearless hunter named Sila, whose sharp eyes could spot danger long before anyone else. When a hungry leopard threatened his village's herds, the brave Sila tracked it alone through the thick forest for three days until the animal finally retreated. Villagers still tell his clever, patient story to their children today.",
    question: {
      prompt: "According to the legend, why is Sila remembered?",
      choices: [
        "For fearlessly tracking a leopard for three days to protect the village's herds",
        "For refusing to help protect the herds",
        "For building the first village school",
        "For losing a fight against the leopard",
      ],
      correctIndex: 0,
      explanation: "The legend describes Sila's fearless, patient tracking of the leopard to protect the herds — that's why he's remembered.",
    },
    adjectives: ["fearless", "sharp", "hungry", "brave", "thick", "clever", "patient"],
    otherWords: ["hunter", "village", "leopard", "forest", "story", "children", "herds"],
  },
  {
    text: "The legend of the wise old woman Nyokabi tells of her clever solution to a bitter drought. Using a hidden, ancient spring known only to her, she guided the thirsty community to water through a narrow, rocky path. Grateful elders say her quiet wisdom saved the entire village.",
    question: {
      prompt: "According to the legend, what did Nyokabi do to help her community?",
      choices: [
        "She guided the thirsty community to a hidden spring during a drought",
        "She refused to share her knowledge of water sources",
        "She built a new well for the village",
        "She left the village during the drought",
      ],
      correctIndex: 0,
      explanation: "The legend states she \"guided the thirsty community to water through a narrow, rocky path.\"",
    },
    adjectives: ["wise", "old", "clever", "bitter", "hidden", "ancient", "thirsty", "narrow", "rocky", "quiet"],
    otherWords: ["woman", "drought", "spring", "community", "path", "elders", "village"],
  },
];

export const legendsAdjectives: Skill = {
  id: "il-r-legends-adjectives",
  code: "R.8",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "Indigenous literature: legends and adjectives",
  description: "Read a short legend, answer a comprehension question, and pick out the adjectives that describe its characters.",
  generate(rng) {
    const passage = randChoice(rng, PASSAGES);

    if (rng() < 0.5) {
      const choices = shuffle(rng, passage.question.choices);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: passage.question.prompt,
        choices,
        correctIndex: choices.indexOf(passage.question.choices[passage.question.correctIndex]),
        layout: "list",
        hint: "Reread the legend and look for the sentence that answers the question directly.",
        explanation: passage.question.explanation,
      };
    }

    const adjectives = shuffle(rng, passage.adjectives).slice(0, 4);
    const others = shuffle(rng, passage.otherWords).slice(0, 4);
    const items = shuffle(rng, [
      ...adjectives.map((label) => ({ id: label, label, bucket: "adjective" })),
      ...others.map((label) => ({ id: label, label, bucket: "other" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      passage: passage.text,
      prompt: "Sort each word from the legend into Adjective or Not an adjective.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "adjective", label: "Adjective" },
        { id: "other", label: "Not an adjective" },
      ],
      correctBucket,
      hint: "An adjective describes a noun — ask whether the word tells you what kind of person or thing it is.",
      explanation: `Adjectives describing the character include: ${adjectives.join(", ")}. The rest are nouns, not adjectives.`,
    };
  },
};
