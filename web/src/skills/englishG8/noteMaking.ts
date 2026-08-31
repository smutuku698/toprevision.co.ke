import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Every year, Central Primary School invites a local artist to help pupils paint a mural on the compound wall. This year's theme was 'Our Environment,' and pupils sketched ideas ranging from trees to rivers before voting on a final design. The artist, Ms. Achieng, taught the pupils how to mix paint colours and use different brush sizes for detail work. Painting took three weekends, with pupils working in small groups to avoid overcrowding the wall. Parents who visited during the final weekend said the mural made the school compound feel brighter and more welcoming. The head teacher announced that the mural would be repainted with a new theme every two years.";

const KEY_POINTS = [
  "Central Primary invites an artist every year to help pupils paint a mural",
  "This year's theme, chosen by pupil vote, was 'Our Environment'",
  "Painting took three weekends, with pupils working in small groups",
  "The mural will be repainted with a new theme every two years",
];

const MINOR_DETAILS = [
  "Pupils sketched ideas ranging from trees to rivers before voting",
  "Ms. Achieng taught pupils how to mix paint colours and use different brush sizes",
  "Parents said the mural made the compound feel brighter and more welcoming",
];

const NOTE_FORM_TASK = {
  fullSentence: "Central Primary School invites a local artist every year to help pupils paint a mural on the compound wall.",
  goodNote: "Central Primary — invites artist yearly — pupils paint mural",
  distractors: [
    "Central Primary School invites a local artist every year to help pupils paint a mural on the compound wall.",
    "Central Primary",
    "mural",
  ],
};

const NOTE_TECHNIQUES: { name: string; description: string }[] = [
  { name: "Keywords", description: "Writing only the most important words instead of full sentences" },
  { name: "Abbreviations", description: "Shortening words or using symbols, like '&' for 'and'" },
  { name: "Bullet points", description: "Listing separate points as short, distinct lines" },
  { name: "Headings", description: "Grouping related notes under a short title" },
];

const NOTE_STEPS = [
  { id: "read", label: "Read through the text once to understand its overall meaning" },
  { id: "identify", label: "Identify the key points and separate them from minor details" },
  { id: "write", label: "Write the key points using short phrases, keywords, or abbreviations" },
  { id: "organise", label: "Organise the notes clearly, for example using bullet points or headings" },
  { id: "review", label: "Review the notes to check they still make sense later" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "This year's theme, chosen by pupil vote, was 'Our", after: ".'", correctAnswer: "Environment" },
  { before: "The artist, Ms. Achieng, taught the pupils how to mix paint", after: ".", correctAnswer: "colours", acceptedAnswers: ["colors"] },
  { before: "The head teacher announced that the mural would be repainted with a new theme every", after: "years.", correctAnswer: "two" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the importance of note making?",
    correct: "It helps a learner remember the key points of a text without having to reread everything",
    distractors: ["It is only useful for people who cannot read well", "It replaces the need to ever read the original text", "It has no real use once a lesson has ended"],
  },
  {
    q: "How do we determine what to include in our notes during note making?",
    correct: "By identifying the key points of a text and leaving out minor or illustrative details",
    distractors: ["By copying every single sentence from the text", "By writing down only the first sentence of each paragraph", "By including only details that mention numbers"],
  },
];

export const noteMaking: Skill = {
  id: "g8-eng-r-note-making",
  code: "R.19",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Study Skills: Note Making",
  description: "Identify key points in a passage about a school art project, and make clear, concise notes from it.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "order", "fill", "mc"] as const);
    const hint = "A key point sums up an important idea in the passage; a minor detail only adds extra colour to a key point already made.";

    if (branch === "categorize") {
      const chosenMinor = shuffle(rng, MINOR_DETAILS).slice(0, 2);
      const chosen = shuffle(rng, [
        ...KEY_POINTS.map((t) => ({ text: t, bucket: "key" })),
        ...chosenMinor.map((t) => ({ text: t, bucket: "minor" })),
      ]);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement into Key point or Minor detail.",
        items,
        buckets: [
          { id: "key", label: "Key point" },
          { id: "minor", label: "Minor detail" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is a ${c.bucket === "key" ? "key point" : "minor detail"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, NOTE_TECHNIQUES.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, NOTE_TECHNIQUES.map((t) => ({ id: t.name, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of NOTE_TECHNIQUES) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each note-making technique to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Good notes are short — they use keywords, abbreviations, bullet points, and headings instead of full sentences.",
        explanation: NOTE_TECHNIQUES.map((t) => `${t.name} — ${t.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, NOTE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of the note-making process in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: NOTE_STEPS.map((s) => s.id),
        hint: "First understand the whole text, then find the key points, then write and organise them, then review.",
        explanation: NOTE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the passage.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint: "The exact word appears directly in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (rng() < 0.5) {
      const choices = shuffle(rng, [NOTE_FORM_TASK.goodNote, ...NOTE_FORM_TASK.distractors]);
      return {
        kind: "multiple-choice",
        passage: PASSAGE,
        prompt: `Which is the best note-form version of this key point: "${NOTE_FORM_TASK.fullSentence}"?`,
        choices,
        correctIndex: choices.indexOf(NOTE_FORM_TASK.goodNote),
        layout: "list",
        hint: "Good notes are short but still keep the important information — not too long, and not so short that meaning is lost.",
        explanation: `"${NOTE_FORM_TASK.goodNote}" keeps the key information in a short, note-form phrase — the other options either copy the full sentence or cut out too much meaning.`,
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
