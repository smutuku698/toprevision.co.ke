import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The story's own flow — the dream, the well, servitude, temptation, imprisonment, dream
// interpretation, leadership, reunion — is the standard, widely-taught narrative order from
// Surah Yusuf, not invented.
const ORDER_PROMPTS = [
  "Arrange the events of the story of Prophet Yusuf (A.S.) in the order they happened.",
  "Put these events from the story of Yusuf (A.S.) into the order they occurred.",
  "Sequence these events of Yusuf's (A.S.) story correctly, from first to last.",
  "Order these events as they happened in the story of Yusuf (A.S.).",
  "Sort these events of Yusuf's (A.S.) story into the order they occurred.",
  "Arrange these moments from the story of Yusuf (A.S.) in the order they took place.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Yusuf's (A.S.) story it describes.",
  "Group each statement under the part of the story of Yusuf (A.S.) it describes.",
  "Decide which part of Yusuf's (A.S.) story each statement describes, and sort it there.",
  "Sort each fact into the part of the story it belongs to.",
  "Place each statement under the part of Yusuf's (A.S.) story it describes.",
  "Read each statement and sort it under the matching part of the story.",
];

const MATCH_PROMPTS = [
  "Match each term from the story of Yusuf (A.S.) to its meaning.",
  "Pair each term from Yusuf's (A.S.) story with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from the story to the definition that fits it.",
  "Choose the correct meaning for each term from Yusuf's (A.S.) story.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const YUSUF_SEQUENCE = [
  { id: "dream", label: "Yusuf (A.S.) dreams of eleven stars, the sun and the moon bowing to him, making his brothers jealous" },
  { id: "well", label: "His jealous brothers throw him into a well and leave him" },
  { id: "sold", label: "Travellers find him and he is sold into servitude in Egypt" },
  { id: "temptation", label: "In the nobleman's household, he faces serious temptation but chooses righteousness" },
  { id: "imprisoned", label: "Despite his innocence, he is imprisoned after false accusations" },
  { id: "interprets-prison", label: "While in prison, he becomes known for interpreting dreams" },
  { id: "kings-dream", label: "He correctly interprets the King's dream, predicting years of harvest then famine" },
  { id: "authority", label: "He is appointed to a position of authority over Egypt's resources" },
  { id: "reunion", label: "His family comes to Egypt seeking aid during the famine, and he forgives his brothers" },
];

interface TopicFact {
  text: string;
  topic: "trials" | "integrity" | "leadership";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  trials: "The trials Yusuf (A.S.) faced",
  integrity: "Choosing integrity under pressure",
  leadership: "Wisdom, leadership and forgiveness",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Yusuf's (A.S.) jealous brothers threw him into a well and left him", topic: "trials" },
  { text: "He was found by travellers and sold into servitude in Egypt", topic: "trials" },
  { text: "He was imprisoned despite being innocent, after a false accusation", topic: "trials" },
  { text: "He remained patient through the well, servitude, and imprisonment", topic: "trials" },
  { text: "In the nobleman's household, Yusuf (A.S.) faced serious temptation but chose righteousness instead", topic: "integrity" },
  { text: "He kept his good character even though choosing wrongly would have been easier at the time", topic: "integrity" },
  { text: "His integrity came at a personal cost — he was imprisoned following the incident", topic: "integrity" },
  { text: "Even while imprisoned, Yusuf (A.S.) maintained his good conduct and character", topic: "integrity" },
  { text: "Yusuf (A.S.) correctly interpreted the King of Egypt's dream about years of harvest followed by famine", topic: "leadership" },
  { text: "He was appointed to a position of authority over Egypt's resources because of his wisdom and trustworthiness", topic: "leadership" },
  { text: "His careful planning helped Egypt and surrounding regions survive the famine", topic: "leadership" },
  { text: "When his brothers came to Egypt seeking aid, Yusuf (A.S.) forgave them despite having the power to punish them", topic: "leadership" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "The well", meaning: "Where Yusuf's (A.S.) jealous brothers left him before he was found by travellers" },
  { term: "Al-Aziz's household", meaning: "The nobleman's home in Egypt where Yusuf (A.S.) served and faced serious temptation" },
  { term: "The false accusation", meaning: "What led to Yusuf's (A.S.) imprisonment despite his innocence" },
  { term: "Dream interpretation", meaning: "The skill Yusuf (A.S.) became known for while in prison" },
  { term: "The King's dream", meaning: "A vision of years of harvest followed by famine, which Yusuf (A.S.) correctly interpreted" },
  { term: "Position of authority", meaning: "The role Yusuf (A.S.) was given over Egypt's resources because of his wisdom" },
  { term: "Forgiveness", meaning: "What Yusuf (A.S.) showed his brothers when they came to Egypt during the famine" },
  { term: "Patience (sabr)", meaning: "The quality Yusuf (A.S.) showed through the well, servitude, and imprisonment" },
  { term: "Integrity", meaning: "Choosing what is right even under pressure, as Yusuf (A.S.) did facing temptation" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, is falsely blamed by a classmate for something they did not do, and feels the urge to lash out in anger. Applying the lesson of Yusuf's (A.S.) patience through unjust treatment, what should ${who} do?`,
      correct: "Remain patient and composed, trusting that the truth will eventually be known, as Yusuf (A.S.) did through years of unjust hardship",
      wrong: [
        "Retaliate immediately, since patience only mattered for prophets, not ordinary learners",
        "Give up trying to clear their name, since Yusuf (A.S.) never sought fairness at all",
        "Accept the blame permanently, since Yusuf (A.S.) never expected justice to come",
      ],
      explanation: "Yusuf (A.S.) faced repeated injustice — the well, false accusation, and imprisonment — yet remained patient, eventually being vindicated through his integrity and wisdom.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is offered an easy way to cheat during an exam with almost no chance of being caught. Applying the lesson of Yusuf (A.S.) resisting temptation in Al-Aziz's household, what should ${who} do?`,
      correct: "Refuse and choose honesty, even though it is the harder choice, just as Yusuf (A.S.) chose righteousness under pressure",
      wrong: [
        "Cheat, since Yusuf (A.S.) only avoided wrongdoing when there was a risk of being caught",
        "Cheat only once, since a single act does not count as a real test of character",
        "Wait to decide until seeing whether anyone else is cheating first",
      ],
      explanation: "Yusuf (A.S.) chose what was right even when wrongdoing seemed easy and low-risk — the same standard applies whether or not someone might get caught.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} finally gets the chance to confront a former friend who spread lies about them years earlier, now that the friend needs their help. Applying the lesson of Yusuf (A.S.) forgiving his brothers, what is the best response?`,
    correct: "Forgive and help, the way Yusuf (A.S.) forgave his brothers even though he had the power to punish them",
    wrong: [
      "Refuse to help at all, since forgiveness in the story only applied to Yusuf's (A.S.) own family",
      "Help only after demanding a public apology first, since Yusuf (A.S.) required this before forgiving",
      "Help but remind the friend of the wrong repeatedly, since Yusuf (A.S.) never let the matter go",
    ],
    explanation: "Yusuf (A.S.) forgave his brothers freely when he had full power to punish them instead — a model of forgiveness without holding a grudge or demanding conditions.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A local leader in ${place(rng)} asks ${who} to help plan how the community should save food supplies before a difficult season. Which part of Yusuf's (A.S.) story does this situation most closely resemble?`,
      correct: "His wise planning as Egypt's leader, storing grain during good years to prepare for the coming famine",
      wrong: [
        "His time in the well, which was about surviving isolation, not planning",
        "His imprisonment, which was about enduring injustice, not resource planning",
        "The moment of temptation, which had nothing to do with planning for scarcity",
      ],
      explanation: "Yusuf's (A.S.) wise, forward-looking planning of Egypt's resources during years of harvest to prepare for famine is the clearest match to this situation.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that Yusuf (A.S.) only succeeded because he got lucky, not because of his character. Evaluate this reasoning.`,
    correct: "Flawed — his eventual success followed directly from his patience, integrity, and wisdom through repeated hardship, not luck alone",
    wrong: [
      "Sound — nothing Yusuf (A.S.) did influenced the outcome of his story",
      "Sound — the story teaches that character has no real connection to outcomes",
      "Flawed — the story actually shows that only wealth determined his success",
    ],
    explanation: "Yusuf's (A.S.) rise to a position of trust and authority came specifically because of the character he showed through hardship — patience, honesty, and wise counsel — not chance.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Yusuf (A.S.) remained known for good conduct even while unjustly imprisoned. What is the best explanation?`,
      correct: "His character was rooted in his own integrity and faith, not dependent on his circumstances or how he was being treated",
      wrong: [
        "He behaved well only because he expected to be released quickly",
        "Prison conditions at the time made good behaviour the only option available",
        "His good conduct in prison is not actually part of the story",
      ],
      explanation: "Yusuf (A.S.) maintained his character regardless of how unfairly he was treated — a sign that his integrity came from within, not from favourable circumstances.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the lesson of Yusuf's (A.S.) dream as a boy is that dreams always predict the future exactly and should never be doubted. Is this an accurate reading of the story?`,
    correct: "No — the story shows Yusuf's (A.S.) eventual honoured position, but the key lessons are patience, integrity, and trust in Allah through hardship, not that every dream is a literal guaranteed prophecy",
    wrong: [
      "Yes — the story's only purpose is to teach that all dreams predict the future",
      "Yes — Yusuf (A.S.) himself taught that dreams should replace hard work and planning",
      "No — the story actually says dreams have no meaning at all",
    ],
    explanation: "While the dream opens the story, its central lessons are about patience, integrity under pressure, and wise leadership — not a general claim that every dream literally predicts the future.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is jealous of a sibling who is praised often at home, and considers being unkind to them out of resentment. Applying the lesson of Yusuf's (A.S.) brothers' jealousy, what does the story warn against?`,
      correct: "Letting jealousy lead to harmful actions against someone close to you, since this caused deep, lasting harm in the story",
      wrong: [
        "Feeling jealous at all, since the story claims jealousy itself is impossible to avoid",
        "Being praised by parents, since the story blames Yusuf (A.S.) for his brothers' jealousy",
        "Sibling relationships in general, which the story presents as always harmful",
      ],
      explanation: "The brothers' jealousy leading to throwing Yusuf (A.S.) into a well shows how unchecked jealousy can cause serious harm — a clear warning against acting on such feelings.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that because Yusuf (A.S.) eventually gained power in Egypt, the years of hardship before that did not really matter. Evaluate this reasoning.`,
    correct: "Flawed — the years of hardship were exactly what built and tested the patience, integrity, and wisdom that made his later leadership possible",
    wrong: [
      "Sound — the years in the well, servitude, and prison had no lasting effect on his character",
      "Sound — the story would be the same if Yusuf (A.S.) had never faced any hardship at all",
      "Flawed — the hardship years are actually not part of the story of Yusuf (A.S.)",
    ],
    explanation: "The years of trial — the well, servitude, temptation, and unjust imprisonment — are what shaped the patience and integrity that defined Yusuf's (A.S.) later leadership, not an unrelated separate part of the story.",
  }),
];

export const prophetYusuf: Skill = {
  id: "g6-ire-pi-yusuf",
  code: "PI.2",
  subjectId: "ire",
  strandId: "g6-ire-iman",
  grade: 6,
  title: "Prophet Yusuf (A.S.)",
  description: "The story of Prophet Yusuf (A.S.): the well, servitude, resisting temptation, unjust imprisonment, wise leadership over Egypt's resources, and forgiving his brothers — and what these teach about patience, integrity, and forgiveness.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, YUSUF_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the dream to the family's reunion.",
        items,
        correctOrder: YUSUF_SEQUENCE.map((d) => d.id),
        hint: "It begins with Yusuf's (A.S.) dream as a boy and ends with his family reuniting with him in Egypt.",
        explanation: YUSUF_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const trials = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "trials")).slice(0, 3);
      const integrity = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "integrity")).slice(0, 3);
      const leadership = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "leadership")).slice(0, 3);
      const chosen = shuffle(rng, [...trials, ...integrity, ...leadership]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["trials", "integrity", "leadership"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the trials he faced, some about choosing integrity, and some about his later wisdom and leadership.",
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
        hint: "Think about who or what each term refers to in the story of Yusuf (A.S.).",
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
        hint: "Think about what the story of Yusuf (A.S.) teaches about patience, integrity, and forgiveness.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Yusuf's (A.S.) jealous brothers threw him into a", after: "and left him.", answer: "well", accepted: ["well"] },
      { before: "Yusuf (A.S.) was found by travellers and sold into servitude in", after: ".", answer: "Egypt", accepted: ["egypt"] },
      { before: "In Al-Aziz's household, Yusuf (A.S.) faced serious temptation but chose", after: "instead.", answer: "righteousness", accepted: ["righteousness"] },
      { before: "Yusuf (A.S.) was imprisoned despite being", after: ", after a false accusation.", answer: "innocent", accepted: ["innocent"] },
      { before: "While in prison, Yusuf (A.S.) became known for interpreting", after: ".", answer: "dreams", accepted: ["dreams"] },
      { before: "Yusuf (A.S.) correctly interpreted the King's dream about years of harvest followed by", after: ".", answer: "famine", accepted: ["famine"] },
      { before: "Because of his wisdom, Yusuf (A.S.) was appointed to a position of authority over Egypt's", after: ".", answer: "resources", accepted: ["resources"] },
      { before: "When his family came to Egypt during the famine, Yusuf (A.S.) chose to", after: "his brothers.", answer: "forgive", accepted: ["forgive"] },
      { before: "As a boy, Yusuf (A.S.) dreamed of eleven stars, the sun, and the moon", after: "to him.", answer: "bowing", accepted: ["bowing"] },
      { before: "Yusuf's (A.S.) brothers were", after: "of the special status shown in his dream.", answer: "jealous", accepted: ["jealous"] },
      { before: "Yusuf (A.S.) showed", after: "through the well, servitude, and imprisonment.", answer: "patience", accepted: ["patience"] },
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
      hint: "Recall the story of Yusuf (A.S.) — the well, servitude, temptation, prison, and his rise to leadership.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
