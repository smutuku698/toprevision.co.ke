import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (description: string) => [
  `Which scripture is described as: "${description}"?`,
  `"${description}" — which scripture is this?`,
  `Identify the scripture described as "${description}".`,
  `This description fits which scripture: "${description}"?`,
  `Which scripture below matches this description: "${description}"?`,
  `Name the scripture that is described as "${description}".`,
];

const MATCH_PROMPTS = [
  "Match each scripture to what it teaches.",
  "Pair each scripture with what it teaches.",
  "Connect each scripture below to what it teaches.",
  "Link each scripture to the correct teaching.",
  "Match each scripture to its teaching.",
  "Choose the correct teaching for each scripture.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each scripture into the faith tradition it belongs to.",
  "Group each scripture under the faith tradition it comes from.",
  "Sort these scriptures by their faith tradition.",
  "Place each scripture into the correct faith tradition.",
  "Decide which faith tradition each scripture belongs to, and sort it there.",
  "Categorise each scripture by faith tradition.",
];

const FILL_PROMPTS = [
  "Fill in the missing name of the scripture.",
  "Which scripture is being described?",
  "Name the scripture described below.",
  "Work out which scripture completes the description.",
  "Identify the missing name of the scripture.",
  "Which scripture name belongs in the blank?",
];

const SCRIPTURES = [
  {
    name: "Yajur Ved: Sangathan Mantra",
    tradition: "Sanatan/Vedic",
    description: "A hymn from the Yajur Ved on unity, urging people to think alike, work together, and speak with one voice",
  },
  {
    name: "Uttradhyan Sutra (Chapters 19–21)",
    tradition: "Jain",
    description: "A Jain Agam text containing teachings on renunciation and right conduct, guiding the soul along the path to liberation",
  },
  {
    name: "Mangala Sutta (SN2.4)",
    tradition: "Buddhist",
    description: "A Buddhist discourse explaining what truly constitutes a blessing — the qualities and actions that make life auspicious",
  },
  {
    name: "Sukhmani Sahib (9th–16th Ashtpadi)",
    tradition: "Sikh",
    description: "A section of the 'Prayer of Peace' from the Sri Guru Granth Sahib ji, made up of eight-stanza hymns (Ashtpadis) guiding a person toward peace",
  },
] as const;

const HINT = "Each of these scriptures comes from a different one of the four faith traditions covered in HRE.";

export const scripturalTexts: Skill = {
  id: "g8-hre-sc-scriptural-texts",
  code: "SC.1",
  subjectId: "hre",
  strandId: "g8-hre-sc",
  grade: 8,
  title: "Scriptural Texts",
  description: "One key scripture from each faith tradition — Sanatan/Vedic, Jain, Buddhist, and Sikh — and how it guides daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "categorize", "fill"] as const);

    if (branch === "mc") {
      const target = randChoice(rng, SCRIPTURES);
      const distractors = shuffle(rng, SCRIPTURES.filter((s) => s.name !== target.name)).map((s) => s.name);
      const choices = shuffle(rng, [target.name, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, DESCRIBED_MC_PROMPTS(target.description)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint: HINT,
        explanation: `${target.name} (${target.tradition}) — ${target.description.toLowerCase()}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, SCRIPTURES.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, SCRIPTURES.map((s) => ({ id: s.name, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of SCRIPTURES) correctMap[s.name] = s.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: HINT,
        explanation: SCRIPTURES.map((s) => `${s.name} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, SCRIPTURES.map((s) => ({ id: s.name, label: s.name })));
      const buckets = SCRIPTURES.map((s) => ({ id: s.tradition, label: s.tradition }));
      const correctBucket: Record<string, string> = {};
      for (const s of SCRIPTURES) correctBucket[s.name] = s.tradition;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "HRE covers four faith traditions: Sanatan/Vedic, Jain, Buddhist, and Sikh — one scripture represents each.",
        explanation: SCRIPTURES.map((s) => `${s.name} — ${s.tradition}.`).join(" "),
      };
    }

    // fill
    const target = randChoice(rng, SCRIPTURES);
    const clues: Record<string, { after: string; hint: string }> = {
      "Yajur Ved: Sangathan Mantra": {
        after: "is a hymn from the Yajur Ved calling on people to think, work, and speak together in unity.",
        hint: "This is a mantra found in the Yajur Ved, one of the four Vedas.",
      },
      "Uttradhyan Sutra (Chapters 19–21)": {
        after: "is a Jain Agam text whose chapters 19 to 21 teach renunciation and right conduct on the path to liberation.",
        hint: "This is a Jain sacred text, referred to as an Agam (canonical scripture).",
      },
      "Mangala Sutta (SN2.4)": {
        after: "is the Buddhist discourse that explains what truly makes a life blessed or auspicious.",
        hint: "'Mangala' means blessing — this discourse lists what actually brings good fortune.",
      },
      "Sukhmani Sahib (9th–16th Ashtpadi)": {
        after: "is the section of the Sri Guru Granth Sahib ji, known as the 'Prayer of Peace', built up of eight-stanza hymns called Ashtpadis.",
        hint: "This composition's name literally means 'jewel of peace'.",
      },
    };
    const clue = clues[target.name];
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: "",
      after: clue.after,
      correctAnswer: target.name,
      inputMode: "text",
      hint: clue.hint,
      explanation: `${target.name} (${target.tradition}) — ${target.description.toLowerCase()}.`,
    };
  },
};
