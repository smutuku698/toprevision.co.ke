import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PROVERBS: { proverb: string; meaning: string }[] = [
  { proverb: "A stitch in time saves nine.", meaning: "Dealing with a small problem now prevents it from becoming a bigger problem later." },
  { proverb: "Actions speak louder than words.", meaning: "What people actually do matters more than what they say they will do." },
  { proverb: "Don't count your chickens before they hatch.", meaning: "Don't assume something will succeed before it actually happens." },
  { proverb: "The early bird catches the worm.", meaning: "People who act early or arrive first have the best chance of success." },
  { proverb: "Practice makes perfect.", meaning: "Repeating an activity regularly helps you become skilled at it." },
  { proverb: "Look before you leap.", meaning: "Think carefully about the consequences before doing something risky." },
  { proverb: "Two heads are better than one.", meaning: "It's easier to solve a problem when people work together than alone." },
  { proverb: "Every cloud has a silver lining.", meaning: "Even a difficult or unpleasant situation has some positive side to it." },
  { proverb: "Honesty is the best policy.", meaning: "Being truthful is always the wisest way to behave, even when it's hard." },
  { proverb: "Where there is a will, there is a way.", meaning: "If you are determined enough, you will find a way to achieve your goal." },
];

export const proverbs: Skill = {
  id: "eng-ls-proverbs",
  code: "LS.3",
  subjectId: "english",
  strandId: "eng-listening-speaking",
  grade: 9,
  title: "Proverbs and their meanings",
  description: "Match each proverb to its meaning.",
  generate(rng) {
    const hint = "Think about the underlying lesson or advice each proverb is trying to teach, not just its literal words.";

    if (rng() < 0.4) {
      const target = randChoice(rng, PROVERBS);
      const distractors = shuffle(rng, PROVERBS.filter((p) => p.proverb !== target.proverb)).slice(0, 3);
      const choices = shuffle(rng, [target.proverb, ...distractors.map((d) => d.proverb)]);

      return {
        kind: "multiple-choice",
        prompt: `Which proverb means: "${target.meaning}"?`,
        choices,
        correctIndex: choices.indexOf(target.proverb),
        layout: "list",
        hint,
        explanation: `"${target.proverb}" — ${target.meaning}`,
      };
    }

    const chosen = shuffle(rng, PROVERBS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.proverb, label: p.proverb })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.proverb, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.proverb] = p.proverb;

    return {
      kind: "click-match",
      prompt: "Match each proverb to its meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Think about the underlying lesson or advice each proverb is trying to teach, not just its literal words.",
      explanation: chosen.map((p) => `"${p.proverb}" — ${p.meaning}`).join(" "),
    };
  },
};
