import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const BOOK_TITLE = "The Clinic Under the Baobab";

const COVER_DESC =
  "The cover of \"The Clinic Under the Baobab\" shows a girl in a school uniform standing beside a nurse outside a small clinic, with a tall baobab tree towering above them.";

const BLURB =
  "When a mysterious fever sweeps through Kaptagat village, twelve-year-old Chebet must help her mother, the local nurse, discover its cause before the rains cut off the only road to the hospital. Set in the highlands of Kenya in the 1990s, this story follows one family's fight to bring clean water and health education to their community.";

const AUTHOR_BIO =
  "Written by Dr. Naliaka Wekesa, a retired community health worker from Bungoma who has spent thirty years writing stories that teach children about hygiene and disease prevention.";

const PREVIEW_ELEMENTS: { id: string; label: string; tells: string }[] = [
  { id: "cover", label: "The cover picture", tells: "Gives a first visual hint about the characters, setting, or mood of the story" },
  { id: "blurb", label: "The blurb on the back cover", tells: "Summarises the main conflict of the story without revealing how it ends" },
  { id: "title", label: `The title, "${BOOK_TITLE}"`, tells: "Hints at the subject and setting the story will focus on" },
  { id: "author-bio", label: "The author's biography", tells: "Tells us who wrote the book and what qualifies them to write about this subject" },
];

const COVER_ONLY_ITEMS: { text: string; category: "cover" | "further" }[] = [
  { text: "A girl in a school uniform appears on the cover", category: "cover" },
  { text: "A nurse stands beside her near a clinic on the cover", category: "cover" },
  { text: "Chebet must find the cause of the fever before the rains cut the road", category: "further" },
  { text: "The book was written by a retired community health worker from Bungoma", category: "further" },
  { text: "The story explores bringing clean water and health education to the village", category: "further" },
];

const SETTING_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: `Based on the blurb, when and where is "${BOOK_TITLE}" set?`,
    correct: "In Kaptagat village in Kenya's highlands, during the 1990s",
    distractors: [
      "In a coastal city in Kenya, during the present day",
      "In a hospital in Nairobi, during the 1960s",
      "In a village outside Kenya, during the 2020s",
    ],
  },
];

const DISTINGUISH_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: `Which of these can you learn just by looking at the front cover of "${BOOK_TITLE}", without reading further?`,
    correct: "A girl in school uniform stands beside a nurse near a clinic",
    distractors: [
      "Why the rains threaten to cut off the road",
      "How Chebet's mother finally identifies the fever",
      "The full names of every character in the book",
    ],
  },
  {
    q: "What does the author's biography usually tell a reader?",
    correct: "Background about who wrote the book and their experience with its subject",
    distractors: [
      "The exact ending of the story",
      "The names of every character in the book",
      "The price of the book in shops",
    ],
  },
];

const LIFELONG_FILLS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  {
    before: "Previewing a book's cover, blurb, and title before reading helps us choose books that inform and interest us, building a habit of",
    after: "that benefits us throughout life.",
    correctAnswer: "lifelong learning",
    acceptedAnswers: ["lifelong learning", "reading for lifelong learning"],
  },
  {
    before: "Checking the author's background before reading helps us judge whether the book is a reliable source of",
    after: "on its subject.",
    correctAnswer: "information",
    acceptedAnswers: ["information", "knowledge"],
  },
];

export const classReaderPreviewing: Skill = {
  id: "g7-eng-r-class-reader-previewing",
  code: "R.17",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Class Reader — Previewing a Text",
  description: "Explain the parts of a book that aid previewing, describe the author and setting, and appreciate reading for lifelong learning.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "setting", "distinguish", "categorize", "fill"] as const);
    const hint = "Previewing means looking at the cover, title, blurb, and author bio before you start reading the story itself.";

    if (branch === "match") {
      const tokens = shuffle(rng, PREVIEW_ELEMENTS.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PREVIEW_ELEMENTS.map((p) => ({ id: p.id, label: p.tells })));
      const correctMap: Record<string, string> = {};
      for (const p of PREVIEW_ELEMENTS) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: `Match each part of "${BOOK_TITLE}" to what it tells a reader before they start the story.`,
        passage: `${COVER_DESC} ${BLURB} ${AUTHOR_BIO}`,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PREVIEW_ELEMENTS.map((p) => `${p.label} — ${p.tells.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "setting") {
      const entry = randChoice(rng, SETTING_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: BLURB,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Look for words in the blurb that name a place and a time period.",
        explanation: `The blurb states the story is "set in the highlands of Kenya in the 1990s," in Kaptagat village.`,
      };
    }

    if (branch === "distinguish") {
      const entry = randChoice(rng, DISTINGUISH_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: `${COVER_DESC} ${AUTHOR_BIO}`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "A cover shows an image; a blurb and author bio give extra facts a picture alone cannot show.",
        explanation: `The correct answer is "${entry.correct}" — this is either what the cover picture directly shows, or what an author bio is meant to describe.`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, COVER_ONLY_ITEMS);
      const items = chosen.map((c, i) => ({ id: `i${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`i${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each statement by whether it can be learned from the cover alone, or only from the blurb, author bio, or reading further.",
        passage: `${COVER_DESC} ${BLURB} ${AUTHOR_BIO}`,
        items,
        buckets: [
          { id: "cover", label: "Visible on the cover alone" },
          { id: "further", label: "Learned only from the blurb, author bio, or reading further" },
        ],
        correctBucket,
        hint: "A cover shows a scene; the plot's conflict and the author's background are described in words elsewhere.",
        explanation: chosen
          .map((c) => `"${c.text}" is ${c.category === "cover" ? "visible on the cover alone" : "learned only from the blurb, author bio, or reading further"}.`)
          .join(" "),
      };
    }

    const entry = randChoice(rng, LIFELONG_FILLS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word(s) to complete this statement about the value of previewing books.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint: "Think about why choosing good books to read matters for our whole lives, not just for school.",
      explanation: `Previewing helps us choose books wisely, supporting: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
    };
  },
};
