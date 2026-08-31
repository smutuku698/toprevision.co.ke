import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The story's own flow — idol-questioning, breaking the idols, the fire, then the later
// sacrifice trial and the ram — is the standard, widely-taught narrative order, not invented.
const ORDER_PROMPTS = [
  "Arrange the events of the story of Prophet Ibrahim (A.S.) in the order they happened.",
  "Put these events from the story of Ibrahim (A.S.) into the order they occurred.",
  "Sequence these events of Ibrahim's (A.S.) story correctly, from first to last.",
  "Order these events as they happened in the story of Ibrahim (A.S.).",
  "Sort these events of Ibrahim's (A.S.) story into the order they occurred.",
  "Arrange these moments from the story of Ibrahim (A.S.) in the order they took place.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Ibrahim's (A.S.) story it describes.",
  "Group each statement under the part of the story of Ibrahim (A.S.) it describes.",
  "Decide which part of Ibrahim's (A.S.) story each statement describes, and sort it there.",
  "Sort each fact into the part of the story it belongs to.",
  "Place each statement under the part of Ibrahim's (A.S.) story it describes.",
  "Read each statement and sort it under the matching part of the story.",
];

const MATCH_PROMPTS = [
  "Match each term from the story of Ibrahim (A.S.) to its meaning.",
  "Pair each term from Ibrahim's (A.S.) story with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from the story to the definition that fits it.",
  "Choose the correct meaning for each term from Ibrahim's (A.S.) story.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const IBRAHIM_SEQUENCE = [
  { id: "idol-questioning", label: "Ibrahim (A.S.) grows up among a people who worship idols, and questions why lifeless idols deserve worship" },
  { id: "breaking-idols", label: "To prove his point, he breaks the idols in the temple, leaving only the largest one intact" },
  { id: "thrown-in-fire", label: "His angered people decide to punish him by throwing him into a great fire" },
  { id: "saved-from-fire", label: "Allah (S.W.T.) miraculously saves him — the fire does not burn him" },
  { id: "vision-sacrifice", label: "Later, Ibrahim (A.S.) sees in a vision that he is to sacrifice his son Ismail (A.S.)" },
  { id: "both-submit", label: "Both father and son submit completely to Allah's command, Ismail agreeing willingly" },
  { id: "ram-provided", label: "As Ibrahim (A.S.) is about to carry out the sacrifice, Allah provides a ram instead" },
];

interface TopicFact {
  text: string;
  topic: "idols" | "fire" | "sacrifice";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  idols: "Questioning and breaking the idols",
  fire: "The trial of the fire",
  sacrifice: "The trial of the sacrifice",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Ibrahim (A.S.) grew up among a people who worshipped idols carved from stone and wood", topic: "idols" },
  { text: "He reasoned that lifeless idols could not see, hear, or help anyone, so they could not be true gods", topic: "idols" },
  { text: "He broke the idols in his people's temple, leaving only the largest one standing", topic: "idols" },
  { text: "He suggested the big idol was responsible, to show his people their idols could not even speak to defend themselves", topic: "idols" },
  { text: "His people were angered by the broken idols and decided to throw him into a great fire", topic: "fire" },
  { text: "Allah (S.W.T.) commanded the fire to be cool and safe for Ibrahim (A.S.)", topic: "fire" },
  { text: "Ibrahim (A.S.) came out of the fire completely unharmed", topic: "fire" },
  { text: "This trial showed that Allah protects those who remain steadfast for the truth", topic: "fire" },
  { text: "Later in his life, Ibrahim (A.S.) saw in a vision that he was to sacrifice his son Ismail (A.S.)", topic: "sacrifice" },
  { text: "Ismail (A.S.) willingly agreed to submit to Allah's command alongside his father", topic: "sacrifice" },
  { text: "As Ibrahim (A.S.) was about to carry out the sacrifice, Allah (S.W.T.) stopped him", topic: "sacrifice" },
  { text: "Allah provided a ram for Ibrahim (A.S.) to sacrifice instead, since obedience itself was the real test", topic: "sacrifice" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Idols", meaning: "Carved statues of stone or wood that Ibrahim's (A.S.) people wrongly worshipped instead of Allah" },
  { term: "Ismail (A.S.)", meaning: "Ibrahim's (A.S.) son, who willingly agreed to be sacrificed in obedience to Allah" },
  { term: "The fire trial", meaning: "The test in which Ibrahim (A.S.) was thrown into a fire that Allah made cool and safe" },
  { term: "The ram", meaning: "What Allah provided for Ibrahim (A.S.) to sacrifice instead of his son" },
  { term: "Tawhid", meaning: "Belief in the Oneness of Allah, which Ibrahim's (A.S.) idol-breaking defended" },
  { term: "The vision", meaning: "How Ibrahim (A.S.) received the command to sacrifice his son" },
  { term: "Submission", meaning: "Complete obedience to Allah's command, shown by both Ibrahim (A.S.) and Ismail (A.S.)" },
  { term: "Iman", meaning: "Faith in Allah, which Ibrahim (A.S.) demonstrated by standing firm against his people's idol worship" },
  { term: "Steadfastness", meaning: "Remaining firm in the truth even when it is unpopular or dangerous, as Ibrahim (A.S.) did before his people" },
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
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, is pressured by friends to join a group activity that clearly goes against their family's values, and everyone says "just do what the group does." Applying the lesson of Ibrahim (A.S.) questioning his people's idol worship, what should ${who} do?`,
      correct: "Question the wrong practice and stand firm for what is right, even if it is unpopular with the group",
      wrong: [
        "Follow the group without question, since fitting in matters more than being right",
        "Stay silent about disagreeing, since Ibrahim (A.S.) only questioned his people privately",
        "Wait until an adult confronts the group, since a Grade 6 learner has no role in objecting",
      ],
      explanation: "Ibrahim (A.S.) modelled questioning a wrong, popular practice and standing firm for the truth even when it was unpopular and risky — a lesson learners can apply to peer pressure today.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is mocked by classmates for refusing to copy answers during a test, the way Ibrahim (A.S.) was opposed for refusing to worship idols. How should ${who} respond, based on this story?`,
      correct: "Remain firm in doing what is right, trusting that standing for the truth matters more than avoiding mockery",
      wrong: [
        "Give in to the mockery, since avoiding conflict is more important than honesty",
        "Report every classmate immediately, since Ibrahim (A.S.) resolved his conflict by force",
        "Copy answers occasionally to reduce the mockery, since total honesty was only required of prophets",
      ],
      explanation: "Ibrahim (A.S.) faced anger from his own people for standing against idol worship, yet remained firm — showing that steadfastness in doing right does not depend on others' approval.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s parents in ${place(rng)} ask them to take on a difficult new responsibility at home that ${who} does not fully understand the reason for. Applying the lesson of Ismail's (A.S.) willing submission in the story of Ibrahim (A.S.), what is the best response?`,
      correct: "Trust and obey the reasonable instruction, the way Ismail (A.S.) willingly submitted to his father's and Allah's command",
      wrong: [
        "Refuse until a full explanation is given, since obedience without full understanding has no value",
        "Obey only if a reward is promised in return",
        "Pretend to agree but avoid the responsibility whenever possible",
      ],
      explanation: "Ismail (A.S.) willingly submitted to a command he could have resisted, showing that trust and obedience — not merely outward agreement — are what true submission looks like.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is extremely anxious before a major exam, having studied hard. Applying the lesson of Ibrahim (A.S.) being saved from the fire, what should shape ${who}'s outlook?`,
      correct: "Stay steadfast and trust that Allah supports those who remain firm and sincere, even through a difficult trial",
      wrong: [
        "Assume anxiety means Allah has already abandoned them",
        "Stop preparing further, since the outcome is entirely out of their hands",
        "Conclude that trials only happened to prophets and hold no lesson for anyone else",
      ],
      explanation: "Allah (S.W.T.) protected Ibrahim (A.S.) through the fire because he remained steadfast — a reminder that facing a hard trial with patience and trust in Allah, after genuine effort, is the right response.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A classmate tells ${who} in ${place(rng)} that having the newest phone matters more than being honest. Using Ibrahim's (A.S.) reasoning that idols "could not see, hear, or help anyone," how could ${who} respond?`,
      correct: "Point out that objects and possessions have no real power to guide a person's life the way honesty and good character do",
      wrong: [
        "Agree, since owning more things always brings more happiness",
        "Say the comparison is unfair because idols and phones have nothing in common at all",
        "Avoid the conversation, since questioning what others value is never appropriate",
      ],
      explanation: "Ibrahim's (A.S.) reasoning was that lifeless objects have no real power to help or guide — the same logic applies to placing objects or possessions above what truly matters, like honesty.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A teacher in ${place(rng)} asks ${who} to explain why Ibrahim (A.S.) left the largest idol undamaged after breaking the others. What is the best explanation of his purpose?`,
      correct: "To provoke his people into admitting that even their biggest idol could not speak or defend itself, exposing that idols have no real power",
      wrong: [
        "He ran out of time before he could break the largest idol",
        "He believed the largest idol was more powerful than the others",
        "He wanted to keep one idol as a personal souvenir",
      ],
      explanation: "Leaving the largest idol intact and suggesting it broke the others was meant to force his people to admit their idols could not even speak — proving idols have no real power.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues that since Allah (S.W.T.) stopped Ibrahim (A.S.) from sacrificing Ismail (A.S.), the whole test of obedience did not really matter. Evaluate this reasoning.`,
      correct: "Flawed — both father and son had already shown complete obedience and trust before Allah intervened, which was the real point of the test",
      wrong: [
        "Sound — since the sacrifice was stopped, no obedience was actually required of them",
        "Sound — the story only teaches that Allah always stops difficult commands before they happen",
        "Flawed — the test proves that Allah wanted the sacrifice to be completed after all",
      ],
      explanation: "Allah's intervention came only after Ibrahim (A.S.) and Ismail (A.S.) had already demonstrated full obedience and trust — the test was about their willingness, not the sacrifice's completion.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} witnesses a classmate being unfairly blamed for something they did not do, but speaking up could make ${who} unpopular with the group responsible. Applying the courage Ibrahim (A.S.) showed in standing against his whole society, what should ${who} do?`,
      correct: "Speak up for the truth despite the risk of becoming unpopular, since standing for what is right matters more than fitting in",
      wrong: [
        "Stay silent, since Ibrahim (A.S.) only opposed idol worship, not everyday unfairness",
        "Wait to see if the blamed classmate gets punished before deciding whether to act",
        "Speak up only if there is no risk of disapproval from others",
      ],
      explanation: "Ibrahim's (A.S.) courage in standing alone against his entire society's wrong practice shows that speaking for truth and fairness matters even when it carries social risk.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `In a class debate in ${place(rng)}, ${who} is the only student who disagrees with a popular but factually incorrect claim the rest of the class supports. Applying the lesson of Ibrahim (A.S.) standing alone against his people's idol worship, what should ${who} do?`,
      correct: "Hold to the correct position even while being the only one who disagrees, since being outnumbered does not make a wrong claim right",
      wrong: [
        "Change their answer to match the majority, since the number of people who agree determines what is true",
        "Refuse to explain their reasoning, since Ibrahim (A.S.) never had to justify his position to anyone",
        "Stay quiet until someone else agrees first, since it is unsafe to be the only dissenting voice",
      ],
      explanation: "Ibrahim (A.S.) stood alone against his entire society's false belief — showing that truth does not depend on how many people agree with it.",
    };
  },
];

export const prophetIbrahim: Skill = {
  id: "g6-ire-pi-ibrahim",
  code: "PI.1",
  subjectId: "ire",
  strandId: "g6-ire-iman",
  grade: 6,
  title: "Prophet Ibrahim (A.S.)",
  description: "The story of Prophet Ibrahim (A.S.): questioning idol worship, the trial of the fire, and the trial of the sacrifice — and what they teach about faith, obedience, and trust in Allah.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, IBRAHIM_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from questioning the idols to the ram being provided.",
        items,
        correctOrder: IBRAHIM_SEQUENCE.map((d) => d.id),
        hint: "It begins with Ibrahim (A.S.) questioning idol worship and ends with Allah providing a ram instead of the sacrifice.",
        explanation: IBRAHIM_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const idols = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "idols")).slice(0, 3);
      const fire = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "fire")).slice(0, 3);
      const sacrifice = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "sacrifice")).slice(0, 3);
      const chosen = shuffle(rng, [...idols, ...fire, ...sacrifice]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["idols", "fire", "sacrifice"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about questioning and breaking the idols, some about the fire trial, and some about the sacrifice trial.",
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
        hint: "Think about who or what each term refers to in the story of Ibrahim (A.S.).",
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
        hint: "Think about what the story of Ibrahim (A.S.) actually teaches about faith, obedience, and trust in Allah.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Ibrahim (A.S.) grew up among a people who worshipped", after: "instead of Allah.", answer: "idols", accepted: ["idols"] },
      { before: "Ibrahim (A.S.) reasoned that idols could not see, hear, or", after: "anyone.", answer: "help", accepted: ["help"] },
      { before: "Ibrahim (A.S.) broke the idols in the temple, leaving only the", after: "one intact.", answer: "largest", accepted: ["largest", "biggest"] },
      { before: "Ibrahim's (A.S.) people decided to punish him by throwing him into a great", after: ".", answer: "fire", accepted: ["fire"] },
      { before: "Allah (S.W.T.) made the fire", after: "and safe for Ibrahim (A.S.).", answer: "cool", accepted: ["cool"] },
      { before: "In a vision, Ibrahim (A.S.) was told to sacrifice his son", after: "(A.S.).", answer: "Ismail", accepted: ["ismail"] },
      { before: "Ismail (A.S.) agreed", after: "to submit to Allah's command.", answer: "willingly", accepted: ["willingly"] },
      { before: "As Ibrahim (A.S.) was about to carry out the sacrifice, Allah provided a", after: "instead.", answer: "ram", accepted: ["ram"] },
      { before: "The story of Ibrahim (A.S.) teaches that true faith means standing", after: "for the truth.", answer: "firm", accepted: ["firm"] },
      { before: "Idols made of stone or wood have no real", after: "to help anyone.", answer: "power", accepted: ["power"] },
      { before: "Allah rewards those who remain", after: "in obedience through trials.", answer: "steadfast", accepted: ["steadfast"] },
      { before: "Ibrahim (A.S.) is known in Islam as a model of complete trust and", after: "to Allah.", answer: "obedience", accepted: ["obedience"] },
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
      hint: "Recall the story of Ibrahim (A.S.) — the idols, the fire, and the sacrifice.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
