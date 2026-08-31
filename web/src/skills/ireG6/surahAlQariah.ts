import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The surah's own verse-by-verse flow (Q.101:1-11) is explicit, curriculum-endorsed sequential
// content, not an invented order: the two rhetorical questions naming Al-Qariah, the description
// of that Day, then the two outcomes of the scales and the description of Hawiyah.
const ORDER_PROMPTS = [
  "Arrange the parts of Surah Al-Qariah (Q.101:1-11) in the order they appear.",
  "Put these parts of Surah Al-Qariah into the order they appear.",
  "Sequence these parts of Surah Al-Qariah correctly, from first to last.",
  "Order these parts of Surah Al-Qariah as they appear in the surah.",
  "Sort these parts of Surah Al-Qariah into the order they occur.",
  "Arrange these moments of Surah Al-Qariah in the order they appear.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Surah Al-Qariah it describes.",
  "Group each statement under the part of Surah Al-Qariah it describes.",
  "Decide which part of Surah Al-Qariah each statement describes, and sort it there.",
  "Sort each fact into the part of Surah Al-Qariah it belongs to.",
  "Place each statement under the part of the surah it describes.",
  "Read each statement and sort it under the matching part of Surah Al-Qariah.",
];

const MATCH_PROMPTS = [
  "Match each term from Surah Al-Qariah to its meaning.",
  "Pair each term from Surah Al-Qariah with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from Surah Al-Qariah to the definition that fits it.",
  "Choose the correct meaning for each term from Surah Al-Qariah.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const QARIAH_SEQUENCE = [
  { id: "name-qariah", label: "Opens naming 'Al-Qariah' (the Striking Calamity) and asking rhetorically 'What is the Striking Calamity?'" },
  { id: "emphasis", label: "Asks again, emphasising its enormity: 'And what can make you know what the Striking Calamity is?'" },
  { id: "moths", label: "Describes the Day: people will be like scattered moths, confused and disoriented" },
  { id: "wool", label: "The mountains will be like carded, fluffed wool — light and blown about" },
  { id: "heavy-scale", label: "Whoever's scale of good deeds is heavy will be in a pleasant, satisfying life" },
  { id: "light-scale", label: "Whoever's scale of good deeds is light — their refuge will be Hawiyah" },
  { id: "hawiyah-fire", label: "Hawiyah is described as a blazing, scorching fire" },
];

interface TopicFact {
  text: string;
  topic: "qariah" | "scales" | "hawiyah";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  qariah: "Al-Qariah and the description of that Day",
  scales: "The scales (mizan) of deeds",
  hawiyah: "The description of Hawiyah",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Surah Al-Qariah opens by naming 'Al-Qariah,' the Striking Calamity — a name for the Day of Judgement", topic: "qariah" },
  { text: "The surah asks rhetorically, 'What is the Striking Calamity?'", topic: "qariah" },
  { text: "It asks again for emphasis: 'And what can make you know what the Striking Calamity is?'", topic: "qariah" },
  { text: "On that Day, people will be like scattered moths — confused and disoriented", topic: "qariah" },
  { text: "On that Day, the mountains will be like carded wool — light and blown about", topic: "qariah" },
  { text: "Every person's outcome on that Day depends on the weight of their scale (mizan) of deeds", topic: "scales" },
  { text: "Whoever's scale of good deeds is heavy will be in a pleasant, satisfying life", topic: "scales" },
  { text: "Whoever's scale of good deeds is light will not receive that pleasant outcome", topic: "scales" },
  { text: "The scales show that this life's deeds are directly weighed and measured on that Day", topic: "scales" },
  { text: "Whoever's scale is light, their refuge/abode will be Hawiyah", topic: "hawiyah" },
  { text: "Hawiyah is a bottomless pit, a name for the Fire", topic: "hawiyah" },
  { text: "Hawiyah is described as a blazing, scorching fire", topic: "hawiyah" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Al-Qariah", meaning: "The Striking Calamity — the surah's name, referring to the Day of Judgement" },
  { term: "Mizan", meaning: "The scale that weighs each person's deeds on the Day of Judgement" },
  { term: "Hawiyah", meaning: "A bottomless pit, a name for the Fire — the refuge of whoever's scale of good deeds is light" },
  { term: "'Scattered moths'", meaning: "The surah's description of how confused and disoriented people will be on that Day" },
  { term: "'Carded wool'", meaning: "The surah's description of the mountains on that Day — light, weightless, blown about" },
  { term: "Heavy scale", meaning: "The outcome of having many good deeds, leading to a pleasant, satisfying life" },
  { term: "Light scale", meaning: "The outcome of having few good deeds, leading to Hawiyah" },
  { term: "Surah Al-Qariah", meaning: "Chapter 101 of the Qur'an, with 11 verses, describing the Day of Judgement" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, decides to help with chores at home only occasionally, telling herself she will become more helpful "someday, once she is older." Applying Surah Al-Qariah's teaching about the scales, what is the flaw in this thinking?`,
    correct: "Every deed is weighed on the scale, so consistently doing good now matters — delaying good habits wastes the chance to build a heavier scale",
    wrong: [
      "There is no flaw, since the scales only begin counting deeds done after adulthood",
      "The flaw is only that she should do all her chores in one single day to make up for it",
      "The flaw is that the scales described in the surah are symbolic and do not apply to real behaviour",
    ],
    explanation: "The surah's picture of the mizan (scale) is meant to motivate consistent good deeds now, since every deed is weighed — not a reason to delay building good habits.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that only one very large good deed, like a big donation, can make their scale heavy, while small daily deeds like greeting people kindly do not matter. Evaluate this claim using Surah Al-Qariah.`,
      correct: "Flawed — the surah describes deeds being weighed on a scale, meaning small, consistent good deeds also add real weight, not only large ones",
      wrong: [
        "Sound — the surah specifically states that only large, dramatic deeds are ever weighed",
        "Sound — small deeds like kind greetings are excluded from the scale by name in the surah",
        "Flawed — but only because large donations are actually excluded from the scale entirely",
      ],
      explanation: "The surah's picture of weighing deeds does not distinguish 'big' from 'small' good deeds — everything genuinely done is placed on the scale.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} experiences a heavy storm that uproots trees and feels frightened, then recalls Surah Al-Qariah's description of mountains becoming like carded wool. What is the best lesson to draw from this connection?`,
    correct: "Even something as stable as mountains will completely lose their fixed order on the Day of Judgement, a reminder not to be overly attached to worldly stability",
    wrong: [
      "That ordinary storms are themselves a sign that the Day of Judgement has already begun",
      "That the surah's description is only meant to explain natural weather patterns",
      "That mountains and storms have no connection to the surah's actual meaning",
    ],
    explanation: "The surah's imagery of mountains like carded wool illustrates the total upheaval of the natural order on that Day — a reminder used for reflection, not a claim about ordinary storms.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} worries that Surah Al-Qariah's description of the scales sounds frightening and wonders how it should shape daily behaviour. What is the most balanced response?`,
      correct: "Let it motivate consistent good deeds now, with hope, rather than causing despair or giving up",
      wrong: [
        "Become anxious and stop engaging in any deeds at all, since the outcome feels uncertain",
        "Ignore the teaching completely, since it is only meant to be frightening with no practical use",
        "Assume the outcome is already fixed regardless of behaviour, so effort makes no difference",
      ],
      explanation: "The surah's picture of the scales is meant to motivate consistent good deeds while there is still time, not to cause despair or a sense that effort is pointless.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that Surah Al-Qariah's two rhetorical questions ('What is the Striking Calamity?') are simply filler with no real purpose. Is this reasoning sound?`,
    correct: "No — the repeated questions emphasise how immense and hard to fully grasp the Day of Judgement truly is",
    wrong: [
      "Yes — rhetorical questions in the Qur'an never carry emphasis or meaning",
      "Yes — the questions are answered immediately and add no weight to the surah",
      "No — but only because the questions are meant literally, expecting the reader to answer them aloud",
    ],
    explanation: "Asking 'What is the Striking Calamity?' and then intensifying it with 'what can make you know...' is a deliberate technique to stress how overwhelming that Day will be.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} helps an elderly neighbour carry water every day without ever telling anyone about it. Applying Surah Al-Qariah, how does this relate to the scales of deeds?`,
      correct: "Every genuine good deed, seen or unseen by others, is placed on the scale that determines the outcome described in the surah",
      wrong: [
        "It does not count at all, since the surah only weighs deeds that are publicly known",
        "It only counts if the neighbour later tells others about the help received",
        "It is irrelevant to the surah, since the scales apply only to religious rituals like prayer",
      ],
      explanation: "The surah's scale weighs genuine deeds regardless of whether other people know about them — quiet, consistent good deeds still add real weight.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that since the outcome depends on 'heavy' or 'light' scales, a person should try to do good deeds only right before something important, like an exam, rather than consistently. Evaluate this reasoning.`,
    correct: "Flawed — the surah gives no indication that timing before a specific event matters more than consistent good conduct over time",
    wrong: [
      "Sound — the surah specifically instructs doing good deeds only before important events",
      "Sound — deeds done long before an event are automatically removed from the scale",
      "Flawed — but only because exams are excluded from any connection to good deeds",
    ],
    explanation: "The surah describes deeds generally being weighed, with no basis for the idea that only deeds done near a particular event count — consistency is what builds a heavier scale.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why Surah Al-Qariah describes Hawiyah only briefly, as a blazing fire, rather than in extended detail. What is the most reasonable purpose of this brief description for a Grade 6 learner?`,
    correct: "To state the consequence clearly as a motivation to do good deeds now, without dwelling on frightening detail",
    wrong: [
      "To hide the seriousness of the outcome from the reader entirely",
      "To suggest that Hawiyah is not a real consequence, only a metaphor with no meaning",
      "To imply that the description is unfinished and incomplete in the Qur'an",
    ],
    explanation: "The surah states Hawiyah's outcome briefly and matter-of-factly — enough to underline the seriousness of the choice, without excessive or frightening detail.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that since the Day described in Surah Al-Qariah is still far in the future, there is no urgency to do good deeds yet. Is this a fair conclusion from the surah?`,
      correct: "No — the surah's vivid description of that Day is meant to motivate good deeds now, precisely because the timing of death and that Day are not known in advance",
      wrong: [
        "Yes — the surah states a specific future date, so no urgency exists until then",
        "Yes — good deeds only need to begin once a person becomes an adult",
        "No — but only because the surah requires good deeds solely during the month of Ramadan",
      ],
      explanation: "The surah's urgent, vivid imagery is meant to prompt consistent good deeds now, since neither death nor the Day of Judgement's timing is known in advance.",
    };
  },
];

export const surahAlQariah: Skill = {
  id: "g6-ire-qu-al-qariah",
  code: "QU.4",
  subjectId: "ire",
  strandId: "g6-ire-quran",
  grade: 6,
  title: "Surah Al-Qariah",
  description: "The meaning and teachings of Surah Al-Qariah (Q.101:1-11): the Striking Calamity, the total upheaval of that Day, and the two outcomes determined by the scales of deeds — a pleasant life or Hawiyah.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, QARIAH_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the opening question to the description of Hawiyah.",
        items,
        correctOrder: QARIAH_SEQUENCE.map((d) => d.id),
        hint: "It opens by naming and questioning Al-Qariah, then describes that Day, then the two outcomes of the scales.",
        explanation: QARIAH_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const qariah = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "qariah")).slice(0, 3);
      const scales = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "scales")).slice(0, 3);
      const hawiyah = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "hawiyah")).slice(0, 3);
      const chosen = shuffle(rng, [...qariah, ...scales, ...hawiyah]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["qariah", "scales", "hawiyah"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements describe Al-Qariah and that Day, some describe the scales of deeds, and some describe Hawiyah.",
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
        hint: "Think about what each term refers to in the surah's description of the Day of Judgement.",
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
        hint: "Think about which teaching of Surah Al-Qariah the situation is actually applying.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Surah Al-Qariah opens by naming Al-Qariah, the Striking", after: ".", answer: "Calamity", accepted: ["calamity"] },
      { before: "On that Day, people will be like scattered", after: ".", answer: "moths", accepted: ["moths"] },
      { before: "The mountains will be like carded, fluffed", after: ".", answer: "wool", accepted: ["wool"] },
      { before: "Every person's outcome depends on the weight of their scale, also called the", after: ".", answer: "mizan", accepted: ["mizan", "scale"] },
      { before: "Whoever's scale of good deeds is heavy will be in a pleasant, satisfying", after: ".", answer: "life", accepted: ["life"] },
      { before: "Whoever's scale of good deeds is light, their refuge will be", after: ".", answer: "Hawiyah", accepted: ["hawiyah"] },
      { before: "Hawiyah is described as a bottomless", after: ", a name for the Fire.", answer: "pit", accepted: ["pit"] },
      { before: "Hawiyah is described as a blazing, scorching", after: ".", answer: "fire", accepted: ["fire"] },
      { before: "Surah Al-Qariah is chapter number", after: "of the Qur'an.", answer: "101", accepted: ["101"] },
      { before: "Surah Al-Qariah has", after: "verses in total.", answer: "11", accepted: ["11", "eleven"] },
      { before: "Al-Qariah is a name for the Day of", after: ".", answer: "Judgement", accepted: ["judgement", "judgment"] },
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
      hint: "Recall the description of that Day and the two outcomes of the scales in Surah Al-Qariah.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
