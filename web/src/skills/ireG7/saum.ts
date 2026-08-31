import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The daily Ramadan-fasting sequence (Suhoor -> niyyah -> abstaining dawn to sunset -> Maghrib
// -> Iftar) is explicit, curriculum-endorsed sequential content — not an invented order.
const ORDER_PROMPTS = [
  "Arrange the events of a single day's Ramadan fast in the correct order.",
  "Put these events of a Ramadan fasting day into the correct order.",
  "Sequence the events of a single day's Ramadan fast correctly.",
  "Order these events of a Ramadan fasting day as they actually happen.",
  "Sort these steps of a day's Ramadan fast into their correct order.",
  "Arrange these moments of a Ramadan fasting day from first to last.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as describing a type of Saum or its significance for spiritual growth.",
  "Group each statement under a type of Saum or its spiritual significance.",
  "Decide whether each statement names a type of Saum or describes its significance, and sort it there.",
  "Sort each statement into the correct category: type of Saum, or its significance.",
  "Place each statement into the right bucket — a type of fast, or its spiritual significance.",
  "Categorise each statement as a type of Saum or a spiritual significance.",
];

const MATCH_PROMPTS = [
  "Match each term about Saum to its meaning.",
  "Pair each term about Saum with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about Saum to the definition that fits it.",
  "Choose the correct meaning for each term about Saum.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word or term.",
  "Which word or term completes this sentence?",
  "Complete the sentence with the correct word or term.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const RAMADAN_STEPS = [
  { id: "suhoor", label: "Suhoor (the pre-dawn meal) is eaten before dawn" },
  { id: "niyyah", label: "The Muslim makes niyyah (intention) to fast for the day" },
  { id: "abstain", label: "The Muslim abstains from food, drink, and marital relations from dawn to sunset" },
  { id: "maghrib", label: "The Maghrib call to prayer signals sunset" },
  { id: "iftar", label: "The fast is broken with Iftar" },
];

interface TopicFact {
  text: string;
  topic: "types" | "significance";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  types: "About the types of Saum",
  significance: "About the significance of Saum for spiritual growth",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Fardh is an obligatory fast, such as fasting during the month of Ramadan", topic: "types" },
  { text: "Sunnah fasting is voluntary, such as fasting on Mondays and Thursdays", topic: "types" },
  { text: "Nadhir is a fast a person vows to Allah as a personal pledge", topic: "types" },
  { text: "Kafara is an expiatory fast performed to make amends for breaking a religious obligation", topic: "types" },
  { text: "Qadha is a makeup fast performed later to replace a missed obligatory fasting day", topic: "types" },
  { text: "Saum builds self-discipline and taqwa (God-consciousness)", topic: "significance" },
  { text: "Fasting teaches empathy for those who go hungry or are poor", topic: "significance" },
  { text: "Saum purifies both the body and the soul", topic: "significance" },
  { text: "Observing Saum is a way of earning taqwa from Allah", topic: "significance" },
  { text: "Fasting teaches patience and self-control over one's desires", topic: "significance" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Fardh", meaning: "An obligatory fast, such as fasting during the month of Ramadan" },
  { term: "Sunnah (fasting)", meaning: "A voluntary fast, such as fasting on Mondays and Thursdays" },
  { term: "Nadhir", meaning: "A fast a person vows to Allah as a personal pledge" },
  { term: "Kafara", meaning: "An expiatory fast performed to make amends for breaking a religious obligation" },
  { term: "Qadha", meaning: "A makeup fast performed later to replace a missed obligatory fasting day" },
  { term: "Suhoor", meaning: "The meal eaten before dawn, before a day of fasting begins" },
  { term: "Niyyah", meaning: "The intention made to fast for the day" },
  { term: "Iftar", meaning: "The meal used to break the fast at sunset" },
  { term: "Maghrib", meaning: "The call to prayer that signals sunset, and the end of the day's fast" },
  { term: "Taqwa", meaning: "God-consciousness — an inner quality that fasting is meant to build" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} fasts throughout the month of Ramadan, from dawn to sunset every day, because it is a command from Allah upon every adult Muslim. Which type of Saum is this?`,
    correct: "Fardh",
    wrong: ["Sunnah — a voluntary fast, not a command upon every adult Muslim", "Nadhir — a personal vow, not the Ramadan command itself", "Qadha — a makeup fast, not the original obligation"],
    explanation: "Fardh is the obligatory fast — Ramadan fasting is commanded of every adult Muslim, which is what makes it Fardh rather than voluntary.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} chooses to fast every Monday and Thursday, even though it is not compulsory, because the Prophet (S.A.W.) used to fast on those days. Which type of Saum is this?`,
      correct: "Sunnah (fasting)",
      wrong: ["Fardh — an obligatory fast, not one chosen voluntarily", "Kafara — an expiatory fast for breaking an obligation, not a chosen practice", "Nadhir — a personal vow tied to a specific pledge, not a recurring voluntary habit"],
      explanation: "Sunnah fasting is voluntary and recommended, following the Prophet's (S.A.W.) example — Monday/Thursday fasting is the classic example.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} promises Allah that if he passes his national exams, he will fast for three days as a personal pledge. When he passes and fasts those three days, which type of Saum has he observed?`,
    correct: "Nadhir",
    wrong: ["Fardh — a command upon all Muslims, not a personal pledge", "Sunnah — a general recommended practice, not tied to a specific vow", "Qadha — a makeup for a missed obligatory day, not a new pledge"],
    explanation: "Nadhir is a fast vowed by a person as a personal pledge to Allah — a self-imposed obligation created by the vow itself.",
  }),
  (rng) => ({
    prompt: `${name(rng)} accidentally breaks a solemn oath, so as an act of expiation to make amends, he fasts for several days as instructed. Which type of Saum is this?`,
    correct: "Kafara",
    wrong: ["Nadhir — a fast vowed voluntarily, not one required to atone for a broken oath", "Qadha — a fast that replaces a missed day, not an act of atonement", "Sunnah — a recommended, non-obligatory fast, not an expiation"],
    explanation: "Kafara is the expiatory fast performed to make amends for breaking a religious obligation, such as a broken oath.",
  }),
  (rng) => ({
    prompt: `${name(rng)} falls seriously ill during Ramadan in ${place(rng)} and is unable to fast for three days. Once she recovers, she fasts three separate days later to replace the missed days. Which type of Saum is this?`,
    correct: "Qadha",
    wrong: ["Kafara — an expiation for breaking an oath, not a replacement for illness-related missed days", "Nadhir — a personal vow, not a required makeup fast", "Fardh — the original Ramadan obligation itself, not the later replacement"],
    explanation: "Qadha is the makeup fast performed later to replace a missed obligatory fasting day, such as one missed due to illness.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says fasting only teaches self-control and has nothing to do with understanding the poor. What is the flaw in this reasoning?`,
    correct: "Fasting also builds empathy — feeling hunger firsthand helps a Muslim understand what those without enough food experience daily",
    wrong: ["There is no flaw — fasting has no connection to poverty at all", "Fasting is only about avoiding food, with no spiritual meaning", "Empathy can only be learned by giving money, never by fasting"],
    explanation: "Fasting teaches empathy for those who go hungry or are poor, alongside building self-discipline — the two benefits are not exclusive of each other.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} eats a large meal right after sunset, then wakes up again before dawn to eat once more before beginning the day's fast. What are these two meals called, in order?`,
    correct: "Iftar (breaking the fast at sunset), then Suhoor (the pre-dawn meal)",
    wrong: ["Suhoor, then Iftar, in that order", "Both meals are called Iftar", "Both meals are called Suhoor"],
    explanation: "Iftar breaks the fast at sunset; Suhoor is the separate pre-dawn meal eaten before the next day's fast begins.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} missed a Ramadan fasting day due to travel, and later fasts one day to replace it — no oath was broken and no vow was made. Which type of Saum did he perform, and why is this not Kafara?`,
    correct: "Qadha — because it simply replaces a missed obligatory day, with no broken oath or vow involved",
    wrong: ["Kafara — because any makeup fast counts as expiation", "Nadhir — because he chose the make-up day himself", "Fardh — because Ramadan itself is obligatory"],
    explanation: "Qadha replaces a missed obligatory day with no broken oath involved, which is what distinguishes it from Kafara (expiation for a broken oath).",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} struggles to wake up on time and manage his temper, so his teacher in ${place(rng)} suggests that observing Saum regularly could help him build a particular quality. Which quality is Saum most closely linked to developing?`,
      correct: "Self-discipline and taqwa (God-consciousness)",
      wrong: ["Physical strength for sports competitions", "Skill in public speaking", "Knowledge of world geography"],
      explanation: "Saum is described as building self-discipline and taqwa (God-consciousness) — qualities directly relevant to managing habits like waking on time and self-control.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Sunnah fasting on Mondays and Thursdays is pointless since it is not compulsory. What is the most accurate response?`,
    correct: "It is not sinful to skip it, but performing it earns extra reward and reflects the Prophet's (S.A.W.) example",
    wrong: ["It is actually compulsory despite being called Sunnah", "It brings no benefit at all since it is voluntary", "It replaces the obligation to fast during Ramadan"],
    explanation: "Sunnah fasts are voluntary and not sinful to skip, but they earn extra reward — dismissing them as pointless misses that benefit.",
  }),
];

export const saum: Skill = {
  id: "g7-ire-da-saum",
  code: "DA.3",
  subjectId: "ire",
  strandId: "g7-ire-devotional",
  grade: 7,
  title: "Saum",
  description: "The five named types of Saum (Fardh, Sunnah, Nadhir, Kafara, Qadha), the daily Ramadan fasting sequence, and Saum's significance for spiritual growth.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, RAMADAN_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the pre-dawn meal to breaking the fast.",
        items,
        correctOrder: RAMADAN_STEPS.map((s) => s.id),
        hint: "Suhoor happens before dawn; Iftar happens after sunset, at the very end.",
        explanation: RAMADAN_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const types = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "types")).slice(0, 5);
      const significance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "significance")).slice(0, 5);
      const chosen = shuffle(rng, [...types, ...significance]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["types", "significance"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements name a specific kind of fast; others describe what fasting builds in a Muslim spiritually.",
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
        hint: "Think about whether the term names a type of fast or a part of the daily fasting routine.",
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
        hint: "Look for whether the situation describes an obligation, a vow, an atonement, a makeup, or a voluntary act.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "", after: "is an obligatory fast, such as fasting during the month of Ramadan.", answer: "Fardh", accepted: ["fardh"] },
      { before: "", after: "fasting is voluntary, such as fasting on Mondays and Thursdays.", answer: "Sunnah", accepted: ["sunnah"] },
      { before: "", after: "is a fast a person vows to Allah as a personal pledge.", answer: "Nadhir", accepted: ["nadhir"] },
      { before: "", after: "is an expiatory fast performed to make amends for breaking a religious obligation.", answer: "Kafara", accepted: ["kafara"] },
      { before: "", after: "is a makeup fast performed later to replace a missed obligatory fasting day.", answer: "Qadha", accepted: ["qadha"] },
      { before: "The pre-dawn meal eaten before a day of fasting begins is called", after: ".", answer: "Suhoor", accepted: ["suhoor"] },
      { before: "The meal used to break the fast at sunset is called", after: ".", answer: "Iftar", accepted: ["iftar"] },
      { before: "During Ramadan, a Muslim abstains from food, drink, and marital relations from dawn until", after: ".", answer: "sunset", accepted: ["sunset"] },
      { before: "Before beginning a day's fast, a Muslim makes", after: "(intention) to fast.", answer: "niyyah", accepted: ["niyyah", "niyya"] },
      { before: "Saum builds self-discipline and", after: "(God-consciousness).", answer: "taqwa", accepted: ["taqwa"] },
      { before: "Fasting teaches", after: "for those who go hungry or are poor.", answer: "empathy", accepted: ["empathy"] },
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
      hint: "Recall the five named types of Saum and what fasting is meant to build spiritually.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`.trim(),
    };
  },
};
