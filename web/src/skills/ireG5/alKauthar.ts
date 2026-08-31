import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5IreShared";

// Grade 5 IRE — 1.1 Selected Surah: Al-Kauthar (Surah 108, 3 verses, the shortest surah in the Qur'an).
// Content kept to well-established, general themes/meaning per the curriculum outcome "outline the basic
// meaning" and "deduce lessons" — no verse-by-verse translation invented.

const LEARNING_STEPS = [
  { id: "listen", label: "Listen to the teacher or a digital device recite Surah Al-Kauthar" },
  { id: "recite-after", label: "Recite Surah Al-Kauthar after the teacher, a peer, or a digital device" },
  { id: "read", label: "Read Surah Al-Kauthar from a mus-haf, chart, or digital device" },
  { id: "pronounce", label: "Practise pronouncing the words correctly by listening carefully" },
  { id: "memorise", label: "Recite Surah Al-Kauthar several times to memorise it" },
  { id: "meaning", label: "Learn the basic meaning of Surah Al-Kauthar and make notes" },
  { id: "apply", label: "Discuss ways to apply the lessons of Surah Al-Kauthar in daily life" },
] as const;

type Topic = "meaning" | "context" | "lesson";
const TOPIC_LABEL: Record<Topic, string> = {
  meaning: "The basic meaning of Al-Kauthar",
  context: "Why Al-Kauthar was revealed",
  lesson: "Lessons from Al-Kauthar",
};
const TOPIC_FACTS: { text: string; topic: Topic }[] = [
  { text: "Al-Kauthar is the shortest surah in the Qur'an, with only three verses", topic: "meaning" },
  { text: "Al-Kauthar means 'abundance' — Allah tells the Prophet (S.A.W.) that He has given him abundant good", topic: "meaning" },
  { text: "The surah instructs the Prophet (S.A.W.) to pray to his Lord and offer sacrifice", topic: "meaning" },
  { text: "The surah declares that it is the one who hates the Prophet (S.A.W.) who is truly cut off, not the Prophet", topic: "meaning" },
  { text: "Reciting Al-Kauthar reminds a Muslim that true abundance comes from Allah, not worldly status", topic: "meaning" },
  { text: "Surah Al-Kauthar was revealed to comfort the Prophet (S.A.W.) after he was mocked for having no surviving sons", topic: "context" },
  { text: "Opponents of the Prophet (S.A.W.) called him 'cut off' because they wrongly believed he had no lasting legacy", topic: "context" },
  { text: "The surah answers those insults by promising the Prophet (S.A.W.) abundant blessing from Allah", topic: "context" },
  { text: "Al-Kauthar is also understood by scholars to refer to a river given to the Prophet (S.A.W.) in Paradise", topic: "context" },
  { text: "Al-Kauthar was revealed in Makkah, during a difficult period when the Prophet (S.A.W.) faced ridicule", topic: "context" },
  { text: "Al-Kauthar teaches that a Muslim should respond to Allah's blessings with prayer and worship", topic: "lesson" },
  { text: "The surah teaches gratitude to Allah, since He gives abundant good even after hardship", topic: "lesson" },
  { text: "Al-Kauthar teaches that insults from others do not diminish what Allah has given a person", topic: "lesson" },
  { text: "The surah links receiving blessings from Allah directly to performing swalah and offering sacrifice", topic: "lesson" },
  { text: "Al-Kauthar teaches a Muslim not to be discouraged by an enemy's insults, since Allah's support is greater", topic: "lesson" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Al-Kauthar", meaning: "Abundance — the abundant good Allah gave the Prophet (S.A.W.)" },
  { term: "Sacrifice (offered alongside prayer)", meaning: "The second act, together with swalah, that the surah instructs as a response to Allah's blessing" },
  { term: "'Cut off'", meaning: "The insult aimed at the Prophet (S.A.W.), which the surah says truly describes his enemy instead" },
  { term: "Three verses", meaning: "The length of Surah Al-Kauthar — the shortest surah in the Qur'an" },
  { term: "A river in Paradise", meaning: "One meaning scholars give for what 'Al-Kauthar' refers to" },
  { term: "Makkah", meaning: "The city where Surah Al-Kauthar was revealed" },
  { term: "Mockery about having no sons", meaning: "The insult from opponents that prompted this surah's revelation" },
  { term: "Swalah", meaning: "Prayer — one of the two acts of worship the surah instructs as gratitude for abundance" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} passes a big exam and feels very grateful. Recalling the lesson of Surah Al-Kauthar, what should ${who} do in response to this blessing?`,
      correct: "Turn to Allah in prayer and give in sacrifice or charity, since the surah links abundance to worship",
      wrong: [
        "Keep the good news secret and never mention Allah's part in it",
        "Boast about it to classmates to make them feel small",
        "Assume the good result came only from personal effort, with no need to thank Allah",
      ],
      explanation: "Al-Kauthar instructs the Prophet (S.A.W.) to respond to Allah's abundant blessing with prayer and sacrifice — the same pattern applies to any blessing a Muslim receives.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Classmates in ${place(rng)} tease ${who}, saying ${who} will never be remembered for anything. Recalling Surah Al-Kauthar, how should ${who} understand this insult?`,
      correct: "The surah teaches that it is the one who mocks unfairly who is truly 'cut off,' not the person being insulted",
      wrong: [
        "The surah teaches that insults always come true, so the person should worry",
        "The surah has nothing to say about being mocked by others",
        "The surah teaches that the person should mock the classmates back instead",
      ],
      explanation: "Al-Kauthar was revealed after the Prophet (S.A.W.) was mocked as 'cut off' — the surah replies that his enemy is the one truly cut off, since Allah gave the Prophet abundant good.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} has a good harvest and wants to follow the teaching of Al-Kauthar. What two acts does the surah link together as the response to abundance?`,
    correct: "Prayer (swalah) and sacrifice",
    wrong: [
      "Fasting and silence, with no prayer required",
      "Isolation from the community until the blessing passes",
      "Celebration and boasting, without any act of worship",
    ],
    explanation: "Al-Kauthar instructs the Prophet (S.A.W.) to 'pray to your Lord and sacrifice' — prayer and sacrifice together, not either one alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Al-Kauthar is only about material wealth, not about honour or a lasting legacy. Evaluate this claim.`,
    correct: "Flawed — the surah responds to the Prophet (S.A.W.) being called 'without legacy,' so 'abundance' includes honour and lasting good, not material wealth alone",
    wrong: [
      "Sound — Al-Kauthar only ever refers to money and property",
      "Sound — the surah has nothing to do with honour or legacy at all",
      "Flawed — Al-Kauthar actually refers only to physical descendants, not any other kind of good",
    ],
    explanation: "Al-Kauthar was revealed to counter the insult that the Prophet (S.A.W.) had no lasting legacy — the 'abundance' promised is broader than material wealth, covering honour, legacy, and blessing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `In class in ${place(rng)}, ${who} is asked why the Prophet (S.A.W.) is described as never truly 'cut off,' even after losing his sons. What is the best answer?`,
      correct: "Because Allah gave him abundant good (Al-Kauthar), so it is his enemies who are truly cut off, not him",
      wrong: [
        "Because the Prophet (S.A.W.) later had many more sons",
        "Because 'cut off' in the surah refers only to physical family, with no other meaning",
        "Because the insult was proven true and the surah simply accepts it",
      ],
      explanation: "Al-Kauthar directly answers the 'cut off' insult by promising the Prophet (S.A.W.) abundant good from Allah and redirecting the description of 'cut off' onto the one who hates him.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} receives a scholarship and wants to apply Al-Kauthar's teaching straight away. What should ${who} do first?`,
      correct: "Turn to Allah in prayer as an act of gratitude, following the surah's instruction",
      wrong: [
        "Spend the scholarship money immediately, since gratitude is not required",
        "Wait until a much bigger blessing arrives before thanking Allah",
        "Assume gratitude only applies to wealth, not to opportunities like a scholarship",
      ],
      explanation: "Al-Kauthar's instruction to 'pray to your Lord' applies to any blessing, including an opportunity like a scholarship, not only material wealth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that Surah Al-Kauthar mentions only prayer, with no mention of sacrifice at all. Is this correct?`,
    correct: "No — the surah instructs both prayer and sacrifice as the response to Allah's blessing",
    wrong: [
      "Yes — sacrifice is never mentioned anywhere in Al-Kauthar",
      "Yes — Al-Kauthar is only three verses, so it cannot mention two acts of worship",
      "No — but sacrifice is mentioned instead of prayer, not alongside it",
    ],
    explanation: "Al-Kauthar's second verse instructs the Prophet (S.A.W.) to pray and to offer sacrifice — both acts appear together, not one instead of the other.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} recites Al-Kauthar every morning but has never learned what it means. According to how this surah is assessed, what is ${who} missing?`,
      correct: "Explaining the surah's meaning and applying its lessons in life, not just reciting the words",
      wrong: [
        "Nothing — recitation alone is all that is ever required",
        "Memorising the number of letters in the surah",
        "Reciting it in a louder voice than before",
      ],
      explanation: "The assessment for the selected surah rewards reading, reciting, AND explaining the meaning, plus deducing and applying lessons — recitation alone is not the full expectation.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s neighbour in ${place(rng)} says that only wealthy people can ever receive 'Kauthar' (abundance) from Allah. Evaluate this claim using the surah's teaching.`,
    correct: "Flawed — Kauthar in this surah refers to the abundant good Allah gave the Prophet (S.A.W.), which is broader than material wealth and can be given to anyone",
    wrong: [
      "Sound — Kauthar in this surah is defined strictly as personal wealth",
      "Sound — only the Prophet (S.A.W.) was ever capable of receiving Kauthar",
      "Flawed — Kauthar actually refers only to poverty, the opposite of wealth",
    ],
    explanation: "Al-Kauthar's 'abundance' includes honour, blessing, and lasting good, not material wealth alone — the surah's lesson is about Allah's generosity in general.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A friend comforts ${who} in ${place(rng)} after an unfair insult, saying "Allah's support outweighs any insult." Which surah's lesson is being applied here?`,
      correct: "Al-Kauthar — it was revealed to comfort the Prophet (S.A.W.) against mockery by promising him abundant blessing from Allah",
      wrong: [
        "A surah with no connection to being insulted or mocked",
        "Al-Kauthar, but only because it is the shortest surah, not because of its meaning",
        "A surah about sacrifice only, unrelated to comfort during hardship",
      ],
      explanation: "Al-Kauthar directly addresses being mocked, promising that Allah's abundant blessing outweighs any insult from an enemy.",
    };
  },
];

export const alKauthar: Skill = {
  id: "g5-ire-qu-al-kauthar",
  code: "QU.1",
  subjectId: "ire",
  strandId: "g5-ire-quran",
  grade: 5,
  title: "Surah Al-Kauthar",
  description: "Surah Al-Kauthar: the shortest surah in the Qur'an, revealed to comfort the Prophet (S.A.W.) with the promise of abundant blessing, and its lessons on gratitude, prayer, and sacrifice.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, LEARNING_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "these steps for learning Surah Al-Kauthar"),
        instruction: "Click them in order, from first listening to the surah to applying its lessons.",
        items,
        correctOrder: LEARNING_STEPS.map((s) => s.id),
        hint: "Learning a surah starts with listening and reciting, and ends with understanding and applying its meaning.",
        explanation: LEARNING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const context = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "context")).slice(0, 3);
      const lesson = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "lesson")).slice(0, 3);
      const chosen = shuffle(rng, [...meaning, ...context, ...lesson]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which aspect of Surah Al-Kauthar it describes"),
        items,
        buckets: (["meaning", "context", "lesson"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements explain what the surah means, some explain why it was revealed, and some are lessons drawn from it.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "term or phrase from Surah Al-Kauthar to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term or phrase from Al-Kauthar refers to.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about how Al-Kauthar's message of abundance, prayer, and sacrifice applies to the situation described.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Surah Al-Kauthar has", after: "verses.", answer: "three", accepted: ["three", "3"] },
      { before: "Al-Kauthar means", after: ".", answer: "abundance", accepted: ["abundance", "abundant good"] },
      { before: "Surah Al-Kauthar instructs the Prophet (S.A.W.) to pray and offer", after: ".", answer: "sacrifice", accepted: ["sacrifice"] },
      { before: "According to Al-Kauthar, it is the one who", after: "the Prophet who is truly cut off.", answer: "hates", accepted: ["hates"] },
      { before: "Surah Al-Kauthar was revealed in the city of", after: ".", answer: "Makkah", accepted: ["makkah", "mecca"] },
      { before: "Al-Kauthar is the", after: "surah in the Qur'an.", answer: "shortest", accepted: ["shortest"] },
      { before: "One meaning given for Al-Kauthar is a", after: "in Paradise given to the Prophet (S.A.W.).", answer: "river", accepted: ["river"] },
      { before: "Surah Al-Kauthar teaches a Muslim to respond to blessings with prayer and", after: ".", answer: "sacrifice", accepted: ["sacrifice"] },
      { before: "The surah was revealed to comfort the Prophet (S.A.W.) after he lost his", after: ".", answer: "sons", accepted: ["sons"] },
      { before: "Al-Kauthar teaches that Allah's blessing outweighs any", after: "from an enemy.", answer: "insult", accepted: ["insult", "insults"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the meaning of Al-Kauthar, why it was revealed, and its lessons on prayer and sacrifice.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
