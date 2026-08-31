import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { MONTHS } from "./shared";

// Sub-strand 3.4 Guided Writing: Sentences — Theme: Time.
// Content: listing months of the year in correct sequence, constructing simple sentences using
// acquired vocabulary (from a substitution table), rearranging jumbled words.

const ACTIVITIES = [
  "tabda'u al-madrasa (school starts)",
  "tanzilu al-amtar (the rains fall)",
  "yakunu al-jaww haar (the weather is hot)",
  "tuqaamu al-imtihanaat (exams are held)",
  "tabda'u al-'utla (the holiday begins)",
  "yuqaamu al-mahrajaan (the festival is held)",
];

const SENTENCE_ITEMS: { chunks: string[]; sentence: string }[] = MONTHS.slice(0, 6).map((m, i) => ({
  chunks: [`Fi shahr ${m.word},`, ACTIVITIES[i].split(" (")[0], "fi madrasatina."],
  sentence: `Fi shahr ${m.word}, ${ACTIVITIES[i]} fi madrasatina. (In the month of ${m.meaning}, ${ACTIVITIES[i].split("(")[1].replace(")", "")} at our school.)`,
}));

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = MONTHS.map((m) => ({
  before: `The month written as "${m.word}" in a substitution-table sentence means `,
  after: ".",
  correct: m.meaning,
}));

export const timeWriting: Skill = {
  id: "g6-ar-w-time",
  code: "W.4",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: sentences (time)",
  description: "List the months of the year in correct sequence, construct simple sentences from a substitution table, and rearrange jumbled words into sentences about the months.",
  generate(rng) {
    const branch = randChoice(rng, ["listing", "ordering", "fill", "match", "categorize"] as const);

    if (branch === "listing") {
      const monthCount = randChoice(rng, [4, 5, 6]);
      const chosen = shuffle(rng, MONTHS).slice(0, monthCount);
      const askOrder = randChoice(rng, ["first", "last"] as const);
      const sorted = [...chosen].sort((a, b) => a.order - b.order);
      const correct = askOrder === "first" ? sorted[0] : sorted[sorted.length - 1];
      const distractors = chosen.filter((m) => m.word !== correct.word).map((m) => m.word);
      const choices = shuffle(rng, [correct.word, ...shuffle(rng, distractors).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          `When listing these months on a chart in order, which comes ${askOrder}: ${chosen.map((m) => m.word).join(", ")}?`,
          `You are writing these months on a class chart in calendar order. Which one comes ${askOrder}?`,
          `Which of these months should be written ${askOrder} on a calendar-order chart: ${chosen.map((m) => m.word).join(", ")}?`,
        ]),
        choices,
        correctIndex: choices.indexOf(correct.word),
        layout: "row",
        hint: "Yanayir (January) is month 1; Disambir (December) is month 12.",
        explanation: `In calendar order, "${correct.word}" (${correct.meaning}) comes ${askOrder} among: ${chosen.map((m) => `${m.word} (${m.meaning})`).join(", ")}.`,
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, SENTENCE_ITEMS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange the word groups to write this sentence correctly.",
          "Put these word groups in the correct order.",
          "Order the pieces to form a correct sentence about this month.",
          "Click the word groups in the order they belong.",
          "Rebuild this sentence in the correct order.",
        ]),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder: set.chunks.map((c, i) => `${i}-${c}`),
        hint: "A sentence about time usually starts with 'Fi shahr...' (In the month of...).",
        explanation: `The correctly written sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence correctly.",
          "What word completes this writing fact?",
          "Fill the gap with the correct month meaning.",
          "Complete this fact about the months.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about which English month name matches the Arabic word given.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
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
          "Before writing your chart, match each month to its meaning.",
          "Match each Arabic month name to its meaning.",
          "Which meaning goes with which month?",
          "Pair each month with its correct meaning.",
          "Match each month word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Use these matches to help plan your creative months-of-the-year chart.",
        explanation: chosen.map((m) => `"${m.word}" means "${m.meaning}".`).join(" "),
      };
    }

    const TERM_BUCKETS = MONTHS.map((m) => ({ word: m.word, term: m.order <= 4 ? "Term 1" : m.order <= 8 ? "Term 2" : "Term 3" }));
    const chosen = shuffle(rng, TERM_BUCKETS).slice(0, 6);
    const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.term));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Before writing your chart, sort each month by school term.",
        "Group these months by Kenyan school term.",
        "Which term does each month belong to?",
        "Sort each month into its correct term for your chart.",
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
