import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DRIVER_MC_PROMPTS = [
  "A driver who is distracted, texting, and not paying attention to the road is most directly ignoring which element of the Eightfold Path?",
  "A driver texting and distracted behind the wheel is failing to practise which element of the Eightfold Path?",
  "Which element of the Eightfold Path is most directly ignored by a driver who is distracted and texting while driving?",
  "A distracted driver, texting instead of watching the road, is neglecting which element of the Eightfold Path?",
  "Which element of the Eightfold Path does a driver break by texting and losing attention on the road?",
  "A driver not paying attention to the road, distracted by a phone, is most directly failing which element of the Eightfold Path?",
];

const MEANING_MC_PROMPTS = (meaning: string) => [
  `Which element of the Noble Eightfold Path means: "${meaning}"?`,
  `Which of the eight elements is defined as "${meaning}"?`,
  `"${meaning}" — which element of the Noble Eightfold Path is this?`,
  `Identify the element of the Eightfold Path that means "${meaning}".`,
  `Which element below carries the meaning "${meaning}"?`,
  `Choose the element of the Noble Eightfold Path described as "${meaning}".`,
];

const MATCH_PROMPTS = [
  "Match each element of the Noble Eightfold Path to what it means.",
  "Pair each element of the Eightfold Path with its correct meaning.",
  "Connect each element of the Noble Eightfold Path to its meaning.",
  "Link each element below to what it means.",
  "Match each element to the meaning that fits it.",
  "Choose the correct meaning for each element of the Noble Eightfold Path.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each element of the Noble Eightfold Path into its division.",
  "Group each element of the Eightfold Path under its division.",
  "Sort these elements by the division they belong to.",
  "Place each element of the Noble Eightfold Path into the correct division.",
  "Decide which division each element belongs to, and sort it there.",
  "Categorise each element of the Eightfold Path by its division.",
];

const FILL_PROMPTS = (meaning: string) => [
  `Fill in the missing element of the Noble Eightfold Path: it means "${meaning}".`,
  `Which element of the Eightfold Path means "${meaning}"?`,
  `Name the element of the Noble Eightfold Path that means "${meaning}".`,
  `Work out the element of the Eightfold Path described as "${meaning}".`,
  `Identify the missing element: it means "${meaning}".`,
  `Which element belongs in the blank? It means "${meaning}".`,
];

const ORDER_PROMPTS = [
  "Arrange the elements of the Noble Eightfold Path in their traditional listing order, from the Wisdom division through Ethical Conduct to Mental Discipline.",
  "Put the elements of the Noble Eightfold Path into their traditional order, from Wisdom through Ethical Conduct to Mental Discipline.",
  "Sequence the elements of the Eightfold Path in their traditional listing order.",
  "Order these elements of the Noble Eightfold Path as they are traditionally listed.",
  "Sort the elements of the Eightfold Path into their traditional order, Wisdom to Mental Discipline.",
  "Arrange these elements in the Eightfold Path's traditional sequence.",
];

const PATH = [
  { name: "Right View", division: "Wisdom", meaning: "Understanding reality and the Four Noble Truths clearly, as they truly are" },
  { name: "Right Intention", division: "Wisdom", meaning: "Committing to a mindset of goodwill, compassion, and letting go of harmful desires" },
  { name: "Right Speech", division: "Ethical Conduct", meaning: "Speaking truthfully and kindly, and avoiding gossip, harsh words, or lies" },
  { name: "Right Action", division: "Ethical Conduct", meaning: "Acting morally — avoiding killing, stealing, and other harmful conduct towards others" },
  { name: "Right Livelihood", division: "Ethical Conduct", meaning: "Earning a living in a way that does not cause harm to oneself or others" },
  { name: "Right Effort", division: "Mental Discipline", meaning: "Making a genuine effort to cultivate wholesome states of mind and let go of harmful ones" },
  { name: "Right Mindfulness", division: "Mental Discipline", meaning: "Staying continuously alert and attentive to one's body, feelings, and actions in the present moment" },
  { name: "Right Concentration", division: "Mental Discipline", meaning: "Developing deep, focused meditation to calm and steady the mind" },
] as const;

const HINT = "The Eightfold Path is grouped into three divisions: Wisdom, Ethical Conduct, and Mental Discipline.";

export const buddhistPrinciplesOfDharma: Skill = {
  id: "g8-hre-pd-buddhist-principles-of-dharma",
  code: "PD.2",
  subjectId: "hre",
  strandId: "g8-hre-pd",
  grade: 8,
  title: "Buddhist Principles of Dharma",
  description: "The Noble Eightfold Path — its eight elements, grouped into the divisions of Wisdom, Ethical Conduct, and Mental Discipline.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "categorize", "fill", "order"] as const);

    if (branch === "mc") {
      // Occasionally ask the real-world road-safety framing named in the syllabus.
      if (rng() < 0.25) {
        const choices = shuffle(rng, ["Right Mindfulness", "Right View", "Right Speech", "Right Livelihood"]);
        return {
          kind: "multiple-choice",
          prompt: randChoice(rng, DRIVER_MC_PROMPTS),
          choices,
          correctIndex: choices.indexOf("Right Mindfulness"),
          layout: "grid",
          hint: "Think about which element is about staying alert and attentive to what you are doing right now.",
          explanation: "Right Mindfulness calls for staying continuously alert and attentive to one's actions in the present moment — ignoring it while driving, for example by being distracted, is a common cause of road crashes.",
        };
      }
      const target = randChoice(rng, PATH);
      const distractors = shuffle(rng, PATH.filter((p) => p.name !== target.name)).slice(0, 3).map((p) => p.name);
      const choices = shuffle(rng, [target.name, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MEANING_MC_PROMPTS(target.meaning)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "grid",
        hint: HINT,
        explanation: `${target.name} (${target.division}) — ${target.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, PATH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.name] = p.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: chosen.map((p) => `${p.name} — ${p.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, PATH.map((p) => ({ id: p.name, label: p.name })));
      const buckets = Array.from(new Set(PATH.map((p) => p.division))).map((d) => ({ id: d, label: d }));
      const correctBucket: Record<string, string> = {};
      for (const p of PATH) correctBucket[p.name] = p.division;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Wisdom has two elements, Ethical Conduct has three, and Mental Discipline has three.",
        explanation: PATH.map((p) => `${p.name} — ${p.division}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const target = randChoice(rng, PATH);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS(target.meaning)),
        before: "",
        after: `belongs to the ${target.division} division of the Eightfold Path.`,
        correctAnswer: target.name,
        inputMode: "text",
        hint: `This element is part of the ${target.division} division.`,
        explanation: `${target.name} (${target.division}) — ${target.meaning.toLowerCase()}.`,
      };
    }

    // order
    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click them in order.",
      items: shuffle(rng, PATH.map((p) => ({ id: p.name, label: `${p.name} (${p.division})` }))),
      correctOrder: PATH.map((p) => p.name),
      hint: "Wisdom comes first (Right View, Right Intention), then Ethical Conduct, then Mental Discipline.",
      explanation: PATH.map((p) => p.name).join(" → "),
    };
  },
};
