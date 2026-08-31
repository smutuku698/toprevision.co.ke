import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Deep in the forest lived Chemayanet, an ogre who could swallow a whole village whole, yet he never showed his true form. Instead, he carried an enchanted drum whose beat sounded sweeter than any village dance, and he would sit at the forest's edge, drumming softly until curious children wandered close to listen. The moment a child stepped past the last mango tree, Chemayanet's arm would shoot out and swallow them whole. One evening, a clever girl named Chelagat noticed that the drumbeat never matched any song her grandmother had taught her, so she warned the other children to stay near the homestead no matter how sweet the sound. When Chemayanet's drumming failed to lure anyone that night, he slunk back into the forest, hungry and forgotten.";

const SYMBOL_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does the ogre Chemayanet represent symbolically in this narrative?",
    correct: "A hidden danger disguised as something appealing and tempting",
    distractors: [
      "A kind protector who watches over the forest's children",
      "Harmless entertainment meant only to amuse the village",
      "A musician hired to perform at village dances",
    ],
    explanation: "Chemayanet uses a sweet-sounding drum to lure children into danger — the ogre represents how threats can disguise themselves as something appealing.",
  },
];

const TRAIT_MATCH: { name: string; evidence: string }[] = [
  { name: "Chelagat", evidence: "Perceptive and cautious — she notices the strange drumbeat and warns the other children" },
  { name: "Chemayanet", evidence: "Deceptive and predatory — he lures children with a sweet sound in order to swallow them" },
];

const REAL_LIFE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What real-life safety lesson does this monster narrative teach?",
    correct: "Something that seems appealing, like sweet music from a stranger, can hide real danger, so we should stay cautious",
    distractors: [
      "It is always safe to follow any sound that seems pleasant",
      "Children should never listen to any kind of music",
      "Only ogres can be dangerous, so other strangers are always safe",
    ],
    explanation: "Chelagat's caution about an unfamiliar, overly sweet sound reflects a real-life lesson: unfamiliar temptations from strangers can disguise danger, so caution matters.",
  },
];

const CHARACTER_CATEGORY: { text: string; category: "chemayanet" | "chelagat" }[] = [
  { text: "Carries an enchanted drum to lure children close", category: "chemayanet" },
  { text: "Can swallow a whole village whole", category: "chemayanet" },
  { text: "Notices the drumbeat does not match any known song", category: "chelagat" },
  { text: "Warns the other children to stay near the homestead", category: "chelagat" },
];

const IMPORTANCE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why are monster narratives like this one important, beyond entertainment?",
    correct: "They use symbolism to teach children caution and safety lessons in a memorable way",
    distractors: [
      "They exist only to frighten children with no other purpose",
      "They are meant to be taken as literal historical events",
      "They discourage children from ever trusting anyone, including family",
    ],
    explanation: "By dressing a real-world danger (deceptive temptation) as an ogre with a magical drum, the story delivers a caution lesson in a form children remember.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "he would sit at the forest's edge, drumming softly until curious children", after: " to listen.", correctAnswer: "wandered close" },
  { before: "she noticed that the drumbeat never matched any song her", after: " had taught her.", correctAnswer: "grandmother" },
  { before: "he slunk back into the forest, hungry and", after: ".", correctAnswer: "forgotten" },
];

export const monsterNarrativeCharacters: Skill = {
  id: "g7-eng-r-monster-narrative-characters",
  code: "R.25",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Characters and Their Traits — Monster Narratives",
  description: "Identify characters and their traits in monster narratives, relate the narratives to real life, and appreciate their importance in teaching caution.",
  generate(rng) {
    const branch = randChoice(rng, ["symbol", "match", "real-life", "categorize", "importance", "fill"] as const);
    const hint = "Monster narratives often use a frightening creature to symbolise a real danger, teaching listeners to be careful.";

    if (branch === "symbol") {
      const entry = randChoice(rng, SYMBOL_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, TRAIT_MATCH.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, TRAIT_MATCH.map((t) => ({ id: t.name, label: t.evidence })));
      const correctMap: Record<string, string> = {};
      for (const t of TRAIT_MATCH) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each character to the trait shown by their actions in the story.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Look at what each character does, not just how they are described.",
        explanation: TRAIT_MATCH.map((t) => `${t.name} — ${t.evidence.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "real-life") {
      const entry = randChoice(rng, REAL_LIFE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what Chelagat's caution about the strange sound teaches us about strangers and temptation.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CHARACTER_CATEGORY);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each statement by which character it describes.",
        passage: STORY,
        items,
        buckets: [
          { id: "chemayanet", label: "Describes Chemayanet" },
          { id: "chelagat", label: "Describes Chelagat" },
        ],
        correctBucket,
        hint: "Chemayanet is the dangerous ogre; Chelagat is the alert girl who protects the other children.",
        explanation: chosen.map((c) => `"${c.text}" describes ${c.category === "chemayanet" ? "Chemayanet" : "Chelagat"}.`).join(" "),
      };
    }

    if (branch === "importance") {
      const entry = randChoice(rng, IMPORTANCE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word(s) from the story.",
      passage: STORY,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Look for the exact words in the passage above.",
      explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
    };
  },
};
