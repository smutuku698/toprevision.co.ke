import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PLAY_EXCERPT = `GRANDMOTHER: Come, sit here beside me. Do you see this beaded ornament? It belonged to your great-grandmother.
MWENDE: It's beautiful! Did she wear it every day?
GRANDMOTHER: No, only during ceremonies. Each colour and pattern tells a story about our family's history.
MWENDE: I want to learn to make one just like it, so I can pass it on too.
GRANDMOTHER: Then tomorrow, we begin. Heritage is only kept alive when it is shared.`;

const COMPREHENSION = [
  {
    prompt: "What is Grandmother mainly trying to teach Mwende in this scene?",
    choices: [
      "That their family's heritage is kept alive by being shared and passed on",
      "That beaded ornaments are too fragile to touch",
      "That ceremonies happen every single day",
      "That Mwende should sell the ornament",
    ],
    correctIndex: 0,
    explanation: "Grandmother's final line — \"Heritage is only kept alive when it is shared\" — is the scene's central message.",
  },
  {
    prompt: "According to Grandmother, when was the ornament worn?",
    choices: ["Only during ceremonies", "Every single day", "Only at night", "Never — it was just for display"],
    correctIndex: 0,
    explanation: "Grandmother says the ornament was worn \"only during ceremonies.\"",
  },
];

const VOCABULARY: { term: string; meaning: string }[] = [
  { term: "Heritage", meaning: "the traditions, values, and history passed down through generations" },
  { term: "Ceremony", meaning: "a formal event held to mark an important occasion" },
  { term: "Ornament", meaning: "an object worn or displayed to decorate or beautify" },
  { term: "Pattern", meaning: "a repeated design or arrangement" },
];

export const heritagePlays: Skill = {
  id: "il-r-heritage-plays",
  code: "R.5",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "Cultural heritage: reading a play for information",
  description: "Read a short play scene about cultural heritage, answer comprehension questions, and match its vocabulary to meanings.",
  generate(rng) {
    if (rng() < 0.5) {
      const q = randChoice(rng, COMPREHENSION);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);

      return {
        kind: "multiple-choice",
        passage: PLAY_EXCERPT,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Reread the dialogue and look for the line that directly answers the question.",
        explanation: q.explanation,
      };
    }

    const tokens = shuffle(rng, VOCABULARY.map((v) => ({ id: v.term, label: v.term })));
    const targets = shuffle(rng, VOCABULARY.map((v) => ({ id: v.term, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of VOCABULARY) correctMap[v.term] = v.term;

    return {
      kind: "click-match",
      passage: PLAY_EXCERPT,
      prompt: "Match each word from the play to its meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Look for how each word is used in the dialogue for a clue to its meaning.",
      explanation: VOCABULARY.map((v) => `${v.term} — ${v.meaning}.`).join(" "),
    };
  },
};
