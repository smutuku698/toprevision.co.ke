import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "As a girl, Jepkosgei ran barefoot to school every day along the escarpment, dreaming of representing Kenya at the Olympics. When a knee injury threatened to end her training at sixteen, she spent two years rebuilding her strength before her coaches would let her race again. At nineteen, she qualified for the national team by winning a regional trial in record time. Four years later, she stood on the podium at the Olympics, Kenya's flag rising as the anthem played, and afterwards she returned home to build a free training camp for girls in her village.";

const EVENTS = [
  { id: "run", label: "Jepkosgei runs barefoot to school, dreaming of the Olympics" },
  { id: "injury", label: "A knee injury threatens to end her training at sixteen" },
  { id: "rebuild", label: "She spends two years rebuilding her strength" },
  { id: "qualify", label: "She qualifies for the national team by winning a regional trial" },
  { id: "podium", label: "She stands on the Olympic podium and later builds a training camp for girls" },
];

const NOTES: { event: string; note: string }[] = [
  { event: "A knee injury threatens to end her training at sixteen", note: "Injury setback" },
  { event: "She spends two years rebuilding her strength", note: "Recovery and determination" },
  { event: "She qualifies for the national team by winning a regional trial", note: "National team selection" },
  { event: "She stands on the podium at the Olympics", note: "Olympic triumph" },
];

const BEFORE_AFTER_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which event happened immediately before Jepkosgei qualified for the national team?",
    correct: "She spent two years rebuilding her strength",
    distractors: [
      "She ran barefoot to school as a young girl",
      "She stood on the Olympic podium",
      "She built a free training camp for girls",
    ],
    explanation: "The passage says she rebuilt her strength for two years, and 'at nineteen, she qualified for the national team' right after — rebuilding came directly before qualifying.",
  },
  {
    q: "Which event happened immediately after Jepkosgei qualified for the national team?",
    correct: "She stood on the podium at the Olympics four years later",
    distractors: [
      "A knee injury threatened to end her training",
      "She ran barefoot to school as a young girl",
      "She spent two years rebuilding her strength",
    ],
    explanation: "The passage moves directly from her qualifying for the national team to 'four years later, she stood on the podium at the Olympics.'",
  },
];

const APPRECIATE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why is it valuable to read stories like Jepkosgei's, about Kenyan heroes and heroines?",
    correct: "They inform us about real struggles and successes while inspiring us, combining information and enjoyment",
    distractors: [
      "They exist only to fill space in a class reader with no real purpose",
      "They discourage readers from setting any personal goals",
      "They are useful only for memorising dates and facts",
    ],
    explanation: "Reading about a heroine's setbacks and achievements both informs readers about real struggles and inspires them — showing reading can be for information and enjoyment together.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "As a girl, Jepkosgei ran barefoot to school every day along the", after: ", dreaming of representing Kenya at the Olympics.", correctAnswer: "escarpment" },
  { before: "At nineteen, she qualified for the national team by winning a regional", after: "in record time.", correctAnswer: "trial" },
  { before: "she returned home to build a free training camp for", after: "in her village.", correctAnswer: "girls" },
];

export const classReaderSequenceOfEvents: Skill = {
  id: "g7-eng-r-class-reader-sequence-of-events",
  code: "R.24",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Class Reader — Sequence of Events",
  description: "Explain and note the sequence of events in a class reader about a Kenyan heroine, and appreciate reading for information and enjoyment.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "before-after", "match", "appreciate", "fill"] as const);
    const hint = "Track the events in the order the story tells them, from her childhood to her later achievements.";

    if (branch === "order") {
      const items = shuffle(rng, EVENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the events of Jepkosgei's story in the order they happened.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EVENTS.map((e) => e.id),
        hint: "The story moves from her childhood dream, through injury and recovery, to national selection and Olympic success.",
        explanation: EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "before-after") {
      const entry = randChoice(rng, BEFORE_AFTER_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, NOTES.map((n, i) => ({ id: `n${i}`, label: n.event })));
      const targets = shuffle(rng, NOTES.map((n, i) => ({ id: `n${i}`, label: n.note })));
      const correctMap: Record<string, string> = {};
      NOTES.forEach((_, i) => (correctMap[`n${i}`] = `n${i}`));
      return {
        kind: "click-match",
        prompt: "Match each event to its correct short note.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "A short note captures the main idea of an event in just a few words.",
        explanation: NOTES.map((n) => `"${n.event}" — noted as "${n.note}."`).join(" "),
      };
    }

    if (branch === "appreciate") {
      const entry = randChoice(rng, APPRECIATE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what a reader gains, both in facts and in feeling, from a story like this.",
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word from the story.",
      passage: STORY,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Look for the exact word in the passage above.",
      explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
    };
  },
};
