import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The surah's own verse-by-verse flow (Q.103:1-3) is explicit, curriculum-endorsed sequential
// content, not an invented order: the oath by time, the declaration of loss, then the four
// conditions of the exception in the order the single closing verse names them.
const ORDER_PROMPTS = [
  "Arrange the parts of Surah Al-Asr (Q.103:1-3) in the order they appear.",
  "Put these parts of Surah Al-Asr into the order they appear.",
  "Sequence these parts of Surah Al-Asr correctly, from first to last.",
  "Order these parts of Surah Al-Asr as they appear in the surah.",
  "Sort these parts of Surah Al-Asr into the order they occur.",
  "Arrange these moments of Surah Al-Asr in the order they appear.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Surah Al-Asr it describes.",
  "Group each statement under the part of Surah Al-Asr it describes.",
  "Decide which part of Surah Al-Asr each statement describes, and sort it there.",
  "Sort each fact into the part of Surah Al-Asr it belongs to.",
  "Place each statement under the part of the surah it describes.",
  "Read each statement and sort it under the matching part of Surah Al-Asr.",
];

const MATCH_PROMPTS = [
  "Match each term from Surah Al-Asr to its meaning.",
  "Pair each term from Surah Al-Asr with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from Surah Al-Asr to the definition that fits it.",
  "Choose the correct meaning for each term from Surah Al-Asr.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const ASR_SEQUENCE = [
  { id: "oath", label: "Allah swears by Al-Asr — time, or the declining day" },
  { id: "loss", label: "Declares that mankind, in general, is in a state of loss" },
  { id: "exc-believe", label: "Except those who believe" },
  { id: "exc-deeds", label: "And do righteous, good deeds" },
  { id: "exc-truth", label: "And advise/counsel one another to truth" },
  { id: "exc-patience", label: "And advise/counsel one another to patience (sabr)" },
];

interface TopicFact {
  text: string;
  topic: "oath" | "faith-deeds" | "advising";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  oath: "The oath by time and the declaration of loss",
  "faith-deeds": "Belief and righteous deeds",
  advising: "Advising one another to truth and patience",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Surah Al-Asr opens with Allah swearing by Al-Asr, meaning time or the declining day", topic: "oath" },
  { text: "The surah is one of the shortest in the Qur'an, with only three verses", topic: "oath" },
  { text: "It declares that mankind, in general, is in a state of loss", topic: "oath" },
  { text: "This loss applies to everyone except those who meet four conditions together", topic: "oath" },
  { text: "The first condition to avoid loss is true belief (iman)", topic: "faith-deeds" },
  { text: "The second condition is doing righteous, good deeds", topic: "faith-deeds" },
  { text: "Belief alone is not enough — it must be paired with good deeds", topic: "faith-deeds" },
  { text: "Faith and good deeds together form the personal half of the surah's four conditions", topic: "faith-deeds" },
  { text: "The third condition is advising/counselling one another to truth", topic: "advising" },
  { text: "The fourth condition is advising/counselling one another to patience (sabr)", topic: "advising" },
  { text: "These last two conditions show that avoiding loss is not something a Muslim does totally alone", topic: "advising" },
  { text: "Mutual encouragement and reminding each other is part of a healthy Muslim community, not something to skip", topic: "advising" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Al-Asr", meaning: "Time, or the declining day — what Allah swears by at the start of the surah, and the surah's name" },
  { term: "Khusr (loss)", meaning: "The state the surah says mankind is in, except for those who meet four conditions" },
  { term: "Iman", meaning: "Belief/faith — the first of the surah's four conditions for avoiding loss" },
  { term: "Righteous deeds", meaning: "Good deeds — the second condition, which must be paired with belief" },
  { term: "Advising to truth", meaning: "The third condition — counselling one another toward what is true and right" },
  { term: "Advising to patience", meaning: "The fourth condition — counselling one another toward patience (sabr)" },
  { term: "Sabr", meaning: "Patience — the specific virtue named in the surah's fourth condition" },
  { term: "Surah Al-Asr", meaning: "Chapter 103 of the Qur'an, one of the shortest, with only 3 verses" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, spends every evening scrolling videos instead of revising, telling herself she can always make up the lost time later. Applying Surah Al-Asr, what is the flaw in this thinking?`,
    correct: "Time passes whether it is used well or not, so treating lost time as something that can simply be 'made up later' ignores the surah's warning",
    wrong: [
      "There is no flaw, since the surah only concerns adults managing work time, not learners revising",
      "The flaw is only that she watches videos, since any other distraction would be acceptable",
      "The flaw is that she should stop resting completely, since the surah forbids all rest",
    ],
    explanation: "Al-Asr's oath by time highlights that time is precious and passes regardless of how it is used — assuming lost time can always be recovered misses that warning.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that having strong faith is enough on its own, and that doing good deeds is optional. Applying Surah Al-Asr's four conditions, evaluate this claim.`,
      correct: "Flawed — the surah pairs belief with righteous deeds as two separate, necessary conditions, not one substituting for the other",
      wrong: [
        "Sound — the surah lists belief as the only condition that truly matters",
        "Sound — righteous deeds are mentioned only as an example of belief, not as a separate requirement",
        "Flawed — but only because the surah actually requires good deeds alone, without belief",
      ],
      explanation: "The surah names four conditions together: belief, righteous deeds, advising to truth, and advising to patience — belief alone does not fulfil all four.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices a friend copying answers during a test but says nothing, reasoning that correcting a friend is none of their business. Applying Surah Al-Asr's condition of advising one another to truth, what should they do instead?`,
    correct: "Gently advise the friend against copying, since advising one another to truth is one of the surah's four conditions for avoiding loss",
    wrong: [
      "Stay silent, since advising others to truth applies only to adults, not classmates",
      "Report the friend immediately without ever speaking to them first",
      "Copy along as well, since staying quiet about it makes it acceptable",
    ],
    explanation: "The surah's third condition — advising one another to truth — means a Muslim should not stay silent about wrongdoing among peers, but should offer gentle correction.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} loses their home in a flood, and a neighbour keeps reminding them to stay patient and trust that things will improve. Which condition of Surah Al-Asr does the neighbour's support best show?`,
      correct: "Advising one another to patience (sabr) — the surah's fourth condition for avoiding loss",
      wrong: [
        "Advising one another to truth, since patience and truth mean the same thing in the surah",
        "The oath by time, since reminders about time only concern schedules and deadlines",
        "Righteous deeds, since comforting words are not counted as advising at all",
      ],
      explanation: "Encouraging someone to stay patient during hardship is exactly the surah's fourth condition — advising one another to sabr (patience).",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that Surah Al-Asr's four conditions can be fulfilled entirely alone, with no need to interact with other people. Is this reasoning sound?`,
    correct: "No — the third and fourth conditions (advising one another to truth and patience) specifically require interacting with and supporting others",
    wrong: [
      "Yes — all four conditions describe a person's private belief and actions only",
      "Yes — advising others is only a suggestion in the surah, not one of the four conditions",
      "No — but only because righteous deeds must always be done in a group setting",
    ],
    explanation: "Two of the surah's four conditions are about mutual advising — to truth and to patience — which cannot be fulfilled in isolation from other people.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wastes an entire study weekend before exams, then works frantically the night before. Applying the surah's oath by Al-Asr, what lesson best applies?`,
      correct: "Time that has passed cannot be recovered, so it should be used wisely and consistently rather than wasted and then rushed",
      wrong: [
        "The oath by time has no practical lesson for how a learner studies",
        "It teaches that studying the night before is always the best strategy",
        "It teaches that time only matters during examinations, not on ordinary weekends",
      ],
      explanation: "Swearing by time (Al-Asr) points to how precious and irreversible time is — a reason to use it wisely and consistently, not waste it and rush later.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes correctly and prays regularly, but never encourages classmates who are struggling with schoolwork or personal problems. Which of the surah's conditions is this learner missing?`,
    correct: "Advising one another to patience — supporting and encouraging others through difficulty",
    wrong: [
      "Belief, since prayer alone does not count as true belief",
      "Righteous deeds, since prayer is not considered a righteous deed",
      "None — the surah only requires belief and righteous deeds from any individual Muslim",
    ],
    explanation: "Even strong personal belief and worship do not complete all four conditions — the surah also calls for actively encouraging others toward patience.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A classmate tells ${who} in ${place(rng)} that Surah Al-Asr's warning of loss applies only to non-believers, never to Muslims. Evaluate this claim.`,
      correct: "Flawed — the surah declares that all mankind is in loss except those who meet the four conditions, which is a standard every Muslim must still meet",
      wrong: [
        "Sound — Muslims are automatically exempt from the surah's warning regardless of their conduct",
        "Sound — the surah's warning is symbolic and was never meant to apply to real conduct",
        "Flawed — but only because the surah's warning applies exclusively to Muslims, not non-believers",
      ],
      explanation: "The surah's declaration of loss is general — 'mankind' — and the exception is conditional on genuinely meeting all four conditions, not simply on being Muslim by identity.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} helps a struggling classmate revise for a test and also reminds them not to give up when the material feels difficult. Which two of Surah Al-Asr's conditions does this best combine?`,
    correct: "Righteous deeds (helping with revision) and advising one another to patience (encouraging them not to give up)",
    wrong: [
      "Belief and the oath by time, since helping a classmate has nothing to do with either condition",
      "Advising to truth and advising to patience only, since helping with revision is not a righteous deed",
      "Belief alone, since all good actions are simply expressions of belief in the surah",
    ],
    explanation: "Helping with revision is a righteous deed, and encouraging perseverance is advising to patience — together they reflect two of the surah's four conditions.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the surah's mention of 'time' is just poetic language with no real meaning for daily life. Is this a fair reading of Surah Al-Asr?`,
    correct: "No — the oath by time introduces a real warning: that time passes and is easily lost unless a person actively lives by the surah's four conditions",
    wrong: [
      "Yes — oaths in the Qur'an are always purely poetic with no practical meaning",
      "Yes — the surah's real message begins only from its second verse onward",
      "No — but only because the surah is talking about the passage of seasons, not time in general",
    ],
    explanation: "The oath by Al-Asr sets up the surah's central warning about loss — it is a purposeful opening, not decoration, that frames how time should be used.",
  }),
];

export const surahAlAsr: Skill = {
  id: "g6-ire-qu-al-asr",
  code: "QU.2",
  subjectId: "ire",
  strandId: "g6-ire-quran",
  grade: 6,
  title: "Surah Al-Asr",
  description: "The meaning and teachings of Surah Al-Asr (Q.103:1-3): the oath by time, the declaration that mankind is in loss, and the four conditions for avoiding it — belief, righteous deeds, and advising one another to truth and to patience.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, ASR_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the opening oath to the fourth condition.",
        items,
        correctOrder: ASR_SEQUENCE.map((d) => d.id),
        hint: "It opens with the oath by time, then the declaration of loss, then the four conditions in the order the surah names them.",
        explanation: ASR_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const oath = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "oath")).slice(0, 3);
      const faithDeeds = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "faith-deeds")).slice(0, 3);
      const advising = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "advising")).slice(0, 3);
      const chosen = shuffle(rng, [...oath, ...faithDeeds, ...advising]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["oath", "faith-deeds", "advising"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the oath and the declaration of loss, some are about belief and deeds, and some are about advising others.",
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
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term refers to among the surah's oath, its warning of loss, and its four conditions.",
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
        hint: "Think about which of the surah's four conditions the situation is actually applying.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Surah Al-Asr opens with Allah swearing by", after: ", meaning time or the declining day.", answer: "Al-Asr", accepted: ["al-asr", "asr"] },
      { before: "The surah declares that mankind, in general, is in a state of", after: ".", answer: "loss", accepted: ["loss"] },
      { before: "The first condition for avoiding loss is true", after: ".", answer: "belief", accepted: ["belief", "faith", "iman"] },
      { before: "The second condition for avoiding loss is doing righteous, good", after: ".", answer: "deeds", accepted: ["deeds"] },
      { before: "The third condition is advising one another to", after: ".", answer: "truth", accepted: ["truth"] },
      { before: "The fourth condition is advising one another to patience, also called", after: ".", answer: "sabr", accepted: ["sabr", "patience"] },
      { before: "Surah Al-Asr is chapter number", after: "of the Qur'an.", answer: "103", accepted: ["103"] },
      { before: "Surah Al-Asr has only", after: "verses in total.", answer: "3", accepted: ["3", "three"] },
      { before: "Avoiding loss requires all four conditions together, not just", after: "alone.", answer: "one", accepted: ["one"] },
      { before: "Advising one another to truth and patience shows that avoiding loss is not something done", after: ".", answer: "alone", accepted: ["alone"] },
      { before: "Surah Al-Asr is one of the", after: "surahs in the Qur'an.", answer: "shortest", accepted: ["shortest"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the oath by time and the four conditions named in Surah Al-Asr.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
