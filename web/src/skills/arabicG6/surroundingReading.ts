import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SCHOOL_VOCAB, name, place } from "./shared";

// Sub-strand 2.3 Reading Aloud: Fluency — Theme: My Surrounding.
// Content: identifying school property, reading simple sentences aloud at appropriate speed,
// reading words with nunation (tanween) fluently.

const PASSAGE_SKELETONS: ((n: string, p: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (n, p) => ({
    lines: [
      `Madrasat ${n} kabeera. (${n}'s school is big.)`,
      `Fiha fasl, wa maktaba, wa mal'ab. (It has a classroom, a library, and a playground.)`,
      `${n} yaqra'u fi al-maktaba kulla yawm. (${n} reads in the library every day.)`,
      `Al-mal'ab kabeer wa nazeef. (The playground is big and clean.)`,
    ],
    qa: [
      { q: `What three facilities does ${n}'s school have, according to the passage?`, correct: "a classroom, a library, and a playground", distractors: ["a dining hall, a gate, and a garden", "an office and a washroom only", "the passage does not say"], explanation: "'Fiha fasl, wa maktaba, wa mal'ab' lists a classroom, library, and playground." },
      { q: `Where does ${n} read every day?`, correct: "the library", distractors: ["the classroom", "the playground", "the office"], explanation: `"${n} yaqra'u fi al-maktaba kulla yawm" means "${n} reads in the library every day".` },
      { q: "How is the playground described?", correct: "big and clean", distractors: ["small and dirty", "closed today", "under repair"], explanation: "'Al-mal'ab kabeer wa nazeef' means 'the playground is big and clean'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Fi madrasat ${p}, al-maktab maftuh al-yawm. (At the school in ${p}, the office is open today.)`,
      `${n} yadhhabu ila al-maktab li yatakallama ma'a al-mu'allim. (${n} goes to the office to speak with the teacher.)`,
      `Al-hammam qareeb min al-fasl. (The washroom is near the classroom.)`,
      `Al-mamarr tawil wa nadheef. (The corridor is long and clean.)`,
    ],
    qa: [
      { q: "Is the office open or closed today, according to the passage?", correct: "open", distractors: ["closed", "under repair", "the passage does not say"], explanation: "'al-maktab maftuh al-yawm' means 'the office is open today'." },
      { q: `Why does ${n} go to the office, based on the passage?`, correct: "to speak with the teacher", distractors: ["to borrow a book", "to play", "to eat lunch"], explanation: `"${n} yadhhabu ila al-maktab li yatakallama ma'a al-mu'allim" means "${n} goes to the office to speak with the teacher".` },
      { q: "Where is the washroom located, according to the passage?", correct: "near the classroom", distractors: ["far from the classroom", "next to the gate", "the passage does not say"], explanation: "'Al-hammam qareeb min al-fasl' means 'the washroom is near the classroom'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yastami'u qissa 'an madrasa fi ${p}. (${n} listens to a story about a school in ${p}.)`,
      `Al-hadiqa fiha ashjaar jameela. (The garden has beautiful trees.)`,
      `Al-bawwaba maftuha fi al-sabah. (The gate is open in the morning.)`,
      `Al-talamidh yal'abuna fi al-mal'ab ba'd al-dars. (The students play in the playground after class.)`,
    ],
    qa: [
      { q: "What does the garden have, according to the passage?", correct: "beautiful trees", distractors: ["a swimming pool", "a library", "nothing special"], explanation: "'Al-hadiqa fiha ashjaar jameela' means 'the garden has beautiful trees'." },
      { q: "When is the gate open, according to the passage?", correct: "in the morning", distractors: ["at night", "never", "only on weekends"], explanation: "'Al-bawwaba maftuha fi al-sabah' means 'the gate is open in the morning'." },
      { q: "When do the students play in the playground?", correct: "after class", distractors: ["before class", "during class", "the passage does not say"], explanation: "'ba'd al-dars' means 'after class'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yaqra'u bisur'a fi al-fasl. (${n} reads quickly in the classroom.)`,
      `Al-mu'allima taqra'u bibutu' li tuwaddih al-ma'na. (The teacher reads slowly to clarify the meaning.)`,
      `Sur'a al-qiraa'a al-jayyida laysat sarie'a jiddan wa laysat bati'a jiddan. (Good reading speed is neither too fast nor too slow.)`,
      `${n} yatadarrabu kulla yawm fi al-maktaba. (${n} practises every day in the library.)`,
    ],
    qa: [
      { q: `How does ${n} read in the classroom, according to the passage?`, correct: "quickly", distractors: ["slowly", "not at all", "the passage does not say"], explanation: `"${n} yaqra'u bisur'a" means "${n} reads quickly".` },
      { q: "Why does the teacher read slowly, based on the passage?", correct: "to clarify the meaning", distractors: ["because she is tired", "because the text is short", "to finish faster"], explanation: "'taqra'u bibutu' li tuwaddih al-ma'na' means 'reads slowly to clarify the meaning'." },
      { q: "What does the passage say about good reading speed?", correct: "neither too fast nor too slow", distractors: ["always as fast as possible", "always very slow", "the passage does not say"], explanation: "'laysat sarie'a jiddan wa laysat bati'a jiddan' means 'neither too fast nor too slow'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Madrasatun kabeeratun fi ${p}. (A big school [with tanween] is in ${p}.)`,
      `Fasl-un nadheef-un wa maktab-un murattab-un. (A clean classroom and a tidy office [with tanween].)`,
      `${n} yaqra'u kalimaatin bitanween bisur'a. (${n} reads tanween words quickly.)`,
      `Al-tanween yudeefu sawtan 'an-noon' fi nihayat al-kalima. (Tanween adds an 'n' sound at the end of the word.)`,
    ],
    qa: [
      { q: "What does tanween add to the end of a word, according to the passage?", correct: "an 'n' sound", distractors: ["a long vowel", "a doubled consonant", "nothing"], explanation: "'Al-tanween yudeefu sawtan 'an-noon' fi nihayat al-kalima' means 'tanween adds an n sound at the end of the word'." },
      { q: `What does ${n} read quickly, according to the passage?`, correct: "tanween words", distractors: ["long stories", "the teacher's notes", "the passage does not say"], explanation: `"${n} yaqra'u kalimaatin bitanween bisur'a" means "${n} reads tanween words quickly".` },
      { q: "According to the passage, which two things in the school are described using tanween endings?", correct: "a classroom and an office", distractors: ["a playground and a garden", "a library and a gate", "a washroom and a corridor"], explanation: "'Fasl-un nadheef-un wa maktab-un murattab-un' describes a classroom and an office with tanween endings." },
    ],
  }),
];

const MATCH_POOL = SCHOOL_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a school reading text, 'library' is written as ", after: ".", correct: "maktaba" },
  { before: "'Classroom' appears in reading texts as ", after: ".", correct: "fasl" },
  { before: "'Playground' appears in reading texts as ", after: ".", correct: "mal'ab" },
  { before: "'Office' appears in reading texts as ", after: ".", correct: "maktab" },
  { before: "'Gate' appears in reading texts as ", after: ".", correct: "bawwaba" },
  { before: "'Garden' appears in reading texts as ", after: ".", correct: "hadiqa" },
  { before: "'Corridor' appears in reading texts as ", after: ".", correct: "mamarr" },
  { before: "'Washroom' appears in reading texts as ", after: ".", correct: "hammam" },
  { before: "'Dining hall' appears in reading texts as ", after: ".", correct: "mat'am" },
  { before: "'Blackboard' appears in reading texts as ", after: ".", correct: "sabbura" },
];

export const surroundingReading: Skill = {
  id: "g6-ar-r-surrounding",
  code: "R.3",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Reading aloud: fluency (my surrounding)",
  description: "Read short passages about school facilities fluently and at an appropriate speed, and recognise school-property vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const n = name(rng);
    const p = place(rng);
    const skeleton = randChoice(rng, PASSAGE_SKELETONS)(n, p);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p2) => ({ id: p2.word, label: p2.word })));
      const targets = shuffle(rng, chosen.map((p2) => ({ id: p2.word, label: p2.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p2 of chosen) correctMap[p2.word] = p2.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Match each school-facility word to its meaning.",
          "Match the word from the passage's theme to its meaning.",
          "Which meaning goes with which facility word?",
          "Pair each school word with its correct meaning.",
          "Match each word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above for context clues.",
        explanation: chosen.map((p2) => `"${p2.word}" means "${p2.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence with the correct word.",
          "What word completes this reading fact?",
          "Fill the gap correctly.",
          "Complete this vocabulary fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the school-facility words used in the passage above.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Put these lines from the passage in the order they were written.",
          "Arrange the passage's lines in the correct reading order.",
          "Sequence this passage correctly.",
          "Order the lines as they appear in the passage.",
          "Which order makes this passage make sense?",
        ]),
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Read the passage above carefully to recall its order.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const CATEGORY_LOCATION: { word: string; where: "Indoor" | "Outdoor" }[] = [
        { word: "fasl", where: "Indoor" }, { word: "maktab", where: "Indoor" }, { word: "maktaba", where: "Indoor" },
        { word: "mat'am", where: "Indoor" }, { word: "hammam", where: "Indoor" }, { word: "mamarr", where: "Indoor" },
        { word: "ghurfat al-mu'allimeen", where: "Indoor" }, { word: "mal'ab", where: "Outdoor" },
        { word: "hadiqa", where: "Outdoor" }, { word: "bawwaba", where: "Outdoor" },
      ];
      const chosen = shuffle(rng, CATEGORY_LOCATION).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.where));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "As you read, sort each facility: Indoor, or Outdoor?",
          "Group these facilities by indoor vs outdoor.",
          "Which location type does each facility belong to?",
          "Sort each facility word into the correct category.",
          "Classify each facility from the reading text.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Indoor", label: "Indoor facility" },
          { id: "Outdoor", label: "Outdoor facility" },
        ],
        correctBucket,
        hint: "Classrooms, offices, and the library are indoor; playgrounds and gardens are outdoor.",
        explanation: chosen.map((c) => `"${c.word}" is ${c.where === "Indoor" ? "an indoor" : "an outdoor"} facility.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, [qa.correct, ...qa.distractors]);
    return {
      kind: "multiple-choice",
      passage,
      prompt: qa.q,
      choices,
      correctIndex: choices.indexOf(qa.correct),
      layout: "list",
      hint: "Reread the passage above carefully before answering.",
      explanation: qa.explanation,
    };
  },
};
