import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// BI.3 "Bible Translation" has no natural sequence, spatial layout, or numeric quantity in
// its source content (unordered lists of versions, reasons, and effects) — so this skill
// genuinely supports only 4 QuestionKinds (multiple-choice, categorize, click-match,
// fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a social effect or an economic effect of Bible translation.",
  "Decide whether each statement is a social or economic effect, and sort it there.",
  "Group these statements under social effect or economic effect.",
  "Sort each statement below into the correct category of effect.",
  "Place each statement into the bucket for social or economic effect.",
  "Read each statement and sort it under social or economic effect.",
];

const MATCH_PROMPTS = [
  "Match each term to its meaning.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about Bible translation with the right word.",
];

const SOCIAL_EFFECTS = [
  "More people can worship and pray in the language they understand best",
  "Communities are able to preserve their own indigenous languages through Scripture",
  "Literacy improves as people learn to read in their mother tongue using the Bible",
  "Families can teach Biblical values to children in the language spoken at home",
  "Social cohesion grows as communities share a Scripture written in their own language",
] as const;

const ECONOMIC_EFFECTS = [
  "Translation and publishing work creates jobs for linguists, editors, and printers",
  "Bible societies and publishing houses generate income from producing local-language Scriptures",
  "Literacy gained through reading translated Scripture opens up better job opportunities",
  "Local-language Bible study materials create a market for local authors and teachers",
  "Church growth from accessible Scripture increases giving that supports community projects",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Hebrew", meaning: "The original language in which most of the Old Testament was written" },
  { term: "Greek", meaning: "The original language in which the New Testament was written" },
  { term: "Translation", meaning: "Rendering the Bible's message from its original languages into another language" },
  { term: "Version", meaning: "A particular translation or edition of the Bible, such as the NIV or the Good News Bible" },
  { term: "Mother tongue", meaning: "A person's first, most natural language, often spoken at home" },
  { term: "Literacy", meaning: "The ability to read and write" },
  { term: "Bible society", meaning: "An organisation dedicated to translating, publishing, and distributing Scripture" },
  { term: "Swahili Union Version", meaning: "A widely used Swahili translation of the Bible in Kenya" },
  { term: "Accessibility", meaning: "How easily people can read and understand a text in their own language" },
  { term: "Indigenous language", meaning: "A language native to a particular community or region" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s grandmother in ${place(rng)} understands her mother tongue far better than English or Swahili. Why does having the Bible translated into her mother tongue matter most for her?`,
      correct: "She can understand and connect with Scripture far more deeply in the language she knows best",
      wrong: ["Mother-tongue translations are only meant for young children", "Translation into a mother tongue removes the need to ever read the Bible", "It matters only for people who cannot read at all"],
      explanation: "People connect most deeply with Scripture in the language they understand best, which is why translating the Bible into local mother tongues remains important today.",
    };
  },
  (rng) => ({
    prompt: `A Bible translation team working near ${place(rng)} spends years learning both Hebrew and the local community's language before beginning to translate the Old Testament. Why is this careful, lengthy process necessary?`,
    correct: "Accurately translating meaning from the original Hebrew requires deep understanding of both languages, not just a quick word-for-word swap",
    wrong: ["It is unnecessary since any bilingual speaker can translate the Bible instantly", "Hebrew and the local language always have identical grammar and vocabulary", "The process is only about speed, not accuracy"],
    explanation: "Faithful translation requires deep understanding of the original language's meaning and how to express it accurately in another language — a careful, skilled process, not a quick word swap.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that Bible translation is no longer necessary today since so many versions already exist. What is the strongest response to this claim?`,
    correct: "Many communities and languages, especially smaller indigenous ones, still lack any Bible translation at all",
    wrong: ["Every language in the world already has a complete Bible translation", "New translations are always exact duplicates of older ones", "Translation work stopped being useful once the printing press was invented"],
    explanation: "Despite many existing translations, numerous languages — especially smaller indigenous ones — still have no Scripture translated into them, so the work remains genuinely necessary.",
  }),
  (rng) => ({
    prompt: `A community near ${place(rng)} sees young people read the Bible in their own indigenous language for the first time and begin learning to read more confidently overall. What effect of Bible translation does this best illustrate?`,
    correct: "A social effect — improved literacy through reading Scripture in the mother tongue",
    wrong: ["An economic effect — it is only about generating income", "No effect at all, since literacy is unrelated to Bible translation", "A political effect on government policy"],
    explanation: "Improved literacy from reading Scripture in one's own language is a social effect of Bible translation — it strengthens reading ability and community life, not primarily income.",
  }),
  (rng) => ({
    prompt: `A Bible society based near ${place(rng)} employs local linguists, editors, and printers to produce Scripture in several Kenyan languages. What effect of Bible translation does this best illustrate?`,
    correct: "An economic effect — translation and publishing work creates real jobs and income",
    wrong: ["A social effect only, with no economic impact at all", "An effect limited only to foreign countries", "No effect, since Bible societies do not employ local workers"],
    explanation: "Employing local linguists, editors, and printers for translation work is an economic effect of Bible translation, generating real jobs and income in the community.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} points out that translating Scripture into a community's own language also helps preserve that language itself for future generations. What kind of effect is this?`,
      correct: "A social effect — the Bible becomes a lasting written record that helps preserve an indigenous language",
      wrong: ["An economic effect only, unrelated to language preservation", "This has nothing to do with Bible translation at all", "A negative effect that should be avoided"],
      explanation: "A written Bible in a community's own language becomes a lasting resource that helps preserve that language for future generations — a valuable social effect.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why the Old Testament was originally written in Hebrew rather than Greek. What is the correct answer?`,
    correct: "Hebrew was the language of the ancient Israelites, who wrote most of the Old Testament",
    wrong: ["Greek did not exist when the Old Testament was written", "The Old Testament was originally written in English", "Hebrew and Greek are the exact same language"],
    explanation: "The Old Testament was written mainly in Hebrew because it was the language of the ancient Israelite writers; the New Testament was later written in Greek, the common language of its time.",
  }),
  (rng) => ({
    prompt: `${name(rng)} debates the topic, 'Bible translation is still necessary today,' for a class assignment in ${place(rng)}. What is the strongest point supporting this position?`,
    correct: "Some languages still have no Scripture translated into them, and languages themselves keep changing over time",
    wrong: ["The Bible has never needed to be translated into any language at all", "All existing translations are perfectly identical to one another", "Translation was only necessary in ancient times, not today"],
    explanation: "Some languages still lack any Bible translation, and living languages continue to change over time, meaning translation and updates remain an ongoing, necessary task.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is comparing the New International Version (NIV) and the Good News Bible, two different English versions of the Bible. What does this comparison show about 'versions' of the Bible?`,
    correct: "Different versions are different translations or editions of the same Scripture, sometimes using different translation styles",
    wrong: ["Different versions contain completely different, unrelated content", "A version only refers to the physical size or cover of a printed Bible", "Only one true version of the Bible has ever existed"],
    explanation: "A 'version' refers to a particular translation or edition of the Bible — different versions may use different translation styles while conveying the same underlying Scripture.",
  }),
];

export const bibleTranslation: Skill = {
  id: "g7-cre-bi-bible-translation",
  code: "BI.3",
  subjectId: "cre",
  strandId: "g7-cre-bible",
  grade: 7,
  title: "Bible Translation",
  description: "Versions of the Bible used today, reasons for translating the Bible into local languages, translation from the original Hebrew and Greek, and the social and economic effects of Bible translation.",
  generate(rng) {
    const branch = randChoice(rng, ["reasoning", "categorize", "match", "fill-blank"] as const);

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about why Bible translation matters and what its real effects are.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const social = shuffle(rng, SOCIAL_EFFECTS).slice(0, 4);
      const economic = shuffle(rng, ECONOMIC_EFFECTS).slice(0, 4);
      const chosen = shuffle(rng, [...social.map((t) => ({ text: t, kind: "social" })), ...economic.map((t) => ({ text: t, kind: "economic" }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "social", label: "Social effect" },
          { id: "economic", label: "Economic effect" },
        ],
        correctBucket,
        hint: "Social effects relate to community life and relationships; economic effects relate to jobs, income, and opportunity.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "social" ? "social effect" : "economic effect"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
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
        hint: "Think about the languages the Bible was written in, and the terms used to describe its translation.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const facts = [
      { before: "Most of the Old Testament was originally written in the", after: "language.", answer: "Hebrew", accepted: ["hebrew"] },
      { before: "The New Testament was originally written in the", after: "language.", answer: "Greek", accepted: ["greek"] },
      { before: "A person's first, most natural language, often spoken at home, is called their mother", after: ".", answer: "tongue", accepted: ["tongue"] },
      { before: "An organisation dedicated to translating, publishing, and distributing Scripture is called a Bible", after: ".", answer: "society", accepted: ["society"] },
      { before: "The ability to read and write is called", after: ".", answer: "literacy", accepted: ["literacy"] },
      { before: "A particular translation or edition of the Bible, such as the NIV, is called a", after: ".", answer: "version", accepted: ["version"] },
      { before: "A language native to a particular community or region is called an", after: "language.", answer: "indigenous", accepted: ["indigenous"] },
      { before: "Rendering the Bible's message from its original languages into another language is called", after: ".", answer: "translation", accepted: ["translation"] },
      { before: "A widely used Swahili translation of the Bible in Kenya is called the Swahili", after: "Version.", answer: "Union", accepted: ["union"] },
      { before: "How easily people can read and understand a text in their own language is called", after: ".", answer: "accessibility", accepted: ["accessibility"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the languages of the Bible and the reasons for Bible translation.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
