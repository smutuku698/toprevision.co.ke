import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The Farewell Sermon's own well-known themes, presented in a sensible teaching order, are
// standard, widely-taught content — not an invented sequence.
const ORDER_PROMPTS = [
  "Arrange these themes of the Farewell Sermon in a sensible order.",
  "Put these themes of Hijjatul Wid'a into a sensible order.",
  "Sequence these themes of the Farewell Sermon in a sensible order.",
  "Order these themes as they are commonly presented in the Farewell Sermon.",
  "Sort these themes of the Farewell Sermon into a sensible order.",
  "Arrange these Farewell Sermon themes in a sensible order.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which theme of the Farewell Sermon it relates to.",
  "Group each statement under the theme it relates to.",
  "Decide which theme each statement relates to, and sort it there.",
  "Sort each fact into the theme it belongs to.",
  "Place each statement under the theme it relates to.",
  "Read each statement and sort it under the matching theme.",
];

const MATCH_PROMPTS = [
  "Match each term about the Farewell Sermon to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about the sermon.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const SERMON_THEMES = [
  { id: "sanctity", label: "The sanctity/inviolability of a Muslim's life and property is declared" },
  { id: "equality", label: "The equality of all people is affirmed, regardless of race — only piety matters" },
  { id: "womens-rights", label: "The rights of women are emphasised" },
  { id: "abolishing-jahiliyyah", label: "Blood feuds and unfair financial dues (riba) from before Islam are declared void" },
  { id: "brotherhood", label: "Muslim brotherhood is emphasised, and wronging a fellow Muslim's property is forbidden" },
  { id: "hold-quran", label: "The instruction to hold fast to the Qur'an as the enduring guide is given" },
];

interface TopicFact {
  text: string;
  topic: "the-occasion" | "the-themes" | "the-significance";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "the-occasion": "The occasion of the sermon",
  "the-themes": "The sermon's key themes",
  "the-significance": "Why the sermon matters",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Prophet (S.A.W.) performed his only Hajj in 632 CE (10 AH), known as the Farewell Pilgrimage", topic: "the-occasion" },
  { text: "He delivered the Farewell Sermon at Mount Arafat", topic: "the-occasion" },
  { text: "The sermon was addressed to a very large gathering of Muslims", topic: "the-occasion" },
  { text: "The Prophet (S.A.W.) passed away later that same year", topic: "the-occasion" },
  { text: "The sermon declares the sanctity of a Muslim's life and property", topic: "the-themes" },
  { text: "The sermon states there is no superiority of an Arab over a non-Arab except through piety", topic: "the-themes" },
  { text: "The sermon calls for women to be treated well and kindly", topic: "the-themes" },
  { text: "The sermon declares blood feuds and financial dues from before Islam void", topic: "the-themes" },
  { text: "The sermon establishes fundamental human rights and equality principles", topic: "the-significance" },
  { text: "The sermon calls Muslims to unity and brotherhood, away from old tribal grudges", topic: "the-significance" },
  { text: "The sermon instructs Muslims to hold fast to the Qur'an so they would not go astray after the Prophet (S.A.W.)", topic: "the-significance" },
  { text: "The sermon's themes remain relevant to Muslims applying its lessons in daily life today", topic: "the-significance" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Hijjatul Wid'a", meaning: "The Farewell Pilgrimage — the Prophet's (S.A.W.) only Hajj, performed in 632 CE" },
  { term: "Khutbatul Wada", meaning: "The Farewell Sermon, delivered at Mount Arafat during the Farewell Pilgrimage" },
  { term: "Mount Arafat", meaning: "The location where the Prophet (S.A.W.) delivered the Farewell Sermon" },
  { term: "Sanctity of life and property", meaning: "A key theme of the sermon, declaring these as sacred as the day and place" },
  { term: "Equality regardless of race", meaning: "A key theme stating no Arab is superior to a non-Arab except through piety" },
  { term: "Riba", meaning: "Unfair financial dues (usury/interest) from before Islam, declared void in the sermon" },
  { term: "Jahiliyyah", meaning: "The pre-Islamic period, whose blood feuds and unfair financial practices the sermon declared void" },
  { term: "Holding fast to the Qur'an", meaning: "The Prophet's (S.A.W.) instruction so Muslims would not go astray after him" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, hears a classmate claim that one ethnic group is naturally better than another. Applying the Farewell Sermon's teaching on equality, how should ${who} respond?`,
      correct: "Point out that the sermon explicitly rejects any superiority based on race or ethnicity, stating only piety and good deeds matter",
      wrong: [
        "Agree, since the sermon actually supports the idea that some groups are naturally superior",
        "Stay silent, since the sermon has nothing to say about equality",
        "Change the subject, since this teaching only applied to Arabs at the time",
      ],
      explanation: "The Farewell Sermon explicitly declares no superiority of an Arab over a non-Arab (or vice versa) except through piety — directly contradicting claims of ethnic superiority.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} witnesses an old grudge between two families in the community being used to justify continued hostility between their children. Applying the Farewell Sermon's teaching, what does this go against?`,
      correct: "The sermon's declaration that blood feuds from before Islam are void, calling instead for unity and brotherhood",
      wrong: [
        "Nothing, since the sermon actually encourages continuing old family grudges",
        "The sermon's teaching on women's rights, which is unrelated to family feuds",
        "The sermon's instruction about the Qur'an, which has nothing to do with grudges",
      ],
      explanation: "The Farewell Sermon explicitly declares blood feuds from before Islam void, calling Muslims toward brotherhood rather than carrying old grudges forward.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that the Farewell Sermon's teaching on the sanctity of property means people should never be held accountable for anything. Evaluate this reasoning.`,
    correct: "Flawed — the sermon's point is that a Muslim's life and property should not be wrongfully violated, not that accountability itself should be abolished",
    wrong: [
      "Sound — the sermon abolishes all forms of accountability entirely",
      "Sound — sanctity of property means laws and consequences no longer apply",
      "Flawed — but only because the sermon never actually discusses property at all",
    ],
    explanation: "The sanctity of life and property in the sermon is about protecting people from being wrongfully harmed or exploited, not about eliminating fair accountability altogether.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why the Prophet (S.A.W.) chose to deliver such a comprehensive sermon during his only Hajj, shortly before his passing. What is the best explanation?`,
      correct: "To leave clear, lasting guidance for the Muslim community on core values, since he would not have another opportunity to address them in this way",
      wrong: [
        "The timing had no particular significance and was purely coincidental",
        "The sermon was meant only for the people physically present, with no lasting relevance",
        "He intended the sermon's teachings to apply only for a single year",
      ],
      explanation: "Delivering comprehensive guidance during his only Hajj, shortly before his passing, reflects the intention to leave clear, lasting teachings for the wider Muslim community.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says the sermon's call to hold fast to the Qur'an means Muslims should ignore everything else the Prophet (S.A.W.) taught. Is this an accurate reading?`,
    correct: "No — the instruction highlights the Qur'an as the enduring guide so Muslims would not go astray, not a rejection of the Prophet's (S.A.W.) other teachings",
    wrong: [
      "Yes — the sermon explicitly rejects all of the Prophet's (S.A.W.) other teachings",
      "Yes — holding fast to the Qur'an means avoiding the Sunnah entirely",
      "No — but only because the Qur'an and the sermon are actually the same document",
    ],
    explanation: "The instruction to hold fast to the Qur'an emphasises its role as the enduring guide, not a rejection of the Prophet's (S.A.W.) broader example and teachings.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how the Farewell Sermon's teaching on women's rights might apply to how ${who} treats a sister or female classmate today. What is the best application?`,
      correct: "Treating women and girls with kindness and fairness, reflecting the sermon's explicit call for good treatment of women",
      wrong: [
        "Ignoring the teaching, since it applied only to adults in the 7th century",
        "Treating women and girls with less consideration than boys, since the sermon supports this",
        "Assuming the teaching has no relevance to everyday classroom or family behaviour",
      ],
      explanation: "The sermon's call for women to be treated well and kindly is a value meant to be applied in everyday conduct, including how a learner treats sisters or classmates.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that the Farewell Sermon is only a historical speech with no connection to how a Muslim should live today. Evaluate this claim.`,
    correct: "Flawed — its themes (equality, sanctity of life and property, women's rights, brotherhood) are presented as lasting principles meant to guide conduct in any era",
    wrong: [
      "Sound — the sermon's teachings applied only to the specific audience present that day",
      "Sound — the sermon has no relevance beyond its historical context",
      "Flawed — but only because the sermon is legally binding rather than morally instructive",
    ],
    explanation: "The Farewell Sermon's themes — equality, sanctity of life and property, women's rights, brotherhood — are presented as enduring principles, not historical facts with no present relevance.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the abolition of riba (unfair financial dues) in the sermon means all forms of trade and lending were also abolished. Is this accurate?`,
    correct: "No — the sermon specifically declares unfair financial dues/usury from before Islam void, not trade or fair lending in general",
    wrong: [
      "Yes — the sermon forbids any form of trade or lending whatsoever",
      "Yes — riba refers to all financial transactions of any kind",
      "No — but only because riba actually refers exclusively to agricultural trade",
    ],
    explanation: "The sermon specifically addresses unfair financial dues (riba/usury) from the pre-Islamic period, not trade or lending as a whole.",
  }),
];

export const farewellPilgrimage: Skill = {
  id: "g6-ire-hi-farewell-pilgrimage",
  code: "HI.4",
  subjectId: "ire",
  strandId: "g6-ire-history",
  grade: 6,
  title: "Farewell Pilgrimage (Hijjatul Wid'a) — the Farewell Sermon",
  description: "The Farewell Sermon (632 CE), delivered at Mount Arafat: the sanctity of life and property, equality regardless of race, the rights of women, the abolition of old blood feuds and riba, Muslim brotherhood, and holding fast to the Qur'an.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, SERMON_THEMES);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in a sensible order for how the sermon's themes are commonly presented.",
        items,
        correctOrder: SERMON_THEMES.map((s) => s.id),
        hint: "The sermon moves from sanctity of life/property and equality, through women's rights and old grudges, to brotherhood and holding fast to the Qur'an.",
        explanation: SERMON_THEMES.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const occasion = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-occasion")).slice(0, 3);
      const themes = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-themes")).slice(0, 3);
      const significance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "the-significance")).slice(0, 3);
      const chosen = shuffle(rng, [...occasion, ...themes, ...significance]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["the-occasion", "the-themes", "the-significance"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the occasion of the sermon, some about its key themes, and some about why it matters.",
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
        hint: "Think about what each term refers to in the Farewell Sermon.",
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
        hint: "Think about which theme of the Farewell Sermon the situation applies.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Prophet (S.A.W.) performed his only Hajj, known as the Farewell", after: ", in 632 CE.", answer: "Pilgrimage", accepted: ["pilgrimage"] },
      { before: "The Farewell Sermon was delivered at Mount", after: ".", answer: "Arafat", accepted: ["arafat"] },
      { before: "The sermon declares no superiority of an Arab over a non-Arab except through", after: ".", answer: "piety", accepted: ["piety"] },
      { before: "The sermon calls for", after: "to be treated well and kindly.", answer: "women", accepted: ["women"] },
      { before: "The sermon declares blood feuds and unfair financial dues from before Islam", after: ".", answer: "void", accepted: ["void"] },
      { before: "The sermon emphasises Muslim", after: ", forbidding wronging a fellow Muslim's property.", answer: "brotherhood", accepted: ["brotherhood"] },
      { before: "The sermon instructs Muslims to hold fast to the", after: "as their enduring guide.", answer: "Qur'an", accepted: ["qur'an", "quran"] },
      { before: "The sermon declares the sanctity of a Muslim's life and", after: ".", answer: "property", accepted: ["property"] },
      { before: "The Prophet (S.A.W.) passed away later the same", after: "as the Farewell Sermon.", answer: "year", accepted: ["year"] },
      { before: "Unfair financial dues from before Islam, declared void in the sermon, are called", after: ".", answer: "riba", accepted: ["riba"] },
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
      hint: "Recall the occasion and key themes of the Farewell Sermon.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
