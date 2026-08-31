import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (description: string) => [
  `Which practice is described as: "${description}"?`,
  `"${description}" — which practice is this?`,
  `Identify the practice described as "${description}".`,
  `This description fits which practice: "${description}"?`,
  `Which practice below matches this description: "${description}"?`,
  `Name the practice that is described as "${description}".`,
];

const MATCH_PROMPTS = [
  "Match each Jain Dharma practice to what it involves.",
  "Pair each practice with what it involves.",
  "Connect each Jain Dharma practice to its description.",
  "Link each practice below to what it involves.",
  "Match each practice to its correct description.",
  "Choose the correct description for each Jain Dharma practice.",
];

const FILL_PROMPTS = [
  "Fill in the missing name of the practice.",
  "Which practice is being described?",
  "Name the practice described below.",
  "Work out which practice completes the description.",
  "Identify the missing practice name.",
  "Which practice name belongs in the blank?",
];

const ORDER_PROMPTS = [
  "Arrange the correct order of protocol when visiting a Jain Derasar to worship.",
  "Put these steps of visiting a Jain Derasar into the correct order.",
  "Sequence the protocol followed when visiting a Derasar to worship.",
  "Order these steps of a Derasar visit as they should actually happen.",
  "Sort these Derasar-visit actions into the correct protocol order.",
  "Arrange these steps in the order a worshipper follows them at the Derasar.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each action into when it happens during a visit to a Jain Derasar.",
  "Group each action by when it happens during a Derasar visit.",
  "Sort these actions by whether they happen before, during, or after worship.",
  "Decide when each action happens during a Derasar visit, and sort it there.",
  "Place each action into the stage of the Derasar visit it belongs to.",
  "Categorise each action by when it takes place during worship.",
];

const RITUALS = [
  {
    name: "Aarti",
    description: "A devotional ritual in which a lit lamp is waved before the deity's image at a Jain Derasar, as an act of reverence",
  },
  {
    name: "Mangal Divo",
    description: "A lamp-lighting ritual performed at the start of daily worship, symbolising the dispelling of ignorance",
  },
] as const;

const FACT_QUESTIONS = [
  {
    q: "Why do Jains avoid wearing leather items when entering a Derasar?",
    correct: "Because leather comes from animal hide, and Ahimsa (non-violence) calls for respecting all living beings",
    distractors: ["Because leather is too expensive for daily wear", "Because it is a rule only for priests", "Because leather items are needed for Mangal Divo"],
  },
  {
    q: "What does lighting the Mangal Divo at the start of worship symbolise?",
    correct: "The dispelling of ignorance with the light of knowledge",
    distractors: ["The end of the worship session", "A signal that visitors must leave", "A celebration of a Jain festival only"],
  },
  {
    q: "Why is the Namokar Mantra recited on entering a Derasar?",
    correct: "To pay respects to enlightened souls and set a devotional mindset before worship",
    distractors: ["To ask permission from temple staff to enter", "To announce a wedding ceremony", "To mark the end of Aarti"],
  },
] as const;

const PHASE_ITEMS = [
  { text: "Removing footwear and leather items before entering the Derasar", bucket: "before" },
  { text: "Washing hands before approaching the idol", bucket: "before" },
  { text: "Reciting the Namokar Mantra on entering the Derasar", bucket: "during" },
  { text: "Lighting the Mangal Divo at the start of worship", bucket: "during" },
  { text: "Waving a lit lamp before the deity during Aarti", bucket: "during" },
  { text: "Bowing and taking respectful leave of the deity", bucket: "after" },
  { text: "Reflecting quietly on the teachings before leaving", bucket: "after" },
] as const;
const PHASE_LABEL: Record<string, string> = { before: "Before entering the Derasar", during: "During worship", after: "After worship" };

const VISIT_STEPS = [
  { id: "footwear", label: "Remove footwear and leather items before entering the Derasar" },
  { id: "wash", label: "Wash hands before approaching the idol" },
  { id: "namokar", label: "Recite the Namokar Mantra on entering" },
  { id: "mangal-divo", label: "Light the Mangal Divo at the start of worship" },
  { id: "aarti", label: "Perform Aarti before the deity" },
  { id: "leave", label: "Bow and take respectful leave of the deity" },
];

export const protocolsInJainDharma: Skill = {
  id: "g8-hre-rp-protocols-in-jain-dharma",
  code: "RP.2",
  subjectId: "hre",
  strandId: "g8-hre-rp",
  grade: 8,
  title: "Protocols in Jain Dharma",
  description: "Protocols and etiquette observed in a Jain Derasar (temple), including Aarti and Mangal Divo.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "fill", "order", "categorize"] as const);
    const hint = "Mangal Divo lights the way at the start of worship; Aarti offers light in reverence to the deity.";

    if (branch === "mc") {
      if (rng() < 0.5) {
        const target = randChoice(rng, RITUALS);
        const other = RITUALS.find((r) => r.name !== target.name)!;
        const choices = shuffle(rng, [target.name, other.name, "Parikrama", "Antim Sanskaar"]);
        return {
          kind: "multiple-choice",
          prompt: randChoice(rng, DESCRIBED_MC_PROMPTS(target.description)),
          choices,
          correctIndex: choices.indexOf(target.name),
          layout: "list",
          hint,
          explanation: `${target.name} — ${target.description.toLowerCase()}.`,
        };
      }
      const entry = randChoice(rng, FACT_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, RITUALS.map((r) => ({ id: r.name, label: r.name })));
      const targets = shuffle(rng, RITUALS.map((r) => ({ id: r.name, label: r.description })));
      const correctMap: Record<string, string> = {};
      for (const r of RITUALS) correctMap[r.name] = r.name;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: RITUALS.map((r) => `${r.name} — ${r.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const target = randChoice(rng, RITUALS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "",
        after: `is described as: "${target.description}."`,
        correctAnswer: target.name,
        inputMode: "text",
        hint,
        explanation: `${target.name} — ${target.description.toLowerCase()}.`,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffle(rng, VISIT_STEPS),
        correctOrder: VISIT_STEPS.map((s) => s.id),
        hint: "Etiquette comes first (footwear, cleanliness), then the worship itself (Namokar Mantra, Mangal Divo, Aarti), then leaving respectfully.",
        explanation: VISIT_STEPS.map((s) => s.label).join(" → "),
      };
    }

    // categorize
    const chosen = shuffle(rng, PHASE_ITEMS).slice(0, 6);
    const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: PHASE_LABEL[b] }));
    const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items,
      buckets,
      correctBucket,
      hint: "Think about whether the action happens on arrival, during the actual worship, or when leaving.",
      explanation: chosen.map((c) => `"${c.text}" — ${PHASE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
    };
  },
};
