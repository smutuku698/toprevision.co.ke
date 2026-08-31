import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 5.0 → Sub-strand 5.1 "Concepts of Yog" (16 lessons).
// The design names exactly THREE concepts for this grade — devotion (bhakti), knowledge (jnana),
// action (karma). Deliberate omission: the classical fourth path, Raja Yog (the eight limbs of
// Ashtanga Yog), is NOT named in this sub-strand and is not invented here.
//
// Outcome (c) — "illustrate circumstances under which Yog is applicable in daily life" — and the
// assessment signal both require Apply-tier situational questions, not bare definitions, so the
// REASONING_TEMPLATES below are the core of this skill.
//
// Visual scope: declined — see curriculum-reference/grade-7/hindu-religious-education.json →
// visualCoverageDecision.

const MEANING_MATCH_PROMPTS = [
  "Match each concept of Yog to what it means.",
  "Pair each concept of Yog with its meaning.",
  "Connect each concept below to what it means.",
  "Link each concept of Yog to the correct meaning.",
  "Match each term to the meaning that fits it.",
  "Choose the correct meaning for each concept of Yog.",
];

const FACT_SORT_PROMPTS = [
  "Sort each everyday situation under the concept of Yog it best illustrates.",
  "Group these everyday situations under the concept of Yog each one illustrates.",
  "Decide which concept of Yog each situation illustrates, and sort it there.",
  "Sort each situation into the concept of Yog it best shows.",
  "Place each everyday situation under the concept it illustrates.",
  "Read each situation and sort it under the matching concept of Yog.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const CONCEPTS = [
  {
    id: "bhakti",
    label: "Devotion (Bhakti)",
    meaning:
      "Approaching the divine through love, worship and surrender — expressed through prayer, singing devotional songs, and devotion to a chosen form of God or a spiritual guide",
  },
  {
    id: "jnana",
    label: "Knowledge (Jnana)",
    meaning: "Seeking truth through study, reflection and self-inquiry — asking who one truly is and reasoning towards understanding",
  },
  {
    id: "karma",
    label: "Action (Karma)",
    meaning: "Serving others and carrying out one's duty selflessly, without being attached to praise or reward for it",
  },
] as const;

// 12 situation facts across the three concepts — past the 10-fact floor.
const SITUATION_FACTS: { text: string; concept: string }[] = [
  { text: "Singing devotional songs (bhajans) with the family before a shrine each evening", concept: "bhakti" },
  { text: "Lighting a lamp and offering a simple prayer out of love before starting the day", concept: "bhakti" },
  { text: "Surrendering worry about an exam result to God after doing one's best", concept: "bhakti" },
  { text: "Feeling comforted and connected to something greater through worship", concept: "bhakti" },
  { text: "Reading scripture closely and asking what a difficult passage really means", concept: "jnana" },
  { text: "Sitting with a question about who one truly is, rather than accepting the first answer", concept: "jnana" },
  { text: "Studying under a teacher and reasoning carefully towards understanding", concept: "jnana" },
  { text: "Reflecting quietly on the meaning of a life event rather than reacting immediately", concept: "jnana" },
  { text: "Helping a neighbour carry water without expecting thanks or a reward", concept: "karma" },
  { text: "Doing schoolwork honestly and carefully, even when no one is checking", concept: "karma" },
  { text: "Volunteering at a community clean-up and letting the credit go to the group", concept: "karma" },
  { text: "Offering up the result of one's effort instead of grasping at praise for it", concept: "karma" },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} lights a lamp each morning and sings a devotional song before leaving for school, saying it comforts her and connects her to God. Which concept of Yog does this show?`,
      correct: "Devotion (Bhakti) — approaching God through love, worship and surrender",
      wrong: [
        "Knowledge (Jnana) — which is about study and self-inquiry, not worship",
        "Action (Karma) — which is about selfless service, not a morning devotion",
        "None of these — daily prayer is not a path of Yog at all",
      ],
      explanation: "Worship expressed through prayer and song, done out of love and for comfort, is the path of devotion, Bhakti.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} spends an hour each week questioning what a scripture passage in ${place(rng)} really means, rather than repeating the first explanation given to him. Which concept is ${who} practising?`,
      correct: "Knowledge (Jnana) — seeking truth through study, reflection and self-inquiry",
      wrong: [
        "Devotion (Bhakti) — which is expressed through worship, not study and questioning",
        "Action (Karma) — which is expressed through service, not reflection on scripture",
        "None of these — questioning a text is not part of Yog",
      ],
      explanation: "Studying and reasoning carefully towards understanding, rather than simply accepting an answer, is the path of knowledge, Jnana.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} helps an elderly neighbour in ${place(rng)} carry water every evening and never mentions it to anyone or expects thanks. Which concept of Yog is this?`,
      correct: "Action (Karma) — serving others selflessly, without being attached to reward or recognition",
      wrong: [
        "Devotion (Bhakti) — which centres on worship, not unnoticed daily service",
        "Knowledge (Jnana) — which centres on reflection and study, not physical help",
        "None of these — helping a neighbour has nothing to do with Yog",
      ],
      explanation: "Selfless service, offered without seeking credit or reward, is the path of action, Karma.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Before an exam in ${place(rng)}, ${who} studies carefully, then quietly offers up her worry about the result instead of continuing to grasp at it. Which two concepts does this best combine?`,
      correct: "Knowledge (careful study) and devotion (offering up the outcome) — action alone would not capture the offering-up part",
      wrong: [
        "Action and knowledge only — this leaves out the offering-up of the result, which is devotion",
        "Devotion only — this leaves out the careful studying, which is knowledge",
        "None of the three concepts fit an exam situation",
      ],
      explanation: "Careful study is Jnana; releasing attachment to the outcome by offering it up is the surrender at the heart of Bhakti — together, not either alone.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} joins a community clean-up, works hard, and then lets the whole group take the credit rather than seeking praise for herself. Which concept of Yog is this?`,
      correct: "Action (Karma) — doing one's part without attachment to personal praise or reward",
      wrong: [
        "Devotion (Bhakti) — which is expressed through prayer and worship, not shared community work",
        "Knowledge (Jnana) — which is expressed through study, not physical work for others",
        "None of these — community work is not connected to Yog",
      ],
      explanation: "Working for a shared good and letting go of personal credit for it is the selfless-service pattern of Karma.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sits quietly after a difficult day in ${place(rng)}, not to pray and not to help anyone, but to genuinely ask himself who he is and why he reacted the way he did. Which concept fits best?`,
      correct: "Knowledge (Jnana) — self-inquiry, asking who one truly is and reasoning towards understanding",
      wrong: [
        "Devotion (Bhakti) — which is expressed through worship and surrender, not self-inquiry",
        "Action (Karma) — which is expressed through service to others, not quiet self-questioning",
        "None of these — self-questioning has nothing to do with Yog",
      ],
      explanation: "Sitting with a genuine question about oneself, reasoning towards understanding, is exactly the self-inquiry of Jnana.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, who has very little free time between school and chores in ${place(rng)}, wonders whether Yog is even possible for someone that busy. Which response best fits what the three concepts actually require?`,
      correct: "Yes — a short daily prayer (bhakti), doing chores honestly without complaint (karma), or a moment of quiet reflection (jnana) are each enough to begin",
      wrong: [
        "No — all three concepts require several uninterrupted hours each day to practise properly",
        "No — Yog can only be practised by people who have already finished their schooling",
        "Yes, but only the path of knowledge is possible for a busy person",
      ],
      explanation: "Each concept fits ordinary daily circumstances — a short prayer, an honestly done chore, or a moment of reflection — not only long, uninterrupted sessions.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says that only people who visit a shrine every day are truly practising Yog. Judge this claim against the three concepts the design names.`,
      correct: "It is too narrow — Karma (honest service) and Jnana (study and reflection) do not require a shrine visit at all, only Bhakti typically involves worship at a shrine",
      wrong: [
        "It is correct — all three concepts require a daily shrine visit",
        "It is correct, because Karma and Jnana are not genuine paths of Yog",
        "It is too narrow, because none of the three concepts involve a shrine at all",
      ],
      explanation: "Shrine worship fits Bhakti specifically, but Karma is expressed through service and Jnana through study and reflection — neither requires a shrine visit.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} donates part of her pocket money to a classmate's family after a fire, and asks that her name not be mentioned. Which concept of Yog is this closest to?`,
      correct: "Action (Karma) — service to others carried out without seeking recognition",
      wrong: [
        "Devotion (Bhakti) — which centres on worship, not a material gift given quietly",
        "Knowledge (Jnana) — which centres on study and reflection, not an act of giving",
        "None of these — a donation is a purely practical act unconnected to Yog",
      ],
      explanation: "A selfless gift, deliberately given without recognition, is the pattern of Karma — service without attachment to reward.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} keeps a personal journal in ${place(rng)}, writing down questions about life's meaning and trying to reason through them honestly, week after week. Which concept fits this habit?`,
      correct: "Knowledge (Jnana) — the ongoing habit of reflection and reasoning towards understanding",
      wrong: [
        "Action (Karma) — which is expressed through service, not a private journal",
        "Devotion (Bhakti) — which is expressed through worship, not written reflection",
        "None of these — journaling is unrelated to any concept of Yog",
      ],
      explanation: "A sustained habit of questioning and reasoning towards understanding is exactly what the path of knowledge, Jnana, describes.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues that devotion, knowledge and action are three competing paths, and that a person must choose only one for life. Judge this claim using the exam-preparation example, where study, quiet surrender and honest effort were all combined.`,
      correct: "It is mistaken — the three concepts can work together in the same person's life rather than being exclusive choices",
      wrong: [
        "It is correct — practising more than one concept at once is not possible",
        "It is correct — choosing one path for life is required by the Grade 7 design",
        "It is mistaken, because only knowledge and action can ever be combined, never devotion",
      ],
      explanation: "Nothing in the three concepts requires exclusivity — study, offering up a worry, and honest effort can all appear together in one person's daily life.",
    };
  },
];

const COUNT_TEMPLATES: ((rng: RNG) => { prompt: string; min: number; max: number; value: number; hint: string; explanation: string })[] = [
  () => ({
    prompt: "Mark how many concepts of Yog the Grade 7 design names.",
    min: 0,
    max: 6,
    value: 3,
    hint: "Devotion, knowledge, action.",
    explanation: "The design names exactly three concepts of Yog for Grade 7: devotion (Bhakti), knowledge (Jnana) and action (Karma).",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is preparing a chart in ${place(rng)} listing devotion, knowledge and action. Mark how many concepts of Yog ${who} has listed.`,
      min: 0,
      max: 6,
      value: 3,
      hint: "Count the three named on the chart.",
      explanation: "Devotion, knowledge and action are the three concepts of Yog the Grade 7 design names.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A classmate tells ${who} in ${place(rng)} that Yog has five concepts at this grade level. Mark how many concepts the Grade 7 design actually names.`,
      min: 0,
      max: 8,
      value: 3,
      hint: "Devotion, knowledge, action — no more.",
      explanation: "The classmate is mistaken — the Grade 7 design names exactly three concepts of Yog, not five.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "Approaching the divine through love, worship and surrender is the concept of ", after: " (Bhakti).", correctAnswer: "devotion", acceptedAnswers: ["devotion", "bhakti"], hint: "Expressed through prayer and song.", explanation: "Bhakti is the concept of devotion — approaching the divine through love, worship and surrender." },
  { before: "Seeking truth through study, reflection and self-inquiry is the concept of ", after: " (Jnana).", correctAnswer: "knowledge", acceptedAnswers: ["knowledge", "jnana"], hint: "Asking who one truly is.", explanation: "Jnana is the concept of knowledge — seeking truth through study, reflection and self-inquiry." },
  { before: "Serving others and doing one's duty selflessly, without seeking reward, is the concept of ", after: " (Karma).", correctAnswer: "action", acceptedAnswers: ["action", "karma"], hint: "Expressed through service.", explanation: "Karma is the concept of action — serving others and doing one's duty without attachment to reward." },
  { before: "A person who sings devotional songs and prays with love before a shrine is practising ", after: ".", correctAnswer: "Bhakti", acceptedAnswers: ["bhakti", "devotion"], hint: "The path of devotion.", explanation: "Singing devotional songs and praying with love is Bhakti, the path of devotion." },
  { before: "A person who studies scripture and questions its meaning deeply is practising ", after: ".", correctAnswer: "Jnana", acceptedAnswers: ["jnana", "knowledge"], hint: "The path of knowledge.", explanation: "Studying and questioning deeply is Jnana, the path of knowledge." },
  { before: "A person who volunteers and helps others without seeking praise is practising ", after: ".", correctAnswer: "Karma", acceptedAnswers: ["karma", "action"], hint: "The path of action.", explanation: "Volunteering and helping without seeking praise is Karma, the path of action." },
  { before: "The Grade 7 HRE design names exactly ", after: " concepts of Yog.", correctAnswer: "three", acceptedAnswers: ["three", "3"], hint: "Devotion, knowledge, action.", explanation: "The design names exactly three concepts of Yog for Grade 7: devotion, knowledge and action." },
  { before: "In Bhakti, the fruit of devotion is expressed through prayer and ", after: ".", correctAnswer: "surrender", acceptedAnswers: ["surrender"], hint: "Letting go of the outcome.", explanation: "Bhakti is expressed through love, worship and surrender to the divine." },
  { before: "In Karma, the reward for an action should not be ", after: " onto by the one performing it.", correctAnswer: "grasped", acceptedAnswers: ["grasped", "held"], hint: "Attachment to the fruit of action is what's avoided.", explanation: "In Karma, the fruit of action is offered up rather than grasped at by the one who performs it." },
  { before: "In Jnana, the central question a learner reasons towards is who one truly ", after: ".", correctAnswer: "is", acceptedAnswers: ["is"], hint: "Self-inquiry.", explanation: "Jnana centres on self-inquiry — reasoning towards understanding who one truly is." },
] as const;

export const conceptsOfYog: Skill = {
  id: "g7-hre-yo-concepts-of-yog",
  code: "YO.1",
  subjectId: "hre",
  strandId: "g7-hre-yo",
  grade: 7,
  title: "Concepts of Yog",
  description:
    "The three concepts of Yog named for Grade 7 — devotion (Bhakti), knowledge (Jnana) and action (Karma) — what each means and how each shows up in everyday circumstances.",
  generate(rng) {
    const branch = randChoice(rng, ["meaning-match", "fact-sort", "reasoning", "counts", "fill-blank"] as const);

    if (branch === "meaning-match") {
      const tokens = shuffle(rng, CONCEPTS.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CONCEPTS.map((c) => ({ id: c.id, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of CONCEPTS) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MEANING_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Devotion is love and worship; knowledge is study and self-inquiry; action is selfless service.",
        explanation: CONCEPTS.map((c) => `${c.label} — ${c.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fact-sort") {
      const pool = shuffle(rng, SITUATION_FACTS).slice(0, 9);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.concept));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FACT_SORT_PROMPTS),
        items,
        buckets: CONCEPTS.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint: "Worship goes with devotion, study and reflection go with knowledge, service goes with action.",
        explanation: pool.map((f) => `"${f.text}" — ${CONCEPTS.find((c) => c.id === f.concept)!.label}.`).join(" "),
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
        hint: "Ask what the person is actually doing — worshipping, studying and reflecting, or serving.",
        explanation: q.explanation,
      };
    }

    if (branch === "counts") {
      const q = randChoice(rng, COUNT_TEMPLATES)(rng);
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
