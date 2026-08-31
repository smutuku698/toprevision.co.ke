import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const INTONATION_TYPES: { type: string; example: string }[] = [
  { type: "Rising intonation", example: "Used at the end of a yes/no question, such as 'Are you coming to the cultural festival?'" },
  { type: "Falling intonation", example: "Used at the end of a statement, such as 'We are one nation.'" },
  { type: "Rise-fall intonation", example: "Used to show strong emotion or emphasis, such as excitement while singing a unity song" },
  { type: "Level intonation", example: "A flat, unchanging tone that can make a presentation sound monotonous" },
];

const COHESION_VOCAB_ITEMS: { text: string; bucket: string }[] = [
  { text: "Cohesion", bucket: "Related to national unity" },
  { text: "Patriotism", bucket: "Related to national unity" },
  { text: "Diversity", bucket: "Related to national unity" },
  { text: "Harmony", bucket: "Related to national unity" },
  { text: "Heritage", bucket: "Related to national unity" },
  { text: "Coexistence", bucket: "Related to national unity" },
  { text: "Timetable", bucket: "Not related to national unity" },
  { text: "Multiplication", bucket: "Not related to national unity" },
];

const SONG_STEPS: { id: string; label: string }[] = [
  { id: "intro", label: "Introduce the song and explain its meaning to the audience" },
  { id: "vocab", label: "Explain any unfamiliar vocabulary the audience may not know" },
  { id: "perform", label: "Sing or recite the song using correct intonation" },
  { id: "engage", label: "Use gestures and expression to engage the audience" },
  { id: "conclude", label: "Conclude by summarising the song's message of unity" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  {
    before: "Raising your voice at the end of a question is an example of rising",
    after: ".",
    answer: "intonation",
  },
  {
    before: "The word that describes many different ethnic communities living together peacefully is",
    after: ".",
    answer: "cohesion",
    accepted: ["coexistence", "unity"],
  },
  {
    before: "Explaining unfamiliar words to your listeners before singing a song shows good audience",
    after: ".",
    answer: "awareness",
  },
  {
    before: "A flat, unchanging tone of voice throughout a presentation can make it sound",
    after: "and lose the audience's attention.",
    answer: "monotonous",
    accepted: ["boring"],
  },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is intonation?",
    correct: "The rise and fall of the voice while speaking",
    distractors: [
      "The exact words used in a sentence",
      "The volume at which someone speaks",
      "The speed at which someone reads",
    ],
  },
  {
    q: "Which type of intonation is typically used at the end of a yes/no question?",
    correct: "Rising intonation",
    distractors: ["Falling intonation", "Level intonation", "No intonation is used in questions"],
  },
  {
    q: "Why is correct intonation a key aspect of oral presentations?",
    correct: "It helps convey meaning and emotion clearly, keeping the audience engaged",
    distractors: [
      "It allows the speaker to skip preparing content",
      "It has no effect on how the audience understands a talk",
      "It only matters when singing, never when speaking",
    ],
  },
  {
    q: "How can a presenter make a song presentation more appealing to the audience?",
    correct: "By explaining its meaning, using expression, and being aware of the audience",
    distractors: [
      "By singing as quietly as possible",
      "By ignoring whether the audience understands the words",
      "By avoiding any explanation of the song's background",
    ],
  },
  {
    q: "Which of these words is most closely related to the theme of inter-ethnic cohesion?",
    correct: "Coexistence",
    distractors: ["Timetable", "Multiplication", "Punctuation"],
  },
];

export const cohesionSongPresentation: Skill = {
  id: "g8-il-ls-cohesion",
  code: "LS.9",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Inter-ethnic cohesion: presenting a song",
  description: "Identify intonation used in speech and use acquired vocabulary and audience awareness to present a unity song.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Correct intonation and audience-aware vocabulary make a song presentation about unity clearer and more captivating.";

    if (branch === "match") {
      const chosen = shuffle(rng, INTONATION_TYPES);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.type, label: t.type })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.type, label: t.example })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.type] = t.type;
      return {
        kind: "click-match",
        prompt: "Match each type of intonation to how it is used.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.type} — ${t.example.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, COHESION_VOCAB_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each word into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "Words about unity, diversity, and living together belong with national cohesion.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SONG_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of presenting a unity song to an audience in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: SONG_STEPS.map((s) => s.id),
        hint: "Introduce the song, explain new vocabulary, perform it with correct intonation, engage the audience, then conclude.",
        explanation: SONG_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
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
