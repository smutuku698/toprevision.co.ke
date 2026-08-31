import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { term: string; definition: string }[] = [
  { term: "Rhythm", definition: "the regular pattern of beats that gives a song its movement" },
  { term: "Melody", definition: "the tune, or sequence of musical notes, that is sung" },
  { term: "Rhyme", definition: "matching end sounds in the lines of the lyrics" },
  { term: "Chorus (refrain)", definition: "the repeated part of a song, usually sung after each verse" },
  { term: "Theme", definition: "the central message or subject the song is about" },
  { term: "Repetition", definition: "words or lines repeated to emphasise an idea or make it memorable" },
];

const TECHNIQUES = [
  "Singing with correct pitch",
  "Controlling your breathing between phrases",
  "Articulating words clearly",
  "Using appropriate facial expressions",
  "Making eye contact with the audience",
  "Using hand gestures that match the song's mood",
  "Keeping steady rhythm and timing",
  "Projecting your voice to reach the whole audience",
];

const SONG_FEATURE_WORDS = FEATURES.map((f) => f.term);

const ROLE_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can one improve the presentation of a song to make it interesting?",
    correct: "By using appropriate facial expressions, gestures and eye contact with the audience",
    distractors: ["By singing as loudly as possible regardless of the tune", "By reading the lyrics from a paper without looking up", "By standing completely still throughout the song"],
  },
  {
    q: "What is one important role of songs in society?",
    correct: "They entertain audiences while teaching lessons and passing on cultural values",
    distractors: ["They exist only to fill silence during events", "They are meant to confuse listeners with difficult words", "They can only be performed during examinations"],
  },
  {
    q: "When writing a song about a scientific innovation, what should you decide on first?",
    correct: "The innovation you want to sing about and the message you want to share about it",
    distractors: ["The costume you will wear during the performance", "How loudly you will sing each line", "The order in which the audience will sit"],
  },
  {
    q: "Which performance technique most helps an audience hear the words of a song clearly?",
    correct: "Clear articulation combined with controlled breathing",
    distractors: ["Singing with your back turned to the audience", "Mumbling the more difficult words", "Singing every line as fast as possible"],
  },
  {
    q: "Why do many songwriters use a chorus that repeats throughout a song?",
    correct: "So the main message becomes memorable and the audience can join in",
    distractors: ["To make the song longer without adding new ideas", "Because verses are not allowed in songs", "To confuse the listener about the song's topic"],
  },
];

const SONG_LINES_ABOUT_INNOVATION = [
  { before: "Verse: A small solar lamp lights up our", after: "night, / no more darkness, everything's alright.", correctAnswer: "night", acceptedAnswers: [] },
  { before: "Chorus: Mobile money moves from hand to", after: ", / sending help across the whole land.", correctAnswer: "hand", acceptedAnswers: [] },
  { before: "Verse: A drip of water feeds the thirsty", after: ", / new irrigation makes a better yield.", correctAnswer: "field", acceptedAnswers: ["fields"] },
];

export const oralPresentationsSongs: Skill = {
  id: "g8-eng-ls-oral-presentations-songs",
  code: "LS.2",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Oral Presentations: Songs",
  description: "Identify features of songs, apply performance techniques, and compose songs on a scientific innovation.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Songs combine features like rhythm, melody, rhyme and a repeated chorus, and are best performed with clear voice, expression and audience contact.";

    if (branch === "match") {
      const chosen = shuffle(rng, FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.term, label: f.term })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.term, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.term] = f.term;
      return {
        kind: "click-match",
        prompt: "Match each feature of a song to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((f) => `${f.term} — ${f.definition}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const featureItems = shuffle(rng, SONG_FEATURE_WORDS).slice(0, 3);
      const techniqueItems = shuffle(rng, TECHNIQUES).slice(0, 3);
      const items = shuffle(rng, [
        ...featureItems.map((label) => ({ id: label, label, bucket: "feature" })),
        ...techniqueItems.map((label) => ({ id: label, label, bucket: "technique" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each item into Feature of a song or Performance technique.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "feature", label: "Feature of a song" },
          { id: "technique", label: "Performance technique" },
        ],
        correctBucket,
        hint: "A feature is something built into the song itself (like rhythm or rhyme); a technique is something a performer does while singing it.",
        explanation: `Features of a song: ${featureItems.join(" / ")}. Performance techniques: ${techniqueItems.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const steps = [
        { id: "choose", label: "Choose the scientific innovation you want the song to be about" },
        { id: "message", label: "Decide the message or theme you want the song to communicate" },
        { id: "lyrics", label: "Write the lyrics, using rhyme and repetition to make them memorable" },
        { id: "tune", label: "Set the lyrics to a melody and rhythm" },
        { id: "rehearse", label: "Rehearse the performance, working on pitch, expression and timing" },
      ];
      const items = shuffle(rng, steps);
      return {
        kind: "ordering",
        prompt: "Arrange the stages of writing and performing a song about a scientific innovation in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: steps.map((s) => s.id),
        hint: "Start with what the song is about, then its message, then the words, then the tune, and finally practise performing it.",
        explanation: steps.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, SONG_LINES_ABOUT_INNOVATION);
      return {
        kind: "fill-blank",
        prompt: "Complete the missing rhyming word in this song verse about a scientific innovation.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers.length ? entry.acceptedAnswers : undefined,
        inputMode: "text",
        hint: "Look at the word at the end of the next line — the missing word should rhyme with it.",
        explanation: `The completed line reads: "${entry.before} ${entry.correctAnswer}${entry.after}" — the rhyme links the two lines together.`,
      };
    }

    const entry = randChoice(rng, ROLE_QUESTIONS);
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
