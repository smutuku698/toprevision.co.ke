import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5IreShared";

// Grade 5 IRE — 1.1 Selected Surah: Al-Maun (Surah 107, 7 verses, "Small Kindnesses" / almsgiving).
// Content kept to well-established, general themes/meaning: charity, care for orphans and the needy, and
// a warning against neglecting prayer or showing off in worship — no verse-by-verse translation invented.

const LEARNING_STEPS = [
  { id: "listen", label: "Listen to the teacher or a digital device recite Surah Al-Maun" },
  { id: "recite-after", label: "Recite Surah Al-Maun after the teacher, a peer, or a digital device" },
  { id: "read", label: "Read Surah Al-Maun from a mus-haf, chart, or digital device" },
  { id: "pronounce", label: "Practise pronouncing the words correctly by listening carefully" },
  { id: "memorise", label: "Recite Surah Al-Maun several times to memorise it" },
  { id: "meaning", label: "Learn the basic meaning of Surah Al-Maun and make notes" },
  { id: "apply", label: "Discuss ways to apply the lessons of Surah Al-Maun in daily life" },
] as const;

type Topic = "meaning" | "warns-against" | "lesson";
const TOPIC_LABEL: Record<Topic, string> = {
  meaning: "The basic meaning of Al-Maun",
  "warns-against": "Behaviour Al-Maun warns against",
  lesson: "Lessons from Al-Maun",
};
const TOPIC_FACTS: { text: string; topic: Topic }[] = [
  { text: "Al-Maun means 'small kindnesses' — the everyday help and simple items neighbours lend one another", topic: "meaning" },
  { text: "Surah Al-Maun describes the one who denies the Day of Judgment through specific actions, not just words", topic: "meaning" },
  { text: "Al-Maun has seven verses and is also known by the name 'Small Kindnesses'", topic: "meaning" },
  { text: "The surah judges a person's faith partly by how they treat orphans, the needy, and their neighbours", topic: "meaning" },
  { text: "Al-Maun links true faith to concrete daily actions, not only inward belief", topic: "meaning" },
  { text: "The surah describes someone who repulses (mistreats) the orphan", topic: "warns-against" },
  { text: "The surah describes someone who does not urge or encourage the feeding of the needy", topic: "warns-against" },
  { text: "The surah describes people who are heedless and neglectful of their prayers", topic: "warns-against" },
  { text: "The surah describes people who pray only to be seen by others, not sincerely for Allah", topic: "warns-against" },
  { text: "The surah describes people who withhold small, everyday kindnesses from their neighbours", topic: "warns-against" },
  { text: "Al-Maun teaches a Muslim to treat orphans with kindness, not harshness", topic: "lesson" },
  { text: "Al-Maun teaches a Muslim to encourage feeding the poor and needy, not to ignore them", topic: "lesson" },
  { text: "Al-Maun teaches sincerity in prayer — worshipping for Allah's sake, not to impress others", topic: "lesson" },
  { text: "Al-Maun teaches that even small acts of help to neighbours matter in Islam", topic: "lesson" },
  { text: "Al-Maun teaches that neglecting prayer and showing off in worship are both serious faults", topic: "lesson" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Al-Maun", meaning: "Small kindnesses — everyday help and items neighbours lend one another" },
  { term: "Repulsing the orphan", meaning: "Treating an orphan harshly — one behaviour the surah names and condemns" },
  { term: "Not urging the feeding of the needy", meaning: "Failing to encourage others to feed the poor — another behaviour the surah names" },
  { term: "Heedless of prayer", meaning: "Being careless or neglectful about performing prayer" },
  { term: "Praying to be seen", meaning: "Showing off in worship (riya') instead of praying sincerely for Allah" },
  { term: "Withholding small kindnesses", meaning: "Refusing to lend everyday help or simple items to a neighbour" },
  { term: "Seven verses", meaning: "The length of Surah Al-Maun" },
  { term: "'Small Kindnesses'", meaning: "Another name Surah Al-Maun is known by" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sees a classmate who is an orphan being pushed aside and ignored during break time. According to Surah Al-Maun, how should ${who} respond?`,
      correct: "Treat the orphan with kindness and care, since mistreating orphans is one behaviour Al-Maun specifically condemns",
      wrong: [
        "Ignore the situation, since Al-Maun only discusses prayer, not how orphans are treated",
        "Join in pushing the orphan aside, since the surah does not actually mention orphans",
        "Report only if the orphan complains, since kindness to orphans is optional in Islam",
      ],
      explanation: "Al-Maun names 'repulsing the orphan' as a sign of one who denies the Day of Judgment — the honest response is kindness toward orphans, not indifference.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} prays carefully and sincerely at home, but rushes through prayer at school just so classmates will see the movements. What fault from Surah Al-Maun does this show?`,
      correct: "Praying to be seen (riya'), rather than sincerely for Allah — a fault the surah names directly",
      wrong: [
        "No fault at all, since praying in front of others is always sincere",
        "A fault about feeding the needy, unrelated to prayer",
        "A fault about neighbours, unrelated to prayer",
      ],
      explanation: "Al-Maun describes people who pray to be seen by others rather than sincerely for Allah — this is exactly the fault of rushing prayer for show.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says a neighbour is not obligated to lend even the smallest everyday item, like a cooking pot, when asked. Evaluate this claim using Surah Al-Maun.`,
    correct: "Flawed — the surah specifically condemns withholding small, everyday kindnesses from others",
    wrong: [
      "Sound — Al-Maun only discusses prayer, never neighbourly help",
      "Sound — lending items is discouraged in Islam according to this surah",
      "Flawed — but only large, expensive items are covered by the surah's warning",
    ],
    explanation: "Al-Maun ('small kindnesses') directly names withholding everyday assistance from others as a fault — even small items matter.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes strongly in the Day of Judgment but never encourages anyone to help feed needy families nearby. According to Al-Maun, is belief alone enough?`,
      correct: "No — the surah judges a person partly by concrete actions, like encouraging the feeding of the needy, not belief alone",
      wrong: [
        "Yes — belief in the Day of Judgment is the only thing Al-Maun discusses",
        "Yes — actions towards the needy are unrelated to faith in this surah",
        "No — but only wealthy people are expected to help feed the needy",
      ],
      explanation: "Al-Maun ties denial of the Day of Judgment to specific actions — including failing to urge the feeding of the needy — showing that faith is judged by actions too.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims Surah Al-Maun is only about prayer and has nothing to do with orphans or neighbours. Is this correct?`,
    correct: "No — the surah names mistreating orphans and withholding small kindnesses from neighbours, alongside faults in prayer",
    wrong: [
      "Yes — orphans and neighbours are never mentioned anywhere in the surah",
      "Yes — Al-Maun is exclusively about the five daily prayers",
      "No — but neighbours are mentioned while orphans are not",
    ],
    explanation: "Al-Maun names several faults together: mistreating the orphan, not urging feeding of the needy, neglecting or showing off in prayer, and withholding small kindnesses from neighbours.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps delaying and neglecting the five daily prayers, saying it does not matter as long as good deeds are done elsewhere. What does Al-Maun say about this attitude?`,
      correct: "Al-Maun names being heedless and neglectful of prayer as a serious fault, alongside other described behaviours",
      wrong: [
        "Al-Maun says prayer can always be replaced entirely by other good deeds",
        "Al-Maun does not mention prayer at all",
        "Al-Maun only condemns missing prayer completely, not delaying it",
      ],
      explanation: "Al-Maun explicitly describes people who are heedless of their prayers as showing a sign of denying the Day of Judgment — neglecting prayer is treated seriously.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} donates generously to charity in public specifically so people will praise their generosity. Which fault named in Al-Maun does this resemble most closely?`,
    correct: "Doing an act of worship or good deed to be seen by others, rather than sincerely for Allah",
    wrong: [
      "Withholding small kindnesses from neighbours, since this person is giving generously",
      "Mistreating an orphan, which is unrelated to public charity",
      "Neglecting prayer, since this scenario is about charity, not prayer directly",
    ],
    explanation: "While Al-Maun names 'praying to be seen,' the underlying fault — doing a good act to be seen and praised rather than sincerely for Allah — is the same principle the surah warns against.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked what makes Surah Al-Maun relevant to daily school life, not just religious ritual. What is the best answer?`,
      correct: "It teaches kindness to orphans, encouraging help for the needy, sincerity, and small everyday kindnesses to others — all daily-life behaviours",
      wrong: [
        "It is only relevant during formal religious ceremonies",
        "It has no connection to daily life, since it is only about prayer",
        "It only applies to adults, not learners in school",
      ],
      explanation: "Al-Maun's lessons — caring for orphans, encouraging charity, sincerity, and small kindnesses to neighbours — apply directly to everyday behaviour, including at school.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that as long as a person never openly denies the Day of Judgment in words, Al-Maun has nothing to say about them. Evaluate this claim.`,
    correct: "Flawed — the surah describes denial of the Day of Judgment through specific actions (mistreating orphans, neglecting prayer, withholding kindness), not just spoken denial",
    wrong: [
      "Sound — only spoken denial of the Day of Judgment matters in this surah",
      "Sound — actions are never connected to belief anywhere in the Qur'an",
      "Flawed — but the surah only applies to non-Muslims, not Muslims",
    ],
    explanation: "Al-Maun defines the 'denier of the Recompense' by a set of concrete actions, showing that harmful behaviour, not just spoken denial, is treated as a sign of weak faith.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class in ${place(rng)} is planning a small project to help a needy family and support a local orphan. Which surah's teaching does this project reflect most directly?`,
      correct: "Al-Maun — it names kindness to orphans and encouraging help for the needy as important behaviours",
      wrong: [
        "A surah with no connection to charity or care for others",
        "Al-Maun, but only because it is easy to memorise, not because of its meaning",
        "A surah about trade and business, unrelated to orphans or the needy",
      ],
      explanation: "Al-Maun directly names care for orphans and encouraging the feeding of the needy as behaviours a sincere believer practises.",
    };
  },
];

export const alMaun: Skill = {
  id: "g5-ire-qu-al-maun",
  code: "QU.2",
  subjectId: "ire",
  strandId: "g5-ire-quran",
  grade: 5,
  title: "Surah Al-Maun",
  description: "Surah Al-Maun ('Small Kindnesses'): the behaviours it warns against — mistreating orphans, neglecting the needy, careless or insincere prayer, and withholding small kindnesses — and its lessons for daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, LEARNING_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "these steps for learning Surah Al-Maun"),
        instruction: "Click them in order, from first listening to the surah to applying its lessons.",
        items,
        correctOrder: LEARNING_STEPS.map((s) => s.id),
        hint: "Learning a surah starts with listening and reciting, and ends with understanding and applying its meaning.",
        explanation: LEARNING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const warns = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "warns-against")).slice(0, 3);
      const lesson = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "lesson")).slice(0, 3);
      const chosen = shuffle(rng, [...meaning, ...warns, ...lesson]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which aspect of Surah Al-Maun it describes"),
        items,
        buckets: (["meaning", "warns-against", "lesson"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements explain what the surah means, some describe behaviour it warns against, and some are lessons drawn from it.",
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
        prompt: matchPrompt(rng, "term or phrase from Surah Al-Maun to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term or phrase from Al-Maun refers to.",
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
        hint: "Think about which behaviour Al-Maun names — orphans, the needy, sincerity in prayer, or small kindnesses.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Al-Maun means", after: ".", answer: "small kindnesses", accepted: ["small kindnesses", "small kindness"] },
      { before: "Surah Al-Maun has", after: "verses.", answer: "seven", accepted: ["seven", "7"] },
      { before: "Al-Maun describes someone who repulses the", after: ".", answer: "orphan", accepted: ["orphan"] },
      { before: "Al-Maun describes people who do not urge the feeding of the", after: ".", answer: "needy", accepted: ["needy", "poor"] },
      { before: "Al-Maun describes people who are heedless and neglectful of their", after: ".", answer: "prayers", accepted: ["prayers", "prayer"] },
      { before: "Al-Maun describes people who pray only to be", after: "by others.", answer: "seen", accepted: ["seen"] },
      { before: "Al-Maun describes people who withhold small kindnesses from their", after: ".", answer: "neighbours", accepted: ["neighbours", "neighbors"] },
      { before: "Al-Maun teaches sincerity in prayer, worshipping for Allah's sake and not to", after: "others.", answer: "impress", accepted: ["impress"] },
      { before: "Al-Maun is also known by the name 'Small", after: "'.", answer: "Kindnesses", accepted: ["kindnesses"] },
      { before: "Al-Maun teaches that faith is shown through concrete", after: ", not belief alone.", answer: "actions", accepted: ["actions"] },
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
      hint: "Recall the meaning of Al-Maun and the behaviours it names and warns against.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
