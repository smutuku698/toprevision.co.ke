import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ADJ_PAIRS: { base: string; adjective: string; suffix: "ful" | "ous" | "ive" | "al" }[] = [
  { base: "help", adjective: "helpful", suffix: "ful" },
  { base: "care", adjective: "careful", suffix: "ful" },
  { base: "skill", adjective: "skilful", suffix: "ful" },
  { base: "power", adjective: "powerful", suffix: "ful" },
  { base: "use", adjective: "useful", suffix: "ful" },
  { base: "success", adjective: "successful", suffix: "ful" },
  { base: "danger", adjective: "dangerous", suffix: "ous" },
  { base: "fame", adjective: "famous", suffix: "ous" },
  { base: "courage", adjective: "courageous", suffix: "ous" },
  { base: "adventure", adjective: "adventurous", suffix: "ous" },
  { base: "create", adjective: "creative", suffix: "ive" },
  { base: "act", adjective: "active", suffix: "ive" },
  { base: "attract", adjective: "attractive", suffix: "ive" },
  { base: "profession", adjective: "professional", suffix: "al" },
  { base: "music", adjective: "musical", suffix: "al" },
  { base: "nature", adjective: "natural", suffix: "al" },
] as const;

const SUFFIX_LABEL: Record<string, string> = {
  ful: "Formed by adding -ful",
  ous: "Formed by adding -ous",
  ive: "Formed by adding -ive",
  al: "Formed by adding -al",
};

const CORRECT_ADJECTIVE_MC: { base: string; profession: string; correct: string; distractors: string[] }[] = [
  { base: "danger", profession: "mining", correct: "dangerous", distractors: ["dangerful", "dangerive", "dangeral"] },
  { base: "help", profession: "nursing", correct: "helpful", distractors: ["helpous", "helpive", "helpal"] },
  { base: "create", profession: "fashion design", correct: "creative", distractors: ["createful", "createous", "createal"] },
  { base: "music", profession: "teaching", correct: "musical", distractors: ["musicful", "musicous", "musicive"] },
  { base: "courage", profession: "firefighting", correct: "courageous", distractors: ["courageful", "courageive", "courageal"] },
  { base: "attract", profession: "modelling", correct: "attractive", distractors: ["attractful", "attractous", "attractal"] },
  { base: "profession", profession: "law", correct: "professional", distractors: ["professionful", "professionous", "professionive"] },
  { base: "power", profession: "engineering", correct: "powerful", distractors: ["powerous", "powerive", "poweral"] },
];

const IDENTIFY_WORDCLASS_MC: { sentence: string; correct: string; distractors: string[] }[] = [
  { sentence: "The helpful mechanic repaired the matatu quickly before the long journey.", correct: "helpful", distractors: ["mechanic", "repaired", "quickly"] },
  { sentence: "Working underground as a miner in Kitui is dangerous and requires much courage.", correct: "dangerous", distractors: ["miner", "requires", "courage"] },
  { sentence: "The creative fashion designer sketched new outfits happily every morning.", correct: "creative", distractors: ["designer", "sketched", "happily"] },
  { sentence: "The successful entrepreneur opened a new shop confidently last month.", correct: "successful", distractors: ["entrepreneur", "opened", "confidently"] },
  { sentence: "The attractive uniform of the pilot impressed the young learners greatly.", correct: "attractive", distractors: ["uniform", "impressed", "greatly"] },
  { sentence: "Being an active firefighter, Otieno trains at the station every day.", correct: "active", distractors: ["firefighter", "trains", "station"] },
  { sentence: "The professional journalist interviewed witnesses swiftly after the accident.", correct: "professional", distractors: ["journalist", "interviewed", "witnesses"] },
  { sentence: "A careful surgeon explained his daily duties calmly to the visiting students.", correct: "careful", distractors: ["surgeon", "explained", "duties"] },
];

const CONSTRUCT_FILL: { before: string; after: string; correctAnswer: string; base: string }[] = [
  { before: "A firefighter must stay ", after: " when rescuing people from a burning building.", correctAnswer: "careful", base: "care" },
  { before: "Working on a construction site can be very ", after: " if safety rules are ignored.", correctAnswer: "dangerous", base: "danger" },
  { before: "The fashion designer showed how ", after: " she could be by inventing bold new styles.", correctAnswer: "creative", base: "create" },
  { before: "Every pilot's uniform looks ", after: " with its sharp blue and gold colours.", correctAnswer: "attractive", base: "attract" },
  { before: "A ", after: " nurse checks on her patients throughout the night.", correctAnswer: "helpful", base: "help" },
  { before: "The young athlete trained hard and became a ", after: " footballer by the age of eighteen.", correctAnswer: "successful", base: "success" },
  { before: "An electrician needs ", after: " hands to wire a building safely.", correctAnswer: "skilful", base: "skill" },
];

export const formationOfAdjectives: Skill = {
  id: "g7-eng-g-formation-of-adjectives",
  code: "G.11",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Formation of Adjectives from Nouns and Verbs",
  description: "Recognise adjectives formed from nouns and verbs and use them correctly in sentences about professions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "wordclass-mc", "correct-mc", "match", "fill"] as const);

    if (branch === "categorize") {
      const fulPick = shuffle(rng, ADJ_PAIRS.filter((a) => a.suffix === "ful")).slice(0, 3);
      const ousPick = shuffle(rng, ADJ_PAIRS.filter((a) => a.suffix === "ous")).slice(0, 3);
      const chosen = shuffle(rng, [...fulPick, ...ousPick]);
      const buckets = [
        { id: "ful", label: SUFFIX_LABEL.ful },
        { id: "ous", label: SUFFIX_LABEL.ous },
      ];
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.adjective }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.suffix));
      return {
        kind: "categorize",
        prompt: "Sort each adjective by the suffix used to form it from its noun.",
        items,
        buckets,
        correctBucket,
        hint: "Look at the ending of each adjective — does it end in -ful or -ous?",
        explanation: chosen.map((a) => `"${a.adjective}" is formed from "${a.base}" by adding -${a.suffix}.`).join(" "),
      };
    }

    if (branch === "wordclass-mc") {
      const entry = randChoice(rng, IDENTIFY_WORDCLASS_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which word in this sentence is an adjective? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "An adjective describes a noun. Check which word tells you more about a person, thing, or job — not an action or a manner word.",
        explanation: `"${entry.correct}" is the adjective in this sentence: "${entry.sentence}" The other options are a noun, a verb, or an adverb, not an adjective.`,
      };
    }

    if (branch === "correct-mc") {
      const entry = randChoice(rng, CORRECT_ADJECTIVE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `A worker in ${entry.profession} needs to describe their job. Which is the correctly formed adjective from "${entry.base}"?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Only one suffix actually forms a real English word from this base — the others are not real spellings.",
        explanation: `"${entry.correct}" is correct. The other options are not real English words — only the correct suffix combines with "${entry.base}" to form an adjective.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ADJ_PAIRS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: a.base })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: a.adjective })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a, i) => (correctMap[`a${i}`] = `a${i}`));
      return {
        kind: "click-match",
        prompt: "Match each noun or verb to the adjective formed from it.",
        tokens,
        targets,
        correctMap,
        hint: "Add the correct suffix (-ful, -ous, -ive, or -al) to each base word to form its adjective.",
        explanation: chosen.map((a) => `"${a.base}" becomes "${a.adjective}" by adding -${a.suffix}.`).join(" "),
      };
    }

    const entry = randChoice(rng, CONSTRUCT_FILL);
    return {
      kind: "fill-blank",
      prompt: `Fill in the adjective formed from "${entry.base}".`,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Add the correct suffix to the base word so the sentence describes a person or thing properly.",
      explanation: `"${entry.correctAnswer}" is the adjective formed from "${entry.base}": "${entry.before}${entry.correctAnswer}${entry.after}" Using the correct adjective makes the description precise and easy to understand.`,
    };
  },
};
