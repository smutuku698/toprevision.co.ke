import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SCHOOL_VOCAB, POSITION_VOCAB, name, place } from "./shared";

// Sub-strand 3.9 Guided Writing: Paragraph Writing — Theme: Getting Around.
// Content: features of a well-developed paragraph, sentences from a substitution table describing
// school facilities from pictures, composing a paragraph on the theme.

const FEATURE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "Which of these is a feature of a well-developed paragraph describing your school?", correct: "Each sentence connects logically to describe the school layout in order", distractors: ["Every sentence describes a completely different, unrelated topic", "Sentences appear in random order with no connection", "It has no full stops anywhere"], explanation: "A well-developed paragraph keeps sentences logically connected around one topic, in a sensible order." },
  { q: "Why should a paragraph describing school facilities mention their positions relative to each other?", correct: "so the reader can picture where each facility actually is", distractors: ["so the paragraph looks longer", "position words are never needed in writing", "it doesn't matter what order the facilities are mentioned"], explanation: "Position words (next to, behind, opposite) help the reader build an accurate mental map of the school." },
  { q: "What should you check for after writing a paragraph about your school, besides logical order?", correct: "correct spelling and neat, legible handwriting", distractors: ["using as many long words as possible", "removing all punctuation", "writing every sentence backwards"], explanation: "Neat/legible writing and correct spelling are paragraph features, alongside logical sequencing." },
  { q: "A paragraph about the school jumps between the library and the gate at random with no clear path. What is wrong with it?", correct: "it is not well sequenced", distractors: ["it uses too much vocabulary", "it is too short", "it has too many full stops"], explanation: "Jumbling the order of facilities breaks logical sequencing, a key paragraph feature." },
  { q: "What makes a school-description paragraph 'well paragraphed'?", correct: "related sentences about the same facility or area stay grouped together", distractors: ["every sentence is its own paragraph", "it has no spaces between words", "it repeats the same sentence many times"], explanation: "Being 'well paragraphed' means related sentences about one idea or area stay grouped together." },
];

const SUBSTITUTION_TABLE: { subject: string; position: string; place: string }[] = [
  { subject: "al-maktaba", position: "khalf", place: "al-fasl" },
  { subject: "al-mal'ab", position: "amaam", place: "al-maktab" },
  { subject: "al-hadiqa", position: "bijaanib", place: "al-mat'am" },
  { subject: "ghurfat al-mu'allimeen", position: "qareeb min", place: "al-bawwaba" },
  { subject: "al-hammam", position: "muqabil", place: "al-mamarr" },
];

const SUBSTITUTION_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "Using the substitution table pattern '[facility] [position] [facility]', how would you say 'the library is behind the classroom'?", correct: "al-maktaba khalf al-fasl", distractors: ["al-fasl khalf al-maktaba", "al-maktaba amaam al-fasl", "al-maktaba fi al-fasl"], explanation: "The subject (al-maktaba) comes first, then the position word (khalf), then the reference place (al-fasl)." },
  { q: "In a substitution-table sentence, what comes immediately after the subject facility?", correct: "the position word", distractors: ["the verb", "a greeting", "the subject's colour"], explanation: "The pattern is: [facility] + [position word] + [reference facility]." },
  { q: "Why is a substitution table useful for writing sentences about school facilities?", correct: "you can swap in different facilities and position words to build many correct sentences", distractors: ["it only works for one single sentence", "it removes the need to know any vocabulary", "it is unrelated to describing pictures"], explanation: "A substitution table lets a writer combine vocabulary systematically to build varied, correct sentences." },
];

const PARAGRAPH_SETS: ((n: string, p: string) => { sentences: string[] })[] = [
  (n, p) => ({
    sentences: [
      `Madrasat ${n} fi ${p} kabeera wa jameela.`,
      `Al-fasl bijaanib al-maktaba.`,
      `Al-mal'ab amaam ghurfat al-mu'allimeen.`,
      `Al-mat'am muqabil al-bawwaba al-ra'isiya.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `${n} yasifu madrasatahu fi ${p}.`,
      `Al-maktaba khalf al-fasl mubashiratan.`,
      `Al-hadiqa qareeb min al-mat'am.`,
      `Al-hammam muqabil al-mamarr al-ra'isi.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Fi ${p}, madrasat ${n} tahtawi 'ala 'adid al-marafiq.`,
      `Al-sabbura fi kulla fasl.`,
      `Al-maktab bijaanib ghurfat al-mu'allimeen.`,
      `Al-mal'ab 'abra al-hadiqa mubashiratan.`,
    ],
  }),
];

export const gettingAroundWriting: Skill = {
  id: "g6-ar-w-getting-around",
  code: "W.9",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: paragraph writing (school facilities)",
  description: "Compose sentences about school facilities using a substitution table, and write a well-developed paragraph describing a school layout.",
  generate(rng) {
    const branch = randChoice(rng, ["ordering", "features", "substitution", "match", "categorize"] as const);

    if (branch === "ordering") {
      const n = name(rng);
      const p = place(rng);
      const set = randChoice(rng, PARAGRAPH_SETS)(n, p);
      const withIds = set.sentences.map((s, i) => ({ id: `${i}-${s}`, label: s }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange these jumbled sentences into a well-sequenced paragraph about the school.",
          "Put these sentences in the order that makes a coherent paragraph.",
          "Sequence these sentences to form a logical paragraph describing the school.",
          "Rearrange the jumbled sentences into the correct paragraph order.",
          "Which order turns these sentences into a clear paragraph about the school?",
        ]),
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Start with a general description of the school, then move facility by facility, describing each position.",
        explanation: `A well-sequenced paragraph reads:\n${set.sentences.join("\n")}`,
      };
    }

    if (branch === "features") {
      const q = randChoice(rng, FEATURE_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about neatness, spelling, and whether the school description follows a logical order.",
        explanation: q.explanation,
      };
    }

    if (branch === "substitution") {
      const q = randChoice(rng, SUBSTITUTION_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "The pattern is: [facility] + [position word] + [reference facility].",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const row = randChoice(rng, SUBSTITUTION_TABLE);
      const chosen = shuffle(rng, [...POSITION_VOCAB]).slice(0, 6);
      if (!chosen.some((c) => c.word === row.position)) chosen[0] = POSITION_VOCAB.find((p2) => p2.word === row.position)!;
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each position word to its meaning before completing your substitution-table sentences.",
          "Match the word to what it means.",
          "Which meaning goes with which position word?",
          "Pair each position word with its correct meaning.",
          "Match each word to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Recall the position vocabulary you've practised for describing school facilities.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    const FACILITY_CATEGORY: { word: string; type: "Learning space" | "Support facility" }[] = SCHOOL_VOCAB.map((f) => ({
      word: f.word,
      type: (["fasl", "maktaba", "sabbura"].includes(f.word) ? "Learning space" : "Support facility") as "Learning space" | "Support facility",
    }));
    const chosen2 = shuffle(rng, FACILITY_CATEGORY).slice(0, 7);
    const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Before writing, sort each facility: Learning space, or Support facility?",
        "Group these school facilities the way you would plan a paragraph.",
        "Sort each facility word into the correct category.",
        "Classify each facility before using it in your writing.",
        "Which category does each facility belong to?",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Learning space", label: "Learning space" },
        { id: "Support facility", label: "Support facility" },
      ],
      correctBucket,
      hint: "The classroom, library, and blackboard are learning spaces; the rest support school life.",
      explanation: chosen2.map((c) => `"${c.word}" is a ${c.type.toLowerCase()}.`).join(" "),
    };
  },
};
