import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// Simplified but scientifically accurate order of key stages in human evolution.
const EVOLUTION_STAGES = [
  { id: "australopithecus", label: "Australopithecus — early ape-like ancestor, walked upright on two legs" },
  { id: "habilis", label: "Homo habilis — 'handy man', first to make and use simple stone tools" },
  { id: "erectus", label: "Homo erectus — taller, larger brain, first to control and use fire" },
  { id: "sapiens", label: "Homo sapiens — modern humans, complex language, art, and technology" },
];

const EVIDENCE_FACTS = [
  { text: "Fossils are preserved by covering excavation sites to protect them from weather damage", bucket: "preservation" },
  { text: "Fossilised remains and tools are stored and displayed in museums for study", bucket: "preservation" },
  { text: "Excavation sites are fenced off and guarded to prevent looting or vandalism", bucket: "preservation" },
  { text: "Scientists study the shape of skulls and bones to compare early humans with modern humans", bucket: "study" },
  { text: "Researchers use dating methods to estimate the age of fossils and stone tools", bucket: "study" },
  { text: "Archaeologists examine tools found alongside fossils to learn how early humans lived", bucket: "study" },
] as const;

const AFRICA_REASONS = [
  "The oldest hominid fossils ever discovered have been found in East Africa, such as at Olduvai Gorge and Turkana",
  "Africa has the greatest diversity of primate fossils, showing a long, continuous line of human evolution",
  "Genetic studies of modern human populations show the greatest diversity in African populations, consistent with humans originating there first",
  "Stone tools found in Africa are older than similar tools found on any other continent",
] as const;

const PRESERVATION_LABEL: Record<string, string> = {
  preservation: "A strategy for preserving fossil remains",
  study: "A method used to study human origin",
};

export const humanOrigin: Skill = {
  id: "g8-ss-pr-human-origin",
  code: "PR.1",
  subjectId: "social-studies",
  strandId: "g8-ss-pr",
  grade: 8,
  title: "Scientific theory about human origin",
  description: "Stages in the scientific theory of human evolution, strategies for preserving and studying early human remains, and reasons Africa is considered the cradle of humanity.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "stage-match", "evidence", "cradle"] as const);

    if (branch === "order") {
      const items = shuffle(rng, EVOLUTION_STAGES);
      return {
        kind: "ordering",
        prompt: "Arrange these stages of human evolution from earliest to most recent.",
        instruction: "Drag to reorder from earliest to most recent.",
        items,
        correctOrder: EVOLUTION_STAGES.map((s) => s.id),
        hint: "Look for clues like brain size, tool use, and posture — these developed gradually over time.",
        explanation: EVOLUTION_STAGES.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "stage-match") {
      const names = ["Australopithecus", "Homo habilis", "Homo erectus", "Homo sapiens"];
      const clues: Record<string, string> = {
        "Australopithecus": "Walked upright but had a small, ape-like brain",
        "Homo habilis": "First hominid known to make and use simple stone tools",
        "Homo erectus": "First hominid known to control and use fire",
        "Homo sapiens": "Developed complex language, art, and modern technology",
      };
      const tokens = shuffle(rng, names.map((n) => ({ id: n, label: n })));
      const targets = shuffle(rng, names.map((n) => ({ id: n, label: clues[n] })));
      const correctMap: Record<string, string> = {};
      for (const n of names) correctMap[n] = n;
      return {
        kind: "click-match",
        prompt: "Match each early human stage to the change it is best known for.",
        tokens,
        targets,
        correctMap,
        hint: "Each stage represents a major change — posture, tool use, fire, or complex thought.",
        explanation: names.map((n) => `${n}: ${clues[n]}.`).join(" "),
      };
    }

    if (branch === "evidence") {
      const chosen = shuffle(rng, EVIDENCE_FACTS).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((f) => f.bucket))).map((b) => ({ id: b, label: PRESERVATION_LABEL[b] }));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as either preserving fossil remains or studying human origin.",
        items,
        buckets,
        correctBucket,
        hint: "Preservation protects the physical remains; study is about analysing them to draw conclusions.",
        explanation: chosen.map((f) => `"${f.text}" — ${PRESERVATION_LABEL[f.bucket].toLowerCase()}.`).join(" "),
      };
    }

    // cradle
    const correct = randChoice(rng, AFRICA_REASONS);
    const others = AFRICA_REASONS.filter((r) => r !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Which of these is a reason Africa is considered the cradle of humanity?",
      choices,
      correctIndex,
      hint: "Think about fossil evidence, tool age, and genetic diversity findings from Africa.",
      explanation: `${correct} — this is one of the key reasons scientists consider Africa the cradle of humanity.`,
    };
  },
};
