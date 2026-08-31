import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Every December, Naisiae's grandmother spread out her beadwork tools on a goatskin mat and taught the girls of the homestead how to thread necklaces in the old Maasai patterns. Naisiae struggled at first, pricking her fingers on the sharp needle, but she kept practising because she loved the bright reds and blues her grandmother chose. By the time she was twelve, Naisiae could bead a full ceremonial collar on her own, and she began teaching the pattern to her younger cousins, determined that the skill would not be lost as more girls moved to the city for school. Her grandmother often said that every bead told a story about the wearer's family and stage of life.";

const MAIN_IDEA_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is the main idea of this excerpt?",
    correct: "Naisiae learns and passes on traditional beadwork to preserve her family's cultural heritage",
    distractors: [
      "Naisiae pricked her fingers badly while learning to bead",
      "Beads are always made from goatskin material",
      "Naisiae's grandmother dislikes the colour red",
    ],
    explanation: "The excerpt centres on Naisiae learning beadwork from her grandmother and then teaching it to her cousins so the skill is not lost — this preservation of heritage is the main idea, not the small details along the way.",
  },
];

const DETAIL_CATEGORY: { text: string; category: "main" | "detail" }[] = [
  { text: "Naisiae learns to preserve traditional beadwork and pass it to the next generation", category: "main" },
  { text: "She pricked her fingers on the needle at first", category: "detail" },
  { text: "She loved the bright reds and blues her grandmother chose", category: "detail" },
  { text: "Every bead tells a story about the wearer's family and stage of life", category: "detail" },
];

const LESSON_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What lesson can be drawn from this excerpt?",
    correct: "Cultural traditions can be kept alive when older and younger generations make an effort to pass on skills",
    distractors: [
      "Traditional skills are no longer worth learning today",
      "Only grandmothers are allowed to practise beadwork",
      "Practising a new skill should be abandoned after the first mistake",
    ],
    explanation: "Naisiae's persistence in learning, and her decision to teach her younger cousins, show how deliberate effort across generations keeps a tradition alive.",
  },
];

const LESSON_MATCH: { lesson: string; realLife: string }[] = [
  { lesson: "Cultural skills survive when they are actively taught to the next generation", realLife: "A grandfather teaching his grandson how to carve traditional stools" },
  { lesson: "Determination helps us master a new skill despite early difficulty", realLife: "Practising a difficult maths topic daily until it becomes easy" },
];

const APPRECIATE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why does reading excerpts like this one about traditional fashion matter, beyond entertainment?",
    correct: "It builds critical thinking about how culture and skills are preserved and passed down across generations",
    distractors: [
      "It teaches readers that traditional practices should always be abandoned",
      "It has no connection to real life outside the story",
      "It is useful only for memorising bead colours",
    ],
    explanation: "Literature about cultural preservation, like Naisiae's story, encourages readers to think critically about how and why traditions are kept alive.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Naisiae struggled at first, pricking her fingers on the sharp", after: ", but she kept practising.", correctAnswer: "needle" },
  { before: "By the time she was twelve, Naisiae could bead a full ceremonial", after: " on her own.", correctAnswer: "collar" },
  { before: "Her grandmother often said that every bead told a story about the wearer's family and stage of", after: ".", correctAnswer: "life" },
];

export const classReaderMainIdeas: Skill = {
  id: "g7-eng-r-class-reader-main-ideas",
  code: "R.27",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Class Reader: Main Ideas",
  description: "Identify main ideas in a class reader excerpt, distinguish them from supporting details, discuss lessons, and appreciate the role of literature in fostering critical thinking.",
  generate(rng) {
    const branch = randChoice(rng, ["main-idea", "categorize", "lesson", "match", "appreciate", "fill"] as const);
    const hint = "The main idea is the single overall point the excerpt is building toward; other sentences only support or illustrate it.";

    if (branch === "main-idea") {
      const entry = randChoice(rng, MAIN_IDEA_MC);
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

    if (branch === "categorize") {
      const chosen = shuffle(rng, DETAIL_CATEGORY);
      const items = chosen.map((c, i) => ({ id: `d${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`d${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each statement as either the Main Idea or a Supporting Detail.",
        passage: STORY,
        items,
        buckets: [
          { id: "main", label: "Main Idea" },
          { id: "detail", label: "Supporting Detail" },
        ],
        correctBucket,
        hint: "Only one statement captures what the whole excerpt is really about; the rest add colour or evidence.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.category === "main" ? "the main idea" : "a supporting detail"}.`).join(" "),
      };
    }

    if (branch === "lesson") {
      const entry = randChoice(rng, LESSON_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what made it possible for the tradition to survive in the story.",
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, LESSON_MATCH.map((m, i) => ({ id: `l${i}`, label: m.lesson })));
      const targets = shuffle(rng, LESSON_MATCH.map((m, i) => ({ id: `l${i}`, label: m.realLife })));
      const correctMap: Record<string, string> = {};
      LESSON_MATCH.forEach((_, i) => (correctMap[`l${i}`] = `l${i}`));
      return {
        kind: "click-match",
        prompt: "Match each lesson from the excerpt to its real-life application.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Think about how each lesson from Naisiae's story could apply outside beadwork.",
        explanation: LESSON_MATCH.map((m) => `"${m.lesson}" — like ${m.realLife.toLowerCase()}.`).join(" "),
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
        hint,
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word from the passage.",
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
