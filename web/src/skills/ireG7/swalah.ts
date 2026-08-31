import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The congregational prayer sequence (Adhan -> Iqamah -> rows -> Imam leads -> congregation
// follows) is explicit, curriculum-endorsed sequential content — not an invented order.
const ORDER_PROMPTS = [
  "Arrange the events of a congregational prayer in the correct order.",
  "Put these events of a congregational prayer into the correct order.",
  "Sequence these steps of a congregational prayer correctly.",
  "Order these events of a congregational prayer as they actually happen.",
  "Sort these steps of a congregational prayer into their correct order.",
  "Arrange these moments of a congregational prayer from first to last.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which type of prayer it describes.",
  "Group each statement under the type of prayer it describes.",
  "Decide which type of prayer each statement describes, and sort it there.",
  "Sort each fact into the type of prayer it belongs to.",
  "Place each statement under the prayer type it describes.",
  "Read each statement and sort it under the matching type of prayer.",
];

const MATCH_PROMPTS = [
  "Match each prayer or term to its meaning.",
  "Pair each prayer or term with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each prayer or term to the definition that fits it.",
  "Choose the correct meaning for each prayer or term.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word or term.",
  "Which word or term completes this sentence?",
  "Complete the sentence with the correct word or term.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const CONGREGATIONAL_STEPS = [
  { id: "adhan", label: "The Adhan (call to prayer) is called" },
  { id: "iqamah", label: "The Iqamah (second call, given just before the prayer starts) is called" },
  { id: "rows", label: "The congregation lines up in straight, closely-packed rows" },
  { id: "imamLeads", label: "The Imam leads the prayer" },
  { id: "follow", label: "The congregation follows the Imam's movements exactly, from bowing to prostration" },
];

interface TopicFact {
  text: string;
  topic: "congregational" | "sunnah" | "special";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  congregational: "About congregational prayer",
  sunnah: "About named Sunnah prayers",
  special: "About prayers on special occasions",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Muslims are encouraged to pray together in congregation rather than alone", topic: "congregational" },
  { text: "The congregation stands in straight, closely-packed rows behind the Imam", topic: "congregational" },
  { text: "Praying in congregation carries greater reward than praying alone", topic: "congregational" },
  { text: "The Imam leads the prayer and the congregation follows his movements exactly", topic: "congregational" },
  { text: "Tahajud is a voluntary night prayer performed after sleeping and before Fajr", topic: "sunnah" },
  { text: "Tahiyatul Masjid is a short greeting prayer performed on entering a mosque, before sitting down", topic: "sunnah" },
  { text: "Dhuha is a voluntary prayer performed during the mid-morning", topic: "sunnah" },
  { text: "Sunnah prayers are recommended, not obligatory, but earn extra reward from Allah", topic: "sunnah" },
  { text: "Swalatul Janaza is the funeral prayer, performed standing, with no bowing or prostration", topic: "special" },
  { text: "Swalatul Musafir allows a traveller to shorten or combine prayers while on a journey", topic: "special" },
  { text: "Swalatul Kusuf is performed during a solar eclipse", topic: "special" },
  { text: "Swalatul Khusuf is performed during a lunar eclipse", topic: "special" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Tahajud", meaning: "A voluntary night prayer performed after sleeping and before Fajr" },
  { term: "Tahiyatul Masjid", meaning: "A short greeting prayer performed upon entering a mosque, before sitting down" },
  { term: "Dhuha", meaning: "A voluntary prayer performed during the mid-morning" },
  { term: "Swalatul Janaza", meaning: "The funeral prayer, performed standing, for a deceased Muslim" },
  { term: "Swalatul Musafir", meaning: "The traveller's prayer, allowing shortened or combined prayers on a journey" },
  { term: "Swalatul Kusuf", meaning: "The prayer performed during a solar eclipse" },
  { term: "Swalatul Khusuf", meaning: "The prayer performed during a lunar eclipse" },
  { term: "Adhan", meaning: "The call to prayer, announced before congregational prayer begins" },
  { term: "Iqamah", meaning: "The second call, given just before the congregational prayer actually starts" },
  { term: "Imam", meaning: "The person who leads the congregation in prayer" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 7 learner in ${place(rng)}, wakes up quietly after several hours of sleep, well before Fajr, to pray voluntarily before going back to rest. Which prayer is this?`,
    correct: "Tahajud",
    wrong: ["Dhuha — performed in the mid-morning, not at night", "Tahiyatul Masjid — linked to entering a mosque, not waking at night", "Swalatul Musafir — a concession for travellers, not linked to night waking"],
    explanation: "Tahajud is the voluntary night prayer performed after sleeping and before Fajr — the timing after sleep is the key clue.",
  }),
  (rng) => ({
    prompt: `${name(rng)} arrives early for prayers at a mosque in ${place(rng)} and, before taking a seat, performs a short prayer as a greeting to the mosque itself. Which prayer is this?`,
    correct: "Tahiyatul Masjid",
    wrong: ["Dhuha — a mid-morning voluntary prayer, unrelated to entering a mosque", "Tahajud — a night prayer, not linked to entering a mosque", "Swalatul Kusuf — performed only during a solar eclipse"],
    explanation: "Tahiyatul Masjid is performed specifically upon entering a mosque, before sitting down — a greeting to the mosque, not a night or eclipse prayer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} takes a short break mid-morning, well after sunrise, to perform a voluntary prayer before continuing the day's activities. Which prayer is this?`,
    correct: "Dhuha",
    wrong: ["Tahajud — performed at night after sleeping, not mid-morning", "Tahiyatul Masjid — tied to entering a mosque, not a time of day", "Swalatul Khusuf — performed only during a lunar eclipse"],
    explanation: "Dhuha is the voluntary prayer performed during the mid-morning — the daytime timing rules out the night and mosque-entry prayers.",
  }),
  (rng) => ({
    prompt: `In ${place(rng)}, the community gathers to pray for a deceased neighbour before burial. The prayer is performed entirely standing, with no bowing or prostration. Which prayer is this?`,
    correct: "Swalatul Janaza",
    wrong: ["Swalatul Musafir — for travellers, not for the deceased", "Swalatul Kusuf — performed for a solar eclipse, not a funeral", "Dhuha — a voluntary daytime prayer unrelated to funerals"],
    explanation: "Swalatul Janaza is the funeral prayer for a deceased Muslim, performed standing throughout with no bowing or prostration — a structure unique to this prayer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} travels from ${place(rng)} to Nairobi for a five-day trip and shortens and combines some of his obligatory prayers along the way. Which prayer practice is this?`,
    correct: "Swalatul Musafir",
    wrong: ["Swalatul Janaza — the funeral prayer, unrelated to travel", "Tahajud — a voluntary night prayer, not a travel concession", "Swalatul Kusuf — tied to a solar eclipse, not travel"],
    explanation: "Swalatul Musafir is the traveller's prayer, permitting shortened or combined prayers while on a journey.",
  }),
  (rng) => ({
    prompt: `During an Integrated Science lesson in ${place(rng)}, learners watch the sun gradually darken during the day as the moon passes in front of it, and the community gathers for a special prayer afterwards. Which prayer matches this event?`,
    correct: "Swalatul Kusuf",
    wrong: ["Swalatul Khusuf — performed for a lunar eclipse, not a solar one", "Swalatul Janaza — the funeral prayer, unrelated to eclipses", "Tahiyatul Masjid — a mosque-entry greeting, unrelated to eclipses"],
    explanation: "Swalatul Kusuf is performed during a solar eclipse — the same event learners study in Integrated Science.",
  }),
  (rng) => ({
    prompt: `One night in ${place(rng)}, ${name(rng)} notices the full moon slowly darken as Earth's shadow passes over it, and the community gathers for a special prayer. Which prayer matches this event?`,
    correct: "Swalatul Khusuf",
    wrong: ["Swalatul Kusuf — performed for a solar eclipse, not a lunar one", "Tahajud — a voluntary night prayer unconnected to eclipses", "Swalatul Musafir — a travel concession, unrelated to eclipses"],
    explanation: "Swalatul Khusuf is performed during a lunar eclipse — a darkening moon at night, not the sun, is the key clue.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that praying alone at home in ${place(rng)} is just as good as joining the congregation at the mosque, since "prayer is prayer." What is the flaw in this reasoning?`,
    correct: "Congregational prayer specifically carries greater reward than praying alone, so the two are not equal in this respect",
    wrong: ["There is no flaw — praying alone always carries equal or greater reward", "Congregational prayer is only for special occasions, not daily prayer", "Prayer performed at home does not count as valid prayer at all"],
    explanation: "Praying in congregation carries greater reward than praying alone — the two are not interchangeable in reward, even though both are valid prayer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} hears the Adhan called at a mosque in ${place(rng)} but keeps chatting with friends outside, only entering once a second, shorter call is made right before the prayer starts. What is this second call, and what is its purpose?`,
    correct: "The Iqamah — it signals that the congregational prayer is about to begin immediately",
    wrong: ["The Adhan repeated a second time for latecomers", "The Khusuf — reserved only for a lunar eclipse prayer", "The Tahiyatul Masjid — a personal greeting prayer, not a group call"],
    explanation: "The Iqamah is the second call, given just before the congregational prayer actually starts, distinct from the earlier Adhan.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} skips Tahajud, Tahiyatul Masjid, and Dhuha entirely, reasoning that "they're not obligatory, so they don't matter at all." What is the most accurate response to this reasoning?`,
    correct: "Sunnah prayers are not obligatory, but performing them earns extra reward — skipping them is not sinful, but it forgoes that reward",
    wrong: ["Sunnah prayers are secretly obligatory and skipping them is sinful", "Sunnah prayers were only meant for the Prophet (S.A.W.) himself", "There is no benefit at all to performing a Sunnah prayer"],
    explanation: "Sunnah prayers are recommended, not obligatory — but they still earn extra reward, so dismissing them as pointless misses that benefit.",
  }),
];

export const swalah: Skill = {
  id: "g7-ire-da-swalah",
  code: "DA.1",
  subjectId: "ire",
  strandId: "g7-ire-devotional",
  grade: 7,
  title: "Swalah",
  description: "Congregational and named Sunnah prayers (Tahajud, Tahiyatul Masjid, Dhuha) and prayers on special occasions (Swalatul Janaza, Musafir, Kusuf, Khusuf).",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, CONGREGATIONAL_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the first call to prayer to the congregation following the Imam.",
        items,
        correctOrder: CONGREGATIONAL_STEPS.map((s) => s.id),
        hint: "The Adhan comes first; the congregation following the Imam's movements comes last.",
        explanation: CONGREGATIONAL_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const congregational = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "congregational")).slice(0, 4);
      const sunnah = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "sunnah")).slice(0, 4);
      const special = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "special")).slice(0, 4);
      const chosen = shuffle(rng, [...congregational, ...sunnah, ...special]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["congregational", "sunnah", "special"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about praying together, some are about the three named Sunnah prayers, and some are about prayers for special occasions.",
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
        hint: "Think about when each prayer is performed, or what each call to prayer signals.",
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
        hint: "Think about the timing, setting, or occasion described, not just the general topic of prayer.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Tahajud is a voluntary night prayer performed after sleeping and before", after: ".", answer: "Fajr", accepted: ["fajr"] },
      { before: "", after: "is a short greeting prayer performed upon entering a mosque, before sitting down.", answer: "Tahiyatul Masjid", accepted: ["tahiyatul masjid"] },
      { before: "Dhuha is a voluntary prayer performed during the", after: ".", answer: "mid-morning", accepted: ["mid-morning", "midmorning", "mid morning"] },
      { before: "Swalatul", after: "is the funeral prayer, performed standing, with no bowing or prostration.", answer: "Janaza", accepted: ["janaza"] },
      { before: "Swalatul Musafir allows a", after: "to shorten or combine prayers while on a journey.", answer: "traveller", accepted: ["traveller", "traveler"] },
      { before: "Swalatul Kusuf is performed during a", after: "eclipse.", answer: "solar", accepted: ["solar"] },
      { before: "Swalatul Khusuf is performed during a", after: "eclipse.", answer: "lunar", accepted: ["lunar"] },
      { before: "The call to prayer announced before congregational prayer begins is called the", after: ".", answer: "Adhan", accepted: ["adhan"] },
      { before: "The second call, given just before the congregational prayer actually starts, is called the", after: ".", answer: "Iqamah", accepted: ["iqamah"] },
      { before: "The person who leads the congregation in prayer is called the", after: ".", answer: "Imam", accepted: ["imam"] },
      { before: "In congregational prayer, worshippers stand in straight, closely-packed", after: "behind the Imam.", answer: "rows", accepted: ["rows"] },
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
      hint: "Recall the named Sunnah prayers and the prayers for special occasions.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`.trim(),
    };
  },
};
