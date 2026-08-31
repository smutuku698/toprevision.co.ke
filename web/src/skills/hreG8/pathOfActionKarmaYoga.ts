import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (contribution: string) => [
  `Which practitioner of Karma Yoga is described as: "${contribution}"?`,
  `"${contribution}" — which practitioner of Karma Yoga is this?`,
  `Identify the practitioner of Karma Yoga described as "${contribution}".`,
  `This description fits which practitioner of Karma Yoga: "${contribution}"?`,
  `Which practitioner below is described as "${contribution}"?`,
  `Name the practitioner of Karma Yoga that matches: "${contribution}".`,
];

const MATCH_PROMPTS = [
  "Match each practitioner of Karma Yoga to their contribution.",
  "Pair each practitioner with their contribution.",
  "Connect each practitioner of Karma Yoga to their contribution.",
  "Link each practitioner below to the correct contribution.",
  "Match each name to its key contribution.",
  "Choose the correct contribution for each practitioner of Karma Yoga.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each practitioner of Karma Yoga into the faith tradition they belong to.",
  "Group each practitioner under the faith tradition they come from.",
  "Sort these practitioners by their faith tradition.",
  "Place each practitioner of Karma Yoga into the correct faith tradition.",
  "Decide which faith tradition each practitioner belongs to, and sort them there.",
  "Categorise each practitioner of Karma Yoga by faith tradition.",
];

const FILL_PROMPTS = [
  "Fill in the missing name of the practitioner of Karma Yoga.",
  "Which practitioner of Karma Yoga is being described?",
  "Name the practitioner of Karma Yoga described below.",
  "Work out which name completes the description.",
  "Identify the missing practitioner's name.",
  "Which name belongs in the blank?",
];

const PRACTITIONERS = [
  {
    name: "Sister Nivedita",
    tradition: "Sanatan/Vedic",
    contribution:
      "An Irish-born disciple of Swami Vivekananda who dedicated her life to social service in India, including founding a school for girls and helping during famine and plague relief",
  },
  {
    name: "Rishabh Dev",
    tradition: "Jain",
    contribution:
      "The first Tirthankar, who selflessly taught early society practical arts such as agriculture, pottery, and writing for the good of humanity",
  },
  {
    name: "Buddhaghosha",
    tradition: "Buddhist",
    contribution:
      "A renowned scholar-monk who compiled detailed commentaries on the Buddha's teachings so future generations could understand and benefit from them",
  },
  {
    name: "Bibi Sundari Ji",
    tradition: "Sikh",
    contribution:
      "Daughter of Guru Amar Das, known for her seva (selfless service), including helping run the community kitchen (langar) and serving pilgrims",
  },
] as const;

const HINT = "Karma Yog is the path of selfless action — one practitioner here represents each of the four faith traditions.";

export const pathOfActionKarmaYoga: Skill = {
  id: "g8-hre-yo-path-of-action-karma-yoga",
  code: "YO.1",
  subjectId: "hre",
  strandId: "g8-hre-yo",
  grade: 8,
  title: "Path of Action (Karma Yoga)",
  description: "Prominent practitioners of Karma Yoga (the path of selfless action) from each faith tradition — Sanatan/Vedic, Jain, Buddhist, and Sikh.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "categorize", "fill"] as const);

    if (branch === "mc") {
      const target = randChoice(rng, PRACTITIONERS);
      const distractors = shuffle(rng, PRACTITIONERS.filter((p) => p.name !== target.name)).map((p) => p.name);
      const choices = shuffle(rng, [target.name, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, DESCRIBED_MC_PROMPTS(target.contribution)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint: HINT,
        explanation: `${target.name} (${target.tradition}) — ${target.contribution.toLowerCase()}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, PRACTITIONERS.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, PRACTITIONERS.map((p) => ({ id: p.name, label: p.contribution })));
      const correctMap: Record<string, string> = {};
      for (const p of PRACTITIONERS) correctMap[p.name] = p.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: PRACTITIONERS.map((p) => `${p.name} — ${p.contribution.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, PRACTITIONERS.map((p) => ({ id: p.name, label: p.name })));
      const buckets = PRACTITIONERS.map((p) => ({ id: p.tradition, label: p.tradition }));
      const correctBucket: Record<string, string> = {};
      for (const p of PRACTITIONERS) correctBucket[p.name] = p.tradition;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "HRE covers four faith traditions: Sanatan/Vedic, Jain, Buddhist, and Sikh — one practitioner represents each.",
        explanation: PRACTITIONERS.map((p) => `${p.name} — ${p.tradition}.`).join(" "),
      };
    }

    // fill
    const target = randChoice(rng, PRACTITIONERS);
    const clues: Record<string, string> = {
      "Sister Nivedita": "was an Irish-born disciple of Swami Vivekananda known for social service in India, including founding a school for girls.",
      "Rishabh Dev": "was the first Jain Tirthankar, who taught early society practical arts such as agriculture and pottery.",
      "Buddhaghosha": "was a Buddhist scholar-monk who compiled commentaries so future generations could understand the Buddha's teachings.",
      "Bibi Sundari Ji": "was the daughter of Guru Amar Das, known for her seva, including serving in the community kitchen (langar).",
    };
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: "",
      after: clues[target.name],
      correctAnswer: target.name,
      inputMode: "text",
      hint: `This practitioner belongs to the ${target.tradition} tradition.`,
      explanation: `${target.name} (${target.tradition}) — ${target.contribution.toLowerCase()}.`,
    };
  },
};
