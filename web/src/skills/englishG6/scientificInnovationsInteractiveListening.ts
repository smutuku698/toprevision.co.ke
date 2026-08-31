import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedA";

// Theme 7 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Technology: Scientific Innovations).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "engineer", meaning: "a person who designs, builds, or maintains machines and structures" },
  { word: "computer science", meaning: "the study of computers and computing technology" },
  { word: "device", meaning: "a piece of equipment made for a particular purpose" },
  { word: "app", meaning: "a computer program designed for a mobile device" },
  { word: "industrial", meaning: "relating to industry or manufacturing" },
  { word: "laboratory", meaning: "a room used for scientific experiments" },
  { word: "evolve", meaning: "to develop gradually over time" },
  { word: "architect", meaning: "a person who designs buildings" },
  { word: "irrigation", meaning: "supplying water to land for growing crops" },
  { word: "electronic", meaning: "relating to devices with small components controlling electric currents" },
  { word: "wireless", meaning: "using radio waves rather than wires to communicate" },
  { word: "digital", meaning: "relating to technology using electronic and computerised devices" },
  { word: "invent", meaning: "to create something new" },
  { word: "modern", meaning: "relating to the present or recent times" },
  { word: "medical", meaning: "relating to the treatment of illness" },
  { word: "advance", meaning: "to make progress" },
  { word: "space", meaning: "the area beyond Earth's atmosphere" },
  { word: "rocket", meaning: "a vehicle used to travel into space" },
  { word: "science", meaning: "the systematic study of the natural world" },
  { word: "discover", meaning: "to find something previously unknown" },
  { word: "satellite", meaning: "an object placed in orbit to relay signals or gather data" },
  { word: "telephone", meaning: "a device used to talk to someone far away" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "good at", type: "fixed phrase", meaning: "skilled in doing something" },
  { text: "be familiar with", type: "fixed phrase", meaning: "to know something well" },
  { text: "little by little", type: "fixed phrase", meaning: "gradually, over time" },
  { text: "a long time ago", type: "fixed phrase", meaning: "in the distant past" },
  { text: "work like magic", type: "simile", meaning: "to work extremely well and effortlessly" },
  { text: "as easy as ABC", type: "simile", meaning: "very easy to do" },
  { text: "like a sea of knowledge", type: "simile", meaning: "containing a huge amount of information" },
  { text: "as slow as a snail", type: "simile", meaning: "extremely slow" },
  { text: "as quick as silver", type: "simile", meaning: "extremely fast" },
  { text: "The internet is a sea of knowledge. It has a lot of information", type: "metaphor", meaning: "calling the internet a sea of knowledge to show how much information it holds" },
  { text: "to make headway", type: "idiom", meaning: "to make progress" },
  { text: "apple of my eye", type: "idiom", meaning: "someone who is cherished above all others" },
  { text: "practise makes perfect", type: "proverb", meaning: "repeated practice leads to skill" },
  { text: "necessity is the mother of invention", type: "proverb", meaning: "difficult situations inspire creative solutions" },
  { text: "live and learn", type: "proverb", meaning: "you gain knowledge from experience, including mistakes" },
  { text: "little learning is a dangerous thing", type: "proverb", meaning: "incomplete knowledge can lead to mistakes" },
  { text: "start over", type: "phrasal verb", meaning: "to begin again" },
  { text: "key in", type: "phrasal verb", meaning: "to type information into a device" },
  { text: "leave behind", type: "phrasal verb", meaning: "to forget to take something, or to progress faster than others" },
  { text: "come up with", type: "phrasal verb", meaning: "to think of an idea or plan" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.7");

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "good at", type: "fixed phrase", meaning: "skilled in doing something", before: "The young engineer was always ", after: " solving tricky problems." },
  { text: "be familiar with", type: "fixed phrase", meaning: "to know something well", before: "Every computer science student should ", after: " basic coding terms." },
  { text: "little by little", type: "fixed phrase", meaning: "gradually, over time", before: "The village's irrigation system improved ", after: " each planting season." },
  { text: "a long time ago", type: "fixed phrase", meaning: "in the distant past", before: "The first satellite was launched into space ", after: "." },
  { text: "work like magic", type: "simile", meaning: "to work extremely well and effortlessly", before: "The new wireless device seemed to ", after: "." },
  { text: "as easy as ABC", type: "simile", meaning: "very easy to do", before: "Using the digital app was ", after: " for the children." },
  { text: "as slow as a snail", type: "simile", meaning: "extremely slow", before: "The old computer in the laboratory ran ", after: "." },
  { text: "as quick as silver", type: "simile", meaning: "extremely fast", before: "The modern rocket engine responded ", after: "." },
  { text: "to make headway", type: "idiom", meaning: "to make progress", before: "The team of scientists began to ", after: " on the new medical invention." },
  { text: "apple of my eye", type: "idiom", meaning: "someone who is cherished above all others", before: "The young inventor was truly the ", after: " of her proud teacher." },
  { text: "practise makes perfect", type: "proverb", meaning: "repeated practice leads to skill", before: "The architect kept sketching new designs, believing that \"", after: "\"." },
  { text: "necessity is the mother of invention", type: "proverb", meaning: "difficult situations inspire creative solutions", before: "Facing a water shortage, the farmer built an irrigation device, proving that \"", after: "\"." },
  { text: "live and learn", type: "proverb", meaning: "you gain knowledge from experience, including mistakes", before: "After the failed experiment, the scientist simply said, \"", after: "\"." },
  { text: "start over", type: "phrasal verb", meaning: "to begin again", before: "When the app crashed, the engineer had to ", after: " the whole design." },
  { text: "come up with", type: "phrasal verb", meaning: "to think of an idea or plan", before: "The team had to ", after: " a new way to power the satellite." },
];

export const scientificInnovationsInteractiveListening: Skill = {
  id: "g6-eng-ls-scientific-innovations",
  code: "LS.7",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Scientific Innovations — Interactive Listening",
  description: "Identify words with the sounds /ɒ/ and /ɔː/, judge polite ways to seek clarification and interrupt, use technology vocabulary correctly, and use similes, a metaphor, idioms, proverbs and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "interrupt-judge-mc", "vocab-click-match", "vocab-categorize", "fill-blank"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same vowel sound as in "${target.sound === "/ɒ/" ? "on" : "door"}" (${target.sound})?`,
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
        hint: "Think about technology, science and invention.",
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
        prompt: `${name}'s science teacher explains: "${item.meaning}." Which word matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "interrupt-judge-mc") {
      const name = randChoice(rng, KENYAN_NAMES);
      const polite = "Excuse me, could you please repeat that part about satellites?";
      const rude = "Wait, stop! I didn't get that.";
      const choices = shuffle(rng, [polite, rude]);
      return {
        kind: "multiple-choice",
        prompt: `During a class discussion on scientific innovations, ${name} missed a point and needs to seek clarification. Which way of interrupting is more polite?`,
        choices,
        correctIndex: choices.indexOf(polite),
        layout: "list",
        hint: "Polite interruption uses a phrase like 'excuse me' before politely asking for the point again.",
        explanation: `"${polite}" politely signals the interruption and asks respectfully, while the other option is abrupt and rude.`,
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
        prompt: "Match each technology vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe people, others describe devices or ideas.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const peopleWords = ["engineer", "architect"];
      const deviceWords = ["device", "app", "telephone", "satellite", "rocket", "computer science", "electronic", "wireless", "digital"];
      const pool = shuffle(rng, [
        ...peopleWords.map((w) => ({ id: w, label: w, bucket: "person" })),
        ...deviceWords.map((w) => ({ id: w, label: w, bucket: "device-or-field" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these technology words: does it name a PERSON, or a DEVICE/FIELD OF STUDY?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "person", label: "Person" },
          { id: "device-or-field", label: "Device or Field of Study" },
        ],
        correctBucket,
        hint: "A person word names who does a technology job; a device/field word names a thing or subject.",
        explanation: "Person words: engineer, architect. Device/field words: device, app, telephone, satellite, rocket, computer science, electronic, wireless, digital.",
      };
    }

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
  },
};
