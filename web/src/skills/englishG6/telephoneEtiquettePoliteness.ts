import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedA";

// Theme 3 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Etiquette - Telephone).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "phone", meaning: "a device used to talk to someone far away" },
  { word: "telephone", meaning: "a device used to talk to someone far away" },
  { word: "mobile", meaning: "a portable telephone" },
  { word: "dial", meaning: "to enter a phone number to make a call" },
  { word: "cell phone", meaning: "another name for a mobile phone" },
  { word: "call", meaning: "to contact someone by phone" },
  { word: "handset", meaning: "the part of a phone you hold to speak and listen" },
  { word: "disconnect", meaning: "to end a phone connection" },
  { word: "receive", meaning: "to get an incoming call" },
  { word: "network", meaning: "the system that connects phone calls" },
  { word: "signal", meaning: "the strength of a phone connection" },
  { word: "proper", meaning: "correct and suitable" },
  { word: "mindful", meaning: "careful and aware" },
  { word: "polite", meaning: "having good manners" },
  { word: "rude", meaning: "having bad manners" },
  { word: "voicemail", meaning: "a recorded message left when a call isn't answered" },
  { word: "answering machine", meaning: "a device that records messages for missed calls" },
  { word: "etiquette", meaning: "the accepted rules of polite behaviour" },
  { word: "tone", meaning: "the sound or manner of a person's voice" },
  { word: "courteous", meaning: "polite and respectful" },
  { word: "inquire", meaning: "to ask for information" },
  { word: "privacy", meaning: "the state of being free from unwanted attention" },
  { word: "guidelines", meaning: "rules or advice on how to behave" },
  { word: "receiver", meaning: "the part of a phone used to listen" },
  { word: "connect", meaning: "to join a call successfully" },
  { word: "video call", meaning: "a call where you can see the other person" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "make friends", type: "fixed phrase", meaning: "to become friendly with someone" },
  { text: "as proud as a peacock", type: "simile", meaning: "extremely proud" },
  { text: "Peter is a giraffe; he is so tall", type: "metaphor", meaning: "calling someone a giraffe to show they are very tall" },
  { text: "feel at home", type: "idiom", meaning: "to feel comfortable and relaxed somewhere" },
  { text: "charity begins at home", type: "proverb", meaning: "you should look after your own family before helping others" },
  { text: "pass by", type: "phrasal verb", meaning: "to go past something without stopping" },
  { text: "look for", type: "phrasal verb", meaning: "to try to find something" },
  { text: "look at", type: "phrasal verb", meaning: "to direct your eyes towards something" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.3");

// Polite vs rude phone-opener pairs — the theme's core "judge whether words/phrases have been
// used politely" outcome, given 4 distinct call-scenario framings.
const POLITE_PAIRS: { scenario: (n: string, p: string) => string; polite: string; rude: string }[] = [
  {
    scenario: (n, p) => `${n} in ${p} answers a call from an unknown number. Which opening is more courteous?`,
    polite: "Hello, this is " + "{name}" + " speaking. How may I help you?",
    rude: "Yeah? Who's this? Talk fast.",
  },
  {
    scenario: (n) => `${n} needs to end a call quickly because of another emergency. Which closing is more polite?`,
    polite: "I'm sorry, I have to go now — may I call you back shortly?",
    rude: "I'm done talking. Bye.",
  },
  {
    scenario: (n, p) => `${n} calls a shop in ${p} to ask about opening hours. Which way of inquiring is more courteous?`,
    polite: "Good afternoon, could you please tell me your opening hours?",
    rude: "Hey! When do you open?",
  },
  {
    scenario: (n) => `${n} accidentally dialled the wrong number. Which response is more polite once ${n} realises?`,
    polite: "I'm very sorry, I think I dialled the wrong number.",
    rude: "Wrong number. *hangs up without a word*",
  },
];

export const telephoneEtiquettePoliteness: Skill = {
  id: "g6-eng-ls-telephone-etiquette",
  code: "LS.3",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Telephone Etiquette — Polite Language",
  description: "Identify words with the sounds /æ/ and /ɜː/, use telephone vocabulary correctly, judge polite vs impolite phone language, and use a simile, metaphor, idiom, proverb and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "polite-judge-mc", "vocab-click-match", "vocab-categorize", "expression-fill-blank"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same vowel sound as in "${target.sound === "/æ/" ? "cat" : "bird"}" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word aloud and listen for the ${target.sound} vowel sound.`,
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
        hint: "Think about phones and how people talk on them.",
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
        prompt: `${name} explains to a friend: "${item.meaning}." Which word matches this explanation?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The word is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "polite-judge-mc") {
      const pair = randChoice(rng, POLITE_PAIRS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const polite = pair.polite.replace("{name}", name);
      const choices = shuffle(rng, [polite, pair.rude]);
      return {
        kind: "multiple-choice",
        prompt: pair.scenario(name, place),
        choices,
        correctIndex: choices.indexOf(polite),
        layout: "list",
        hint: "Polite phone language stays calm, respectful and considerate, even when ending a call.",
        explanation: `"${polite}" is courteous, while the other option is abrupt or rude for a phone conversation.`,
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
        prompt: "Match each telephone vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some of these words look similar — read each meaning carefully.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const politenessWords = ["proper", "mindful", "polite", "rude", "etiquette", "courteous", "privacy", "guidelines"];
      const deviceWords = ["phone", "telephone", "mobile", "handset", "voicemail", "answering machine", "receiver", "network"];
      const pool = shuffle(rng, [
        ...politenessWords.map((w) => ({ id: w, label: w, bucket: "manners" })),
        ...deviceWords.map((w) => ({ id: w, label: w, bucket: "device" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these telephone-theme words: is it about MANNERS/BEHAVIOUR, or about the PHONE DEVICE ITSELF?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "manners", label: "Manners / Behaviour" },
          { id: "device", label: "Phone Device" },
        ],
        correctBucket,
        hint: "Manners words describe how a person behaves; device words name a phone part or type.",
        explanation: "Manners words: proper, mindful, polite, rude, etiquette, courteous, privacy, guidelines. Device words: phone, telephone, mobile, handset, voicemail, answering machine, receiver, network.",
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

// Fill-blank pairs where the surrounding sentence genuinely fits the specific expression it names.
const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "as proud as a peacock", type: "simile", meaning: "extremely proud", before: "After getting every phone-manners answer right, she felt ", after: "." },
  { text: "feel at home", type: "idiom", meaning: "to feel comfortable and relaxed somewhere", before: "The friendly caller's warm tone made him ", after: " right away." },
  { text: "charity begins at home", type: "proverb", meaning: "you should look after your own family before helping others", before: "Grandmother always said, \"", after: "\" whenever asked why she called family first." },
  { text: "pass by", type: "phrasal verb", meaning: "to go past something without stopping", before: "He did not stop to chat but just let the call ", after: " to voicemail." },
  { text: "look for", type: "phrasal verb", meaning: "to try to find something", before: "She had to ", after: " her mobile before it stopped ringing." },
  { text: "look at", type: "phrasal verb", meaning: "to direct your eyes towards something", before: "Before dialling, always ", after: " the number carefully to avoid mistakes." },
  { text: "make friends", type: "fixed phrase", meaning: "to become friendly with someone", before: "Through polite phone calls, the pen pals were able to ", after: "." },
];
