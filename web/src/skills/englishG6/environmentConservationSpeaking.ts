import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedB";

// Theme 12 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Environment Conservation).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "conserve", meaning: "to protect from harm or destruction" },
  { word: "preserve", meaning: "to keep something in its original state" },
  { word: "restore", meaning: "to bring back to a former condition" },
  { word: "wildlife", meaning: "animals living in their natural habitat" },
  { word: "nature", meaning: "the physical world and its living things" },
  { word: "drought", meaning: "a long period without rain" },
  { word: "reforestation", meaning: "planting trees to replace a lost forest" },
  { word: "safeguard", meaning: "to protect from harm" },
  { word: "sustain", meaning: "to keep something going over time" },
  { word: "sewage", meaning: "waste water from homes and industry" },
  { word: "garbage", meaning: "waste material that is thrown away" },
  { word: "refuse", meaning: "rubbish or waste material" },
  { word: "pollute", meaning: "to make an environment dirty or harmful" },
  { word: "forest", meaning: "a large area covered with trees" },
  { word: "gullies", meaning: "deep channels cut into land by running water" },
  { word: "recycle", meaning: "to process waste for reuse" },
  { word: "soil erosion", meaning: "the wearing away of topsoil by wind or water" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "as long as", type: "fixed phrase", meaning: "provided that" },
  { text: "set on fire", type: "fixed phrase", meaning: "made to start burning" },
  { text: "be in trouble", type: "fixed phrase", meaning: "to be in a difficult situation" },
  { text: "as wide as the sky", type: "simile", meaning: "extremely wide or vast" },
  { text: "as green as grass", type: "simile", meaning: "very green in colour" },
  { text: "as clear as crystal", type: "simile", meaning: "perfectly clear" },
  { text: "as pure as snow", type: "simile", meaning: "completely clean and unspoiled" },
  { text: "The man is a tortoise. He walks so slowly", type: "metaphor", meaning: "calling someone a tortoise to show they move very slowly" },
  { text: "a drop in the ocean", type: "idiom", meaning: "a very small, insignificant amount compared to what is needed" },
  { text: "add fuel to the fire", type: "idiom", meaning: "to make a bad situation worse" },
  { text: "beat about the bush", type: "idiom", meaning: "to avoid talking directly about something" },
  { text: "the grass is always greener on the other side of the fence", type: "idiom", meaning: "other situations always seem better than your own" },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens" },
  { text: "the best things in life are free", type: "proverb", meaning: "the most valuable things don't cost money" },
  { text: "if you want to be happy for life, plant a tree", type: "proverb", meaning: "long-lasting happiness comes from lasting positive actions" },
  { text: "clean up", type: "phrasal verb", meaning: "to remove dirt or mess" },
  { text: "cut down", type: "phrasal verb", meaning: "to fell a tree, or to reduce something" },
  { text: "dry up", type: "phrasal verb", meaning: "to become completely dry" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.12");

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "as long as", type: "fixed phrase", meaning: "provided that", before: "The forest will recover ", after: " villagers stop cutting trees illegally." },
  { text: "be in trouble", type: "fixed phrase", meaning: "to be in a difficult situation", before: "Anyone caught polluting the river will ", after: " with local authorities." },
  { text: "as clear as crystal", type: "simile", meaning: "perfectly clear", before: "Before the factory opened, the stream water was ", after: "." },
  { text: "as green as grass", type: "simile", meaning: "very green in colour", before: "After the reforestation project, the hillside became ", after: "." },
  { text: "a drop in the ocean", type: "idiom", meaning: "a very small, insignificant amount compared to what is needed", before: "Planting just ten trees felt like ", after: " compared to what was lost." },
  { text: "add fuel to the fire", type: "idiom", meaning: "to make a bad situation worse", before: "Dumping more garbage into the gully only served to ", after: "." },
  { text: "beat about the bush", type: "idiom", meaning: "to avoid talking directly about something", before: "The village elder told them to stop and \"", after: "\" about the soil erosion problem." },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens", before: "Building terraces before the rains proves that \"", after: "\"." },
  { text: "if you want to be happy for life, plant a tree", type: "proverb", meaning: "long-lasting happiness comes from lasting positive actions", before: "The environmental club's motto was \"", after: "\"." },
  { text: "clean up", type: "phrasal verb", meaning: "to remove dirt or mess", before: "On Saturday, students volunteered to ", after: " the litter along the riverbank." },
  { text: "cut down", type: "phrasal verb", meaning: "to fell a tree, or to reduce something", before: "The community agreed to ", after: " on plastic use to protect wildlife." },
  { text: "dry up", type: "phrasal verb", meaning: "to become completely dry", before: "During the long drought, the small river began to ", after: "." },
];

export const environmentConservationSpeaking: Skill = {
  id: "g6-eng-ls-environment-conservation",
  code: "LS.12",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Environment Conservation — Speaking",
  description: "Identify words with the sounds /ʒ/ and /ʤ/, use conservation vocabulary correctly, and use similes, a metaphor, idioms, proverbs and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "vocab-click-match", "vocab-categorize", "fill-blank", "expression-meaning-mc"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same sound as in "${target.sound === "/ʒ/" ? "treasure" : "jungle"}" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word aloud and listen for the ${target.sound} sound.`,
        explanation: `"${target.word}" contains the sound ${target.sound}.`,
      };
    }

    if (branch === "vocab-meaning-mc") {
      const item = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
      return {
        kind: "multiple-choice",
        prompt: `What does the word "${item.word}" mean?`,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Think about protecting the environment and its resources.",
        explanation: `"${item.word}" means: ${item.meaning}.`,
      };
    }

    if (branch === "vocab-scenario-mc") {
      const item = randChoice(rng, VOCAB);
      const name = randChoice(rng, KENYAN_NAMES);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors.map((d) => d.word)]);
      return {
        kind: "multiple-choice",
        prompt: `${name}'s environmental club leader explains: "${item.meaning}." Which word matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "vocab-click-match") {
      const pool = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of pool) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each environment vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe protecting the environment, others describe harming it.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const positiveWords = ["conserve", "preserve", "restore", "reforestation", "safeguard", "sustain", "recycle"];
      const negativeWords = ["drought", "sewage", "garbage", "refuse", "pollute", "gullies", "soil erosion"];
      const pool = shuffle(rng, [
        ...positiveWords.map((w) => ({ id: w, label: w, bucket: "positive" })),
        ...negativeWords.map((w) => ({ id: w, label: w, bucket: "negative" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these words: does it describe PROTECTING the environment, or HARMING/DAMAGING it?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "positive", label: "Protecting the Environment" },
          { id: "negative", label: "Harming the Environment" },
        ],
        correctBucket,
        hint: "A protecting word describes conservation action; a harming word describes damage or waste.",
        explanation: "Protecting words: conserve, preserve, restore, reforestation, safeguard, sustain, recycle. Harming words: drought, sewage, garbage, refuse, pollute, gullies, soil erosion.",
      };
    }

    if (branch === "fill-blank") {
      const t = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence using the expression "${t.text}".`,
        before: t.before,
        after: t.after,
        correctAnswer: t.text,
        inputMode: "text",
        hint: `This ${t.type} means: ${t.meaning}.`,
        explanation: `"${t.text}" (${t.type}) means ${t.meaning}.`,
      };
    }

    const item = randChoice(rng, EXPRESSIONS);
    const distractors = shuffle(rng, EXPRESSIONS.filter((e) => e.text !== item.text)).slice(0, 3);
    const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
    return {
      kind: "multiple-choice",
      prompt: `What does the expression "${item.text}" mean?`,
      choices,
      correctIndex: choices.indexOf(item.meaning),
      layout: "list",
      hint: `This is a${["a", "e", "i", "o", "u"].includes(item.type[0]) ? "n" : ""} ${item.type}.`,
      explanation: `"${item.text}" (${item.type}) means ${item.meaning}.`,
    };
  },
};
