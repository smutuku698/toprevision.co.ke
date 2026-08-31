import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The surah's own verse-by-verse flow (Q.90:1-20) is explicit, curriculum-endorsed sequential
// content, not an invented order: opening oaths, man's created hardship, the boastful claim,
// the given senses/two ways, the steep path's two acts, then the two companion groups.
const ORDER_PROMPTS = [
  "Arrange the parts of Surah Al-Balad (Q.90:1-20) in the order they appear.",
  "Put these parts of Surah Al-Balad into the order they appear.",
  "Sequence these parts of Surah Al-Balad correctly, from first to last.",
  "Order these parts of Surah Al-Balad as they appear in the surah.",
  "Sort these parts of Surah Al-Balad into the order they occur.",
  "Arrange these moments of Surah Al-Balad in the order they appear.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Surah Al-Balad it describes.",
  "Group each statement under the part of Surah Al-Balad it describes.",
  "Decide which part of Surah Al-Balad each statement describes, and sort it there.",
  "Sort each fact into the part of Surah Al-Balad it belongs to.",
  "Place each statement under the part of the surah it describes.",
  "Read each statement and sort it under the matching part of Surah Al-Balad.",
];

const MATCH_PROMPTS = [
  "Match each term from Surah Al-Balad to its meaning.",
  "Pair each term from Surah Al-Balad with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from Surah Al-Balad to the definition that fits it.",
  "Choose the correct meaning for each term from Surah Al-Balad.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const BALAD_SEQUENCE = [
  { id: "oath-city", label: "Allah swears by the sacred city (Makkah)" },
  { id: "oath-parent", label: "Allah swears by the parent and offspring" },
  { id: "hardship", label: "Man is described as created into toil/hardship" },
  { id: "wealth-claim", label: "Man boasts he has spent great wealth, thinking no one has power over him" },
  { id: "senses", label: "Allah reminds man: has He not given him two eyes, a tongue, and two lips, and shown him the two ways (good and evil)?" },
  { id: "steep-path", label: "The surah describes the difficult 'steep path' (al-'aqabah) that man has not taken" },
  { id: "freeing-slave", label: "One act on the steep path: freeing a slave/captive" },
  { id: "feeding-day", label: "The other act on the steep path: feeding an orphan of near kin or a needy person, on a day of hunger" },
  { id: "companions-right", label: "Those who believe and counsel each other to patience and mercy are the companions of the right" },
  { id: "companions-left", label: "Those who reject Our signs are the companions of the left" },
];

interface TopicFact {
  text: string;
  topic: "opening" | "steep-path" | "companions";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  opening: "Opening oaths and man's boastful claim",
  "steep-path": "The steep path (al-'aqabah)",
  companions: "The two groups of companions",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Allah swears by the sacred city, Makkah", topic: "opening" },
  { text: "Allah swears by parent and offspring", topic: "opening" },
  { text: "Man is created into toil/hardship", topic: "opening" },
  { text: "Man boasts of spending wealth in abundance, thinking no one has power over him", topic: "opening" },
  { text: "Allah asks whether man thinks no one has seen him, despite this boasting", topic: "opening" },
  { text: "Allah reminds man that He gave him two eyes, a tongue, and two lips, and showed him the two ways", topic: "opening" },
  { text: "The steep path includes freeing a slave or captive", topic: "steep-path" },
  { text: "The steep path includes feeding an orphan of near kin on a day of hunger", topic: "steep-path" },
  { text: "The steep path includes feeding a needy person in distress on a day of hunger", topic: "steep-path" },
  { text: "The steep path is described as difficult — man has not broken through it", topic: "steep-path" },
  { text: "Those who believe and counsel each other to patience and mercy are the companions of the right", topic: "companions" },
  { text: "Those who reject Allah's signs are the companions of the left", topic: "companions" },
  { text: "The Fire is described as closed in over the companions of the left", topic: "companions" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Al-Balad", meaning: "'The City' — the surah's name, referring to the sacred city (Makkah) sworn by at its start" },
  { term: "Kabad", meaning: "Toil/hardship — the condition the surah says man is created into" },
  { term: "Al-'Aqabah", meaning: "The steep, difficult path — freeing a captive and feeding the needy on a day of hunger" },
  { term: "The two ways", meaning: "The two paths of good and evil that Allah has shown to every person" },
  { term: "Companions of the right", meaning: "Those who believe and counsel each other to patience and mercy" },
  { term: "Companions of the left", meaning: "Those who reject Allah's signs" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} boasts loudly to friends about how much money was spent on a big party, implying no one can question the spending. Which teaching of Surah Al-Balad does this echo, and what does the surah say about it?`,
    correct: "It echoes the boastful man in the surah, who wrongly assumes no one has power over him or sees what he does",
    wrong: [
      "It matches the 'companions of the right,' who are praised for their generosity",
      "It has nothing to do with the surah, since spending wealth is never mentioned",
      "It matches the steep path, since spending money is itself the difficult act described",
    ],
    explanation: "Surah Al-Balad directly challenges the boastful claim of unlimited, unaccountable spending — the surah asks whether such a person really thinks no one has power over or sees them.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} frees a family's indentured farmhand from a debt-bondage arrangement and also pays for a needy neighbour's food during a drought. Which named acts of the 'steep path' does this reflect?`,
      correct: "Freeing someone from bondage and feeding a person in need on a day of hardship — both named acts of the steep path",
      wrong: [
        "Only freeing someone counts; feeding the needy is a separate, unrelated teaching",
        "Neither act is part of the steep path, since it only concerns prayer and fasting",
        "This reflects the boastful claim of wealth, not the steep path at all",
      ],
      explanation: "The steep path (al-'aqabah) is explicitly freeing a slave/captive and feeding an orphan of near kin or a needy person on a day of hunger — both acts shown in this scenario.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that since the steep path is described as difficult, ordinary Grade 7 learners in ${place(rng)} cannot realistically take part in it. Evaluate this reasoning.`,
    correct: "Flawed — while the named acts (freeing a captive, feeding the needy) may need effort or resources, learners can still contribute through smaller, honest acts of generosity and support",
    wrong: [
      "Sound — the steep path is only meant for wealthy adults, never for young people",
      "Sound — since it is called difficult, no Muslim is expected to attempt it at all",
      "Flawed — the steep path only requires belief, with no real actions attached to it",
    ],
    explanation: "The 'difficulty' of the steep path describes how few people actually choose it, not that it is closed off to anyone — every believer is called to strive toward acts like it, in whatever way they are able.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} faces a difficult exam period and complains that life feels full of struggle. Applying the surah's statement that man is created into hardship, how should this teaching shape their outlook?`,
    correct: "Accept that facing hardship is a normal part of human life, and respond with patience rather than despair",
    wrong: [
      "Conclude that Allah is being unfair, since hardship should never be part of a believer's life",
      "Assume the hardship means they are being punished specifically for a personal sin",
      "Give up on the exam entirely, since hardship cannot be overcome",
    ],
    explanation: "The surah states that man is created into toil/hardship as a general truth about human life, meant to build patient acceptance, not despair or the assumption of personal punishment.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, comparing the two groups described at the end of Surah Al-Balad, is asked what specifically distinguishes the 'companions of the right' from the 'companions of the left.' Which is correct?`,
      correct: "The companions of the right believe and counsel each other to patience and mercy; the companions of the left reject Allah's signs",
      wrong: [
        "The companions of the right are simply the wealthy, and the companions of the left are simply the poor",
        "Both groups are described identically, with no real difference between them",
        "The companions of the left are those who take the steep path, while the companions of the right avoid it",
      ],
      explanation: "The surah's distinction is belief plus mutual counsel toward patience and mercy (the right) versus rejecting Allah's signs (the left) — not wealth, and not who takes the steep path.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} helps organise a class charity drive but insists on choosing only the easiest, least demanding tasks. Analyse how this fits the surah's picture of the steep path.`,
    correct: "It falls short of the steep path's spirit, since the named acts (freeing a captive, feeding the needy in genuine hardship) are described as difficult, not the easiest option available",
    wrong: [
      "It fully matches the steep path, since any charitable task counts equally",
      "It matches the companions of the left, since any charity work at all is condemned",
      "It has no connection to the steep path, since the surah never describes any act as difficult",
    ],
    explanation: "The steep path is specifically named as the difficult route few take — choosing only the easiest tasks misses the point that the acts described demand real effort or sacrifice.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that counselling a struggling classmate toward patience during a hard family situation has nothing to do with Islamic teaching. Evaluate this claim against Surah Al-Balad.`,
    correct: "Flawed — the surah specifically praises those who counsel each other to patience and mercy as the companions of the right",
    wrong: [
      "Sound — the surah only concerns freeing captives and feeding the needy, not emotional support",
      "Sound — counselling others is described in the surah as a trait of the companions of the left",
      "Flawed — the surah condemns any form of counselling between believers",
    ],
    explanation: "Mutual counsel toward patience and mercy is explicitly named as a mark of the companions of the right, so this act of support fits directly within the surah's teaching.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that as long as a person has 'two eyes, a tongue, and two lips,' the surah's reminder about these gifts has no deeper meaning. What is the flaw in this view?`,
    correct: "It misses the point — these gifts are mentioned to prompt gratitude and awareness of Allah's provision, alongside the two ways of good and evil that Allah has shown every person",
    wrong: [
      "There is no flaw — the surah lists these features with no further purpose",
      "The flaw is that these are actually the acts named on the steep path, not senses",
      "The flaw is that these features belong only to the companions of the right",
    ],
    explanation: "Naming these basic senses is a reminder of Allah's provision, paired directly with the reminder that He has shown every person the two ways of good and evil — not a random detail.",
  }),
  (rng) => ({
    prompt: `${name(rng)} decides to donate food during a drought season in ${place(rng)}, specifically to an orphaned relative facing severe hunger. Which named act of the steep path does this most closely match?`,
    correct: "Feeding an orphan of near kin on a day of hunger — one of the two named acts of the steep path",
    wrong: [
      "Freeing a slave/captive — this describes a different act entirely",
      "Swearing by the sacred city — this is an oath, not an act of charity",
      "None of the named acts, since the steep path only concerns freeing captives",
    ],
    explanation: "The steep path names two specific acts: freeing a captive, and feeding an orphan of near kin or a needy person on a day of hunger — this scenario matches the second act exactly.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that the surah's opening oaths, by the sacred city and by parent and offspring, are just decoration with no real connection to the rest of the surah's message. Evaluate this claim.`,
    correct: "Flawed — the oaths draw attention to things of real weight and honour (a sacred place, the bond of family) before turning to the serious themes of hardship, wealth, and moral choice that follow",
    wrong: [
      "Sound — opening oaths never relate to a surah's later message",
      "Sound — the oaths are the surah's entire content, with no further teaching after them",
      "Flawed — the oaths describe the companions of the left specifically",
    ],
    explanation: "Qur'anic oaths draw the listener's attention to something significant before the main message — here, the sacred city and the parent-child bond, ahead of the surah's teaching on hardship, wealth, and moral choice.",
  }),
];

export const surahAlBalad: Skill = {
  id: "g7-ire-qu-surah-al-balad",
  code: "QU.3",
  subjectId: "ire",
  strandId: "g7-ire-quran",
  grade: 7,
  title: "Surah Al-Balad",
  description: "The meaning and teachings of Surah Al-Balad (Q.90:1-20): man created into hardship, the boastful claim over wealth, the steep path of freeing a captive and feeding the needy, and the companions of the right and left.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, BALAD_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the opening oaths to the two companion groups.",
        items,
        correctOrder: BALAD_SEQUENCE.map((d) => d.id),
        hint: "It opens with two oaths, then describes hardship and the boastful claim, then the senses and the steep path, then the two groups of companions.",
        explanation: BALAD_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const opening = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "opening")).slice(0, 4);
      const steepPath = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "steep-path")).slice(0, 4);
      const companions = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "companions")).slice(0, 3);
      const chosen = shuffle(rng, [...opening, ...steepPath, ...companions]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["opening", "steep-path", "companions"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the opening oaths and boastful claim, some about the steep path's named acts, and some about the two companion groups.",
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
        hint: "Think about what each term refers to in the surah's oaths, the steep path, or the two companion groups.",
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
        hint: "Think about which teaching of Surah Al-Balad the situation is actually applying.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Surah Al-Balad opens with Allah swearing by the sacred", after: ".", answer: "city", accepted: ["city", "makkah"] },
      { before: "Allah swears by", after: "and that which was born of him.", answer: "the father", accepted: ["the father", "a father", "parent"] },
      { before: "Surah Al-Balad states that man was created into", after: "(toil/hardship).", answer: "hardship", accepted: ["hardship", "toil"] },
      { before: "The man in the surah boasts that he has spent wealth in", after: ".", answer: "abundance", accepted: ["abundance"] },
      { before: "Allah asks whether man thinks that no one has", after: "over him.", answer: "power", accepted: ["power"] },
      { before: "Allah reminds man that He gave him two eyes, a tongue, and two", after: ".", answer: "lips", accepted: ["lips"] },
      { before: "Allah has shown every person the two", after: "— good and evil.", answer: "ways", accepted: ["ways"] },
      { before: "The difficult path described in the surah is called al-", after: ".", answer: "aqabah", accepted: ["aqabah", "'aqabah"] },
      { before: "One act on the steep path is freeing a", after: "(captive).", answer: "slave", accepted: ["slave"] },
      { before: "Another act on the steep path is feeding an orphan of near kin on a day of", after: ".", answer: "hunger", accepted: ["hunger"] },
      { before: "Those who believe and counsel patience and mercy are called the companions of the", after: ".", answer: "right", accepted: ["right"] },
      { before: "Those who reject Allah's signs are called the companions of the", after: ".", answer: "left", accepted: ["left"] },
      { before: "Surah Al-Balad is chapter number", after: "of the Qur'an.", answer: "90", accepted: ["90"] },
      { before: "Surah Al-Balad has", after: "verses in total.", answer: "20", accepted: ["20", "twenty"] },
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
      hint: "Recall the oaths, the steep path, and the two companion groups of Surah Al-Balad.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
