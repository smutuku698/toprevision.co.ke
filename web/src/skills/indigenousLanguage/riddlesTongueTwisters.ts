import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const RIDDLES: { riddle: string; answer: string; distractors: string[] }[] = [
  { riddle: "I have a hundred legs but cannot walk. What am I?", answer: "A centipede", distractors: ["A spider", "A snake", "A millipede's shadow"] },
  { riddle: "The more you take from me, the bigger I get. What am I?", answer: "A hole", distractors: ["A river", "A basket", "A shadow"] },
  { riddle: "I have hands but cannot clap. What am I?", answer: "A clock", distractors: ["A tree", "A doll", "A glove"] },
  { riddle: "I speak without a mouth and hear without ears. What am I?", answer: "An echo", distractors: ["A radio", "A ghost story", "A whisper"] },
  { riddle: "What has a neck but no head?", answer: "A bottle", distractors: ["A shirt", "A giraffe", "A road"] },
  { riddle: "I am full of holes but still hold water. What am I?", answer: "A sponge", distractors: ["A sieve", "A bucket", "A net"] },
];

const TONGUE_TWISTERS: { text: string; sound: string }[] = [
  { text: "Six thick thistle sticks stick together.", sound: "S" },
  { text: "Chesi cheerfully chews cheap cheese chunks.", sound: "CH" },
  { text: "Fresh fried fish, freshly fried.", sound: "F" },
  { text: "She sells seashells by the seashore.", sound: "S" },
  { text: "Big black bug bit a big black bear.", sound: "B" },
  { text: "Peter Piper picked a peck of pickled peppers.", sound: "P" },
];

export const riddlesTongueTwisters: Skill = {
  id: "il-ls-riddles-tonguetwisters",
  code: "LS.6",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "Economic activities: riddles and tongue twisters",
  description: "Solve riddles and match riddles to their answers as intensive listening practice.",
  generate(rng) {
    const hint = "Read the riddle carefully and think about what fits every clue, not just the first one.";

    if (rng() < 0.35) {
      const chosen = shuffle(rng, RIDDLES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.riddle, label: r.riddle })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.riddle, label: r.answer })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.riddle] = r.riddle;

      return {
        kind: "click-match",
        prompt: "Match each riddle to its correct answer.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((r) => `"${r.riddle}" — ${r.answer}.`).join(" "),
      };
    }

    if (rng() < 0.7) {
      const entry = randChoice(rng, RIDDLES);
      const choices = shuffle(rng, [entry.answer, ...entry.distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Solve the riddle: "${entry.riddle}"`,
        choices,
        correctIndex: choices.indexOf(entry.answer),
        layout: "list",
        hint,
        explanation: `The answer is "${entry.answer}" — it is the only thing that fits every clue in the riddle.`,
      };
    }

    const entry = randChoice(rng, TONGUE_TWISTERS);
    const otherSounds = Array.from(new Set(TONGUE_TWISTERS.filter((t) => t.sound !== entry.sound).map((t) => t.sound)));
    const choices = shuffle(rng, [entry.sound, ...shuffle(rng, otherSounds).slice(0, 3)]);

    return {
      kind: "multiple-choice",
      prompt: `In the tongue twister "${entry.text}", which sound is repeated to make it tricky to say quickly?`,
      choices,
      correctIndex: choices.indexOf(entry.sound),
      layout: "row",
      hint: "Look at the sound most of the words in the tongue twister start with.",
      explanation: `Most words in "${entry.text}" start with the "${entry.sound}" sound, which is what makes it hard to say quickly.`,
    };
  },
};
