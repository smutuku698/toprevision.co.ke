import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is a 'bird's-eye view' in photography?",
    correct: "A photograph taken from high above, looking down on the subject",
    distractors: ["A photograph taken from ground level looking up", "A photograph taken at the subject's own eye level", "A photograph with no visible horizon"],
  },
  {
    q: "What is a 'worm's-eye view' in photography?",
    correct: "A photograph taken from very low down, looking up at the subject",
    distractors: ["A photograph taken from directly above", "A photograph taken at eye level", "A photograph using only black and white film"],
  },
  {
    q: "What is a 'normal viewpoint' in photography?",
    correct: "A photograph taken at the photographer's natural eye level",
    distractors: ["A photograph taken only from far away", "A photograph taken only indoors", "A photograph with no subject"],
  },
  {
    q: "Which of these is an example of a scenic point suitable for photography?",
    correct: "A notable geographical feature, such as a hill, lake, or waterfall",
    distractors: ["A blank wall with no features", "A closed box", "A page of text"],
  },
  {
    q: "Why should a photographer consider viewpoint when composing a photograph?",
    correct: "Different viewpoints change the mood, scale, and impact of the image",
    distractors: ["Viewpoint has no effect on the final photograph", "Only one viewpoint is ever technically possible", "Viewpoint only matters for video, not photos"],
  },
  {
    q: "Which of these is an ethical issue to consider in photography?",
    correct: "Getting a person's consent before photographing and publishing their image",
    distractors: ["Using the most expensive camera available", "Always photographing in bird's-eye view", "Printing photographs in colour instead of black and white"],
  },
  {
    q: "Why is a caption important when presenting a photograph?",
    correct: "It gives context and explains what the photograph shows",
    distractors: ["It makes the photograph load faster", "It replaces the need for a good viewpoint", "It is required only for bird's-eye shots"],
  },
  {
    q: "What should be considered when arranging photographs for a showcase presentation?",
    correct: "A logical, visually appealing order that tells a clear story",
    distractors: ["Random order with no thought to layout", "Only using the largest photographs available", "Removing all captions"],
  },
];

const VIEWPOINTS: { term: string; meaning: string }[] = [
  { term: "Bird's-eye view", meaning: "A photograph taken from high above, looking down on the subject" },
  { term: "Worm's-eye view", meaning: "A photograph taken from very low down, looking up at the subject" },
  { term: "Normal viewpoint", meaning: "A photograph taken at the photographer's natural eye level" },
];

const MATCH_PROMPTS = [
  "Match each photography viewpoint to what it means.",
  "Pair each viewpoint term with its correct meaning.",
  "Match each viewpoint to what it describes.",
  "Connect each photography viewpoint to its correct meaning.",
  "For each viewpoint below, choose its matching meaning.",
] as const;

export const photography: Skill = {
  id: "cas-photography",
  code: "C.6",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Photography",
  description: "Viewpoints, scenic points, ethics, and presentation of photographs.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIEWPOINTS.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, VIEWPOINTS.map((v) => ({ id: v.term, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of VIEWPOINTS) correctMap[v.term] = v.term;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Viewpoint describes where the camera is relative to the subject: normal (eye level), bird's-eye (above), or worm's-eye (below).",
        explanation: VIEWPOINTS.map((v) => `${v.term} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Viewpoint describes where the camera is relative to the subject: normal (eye level), bird's-eye (above), or worm's-eye (below).",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
