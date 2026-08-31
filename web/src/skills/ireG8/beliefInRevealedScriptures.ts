import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each revealed scripture to the prophet it was given to.",
  "Pair each revealed scripture with the prophet it was given to.",
  "Connect each scripture below to the prophet who received it.",
  "Match each scripture to the prophet it was revealed to.",
  "Link each revealed scripture to its prophet.",
  "Choose the correct prophet for each revealed scripture.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each name as a revealed scripture or a prophet who received a scripture.",
  "Group each name under a revealed scripture or a prophet who received one.",
  "Decide whether each name is a scripture or a prophet, and sort it there.",
  "Sort each name into the correct category: scripture, or prophet.",
  "Place each name into the right bucket — scripture, or prophet.",
  "Categorise each name as a revealed scripture or a prophet who received one.",
];

const ORDER_PROMPTS = [
  "Arrange these revealed scriptures in the order they were revealed, earliest first.",
  "Put these revealed scriptures into the order they were revealed, earliest first.",
  "Sequence these revealed scriptures correctly, from earliest to latest.",
  "Order these scriptures as they were revealed, earliest first.",
  "Sort these revealed scriptures into their order of revelation.",
  "Arrange these scriptures from earliest to most recently revealed.",
];

const FILL_PROMPTS = [
  "Fill in the missing name of the scripture.",
  "Which scripture is being described?",
  "Name the scripture described below.",
  "Work out which scripture completes the sentence.",
  "Identify the missing name of the scripture.",
  "Which scripture name belongs in the blank?",
];

const SCRIPTURES: { scripture: string; prophet: string }[] = [
  { scripture: "Suhuf", prophet: "Ibrahim (A.S.)" },
  { scripture: "Tawrat (Torah)", prophet: "Musa (A.S.)" },
  { scripture: "Zabur (Psalms)", prophet: "Dawud (A.S.)" },
  { scripture: "Injil (Gospel)", prophet: "Isa (A.S.)" },
  { scripture: "Qur'an", prophet: "Muhammad (S.A.W.)" },
];

const CATEGORY_ITEMS = [
  { text: "Tawrat", bucket: "scripture" },
  { text: "Zabur", bucket: "scripture" },
  { text: "Injil", bucket: "scripture" },
  { text: "Qur'an", bucket: "scripture" },
  { text: "Musa (A.S.)", bucket: "prophet" },
  { text: "Dawud (A.S.)", bucket: "prophet" },
  { text: "Isa (A.S.)", bucket: "prophet" },
  { text: "Muhammad (S.A.W.)", bucket: "prophet" },
] as const;
const CATEGORY_LABEL: Record<string, string> = { scripture: "A revealed scripture", prophet: "A prophet who received a scripture" };

const ORDER_ITEMS = [
  { id: "suhuf", label: "Suhuf, given to Ibrahim (A.S.)" },
  { id: "tawrat", label: "Tawrat, given to Musa (A.S.)" },
  { id: "zabur", label: "Zabur, given to Dawud (A.S.)" },
  { id: "injil", label: "Injil, given to Isa (A.S.)" },
  { id: "quran", label: "Qur'an, given to Muhammad (S.A.W.)" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which revealed scripture was given to Prophet Musa (A.S.)?",
    correct: "Tawrat (Torah)",
    distractors: ["Zabur", "Injil", "Suhuf"],
  },
  {
    q: "Why must a Muslim believe in all the revealed scriptures, not only the Qur'an?",
    correct: "Because belief in all the books sent by Allah to His prophets is a pillar of Iman",
    distractors: ["Because the earlier scriptures replaced the Qur'an", "Because it is optional for a Muslim to believe in them", "Because only the Qur'an was truly revealed by Allah"],
  },
  {
    q: "What is one way Muslims are taught to show respect for the other revealed scriptures?",
    correct: "By acknowledging them as genuine revelations from Allah to earlier prophets and treating people of those faiths with tolerance",
    distractors: ["By rejecting that they were ever revealed by Allah", "By refusing to interact with anyone who follows them", "By mocking their teachings"],
  },
  {
    q: "Why did Allah send different scriptures to different prophets over time?",
    correct: "To guide each community according to their time and circumstances, culminating in the final message in the Qur'an",
    distractors: ["Because the earlier scriptures contained errors from Allah", "To create permanent division among people", "Because Allah changes His message randomly"],
  },
];

export const beliefInRevealedScriptures: Skill = {
  id: "g8-ire-pi-belief-in-revealed-scriptures",
  code: "PI.1",
  subjectId: "ire",
  strandId: "g8-ire-pi",
  grade: 8,
  title: "Belief in Revealed Scriptures",
  description: "The Suhuf, Tawrat, Zabur, Injil, and Qur'an, and why belief in the revealed scriptures is a pillar of Iman.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, SCRIPTURES);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.scripture, label: s.scripture })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.scripture, label: `Given to ${s.prophet}` })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.scripture] = s.scripture;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Muslims believe Allah revealed the Suhuf, Tawrat, Zabur, Injil, and Qur'an to different prophets.",
        explanation: chosen.map((s) => `${s.scripture} — given to ${s.prophet}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: CATEGORY_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Tawrat, Zabur, Injil, and the Qur'an are books; Musa, Dawud, Isa, and Muhammad are the prophets who received them.",
        explanation: chosen.map((c) => `"${c.text}" — ${CATEGORY_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_ITEMS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_ITEMS.map((s) => s.id),
        hint: "Ibrahim came before Musa, who came before Dawud, who came before Isa, who came before Muhammad (S.A.W.), the final prophet.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The scripture revealed to Prophet Dawud (A.S.) is known as the",
        after: ".",
        correctAnswer: "Zabur",
        acceptedAnswers: ["psalms"],
        inputMode: "text",
        hint: "This scripture is also known in English as the Psalms.",
        explanation: "The scripture revealed to Prophet Dawud (A.S.) is the Zabur (Psalms).",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Belief in all the revealed scriptures — Suhuf, Tawrat, Zabur, Injil, and Qur'an — is a pillar of Iman.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
