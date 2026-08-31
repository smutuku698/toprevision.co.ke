import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedA";

// Theme 6 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Jobs and Occupation - Work Ethics).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "value", meaning: "a principle or standard of behaviour" },
  { word: "work", meaning: "an activity done using effort to achieve a purpose" },
  { word: "virtue", meaning: "a good moral quality" },
  { word: "upright", meaning: "honest and morally correct" },
  { word: "code", meaning: "a set of rules for behaviour" },
  { word: "responsible", meaning: "having a duty to deal with something" },
  { word: "occupation", meaning: "a person's job or profession" },
  { word: "teamwork", meaning: "the combined effort of a group working together" },
  { word: "integrity", meaning: "the quality of being honest and having strong moral principles" },
  { word: "trespass", meaning: "to enter someone's property without permission" },
  { word: "co-worker", meaning: "a person you work with" },
  { word: "self-esteem", meaning: "confidence in one's own worth" },
  { word: "passion", meaning: "strong enthusiasm for something" },
  { word: "unethical", meaning: "not morally correct" },
  { word: "loyal", meaning: "faithful and dependable" },
  { word: "hardworking", meaning: "putting a lot of effort into work" },
  { word: "character", meaning: "the mental and moral qualities of a person" },
  { word: "corrupt", meaning: "acting dishonestly for personal gain" },
  { word: "honest", meaning: "truthful and sincere" },
  { word: "reward", meaning: "something given in recognition of effort or achievement" },
  { word: "excel", meaning: "to be very good at something" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "take care of", type: "fixed phrase", meaning: "to look after something or someone" },
  { text: "have no idea", type: "fixed phrase", meaning: "to not know something at all" },
  { text: "you never know", type: "fixed phrase", meaning: "used when something is uncertain" },
  { text: "as happy as a king", type: "simile", meaning: "extremely happy" },
  { text: "as busy as a bee", type: "simile", meaning: "extremely busy" },
  { text: "work like a horse", type: "simile", meaning: "to work extremely hard" },
  { text: "Wambui is a bee. She is so busy", type: "metaphor", meaning: "calling someone a bee to show they are very busy" },
  { text: "lay off", type: "idiom", meaning: "to dismiss workers from a job" },
  { text: "hand in", type: "idiom", meaning: "to submit something officially" },
  { text: "take over", type: "idiom", meaning: "to assume control of something" },
  { text: "deal with", type: "idiom", meaning: "to take action to handle a problem" },
  { text: "strike while the iron is hot", type: "idiom", meaning: "to act at the best possible moment" },
  { text: "go the extra mile", type: "idiom", meaning: "to make a special effort" },
  { text: "make hay while the sun shines", type: "proverb", meaning: "make good use of good conditions while they last" },
  { text: "the sun does not wait for a king", type: "proverb", meaning: "time waits for no one" },
  { text: "honesty is the best policy", type: "proverb", meaning: "it is always best to be truthful" },
  { text: "slow but sure wins the race", type: "proverb", meaning: "steady, careful effort succeeds in the end" },
  { text: "Jack of all trades, master of none", type: "proverb", meaning: "someone who can do many things but excels at none" },
  { text: "grow up", type: "phrasal verb", meaning: "to become an adult, or to mature in behaviour" },
  { text: "give up", type: "phrasal verb", meaning: "to stop trying" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.6");

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "take care of", type: "fixed phrase", meaning: "to look after something or someone", before: "A responsible co-worker will always ", after: " shared office equipment." },
  { text: "have no idea", type: "fixed phrase", meaning: "to not know something at all", before: "The new employee said she had had \"", after: "\" that the deadline was today." },
  { text: "you never know", type: "fixed phrase", meaning: "used when something is uncertain", before: "Always do your best work because \"", after: "\" who is watching." },
  { text: "as busy as a bee", type: "simile", meaning: "extremely busy", before: "During harvest season, every farmhand was ", after: "." },
  { text: "work like a horse", type: "simile", meaning: "to work extremely hard", before: "To finish the order on time, the whole team had to ", after: "." },
  { text: "lay off", type: "idiom", meaning: "to dismiss workers from a job", before: "When sales dropped, the corrupt manager decided to ", after: " half the loyal staff unfairly." },
  { text: "hand in", type: "idiom", meaning: "to submit something officially", before: "Every hardworking employee must ", after: " the report by Friday." },
  { text: "take over", type: "idiom", meaning: "to assume control of something", before: "When the supervisor fell sick, a trusted co-worker had to ", after: " her duties." },
  { text: "deal with", type: "idiom", meaning: "to take action to handle a problem", before: "An upright employer knows how to ", after: " unethical behaviour at work." },
  { text: "go the extra mile", type: "idiom", meaning: "to make a special effort", before: "To earn the reward, she chose to ", after: " for the customer." },
  { text: "make hay while the sun shines", type: "proverb", meaning: "make good use of good conditions while they last", before: "The vendor sold as much as possible during the festival, knowing to \"", after: "\"." },
  { text: "honesty is the best policy", type: "proverb", meaning: "it is always best to be truthful", before: "The teacher reminded the class that \"", after: "\" even when the truth is hard." },
  { text: "slow but sure wins the race", type: "proverb", meaning: "steady, careful effort succeeds in the end", before: "The careful, hardworking apprentice proved that \"", after: "\"." },
  { text: "grow up", type: "phrasal verb", meaning: "to become an adult, or to mature in behaviour", before: "Children who see hardworking role models often ", after: " valuing integrity." },
  { text: "give up", type: "phrasal verb", meaning: "to stop trying", before: "Despite the setback, the passionate young worker refused to ", after: "." },
];

export const workEthicsIntonationStress: Skill = {
  id: "g6-eng-ls-work-ethics",
  code: "LS.6",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Work Ethics — Intonation and Stress",
  description: "Identify words with the sounds /f/, /v/ and /əʊ/, use work-ethics vocabulary correctly, and use similes, a metaphor, idioms, proverbs and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "vocab-click-match", "vocab-categorize", "fill-blank", "expression-meaning-mc"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same sound as in "${target.sound === "/f/" ? "fish" : target.sound === "/v/" ? "van" : "go"}" (${target.sound})?`,
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
        hint: "Think about honesty, hard work, and workplace behaviour.",
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
        prompt: `${name}'s manager explains: "${item.meaning}." Which word matches this?`,
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
        prompt: "Match each work-ethics vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe good qualities, others describe bad ones — read carefully.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const positiveWords = ["virtue", "upright", "responsible", "teamwork", "integrity", "self-esteem", "loyal", "hardworking", "honest", "excel"];
      const negativeWords = ["trespass", "unethical", "corrupt"];
      const pool = shuffle(rng, [
        ...positiveWords.map((w) => ({ id: w, label: w, bucket: "positive" })),
        ...negativeWords.map((w) => ({ id: w, label: w, bucket: "negative" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these work-ethics words: is it a POSITIVE quality, or a NEGATIVE quality/action?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "positive", label: "Positive Quality" },
          { id: "negative", label: "Negative Quality" },
        ],
        correctBucket,
        hint: "Positive words describe good work ethics; negative words describe poor or dishonest behaviour.",
        explanation: "Positive words: virtue, upright, responsible, teamwork, integrity, self-esteem, loyal, hardworking, honest, excel. Negative words: trespass, unethical, corrupt.",
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
