import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const GOSPEL_ORDER_PROMPTS = [
  "Arrange these Gospels in their order in the New Testament.",
  "Put the four Gospels into their correct order.",
  "Sequence the Gospels the way they appear in the New Testament.",
  "Arrange these New Testament Gospels in order.",
  "Order the four Gospels from first to last.",
];

const PENTATEUCH_ORDER_PROMPTS = [
  "Arrange these books of the Law (Pentateuch) in their order in the Old Testament.",
  "Put the books of the Pentateuch into their correct order.",
  "Sequence the five books of the Law the way they appear in the Old Testament.",
  "Arrange these Old Testament Law books in order.",
  "Order the books of the Pentateuch from first to last.",
];

const TESTAMENT_PROMPTS = [
  "Sort each book as belonging to the Old Testament or the New Testament.",
  "Decide whether each book belongs to the Old or New Testament, and sort it there.",
  "Group these books under the Old Testament or the New Testament.",
  "Sort each book below into the correct testament.",
  "Place each book into the bucket for its testament.",
  "Read each book and sort it under the Old or New Testament.",
];

const CATEGORY_MATCH_PROMPTS = [
  "Match each category of Bible books to its description.",
  "Pair each category below with the description that fits it.",
  "Connect each category of Bible books to what it means.",
  "Match each category to the statement that describes it.",
  "Link each category of Bible books to its correct description.",
  "Match each category to the explanation that fits it.",
];

const WHICH_CATEGORY_PROMPTS = [
  (book: string) => `Which category of Bible books does ${book} belong to?`,
  (book: string) => `${book} belongs to which category of Bible books?`,
  (book: string) => `Identify the category of Bible books that ${book} falls under.`,
  (book: string) => `What category does the book of ${book} belong to?`,
  (book: string) => `Classify ${book} into its correct category of Bible books.`,
  (book: string) => `Which category best fits ${book}?`,
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about the Bible's divisions with the right word.",
];

const PENTATEUCH_ORDER = [
  { id: "genesis", label: "Genesis" },
  { id: "exodus", label: "Exodus" },
  { id: "leviticus", label: "Leviticus" },
  { id: "numbers", label: "Numbers" },
  { id: "deuteronomy", label: "Deuteronomy" },
];

const GOSPEL_ORDER = [
  { id: "matthew", label: "Matthew" },
  { id: "mark", label: "Mark" },
  { id: "luke", label: "Luke" },
  { id: "john", label: "John" },
];

type Category = "law" | "history-ot" | "poetry" | "prophets" | "gospels" | "history-nt" | "epistles" | "prophecy";

const BOOKS: { book: string; testament: "old" | "new"; category: Category }[] = [
  { book: "Genesis", testament: "old", category: "law" },
  { book: "Exodus", testament: "old", category: "law" },
  { book: "Leviticus", testament: "old", category: "law" },
  { book: "Numbers", testament: "old", category: "law" },
  { book: "Deuteronomy", testament: "old", category: "law" },
  { book: "Joshua", testament: "old", category: "history-ot" },
  { book: "Judges", testament: "old", category: "history-ot" },
  { book: "Ruth", testament: "old", category: "history-ot" },
  { book: "1 Samuel", testament: "old", category: "history-ot" },
  { book: "1 Kings", testament: "old", category: "history-ot" },
  { book: "Ezra", testament: "old", category: "history-ot" },
  { book: "Esther", testament: "old", category: "history-ot" },
  { book: "Job", testament: "old", category: "poetry" },
  { book: "Psalms", testament: "old", category: "poetry" },
  { book: "Proverbs", testament: "old", category: "poetry" },
  { book: "Ecclesiastes", testament: "old", category: "poetry" },
  { book: "Song of Songs", testament: "old", category: "poetry" },
  { book: "Isaiah", testament: "old", category: "prophets" },
  { book: "Jeremiah", testament: "old", category: "prophets" },
  { book: "Ezekiel", testament: "old", category: "prophets" },
  { book: "Daniel", testament: "old", category: "prophets" },
  { book: "Amos", testament: "old", category: "prophets" },
  { book: "Jonah", testament: "old", category: "prophets" },
  { book: "Malachi", testament: "old", category: "prophets" },
  { book: "Matthew", testament: "new", category: "gospels" },
  { book: "Mark", testament: "new", category: "gospels" },
  { book: "Luke", testament: "new", category: "gospels" },
  { book: "John", testament: "new", category: "gospels" },
  { book: "Acts", testament: "new", category: "history-nt" },
  { book: "Romans", testament: "new", category: "epistles" },
  { book: "1 Corinthians", testament: "new", category: "epistles" },
  { book: "Galatians", testament: "new", category: "epistles" },
  { book: "Ephesians", testament: "new", category: "epistles" },
  { book: "Philippians", testament: "new", category: "epistles" },
  { book: "Hebrews", testament: "new", category: "epistles" },
  { book: "James", testament: "new", category: "epistles" },
  { book: "1 Peter", testament: "new", category: "epistles" },
  { book: "Revelation", testament: "new", category: "prophecy" },
];

const CATEGORY_LABEL: Record<Category, string> = {
  law: "Law (Pentateuch)",
  "history-ot": "Old Testament History",
  poetry: "Poetry and Wisdom",
  prophets: "Prophets",
  gospels: "Gospels",
  "history-nt": "New Testament History",
  epistles: "Epistles (Letters)",
  prophecy: "Prophecy",
};

const CATEGORY_MEANING: Record<Category, string> = {
  law: "The first five books of the Old Testament, also called the Pentateuch, given through Moses",
  "history-ot": "Old Testament books that record Israel's history, such as Joshua and Judges",
  poetry: "Old Testament books of poetry and wisdom, such as Psalms and Proverbs",
  prophets: "Old Testament books of the prophets, such as Isaiah and Jeremiah",
  gospels: "The four New Testament books recording the life and ministry of Jesus Christ",
  "history-nt": "The New Testament book recording the history of the early Church, the book of Acts",
  epistles: "New Testament letters written to churches and individuals, such as Romans",
  prophecy: "The New Testament book of prophecy, Revelation",
};

export const divisionsOfTheBible: Skill = {
  id: "g7-cre-bi-divisions-of-the-bible",
  code: "BI.2",
  subjectId: "cre",
  strandId: "g7-cre-bible",
  grade: 7,
  title: "Divisions of the Bible",
  description: "The two major divisions of the Bible — the Old and New Testaments — and the categories of books within each.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "testament", "category-match", "category-reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const useGospels = rng() < 0.5;
      const source = useGospels ? GOSPEL_ORDER : PENTATEUCH_ORDER;
      const items = shuffle(rng, source);
      return {
        kind: "ordering",
        prompt: useGospels
          ? randChoice(rng, GOSPEL_ORDER_PROMPTS)
          : randChoice(rng, PENTATEUCH_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: source.map((s) => s.id),
        hint: useGospels ? "Matthew comes first, John comes last." : "Genesis comes first, Deuteronomy comes last.",
        explanation: source.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "testament") {
      const chosen = shuffle(rng, BOOKS).slice(0, 8);
      const items = chosen.map((b) => ({ id: b.book, label: b.book }));
      const correctBucket: Record<string, string> = {};
      for (const b of chosen) correctBucket[b.book] = b.testament;
      return {
        kind: "categorize",
        prompt: randChoice(rng, TESTAMENT_PROMPTS),
        items,
        buckets: [
          { id: "old", label: "Old Testament" },
          { id: "new", label: "New Testament" },
        ],
        correctBucket,
        hint: "The Old Testament comes before the birth of Jesus Christ; the New Testament covers His life and the early Church.",
        explanation: chosen.map((b) => `${b.book} — ${b.testament === "old" ? "Old Testament" : "New Testament"}.`).join(" "),
      };
    }

    if (branch === "category-match") {
      const cats = shuffle(rng, Object.keys(CATEGORY_LABEL) as Category[]).slice(0, 5);
      const tokens = shuffle(rng, cats.map((c) => ({ id: c, label: CATEGORY_LABEL[c] })));
      const targets = shuffle(rng, cats.map((c) => ({ id: c, label: CATEGORY_MEANING[c] })));
      const correctMap: Record<string, string> = {};
      for (const c of cats) correctMap[c] = c;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CATEGORY_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The Old Testament has four categories (Law, History, Poetry, Prophets); the New Testament has four too (Gospels, History, Epistles, Prophecy).",
        explanation: cats.map((c) => `${CATEGORY_LABEL[c]} — ${CATEGORY_MEANING[c].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "category-reasoning") {
      const target = randChoice(rng, BOOKS);
      const sameTestament = BOOKS.filter((b) => b.testament === target.testament && b.category !== target.category);
      const distractorCats = Array.from(new Set(shuffle(rng, sameTestament).map((b) => CATEGORY_LABEL[b.category]))).slice(0, 3);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, CATEGORY_LABEL[target.category], distractorCats, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_CATEGORY_PROMPTS)(target.book),
        choices,
        correctIndex,
        layout: "list",
        hint: `${target.book} is in the ${target.testament === "old" ? "Old" : "New"} Testament.`,
        explanation: `${target.book} belongs to the ${CATEGORY_LABEL[target.category]} category — ${CATEGORY_MEANING[target.category].toLowerCase()}.`,
      };
    }

    const facts = [
      { before: "The two major divisions of the Bible are the Old Testament and the", after: "Testament.", answer: "New", accepted: ["new"] },
      { before: "The first five books of the Old Testament, given through Moses, are together called the", after: ".", answer: "Pentateuch", accepted: ["pentateuch", "law"] },
      { before: "The four Gospels record the life and ministry of", after: "Christ.", answer: "Jesus", accepted: ["jesus"] },
      { before: "The New Testament book that records the history of the early Church is called", after: ".", answer: "Acts", accepted: ["acts"] },
      { before: "New Testament letters written to churches and individuals are called", after: ".", answer: "Epistles", accepted: ["epistles", "letters"] },
      { before: "The only book of prophecy in the New Testament is called", after: ".", answer: "Revelation", accepted: ["revelation"] },
      { before: "The Old Testament category that includes Psalms and Proverbs is called Poetry and", after: ".", answer: "Wisdom", accepted: ["wisdom"] },
      { before: "The first book of the Bible is called", after: ".", answer: "Genesis", accepted: ["genesis"] },
      { before: "The last book of the Old Testament Law (Pentateuch) is called", after: ".", answer: "Deuteronomy", accepted: ["deuteronomy"] },
      { before: "The Old Testament category made up of books such as Isaiah and Jeremiah is called the", after: ".", answer: "Prophets", accepted: ["prophets"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the two divisions of the Bible and the categories of books within each.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
