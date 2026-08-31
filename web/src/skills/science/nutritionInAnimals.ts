import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DIGESTION_STAGES = [
  { id: "ingestion", label: "Ingestion — taking food into the mouth" },
  { id: "digestion", label: "Digestion — breaking food into smaller, soluble molecules" },
  { id: "absorption", label: "Absorption — digested food passes into the blood" },
  { id: "assimilation", label: "Assimilation — absorbed nutrients are used by body cells" },
  { id: "egestion", label: "Egestion — undigested waste is removed as faeces" },
];

const TEETH: { name: string; role: string }[] = [
  { name: "Incisors", role: "Sharp, chisel-shaped front teeth used for cutting and biting off food" },
  { name: "Canines", role: "Pointed teeth used for gripping, tearing, and piercing food" },
  { name: "Premolars", role: "Teeth with a ridged surface used for crushing and grinding food" },
  { name: "Molars", role: "Large, broad teeth at the back used for crushing and grinding food further" },
];

const WHY_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Why do carnivores like lions have sharp, pointed canine teeth?",
    choices: ["To grip, tear, and pierce meat from their prey", "To grind tough plant fibres into a paste", "To filter water while feeding", "Canines have no real function in carnivores"],
    correctIndex: 0,
    explanation: "Sharp, pointed canines let carnivores grip, tear, and pierce meat effectively — a diet dominated by animal flesh needs this kind of tooth.",
  },
  {
    prompt: "Why do herbivores like cows have large, flat, ridged molars?",
    choices: ["To crush and grind tough plant material thoroughly before swallowing", "To pierce and tear meat quickly", "To store extra food for later", "Flat molars have no digestive purpose"],
    correctIndex: 0,
    explanation: "Plant material is tough and fibrous, so herbivores need large, ridged molars to grind it down thoroughly for digestion.",
  },
  {
    prompt: "Why does the stomach churn food and mix it with gastric juices?",
    choices: ["To break food down further and begin digesting proteins", "To immediately absorb all nutrients into the blood", "To remove all the water from the food", "To convert food directly into waste"],
    correctIndex: 0,
    explanation: "Churning mixes food with gastric juices (including acid and enzymes) that begin breaking down proteins before the food moves on to the small intestine.",
  },
  {
    prompt: "Why is the small intestine considered the main site of digestion and absorption?",
    choices: ["It has enzymes that finish digestion, and a large surface area to absorb nutrients into the blood", "It only stores food temporarily with no chemical activity", "It is where undigested waste is formed into faeces", "It replaces the need for the stomach entirely"],
    correctIndex: 0,
    explanation: "The small intestine completes digestion using enzymes and has a huge surface area (from villi) that efficiently absorbs digested nutrients into the blood.",
  },
  {
    prompt: "What is the main role of the large intestine in digestion?",
    choices: ["Absorbing water from undigested food to form solid faeces", "Producing enzymes that digest proteins", "Absorbing most of the body's digested nutrients", "Breaking food into smaller pieces mechanically"],
    correctIndex: 0,
    explanation: "The large intestine mainly absorbs water from the remaining undigested material, forming solid faeces to be egested.",
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "Taking food into the mouth is called ", after: ".", correctAnswer: "ingestion", accepted: ["ingestion"], explanation: "Ingestion is taking food into the mouth, the first stage of nutrition in animals." },
  { before: "The removal of undigested waste from the body as faeces is called ", after: ".", correctAnswer: "egestion", accepted: ["egestion"], explanation: "Egestion is the removal of undigested waste from the body as faeces, the final stage of nutrition." },
  { before: "The use of absorbed nutrients by the body's cells is called ", after: ".", correctAnswer: "assimilation", accepted: ["assimilation"], explanation: "Assimilation is the process by which absorbed nutrients are used by the body's cells." },
  { before: "A biological molecule that speeds up digestion by breaking down food chemically is called an ", after: ".", correctAnswer: "enzyme", accepted: ["enzyme"], explanation: "An enzyme is a biological molecule that speeds up the chemical breakdown of food during digestion." },
  { before: "An animal that feeds only on plants is called a ", after: ".", correctAnswer: "herbivore", accepted: ["herbivore"], explanation: "A herbivore is an animal that feeds only on plants." },
  { before: "An animal that feeds only on other animals is called a ", after: ".", correctAnswer: "carnivore", accepted: ["carnivore"], explanation: "A carnivore is an animal that feeds only on other animals." },
  { before: "The greenish liquid, produced by the liver, that helps digest fats is called ", after: ".", correctAnswer: "bile", accepted: ["bile"], explanation: "Bile is a greenish liquid produced by the liver that emulsifies fats to help digest them." },
] as const;

const ANIMALS: { name: string; diet: "herbivore" | "carnivore" | "omnivore" }[] = [
  { name: "Cow", diet: "herbivore" },
  { name: "Rabbit", diet: "herbivore" },
  { name: "Goat", diet: "herbivore" },
  { name: "Lion", diet: "carnivore" },
  { name: "Hyena", diet: "carnivore" },
  { name: "Crocodile", diet: "carnivore" },
  { name: "Pig", diet: "omnivore" },
  { name: "Human", diet: "omnivore" },
  { name: "Bear", diet: "omnivore" },
];

export const nutritionInAnimals: Skill = {
  id: "sci-lte-nutrition-animals",
  code: "LTE.2",
  subjectId: "science",
  strandId: "sci-lte",
  grade: 9,
  title: "Nutrition in animals",
  description: "Stages of digestion, types of teeth, and classifying animals by diet.",
  generate(rng) {
    const branch = randChoice(rng, ["digestion", "teeth", "diet", "why", "fill-blank"] as const);

    if (branch === "why") {
      const q = randChoice(rng, WHY_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Think about how tooth shape or organ structure suits its specific job in digestion.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about nutrition in animals.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe digestion and animal diets.",
        explanation: fb.explanation,
      };
    }

    if (branch === "digestion") {
      const shuffled = shuffle(rng, DIGESTION_STAGES);
      return {
        kind: "ordering",
        prompt: "Arrange the stages of digestion in the human body in the correct order.",
        instruction: "Drag to put the stages in order, from taking in food to removing waste.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: DIGESTION_STAGES.map((s) => s.id),
        hint: "Food is first taken in, then broken down, then absorbed and used, and finally the leftover waste is removed.",
        explanation: DIGESTION_STAGES.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "teeth") {
      const chosen = shuffle(rng, TEETH);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.role })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;

      return {
        kind: "click-match",
        prompt: "Match each type of tooth to its function.",
        tokens,
        targets,
        correctMap,
        hint: "Different teeth are shaped for different jobs — cutting, tearing, or grinding.",
        explanation: chosen.map((t) => `${t.name} — ${t.role.toLowerCase()}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, ANIMALS).slice(0, 6);
    const items = chosen.map((a) => ({ id: a.name, label: a.name }));
    const correctBucket: Record<string, string> = {};
    for (const a of chosen) correctBucket[a.name] = a.diet;

    return {
      kind: "categorize",
      prompt: "Sort each animal by what it eats.",
      items,
      buckets: [
        { id: "herbivore", label: "Herbivore" },
        { id: "carnivore", label: "Carnivore" },
        { id: "omnivore", label: "Omnivore" },
      ],
      correctBucket,
      hint: "Herbivores eat only plants, carnivores eat only other animals, and omnivores eat both.",
      explanation: chosen.map((a) => `${a.name} is a ${a.diet}.`).join(" "),
    };
  },
};
