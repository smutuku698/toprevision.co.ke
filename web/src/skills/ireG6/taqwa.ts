import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists for this sub-strand, so the ordering branch uses a
// curriculum-reasonable real-world sequence: steps for building up taqwa in daily life.
const ORDER_PROMPTS = [
  "Arrange these steps for building taqwa in daily life in a sensible order.",
  "Put these steps for growing in God-consciousness into a sensible order.",
  "Sequence these steps for practising taqwa, from first to last.",
  "Order these steps for developing taqwa in everyday choices.",
  "Sort these steps for building taqwa into a sensible order.",
  "Arrange these steps for growing in taqwa in the order they build on each other.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of taqwa it describes.",
  "Group each statement under the aspect of taqwa it describes.",
  "Decide which aspect of taqwa each statement describes, and sort it there.",
  "Sort each fact into the aspect of taqwa it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of taqwa.",
];

const MATCH_PROMPTS = [
  "Match each quality of a muttaqi (pious person) to what it means.",
  "Pair each quality with the meaning that fits it.",
  "Connect each quality below to what it means.",
  "Match each quality to its correct meaning.",
  "Link each quality to the description that fits it.",
  "Choose the correct meaning for each quality of a muttaqi.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const TAQWA_STEPS = [
  { id: "believe-unseen", label: "Believe firmly in Allah (S.W.T.) and the Hereafter, even though they cannot be seen" },
  { id: "establish-prayer", label: "Establish regular prayer (swalah) as a daily reminder of Allah's presence" },
  { id: "give-charity", label: "Give in charity from what Allah has provided, even in small amounts" },
  { id: "seek-forgiveness", label: "Seek Allah's forgiveness quickly whenever a mistake is made" },
  { id: "restrain-anger", label: "Restrain anger and forgive others rather than reacting harshly" },
];

interface TopicFact {
  text: string;
  topic: "meaning" | "qualities" | "significance";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  meaning: "What taqwa means",
  qualities: "Qualities of a muttaqi (pious person)",
  significance: "Why taqwa matters",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Taqwa means constant awareness of Allah (S.W.T.), doing good and avoiding wrong whether or not anyone is watching", topic: "meaning" },
  { text: "A person with taqwa is called a muttaqi (plural: muttaqiin)", topic: "meaning" },
  { text: "Taqwa is an inner quality that shapes a person's outward behaviour, not just occasional worship", topic: "meaning" },
  { text: "A muttaqi believes firmly in Allah (S.W.T.) and the Hereafter, even though they are unseen", topic: "qualities" },
  { text: "A muttaqi establishes regular prayer as part of daily life", topic: "qualities" },
  { text: "A muttaqi gives in charity from what Allah has provided them", topic: "qualities" },
  { text: "A muttaqi is quick to seek Allah's forgiveness whenever they make a mistake", topic: "qualities" },
  { text: "A muttaqi restrains their anger and forgives other people", topic: "qualities" },
  { text: "Taqwa is described in the Qur'an as a pre-condition for true success in this life and the Hereafter", topic: "significance" },
  { text: "Practising taqwa shows up in everyday choices, such as honesty when no one is watching", topic: "significance" },
  { text: "Taqwa connects worship (like prayer and charity) with everyday character (like controlling anger)", topic: "significance" },
  { text: "A Muslim who genuinely practises taqwa behaves the same whether alone or in front of others", topic: "significance" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Taqwa", meaning: "God-consciousness — a constant awareness of Allah that leads a person to do good and avoid wrong" },
  { term: "Muttaqi", meaning: "A pious, God-conscious person who practises taqwa" },
  { term: "Muttaqiin", meaning: "The plural of muttaqi — pious, God-conscious people" },
  { term: "Restraining anger", meaning: "One of the qualities of a muttaqi named in the Qur'an" },
  { term: "Seeking forgiveness", meaning: "Quickly turning back to Allah after making a mistake, a quality of a muttaqi" },
  { term: "Belief in the unseen", meaning: "Firm faith in Allah (S.W.T.) and the Hereafter, though they cannot be seen" },
  { term: "Charity from provision", meaning: "Giving to others from what Allah has provided, a quality of a muttaqi" },
  { term: "Success in the Hereafter", meaning: "What the Qur'an says taqwa is a pre-condition for, alongside success in this life" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, finds money on the classroom floor when no one else is around. Applying the meaning of taqwa, what should ${who} do?`,
      correct: "Try to return it to its owner, since taqwa means doing what is right even when nobody is watching",
      wrong: [
        "Keep it, since taqwa only matters during prayer times",
        "Keep it if no one asks about it within a day",
        "Ask a friend whether keeping it is acceptable before deciding",
      ],
      explanation: "Taqwa means constant awareness of Allah that shapes behaviour whether or not anyone else is watching — exactly the situation of finding unattended money.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} becomes extremely angry when a friend accidentally breaks their favourite item. Applying the quality of restraining anger, what should ${who} do?`,
      correct: "Control the anger and respond calmly, since restraining anger is one of the named qualities of a muttaqi",
      wrong: [
        "React with as much anger as possible, since taqwa does not concern emotions",
        "End the friendship immediately without discussion",
        "Ignore the friend completely until they apologise first",
      ],
      explanation: "The Qur'an names restraining anger as a quality of a muttaqi — controlling one's reaction in a moment of frustration is a direct application of taqwa.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} makes a mistake by speaking rudely to a family member. Applying the quality of seeking forgiveness quickly, what is the best response?`,
    correct: "Apologise and seek forgiveness soon after realising the mistake, rather than letting it go unaddressed",
    wrong: [
      "Wait as long as possible before apologising, since delay shows more sincerity",
      "Avoid apologising at all, since mistakes do not require any response",
      "Apologise only if directly confronted about it",
    ],
    explanation: "A muttaqi is described as being quick to seek forgiveness after a mistake — prompt, genuine apology reflects this quality.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} donates a small amount from their limited pocket money to a classmate in need, even though it is not much. Applying the qualities of a muttaqi, how should this act be understood?`,
      correct: "As a genuine expression of taqwa — giving in charity from what one has, even in small amounts, is one of a muttaqi's qualities",
      wrong: [
        "As meaningless, since charity from a muttaqi must always be a large amount",
        "As unrelated to taqwa, since taqwa is only about prayer",
        "As a mistake, since a muttaqi should never give away limited resources",
      ],
      explanation: "The Qur'an describes a muttaqi as giving in charity from what Allah has provided, regardless of the amount — even a small, sincere gift reflects this quality.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that taqwa only matters during formal worship like prayer, and has nothing to do with how a person behaves the rest of the day. Evaluate this reasoning.`,
    correct: "Flawed — taqwa is described as constant awareness of Allah shaping all behaviour, not something limited to formal worship moments",
    wrong: [
      "Sound — taqwa applies only during the five daily prayers",
      "Sound — the Qur'an's list of a muttaqi's qualities is entirely about worship rituals",
      "Flawed — taqwa actually has nothing to do with worship at all",
    ],
    explanation: "The Qur'an's qualities of a muttaqi include everyday behaviour — restraining anger, forgiving others, quick repentance — showing taqwa extends well beyond formal worship.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why the Qur'an describes taqwa as a pre-condition for success, rather than just a nice quality to have. What is the best explanation?`,
      correct: "Because taqwa shapes consistent, sincere good conduct in both this life and preparation for the Hereafter, which the Qur'an ties directly to true success",
      wrong: [
        "Because taqwa guarantees wealth in this life regardless of effort",
        "Because taqwa is only relevant to religious scholars, not ordinary success",
        "Because the term 'success' in this context refers only to passing exams",
      ],
      explanation: "The Qur'an frames taqwa as foundational to genuine success — consistent, sincere good conduct — in both worldly life and the Hereafter, not a minor extra quality.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says a person can have taqwa just by praying five times a day, even if they are dishonest and unkind the rest of the time. Is this a correct understanding of taqwa?`,
    correct: "No — taqwa includes qualities like honesty, restraining anger, and forgiving others alongside worship, not worship alone",
    wrong: [
      "Yes — prayer alone fully defines taqwa with no other requirement",
      "Yes — the Qur'an's description of a muttaqi mentions only prayer",
      "No — taqwa actually has nothing to do with prayer at all",
    ],
    explanation: "The Qur'an's description of a muttaqi combines worship (prayer, charity) with character (restraining anger, forgiving, seeking forgiveness) — both matter together.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} keeps a weekly diary noting moments when they chose to be honest, patient, or generous, even when it was difficult. What is this practice an example of, as suggested in the design of this sub-strand?`,
      correct: "A practical way to track and build taqwa by reflecting on real, everyday demonstrations of it",
      wrong: [
        "A form of showing off, since taqwa should never be recorded anywhere",
        "An activity unrelated to taqwa, since taqwa cannot be reflected on in writing",
        "A requirement of Islamic law, rather than a helpful personal habit",
      ],
      explanation: "Keeping a log/diary of activities that demonstrate taqwa is a suggested way to reflect on and build this quality in daily life, matching the sub-strand's own learning experience.",
    };
  },
];

export const taqwa: Skill = {
  id: "g6-ire-pi-taqwa",
  code: "PI.3",
  subjectId: "ire",
  strandId: "g6-ire-iman",
  grade: 6,
  title: "Taqwa (God Consciousness)",
  description: "Taqwa (God-consciousness): the qualities of a muttaqi (pious person) — belief in the unseen, prayer, charity, seeking forgiveness, and restraining anger — and why taqwa is a pre-condition for success.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, TAQWA_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in a sensible order for building taqwa.",
        items,
        correctOrder: TAQWA_STEPS.map((s) => s.id),
        hint: "Taqwa starts with belief, is practised through worship and giving, and is maintained through repentance and self-control.",
        explanation: TAQWA_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const qualities = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "qualities")).slice(0, 3);
      const significance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "significance")).slice(0, 3);
      const chosen = shuffle(rng, [...meaning, ...qualities, ...significance]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["meaning", "qualities", "significance"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about what taqwa means, some about a muttaqi's qualities, and some about why it matters.",
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
        hint: "Think about what each term refers to in the qualities of taqwa.",
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
        hint: "Think about which quality of taqwa the situation is asking about.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Taqwa means constant awareness of", after: ".", answer: "Allah", accepted: ["allah"] },
      { before: "A pious person who practises taqwa is called a", after: ".", answer: "muttaqi", accepted: ["muttaqi"] },
      { before: "A muttaqi believes firmly in Allah and the", after: ", even though they are unseen.", answer: "Hereafter", accepted: ["hereafter"] },
      { before: "A muttaqi gives in", after: "from what Allah has provided them.", answer: "charity", accepted: ["charity"] },
      { before: "A muttaqi is quick to seek Allah's", after: "whenever they make a mistake.", answer: "forgiveness", accepted: ["forgiveness"] },
      { before: "A muttaqi restrains their", after: "and forgives other people.", answer: "anger", accepted: ["anger"] },
      { before: "The Qur'an describes taqwa as a pre-condition for", after: "in this life and the Hereafter.", answer: "success", accepted: ["success"] },
      { before: "Taqwa shapes a person's outward", after: ", not just their worship.", answer: "behaviour", accepted: ["behaviour", "behavior"] },
      { before: "A person practising taqwa behaves the same whether alone or in front of", after: ".", answer: "others", accepted: ["others"] },
      { before: "Establishing regular prayer is one of the qualities of a", after: ".", answer: "muttaqi", accepted: ["muttaqi"] },
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
      hint: "Recall the meaning of taqwa and the qualities of a muttaqi.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
