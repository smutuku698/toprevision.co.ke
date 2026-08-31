import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FEATURES: { term: string; definition: string }[] = [
  { term: "Chorus/Refrain", definition: "a line or set of lines repeated after every verse, carrying the song's main message" },
  { term: "Verse", definition: "a section of the song that moves the story or ideas forward, changing each time" },
  { term: "Rhythm", definition: "the beat pattern that makes a song easy to sing and move to" },
  { term: "Repetition", definition: "words or lines repeated on purpose so listeners remember them" },
  { term: "Simple language", definition: "plain, memorable wording that is easy for a group to sing together" },
];

// A short indigenous-knowledge song, split into ordered parts (verse-chorus-verse-chorus pattern).
const SONG_PARTS: { id: string; label: string }[] = [
  { id: "v1", label: "Verse 1: \"Long ago our fathers herded cattle across the plain,\"" },
  { id: "c1", label: "Chorus: \"Sing, sing, of the wisdom that will always remain,\"" },
  { id: "v2", label: "Verse 2: \"They planted millet when the first rains came,\"" },
  { id: "c2", label: "Chorus: \"Sing, sing, of the wisdom that will always remain,\"" },
];

// Lines from a song about indigenous knowledge, to sort by whether each is the repeated chorus
// line (the song's central, unchanging message) or a verse line (new content each time it appears).
const LINES: { text: string; category: "chorus" | "verse" }[] = [
  { text: "Sing, sing, of the harvest that our elders made,", category: "chorus" },
  { text: "In the dry season, they dug wells so deep,", category: "verse" },
  { text: "They told stories by the fire before we'd sleep,", category: "verse" },
  { text: "They named every star that lit the night sky,", category: "verse" },
  { text: "They read the clouds to know when rains were due,", category: "verse" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is a chorus (refrain) in a song?",
    correct: "A line or lines repeated after every verse, carrying the main message",
    distractors: ["A part sung only once at the very end", "A section that never repeats", "The title of the song written on paper"],
  },
  {
    q: "Why do songwriters use repetition?",
    correct: "So listeners remember the words and can sing along",
    distractors: ["To make the song harder to understand", "Because verses must never change", "To avoid having a chorus altogether"],
  },
  {
    q: "Why is simple language important in songwriting?",
    correct: "It is easy for a group of people to sing together and remember",
    distractors: ["Simple language makes a song less meaningful", "Songs must use complex vocabulary to be effective", "Simple language is only used in written essays"],
  },
  {
    q: "Why is songwriting important for recording indigenous knowledge?",
    correct: "It passes on cultural knowledge and history in a memorable, singable form across generations",
    distractors: ["Songs cannot carry any real information", "Indigenous knowledge is better forgotten", "Only written books can preserve indigenous knowledge"],
  },
];

export const musicSongWriting: Skill = {
  id: "g8-il-w-music",
  code: "W.8",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Indigenous Music: Creative writing - Songs",
  description: "Outline the features of a song and compose lines that record indigenous knowledge.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.term })));
      const targets = shuffle(rng, FEATURES.map((f) => ({ id: f.term, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURES) correctMap[f.term] = f.term;
      return {
        kind: "click-match",
        prompt: "Match each feature of a song to its definition.",
        tokens,
        targets,
        correctMap,
        hint: "Songs balance a repeated chorus with changing verses, held together by rhythm and simple language.",
        explanation: FEATURES.map((f) => `${f.term} — ${f.definition}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SONG_PARTS);
      return {
        kind: "ordering",
        prompt: "Arrange the parts of this song about indigenous knowledge in the correct verse-chorus order.",
        instruction: "Click them in order.",
        items,
        correctOrder: SONG_PARTS.map((p) => p.id),
        hint: "A simple song usually follows the pattern: verse, chorus, verse, chorus — with the chorus repeating unchanged.",
        explanation: SONG_PARTS.map((p) => p.label).join(" / "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, LINES);
      const buckets = [
        { id: "chorus", label: "Chorus (repeated line)" },
        { id: "verse", label: "Verse (new content)" },
      ];
      const items = chosen.map((l, i) => ({ id: `s${i}`, label: l.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((l, i) => (correctBucket[`s${i}`] = l.category));
      return {
        kind: "categorize",
        prompt: "This is a song about indigenous knowledge. Sort each line by whether it is a repeated chorus line or a new verse line.",
        items,
        buckets,
        correctBucket,
        hint: "The chorus line appears identically more than once; verse lines introduce new information each time.",
        explanation: chosen.map((l) => `"${l.text}" — ${l.category === "chorus" ? "a chorus line, repeated to carry the main message" : "a verse line, moving the song's ideas forward"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: "The line or lines repeated after every verse of a song, carrying its main message, is called the",
        after: ".",
        correctAnswer: "chorus",
        acceptedAnswers: ["refrain"],
        inputMode: "text",
        hint: "This is the part of a song audiences most often sing along to, since it repeats.",
        explanation: "The chorus (or refrain) is the line or lines repeated after every verse, carrying the song's main message.",
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
      hint: "Songs use a chorus, verses, rhythm, repetition, and simple language to be memorable.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
