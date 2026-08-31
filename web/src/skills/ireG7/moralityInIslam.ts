import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: sources and purpose of morality are a set of related facts, not a
// curriculum-stated sequence — a 5th QuestionKind is not manufactured here.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as describing a source of morality, or its purpose.",
  "Group each statement under a source of morality, or its purpose.",
  "Decide whether each statement is about a source of morality or its purpose, and sort it there.",
  "Sort each statement into the correct category: a source of morality, or its purpose.",
  "Place each statement into the right bucket — a source, or a purpose.",
  "Categorise each statement as a source of morality or its purpose.",
];

const MATCH_PROMPTS = [
  "Match each term about Islamic morality to its meaning.",
  "Pair each term about Islamic morality with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about Islamic morality to the definition that fits it.",
  "Choose the correct meaning for each term about Islamic morality.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface TopicFact {
  text: string;
  topic: "source" | "purpose";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  source: "About the sources of morality in Islam",
  purpose: "About the purpose of morality in Islam",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Qur'an is the primary source of Islamic morality", topic: "source" },
  { text: "The Sunnah (the Prophet's example) is the second named source of Islamic morality", topic: "source" },
  { text: "Both the Qur'an and Sunnah together shape a Muslim's understanding of right and wrong", topic: "source" },
  { text: "Islamic morality is not left to personal opinion alone — it is anchored in revealed sources", topic: "source" },
  { text: "Practising Islamic moral values is itself considered a form of ibadah (worship)", topic: "source" },
  { text: "Morality promotes uprightness and good conduct within society", topic: "purpose" },
  { text: "Morality helps a Muslim distinguish right from wrong in daily situations", topic: "purpose" },
  { text: "Morality guides good behaviour, protecting individuals and the wider community", topic: "purpose" },
  { text: "Practising good morals is a way of earning rewards from Allah", topic: "purpose" },
  { text: "Morality is meant to shape both private conduct and public behaviour", topic: "purpose" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Qur'an", meaning: "The primary source of Islamic morality" },
  { term: "Sunnah", meaning: "The Prophet's (S.A.W.) example — the second named source of Islamic morality" },
  { term: "Ibadah", meaning: "Worship — practising Islamic moral values is regarded as a form of this" },
  { term: "Uprightness", meaning: "Good, honest conduct that morality is meant to promote in society" },
  { term: "Right and wrong", meaning: "What morality helps a Muslim distinguish between in daily life" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Islamic morality is just a set of personal opinions individual Muslims came up with over time. Evaluate this claim.`,
    correct: "Flawed — Islamic morality is anchored in the Qur'an and Sunnah, not invented as personal opinion",
    wrong: ["Sound — Islamic morality has no fixed source at all", "Sound — the Qur'an and Sunnah only cover worship rituals, never moral conduct", "Flawed — but only because morality actually comes from cultural custom, not religious sources"],
    explanation: "Islamic morality is explicitly anchored in two named sources — the Qur'an and the Sunnah — not left to individual opinion.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} treats practising good morals as separate from religious duty, something 'extra' beyond formal worship. What is the flaw in this view?`,
      correct: "Islamic teaching regards moral values as a form of ibadah (worship) itself, not a separate, optional extra",
      wrong: ["There is no flaw — morality and worship are indeed entirely separate categories", "The flaw is that formal worship is actually less important than morality", "Morality is only relevant to adults, so this view is correct for a learner"],
      explanation: "Practising Islamic moral values is itself regarded as ibadah — worship and morality are not separate categories, but intertwined.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says that as long as a Muslim performs the five daily prayers, honesty and fairness in daily dealings do not really matter. Evaluate this reasoning.`,
    correct: "Flawed — morality's purpose is to promote uprightness and guide behaviour throughout daily life, not only during formal worship",
    wrong: ["Sound — formal prayer alone fulfils every requirement of Islamic morality", "Sound — honesty and fairness are only relevant in business, not religious life", "Flawed — but only because formal prayer is actually unnecessary if morality is upheld"],
    explanation: "Morality's purpose extends across daily conduct — honesty and fairness in dealings — not just formal acts of worship like prayer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know how to resolve a moral dilemma at school. Which two sources should guide this decision, according to Islamic teaching?`,
    correct: "The Qur'an and the Sunnah — the two named sources of Islamic morality",
    wrong: ["Personal preference and popular opinion among classmates", "Only the Sunnah, since the Qur'an does not address moral questions", "Only the Qur'an, since the Sunnah only covers matters of worship"],
    explanation: "Islamic morality names two sources — the Qur'an and the Sunnah — both of which are meant to guide a Muslim's moral decisions.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that morality in Islam exists only to benefit the individual practising it, with no wider social purpose. Evaluate this claim.`,
    correct: "Flawed — morality is meant to promote uprightness across the whole society, protecting both individuals and the wider community",
    wrong: ["Sound — Islamic morality has no bearing on society at all", "Sound — society is entirely unaffected by an individual's moral conduct", "Flawed — but only because morality actually harms the wider community"],
    explanation: "Morality's stated purpose includes promoting uprightness across society, not benefiting only the individual who practises it.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says following the Prophet's (S.A.W.) example (Sunnah) is optional guidance, useful only if convenient. What is the flaw in this view?`,
    correct: "The Sunnah is named as one of the two core sources of Islamic morality, not optional or occasional guidance",
    wrong: ["There is no flaw — the Sunnah is indeed entirely optional guidance", "The flaw is that the Sunnah is actually the only source, with the Qur'an being optional instead", "The Sunnah only applies to worship, so the view is correct for moral questions"],
    explanation: "The Sunnah stands alongside the Qur'an as a core, not optional, source of Islamic morality — it is meant to be consistently followed, not used only when convenient.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} helps a struggling classmate with schoolwork purely out of a sense of duty, without expecting anything in return. How does this connect to the purpose of Islamic morality?`,
      correct: "It reflects morality's purpose of guiding good behaviour that benefits both the individual and the wider community, and can be a way of earning reward from Allah",
      wrong: ["It has no connection to Islamic morality, since only formal worship earns reward", "It is discouraged in Islam, since helping others without personal benefit is considered wasteful", "It only matters if performed publicly for recognition"],
      explanation: "Good conduct that helps others, done sincerely, fulfils morality's purpose of guiding beneficial behaviour and can be a way of earning Allah's reward.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that since the Sunnah comes from a human being (the Prophet S.A.W.), it cannot carry the same authority as the Qur'an in shaping morality. Evaluate this claim.`,
    correct: "Flawed — Islamic teaching names both the Qur'an and the Sunnah together as sources of morality, with the Sunnah carrying real authoritative weight, not merely being a human opinion",
    wrong: ["Sound — the Sunnah is entirely disregarded when it comes to moral questions", "Sound — the Qur'an is the only source that should ever be consulted", "Flawed — but only because the Sunnah actually outranks the Qur'an entirely"],
    explanation: "Both the Qur'an and Sunnah are named together as sources of Islamic morality — the Sunnah is not dismissed as merely human opinion in this framework.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says morality's purpose is only to avoid punishment in the Hereafter, with no benefit in this life. Evaluate this reasoning.`,
    correct: "Flawed — morality's purpose includes promoting uprightness and guiding good conduct in this life, benefiting both the individual and society now, not only avoiding future punishment",
    wrong: ["Sound — morality has no relevance to daily life whatsoever", "Sound — uprightness and good conduct only matter after death", "Flawed — but only because morality actually has no connection to the Hereafter at all"],
    explanation: "Morality's purpose is framed around present conduct and social uprightness, with reward in the Hereafter as one part of a wider picture, not the sole point.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says a Muslim's moral conduct only matters when interacting with other Muslims. Evaluate this claim against the stated purpose of Islamic morality.`,
    correct: "Flawed — morality is meant to guide good behaviour broadly, in the wider society, not only in interactions limited to fellow Muslims",
    wrong: ["Sound — Islamic morality explicitly excludes non-Muslims from consideration", "Sound — good conduct is only ever required within religious settings", "Flawed — but only because morality actually applies exclusively outside any religious community"],
    explanation: "Morality's stated purpose is promoting uprightness in society broadly — good conduct is not limited to interactions within one particular group.",
  }),
];

export const moralityInIslam: Skill = {
  id: "g7-ire-ak-morality",
  code: "AK.1",
  subjectId: "ire",
  strandId: "g7-ire-akhlaq",
  grade: 7,
  title: "Dimensions of Morality in Islam",
  description: "The sources of Islamic morality (Qur'an and Sunnah), the purpose of morality in promoting uprightness, and morality as a form of ibadah.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const source = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "source")).slice(0, 5);
      const purpose = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "purpose")).slice(0, 5);
      const chosen = shuffle(rng, [...source, ...purpose]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["source", "purpose"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Sources are where morality comes from; purpose is what morality is meant to achieve.",
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
        hint: "Think about whether the term names a source, a purpose, or how morality is regarded as worship.",
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
        hint: "Think about where Islamic morality actually comes from, and what it is meant to achieve in daily life and society.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The primary source of Islamic morality is the", after: ".", answer: "Qur'an", accepted: ["qur'an", "quran"] },
      { before: "The second named source of Islamic morality is the", after: ".", answer: "Sunnah", accepted: ["sunnah"] },
      { before: "Practising Islamic moral values is regarded as a form of", after: ".", answer: "ibadah", accepted: ["ibadah", "worship"] },
      { before: "Morality helps a Muslim distinguish right from", after: ".", answer: "wrong", accepted: ["wrong"] },
      { before: "Morality promotes", after: "and good conduct in society.", answer: "uprightness", accepted: ["uprightness"] },
      { before: "Islamic morality is anchored in revealed", after: ", not personal opinion alone.", answer: "sources", accepted: ["sources"] },
      { before: "The Sunnah refers to the example of the", after: "(S.A.W.).", answer: "Prophet", accepted: ["prophet"] },
      { before: "Good morals help protect both the individual and the wider", after: ".", answer: "community", accepted: ["community", "society"] },
      { before: "Practising good morals is a way of earning", after: "from Allah.", answer: "rewards", accepted: ["rewards", "reward"] },
      { before: "Morality is meant to shape both private conduct and", after: "behaviour.", answer: "public", accepted: ["public"] },
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
      hint: "Recall the two named sources of Islamic morality and its stated purpose.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
