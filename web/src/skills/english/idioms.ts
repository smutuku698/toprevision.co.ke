import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const IDIOMS: { idiom: string; meaning: string; sentence: string }[] = [
  { idiom: "break the ice", meaning: "to do or say something that relieves tension or awkwardness in a new situation", sentence: "To ___ at the start of the meeting, the teacher asked everyone to share a fun fact." },
  { idiom: "hit the books", meaning: "to study hard", sentence: "With exams next week, it's time to ___." },
  { idiom: "feel under the weather", meaning: "to feel slightly ill", sentence: "I might not come to school today — I ___." },
  { idiom: "cost an arm and a leg", meaning: "to be very expensive", sentence: "That new phone must have ___." },
  { idiom: "once in a blue moon", meaning: "very rarely", sentence: "We only visit our cousins upcountry ___." },
  { idiom: "spill the beans", meaning: "to reveal a secret", sentence: "Please don't ___ about the surprise party!" },
  { idiom: "be on the ball", meaning: "to be alert and quick to understand or react", sentence: "Our class captain is always ___ when it comes to organizing events." },
  { idiom: "burn the midnight oil", meaning: "to work or study late into the night", sentence: "She had to ___ to finish her project before the deadline." },
  { idiom: "be a piece of cake", meaning: "to be something very easy to do", sentence: "Don't worry about the test — it will ___." },
  { idiom: "hit the nail on the head", meaning: "to describe exactly what is causing a situation or problem", sentence: "When she explained the mistake, she really ___." },
];

export const idioms: Skill = {
  id: "eng-w-idioms",
  code: "W.3",
  subjectId: "english",
  strandId: "eng-writing",
  grade: 9,
  title: "Idioms in context",
  description: "Choose the idiom that matches a given meaning and completes the sentence.",
  generate(rng) {
    const hint = "Read the sentence with each choice in place — only one matches the given meaning.";

    if (rng() < 0.4) {
      const chosen = shuffle(rng, IDIOMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((i) => ({ id: i.idiom, label: i.idiom })));
      const targets = shuffle(rng, chosen.map((i) => ({ id: i.idiom, label: i.meaning })));
      const correctMap: Record<string, string> = {};
      for (const i of chosen) correctMap[i.idiom] = i.idiom;

      return {
        kind: "click-match",
        prompt: "Match each idiom to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((i) => `"${i.idiom}" — ${i.meaning}.`).join(" "),
      };
    }

    const entry = randChoice(rng, IDIOMS);
    const distractorPool = IDIOMS.filter((i) => i.idiom !== entry.idiom);
    const distractors = shuffle(rng, distractorPool)
      .slice(0, 3)
      .map((d) => d.idiom);
    const choices = shuffle(rng, [entry.idiom, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Choose the idiom that means "${entry.meaning}" and completes this sentence: "${entry.sentence}"`,
      choices,
      correctIndex: choices.indexOf(entry.idiom),
      layout: "list",
      hint,
      explanation: `"${entry.idiom}" means "${entry.meaning}", so the sentence reads: "${entry.sentence.replace("___", entry.idiom)}"`,
    };
  },
};
