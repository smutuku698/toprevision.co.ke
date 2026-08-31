import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each fact to the Ulul-Azm prophet it describes.",
  "Pair each fact with the Ulul-Azm prophet it describes.",
  "Connect each fact below to the prophet it describes.",
  "Match each fact to the correct Ulul-Azm prophet.",
  "Link each fact to the prophet it is about.",
  "Choose the correct prophet for each fact.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact as being about Musa (A.S.) or Isa (A.S.).",
  "Group each fact under Musa (A.S.) or Isa (A.S.).",
  "Decide whether each fact is about Musa or Isa, and sort it there.",
  "Sort each fact into the correct category: Musa (A.S.), or Isa (A.S.).",
  "Place each fact into the right bucket — Musa, or Isa.",
  "Categorise each fact as about Musa (A.S.) or Isa (A.S.).",
];

const ORDER_PROMPTS = [
  "Arrange these events in the story of Musa (A.S.) in the correct order.",
  "Put these events in the story of Musa (A.S.) into the correct order.",
  "Sequence these events from Musa's story correctly.",
  "Order these events in Musa's (A.S.) story as they actually happened.",
  "Sort these events of Musa's story into their correct order.",
  "Arrange these moments from Musa's (A.S.) story in order.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const FACTS: { prophet: string; fact: string }[] = [
  { prophet: "Musa (A.S.)", fact: "Confronted Pharaoh with patience, demanding freedom for the Israelites" },
  { prophet: "Musa (A.S.)", fact: "Received the Tawrat from Allah at Mount Tur" },
  { prophet: "Isa (A.S.)", fact: "Was given the Injil and performed miracles by Allah's permission" },
  { prophet: "Isa (A.S.)", fact: "Preached patience and steadfastness despite persecution from his opponents" },
];

const SORT_ITEMS = [
  { text: "Grew up in Pharaoh's palace before being called to prophethood", prophet: "musa" },
  { text: "Led the Israelites out of Egypt with patience and firm resolve", prophet: "musa" },
  { text: "Born miraculously to Maryam (A.S.)", prophet: "isa" },
  { text: "Given the Injil as a scripture of guidance", prophet: "isa" },
  { text: "Endured hardship from his own people with steadfastness, such as the incident of the golden calf", prophet: "musa" },
] as const;
const PROPHET_LABEL: Record<string, string> = { musa: "About Musa (A.S.)", isa: "About Isa (A.S.)" };

const ORDER_ITEMS = [
  { id: "hidden", label: "Musa is born and hidden from Pharaoh's decree" },
  { id: "palace", label: "Musa is raised in Pharaoh's own palace" },
  { id: "call", label: "Musa is called to prophethood at Mount Tur" },
  { id: "confront", label: "Musa confronts Pharaoh, demanding freedom for the Israelites" },
  { id: "exodus", label: "Musa leads the Israelites out of Egypt" },
  { id: "tawrat", label: "Musa receives the Tawrat from Allah" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does 'Ulul-Azm' mean when describing certain prophets?",
    correct: "Possessors of firm resolve — prophets known for extraordinary patience and steadfastness",
    distractors: ["Prophets who never faced any hardship", "Prophets who lived only in Makkah", "A title given to all 25 prophets equally"],
  },
  {
    q: "What quality do Muslims especially learn from the stories of Musa (A.S.) and Isa (A.S.)?",
    correct: "Patience and steadfastness in the face of great hardship and opposition",
    distractors: ["The importance of avoiding all responsibility", "That prophets should not preach to their people", "That miracles happen without any trial or difficulty"],
  },
  {
    q: "What scripture was revealed to Isa (A.S.)?",
    correct: "The Injil",
    distractors: ["The Tawrat", "The Zabur", "The Suhuf"],
  },
  {
    q: "Where did Musa (A.S.) receive the Tawrat from Allah?",
    correct: "At Mount Tur",
    distractors: ["In Makkah", "In Madinah", "At the Kaaba"],
  },
];

export const ululAzmProphets: Skill = {
  id: "g8-ire-pi-ulul-azm-prophets",
  code: "PI.2",
  subjectId: "ire",
  strandId: "g8-ire-pi",
  grade: 8,
  title: "Ulul-Azm Prophets: Musa and Isa",
  description: "The patience and steadfastness of the Ulul-Azm Prophets Musa (A.S.) and Isa (A.S.).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      // Pick one distinct fact per prophet so each token has exactly one correct target.
      const distinctByProphet = Array.from(new Map(shuffle(rng, FACTS).map((f) => [f.prophet, f])).values());
      const tokens = shuffle(rng, distinctByProphet.map((f) => ({ id: f.prophet, label: f.fact })));
      const targets = shuffle(rng, distinctByProphet.map((f) => ({ id: f.prophet, label: f.prophet })));
      const correctMap: Record<string, string> = {};
      for (const f of distinctByProphet) correctMap[f.prophet] = f.prophet;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "One fact is about Musa (A.S.) and one is about Isa (A.S.).",
        explanation: distinctByProphet.map((f) => `${f.prophet} — ${f.fact.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SORT_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.prophet))).map((b) => ({ id: b, label: PROPHET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.prophet));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Musa's story involves Pharaoh and Egypt; Isa's story involves Maryam and the Injil.",
        explanation: chosen.map((c) => `"${c.text}" — ${PROPHET_LABEL[c.prophet].toLowerCase()}.`).join(" "),
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
        hint: "Musa's story runs from his birth and upbringing, through his call to prophethood, to leading his people out of Egypt and receiving the Tawrat.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "Musa and Isa are described as Ulul-Azm prophets because of their extraordinary",
        after: "and steadfastness.",
        correctAnswer: "patience",
        inputMode: "text",
        hint: "This is the quality of enduring hardship calmly, without giving up.",
        explanation: "Ulul-Azm prophets like Musa and Isa are known for their extraordinary patience and steadfastness in the face of hardship.",
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
      hint: "Ulul-Azm prophets, including Musa and Isa, are known for extraordinary patience and steadfastness.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
