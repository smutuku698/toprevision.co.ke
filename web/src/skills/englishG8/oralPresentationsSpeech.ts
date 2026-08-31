import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SPEECH_PARTS: { part: string; description: string }[] = [
  { part: "Salutation", description: "The opening greeting to the audience, e.g. \"Good morning, ladies and gentlemen\"" },
  { part: "Introduction", description: "An attention-grabbing opener that states the topic of the speech" },
  { part: "Body", description: "The main section, giving points, examples and evidence to support the topic" },
  { part: "Conclusion", description: "A summary of the main points, often ending with a call to action" },
  { part: "Vote of thanks", description: "Closing words that thank the audience for listening" },
];

const SPEECH_ORDER = ["Salutation", "Introduction", "Body", "Conclusion", "Vote of thanks"];

const VERBAL_TECHNIQUES = ["Varying your pace to build interest", "Adjusting your tone and pitch for emphasis", "Projecting your voice to reach the whole room", "Pausing briefly before an important point"];
const NONVERBAL_TECHNIQUES = ["Making eye contact with the audience", "Using hand gestures to illustrate a point", "Standing with confident, open posture", "Using facial expressions that match your words"];

const INTRO_TECHNIQUES = ["Asking the audience a thought-provoking question", "Opening with a short, relevant anecdote", "Starting with a surprising fact about the topic", "Greeting the audience and clearly stating the topic"];
const CONCLUSION_TECHNIQUES = ["Summarising the main points of the speech", "Ending with a clear call to action", "Repeating the opening line for effect", "Thanking the audience for their attention"];

const FILL_ITEMS = [
  { before: "Have you ever looked at a painting and felt it was speaking to you? This technique of opening a speech about art with a question is called a", after: "question.", correctAnswer: "rhetorical" },
  { before: "At the very start of a speech, the speaker greets the audience; this opening greeting is called the", after: ".", correctAnswer: "salutation" },
  { before: "The main section of a speech, where points and examples are explained in detail, is called the", after: ".", correctAnswer: "body" },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can you make a speech presentation interesting?",
    correct: "By varying your tone, pace and volume, using gestures, and making eye contact with the audience",
    distractors: ["By reading directly from your notes without looking up", "By speaking in the same flat tone throughout", "By avoiding all movement and standing perfectly still"],
  },
  {
    q: "What is one effective technique for introducing a speech?",
    correct: "Asking the audience a thought-provoking question related to the topic",
    distractors: ["Listing every point you will make in the exact order, with no context", "Apologising for having to give the speech", "Starting with a long list of dates and statistics with no story"],
  },
  {
    q: "What is one effective technique for concluding a speech?",
    correct: "Summarising the main points and ending with a clear call to action",
    distractors: ["Introducing a brand new topic that was not discussed before", "Stopping abruptly without any closing remarks", "Reading out the entire speech again from the beginning"],
  },
  {
    q: "In a speech about art, which is the best example of a strong introduction?",
    correct: "\"Have you ever looked at a painting and felt it was speaking to you?\"",
    distractors: ["\"This speech is about art, that's all I have to say.\"", "\"I don't really know much about art, but here goes.\"", "\"Let me just read my notes for the next few minutes.\""],
  },
];

export const oralPresentationsSpeech: Skill = {
  id: "g8-eng-ls-oral-presentations-speech",
  code: "LS.10",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Oral Presentations: Speech",
  description: "Identify the parts of a speech and apply effective speaking techniques to prepare and deliver one.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A good speech follows salutation, introduction, body and conclusion, and is delivered with varied tone, pace, gestures and eye contact.";

    if (branch === "match") {
      const tokens = shuffle(rng, SPEECH_PARTS.map((p) => ({ id: p.part, label: p.part })));
      const targets = shuffle(rng, SPEECH_PARTS.map((p) => ({ id: p.part, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of SPEECH_PARTS) correctMap[p.part] = p.part;
      return {
        kind: "click-match",
        prompt: "Match each part of a speech's format to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: SPEECH_PARTS.map((p) => `${p.part} — ${p.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const useIntro = rng() < 0.5;
      const bucketA = useIntro ? INTRO_TECHNIQUES : VERBAL_TECHNIQUES;
      const bucketB = useIntro ? CONCLUSION_TECHNIQUES : NONVERBAL_TECHNIQUES;
      const labelA = useIntro ? "Introduction technique" : "Verbal delivery skill";
      const labelB = useIntro ? "Conclusion technique" : "Non-verbal delivery skill";
      const idA = useIntro ? "intro" : "verbal";
      const idB = useIntro ? "conclusion" : "nonverbal";
      const a = shuffle(rng, bucketA).slice(0, 3);
      const b = shuffle(rng, bucketB).slice(0, 3);
      const items = shuffle(rng, [
        ...a.map((label) => ({ id: label, label, bucket: idA })),
        ...b.map((label) => ({ id: label, label, bucket: idB })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: `Sort each technique into ${labelA} or ${labelB}.`,
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: idA, label: labelA },
          { id: idB, label: labelB },
        ],
        correctBucket,
        hint,
        explanation: `${labelA}: ${a.join(" / ")}. ${labelB}: ${b.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SPEECH_PARTS.map((p) => ({ id: p.part, label: p.part })));
      return {
        kind: "ordering",
        prompt: "Arrange the parts of a speech's format in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: SPEECH_ORDER,
        hint: "A speech opens with a greeting, introduces the topic, develops it in the body, then closes with a conclusion and thanks.",
        explanation: SPEECH_ORDER.join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
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
