import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 5.0 → Sub-strand 5.2 "Path of Devotion (Bhakti Yog)" (15 lessons).
// The design's own structure splits elements into PERSONAL (mantras, mala, meditation,
// chanting/recitation) and COMMUNAL (Satsang, Sangha, Sangat), each communal term named for a
// different tradition. "As per the four faiths" recurs in three of the four outcomes, so the
// personal elements are treated as shared across Sanatan/Vedic, Jain, Buddhist and Sikh practice.
//
// Deliberate omission: the design names no communal term for the Jain tradition in this sub-strand
// (only Satsang/Sanatan-Vedic, Sangha/Buddhist, Sangat/Sikh are listed) — no Jain communal term is
// invented here; the gap is the source's, not an oversight in this skill.
//
// Visual scope: declined — see curriculum-reference/grade-7/hindu-religious-education.json →
// visualCoverageDecision.

const PERSONAL_MATCH_PROMPTS = [
  "Match each personal element of Bhakti Yog to what it is.",
  "Pair each personal element with its correct description.",
  "Connect each personal element of Bhakti Yog to what it means.",
  "Link each personal element below to what it is.",
  "Match each term to its correct meaning.",
  "Choose the correct description for each personal element.",
];

const COMMUNAL_TRADITION_MATCH_PROMPTS = [
  "Match each communal term to the tradition it belongs to.",
  "Pair each communal term with its faith tradition.",
  "Connect each communal term to the tradition it comes from.",
  "Link each communal term below to its tradition.",
  "Match each term to the faith tradition it belongs to.",
  "Choose the correct tradition for each communal term.",
];

const PERSONAL_COMMUNAL_SORT_PROMPTS = [
  "Sort each element of Bhakti Yog as personal or communal.",
  "Group each element of Bhakti Yog under personal or communal.",
  "Decide whether each element is personal or communal, and sort it there.",
  "Sort these elements of Bhakti Yog into personal and communal.",
  "Place each element into the personal or communal category.",
  "Categorise each element of Bhakti Yog as personal or communal.",
];

const FACT_SORT_PROMPTS = [
  "Sort each description under the element of Bhakti Yog it describes.",
  "Group these descriptions under the element each one belongs to.",
  "Decide which element of Bhakti Yog each description matches, and sort it there.",
  "Sort each fact into the correct element of Bhakti Yog.",
  "Place each description under the element it belongs to.",
  "Read each fact and sort it under the matching element.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const PERSONAL = [
  { id: "mantras", label: "Mantras", meaning: "Sacred words or phrases repeated in prayer or meditation to focus the mind on the divine" },
  { id: "mala", label: "Mala", meaning: "A string of prayer beads used to count repetitions of a mantra during personal devotion" },
  { id: "meditation", label: "Meditation", meaning: "Sitting quietly to turn the mind inward in remembrance of the divine" },
  { id: "chanting", label: "Chanting/recitation", meaning: "Reciting or singing sacred verses aloud and rhythmically as an act of devotion" },
] as const;

const COMMUNAL = [
  { id: "satsang", label: "Satsang", tradition: "Sanatan/Vedic", meaning: "A communal gathering to sing devotional songs, hear discourse, and be in the company of the faithful" },
  { id: "sangha", label: "Sangha", tradition: "Buddhist", meaning: "The community of practitioners who support one another along the path together" },
  { id: "sangat", label: "Sangat", tradition: "Sikh", meaning: "The congregation that gathers at the gurdwara for kirtan, prayer and langar" },
] as const;

// 15 facts across the seven elements — well past the 10-fact floor.
const ELEMENT_FACTS: { text: string; element: string }[] = [
  { text: "Repeating a sacred word or phrase in prayer to keep the mind fixed on the divine", element: "mantras" },
  { text: "Used silently or aloud, alone or together with others", element: "mantras" },
  { text: "A string of beads passed one by one through the fingers while counting repetitions", element: "mala" },
  { text: "Helps a devotee keep an exact count during personal prayer", element: "mala" },
  { text: "Sitting quietly and turning attention inward towards the divine", element: "meditation" },
  { text: "Practised alone, often at a set time each day", element: "meditation" },
  { text: "Sacred verses recited or sung aloud, often rhythmically", element: "chanting" },
  { text: "Can be done individually or joined in by a whole household", element: "chanting" },
  { text: "A communal gathering to sing devotional songs and hear discourse", element: "satsang" },
  { text: "Being in the company of other devotees is considered part of its value", element: "satsang" },
  { text: "The community of practitioners who support one another on the path", element: "sangha" },
  { text: "Members encourage and rely on one another in shared practice", element: "sangha" },
  { text: "The congregation gathered at the gurdwara for kirtan and prayer", element: "sangat" },
  { text: "Concludes with everyone sharing langar together", element: "sangat" },
  { text: "Devotion practised together, not alone, is the point of a communal gathering", element: "sangat" },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} passes a string of beads through her fingers one by one, counting each repetition of a sacred phrase. Which element of Bhakti Yog is this?`,
      correct: "Mala — a string of prayer beads used to count repetitions of a mantra",
      wrong: [
        "Satsang — a communal gathering, not a personal counting practice",
        "Sangat — a Sikh congregation, not a string of beads",
        "Chanting/recitation — which is aloud verses, not counting on beads",
      ],
      explanation: "Counting repetitions with a string of beads passed through the fingers is specifically the practice of using a mala.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} attends a gathering in ${place(rng)} where devotees sing songs together, listen to a discourse, and simply enjoy being in each other's company. Which element is this?`,
      correct: "Satsang — a communal gathering to sing devotional songs, hear discourse and be in the company of the faithful",
      wrong: [
        "Meditation — which is a personal, usually solitary, practice",
        "Mala — a personal counting practice, not a group gathering",
        "Sangha — the Buddhist community, not the Sanatan/Vedic gathering described here",
      ],
      explanation: "A communal gathering built around singing, discourse and company is Satsang, the Sanatan/Vedic communal element.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sits quietly alone each morning in ${place(rng)}, turning his attention inward towards the divine before the household wakes up. Which element is this?`,
      correct: "Meditation — sitting quietly to turn the mind inward in remembrance of the divine",
      wrong: [
        "Chanting/recitation — which involves reciting aloud, not silent stillness",
        "Sangat — a congregation, not a solitary morning practice",
        "Mala — a beaded counting practice, not sitting in stillness",
      ],
      explanation: "Sitting quietly alone, turning inward, is the personal element of meditation.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A Buddhist community in ${place(rng)} supports and encourages one another as they practise together, described as ${who}'s own community of fellow practitioners. Which element is this?`,
      correct: "Sangha — the community of Buddhist practitioners who support one another along the path",
      wrong: [
        "Satsang — the Sanatan/Vedic communal gathering, not the Buddhist community",
        "Sangat — the Sikh congregation, not the Buddhist community",
        "Mantras — a personal recitation practice, not a community",
      ],
      explanation: "Sangha specifically names the Buddhist community of practitioners supporting one another.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family gathers at the gurdwara in ${place(rng)} for kirtan and prayer, closing with everyone sharing a meal together. Which element of Bhakti Yog is this?`,
      correct: "Sangat — the Sikh congregation that gathers at the gurdwara for kirtan, prayer and langar",
      wrong: [
        "Sangha — the Buddhist community, not the Sikh congregation",
        "Satsang — the Sanatan/Vedic gathering, not the gurdwara congregation",
        "Mantras — a personal recitation, not a congregation at the gurdwara",
      ],
      explanation: "Gathering at the gurdwara for kirtan, prayer and langar together is specifically Sangat.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} repeats a short sacred phrase silently to herself in ${place(rng)} whenever she feels anxious, to keep her mind fixed on the divine. Which element is this?`,
      correct: "Mantras — sacred words or phrases repeated in prayer or meditation to focus the mind",
      wrong: [
        "Mala — the beads used to count a mantra, not the phrase itself",
        "Satsang — a communal gathering, not a private repeated phrase",
        "Sangha — a community, not a repeated sacred phrase",
      ],
      explanation: "A repeated sacred phrase used to focus the mind on the divine is the mantra itself.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} and her whole household recite sacred verses aloud together every evening before dinner in ${place(rng)}. Which element is this?`,
      correct: "Chanting/recitation — reciting or singing sacred verses aloud and rhythmically",
      wrong: [
        "Meditation — which is typically done in silence, not aloud",
        "Mala — a beaded counting practice, not spoken verses",
        "Sangha — a community identity, not a household recitation",
      ],
      explanation: "Reciting sacred verses aloud, rhythmically, is chanting/recitation — whether done alone or by a household together.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is sorting the seven elements of Bhakti Yog into two groups for a class chart in ${place(rng)}: things a person can do alone, and things that need other people. Where do mantras, mala, meditation and chanting/recitation belong?`,
    correct: "The 'alone' group — the personal elements, which do not require a gathering to practise",
    wrong: [
      "The 'needs other people' group, since all devotion is communal by definition",
      "Split evenly between both groups, since each one is sometimes done with others and sometimes alone",
      "Neither group — these four are not part of Bhakti Yog at all",
    ],
    explanation: "Mantras, mala, meditation and chanting/recitation are the design's personal elements — practised individually, unlike Satsang, Sangha and Sangat, which are communal by nature.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues in ${place(rng)} that Satsang, Sangha and Sangat are really just three different names for the exact same gathering. Judge this claim.`,
      correct: "It is mistaken — each belongs to a different tradition (Sanatan/Vedic, Buddhist and Sikh) even though all three bring devotees together communally",
      wrong: [
        "It is correct — the design uses three names for one identical gathering",
        "It is correct, because only Sikh practice actually has a communal gathering",
        "It is mistaken, because Sangha and Sangat both belong to the Sanatan/Vedic tradition",
      ],
      explanation: "Satsang, Sangha and Sangat are communal in the same general way but belong to three different named traditions — not interchangeable labels for one thing.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says a mala is only useful for counting, and has no connection to devotion itself. Judge this claim.`,
      correct: "It is too narrow — counting with a mala supports sustained repetition of a mantra, which is itself an act of devotion, not separate from it",
      wrong: [
        "It is correct — counting beads and devotion are two completely unrelated things",
        "It is correct, because a mala is used only outside of any religious practice",
        "It is too narrow, because a mala replaces the need for a mantra entirely",
      ],
      explanation: "The mala's counting function directly supports sustained mantra repetition — the counting and the devotional act are connected, not separate.",
    };
  },
];

const NUMBER_FACTS = [
  {
    prompt: "Mark how many personal elements of Bhakti Yog the design names.",
    min: 0,
    max: 8,
    value: 4,
    hint: "Mantras, mala, meditation, chanting/recitation.",
    explanation: "The design names four personal elements: mantras, mala, meditation and chanting/recitation.",
  },
  {
    prompt: "Mark how many communal terms for Bhakti Yog the design names.",
    min: 0,
    max: 8,
    value: 3,
    hint: "Satsang, Sangha, Sangat.",
    explanation: "The design names three communal terms, one each from the Sanatan/Vedic, Buddhist and Sikh traditions: Satsang, Sangha and Sangat.",
  },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A string of prayer beads used to count repetitions of a mantra is called a ", after: ".", correctAnswer: "mala", acceptedAnswers: ["mala"], hint: "Passed through the fingers one bead at a time.", explanation: "A mala is a string of prayer beads used to count mantra repetitions." },
  { before: "A sacred word or phrase repeated in prayer to focus the mind on the divine is a ", after: ".", correctAnswer: "mantra", acceptedAnswers: ["mantra", "mantras"], hint: "Can be repeated silently or aloud.", explanation: "A mantra is a sacred word or phrase repeated to keep the mind focused on the divine." },
  { before: "Sitting quietly to turn the mind inward in remembrance of the divine is ", after: ".", correctAnswer: "meditation", acceptedAnswers: ["meditation"], hint: "Usually practised alone.", explanation: "Meditation is sitting quietly to turn the mind inward in remembrance of the divine." },
  { before: "Reciting or singing sacred verses aloud and rhythmically is called ", after: ".", correctAnswer: "chanting", acceptedAnswers: ["chanting", "recitation"], hint: "Can be done alone or by a household together.", explanation: "Chanting/recitation is reciting or singing sacred verses aloud and rhythmically." },
  { before: "The Sanatan/Vedic communal gathering for devotional songs and discourse is called ", after: ".", correctAnswer: "Satsang", acceptedAnswers: ["satsang"], hint: "Being in the company of the faithful is part of its value.", explanation: "Satsang is the Sanatan/Vedic communal gathering for devotional songs, discourse and company." },
  { before: "The Buddhist community of practitioners who support one another is the ", after: ".", correctAnswer: "Sangha", acceptedAnswers: ["sangha"], hint: "A shared community on the path.", explanation: "Sangha is the Buddhist community of practitioners who support one another along the path." },
  { before: "The Sikh congregation gathered at the gurdwara for kirtan and prayer is the ", after: ".", correctAnswer: "Sangat", acceptedAnswers: ["sangat"], hint: "It closes with langar.", explanation: "Sangat is the Sikh congregation that gathers at the gurdwara for kirtan, prayer and langar." },
  { before: "The Grade 7 design divides the elements of Bhakti Yog into personal and ", after: " categories.", correctAnswer: "communal", acceptedAnswers: ["communal"], hint: "Practices that need a gathering.", explanation: "The design's own structure splits the elements into personal (individual) and communal (group) categories." },
  { before: "Of the seven elements, mantras, mala, meditation and chanting/recitation are ", after: " elements.", correctAnswer: "personal", acceptedAnswers: ["personal"], hint: "Practised individually.", explanation: "Mantras, mala, meditation and chanting/recitation are the four personal elements — practised individually." },
  { before: "Satsang, Sangha and Sangat are the three ", after: " elements, each from a different tradition.", correctAnswer: "communal", acceptedAnswers: ["communal"], hint: "They require a gathering of people.", explanation: "Satsang, Sangha and Sangat are the three communal elements, one each from the Sanatan/Vedic, Buddhist and Sikh traditions." },
] as const;

export const pathOfDevotion: Skill = {
  id: "g7-hre-yo-path-of-devotion",
  code: "YO.2",
  subjectId: "hre",
  strandId: "g7-hre-yo",
  grade: 7,
  title: "Path of Devotion (Bhakti Yog)",
  description:
    "The seven elements of Bhakti Yog — four personal (mantras, mala, meditation, chanting/recitation) and three communal (Satsang, Sangha, Sangat) — what each one is and which tradition each communal term belongs to.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["personal-match", "communal-tradition-match", "personal-communal-sort", "fact-sort", "reasoning", "counts", "fill-blank"] as const
    );

    if (branch === "personal-match") {
      const tokens = shuffle(rng, PERSONAL.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PERSONAL.map((p) => ({ id: p.id, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of PERSONAL) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, PERSONAL_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These four are practised individually, not as a group.",
        explanation: PERSONAL.map((p) => `${p.label} — ${p.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "communal-tradition-match") {
      const tokens = shuffle(rng, COMMUNAL.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, COMMUNAL.map((c) => ({ id: c.id, label: c.tradition })));
      const correctMap: Record<string, string> = {};
      for (const c of COMMUNAL) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, COMMUNAL_TRADITION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "One term per tradition: Sanatan/Vedic, Buddhist, Sikh.",
        explanation: COMMUNAL.map((c) => `${c.label} — ${c.tradition}.`).join(" "),
      };
    }

    if (branch === "personal-communal-sort") {
      const items = shuffle(rng, [
        ...PERSONAL.map((p) => ({ id: p.id, label: p.label })),
        ...COMMUNAL.map((c) => ({ id: c.id, label: `${c.label} (${c.tradition})` })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const p of PERSONAL) correctBucket[p.id] = "personal";
      for (const c of COMMUNAL) correctBucket[c.id] = "communal";
      return {
        kind: "categorize",
        prompt: randChoice(rng, PERSONAL_COMMUNAL_SORT_PROMPTS),
        items,
        buckets: [
          { id: "personal", label: "Personal (practised alone)" },
          { id: "communal", label: "Communal (practised with a gathering)" },
        ],
        correctBucket,
        hint: "A gathering of other devotees is the giveaway for communal.",
        explanation: [
          ...PERSONAL.map((p) => `${p.label} — personal.`),
          ...COMMUNAL.map((c) => `${c.label} — communal (${c.tradition}).`),
        ].join(" "),
      };
    }

    if (branch === "fact-sort") {
      const chosen = shuffle(rng, [...PERSONAL, ...COMMUNAL]).slice(0, 3);
      const pool = shuffle(rng, ELEMENT_FACTS.filter((f) => chosen.some((c) => c.id === f.element))).slice(0, 9);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.element));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FACT_SORT_PROMPTS),
        items,
        buckets: chosen.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint: "Ask whether it's something counted, recited, sat with in silence, or shared with others.",
        explanation: pool.map((f) => `"${f.text}" — ${[...PERSONAL, ...COMMUNAL].find((x) => x.id === f.element)!.label}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Ask whether the situation is done alone or with a gathering, and which tradition it names.",
        explanation: q.explanation,
      };
    }

    if (branch === "counts") {
      const q = randChoice(rng, NUMBER_FACTS);
      return {
        kind: "number-line",
        prompt: q.prompt,
        min: q.min,
        max: q.max,
        step: 1,
        correctValue: q.value,
        mode: "point",
        hint: q.hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint: fb.hint,
      explanation: fb.explanation,
    };
  },
};
