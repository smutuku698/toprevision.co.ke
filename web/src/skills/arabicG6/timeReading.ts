import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { MONTHS, name, place } from "./shared";

// Sub-strand 2.4 Reading for Information — Theme: Time.
// Content: identifying vocabulary related to months of the year from a written text, answering
// direct and inferential questions from a text for comprehension.

const PASSAGE_SKELETONS: ((n: string, p: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (n, p) => ({
    lines: [
      `Madrasat ${n} fi ${p} tabda'u al-fasl al-awwal fi Yanayir. (${n}'s school in ${p} starts Term 1 in January.)`,
      `Al-fasl al-thani yabda'u fi Mayu. (Term 2 starts in May.)`,
      `Al-fasl al-thalith yabda'u fi Sibtambir. (Term 3 starts in September.)`,
      `Al-'utla al-kubra takunu fi Disambir. (The big holiday is in December.)`,
    ],
    qa: [
      { q: "When does Term 1 start, according to the passage?", correct: "January (Yanayir)", distractors: ["May (Mayu)", "September (Sibtambir)", "December (Disambir)"], explanation: "'tabda'u al-fasl al-awwal fi Yanayir' means 'Term 1 starts in January'." },
      { q: "Reading between the lines, in which month is the school year likely to end?", correct: "December (Disambir)", distractors: ["January (Yanayir)", "May (Mayu)", "September (Sibtambir)"], explanation: "Since the big holiday ('al-'utla al-kubra') is in December, the school year likely ends that month — an inferential answer." },
      { q: "When does Term 3 start, according to the passage?", correct: "September (Sibtambir)", distractors: ["January (Yanayir)", "May (Mayu)", "December (Disambir)"], explanation: "'Al-fasl al-thalith yabda'u fi Sibtambir' means 'Term 3 starts in September'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yuhibbu shahr Disambir fi ${p} li'anna fihi al-'utla. (${n} loves December in ${p} because it has the holiday.)`,
      `Fi Abril, tabda'u al-amtar. (In April, the rains begin.)`,
      `Fi Aghustus, al-jaww haar. (In August, the weather is hot.)`,
      `${n} yatadhakkaru kulla shahr bi nashat mukhtalif. (${n} remembers every month by a different activity.)`,
    ],
    qa: [
      { q: `Why does ${n} love December, according to the passage?`, correct: "because it has the holiday", distractors: ["because it is hot", "because school starts", "the passage does not say"], explanation: "'li'anna fihi al-'utla' means 'because it has the holiday'." },
      { q: "When do the rains begin, according to the passage?", correct: "April (Abril)", distractors: ["August (Aghustus)", "December (Disambir)", "January (Yanayir)"], explanation: "'Fi Abril, tabda'u al-amtar' means 'in April, the rains begin'." },
      { q: "Based on the passage, which month is described as hot?", correct: "August (Aghustus)", distractors: ["April (Abril)", "December (Disambir)", "the passage does not say"], explanation: "'Fi Aghustus, al-jaww haar' means 'in August, the weather is hot'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yaqra'u nassan 'an al-ashhur fi ${p}. (${n} reads a text about the months in ${p}.)`,
      `Yanayir huwa awwal shahr fi al-sana. (January is the first month of the year.)`,
      `Disambir huwa aakhir shahr fi al-sana. (December is the last month of the year.)`,
      `Bayna Yanayir wa Disambir, tujadu 'ashra ashhur ukhra. (Between January and December, there are ten other months.)`,
    ],
    qa: [
      { q: "Which month is described as the first month of the year?", correct: "January (Yanayir)", distractors: ["December (Disambir)", "May (Mayu)", "September (Sibtambir)"], explanation: "'Yanayir huwa awwal shahr fi al-sana' means 'January is the first month of the year'." },
      { q: "How many months in total does a year have, based on the passage's inference?", correct: "twelve", distractors: ["ten", "eleven", "the passage does not say"], explanation: "Ten months between January and December, plus January and December themselves, makes twelve — an inferential total." },
      { q: "Which month is described as the last month of the year?", correct: "December (Disambir)", distractors: ["January (Yanayir)", "August (Aghustus)", "April (Abril)"], explanation: "'Disambir huwa aakhir shahr fi al-sana' means 'December is the last month of the year'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Eid milad ${n} fi shahr Yulyu. (${n}'s birthday is in July.)`,
      `Eid milad sadiqihi fi shahr Febrayir. (His friend's birthday is in February.)`,
      `Kilahuma yahtafilaan fi ${p}. (They both celebrate in ${p}.)`,
      `${n} yaktubu ta'reekh al-a'yaad fi daftarihi. (${n} writes down the birthday dates in his notebook.)`,
    ],
    qa: [
      { q: `In which month is ${n}'s birthday, according to the passage?`, correct: "July (Yulyu)", distractors: ["February (Febrayir)", "January (Yanayir)", "the passage does not say"], explanation: `"Eid milad ${n} fi shahr Yulyu" means "${n}'s birthday is in July".` },
      { q: "Whose birthday is in February, according to the passage?", correct: `${n}'s friend`, distractors: [n, "the teacher", "the passage does not say"], explanation: "'Eid milad sadiqihi fi shahr Febrayir' means 'his friend's birthday is in February'." },
      { q: `What does ${n} do with the birthday dates, based on the passage?`, correct: "writes them down in a notebook", distractors: ["forgets them", "tells the teacher only", "the passage does not say"], explanation: `"${n} yaktubu ta'reekh al-a'yaad fi daftarihi" means "${n} writes down the birthday dates in his notebook".` },
    ],
  }),
  (n, p) => ({
    lines: [
      `Fi ${p}, mahrajaan al-madrasa yuqaamu fi Uktoubar. (In ${p}, the school festival is held in October.)`,
      `Al-talamidh yatadarrabuna li shahrayn qabla al-mahrajaan. (The students practise for two months before the festival.)`,
      `${n} yushaariku fi al-ghinaa'. (${n} takes part in the singing.)`,
      `Ba'd al-mahrajaan, tabda'u al-imtihanaat fi Nufambir. (After the festival, exams begin in November.)`,
    ],
    qa: [
      { q: "When is the school festival held, according to the passage?", correct: "October (Uktoubar)", distractors: ["November (Nufambir)", "September (Sibtambir)", "December (Disambir)"], explanation: "'yuqaamu fi Uktoubar' means 'held in October'." },
      { q: "Based on the passage, in which month would practice for the festival most likely begin?", correct: "August (Aghustus)", distractors: ["January (Yanayir)", "October (Uktoubar)", "December (Disambir)"], explanation: "Since students practise for two months before an October festival, practice begins around August — an inferential answer." },
      { q: "When do exams begin, according to the passage?", correct: "November (Nufambir)", distractors: ["October (Uktoubar)", "December (Disambir)", "the passage does not say"], explanation: "'tabda'u al-imtihanaat fi Nufambir' means 'exams begin in November'." },
    ],
  }),
];

export const timeReading: Skill = {
  id: "g6-ar-r-time",
  code: "R.4",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Reading for information: time",
  description: "Read short passages about months and school-year events, and answer direct and inferential comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const n = name(rng);
    const p = place(rng);
    const skeleton = randChoice(rng, PASSAGE_SKELETONS)(n, p);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, MONTHS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.word, label: m.word })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.word, label: m.meaning })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.word] = m.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Drag and drop to match each month name to its meaning.",
          "Match each Arabic month to its English meaning.",
          "Which month goes with which name?",
          "Pair each month name with its meaning.",
          "Match each month word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above for context clues about the months.",
        explanation: chosen.map((m) => `"${m.word}" means "${m.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
        { before: "The first month of the year, Yanayir, means ", after: " in English.", correct: "January" },
        { before: "The last month of the year, Disambir, means ", after: " in English.", correct: "December" },
        { before: "Term 1 in Kenyan schools usually starts in ", after: " (Yanayir).", correct: "January" },
        { before: "Term 2 in Kenyan schools usually starts in ", after: " (Mayu).", correct: "May" },
        { before: "Term 3 in Kenyan schools usually starts in ", after: " (Sibtambir).", correct: "September" },
        { before: "'Aghustus' is the Arabic name for the month of ", after: ".", correct: "August" },
        { before: "'Abril' is the Arabic name for the month of ", after: ".", correct: "April" },
        { before: "'Uktoubar' is the Arabic name for the month of ", after: ".", correct: "October" },
      ];
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence with the correct month name.",
          "What word completes this reading fact?",
          "Fill the gap correctly.",
          "Complete this fact about the months.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about which English month each Arabic month name matches.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const chosenCount = randChoice(rng, [4, 5]);
      const chosen = shuffle(rng, MONTHS).slice(0, chosenCount).sort((a, b) => a.order - b.order);
      const items = shuffle(rng, chosen.map((m, i) => ({ id: `${i}-${m.word}`, label: m.word })));
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Put these months in the order they appear in the year.",
          "Arrange these months from earliest to latest.",
          "Sequence these months in calendar order.",
          "Order these months as the calendar would.",
          "Which order do these months come in?",
        ]),
        instruction: "Click the months in calendar order.",
        items,
        correctOrder: chosen.map((m, i) => `${i}-${m.word}`),
        hint: "Yanayir (January) comes first in the year, Disambir (December) comes last.",
        explanation: `Calendar order: ${chosen.map((m) => `${m.word} (${m.meaning})`).join(" -> ")}.`,
      };
    }

    if (branch === "categorize") {
      const TERM_BUCKETS = MONTHS.map((m) => ({ word: m.word, term: m.order <= 4 ? "Term 1" : m.order <= 8 ? "Term 2" : "Term 3" }));
      const chosen = shuffle(rng, TERM_BUCKETS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.term));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "As you read about the school year, sort each month by term.",
          "Group these months by Kenyan school term.",
          "Which term does each month belong to?",
          "Sort each month into its correct term.",
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
      hint: "Some answers are stated directly; others need you to infer from clues in the passage.",
      explanation: qa.explanation,
    };
  },
};
