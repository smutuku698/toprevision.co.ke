import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGES: {
  id: string;
  text: string;
  main: string[];
  minor: string[];
  goodSummary: string;
  tooVague: string;
  addedInfo: string;
}[] = [
  {
    id: "athletics",
    text: "Green Valley Primary held its annual athletics day on a sunny Saturday. Pupils competed in sprint races, long jump, high jump, and javelin throw. In the 100-metre final, Faith Chebet broke the school record with a time of 13.2 seconds. Some pupils brought umbrellas to shade themselves from the heat between events. By the end of the day, Blue House had won the overall trophy for the third year running.",
    main: [
      "Pupils competed in sprint races, long jump, high jump, and javelin throw.",
      "Faith Chebet broke the school record in the 100-metre final.",
      "Blue House won the overall trophy for the third year running.",
    ],
    minor: [
      "The athletics day was held on a sunny Saturday.",
      "Some pupils brought umbrellas to shade themselves from the heat.",
    ],
    goodSummary: "Green Valley Primary's athletics day featured sprint, jump, and throw events, with Faith Chebet setting a new 100m record and Blue House winning the overall trophy again.",
    tooVague: "Green Valley Primary had a sports day.",
    addedInfo: "Green Valley Primary's athletics day featured swimming and football matches, and Blue House won the trophy.",
  },
  {
    id: "football",
    text: "Kibera Stars and Mathare United played a thrilling inter-estate football final at the community ground. The match stayed goalless until the final ten minutes, when Kibera Stars scored twice in quick succession. Spectators lined the touchline waving flags and blowing vuvuzelas throughout the match. Kibera Stars lifted the trophy after winning 2-0, their first title in five years.",
    main: [
      "The match stayed goalless until Kibera Stars scored twice in the final ten minutes.",
      "Kibera Stars won 2-0, their first title in five years.",
    ],
    minor: [
      "The match was played at the community ground.",
      "Spectators lined the touchline waving flags and blowing vuvuzelas.",
    ],
    goodSummary: "Kibera Stars beat Mathare United 2-0 in the inter-estate final, scoring twice in the last ten minutes to win their first title in five years.",
    tooVague: "Kibera Stars won a football match.",
    addedInfo: "Kibera Stars beat Mathare United 5-0 in a penalty shootout to win the trophy.",
  },
  {
    id: "netball",
    text: "The Nyeri County netball team travelled to Nairobi for the regional finals against Kiambu County. Players warmed up with short passing drills before the match began. Nyeri's shooters converted almost every attempt in the final quarter, turning a close game into a comfortable win. The final score was 38-24 to Nyeri, securing their place in the national championship.",
    main: [
      "Nyeri's shooters converted almost every attempt in the final quarter.",
      "Nyeri won 38-24, securing a place in the national championship.",
    ],
    minor: [
      "The team travelled to Nairobi for the regional finals.",
      "Players warmed up with short passing drills before the match began.",
    ],
    goodSummary: "Nyeri County beat Kiambu County 38-24 in the regional netball final, with strong shooting in the final quarter securing their spot in the nationals.",
    tooVague: "Nyeri played a netball match and won.",
    addedInfo: "Nyeri County beat Kiambu County in a penalty shootout to reach the world championship.",
  },
  {
    id: "hockey",
    text: "Mombasa Sharks hockey club hosted a friendly tournament at the coast, inviting teams from three neighbouring counties. Rain delayed the opening match by thirty minutes, but the tournament still finished on schedule. Mombasa Sharks reached the final unbeaten and defeated Kilifi Hawks 3-1 to lift the trophy. Organisers announced the tournament would become an annual coastal fixture.",
    main: [
      "Mombasa Sharks reached the final unbeaten and beat Kilifi Hawks 3-1 to win the tournament.",
      "Organisers announced the tournament would become an annual coastal fixture.",
    ],
    minor: [
      "Rain delayed the opening match by thirty minutes.",
      "Teams from three neighbouring counties were invited.",
    ],
    goodSummary: "Mombasa Sharks went unbeaten to beat Kilifi Hawks 3-1 and win their coastal hockey tournament, which organisers plan to hold annually.",
    tooVague: "Mombasa Sharks played hockey and won a trophy.",
    addedInfo: "Mombasa Sharks lost the final but organisers still gave them the trophy.",
  },
];

const SUMMARY_TERMS: { term: string; def: string }[] = [
  { term: "Underline", def: "Marking the main ideas directly in the original text before summarising" },
  { term: "Rough draft", def: "A first attempt at writing the summary in your own words, before improving it" },
  { term: "Fair copy", def: "The final, neatly written version of a summary after checking and correcting the draft" },
  { term: "Summary", def: "A short piece of writing that captures only the main ideas of a longer text" },
  { term: "Note", def: "A brief record of a key point, written down to remember it while reading" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main purpose of writing a rough draft before a fair copy when summarising?",
    correct: "It lets a writer check and correct their summary for accuracy and length before writing the final version",
    distractors: [
      "It is an unnecessary step that only wastes time",
      "It replaces the need to ever underline main ideas first",
      "It is only required when summarising fiction, not non-fiction",
    ],
  },
  {
    q: "Which factor should a writer consider most carefully when summarising a sports event?",
    correct: "Including only the key facts — such as the result and standout moments — in their own words",
    distractors: [
      "Copying the original report word for word to avoid mistakes",
      "Adding their own opinion about which team should have won",
      "Making the summary the same length as the original text",
    ],
  },
  {
    q: "Kevin summarises a football match report by copying three whole paragraphs directly from the newspaper. What mistake is he making?",
    correct: "He is copying instead of expressing the main ideas in his own words",
    distractors: [
      "He is making the summary far too short",
      "He is leaving out the final score entirely",
      "He is including too many minor details only",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Before writing a summary, a reader should first", after: "the main ideas in the original text.", correctAnswer: "underline" },
  { before: "A writer's first attempt at a summary, before correcting it, is called a", after: ".", correctAnswer: "rough draft" },
  { before: "The final, neatly written version of a summary is called the", after: ".", correctAnswer: "fair copy" },
  { before: "A", after: "is a short piece of writing that captures only the main ideas of a longer text.", correctAnswer: "summary" },
];

const ORDER_STEPS = [
  { id: "read", label: "Read the whole text to understand what it is about" },
  { id: "underline", label: "Underline or note the main ideas in the text" },
  { id: "rough", label: "Write a rough draft of the summary in your own words" },
  { id: "edit", label: "Edit the rough draft, checking accuracy and length" },
  { id: "fair", label: "Write the fair copy — the final, neat version" },
];

export const studySkillsSummarising: Skill = {
  id: "g7-eng-r-study-skills-summarising",
  code: "R.14",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Study Skills: Summarising",
  description: "Identify main ideas in texts about outdoor games, write clear summaries of varied texts, and appreciate the importance of summarising information.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "bestSummary", "underline", "fill", "match", "concept"] as const);
    const hint = "A good summary keeps only the main ideas, written in your own words, and leaves out minor details.";

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for writing a summary of a text, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Read first, then underline main ideas, then draft, edit, and finally write the fair copy.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "bestSummary") {
      const passage = randChoice(rng, PASSAGES);
      const choices = shuffle(rng, [passage.goodSummary, passage.tooVague, passage.addedInfo]);
      return {
        kind: "multiple-choice",
        prompt: "Which of these is the best summary of the passage?",
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.goodSummary),
        layout: "list",
        hint: "A good summary is accurate and specific, but shorter than the original — not too vague and not inventing new facts.",
        explanation: `"${passage.goodSummary}" is the best summary — it captures the key facts accurately in fewer words, without being too vague or adding false information.`,
      };
    }

    if (branch === "underline") {
      const passage = randChoice(rng, PASSAGES);
      const chosenMain = shuffle(rng, passage.main);
      const chosenMinor = shuffle(rng, passage.minor);
      const chosen = shuffle(rng, [
        ...chosenMain.map((m, i) => ({ id: `m${i}`, label: m, bucket: "main" as const })),
        ...chosenMinor.map((m, i) => ({ id: `x${i}`, label: m, bucket: "minor" as const })),
      ]);
      const items = chosen.map((c) => ({ id: c.id, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each sentence into what you would Include in a summary or Leave out of a summary.",
        passage: passage.text,
        items,
        buckets: [
          { id: "main", label: "Include in a summary (main idea)" },
          { id: "minor", label: "Leave out (minor detail)" },
        ],
        correctBucket,
        hint,
        explanation: "A summary keeps the main ideas that carry the passage's meaning and leaves out small details, like the weather or minor descriptions.",
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing summary-writing term.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, SUMMARY_TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, SUMMARY_TERMS.map((t) => ({ id: t.term, label: t.def })));
      const correctMap: Record<string, string> = {};
      for (const t of SUMMARY_TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each summary-writing term to what it means.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: SUMMARY_TERMS.map((t) => `${t.term} — ${t.def.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
