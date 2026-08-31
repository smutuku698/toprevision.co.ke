import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTION_WORDS: { word: string; answers: string }[] = [
  { word: "Who", answers: "The people involved in the event" },
  { word: "What", answers: "The event that took place" },
  { word: "When", answers: "The date or time it happened" },
  { word: "Where", answers: "The location of the event" },
  { word: "Why", answers: "The reason or purpose of the event" },
  { word: "How", answers: "The way the event unfolded" },
];

const VERBAL_CUES = ["Speaking with clear pronunciation", "Using the past tense correctly to recount events", "Using transition words such as \"first\" and \"finally\"", "Varying your tone for emphasis on key moments"];
const NONVERBAL_CUES = ["Maintaining eye contact with the audience", "Using hand gestures to show size or direction", "Matching facial expressions to the story", "Standing with confident, open posture"];

const REPORT_STEPS = [
  { id: "intro", label: "State what event took place, and where and when it happened" },
  { id: "sequence", label: "Describe what happened, in the order it occurred" },
  { id: "observations", label: "Share your own observations or feelings about the event" },
  { id: "conclude", label: "Conclude with the outcome or significance of the event" },
];

const FILL_ITEMS = [
  { before: "", after: ", our class arrived at the museum gates and met our tour guide.", correctAnswer: "First", acceptedAnswers: ["First of all"] },
  { before: "We toured the exhibition halls, and", after: "we visited the gift shop before leaving.", correctAnswer: "then", acceptedAnswers: ["finally", "after that"] },
  { before: "By the end of the trip, we had", after: "so much about the tourist site's history.", correctAnswer: "learned", acceptedAnswers: ["learnt"] },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can you make your oral report of an event convincing?",
    correct: "By including specific details, maintaining eye contact, and speaking with confidence",
    distractors: ["By speaking as quickly as possible to finish early", "By avoiding any specific details about what happened", "By reading from notes without looking at the audience"],
  },
  {
    q: "Why do we give oral reports about events?",
    correct: "To share information about events with people who were not present",
    distractors: ["To keep information secret from the audience", "Because written reports are no longer used", "To avoid answering any questions from listeners"],
  },
  {
    q: "Which tense should you mainly use when recounting an event that already happened?",
    correct: "The past tense",
    distractors: ["The future tense", "The present continuous tense only", "The present perfect tense only"],
  },
];

export const oralReportsEvents: Skill = {
  id: "g8-eng-ls-oral-reports-events",
  code: "LS.15",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Oral Reports: Events",
  description: "Recount and report on events that take place outside the classroom, such as a visit to a tourist attraction, using verbal and non-verbal cues.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A convincing oral report answers who, what, when, where, why and how, told in the past tense with clear transitions and confident delivery.";

    if (branch === "match") {
      const chosen = shuffle(rng, QUESTION_WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((q) => ({ id: q.word, label: q.word })));
      const targets = shuffle(rng, chosen.map((q) => ({ id: q.word, label: q.answers })));
      const correctMap: Record<string, string> = {};
      for (const q of chosen) correctMap[q.word] = q.word;
      return {
        kind: "click-match",
        prompt: "Match each report question word to what it helps you describe.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((q) => `"${q.word}" — ${q.answers.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const verbal = shuffle(rng, VERBAL_CUES).slice(0, 3);
      const nonverbal = shuffle(rng, NONVERBAL_CUES).slice(0, 3);
      const items = shuffle(rng, [
        ...verbal.map((label) => ({ id: label, label, bucket: "verbal" })),
        ...nonverbal.map((label) => ({ id: label, label, bucket: "nonverbal" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each presentation cue into Verbal cue or Non-verbal cue.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "verbal", label: "Verbal cue" },
          { id: "nonverbal", label: "Non-verbal cue" },
        ],
        correctBucket,
        hint: "Verbal cues involve the words and voice; non-verbal cues involve the body and face.",
        explanation: `Verbal cues: ${verbal.join(" / ")}. Non-verbal cues: ${nonverbal.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, REPORT_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the stages of an oral report on an event in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: REPORT_STEPS.map((s) => s.id),
        hint: "Start with what/where/when, then recount events in sequence, then add your observations, then conclude.",
        explanation: REPORT_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete this line from an oral report about a class trip.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete line reads: "${[entry.before, entry.correctAnswer, entry.after].filter(Boolean).join(" ")}"`,
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
