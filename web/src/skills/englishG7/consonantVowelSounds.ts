import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Consonant = "/t/" | "/d/" | "/l/" | "/r/";
type VowelSound = "/ʊ/" | "/uː/";
type Stress = "first" | "second";

const CONSONANT_WORDS: { word: string; sound: Consonant }[] = [
  { word: "tribute", sound: "/t/" },
  { word: "triumph", sound: "/t/" },
  { word: "tenacity", sound: "/t/" },
  { word: "dedication", sound: "/d/" },
  { word: "duty", sound: "/d/" },
  { word: "defender", sound: "/d/" },
  { word: "legend", sound: "/l/" },
  { word: "leader", sound: "/l/" },
  { word: "loyal", sound: "/l/" },
  { word: "rebel", sound: "/r/" },
  { word: "resistance", sound: "/r/" },
  { word: "reformer", sound: "/r/" },
];

const VOWEL_WORDS: { word: string; sound: VowelSound }[] = [
  { word: "stood", sound: "/ʊ/" },
  { word: "good", sound: "/ʊ/" },
  { word: "could", sound: "/ʊ/" },
  { word: "true", sound: "/uː/" },
  { word: "youth", sound: "/uː/" },
  { word: "choose", sound: "/uː/" },
];

const STRESS_WORDS: { word: string; display: string; stress: Stress }[] = [
  { word: "hero", display: "HE-ro", stress: "first" },
  { word: "legend", display: "LEG-end", stress: "first" },
  { word: "tribute", display: "TRIB-ute", stress: "first" },
  { word: "loyal", display: "LOY-al", stress: "first" },
  { word: "defend", display: "de-FEND", stress: "second" },
  { word: "resist", display: "re-SIST", stress: "second" },
  { word: "reform", display: "re-FORM", stress: "second" },
  { word: "unite", display: "u-NITE", stress: "second" },
];

const WORDS_MEANINGS: { word: string; meaning: string }[] = [
  { word: "tribute", meaning: "Something said, written, or done to show respect and admiration for someone" },
  { word: "dedication", meaning: "A strong commitment to a cause or purpose, even when it is difficult" },
  { word: "legend", meaning: "A famous story handed down from earlier times, often about a remarkable person" },
  { word: "rebel", meaning: "A person who resists or fights against authority or an unfair system" },
  { word: "resistance", meaning: "The act of opposing or standing firm against something, such as an unjust rule" },
  { word: "reformer", meaning: "A person who works to bring about positive change in society" },
];

const SOUND_QUIZ: { q: string; correct: string; distractors: string[] }[] = [
  { q: "Which of these words contains the /t/ sound, as in 'tribute'?", correct: "triumph", distractors: ["legend", "duty", "rebel"] },
  { q: "Which of these words contains the /d/ sound, as in 'duty'?", correct: "defender", distractors: ["triumph", "loyal", "resistance"] },
  { q: "Which of these words contains the /l/ sound, as in 'legend'?", correct: "loyal", distractors: ["tribute", "defender", "reformer"] },
  { q: "Which of these words contains the /r/ sound, as in 'rebel'?", correct: "reformer", distractors: ["dedication", "legend", "tenacity"] },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; sound: Consonant | VowelSound }[] = [
  { before: "The community paid ", after: " to the freedom fighter who never gave up.", correctAnswer: "tribute", sound: "/t/" },
  { before: "The chief showed great ", after: " to his people, even in hard times.", correctAnswer: "dedication", sound: "/d/" },
  { before: "Wangari Maathai remains a national ", after: " for her environmental work.", correctAnswer: "legend", sound: "/l/" },
  { before: "The young ", after: " refused to accept the unfair colonial laws.", correctAnswer: "rebel", sound: "/r/" },
  { before: "She ", after: " firm against every attempt to silence her.", correctAnswer: "stood", sound: "/ʊ/" },
  { before: "A ", after: " hero acts for the good of others, not for personal gain.", correctAnswer: "true", sound: "/uː/" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it useful to notice which syllable of a word carries the main stress?",
    correct: "It helps a speaker pronounce the word correctly and helps a listener understand it clearly",
    distractors: [
      "Word stress only matters in written English, never in speech",
      "Every English word is stressed on its very first syllable",
      "Stress has no effect at all on how a word is understood when spoken",
    ],
  },
  {
    q: "How can practising the /ʊ/ and /uː/ vowel sounds help a learner speak more clearly?",
    correct: "It helps the learner avoid confusing similar-sounding words, such as 'stood' and 'true'",
    distractors: [
      "These two sounds are pronounced in exactly the same way",
      "Vowel sounds have no effect on how clearly a word is understood",
      "Only consonant sounds matter for clear pronunciation, never vowels",
    ],
  },
];

export const consonantVowelSounds: Skill = {
  id: "g7-eng-ls-consonant-vowel-sounds",
  code: "LS.9",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Pronunciation: Consonant Sounds, Vowel Sounds and Stress",
  description: "Identify and pronounce words with the sounds /t/, /d/, /l/, /r/, /ʊ/, and /uː/, and recognise correct word stress in words about Kenyan heroes and heroines.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize-consonants", "categorize-vowels", "categorize-stress", "mc-sound", "fill-word", "match-vocab", "concept"] as const);
    const hint = "Notice where your tongue and lips are for each sound, and which syllable of a word is said with more force — that syllable carries the stress.";

    if (branch === "categorize-consonants") {
      const sounds: Consonant[] = ["/t/", "/d/", "/l/", "/r/"];
      const chosen = sounds.flatMap((s) => shuffle(rng, CONSONANT_WORDS.filter((w) => w.sound === s)).slice(0, 2));
      const shuffled = shuffle(rng, chosen);
      const items = shuffled.map((w, i) => ({ id: `w${i}`, label: w.word }));
      const correctBucket: Record<string, string> = {};
      shuffled.forEach((w, i) => (correctBucket[`w${i}`] = w.sound));
      return {
        kind: "categorize",
        prompt: "Sort each word about heroes and heroines by the consonant sound it contains: /t/, /d/, /l/, or /r/.",
        items,
        buckets: sounds.map((s) => ({ id: s, label: `Words with the ${s} sound` })),
        correctBucket,
        hint,
        explanation: shuffled.map((w) => `"${w.word}" contains the ${w.sound} sound.`).join(" "),
      };
    }

    if (branch === "categorize-vowels") {
      const chosen = shuffle(rng, VOWEL_WORDS);
      const items = chosen.map((w, i) => ({ id: `v${i}`, label: w.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((w, i) => (correctBucket[`v${i}`] = w.sound));
      return {
        kind: "categorize",
        prompt: "Sort each word by its vowel sound: the short /ʊ/ (as in 'stood') or the long /uː/ (as in 'true').",
        items,
        buckets: [
          { id: "/ʊ/", label: "Short /ʊ/, as in 'stood'" },
          { id: "/uː/", label: "Long /uː/, as in 'true'" },
        ],
        correctBucket,
        hint: "The long /uː/ sound is held longer, like the 'oo' in 'moon'. The short /ʊ/ sound is quicker, like the 'oo' in 'book'.",
        explanation: chosen.map((w) => `"${w.word}" has the ${w.sound} sound.`).join(" "),
      };
    }

    if (branch === "categorize-stress") {
      const chosen = shuffle(rng, STRESS_WORDS).slice(0, 6);
      const items = chosen.map((w, i) => ({ id: `s${i}`, label: w.display }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((w, i) => (correctBucket[`s${i}`] = w.stress));
      return {
        kind: "categorize",
        prompt: "Sort each word by which syllable carries the main stress.",
        items,
        buckets: [
          { id: "first", label: "Stress on the first syllable" },
          { id: "second", label: "Stress on the second syllable" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((w) => `"${w.word}" (${w.display}) is stressed on its ${w.stress} syllable.`).join(" "),
      };
    }

    if (branch === "mc-sound") {
      const entry = randChoice(rng, SOUND_QUIZ);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint,
        explanation: `The correct word is "${entry.correct}".`,
      };
    }

    if (branch === "fill-word") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word about heroes and heroines.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: `This word contains the ${entry.sound} sound.`,
        explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}", and "${entry.correctAnswer}" contains the ${entry.sound} sound.`,
      };
    }

    if (branch === "match-vocab") {
      const chosen = shuffle(rng, WORDS_MEANINGS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;
      return {
        kind: "click-match",
        prompt: "Match each word about heroes and heroines to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((w) => `"${w.word}" means: ${w.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
