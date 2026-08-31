import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (attribute: string) => [
  `Which Enlightened Being is described as: "${attribute}"?`,
  `"${attribute}" — which Enlightened Being is this?`,
  `Identify the Enlightened Being described as "${attribute}".`,
  `This description fits which Enlightened Being: "${attribute}"?`,
  `Which figure below is described as "${attribute}"?`,
  `Name the Enlightened Being that matches: "${attribute}".`,
];

const MATCH_PROMPTS = [
  "Match each Enlightened Being to their key attribute or contribution.",
  "Pair each Enlightened Being with their key attribute or contribution.",
  "Connect each figure to their attribute or contribution.",
  "Link each Enlightened Being below to the correct contribution.",
  "Match each name to its key attribute or contribution.",
  "Choose the correct attribute or contribution for each Enlightened Being.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each Enlightened Being into the faith tradition they belong to.",
  "Group each Enlightened Being under the faith tradition they come from.",
  "Sort these Enlightened Beings by their faith tradition.",
  "Place each Enlightened Being into the correct faith tradition.",
  "Decide which faith tradition each Enlightened Being belongs to, and sort them there.",
  "Categorise each Enlightened Being by faith tradition.",
];

const FILL_PROMPTS = [
  "Fill in the missing name of the Enlightened Being.",
  "Which Enlightened Being is being described?",
  "Name the Enlightened Being described below.",
  "Work out which name completes the description.",
  "Identify the missing name of the Enlightened Being.",
  "Which name belongs in the blank?",
];

const BEINGS = [
  {
    name: "Chaitanya Mahaprabhu",
    tradition: "Sanatan/Vedic",
    attribute:
      "A saint who popularised Sankirtan — joyful, congregational chanting of God's names — teaching that loving devotion (Bhakti) is open to everyone",
  },
  {
    name: "Tirthankar Mallinath",
    tradition: "Jain",
    attribute:
      "The nineteenth Tirthankar, who taught Ahimsa (non-violence) and detachment from worldly desires as the path to liberating the soul",
  },
  {
    name: "Lord Buddha",
    tradition: "Buddhist",
    attribute:
      "Attained enlightenment under the Bodhi tree and taught the Four Noble Truths and the Eightfold Path as the way to end suffering",
  },
  {
    name: "Sri Guru Tegh Bahadur Ji",
    tradition: "Sikh",
    attribute:
      "Known as 'Hind Kee Chaadhar' ('Shield of India'), a Sikh Guru who was martyred defending the religious freedom of people of other faiths",
  },
] as const;

const HINT = "Each of these Enlightened Beings comes from a different one of the four faith traditions covered in HRE.";

export const enlightenedBeings: Skill = {
  id: "g8-hre-pa-enlightened-beings",
  code: "PA.1",
  subjectId: "hre",
  strandId: "g8-hre-pa",
  grade: 8,
  title: "Enlightened Beings",
  description: "Key attributes and contributions of one Enlightened Being from each faith tradition — Sanatan/Vedic, Jain, Buddhist, and Sikh.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "categorize", "fill"] as const);

    if (branch === "mc") {
      const target = randChoice(rng, BEINGS);
      const distractors = shuffle(rng, BEINGS.filter((b) => b.name !== target.name)).map((b) => b.name);
      const choices = shuffle(rng, [target.name, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, DESCRIBED_MC_PROMPTS(target.attribute)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint: HINT,
        explanation: `${target.name} (${target.tradition}) — ${target.attribute.toLowerCase()}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, BEINGS.map((b) => ({ id: b.name, label: b.name })));
      const targets = shuffle(rng, BEINGS.map((b) => ({ id: b.name, label: b.attribute })));
      const correctMap: Record<string, string> = {};
      for (const b of BEINGS) correctMap[b.name] = b.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: BEINGS.map((b) => `${b.name} — ${b.attribute.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, BEINGS.map((b) => ({ id: b.name, label: b.name })));
      const buckets = BEINGS.map((b) => ({ id: b.tradition, label: b.tradition }));
      const correctBucket: Record<string, string> = {};
      for (const b of BEINGS) correctBucket[b.name] = b.tradition;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "HRE covers four faith traditions: Sanatan/Vedic, Jain, Buddhist, and Sikh — one Enlightened Being represents each.",
        explanation: BEINGS.map((b) => `${b.name} — ${b.tradition}.`).join(" "),
      };
    }

    // fill
    const target = randChoice(rng, BEINGS);
    const clues: Record<string, { before: string; after: string; hint: string }> = {
      "Chaitanya Mahaprabhu": {
        before: "",
        after: "is the Sanatan/Vedic saint who popularised Sankirtan, the joyful congregational chanting of God's names.",
        hint: "This saint taught that loving devotion (Bhakti) is open to everyone, expressed through chanting.",
      },
      "Tirthankar Mallinath": {
        before: "",
        after: "is the nineteenth Jain Tirthankar, who taught Ahimsa and detachment from worldly desires.",
        hint: "This figure is one of the twenty-four Jain Tirthankars.",
      },
      "Lord Buddha": {
        before: "",
        after: "attained enlightenment under the Bodhi tree and taught the Four Noble Truths and the Eightfold Path.",
        hint: "This figure's teachings show the way to end suffering.",
      },
      "Sri Guru Tegh Bahadur Ji": {
        before: "",
        after: "is known as 'Hind Kee Chaadhar' — 'Shield of India' — for being martyred while defending the religious freedom of people of other faiths.",
        hint: "This Sikh Guru's title honours his sacrifice for religious freedom in India.",
      },
    };
    const clue = clues[target.name];
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: clue.before,
      after: clue.after,
      correctAnswer: target.name,
      acceptedAnswers: [target.name, target.name.replace(/^Sri |^Tirthankar /, "")],
      inputMode: "text",
      hint: clue.hint,
      explanation: `${target.name} (${target.tradition}) — ${target.attribute.toLowerCase()}.`,
    };
  },
};
