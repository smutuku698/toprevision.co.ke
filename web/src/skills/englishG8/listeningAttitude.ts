import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SONG_TEXT =
  "Verse: New styles come and go so fast, / bright colours never seem to last. / We chase the trend on every street, / new shoes upon our tired feet. / Chorus: But fashion fades within a day, / kindness never fades away. / Wear what you love, be true, be free, / let your own style set you free.";

const MESSAGE_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main message of this song?",
    correct: "Inner qualities like kindness matter more than fast-changing fashion trends",
    distractors: ["Everyone should follow the newest fashion trend immediately", "Bright colours should never be worn together", "Shoes are more important than any other clothing item"],
  },
  {
    q: "According to the song, what does the singer encourage listeners to do?",
    correct: "Wear what they love and express their own individual style",
    distractors: ["Copy exactly what everyone else on the street is wearing", "Avoid wearing bright colours at all times", "Stop buying new shoes altogether"],
  },
  {
    q: "According to the song, what \"never fades away\", unlike fashion?",
    correct: "Kindness",
    distractors: ["Bright colours", "New shoes", "Trends"],
  },
];

const WORD_CHOICE_EFFECTS: { phrase: string; effect: string }[] = [
  { phrase: "\"We chase the trend\"", effect: "Suggests a restless, hurried pursuit of whatever is fashionable" },
  { phrase: "\"tired feet\"", effect: "Suggests that following fashion trends can be exhausting" },
  { phrase: "\"kindness never fades away\"", effect: "Emphasises that kindness lasts, unlike fashion, which fades quickly" },
  { phrase: "\"be true, be free\" (repeated)", effect: "Emphasises a message of self-expression and personal freedom" },
];

const POSITIVE_ATTITUDE = [
  "I find this song uplifting because it reminds me to value kindness.",
  "This song resonates with me since I often feel pressured by trends.",
  "I appreciate how the song encourages listeners to be themselves.",
  "The lyrics strike me as genuine and thoughtful.",
];

const CRITICAL_ATTITUDE = [
  "I feel this song's message about chasing trends is a little repetitive.",
  "I'm not fully convinced by the song's message, since fashion can also be fun.",
  "The lyrics strike me as a bit too simple for such an important topic.",
  "I find the chorus predictable after hearing the first verse.",
];

const FILL_ITEMS = [
  { before: "But fashion fades within a day, / kindness never fades", after: ".", correctAnswer: "away" },
  { before: "Wear what you love, be true, be", after: ".", correctAnswer: "free" },
  { before: "New styles come and go so fast, / bright colours never seem to", after: ".", correctAnswer: "last" },
];

export const listeningAttitude: Skill = {
  id: "g8-eng-ls-listening-attitude",
  code: "LS.12",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Listening to Respond: Attitude",
  description: "Explain the message of a song and express an attitude towards it, noticing how word choice affects meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill"] as const);
    const hint = "Listen for the song's central message, then notice specific word choices and how they make you feel about it.";

    if (branch === "mc") {
      const entry = randChoice(rng, MESSAGE_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: SONG_TEXT,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "categorize") {
      const positive = shuffle(rng, POSITIVE_ATTITUDE).slice(0, 3);
      const critical = shuffle(rng, CRITICAL_ATTITUDE).slice(0, 3);
      const items = shuffle(rng, [
        ...positive.map((label) => ({ id: label, label, bucket: "positive" })),
        ...critical.map((label) => ({ id: label, label, bucket: "critical" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each expression into Positive attitude or Critical attitude towards the song.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "positive", label: "Positive attitude" },
          { id: "critical", label: "Critical attitude" },
        ],
        correctBucket,
        hint: "A positive attitude expresses appreciation or agreement; a critical attitude points out doubts or weaknesses.",
        explanation: `Positive: ${positive.join(" / ")}. Critical: ${critical.join(" / ")}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, WORD_CHOICE_EFFECTS.map((w) => ({ id: w.phrase, label: w.phrase })));
      const targets = shuffle(rng, WORD_CHOICE_EFFECTS.map((w) => ({ id: w.phrase, label: w.effect })));
      const correctMap: Record<string, string> = {};
      for (const w of WORD_CHOICE_EFFECTS) correctMap[w.phrase] = w.phrase;
      return {
        kind: "click-match",
        prompt: "Match each phrase from the song to the effect its word choice creates.",
        passage: SONG_TEXT,
        tokens,
        targets,
        correctMap,
        hint: "Think about what feeling or image each word choice brings to mind for the listener.",
        explanation: WORD_CHOICE_EFFECTS.map((w) => `${w.phrase} — ${w.effect.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing rhyming word from the song.",
      passage: SONG_TEXT,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "The missing word is given directly in the song text above.",
      explanation: `The line reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
    };
  },
};
