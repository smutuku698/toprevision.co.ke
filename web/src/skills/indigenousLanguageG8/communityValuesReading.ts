import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Passage {
  text: string;
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
}

const PASSAGES: Passage[] = [
  {
    text: "Every last Saturday of the month, residents of Kanyakine village gather for a communal clean-up called 'kazi ya jamii'. Young and old sweep the market, clear blocked drainage, and repair the footbridge if it needs fixing. Afterwards, elders share a meal with everyone who took part, as a way of thanking the community for their effort. Newcomers to the village say the exercise made them feel welcomed and part of the community within weeks of moving in.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A village community working together each month to clean and maintain their area",
          "A village that has stopped cleaning its market",
          "Elders refusing to thank residents for their work",
          "A village where only the youth do communal work",
        ],
        correctIndex: 0,
        explanation: "The passage describes the monthly 'kazi ya jamii' clean-up, where residents of all ages work together to maintain the village.",
      },
      {
        prompt: "According to the passage, how do newcomers feel about the communal clean-up?",
        choices: [
          "It made them feel welcomed and part of the community",
          "It made them want to leave the village",
          "They refused to take part",
          "They felt it was a waste of time",
        ],
        correctIndex: 0,
        explanation: "The passage directly states that newcomers say the exercise made them feel welcomed and part of the community.",
      },
    ],
    trueFalse: [
      { text: "The clean-up happens every last Saturday of the month.", isTrue: true },
      { text: "Elders share a meal with everyone who took part.", isTrue: true },
      { text: "Only the youth take part in the clean-up.", isTrue: false },
      { text: "Newcomers say the clean-up made them feel unwelcome.", isTrue: false },
    ],
  },
  {
    text: "In Turkana, when a family loses their livestock to drought, neighbours often contribute a few goats each so the family can rebuild their herd. This practice, a form of mutual support, has helped many families recover after difficult seasons. Elders say the custom survives because everyone understands that misfortune can visit any household next.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A community practice of neighbours helping a family recover livestock after drought",
          "A community that refuses to help affected families",
          "A drought that ended all livestock keeping",
          "Elders discouraging neighbours from helping each other",
        ],
        correctIndex: 0,
        explanation: "The passage describes how Turkana neighbours contribute goats to help a family rebuild their herd after drought.",
      },
      {
        prompt: "Why, according to the passage, does this custom of mutual support survive?",
        choices: [
          "Because everyone understands that misfortune can affect any household",
          "Because the government requires it by law",
          "Because only wealthy families take part",
          "Because it happens only once in a lifetime",
        ],
        correctIndex: 0,
        explanation: "The passage directly states that elders say the custom survives because everyone understands misfortune can visit any household next.",
      },
    ],
    trueFalse: [
      { text: "Neighbours contribute goats to help a family rebuild their herd.", isTrue: true },
      { text: "The custom is a form of mutual support.", isTrue: true },
      { text: "Elders discourage neighbours from helping each other.", isTrue: false },
      { text: "The custom only helps wealthy families.", isTrue: false },
    ],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "solidarity", meaning: "Unity and mutual support within a group of people" },
  { word: "custom", meaning: "A traditional practice followed by a particular community" },
  { word: "communal", meaning: "Shared by or belonging to a whole community" },
  { word: "hospitality", meaning: "Friendly and generous treatment of guests or strangers" },
  { word: "integrity", meaning: "The quality of being honest and having strong moral principles" },
  { word: "respect", meaning: "Consideration and regard for the feelings and rights of others" },
];

interface FillItem {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint: string;
  explanation: string;
}

const FILL_ITEMS: FillItem[] = [
  {
    before: "Neighbours who unite to support a family in need are showing",
    after: "with that family.",
    correctAnswer: "solidarity",
    hint: "This word names unity and mutual support within a group.",
    explanation: "'Solidarity' means unity and mutual support, shown here by neighbours helping a family in need.",
  },
  {
    before: "A traditional practice that a community has followed for generations is called a",
    after: ".",
    correctAnswer: "custom",
    hint: "This word names a traditional practice followed by a community.",
    explanation: "A 'custom' is a traditional practice followed by a particular community.",
  },
  {
    before: "Work that is shared by the whole village, like the monthly clean-up, is described as",
    after: "work.",
    correctAnswer: "communal",
    hint: "This word describes something shared by a whole community.",
    explanation: "'Communal' describes something shared by or belonging to a whole community.",
  },
  {
    before: "Welcoming visitors warmly and treating them generously is called",
    after: ".",
    correctAnswer: "hospitality",
    hint: "This word names friendly and generous treatment of guests.",
    explanation: "'Hospitality' is friendly and generous treatment of guests or strangers.",
  },
];

const CLEANUP_STEPS: { id: string; label: string }[] = [
  { id: "announce", label: "Village elders announce the clean-up date at a baraza (community meeting)." },
  { id: "gather", label: "Residents gather at the market with tools on the set day." },
  { id: "work", label: "Everyone sweeps, clears drainage, and repairs shared spaces." },
  { id: "share", label: "Elders share a meal with everyone who took part." },
];

export const communityValuesReading: Skill = {
  id: "g8-il-r-community-values",
  code: "R.5",
  subjectId: "indigenous-language",
  strandId: "g8-il-reading",
  grade: 8,
  title: "Common community values: reading for information",
  description: "Build vocabulary about community values and respond to questions from texts for comprehension.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill", "order"] as const);

    if (branch === "mc") {
      const passage = randChoice(rng, PASSAGES);
      const q = randChoice(rng, passage.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Reread the passage and look for the sentence that answers the question directly.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const passage = randChoice(rng, PASSAGES);
      const items = passage.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: passage.text,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check each statement against exactly what the passage says.",
        explanation: passage.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the passage.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each community-values word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the values that hold a community together.",
        explanation: chosen.map((v) => `${v.word} — ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: item.before,
        after: item.after,
        correctAnswer: item.correctAnswer,
        acceptedAnswers: item.acceptedAnswers,
        inputMode: "text",
        hint: item.hint,
        explanation: item.explanation,
      };
    }

    const items = shuffle(rng, CLEANUP_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps of the village's communal clean-up day in the correct order.",
      instruction: "Click them in order.",
      items,
      correctOrder: CLEANUP_STEPS.map((s) => s.id),
      hint: "The day is planned before residents gather, and the shared meal comes only after the work is done.",
      explanation: CLEANUP_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
