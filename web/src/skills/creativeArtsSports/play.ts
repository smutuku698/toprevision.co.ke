import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SCRIPT_ELEMENTS: { id: string; label: string }[] = [
  { id: "title", label: "Title of the play" },
  { id: "playwright", label: "Playwright's name" },
  { id: "characters", label: "List of characters" },
  { id: "setting", label: "Setting (time and place description)" },
  { id: "actscene", label: "Act and scene heading (e.g. Act 1, Scene 1)" },
  { id: "stagedirections", label: "Stage directions" },
  { id: "dialogue", label: "Dialogue (the characters' spoken lines)" },
];

const BELIEVABLE_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What makes a play performance believable to an audience?",
    correct: "Actors staying in character and using appropriate stage directions, tone, and setting",
    distractors: ["Reading directly from a script without any expression", "Ignoring the setting and props entirely", "Rushing through the dialogue as fast as possible"],
  },
  {
    q: "Why is it important to decorate props used in a play performance?",
    correct: "Well-decorated props help create a convincing setting and support the story",
    distractors: ["Props are never seen by the audience, so decoration is not needed", "Decorating props only makes the play last longer", "It is only done for professional theatres, never school plays"],
  },
  {
    q: "What is a 'one-act play'?",
    correct: "A short play that takes place in a single continuous act, without multiple act breaks",
    distractors: ["A play performed by only one actor", "A play with no dialogue", "A play that lasts only one minute"],
  },
  {
    q: "How can a play performance help address a societal issue?",
    correct: "By dramatising a real social problem so the audience reflects on and discusses it",
    distractors: ["By avoiding any topic connected to real life", "By using only historical topics", "By removing dialogue and using mime only"],
  },
];

const FORMAT_PROMPTS = [
  "Arrange these elements of a script in the order they typically appear from the start of a script.",
  "Put these script elements in the order they usually appear, from first to last.",
  "Order these parts of a script the way they normally appear.",
  "Sort these script elements into the sequence they usually follow.",
  "Place these elements of a script in their typical order.",
] as const;

export const play: Skill = {
  id: "cas-play",
  code: "C.8",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Play",
  description: "The format of a script, and what makes a play performance believable and meaningful.",
  generate(rng) {
    const branch = randChoice(rng, ["format", "believable"] as const);

    if (branch === "format") {
      const correctOrder = SCRIPT_ELEMENTS.map((s) => s.id);

      return {
        kind: "ordering",
        prompt: randChoice(rng, FORMAT_PROMPTS),
        instruction: "Click the elements in order, from first to last.",
        items: shuffle(rng, SCRIPT_ELEMENTS),
        correctOrder,
        hint: "A script opens with its title and author, then lists who is in it, before the story itself begins.",
        explanation: `A script typically follows this format: ${SCRIPT_ELEMENTS.map((s) => s.label).join(" → ")}.`,
      };
    }

    const q = randChoice(rng, BELIEVABLE_QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "A believable performance combines character, setting, props, and stage directions to tell a convincing story.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
