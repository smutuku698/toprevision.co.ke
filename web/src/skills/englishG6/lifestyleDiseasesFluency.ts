import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedB";

// Theme 9 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Lifestyle Diseases).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "cancer", meaning: "a disease caused by uncontrolled cell growth" },
  { word: "high blood pressure", meaning: "a condition where blood pushes too hard against artery walls" },
  { word: "heart disease", meaning: "any condition affecting the heart's function" },
  { word: "heart attack", meaning: "a sudden blockage of blood flow to the heart" },
  { word: "obesity", meaning: "having an excessive amount of body fat" },
  { word: "overweight", meaning: "weighing more than is healthy" },
  { word: "diabetes", meaning: "a disease affecting how the body processes sugar" },
  { word: "exercise", meaning: "physical activity done to stay healthy" },
  { word: "incurable", meaning: "not able to be cured" },
  { word: "cure", meaning: "a treatment that ends an illness" },
  { word: "allergy", meaning: "a harmful reaction to a substance" },
  { word: "treat", meaning: "to give medical care for an illness" },
  { word: "distress", meaning: "extreme physical or mental suffering" },
  { word: "headache", meaning: "a pain in the head" },
  { word: "prevention", meaning: "action taken to stop something happening" },
  { word: "diet", meaning: "the kinds of food a person regularly eats" },
  { word: "lifestyle", meaning: "the way a person lives their everyday life" },
  { word: "stroke", meaning: "a sudden loss of brain function due to blocked blood flow" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "fall sick", type: "fixed phrase", meaning: "to become ill" },
  { text: "as right as rain", type: "simile", meaning: "in perfect health" },
  { text: "Kadzo is a lark. She is always happy", type: "metaphor", meaning: "calling someone a lark to show they are always cheerful" },
  { text: "fit as a fiddle", type: "idiom", meaning: "in excellent physical health" },
  { text: "sick like a dog", type: "idiom", meaning: "very ill" },
  { text: "an apple a day keeps the doctor away", type: "proverb", meaning: "eating healthily helps prevent illness" },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens" },
  { text: "pass out", type: "phrasal verb", meaning: "to lose consciousness" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.9");

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "fall sick", type: "fixed phrase", meaning: "to become ill", before: "People who skip exercise and eat badly are more likely to ", after: "." },
  { text: "as right as rain", type: "simile", meaning: "in perfect health", before: "After weeks of treatment, the patient with high blood pressure felt ", after: " again." },
  { text: "fit as a fiddle", type: "idiom", meaning: "in excellent physical health", before: "Thanks to daily exercise and a good diet, the elderly man was ", after: "." },
  { text: "sick like a dog", type: "idiom", meaning: "very ill", before: "With a severe headache and fever, she felt ", after: "." },
  { text: "an apple a day keeps the doctor away", type: "proverb", meaning: "eating healthily helps prevent illness", before: "The nurse reminded the class, \"", after: "\"." },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens", before: "Regular check-ups for diabetes show that \"", after: "\"." },
  { text: "pass out", type: "phrasal verb", meaning: "to lose consciousness", before: "The heat was so intense that a worker began to ", after: " on the field." },
];

export const lifestyleDiseasesFluency: Skill = {
  id: "g6-eng-ls-lifestyle-diseases",
  code: "LS.9",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Lifestyle Diseases — Speaking Fluency",
  description: "Identify words with the sounds /eə/, /aʊ/ and /h/, use lifestyle-disease vocabulary correctly, and use a simile, a metaphor, idioms, proverbs and a phrasal verb in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "vocab-click-match", "vocab-categorize", "fill-blank", "expression-meaning-mc"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same sound as in "${target.sound === "/eə/" ? "care" : target.sound === "/aʊ/" ? "house" : "health"}" (${target.sound})?`,
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
        prompt: `What does the term "${item.word}" mean?`,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Think about health, illness and healthy living.",
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
        prompt: `${name}'s doctor explains: "${item.meaning}." Which term matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact term.",
        explanation: `The term is "${item.word}" — it means ${item.meaning}.`,
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
        prompt: "Match each lifestyle-disease term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some terms name diseases, others name actions to stay healthy.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const diseaseWords = ["cancer", "high blood pressure", "heart disease", "heart attack", "obesity", "diabetes", "stroke", "allergy"];
      const healthyWords = ["exercise", "cure", "treat", "prevention", "diet"];
      const pool = shuffle(rng, [
        ...diseaseWords.map((w) => ({ id: w, label: w, bucket: "disease" })),
        ...healthyWords.map((w) => ({ id: w, label: w, bucket: "healthy-action" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these words: is it the NAME OF A DISEASE, or a HEALTHY ACTION/TREATMENT?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "disease", label: "Name of a Disease" },
          { id: "healthy-action", label: "Healthy Action / Treatment" },
        ],
        correctBucket,
        hint: "A disease word names an illness; a healthy-action word names something you do to stay well.",
        explanation: "Disease words: cancer, high blood pressure, heart disease, heart attack, obesity, diabetes, stroke, allergy. Healthy-action words: exercise, cure, treat, prevention, diet.",
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
