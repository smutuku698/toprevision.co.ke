import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// A logical build-up of the Qur'an's own teachings on relating to people of other faiths —
// from the foundational principle (no compulsion) through to lived, everyday practice — not
// an invented order, but the curriculum's own progression from principle to practice.
const ORDER_PROMPTS = [
  "Arrange these ideas on relations with other faiths in a logical order, from principle to practice.",
  "Put these ideas on relating to people of other faiths into a logical order.",
  "Sequence these ideas correctly, from the founding principle to everyday practice.",
  "Order these ideas on relations with other faiths, from principle to practice.",
  "Sort these ideas into a logical order, starting with the founding principle.",
  "Arrange these ideas in the order they build from principle to daily life.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of relations with other faiths it describes.",
  "Group each statement under the aspect of relating to other faiths it describes.",
  "Decide which aspect each statement describes, and sort it there.",
  "Sort each fact into the aspect of relations with other faiths it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of this teaching.",
];

const MATCH_PROMPTS = [
  "Match each term about relations with other faiths to its meaning.",
  "Pair each term about relating to other faiths with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about relations with other faiths.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const COEXISTENCE_SEQUENCE = [
  { id: "no-compulsion", label: "The Qur'an teaches there is no compulsion in matters of religion or belief (Q2:256)" },
  { id: "free-practice", label: "Each person is recognised as free to practise their own faith, not forced into uniformity (Q109:6)" },
  { id: "incline-peace", label: "If others incline toward peace, Muslims are taught to incline toward peace too, trusting Allah (Q8:61)" },
  { id: "kind-just", label: "Allah does not forbid kindness and just dealings with people of other faiths who are not hostile (Q60:8)" },
  { id: "respectful-dialogue", label: "Muslims are encouraged to engage in respectful dialogue and fair dealings in daily life" },
  { id: "shared-community", label: "Communities live harmoniously together, including sharing in community and national occasions" },
];

interface TopicFact {
  text: string;
  topic: "teachings" | "rights" | "practice";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  teachings: "Qur'anic teachings on relations with other faiths",
  rights: "Rights of people of other faiths",
  practice: "Ways of promoting good relations",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Qur'an states there is no compulsion in matters of religion (Q2:256)", topic: "teachings" },
  { text: "Muslims are taught to incline toward peace when others do, trusting in Allah (Q8:61)", topic: "teachings" },
  { text: "Allah does not forbid kindness and just dealings with those who are not hostile toward Muslims (Q60:8)", topic: "teachings" },
  { text: "The principle \"for you is your religion, and for me is mine\" reflects peaceful coexistence, not forced uniformity (Q109:6)", topic: "teachings" },
  { text: "People of other faiths have the freedom to practise their own religion without compulsion", topic: "rights" },
  { text: "People of other faiths deserve fair and kind treatment in everyday dealings", topic: "rights" },
  { text: "People of other faiths deserve respect and protection as neighbours and fellow citizens", topic: "rights" },
  { text: "Non-Muslims who are not hostile toward Muslims should not be mistreated or driven from their homes", topic: "rights" },
  { text: "Respectful dialogue helps build good relations between people of different faiths", topic: "practice" },
  { text: "Avoiding discrimination in trade and social dealings promotes harmony", topic: "practice" },
  { text: "Celebrating shared community and national occasions together strengthens coexistence", topic: "practice" },
  { text: "Kindness in everyday interactions with people of other faiths is encouraged, not merely tolerated", topic: "practice" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Q2:256", meaning: "The verse teaching there is no compulsion in matters of religion" },
  { term: "Q8:61", meaning: "The verse teaching Muslims to incline toward peace if others do, trusting Allah" },
  { term: "Q60:8", meaning: "The verse teaching that kindness and just dealings are not forbidden toward non-hostile people of other faiths" },
  { term: "Q109:6", meaning: "The verse containing the principle \"for you is your religion, and for me is mine\"" },
  { term: "No compulsion in religion", meaning: "The principle that no one can be forced to accept a religion against their will" },
  { term: "Peaceful coexistence", meaning: "Living together respectfully and harmoniously despite differences in faith" },
  { term: "Religious freedom", meaning: "The right of a person to practise their own faith without being forced into another" },
  { term: "Non-hostility condition", meaning: "The idea in Q60:8 that kindness is due to people of other faiths who have not been hostile toward Muslims" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}'s new classmate in ${place(rng)} practises a different religion. Some learners pressure the classmate to convert to Islam to be accepted into the friend group. Applying the Qur'an's teaching, what is wrong with this?`,
    correct: "The Qur'an teaches there is no compulsion in matters of religion — belief cannot be forced on anyone",
    wrong: [
      "Nothing is wrong, since true friendship always requires sharing the exact same religion",
      "It is wrong only because the pressure was not persistent or persuasive enough",
      "It is wrong, but only because the classmate is new, not because of the pressure itself",
    ],
    explanation: "Q2:256 teaches there is no compulsion in religion — pressuring anyone to convert directly contradicts this foundational teaching.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s neighbour in ${place(rng)}, who follows a different faith, brings food to their family during a difficult time. How should ${who}'s family respond, based on Q60:8?`,
      correct: "Accept the kindness graciously and reciprocate, since Allah does not forbid kindness toward non-hostile people of other faiths",
      wrong: [
        "Politely refuse, since accepting help from someone of another faith is discouraged",
        "Accept it, but avoid any future contact to keep the relationship purely one-sided",
        "Accept it only because rejecting food would be considered rude, not because kindness is actually encouraged",
      ],
      explanation: "Q60:8 explicitly permits and encourages kindness and just dealings with people of other faiths who have shown no hostility.",
    };
  },
  (rng) => ({
    prompt: `A trader in ${place(rng)} decides to serve only customers of their own faith, turning others away. What does Islamic teaching on relations with other faiths say about this practice?`,
    correct: "It is wrong — fair and kind treatment in everyday dealings, including trade, is expected regardless of a customer's faith",
    wrong: [
      "It is acceptable, since trade decisions are entirely a private matter with no religious guidance",
      "It is acceptable, since fairness in trade only applies between Muslims",
      "It is wrong, but only because it might reduce the trader's profit, not because it is unjust",
    ],
    explanation: "Fair and just dealing with people of other faiths, including in trade, reflects the Qur'an's teaching on kindness and justice toward non-hostile people.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `On a national holiday in ${place(rng)}, ${who}'s school organises an event where students of different faiths perform together. What value does this event best reflect?`,
      correct: "Celebrating shared community and national occasions together, strengthening peaceful coexistence",
      wrong: [
        "It reflects that religious differences should be hidden rather than acknowledged",
        "It reflects that national events should exclude any religious consideration entirely",
        "It reflects that only one faith's traditions should be represented at school events",
      ],
      explanation: "Sharing in community and national occasions together is a practical way Islamic teaching encourages harmonious coexistence between people of different faiths.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} witnesses a classmate being mocked in ${place(rng)} because of their different religious practices. What is the correct response, based on Islamic teaching on relations with other faiths?`,
    correct: "Speak up against the mockery and treat the classmate with the respect and kindness Islam teaches toward people of other faiths",
    wrong: [
      "Stay silent, since defending someone of another faith is not really a Muslim's concern",
      "Join in, since mocking a differing belief is a harmless joke",
      "Report it only if the mockery becomes physical, but ignore verbal mockery",
    ],
    explanation: "Respect and kind treatment of people of other faiths is an active expectation — staying silent or joining in mockery contradicts this teaching.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked what "there is no compulsion in religion" actually means. Which explanation is most accurate?`,
      correct: "No one can be forced to accept or practise a religion against their will",
      wrong: [
        "It means religion has no rules that anyone must follow",
        "It means all religions must eventually merge into one",
        "It means Muslims are forbidden from ever discussing their faith with others",
      ],
      explanation: "\"No compulsion in religion\" specifically means belief cannot be forced — it does not forbid respectful discussion or mean religions must merge.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that Islam teaches hostility toward anyone who is not Muslim. Evaluate this claim using Q60:8's teaching.`,
    correct: "Flawed — Q60:8 shows Allah does not forbid kindness and just dealings with people of other faiths who are not hostile",
    wrong: [
      "Sound — Q60:8 proves kindness toward non-Muslims is always forbidden",
      "Sound — hostility is required toward anyone who has not converted to Islam",
      "Flawed — but only because Q60:8 has nothing to do with relations between faiths",
    ],
    explanation: "Q60:8 directly permits kindness and just dealings with non-hostile people of other faiths, contradicting any claim that hostility is the required stance.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says "for you is your religion, and for me is mine" means Muslims should have no relationship at all with people of other faiths. Is this the correct reading?`,
      correct: "No — it means each person is free to hold their own belief, while respectful, kind coexistence is still expected",
      wrong: [
        "Yes — the phrase instructs Muslims to avoid all contact with people of other faiths",
        "Yes — the phrase means religious differences make friendship impossible",
        "No — but only because the phrase actually requires everyone to eventually share one religion",
      ],
      explanation: "This principle affirms freedom of belief, not isolation — it works alongside, not against, the Qur'an's calls for kindness and fair dealing.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why the Qur'an's teaching on kindness toward other faiths (Q60:8) specifically mentions people who have "not been hostile." Why does this condition matter?`,
    correct: "It clarifies that kindness is the general expectation, while distinguishing genuinely hostile behaviour as a separate situation",
    wrong: [
      "It means kindness should never actually be shown to anyone of another faith",
      "It means the condition makes the verse irrelevant to everyday life",
      "It means only hostile people deserve any kindness at all",
    ],
    explanation: "The condition shows the Qur'an's default expectation is kindness and justice, with hostility being the exception it distinguishes, not the norm.",
  }),
];

export const relationsWithOtherFaiths: Skill = {
  id: "g6-ire-mu-relations-with-other-faiths",
  code: "MU.2",
  subjectId: "ire",
  strandId: "g6-ire-muamalat",
  grade: 6,
  title: "Relations with People of Other Faiths",
  description: "Islamic teaching on relating to people of other faiths for peaceful coexistence: no compulsion in religion, kindness and just dealings, and the rights of non-Muslims.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, COEXISTENCE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the founding principle to everyday practice.",
        items,
        correctOrder: COEXISTENCE_SEQUENCE.map((d) => d.id),
        hint: "It begins with no compulsion in religion, moves through peace and kindness, and ends with shared community life.",
        explanation: COEXISTENCE_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const teachings = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "teachings")).slice(0, 3);
      const rights = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "rights")).slice(0, 3);
      const practice = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "practice")).slice(0, 3);
      const chosen = shuffle(rng, [...teachings, ...rights, ...practice]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["teachings", "rights", "practice"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are direct Qur'anic teachings, some name a right of people of other faiths, and some describe practical ways of promoting harmony.",
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
        hint: "Think about what each term or reference actually teaches about relating to people of other faiths.",
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
        hint: "Think about what the Qur'an actually teaches about compulsion, peace, kindness, and everyday dealings with other faiths.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Qur'an teaches there is no", after: "in matters of religion.", answer: "compulsion", accepted: ["compulsion"] },
      { before: "Q8:61 teaches Muslims to incline toward", after: "if others do.", answer: "peace", accepted: ["peace"] },
      { before: "Q60:8 teaches Allah does not forbid", after: "and just dealings with non-hostile people of other faiths.", answer: "kindness", accepted: ["kindness"] },
      { before: "The principle \"for you is your religion, and for me is", after: "\" reflects peaceful coexistence.", answer: "mine", accepted: ["mine"] },
      { before: "People of other faiths have the freedom to", after: "their own religion.", answer: "practise", accepted: ["practise", "practice"] },
      { before: "Respectful", after: "helps build good relations between people of different faiths.", answer: "dialogue", accepted: ["dialogue"] },
      { before: "Avoiding", after: "in trade and social dealings promotes harmony.", answer: "discrimination", accepted: ["discrimination"] },
      { before: "Celebrating shared community and national", after: "together strengthens coexistence.", answer: "occasions", accepted: ["occasions"] },
      { before: "Non-Muslims who are not", after: "toward Muslims deserve kind and just treatment.", answer: "hostile", accepted: ["hostile"] },
      { before: "People of other faiths deserve respect and protection as", after: "and fellow citizens.", answer: "neighbours", accepted: ["neighbours", "neighbors"] },
      { before: "Q2:256 is the verse teaching there is no compulsion in matters of", after: ".", answer: "religion", accepted: ["religion"] },
      { before: "The verse reference for \"no compulsion in religion\" is Q2:", after: ".", answer: "256", accepted: ["256"] },
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
      hint: "Recall the Qur'an's teaching on compulsion, peace, kindness, and everyday relations with other faiths.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
