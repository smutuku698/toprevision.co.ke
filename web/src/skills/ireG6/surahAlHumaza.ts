import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The surah's own verse-by-verse flow (Q.104:1-9) is explicit, curriculum-endorsed sequential
// content, not an invented order: the opening warning against backbiting/mocking, the wealth-hoarding
// person and their mistaken belief, the warning of Al-Hutamah, then its description.
const ORDER_PROMPTS = [
  "Arrange the parts of Surah Al-Humaza (Q.104:1-9) in the order they appear.",
  "Put these parts of Surah Al-Humaza into the order they appear.",
  "Sequence these parts of Surah Al-Humaza correctly, from first to last.",
  "Order these parts of Surah Al-Humaza as they appear in the surah.",
  "Sort these parts of Surah Al-Humaza into the order they occur.",
  "Arrange these moments of Surah Al-Humaza in the order they appear.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Surah Al-Humaza it describes.",
  "Group each statement under the part of Surah Al-Humaza it describes.",
  "Decide which part of Surah Al-Humaza each statement describes, and sort it there.",
  "Sort each fact into the part of Surah Al-Humaza it belongs to.",
  "Place each statement under the part of the surah it describes.",
  "Read each statement and sort it under the matching part of Surah Al-Humaza.",
];

const MATCH_PROMPTS = [
  "Match each term from Surah Al-Humaza to its meaning.",
  "Pair each term from Surah Al-Humaza with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from Surah Al-Humaza to the definition that fits it.",
  "Choose the correct meaning for each term from Surah Al-Humaza.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const HUMAZA_SEQUENCE = [
  { id: "woe", label: "Opens with 'Woe to every scorner and mocker' — a warning against Humaza (backbiting) and Lumaza (mocking to the face)" },
  { id: "gathers", label: "Describes a person who gathers wealth and counts it over and over" },
  { id: "thinks-immortal", label: "This person mistakenly thinks their wealth will make them live forever" },
  { id: "warning-no", label: "Warning: No! Such a person will be thrown into Al-Hutamah (the Crusher) for backbiting and boastful love of wealth" },
  { id: "hutamah-fire", label: "Al-Hutamah is described as Allah's kindled fire" },
  { id: "rises-hearts", label: "The fire rises up over people's hearts" },
  { id: "closes-in", label: "It closes in on them from every side" },
  { id: "columns", label: "It surrounds them in extended, towering columns" },
];

interface TopicFact {
  text: string;
  topic: "meaning" | "wealth" | "punishment";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  meaning: "The meaning of Humaza and Lumaza",
  wealth: "The wealth-hoarding mindset the surah warns against",
  punishment: "The description of Al-Hutamah",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Surah Al-Humaza opens with 'Woe to every scorner and mocker'", topic: "meaning" },
  { text: "'Humaza' refers to backbiting or slandering someone behind their back", topic: "meaning" },
  { text: "'Lumaza' refers to mocking or taunting someone to their face, such as by gesture or insult", topic: "meaning" },
  { text: "Both backbiting and mocking are condemned in this surah as serious sins", topic: "meaning" },
  { text: "The surah describes a person who gathers wealth and counts it over and over", topic: "wealth" },
  { text: "This person mistakenly believes their wealth will make them live forever", topic: "wealth" },
  { text: "The surah corrects this belief — wealth cannot protect a person from death or accountability", topic: "wealth" },
  { text: "Obsessively counting and hoarding wealth is presented as a harmful, mistaken mindset", topic: "wealth" },
  { text: "The surah warns that such a person will be thrown into Al-Hutamah, the Crusher", topic: "punishment" },
  { text: "Al-Hutamah is described as Allah's kindled fire", topic: "punishment" },
  { text: "The fire is described as rising up over people's hearts", topic: "punishment" },
  { text: "It is described as closing in on them from every side, in towering columns", topic: "punishment" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Humaza", meaning: "Backbiting or slandering someone behind their back" },
  { term: "Lumaza", meaning: "Mocking or taunting someone to their face, such as by gesture or insult" },
  { term: "Al-Hutamah", meaning: "'The Crusher' — a description of the Fire, into which the backbiting, wealth-obsessed person is thrown" },
  { term: "Woe (in this surah)", meaning: "The opening warning of serious consequence that begins the surah" },
  { term: "Counting wealth (in this surah)", meaning: "The repeated act of gathering and recounting money that the surah condemns" },
  { term: "Allah's kindled fire", meaning: "How Al-Hutamah is described — a fire that Allah has set ablaze" },
  { term: "Surah Al-Humaza", meaning: "Chapter 104 of the Qur'an, named after the sin of backbiting, with 9 verses" },
  { term: "Boastful love of wealth", meaning: "The mistaken mindset the surah condemns alongside backbiting and mocking" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, overhears two classmates talking badly about a friend who has just left the room. Applying Surah Al-Humaza, what should the learner do?`,
    correct: "Refuse to join in and discourage the backbiting, since the surah warns strongly against it",
    wrong: [
      "Join in only briefly, since listening quietly is not the same as backbiting",
      "Repeat what was said to the friend later, since honesty makes backbiting acceptable",
      "Ignore it completely, since the surah's warning only applies to the two people speaking, not to a listener",
    ],
    explanation: "Surah Al-Humaza's warning against backbiting calls for actively discouraging it, not tolerating it as a listener or excusing it as honesty.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} mimics a classmate's stutter in front of the whole class to get laughs. Applying Surah Al-Humaza's warning against 'Lumaza,' how should this be judged?`,
      correct: "Wrong — mocking someone to their face, even as a joke, is exactly the 'Lumaza' the surah warns against",
      wrong: [
        "Acceptable, since Lumaza only refers to mocking someone who is not present",
        "Acceptable, since it was meant as a joke and not said seriously",
        "Wrong, but only because it was done in front of the whole class rather than privately",
      ],
      explanation: "Lumaza specifically means mocking or taunting someone to their face — doing it publicly as a joke is still the sin the surah names and condemns.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps recounting the money in his savings box every evening and tells friends it will always keep him safe from any hardship. Applying Surah Al-Humaza, what is the flaw in this thinking?`,
    correct: "The surah warns that this exact mindset — believing wealth can secure a person forever — is mistaken and dangerous",
    wrong: [
      "There is no flaw, since saving money carefully is always encouraged without limit by the surah",
      "The flaw is only that he counts it every evening instead of once a week",
      "The flaw is that he should be spending the money instead of saving it at all",
    ],
    explanation: "The surah does not condemn saving itself, but it directly warns against the belief that wealth makes a person permanently secure or immortal.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s uncle in ${place(rng)} constantly compares how much livestock he owns to his neighbours, and boasts that his wealth means nothing bad can ever happen to him. Which teaching of Surah Al-Humaza does this best illustrate?`,
      correct: "The surah's warning against the person who gathers and counts wealth while mistakenly believing it will make them immortal",
      wrong: [
        "The surah's teaching that owning livestock is itself sinful",
        "The surah's description of Al-Hutamah's fire rising over people's hearts, which applies only literally to fire, not to attitudes",
        "The surah's opening command to speak of Allah's favour publicly",
      ],
      explanation: "Boastfully counting wealth and believing it grants permanent safety is precisely the mistaken mindset Surah Al-Humaza describes and warns against.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} spreads a rumour about a teacher after class, saying it is fine because the teacher will never find out. Applying Surah Al-Humaza, is this reasoning sound?`,
    correct: "No — the surah's warning against backbiting is about the sin itself, not about whether the person being talked about ever finds out",
    wrong: [
      "Yes — backbiting is only wrong if the person being discussed hears about it",
      "Yes — teachers are not covered by the surah's warning against backbiting",
      "No — but only because rumours about teachers are treated differently from rumours about classmates",
    ],
    explanation: "The surah's warning applies to the act of backbiting itself, regardless of whether the person spoken about ever learns of it or who they are.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that mocking a classmate's old shoes is harmless "as long as it is said as a joke and everyone laughs." Evaluate this reasoning using Surah Al-Humaza.`,
    correct: "Flawed — the surah warns against every scorner and mocker, without excusing mockery said as a joke",
    wrong: [
      "Sound — jokes are always excluded from the surah's warning against mocking",
      "Sound — mockery only counts as sinful if the person being mocked does not laugh along",
      "Flawed — but only because shoes are a sensitive topic, not because mocking itself is wrong",
    ],
    explanation: "Surah Al-Humaza opens with 'Woe to every scorner and mocker' — a general warning that is not cancelled by calling the mockery a joke.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} hears that Al-Hutamah is described in Surah Al-Humaza as rising over people's hearts and closing in from every side. What is the best purpose of this description for a Grade 6 learner?`,
      correct: "To show that backbiting and boastful love of wealth have a serious consequence in the Hereafter, so a Muslim should avoid both",
      wrong: [
        "To frighten learners with no connection to how they should actually behave",
        "To describe an ordinary fire with no link to backbiting or wealth at all",
        "To suggest that only extremely wealthy people need to worry about this warning",
      ],
      explanation: "The description of Al-Hutamah is meant to underline how seriously the surah treats backbiting and wealth-obsession, motivating a Muslim to avoid both — not simply to frighten.",
    };
  },
  (rng) => ({
    prompt: `A group project in ${place(rng)} fails, and ${name(rng)} wants to complain about a group member behind their back instead of speaking to them directly. What does Surah Al-Humaza suggest instead?`,
    correct: "Address the concern directly and respectfully with the group member, rather than talking about them behind their back",
    wrong: [
      "Complain to as many classmates as possible first, then decide whether to speak to the group member",
      "Say nothing at all to anyone, since silence is the only alternative the surah allows",
      "Wait until the group member is not present, since that makes the complaint acceptable",
    ],
    explanation: "The surah's warning against backbiting pushes a Muslim toward addressing concerns openly and directly rather than talking about someone behind their back.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that since Surah Al-Humaza was revealed long ago, its warning against backbiting and mocking no longer applies to everyday conversations today. Is this reasoning sound?`,
      correct: "No — the surah's warning against backbiting and mocking is a lasting teaching that applies to a Muslim's conduct at any time",
      wrong: [
        "Yes — the warning was only meant for the specific people alive when it was revealed",
        "Yes — modern conversations, including online chats, are not covered by the surah at all",
        "No — but only because the warning applies solely to adults, not to learners",
      ],
      explanation: "Surah Al-Humaza's warning against backbiting and mocking is a general, lasting teaching about a Muslim's speech and conduct, not limited to any one time period.",
    };
  },
];

export const surahAlHumaza: Skill = {
  id: "g6-ire-qu-al-humaza",
  code: "QU.1",
  subjectId: "ire",
  strandId: "g6-ire-quran",
  grade: 6,
  title: "Surah Al-Humaza",
  description: "The meaning and teachings of Surah Al-Humaza (Q.104:1-9): the warning against backbiting and mocking, the mistaken belief that wealth grants security, and the description of Al-Hutamah.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, HUMAZA_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the opening warning to the description of Al-Hutamah.",
        items,
        correctOrder: HUMAZA_SEQUENCE.map((d) => d.id),
        hint: "It opens with the warning against backbiting and mocking, then the wealth-hoarding person's mistaken belief, then the warning of Al-Hutamah, then its description.",
        explanation: HUMAZA_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "meaning")).slice(0, 3);
      const wealth = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "wealth")).slice(0, 3);
      const punishment = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "punishment")).slice(0, 3);
      const chosen = shuffle(rng, [...meaning, ...wealth, ...punishment]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["meaning", "wealth", "punishment"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements explain Humaza/Lumaza, some describe the wealth-hoarding mindset, and some describe Al-Hutamah.",
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
        hint: "Think about what each term refers to in the surah's warning against backbiting, mocking, and wealth-obsession.",
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
        hint: "Think about which teaching of Surah Al-Humaza the situation is actually applying.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Surah Al-Humaza opens with 'Woe to every scorner and", after: ".'", answer: "mocker", accepted: ["mocker"] },
      { before: "'Humaza' means backbiting or slandering someone behind their", after: ".", answer: "back", accepted: ["back"] },
      { before: "'Lumaza' means mocking or taunting someone to their", after: ".", answer: "face", accepted: ["face"] },
      { before: "The surah describes a person who gathers wealth and", after: "it repeatedly.", answer: "counts", accepted: ["counts", "count"] },
      { before: "This person mistakenly thinks their wealth will make them live", after: ".", answer: "forever", accepted: ["forever"] },
      { before: "The surah warns that such a person will be thrown into", after: ", the Crusher.", answer: "Al-Hutamah", accepted: ["al-hutamah", "hutamah"] },
      { before: "Al-Hutamah is described as Allah's", after: "fire.", answer: "kindled", accepted: ["kindled"] },
      { before: "The fire is described as rising up over people's", after: ".", answer: "hearts", accepted: ["hearts"] },
      { before: "The fire closes in on people from every", after: ", in towering columns.", answer: "side", accepted: ["side"] },
      { before: "Surah Al-Humaza is chapter number", after: "of the Qur'an.", answer: "104", accepted: ["104"] },
      { before: "Surah Al-Humaza has", after: "verses in total.", answer: "9", accepted: ["9", "nine"] },
      { before: "The surah condemns backbiting and boastful love of", after: ".", answer: "wealth", accepted: ["wealth"] },
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
      hint: "Recall the warnings and descriptions in Surah Al-Humaza.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
