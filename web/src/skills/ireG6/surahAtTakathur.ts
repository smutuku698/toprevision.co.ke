import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The surah's own verse-by-verse flow (Q.102:1-8) is explicit, curriculum-endorsed sequential
// content, not an invented order: the rivalry that distracts until death, the twice-repeated
// warning, the point about certain knowledge, then the seeing of the Fire and the questioning.
const ORDER_PROMPTS = [
  "Arrange the parts of Surah At-Takathur (Q.102:1-8) in the order they appear.",
  "Put these parts of Surah At-Takathur into the order they appear.",
  "Sequence these parts of Surah At-Takathur correctly, from first to last.",
  "Order these parts of Surah At-Takathur as they appear in the surah.",
  "Sort these parts of Surah At-Takathur into the order they occur.",
  "Arrange these moments of Surah At-Takathur in the order they appear.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Surah At-Takathur it describes.",
  "Group each statement under the part of Surah At-Takathur it describes.",
  "Decide which part of Surah At-Takathur each statement describes, and sort it there.",
  "Sort each fact into the part of Surah At-Takathur it belongs to.",
  "Place each statement under the part of the surah it describes.",
  "Read each statement and sort it under the matching part of Surah At-Takathur.",
];

const MATCH_PROMPTS = [
  "Match each term from Surah At-Takathur to its meaning.",
  "Pair each term from Surah At-Takathur with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from Surah At-Takathur to the definition that fits it.",
  "Choose the correct meaning for each term from Surah At-Takathur.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const TAKATHUR_SEQUENCE = [
  { id: "rivalry", label: "Competition for increase (rivalry over wealth, children, or status) distracts people" },
  { id: "until-death", label: "This distraction continues until they 'visit the graveyards' — that is, until death" },
  { id: "warning1", label: "Warning: 'No! You are going to know' (said once)" },
  { id: "warning2", label: "The warning is repeated again: 'No! You are going to know'" },
  { id: "certain-knowledge", label: "If people knew with certain knowledge what awaits them, they would not be distracted by rivalry" },
  { id: "see-fire", label: "They will surely see the Hellfire" },
  { id: "eyewitness", label: "They will see it with certain, eye-witness sight" },
  { id: "questioned", label: "On that Day, people will be questioned about the pleasure and blessings they enjoyed" },
];

interface TopicFact {
  text: string;
  topic: "distraction" | "warning" | "accountability";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  distraction: "The distraction of worldly rivalry",
  warning: "The repeated warning and certain knowledge",
  accountability: "Seeing the Fire and being questioned",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Surah At-Takathur opens by describing 'competition for increase' — rivalry over wealth, children, or status", topic: "distraction" },
  { text: "This rivalry is described as something that distracts or diverts people", topic: "distraction" },
  { text: "The distraction is said to continue until people 'visit the graveyards' — that is, until death", topic: "distraction" },
  { text: "The surah shows how easily worldly competition can consume a person's entire life", topic: "distraction" },
  { text: "The surah repeats the warning 'No! You are going to know' twice, for emphasis", topic: "warning" },
  { text: "This repeated warning points to a coming accountability", topic: "warning" },
  { text: "The surah says that if people knew with certain knowledge what awaits them, they would not be distracted by rivalry", topic: "warning" },
  { text: "The warning shows that not truly grasping the Hereafter is what allows this distraction to continue", topic: "warning" },
  { text: "The surah states that people will surely see the Hellfire", topic: "accountability" },
  { text: "It says they will see it with certain, eye-witness sight — not merely hear about it", topic: "accountability" },
  { text: "On that Day, people will be questioned about the pleasure and blessings they enjoyed in life", topic: "accountability" },
  { text: "This questioning is about how blessings were used, not simply about having received them", topic: "accountability" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "At-Takathur", meaning: "Competition for increase/abundance — rivalry over wealth, children, followers, or status" },
  { term: "'Visit the graveyards'", meaning: "The surah's phrase for death, when worldly rivalry finally ends" },
  { term: "'No! You are going to know'", meaning: "The surah's repeated warning of a coming accountability" },
  { term: "Certain knowledge", meaning: "The sure knowledge that, if truly held, would stop people being distracted by rivalry" },
  { term: "The Hellfire (in this surah)", meaning: "What the surah says people will surely see" },
  { term: "Certain, eye-witness sight", meaning: "The way people will see the Hellfire, described in the surah as sure and direct, not distant" },
  { term: "The pleasure/blessings", meaning: "What people will be questioned about on the Day of Judgement — how they were used" },
  { term: "Surah At-Takathur", meaning: "Chapter 102 of the Qur'an, with 8 verses, about the distraction of worldly rivalry" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, constantly compares how many pairs of shoes classmates own, and feels their own worth depends on winning that comparison. Applying Surah At-Takathur, what is the flaw in this thinking?`,
    correct: "This kind of competition for possessions is exactly the distraction the surah warns against, which can consume attention that should go elsewhere",
    wrong: [
      "There is no flaw, since the surah only warns against competing over land and livestock, not shoes",
      "The flaw is only that it happens at school, since the same comparison at home is acceptable",
      "The flaw is that shoes are unimportant items, but competing over more valuable things would be fine",
    ],
    explanation: "At-Takathur's warning covers rivalry over possessions and status in general — the specific item does not change that this kind of comparison is the distraction being warned against.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps checking how many followers their family's social media page has and feels proud comparing it to neighbours' pages. Which teaching of Surah At-Takathur does this situation reflect?`,
      correct: "The surah's warning against 'competition for increase' — rivalry over numbers, whether wealth, followers, or status",
      wrong: [
        "The surah's teaching that using social media is itself forbidden",
        "The surah's description of certain, eye-witness sight, which applies only to seeing the Hellfire directly",
        "The surah's command to advise others to patience, which has no connection to online comparison",
      ],
      explanation: "Rivalry over numbers — whether wealth, children, or followers — is precisely the 'competition for increase' the surah opens by warning against.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} proudly compares the number of livestock they own to their neighbours every harvest season, rarely discussing anything else. Applying Surah At-Takathur, what should this comparison be balanced with?`,
    correct: "Remembering that life is temporary and that one Day people will be questioned about how they used their blessings",
    wrong: [
      "Nothing — the surah encourages unlimited competition over livestock as a sign of Allah's favour",
      "Comparing even more frequently, since the surah says more comparison brings more blessing",
      "Keeping the comparison private, since only public boasting is condemned by the surah",
    ],
    explanation: "The surah does not forbid having wealth, but it warns that letting rivalry over it dominate one's attention distracts from remembering death and the coming accountability.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} receives a new bicycle as a gift and wonders whether Surah At-Takathur has anything to say about how to treat it. What is the most accurate answer?`,
      correct: "The surah reminds that on the Day of Judgement, people will be questioned about how they used the blessings they enjoyed, including gifts like this",
      wrong: [
        "The surah says gifts like bicycles should be avoided entirely to prevent rivalry",
        "The surah has no connection to personal possessions at all, only to money",
        "The surah promises that owning a bicycle guarantees a place in Paradise",
      ],
      explanation: "The surah's closing point about being questioned over 'the pleasure/blessings' applies to how any blessing, including a gift, is used and enjoyed.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that since the surah's warning 'No! You are going to know' is repeated twice, it must just be a stylistic repetition with no real weight. Is this reasoning sound?`,
    correct: "No — the repetition emphasises how serious and certain the coming accountability is, not merely a stylistic choice",
    wrong: [
      "Yes — repeated verses in the Qur'an never carry extra emphasis",
      "Yes — the second repetition contradicts the first and cancels its warning",
      "No — but only because the second repetition refers to a completely different topic",
    ],
    explanation: "The twice-repeated warning is a deliberate emphasis, underlining how certain and serious the coming accountability is — not empty repetition.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that constantly ranking classmates' exam scores against each other is completely harmless competition with no link to Surah At-Takathur. Evaluate this claim.`,
    correct: "Partly flawed — healthy effort in schoolwork is fine, but if the ranking becomes an obsessive rivalry that distracts from remembering life's real purpose, it reflects the surah's warning",
    wrong: [
      "Fully sound — no form of competition is ever addressed by this surah",
      "Fully flawed — the surah forbids all forms of academic effort and ranking",
      "Fully sound — the surah's warning applies only to competition over money, never over grades or status",
    ],
    explanation: "The surah's warning is about rivalry that distracts from remembering death and accountability — the concern is the obsessive distraction, not effort itself.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} boasts constantly about a new phone and feels concerned nothing bad can interrupt this success. Applying the surah's phrase 'until they visit the graveyards,' what should this learner remember?`,
      correct: "That worldly rivalry and boasting can consume a person's attention right up until death, so it should be kept in perspective now",
      wrong: [
        "That graveyards are only mentioned as a place to avoid visiting, unrelated to rivalry",
        "That boasting about possessions guarantees protection from death",
        "That this phrase only applies to elderly people, not to a Grade 6 learner",
      ],
      explanation: "The phrase 'until they visit the graveyards' shows how worldly rivalry can distract a person for their entire life unless they deliberately keep perspective.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says the surah's mention of being 'questioned about the pleasure they enjoyed' means blessings are always bad and should be avoided. Is this a fair reading of Surah At-Takathur?`,
    correct: "No — the surah does not condemn blessings themselves, but calls for accountability in how they are used and enjoyed",
    wrong: [
      "Yes — the surah teaches that no blessing should ever be enjoyed at all",
      "Yes — only extremely wealthy people will actually be questioned about blessings",
      "No — but only because the questioning applies exclusively to money, not to any other blessing",
    ],
    explanation: "The surah's point is accountability, not condemnation — blessings themselves are not forbidden, but a person will be asked how they used them.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that 'certain knowledge' in Surah At-Takathur simply means knowing a lot of facts about school subjects. Evaluate this interpretation.`,
      correct: "Flawed — 'certain knowledge' in the surah refers specifically to sure awareness of the accountability and Hellfire awaiting the distracted, not general school knowledge",
      wrong: [
        "Sound — the surah is entirely about academic knowledge and exam preparation",
        "Sound — 'certain knowledge' and general facts are treated as identical throughout the Qur'an",
        "Flawed — but only because the surah never actually uses the phrase 'certain knowledge'",
      ],
      explanation: "The surah's 'certain knowledge' is about truly grasping what awaits after death — a different sense of knowledge from general school facts.",
    };
  },
];

export const surahAtTakathur: Skill = {
  id: "g6-ire-qu-at-takathur",
  code: "QU.3",
  subjectId: "ire",
  strandId: "g6-ire-quran",
  grade: 6,
  title: "Surah At-Takathur",
  description: "The meaning and teachings of Surah At-Takathur (Q.102:1-8): the distraction of competing for wealth and status, the repeated warning of accountability, and the questioning about blessings enjoyed.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, TAKATHUR_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the opening rivalry to the questioning about blessings.",
        items,
        correctOrder: TAKATHUR_SEQUENCE.map((d) => d.id),
        hint: "It opens with the distraction of rivalry until death, then the twice-repeated warning and certain knowledge, then seeing the Fire and being questioned.",
        explanation: TAKATHUR_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const distraction = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "distraction")).slice(0, 3);
      const warning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "warning")).slice(0, 3);
      const accountability = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "accountability")).slice(0, 3);
      const chosen = shuffle(rng, [...distraction, ...warning, ...accountability]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["distraction", "warning", "accountability"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the rivalry that distracts people, some about the repeated warning, and some about seeing the Fire and being questioned.",
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
        hint: "Think about what each term refers to in the surah's warning against worldly rivalry.",
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
        hint: "Think about which teaching of Surah At-Takathur the situation is actually applying.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Surah At-Takathur opens by describing competition for", after: ".", answer: "increase", accepted: ["increase", "abundance"] },
      { before: "This rivalry distracts people until they visit the", after: ".", answer: "graveyards", accepted: ["graveyards"] },
      { before: "The surah repeats the warning 'No! You are going to", after: "' twice.", answer: "know", accepted: ["know"] },
      { before: "If people had certain", after: ", they would not be distracted by rivalry.", answer: "knowledge", accepted: ["knowledge"] },
      { before: "The surah states that people will surely see the", after: ".", answer: "Hellfire", accepted: ["hellfire", "fire"] },
      { before: "They will see it with certain, eye-witness", after: ".", answer: "sight", accepted: ["sight"] },
      { before: "On that Day, people will be questioned about the pleasure and", after: "they enjoyed.", answer: "blessings", accepted: ["blessings"] },
      { before: "Surah At-Takathur is chapter number", after: "of the Qur'an.", answer: "102", accepted: ["102"] },
      { before: "Surah At-Takathur has", after: "verses in total.", answer: "8", accepted: ["8", "eight"] },
      { before: "The rivalry described includes competing over wealth, children, or", after: ".", answer: "status", accepted: ["status", "followers"] },
      { before: "The questioning about blessings is about how they were", after: ", not simply about having received them.", answer: "used", accepted: ["used"] },
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
      hint: "Recall the warning against worldly rivalry in Surah At-Takathur.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
