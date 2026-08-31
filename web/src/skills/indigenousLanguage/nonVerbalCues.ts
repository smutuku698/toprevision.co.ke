import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CUES: { type: string; example: string }[] = [
  { type: "Gesture", example: "Waving a hand to welcome the audience" },
  { type: "Facial expression", example: "Smiling warmly while telling a happy part of the story" },
  { type: "Tonal variation", example: "Lowering the voice to build suspense" },
  { type: "Body movement", example: "Stepping forward to emphasize an important point" },
  { type: "Eye contact", example: "Looking around at different sections of the audience" },
  { type: "Posture", example: "Standing upright and confidently facing the audience" },
];

export const nonVerbalCues: Skill = {
  id: "il-ls-nonverbal-cues",
  code: "LS.5",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "Cultural heritage: non-verbal cues in presentations",
  description: "Match types of non-verbal cues to examples and identify which cue is being described in a presentation.",
  generate(rng) {
    const hint = "Non-verbal cues are anything other than the words themselves — gestures, expressions, tone, movement, eye contact, posture.";

    if (rng() < 0.4) {
      const chosen = shuffle(rng, CUES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.type, label: c.type })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.type, label: c.example })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.type] = c.type;

      return {
        kind: "click-match",
        prompt: "Match each non-verbal cue to an example of it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `${c.type} — ${c.example.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, CUES);
    const distractors = shuffle(rng, CUES.filter((c) => c.type !== entry.type)).slice(0, 3);
    const choices = shuffle(rng, [entry.type, ...distractors.map((d) => d.type)]);

    return {
      kind: "multiple-choice",
      prompt: `A presenter is "${entry.example.toLowerCase()}". Which non-verbal cue is this?`,
      choices,
      correctIndex: choices.indexOf(entry.type),
      layout: "grid",
      hint,
      explanation: `This is an example of ${entry.type.toLowerCase()}: ${entry.example.toLowerCase()}.`,
    };
  },
};
