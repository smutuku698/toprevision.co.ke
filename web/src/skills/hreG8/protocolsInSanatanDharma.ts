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
  "Match each Sanatan Dharma practice to what it involves.",
  "Pair each practice with what it involves.",
  "Connect each Sanatan Dharma practice to its description.",
  "Link each practice below to what it involves.",
  "Match each practice to its correct description.",
  "Choose the correct description for each Sanatan Dharma practice.",
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
  "Arrange the correct order of protocol when visiting a Sanatan/Hindu Mandir to worship.",
  "Put these steps of visiting a Sanatan/Hindu Mandir into the correct order.",
  "Sequence the protocol followed when visiting a Mandir to worship.",
  "Order these steps of a Mandir visit as they should actually happen.",
  "Sort these Mandir-visit actions into the correct protocol order.",
  "Arrange these steps in the order a worshipper follows them at the Mandir.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each action into when it happens during a visit to a Sanatan/Hindu Mandir.",
  "Group each action by when it happens during a Mandir visit.",
  "Sort these actions by whether they happen before, during, or after worship.",
  "Decide when each action happens during a Mandir visit, and sort it there.",
  "Place each action into the stage of the Mandir visit it belongs to.",
  "Categorise each action by when it takes place during worship.",
];

const RITUALS = [
  {
    name: "Arti",
    description: "A devotional ritual of offering light — a lit lamp (deepak) is waved in a circular motion before the deity, accompanied by devotional songs",
  },
  {
    name: "Parikrama (Parkarma)",
    description: "Walking clockwise around a deity, shrine, or sacred object, keeping it to one's right, as an act of reverence and focus",
  },
] as const;

const FACT_QUESTIONS = [
  {
    q: "Why do worshippers ring the bell on entering a Sanatan/Hindu Mandir?",
    correct: "To announce their arrival and awaken their attention before worship",
    distractors: ["To call other worshippers to leave", "To signal that a festival has begun", "To mark the end of Arti"],
  },
  {
    q: "Why is footwear removed before entering a Mandir?",
    correct: "To keep the shrine clean and show respect and humility before the deity",
    distractors: ["Because footwear is too expensive to wear inside", "Because it is a rule set only for priests", "Because footwear is needed for Parikrama"],
  },
  {
    q: "What does receiving prasad at the end of worship represent?",
    correct: "A blessed offering shared with worshippers as a sign of the deity's grace",
    distractors: ["A ticket needed to enter the Mandir next time", "Payment for attending the ceremony", "A snack unrelated to the worship"],
  },
] as const;

const PHASE_ITEMS = [
  { text: "Removing footwear before stepping into the Mandir", bucket: "before" },
  { text: "Washing hands and feet before approaching the shrine", bucket: "before" },
  { text: "Ringing the temple bell on entering the shrine hall", bucket: "during" },
  { text: "Waving a lit lamp before the deity during Arti", bucket: "during" },
  { text: "Walking clockwise around the deity during Parikrama", bucket: "during" },
  { text: "Receiving prasad, a blessed offering, before leaving", bucket: "after" },
  { text: "Bowing and taking respectful leave of the deity", bucket: "after" },
] as const;
const PHASE_LABEL: Record<string, string> = { before: "Before entering the shrine", during: "During worship", after: "After worship" };

const VISIT_STEPS = [
  { id: "footwear", label: "Remove footwear before stepping into the Mandir" },
  { id: "wash", label: "Wash hands and feet before approaching the shrine" },
  { id: "bell", label: "Ring the temple bell on entering the shrine hall" },
  { id: "arti", label: "Offer prayers and perform Arti before the deity" },
  { id: "parikrama", label: "Perform Parikrama, walking clockwise around the deity" },
  { id: "prasad", label: "Receive prasad and take respectful leave" },
];

export const protocolsInSanatanDharma: Skill = {
  id: "g8-hre-rp-protocols-in-sanatan-dharma",
  code: "RP.1",
  subjectId: "hre",
  strandId: "g8-hre-rp",
  grade: 8,
  title: "Protocols in Sanatan Dharma",
  description: "Protocols and etiquette observed in a Sanatan/Hindu Mandir, including Arti and Parikrama (circumambulation).",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "fill", "order", "categorize"] as const);
    const hint = "Arti is about offering light to the deity; Parikrama is about walking reverently around the deity.";

    if (branch === "mc") {
      if (rng() < 0.5) {
        const target = randChoice(rng, RITUALS);
        const other = RITUALS.find((r) => r.name !== target.name)!;
        const choices = shuffle(rng, [target.name, other.name, "Mangal Divo", "Antim Sanskaar"]);
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
        acceptedAnswers: target.name === "Parikrama (Parkarma)" ? ["Parikrama", "Parkarma"] : [target.name],
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
        hint: "Etiquette comes first (footwear, cleanliness), then worship itself (bell, Arti, Parikrama), then leaving with prasad.",
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
