import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists for this sub-strand (unlike a surah's verse order), so the
// ordering branch uses a curriculum-reasonable real-world sequence: the steps a Muslim takes when
// choosing an item of clothing, applying this Hadith's principle of gender-appropriate dress.
const ORDER_PROMPTS = [
  "Arrange these steps for choosing gender-appropriate clothing in the order they should happen.",
  "Put these steps for deciding whether an item of clothing is appropriate into the correct order.",
  "Sequence these steps for applying this Hadith's dressing guidance, from first to last.",
  "Order these steps for choosing appropriate clothing correctly.",
  "Sort these steps for checking an item of clothing into the order they occur.",
  "Arrange these steps for deciding what to wear in the order they should be taken.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of this Hadith it describes.",
  "Group each statement under the aspect of the Hadith it describes.",
  "Decide which aspect of the Hadith each statement describes, and sort it there.",
  "Sort each fact into the aspect of the Hadith it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of the Hadith.",
];

const MATCH_PROMPTS = [
  "Match each term about this Hadith to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about dressing.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const CHOICE_STEPS = [
  { id: "look-item", label: "Look at the item of clothing or accessory being considered" },
  { id: "check-gender", label: "Check whether it is traditionally associated with your own gender" },
  { id: "check-modesty", label: "Check whether it fits Islamic guidance on modest, decent dress" },
  { id: "choose-item", label: "Choose to wear it, or choose a more suitable item if it does not fit" },
  { id: "wear-obedience", label: "Wear the chosen item with the intention of obeying Allah's guidance on dress" },
];

interface TopicFact {
  text: string;
  topic: "male" | "female" | "principle";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  male: "Clothing this teaching classifies as male attire",
  female: "Clothing and accessories this teaching classifies as female attire",
  principle: "The Hadith's general teaching on gender-appropriate dress",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Trousers are an item of clothing this teaching classifies as male attire", topic: "male" },
  { text: "Shirts are an item of clothing this teaching classifies as male attire", topic: "male" },
  { text: "Shorts are an item of clothing this teaching classifies as male attire", topic: "male" },
  { text: "A man dressing in clothing associated with women goes against this Hadith's teaching", topic: "male" },
  { text: "Skirts are an item of clothing this teaching classifies as female attire", topic: "female" },
  { text: "Blouses are an item of clothing this teaching classifies as female attire", topic: "female" },
  { text: "Necklaces, earrings and bangles are accessories this teaching classifies as female adornment", topic: "female" },
  { text: "Elaborate hair styling/dressing is an example this teaching classifies as a female form of adornment", topic: "female" },
  { text: "The Prophet (S.A.W.) cursed the man who wears women's clothing and the woman who wears men's clothing", topic: "principle" },
  { text: "Islam calls for distinct, modest dressing appropriate to one's own gender", topic: "principle" },
  { text: "Dressing according to this guidance is treated as a form of obedience (ibadah) to Allah, not just a matter of style", topic: "principle" },
  { text: "This Hadith on dressing was narrated by Abu-Daud", topic: "principle" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Gender-appropriate dressing", meaning: "Wearing clothing and accessories associated with one's own gender, as this Hadith instructs" },
  { term: "Ibadah", meaning: "Worship/obedience — how Islam treats dressing appropriately, not merely a matter of personal style" },
  { term: "Modesty", meaning: "Dressing in a way that is decent and appropriate, a key purpose behind Islamic dress guidance" },
  { term: "Abu-Daud", meaning: "The collector of Hadith who narrated this saying of the Prophet (S.A.W.) on dressing" },
  { term: "Tashabbuh", meaning: "Imitating or resembling the opposite gender in dress, which this Hadith warns against" },
  { term: "Sunnah", meaning: "The example and teaching of the Prophet (S.A.W.), which guides how Muslims should dress" },
  { term: "Adornment", meaning: "Items such as jewellery or hair styling used to enhance appearance, which this teaching also treats as gendered" },
  { term: "Attire", meaning: "General clothing worn by a person, which this Hadith says should match one's own gender" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, is helping sort donated clothing at a school drive in ${place(rng)} into two boxes: trousers, shirts and shorts in one box, and skirts and blouses in another. Which classification matches this Hadith's teaching?`,
    correct: "Trousers, shirts and shorts as male attire, and skirts and blouses as female attire",
    wrong: [
      "All items in one box, since this Hadith says clothing type does not matter at all",
      "Trousers and skirts as male attire, with shirts, shorts and blouses as female attire",
      "The classification should be based only on the colour of the items, not their type",
    ],
    explanation: "This teaching classifies trousers, shirts and shorts as male attire, and skirts and blouses as female attire, matching the everyday clothing examples the curriculum names.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A friend asks ${who} in ${place(rng)} why Islam teaches that males and females should dress differently. What is the best answer, based on this Hadith?`,
      correct: "It is part of obeying Allah's guidance on modest, gender-appropriate dress, not just a matter of fashion",
      wrong: [
        "It is only a local cultural custom with no connection to Islamic teaching",
        "It is simply about which colours look better on each gender",
        "It has no real reason and is not actually part of Islamic teaching",
      ],
      explanation: "The Hadith links gender-appropriate dressing to the Prophet's (S.A.W.) own guidance, making it an act of obedience (ibadah) and modesty, not a cultural preference alone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says: "This Hadith is just an old tradition and is not real Islamic teaching." Evaluate this claim.`,
    correct: "Incorrect — this is an authentic Hadith of the Prophet (S.A.W.), narrated by Abu-Daud, and part of genuine Islamic guidance",
    wrong: [
      "Correct — Hadith narrations are never a real source of Islamic teaching",
      "Correct — dressing guidance was invented later and was never part of the Prophet's (S.A.W.) teaching",
      "Incorrect — but only because it was narrated by Muslim, not Abu-Daud",
    ],
    explanation: "This Hadith is a genuine, narrated saying of the Prophet (S.A.W.), making it an authentic part of Islamic teaching on dress, not a mere cultural tradition.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} is choosing an accessory gift — a necklace or a plain wristwatch — for a young female relative. Applying this Hadith's classification, which gift most clearly fits female adornment as this teaching describes it?`,
      correct: "The necklace, since necklaces are classified as female adornment in this teaching",
      wrong: [
        "Neither, since accessories are never classified by gender in this teaching",
        "The wristwatch, since watches are classified as female adornment in this teaching",
        "Both equally, since gender classification does not apply to gifts",
      ],
      explanation: "Necklaces are named among the accessories this teaching classifies as female adornment, alongside earrings and bangles.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues: "Since this Hadith is about clothing, it has nothing to do with obedience to Allah — it's only about appearance." Is this reasoning sound?`,
    correct: "No — the Hadith treats gender-appropriate dressing as a form of obedience (ibadah) to Allah, not merely a matter of appearance",
    wrong: [
      "Yes — clothing choices are always separate from acts of worship in Islam",
      "Yes — only prayer and fasting count as obedience to Allah, never dressing",
      "No — but only because appearance is actually the most important thing in Islam",
    ],
    explanation: "This Hadith frames dressing appropriately as part of following the Prophet's (S.A.W.) guidance, which makes it an act of obedience, not simply a style choice.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A teacher in ${place(rng)} shows ${who}'s class pictures of shorts, blouses, bangles and shirts, and asks learners to sort them by gender association in this teaching. Where should bangles be placed?`,
      correct: "With items classified as female adornment, alongside necklaces and earrings",
      wrong: [
        "With items classified as male attire, alongside shirts and shorts",
        "In neither group, since bangles are not mentioned in this teaching at all",
        "Split evenly between both groups, since gender does not apply to jewellery",
      ],
      explanation: "Bangles are named alongside necklaces and earrings as accessories this teaching classifies as female adornment.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says: "As long as clothing looks nice, it doesn't matter whether it matches traditional male or female styles." Applying this Hadith, what is the issue with this view?`,
    correct: "The Hadith specifically instructs dressing according to one's own gender, not merely dressing to look attractive",
    wrong: [
      "There is no issue — appearance is the only thing this Hadith cares about",
      "The issue is that looking nice is forbidden in Islam altogether",
      "The issue is that this Hadith only applies to adults, not learners",
    ],
    explanation: "This Hadith's concern is gender-appropriate dressing specifically, not general attractiveness — the two are related but not the same standard.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked to explain, in their own words, the overall purpose behind this Hadith's teaching on dressing. Which explanation best fits the Hadith?`,
    correct: "Distinct, modest dressing for each gender is part of a Muslim's character and obedience to Allah's guidance",
    wrong: [
      "The purpose is to make shopping for clothes more complicated for no real reason",
      "The purpose is to ensure only wealthy families can afford appropriate clothing",
      "The purpose is unrelated to Islam and only about following current fashion trends",
    ],
    explanation: "This teaching connects distinct, modest, gender-appropriate dressing to Islamic character and obedience — not fashion, cost, or arbitrary complication.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is packing for a school trip and is unsure which items count as their own gender's clothing among a mixed pile that includes trousers and skirts. Applying this teaching, how should ${who} decide?`,
      correct: "Pack the items classified as matching their own gender in this teaching, such as trousers for a boy or a skirt for a girl",
      wrong: [
        "Pack items at random, since gender classification does not matter for a short trip",
        "Pack whichever items are cleanest, regardless of gender classification",
        "Avoid packing any clothing at all rather than deciding",
      ],
      explanation: "Applying this Hadith means choosing clothing that matches one's own gender as this teaching classifies it — trousers for males, skirts for females, among the examples given.",
    };
  },
];

export const hadithOnDressing: Skill = {
  id: "g6-ire-ha-dressing",
  code: "HA.2",
  subjectId: "ire",
  strandId: "g6-ire-hadith",
  grade: 6,
  title: "Hadith on Dressing",
  description: "The Hadith on dressing — the Prophet (S.A.W.) cursed the man who wears women's clothing and the woman who wears men's clothing (Abu-Daud): distinct, modest, gender-appropriate dress in Islam.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, CHOICE_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from first look to final choice.",
        items,
        correctOrder: CHOICE_STEPS.map((s) => s.id),
        hint: "It starts with looking at the item, and ends with wearing the chosen item with the right intention.",
        explanation: CHOICE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const male = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "male")).slice(0, 3);
      const female = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "female")).slice(0, 3);
      const principle = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "principle")).slice(0, 3);
      const chosen = shuffle(rng, [...male, ...female, ...principle]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["male", "female", "principle"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements name male attire, some name female attire/adornment, and some state the Hadith's general teaching.",
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
        hint: "Think about what each term refers to in the Hadith's teaching on dressing.",
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
        hint: "Think about which items this teaching classifies by gender, and why gender-appropriate dressing matters in Islam.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Messenger of Allah (S.A.W.) cursed the man who wears", after: "clothing and the woman who wears men's clothing.", answer: "women's", accepted: ["women's", "womens"] },
      { before: "The Messenger of Allah (S.A.W.) cursed the man who wears women's clothing and the woman who wears", after: "clothing.", answer: "men's", accepted: ["men's", "mens"] },
      { before: "This Hadith on dressing was narrated by", after: ".", answer: "Abu-Daud", accepted: ["abu-daud", "abu daud"] },
      { before: "Trousers, shirts and shorts are classified in this teaching as", after: "attire.", answer: "male", accepted: ["male"] },
      { before: "Skirts and blouses are classified in this teaching as", after: "attire.", answer: "female", accepted: ["female"] },
      { before: "Necklaces, earrings and bangles are accessories classified as female", after: ".", answer: "adornment", accepted: ["adornment"] },
      { before: "Dressing according to this Hadith's guidance is treated as a form of", after: "(obedience) to Allah.", answer: "ibadah", accepted: ["ibadah", "worship", "obedience"] },
      { before: "Islam calls for distinct,", after: "dressing appropriate to one's own gender.", answer: "modest", accepted: ["modest"] },
      { before: "Imitating or resembling the opposite gender in dress is called", after: "in this teaching.", answer: "tashabbuh", accepted: ["tashabbuh"] },
      { before: "Elaborate hair styling/dressing is an example this teaching classifies as a", after: "form of adornment.", answer: "female", accepted: ["female"] },
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
      hint: "Recall exactly what this Hadith says, and how it classifies clothing and accessories by gender.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
