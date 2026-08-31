import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Sound = "/v/" | "/f/" | "/n/" | "/ŋ/";

const SOUND_WORDS: { word: string; sound: Sound }[] = [
  { word: "volleyball", sound: "/v/" },
  { word: "vault", sound: "/v/" },
  { word: "victory", sound: "/v/" },
  { word: "very", sound: "/v/" },
  { word: "football", sound: "/f/" },
  { word: "ferry", sound: "/f/" },
  { word: "fitness", sound: "/f/" },
  { word: "field", sound: "/f/" },
  { word: "been", sound: "/n/" },
  { word: "won", sound: "/n/" },
  { word: "run", sound: "/n/" },
  { word: "begin", sound: "/n/" },
  { word: "being", sound: "/ŋ/" },
  { word: "running", sound: "/ŋ/" },
  { word: "jumping", sound: "/ŋ/" },
  { word: "swimming", sound: "/ŋ/" },
];

const WORDS_MEANINGS: { word: string; meaning: string }[] = [
  { word: "volleyball", meaning: "A team sport where players hit a ball over a net without letting it touch the ground" },
  { word: "vault", meaning: "An athletics event where the athlete uses a pole to jump over a high bar" },
  { word: "victory", meaning: "The act of winning a game or competition" },
  { word: "referee", meaning: "An official who enforces the rules during a match" },
  { word: "field", meaning: "An outdoor area used for playing sports such as football or athletics" },
  { word: "fitness", meaning: "The state of being physically healthy and strong enough for sport" },
];

const SOUND_QUIZ: { q: string; correct: string; distractors: string[] }[] = [
  { q: "Which of these words ends with the /ŋ/ sound, as in 'being'?", correct: "running", distractors: ["run", "won", "ten"] },
  { q: "Which of these words ends with the /n/ sound, as in 'been'?", correct: "begin", distractors: ["being", "jumping", "swimming"] },
  { q: "Which of these words begins with the /v/ sound, as in 'very'?", correct: "victory", distractors: ["ferry", "field", "football"] },
  { q: "Which of these words begins with the /f/ sound, as in 'ferry'?", correct: "fitness", distractors: ["volleyball", "vault", "value"] },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; sound: Sound }[] = [
  { before: "The team celebrated their ", after: " after scoring the winning goal in the final minute.", correctAnswer: "victory", sound: "/v/" },
  { before: "Players need good ", after: " to run, jump, and play for a full ninety minutes.", correctAnswer: "fitness", sound: "/f/" },
  { before: "The whistle blew to signal that the match was about to ", after: ".", correctAnswer: "begin", sound: "/n/" },
  { before: "The pupils were tired but happy after ", after: " three laps around the field.", correctAnswer: "running", sound: "/ŋ/" },
];

const QUESTIONS_INTONATION: { q: string; type: "yes-no" | "wh" }[] = [
  { q: "Do you play basketball after school?", type: "yes-no" },
  { q: "Is the football match starting at four o'clock?", type: "yes-no" },
  { q: "Have you ever tried javelin throwing?", type: "yes-no" },
  { q: "Can our class join the swimming gala?", type: "yes-no" },
  { q: "Where is today's athletics competition being held?", type: "wh" },
  { q: "Who scored the winning goal in yesterday's match?", type: "wh" },
  { q: "When does volleyball practice begin?", type: "wh" },
  { q: "Why did the referee stop the game?", type: "wh" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can one learn to correctly pronounce words?",
    correct: "By listening carefully to how sounds are produced and practising them regularly in words and sentences",
    distractors: ["By avoiding new or difficult words entirely", "By only reading words silently, never aloud", "By copying spelling patterns without listening to how words actually sound"],
  },
  {
    q: "Why is correct intonation important when asking a question in a conversation about sports?",
    correct: "It helps the listener understand what kind of response is expected and shows the mood or intention behind the question",
    distractors: ["It changes the meaning of every word in the sentence", "It only matters in written English, not spoken conversation", "It has no effect on how a listener understands a question"],
  },
];

export const consonantSoundsIntonation: Skill = {
  id: "g7-eng-ls-consonant-sounds-intonation",
  code: "LS.14",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Pronunciation: Consonant Sounds and Intonation",
  description: "Identify and pronounce words with the sounds /v/, /f/, /n/, and /ŋ/, and use correct rising or falling intonation for Yes/No and WH-questions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize-sounds", "categorize-intonation", "mc-sound", "mc-intonation", "fill-word", "match-vocab", "concept"] as const);
    const hint = "For Yes/No questions, the voice usually rises at the end (↗); for WH-questions (who, what, where, when, why, how), it usually falls (↘).";

    if (branch === "categorize-sounds") {
      const sounds: Sound[] = ["/v/", "/f/", "/n/", "/ŋ/"];
      const chosen = sounds.flatMap((s) => shuffle(rng, SOUND_WORDS.filter((w) => w.sound === s)).slice(0, 2));
      const shuffled = shuffle(rng, chosen);
      const items = shuffled.map((w, i) => ({ id: `w${i}`, label: w.word }));
      const correctBucket: Record<string, string> = {};
      shuffled.forEach((w, i) => (correctBucket[`w${i}`] = w.sound));
      return {
        kind: "categorize",
        prompt: "Sort each sports word by the consonant sound it contains: /v/, /f/, /n/, or /ŋ/.",
        items,
        buckets: sounds.map((s) => ({ id: s, label: `Words with the ${s} sound` })),
        correctBucket,
        hint,
        explanation: shuffled.map((w) => `"${w.word}" contains the ${w.sound} sound.`).join(" "),
      };
    }

    if (branch === "categorize-intonation") {
      const chosen = shuffle(rng, QUESTIONS_INTONATION).slice(0, 6);
      const items = chosen.map((q, i) => ({ id: `q${i}`, label: q.q }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((q, i) => (correctBucket[`q${i}`] = q.type));
      return {
        kind: "categorize",
        prompt: "Sort each question about outdoor games by the intonation pattern it should be said with.",
        items,
        buckets: [
          { id: "yes-no", label: "Yes/No question — rising intonation ↗" },
          { id: "wh", label: "WH-question — falling intonation ↘" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((q) => `"${q.q}" is a ${q.type === "yes-no" ? "Yes/No question, said with rising intonation" : "WH-question, said with falling intonation"}.`).join(" "),
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

    if (branch === "mc-intonation") {
      const chosen = shuffle(rng, QUESTIONS_INTONATION.filter((q) => q.type === "wh")).slice(0, 1)[0];
      const distractors = shuffle(rng, QUESTIONS_INTONATION.filter((q) => q.type === "yes-no")).slice(0, 3).map((q) => q.q);
      const choices = shuffle(rng, [chosen.q, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: "Which of these is a WH-question, normally said with falling intonation (↘)?",
        choices,
        correctIndex: choices.indexOf(chosen.q),
        layout: "list",
        hint: "A WH-question begins with a word like who, what, where, when, why, or how.",
        explanation: `"${chosen.q}" is a WH-question, so the voice falls at the end. The others are Yes/No questions, said with rising intonation.`,
      };
    }

    if (branch === "fill-word") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing sports word.",
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
        prompt: "Match each outdoor-games word to its meaning.",
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
