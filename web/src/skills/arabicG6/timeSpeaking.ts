import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { MONTHS, SHADDAH_WORDS, name, place } from "./shared";

// Sub-strand 1.4 Phonological Awareness: Fluency — Theme: Time.
// Content: intonation, direct questions on months of the year, and the shaddah (doubling/gemination)
// sign — explicitly named with example words "sabburah, Allah, baddah" at 1.4.

const SHADDAH_QUESTIONS: { question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { question: "Which sign shows that a consonant should be pronounced doubled (twice in a row)?", correct: "shaddah", distractors: ["fatha", "sukun", "madda"], explanation: "shaddah is a small mark showing a doubled/geminated consonant sound." },
  { question: `In the word "${SHADDAH_WORDS[0]}" (blackboard), which sign marks the doubled consonant?`, correct: "shaddah", distractors: ["fatha", "kasra", "sukun"], explanation: `"${SHADDAH_WORDS[0]}" has a shaddah on its middle consonant, doubling that sound.` },
  { question: `In the word "${SHADDAH_WORDS[1]}", which sign marks the doubled consonant?`, correct: "shaddah", distractors: ["damma", "sukun", "madda"], explanation: `"${SHADDAH_WORDS[1]}" has a shaddah, doubling that consonant's sound.` },
  { question: `In the word "${SHADDAH_WORDS[2]}", which sign marks the doubled consonant?`, correct: "shaddah", distractors: ["fatha", "kasra", "sukun"], explanation: `"${SHADDAH_WORDS[2]}" has a shaddah, doubling that consonant's sound.` },
  { question: "What effect does a shaddah have when you pronounce a word?", correct: "it makes you hold/double that consonant sound", distractors: ["it silences the consonant", "it lengthens the vowel instead", "it has no pronunciation effect"], explanation: "A shaddah tells the reader to pronounce the marked consonant doubled (held slightly longer)." },
  { question: "Is shaddah a vowel sign like fatha/kasra/damma, or something different?", correct: "something different — it marks consonant doubling, not a vowel", distractors: ["it is exactly the same as fatha", "it is exactly the same as sukun", "it replaces all other signs"], explanation: "shaddah is a distinct mark for consonant doubling, separate from the short-vowel signs." },
  { question: "When practising intonation with shaddah words, what should you focus on?", correct: "holding the doubled consonant sound slightly longer", distractors: ["speaking as fast as possible", "skipping the doubled letter", "ignoring the mark entirely"], explanation: "Correct pronunciation of a shaddah word means holding the doubled consonant a little longer." },
  { question: "Which of these three example words was used in class to practise shaddah pronunciation?", correct: SHADDAH_WORDS[1], distractors: ["kayfa", "shukran", "ismi"], explanation: `"${SHADDAH_WORDS[1]}" is one of the shaddah practice words (along with "${SHADDAH_WORDS[0]}" and "${SHADDAH_WORDS[2]}").` },
  { question: "A shaddah mark is placed directly:", correct: "above the doubled consonant letter", distractors: ["at the very start of the word", "at the very end of the sentence", "below the following vowel"], explanation: "shaddah sits directly above the consonant that should be doubled." },
  { question: "Why is practising shaddah words important for fluency?", correct: "mispronouncing a doubled consonant can change how clear or correct the word sounds", distractors: ["it has no effect on fluency at all", "it only matters in written text, never speech", "it is only used in songs"], explanation: "Correct doubling affects pronunciation clarity and fluency." },
];

const MONTH_MEANING_TEMPLATES: ((n: string, p: string, rng: RNG) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = MONTHS.map((m) => (n: string, p: string, rng: RNG) => ({
  prompt: `${n} in ${p} is asked directly: "Ay shahr huwa '${m.word}'?" (Which month is '${m.word}'?) What is the answer?`,
  correct: m.meaning,
  distractors: shuffle(rng, MONTHS.filter((x) => x.word !== m.word)).slice(0, 3).map((x) => x.meaning),
  explanation: `"${m.word}" is the Arabic name for ${m.meaning}.`,
}));

const TERM_BUCKETS: { word: string; term: "Term 1" | "Term 2" | "Term 3" }[] = MONTHS.map((m) => ({
  word: m.word,
  term: m.order <= 4 ? "Term 1" : m.order <= 8 ? "Term 2" : "Term 3",
}));

export const timeSpeaking: Skill = {
  id: "g6-ar-ls-time",
  code: "LS.4",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Phonological awareness: fluency (time)",
  description: "Practise shaddah (doubled-consonant) pronunciation and answer direct questions about the months of the year.",
  generate(rng) {
    const branch = randChoice(rng, ["shaddah", "months", "match", "ordering", "categorize"] as const);

    if (branch === "shaddah") {
      const q = randChoice(rng, SHADDAH_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "shaddah is a small mark above a letter, showing that consonant is doubled.",
        explanation: q.explanation,
      };
    }

    if (branch === "months") {
      const n = name(rng);
      const p = place(rng);
      const tmplFn = randChoice(rng, MONTH_MEANING_TEMPLATES);
      const q = tmplFn(n, p, rng);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "row",
        hint: "Think through the Arabic month names in order, starting from Yanayir (January).",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MONTHS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.word, label: m.word })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.word, label: m.meaning })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.word] = m.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each Arabic month name to its English meaning.",
          "Match the spoken month name to what it means.",
          "Which month goes with which Arabic name?",
          "Pair each Arabic month with its correct meaning.",
          "Match each month name to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each month name aloud to yourself before matching it.",
        explanation: chosen.map((m) => `"${m.word}" means "${m.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const chosenCount = randChoice(rng, [4, 5]);
      const chosen = shuffle(rng, MONTHS).slice(0, chosenCount).sort((a, b) => a.order - b.order);
      const items = shuffle(rng, chosen.map((m, i) => ({ id: `${i}-${m.word}`, label: m.word })));
      const correctOrder = chosen.map((m, i) => `${i}-${m.word}`);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Put these months in calendar order, earliest first.",
          "Arrange these months from earliest to latest in the year.",
          "Sequence these months in the correct calendar order.",
          "Order these months as they occur in the year.",
          "Which order do these months come in the year?",
        ]),
        instruction: "Click the months in calendar order.",
        items,
        correctOrder,
        hint: "Yanayir (January) is the first month; Disambir (December) is the last.",
        explanation: `Calendar order: ${chosen.map((m) => `${m.word} (${m.meaning})`).join(" -> ")}.`,
      };
    }

    const chosen = shuffle(rng, TERM_BUCKETS).slice(0, 6);
    const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.term));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Sort each month into the Kenyan school term it falls in.",
        "Group these months by school term (Term 1, 2, or 3).",
        "Which school term does each month belong to?",
        "Sort each month into the correct term.",
        "Classify each month by school term.",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Term 1", label: "Term 1 (Jan-Apr)" },
        { id: "Term 2", label: "Term 2 (May-Aug)" },
        { id: "Term 3", label: "Term 3 (Sep-Dec)" },
      ],
      correctBucket,
      hint: "Term 1 runs January-April, Term 2 May-August, Term 3 September-December.",
      explanation: chosen.map((c) => `"${c.word}" falls in ${c.term}.`).join(" "),
    };
  },
};
