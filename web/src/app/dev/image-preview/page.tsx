"use client";

// TEMPORARY preview route — not part of the real curriculum. Lets us view a labelled photo image inside the
// actual PracticeSession UI (real Visual/PhotoDiagram rendering, real card chrome) before deciding how/whether
// to wire it into a real skill. Safe to delete this file (and public/images/grade6/land-invertebrates.*) once
// the preview has been reviewed.

import { PracticeSession } from "@/components/quiz/PracticeSession";
import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";

const LETTERED_ANIMALS = [
  { letter: "A", label: "Beetle (an insect)" },
  { letter: "B", label: "Spider" },
  { letter: "C", label: "Tick" },
  { letter: "D", label: "Millipede" },
  { letter: "E", label: "Centipede" },
  { letter: "F", label: "Snail" },
  { letter: "G", label: "Slug" },
  { letter: "H", label: "Earthworm" },
] as const;

const previewSkill: Skill = {
  id: "dev-preview-land-invertebrates",
  code: "PREVIEW",
  subjectId: "science",
  strandId: "dev-preview",
  grade: 6,
  title: "Image preview — land invertebrates",
  description: "Temporary preview skill for checking photo-diagram image rendering.",
  generate(rng) {
    const target = randChoice(rng, LETTERED_ANIMALS);
    const wrong = shuffle(rng, LETTERED_ANIMALS.filter((a) => a.letter !== target.letter)).slice(0, 3);
    const choices = shuffle(rng, [target.label, ...wrong.map((w) => w.label)]);
    return {
      kind: "multiple-choice",
      prompt: `Which invertebrate is labelled ${target.letter} in the image?`,
      visual: { type: "photo-diagram", image: "/images/grade6/land-invertebrates.webp", alt: "Eight land invertebrates labelled A to H" },
      choices,
      correctIndex: choices.indexOf(target.label),
      layout: "list",
      explanation: `${target.letter} is the ${target.label}.`,
    };
  },
};

export default function ImagePreviewPage() {
  return <PracticeSession key={previewSkill.id} skill={previewSkill} backHref="/" backLabel="Back home" />;
}
