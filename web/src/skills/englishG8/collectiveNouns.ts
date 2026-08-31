import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Group = "people" | "animals";

const COLLECTIVE_NOUNS: { noun: string; of: string; group: Group }[] = [
  { noun: "team", of: "players", group: "people" },
  { noun: "family", of: "relatives", group: "people" },
  { noun: "class", of: "students", group: "people" },
  { noun: "jury", of: "jurors who decide a court case", group: "people" },
  { noun: "crowd", of: "people gathered together", group: "people" },
  { noun: "committee", of: "members chosen to make decisions", group: "people" },
  { noun: "choir", of: "singers", group: "people" },
  { noun: "audience", of: "listeners or viewers", group: "people" },
  { noun: "staff", of: "employees of an organisation", group: "people" },
  { noun: "herd", of: "cattle or elephants", group: "animals" },
  { noun: "flock", of: "birds or sheep", group: "animals" },
  { noun: "swarm", of: "bees or other flying insects", group: "animals" },
  { noun: "pride", of: "lions", group: "animals" },
  { noun: "pod", of: "dolphins or whales", group: "animals" },
  { noun: "troop", of: "baboons or monkeys", group: "animals" },
  { noun: "pack", of: "wolves or wild dogs", group: "animals" },
  { noun: "colony", of: "ants", group: "animals" },
  { noun: "school", of: "fish", group: "animals" },
] as const;

const GROUP_LABEL: Record<Group, string> = {
  people: "Mainly used for groups of people",
  animals: "Mainly used for groups of animals",
};

const PLURAL_FORMS: { singular: string; plural: string; wrong: string[] }[] = [
  { singular: "jury", plural: "juries", wrong: ["jurys", "juryes"] },
  { singular: "family", plural: "families", wrong: ["familys", "famalies"] },
  { singular: "colony", plural: "colonies", wrong: ["colonys", "colonies's"] },
  { singular: "class", plural: "classes", wrong: ["classs", "class's"] },
  { singular: "committee", plural: "committees", wrong: ["committee's", "committes"] },
  { singular: "herd", plural: "herds", wrong: ["herves", "herdes"] },
] as const;

const FILL_SENTENCES: { noun: string; before: string; after: string }[] = [
  { noun: "pride", before: "A ", after: " of lions dozed in the shade during the hottest part of the day." },
  { noun: "pod", before: "A ", after: " of dolphins leapt playfully alongside the fishing boat." },
  { noun: "troop", before: "A ", after: " of baboons raided the maize farm early in the morning." },
  { noun: "audience", before: "The whole ", after: " stood to applaud after the science fair presentation." },
  { noun: "swarm", before: "A ", after: " of bees buzzed around the flowering bushes in the school garden." },
  { noun: "choir", before: "The school ", after: " sang beautifully during the morning assembly." },
  { noun: "colony", before: "A ", after: " of ants marched steadily toward the spilt sugar." },
  { noun: "school", before: "A ", after: " of fish darted away as the fisherman's net entered the water." },
];

const SCENARIO_MC: { before: string; after: string; correct: string; distractors: string[] }[] = [
  { before: "A ", after: " of elephants moved slowly across the savannah grassland.", correct: "herd", distractors: ["flock", "swarm", "pride"] },
  { before: "The ", after: " voted unanimously to build a new science laboratory.", correct: "committee", distractors: ["audience", "swarm", "troop"] },
  { before: "A ", after: " of wild dogs hunted together at dusk near the reserve.", correct: "pack", distractors: ["pod", "pride", "colony"] },
  { before: "The ", after: " cheered loudly when the home team scored.", correct: "crowd", distractors: ["staff", "jury", "school"] },
  { before: "A ", after: " of geese flew south in a neat V-shape.", correct: "flock", distractors: ["herd", "pod", "troop"] },
];

export const collectiveNouns: Skill = {
  id: "g8-eng-g-collective-nouns",
  code: "G.2",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Collective Nouns",
  description: "Identify collective nouns and use their singular and plural forms correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "plural-mc", "scenario-mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, COLLECTIVE_NOUNS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.noun, label: c.noun })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.noun, label: `a group of ${c.of}` })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.noun] = c.noun;
      return {
        kind: "click-match",
        prompt: "Match each collective noun to the group it names.",
        tokens,
        targets,
        correctMap,
        hint: "A collective noun names a whole group treated as one unit.",
        explanation: chosen.map((c) => `A "${c.noun}" is a group of ${c.of}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, COLLECTIVE_NOUNS).slice(0, 6);
      const buckets = [
        { id: "people", label: GROUP_LABEL.people },
        { id: "animals", label: GROUP_LABEL.animals },
      ];
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.noun }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.group));
      return {
        kind: "categorize",
        prompt: "Sort each collective noun by whether it is mainly used for people or for animals.",
        items,
        buckets,
        correctBucket,
        hint: "Think about who or what usually forms this kind of group.",
        explanation: chosen.map((c) => `A "${c.noun}" is a group of ${c.of}, so it belongs with ${c.group}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_SENTENCES);
      return {
        kind: "fill-blank",
        prompt: "Fill in the collective noun that best completes the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.noun,
        inputMode: "text",
        hint: "Think of the specific word used for a group of the animals or people described.",
        explanation: `"${entry.noun}" is the collective noun that fits here: "${entry.before}${entry.noun}${entry.after}"`,
      };
    }

    if (branch === "plural-mc") {
      const entry = randChoice(rng, PLURAL_FORMS);
      const choices = shuffle(rng, [entry.plural, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: `What is the correct plural form of "${entry.singular}"?`,
        choices,
        correctIndex: choices.indexOf(entry.plural),
        layout: "list",
        hint: entry.singular.endsWith("y")
          ? "When a noun ends in a consonant plus 'y', change the 'y' to 'i' and add 'es'."
          : "Most collective nouns form their plural the regular way, by adding '-s' or '-es'.",
        explanation: entry.singular.endsWith("y")
          ? `Since "${entry.singular}" ends in a consonant plus 'y', the plural changes 'y' to 'i' and adds 'es': "${entry.plural}".`
          : `The plural of "${entry.singular}" is formed regularly by adding '-s' or '-es': "${entry.plural}".`,
      };
    }

    const entry = randChoice(rng, SCENARIO_MC);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: `Which collective noun best completes this sentence? "${entry.before}___${entry.after}"`,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Match the collective noun to the specific group of people or animals in the sentence.",
      explanation: `"${entry.correct}" is the collective noun that fits: "${entry.before}${entry.correct}${entry.after}"`,
    };
  },
};
