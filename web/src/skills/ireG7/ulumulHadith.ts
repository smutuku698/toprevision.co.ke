import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: the four forms of Hadith and its two types are a classification,
// not a curriculum-stated sequence of steps — inventing an order here would violate
// SKILL-QUALITY-STANDARDS.md's "never invent an order the curriculum doesn't state" rule.

const CATEGORIZE_PROMPTS = [
  "Sort each account by which form of Hadith it illustrates.",
  "Group each account under the form of Hadith it illustrates.",
  "Decide which form of Hadith each account illustrates, and sort it there.",
  "Sort each account into the form of Hadith it belongs to.",
  "Place each account under the form of Hadith it illustrates.",
  "Read each account and sort it under the matching form of Hadith.",
];

const MATCH_PROMPTS = [
  "Match each term about Hadith to its meaning.",
  "Pair each term about Hadith with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about Hadith to the definition that fits it.",
  "Choose the correct meaning for each term about Hadith.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface FormExample {
  form: "Qaul" | "Fiil" | "Taqrir" | "Sifat";
  example: string;
}
const FORM_MEANING: Record<FormExample["form"], string> = {
  Qaul: "A saying — something the Prophet (S.A.W.) said",
  Fiil: "An action — something the Prophet (S.A.W.) did",
  Taqrir: "An approval — something a companion said or did that the Prophet (S.A.W.) saw and did not object to",
  Sifat: "A description — an account of the Prophet's (S.A.W.) physical or moral attributes",
};
const FORM_EXAMPLES: FormExample[] = [
  { form: "Qaul", example: "'Actions are judged by intentions' — a statement the Prophet (S.A.W.) spoke" },
  { form: "Qaul", example: "The Prophet (S.A.W.) telling companions the ruling on a matter they asked about" },
  { form: "Qaul", example: "A recorded warning the Prophet (S.A.W.) gave about bad character" },
  { form: "Fiil", example: "A companion's account of exactly how the Prophet (S.A.W.) performed wudhu" },
  { form: "Fiil", example: "A description of how the Prophet (S.A.W.) prayed, step by step" },
  { form: "Fiil", example: "An account of how the Prophet (S.A.W.) greeted guests in his home" },
  { form: "Taqrir", example: "A companion ate a certain food in front of the Prophet (S.A.W.), who said nothing against it" },
  { form: "Taqrir", example: "The Prophet (S.A.W.) saw a companion perform an act of worship in a slightly different way and did not correct it" },
  { form: "Taqrir", example: "A companion's private practice that the Prophet (S.A.W.) knew about and allowed to continue" },
  { form: "Sifat", example: "A companion's account of the Prophet's (S.A.W.) gentle, patient character" },
  { form: "Sifat", example: "A description of the Prophet's (S.A.W.) physical appearance passed down by his companions" },
  { form: "Sifat", example: "An account describing the Prophet's (S.A.W.) generosity as a personal trait" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Hadith", meaning: "A recorded saying, action, approval, or description of the Prophet (S.A.W.) — the second source of Sharia" },
  { term: "Sanad", meaning: "The chain of narrators through which a Hadith was passed down" },
  { term: "Matn", meaning: "The actual wording/content of a Hadith" },
  { term: "Hadith Qudsy", meaning: "A Hadith whose meaning is inspired by Allah but spoken by the Prophet (S.A.W.) in his own words, distinct from the Qur'an" },
  { term: "Hadith Nabawy", meaning: "A Hadith that is entirely the Prophet's (S.A.W.) own words, not directly attributed to Allah" },
  { term: "Qaul", meaning: "The form of Hadith that is a saying of the Prophet (S.A.W.)" },
  { term: "Fiil", meaning: "The form of Hadith that is an action of the Prophet (S.A.W.)" },
  { term: "Taqrir", meaning: "The form of Hadith that is the Prophet's (S.A.W.) silent approval" },
  { term: "Sifat", meaning: "The form of Hadith describing the Prophet's (S.A.W.) attributes or character" },
  { term: "Second source of Sharia", meaning: "How Hadith is ranked after the Qur'an as a source of Islamic law" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads an account describing exactly how the Prophet (S.A.W.) performed wudhu, step by step. Which form of Hadith is this?`,
    correct: "Fiil — an action the Prophet (S.A.W.) performed",
    wrong: ["Qaul — this form only covers his sayings, not his actions", "Taqrir — this form only covers his silent approval of others", "Sifat — this form only covers descriptions of his character"],
    explanation: "Fiil is the form of Hadith describing an action the Prophet (S.A.W.) performed — exactly what a step-by-step account of his wudhu records.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds an account of a companion eating a certain food in front of the Prophet (S.A.W.), who said nothing to stop him. Which form of Hadith does this illustrate?`,
      correct: "Taqrir — the Prophet's (S.A.W.) silent approval of a companion's action",
      wrong: ["Qaul — this requires the Prophet (S.A.W.) to have spoken, which he did not here", "Fiil — this requires the Prophet (S.A.W.) himself to act, not a companion", "Sifat — this describes attributes, not an approved action"],
      explanation: "Taqrir is the Prophet's (S.A.W.) silent approval — he witnessed the companion's action and did not object, which counts as tacit endorsement.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is studying a Hadith whose wording is understood to be inspired by Allah, but spoken by the Prophet (S.A.W.) in his own words rather than being part of the Qur'an. What type of Hadith is this?`,
    correct: "Hadith Qudsy",
    wrong: ["Hadith Nabawy — this type is entirely the Prophet's (S.A.W.) own words with no divine inspiration attached", "This is actually a verse of the Qur'an, not a Hadith at all", "Sanad — this is a chain of narrators, not a type of Hadith"],
    explanation: "Hadith Qudsy carries meaning inspired by Allah while being expressed in the Prophet's (S.A.W.) own wording — distinct from both the Qur'an and ordinary Hadith Nabawy.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that since Hadith is only the 'second' source of Sharia, it can be safely ignored whenever it seems inconvenient. Evaluate this reasoning.`,
    correct: "Flawed — being the second source after the Qur'an does not make Hadith optional; it remains a primary, binding source of guidance for a Muslim's daily conduct",
    wrong: ["Sound — only the Qur'an carries any real authority in Islam", "Sound — Hadith is a modern addition with no real authority", "Flawed — Hadith is actually ranked above the Qur'an in authority"],
    explanation: "Ranking after the Qur'an describes the order sources are consulted, not a lower level of authority — Hadith remains binding guidance, not an optional extra.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to trace exactly which narrators passed a Hadith down before it reached today's collections. Which part of the Hadith is being examined?`,
      correct: "The Sanad — the chain of narrators",
      wrong: ["The Matn — this is the wording/content, not the chain of narrators", "The Sifat — this describes attributes, not a chain of transmission", "The Qaul — this is a form of Hadith, not a part of its structure"],
      explanation: "The Sanad is specifically the chain of narrators through which a Hadith was transmitted — separate from the Matn, which is its actual content.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads a companion's account describing the Prophet's (S.A.W.) patience and gentle character rather than any specific saying or deed. Which form of Hadith is this an example of?`,
    correct: "Sifat — a description of the Prophet's (S.A.W.) attributes",
    wrong: ["Qaul — this requires a specific recorded saying, not a general character trait", "Fiil — this requires a specific recorded action, not a general trait", "Taqrir — this requires an approval of someone else's act"],
    explanation: "Sifat covers descriptions of the Prophet's (S.A.W.) physical or moral attributes — a companion's account of his character fits this form exactly.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that only Hadith Nabawy should be respected, since Hadith Qudsy is 'not really from the Prophet (S.A.W.) at all.' What is the flaw in this reasoning?`,
    correct: "Both types are genuine Hadith attributed to the Prophet (S.A.W.) — Hadith Qudsy is inspired in meaning by Allah but is still transmitted through and expressed by the Prophet (S.A.W.) himself",
    wrong: ["There is no flaw — Hadith Qudsy should indeed be disregarded", "Hadith Qudsy is actually a direct verse of the Qur'an, so the claim is correct for a different reason", "Hadith Nabawy is the one that should be disregarded instead"],
    explanation: "Hadith Qudsy is not the Qur'an, but it is still genuinely attributed to the Prophet (S.A.W.), who expressed Allah-inspired meaning in his own words — dismissing it misunderstands what makes it distinct.",
  }),
  (rng) => ({
    prompt: `${name(rng)} explains to a classmate in ${place(rng)} why studying the components of Hadith (Sanad and Matn) matters. What is the best reason?`,
    correct: "Checking both the chain of narrators and the actual wording helps confirm a Hadith's reliability before relying on it as guidance",
    wrong: ["It matters only for entertainment, with no real effect on how a Hadith is used", "Only the Matn ever needs checking; the Sanad has no real importance", "Only the Sanad ever needs checking; the Matn's wording never needs review"],
    explanation: "Both the Sanad (chain of narrators) and the Matn (wording) matter for assessing a Hadith's reliability — checking only one leaves an incomplete picture.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that emulating the Prophet's (S.A.W.) life, as described through Hadith, has no real connection to earning reward from Allah. Evaluate this claim.`,
    correct: "Flawed — Hadith preserves the Prophet's (S.A.W.) example precisely so Muslims can emulate it and earn Allah's reward through following his guidance",
    wrong: ["Sound — Hadith exists only as historical record with no spiritual value", "Sound — emulating the Prophet (S.A.W.) is only relevant to scholars, not ordinary Muslims", "Flawed — but only because Hadith has nothing to do with the Prophet's (S.A.W.) life at all"],
    explanation: "Hadith records the Prophet's (S.A.W.) example specifically so Muslims can follow it in daily life — emulating that example is a direct way of earning Allah's reward.",
  }),
  (rng) => ({
    prompt: `${name(rng)} finds two Hadith on the same topic and wants to know which type each is, but the account only says a companion's action went unchallenged by the Prophet (S.A.W.) with no direct words from him. What form is this?`,
    correct: "Taqrir",
    wrong: ["Qaul, since any Hadith not involving direct action must be a saying", "Fiil, since the companion's action alone counts as the Prophet's (S.A.W.) own action", "Sifat, since any silent scene describes an attribute"],
    explanation: "An unchallenged companion action, witnessed and not objected to by the Prophet (S.A.W.), is specifically Taqrir — his silent approval, not his own saying, action, or a description of his attributes.",
  }),
];

export const ulumulHadith: Skill = {
  id: "g7-ire-ha-ulumul-hadith",
  code: "HA.1",
  subjectId: "ire",
  strandId: "g7-ire-hadith",
  grade: 7,
  title: "Ulumul Hadith",
  description: "The meaning of Hadith, its forms (Qaul, Fiil, Taqrir, Sifat), its components (Sanad, Matn), its types (Qudsy, Nabawy), and its importance as the second source of Sharia.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const forms = (["Qaul", "Fiil", "Taqrir", "Sifat"] as const).flatMap((f) =>
        shuffle(rng, FORM_EXAMPLES.filter((e) => e.form === f)).slice(0, 2)
      );
      const chosen = shuffle(rng, forms);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.example }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.form));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["Qaul", "Fiil", "Taqrir", "Sifat"] as const).map((f) => ({ id: f, label: `${f} (${FORM_MEANING[f].split(" — ")[0].toLowerCase()})` })),
        correctBucket,
        hint: "Qaul is a saying, Fiil is an action, Taqrir is silent approval, and Sifat is a description of attributes.",
        explanation: chosen.map((f) => `"${f.example}" — ${f.form} (${FORM_MEANING[f.form].toLowerCase()}).`).join(" "),
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
        hint: "Think about whether the term names a form, a component, a type, or Hadith's ranking as a source.",
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
        hint: "Decide whether the account describes a saying, an action, a silent approval, or a description of character.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "A saying of the Prophet (S.A.W.) is classified as the Hadith form called", after: ".", answer: "Qaul", accepted: ["qaul"] },
      { before: "An action performed by the Prophet (S.A.W.) is classified as the Hadith form called", after: ".", answer: "Fiil", accepted: ["fiil", "fi'il"] },
      { before: "The Prophet's (S.A.W.) silent approval of a companion's act is the Hadith form called", after: ".", answer: "Taqrir", accepted: ["taqrir"] },
      { before: "A description of the Prophet's (S.A.W.) attributes is the Hadith form called", after: ".", answer: "Sifat", accepted: ["sifat"] },
      { before: "The chain of narrators through which a Hadith is passed down is called its", after: ".", answer: "Sanad", accepted: ["sanad"] },
      { before: "The actual wording/content of a Hadith is called its", after: ".", answer: "Matn", accepted: ["matn"] },
      { before: "A Hadith whose meaning is inspired by Allah but spoken in the Prophet's (S.A.W.) own words is called Hadith", after: ".", answer: "Qudsy", accepted: ["qudsy"] },
      { before: "A Hadith that is entirely the Prophet's (S.A.W.) own words is called Hadith", after: ".", answer: "Nabawy", accepted: ["nabawy"] },
      { before: "Hadith is ranked as the", after: "source of Sharia, after the Qur'an.", answer: "second", accepted: ["second", "2nd"] },
      { before: "Following the Prophet's (S.A.W.) example as recorded in Hadith is one way to earn Allah's", after: ".", answer: "rewards", accepted: ["rewards", "reward"] },
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
      hint: "Recall the forms, components, and types of Hadith.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
