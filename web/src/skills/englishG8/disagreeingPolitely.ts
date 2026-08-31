import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POLITE_DISAGREEMENT = [
  "I see your point, but I think there is another way to look at it.",
  "I understand what you mean, however I have a different view.",
  "That's an interesting idea, though I'm not sure I fully agree.",
  "With respect, I'd like to add a different perspective.",
  "Perhaps we could consider it from another angle.",
  "I'm not entirely convinced, could you explain your reasoning further?",
];

const IMPOLITE_DISAGREEMENT = [
  "You're completely wrong.",
  "That's a stupid idea.",
  "No way, that's not true at all.",
  "You don't know what you're talking about.",
  "Whatever, I don't care what you think.",
  "That makes no sense, obviously.",
];

const NON_VERBAL_CUES: { cue: string; mood: string }[] = [
  { cue: "Crossed arms and a frown", mood: "Anger or defensiveness" },
  { cue: "Nodding slowly with a gentle smile", mood: "Agreement or approval" },
  { cue: "Avoiding eye contact and looking down", mood: "Shyness or discomfort" },
  { cue: "Leaning forward with raised eyebrows", mood: "Interest or surprise" },
  { cue: "Tapping fingers repeatedly", mood: "Impatience" },
  { cue: "A slow head shake with pursed lips", mood: "Disagreement" },
];

const FILL_ITEMS = [
  { before: "I", after: "your opinion, but I think we should also consider the other option.", correctAnswer: "understand", acceptedAnswers: ["respect", "value"] },
  { before: "That's a fair point,", after: "I'd like to share a slightly different view.", correctAnswer: "but", acceptedAnswers: ["however", "although"] },
  { before: "I'm", after: "sure I fully agree with that, could you explain a bit more?", correctAnswer: "not", acceptedAnswers: [] },
  { before: "With", after: ", I think there might be another way to see this.", correctAnswer: "respect", acceptedAnswers: [] },
];

const SCENARIO_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "A classmate says a rehabilitated offender should never be trusted again. Which is the most polite way to disagree?",
    correct: "I understand your concern, but I believe people can change with the right support",
    distractors: ["You're wrong, that's a terrible thing to say", "That's a ridiculous opinion to have", "I don't want to talk about this with you"],
  },
  {
    q: "During group work, a peer suggests an idea you disagree with. What should you do?",
    correct: "Acknowledge their idea respectfully, then explain your different view using a calm tone",
    distractors: ["Interrupt them immediately and say they are wrong", "Ignore their idea completely without responding", "Tell them their idea is the worst one you've heard"],
  },
  {
    q: "Which words or phrases are commonly used to show politeness when disagreeing?",
    correct: "\"I see your point, but...\" and \"I understand, however...\"",
    distractors: ["\"You're wrong because...\"", "\"That's not true at all...\"", "\"Obviously that's incorrect...\""],
  },
  {
    q: "How do we use non-verbal cues to express different moods and feelings during a conversation?",
    correct: "Through facial expressions, posture and gestures, such as frowning to show anger or nodding to show agreement",
    distractors: ["Only by speaking louder or softer", "By avoiding all movement so no meaning is shown", "Non-verbal cues have no effect on how a message is received"],
  },
];

export const disagreeingPolitely: Skill = {
  id: "g8-eng-ls-disagreeing-politely",
  code: "LS.6",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Conversational Skills: Disagreeing Politely",
  description: "Use polite words, phrases and non-verbal cues to disagree respectfully in conversation.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "mc"] as const);
    const hint = "Polite disagreement acknowledges the other person's view first, then adds your own using a calm tone and respectful body language.";

    if (branch === "match") {
      const chosen = shuffle(rng, NON_VERBAL_CUES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.cue, label: c.cue })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.cue, label: c.mood })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.cue] = c.cue;
      return {
        kind: "click-match",
        prompt: "Match each non-verbal cue to the mood or feeling it usually expresses.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `"${c.cue}" usually shows ${c.mood.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const polite = shuffle(rng, POLITE_DISAGREEMENT).slice(0, 3);
      const impolite = shuffle(rng, IMPOLITE_DISAGREEMENT).slice(0, 3);
      const items = shuffle(rng, [
        ...polite.map((label) => ({ id: label, label, bucket: "polite" })),
        ...impolite.map((label) => ({ id: label, label, bucket: "impolite" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each expression into Polite disagreement or Impolite disagreement.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "polite", label: "Polite disagreement" },
          { id: "impolite", label: "Impolite disagreement" },
        ],
        correctBucket,
        hint,
        explanation: `Polite: ${polite.join(" / ")}. Impolite: ${impolite.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete this polite disagreement.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers.length ? entry.acceptedAnswers : undefined,
        inputMode: "text",
        hint,
        explanation: `The complete polite sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, SCENARIO_QUESTIONS);
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
