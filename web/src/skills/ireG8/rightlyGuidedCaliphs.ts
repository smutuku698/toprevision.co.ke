import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each achievement or challenge to the Rightly Guided Caliph it belongs to.",
  "Pair each achievement or challenge with the caliph it belongs to.",
  "Connect each fact below to the caliph it describes.",
  "Match each achievement or challenge to the correct caliph.",
  "Link each fact to the Rightly Guided Caliph it belongs to.",
  "Choose the correct caliph for each achievement or challenge.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by which Rightly Guided Caliph it describes.",
  "Group each fact under the Rightly Guided Caliph it describes.",
  "Decide which caliph each fact describes, and sort it there.",
  "Sort each fact into the correct Rightly Guided Caliph.",
  "Place each fact under the caliph it describes.",
  "Read each fact and sort it under the matching Rightly Guided Caliph.",
];

const ORDER_PROMPTS = [
  "Arrange the Rightly Guided Caliphs in the order they succeeded the Prophet (S.A.W.).",
  "Put the Rightly Guided Caliphs into the order they succeeded the Prophet (S.A.W.).",
  "Sequence the Rightly Guided Caliphs correctly, in the order they ruled.",
  "Order these caliphs as they succeeded the Prophet (S.A.W.).",
  "Sort these Rightly Guided Caliphs into their correct order of succession.",
  "Arrange these caliphs in the order they came to power.",
];

const FILL_PROMPTS = [
  "Fill in the missing name.",
  "Which name completes this sentence?",
  "Complete the sentence with the correct name.",
  "Work out the missing name below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which name belongs in the blank?",
];

const CALIPHS = ["Abubakar (R.A.)", "Umar (R.A.)", "Uthman (R.A.)", "Ali (R.A.)"] as const;

const FACTS: { caliph: (typeof CALIPHS)[number]; fact: string }[] = [
  { caliph: "Abubakar (R.A.)", fact: "Fought the Ridda (apostasy) wars to keep tribes within the fold of Islam after the Prophet's death" },
  { caliph: "Abubakar (R.A.)", fact: "Ordered the scattered verses of the Qur'an to be compiled into a single manuscript" },
  { caliph: "Umar (R.A.)", fact: "Greatly expanded the Islamic state, including into Persia and parts of Byzantine territory" },
  { caliph: "Umar (R.A.)", fact: "Established the Bait-ul-Mal (public treasury) and organised the state into provinces" },
  { caliph: "Uthman (R.A.)", fact: "Standardised the Qur'an into one official text and sent copies to major cities" },
  { caliph: "Uthman (R.A.)", fact: "Expanded the Muslim navy and faced growing internal unrest that led to rebellion" },
  { caliph: "Ali (R.A.)", fact: "Moved the capital of the Islamic state to Kufa" },
  { caliph: "Ali (R.A.)", fact: "Faced civil strife within the Muslim community, including the Battle of Siffin" },
];

const ORDER_ITEMS = CALIPHS.map((c, i) => ({ id: `c${i}`, label: c }));

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Who was the first of the Rightly Guided Caliphs?",
    correct: "Abubakar (R.A.)",
    distractors: ["Umar (R.A.)", "Uthman (R.A.)", "Ali (R.A.)"],
  },
  {
    q: "Which caliph ordered the standardisation of the Qur'an into one official text?",
    correct: "Uthman (R.A.)",
    distractors: ["Abubakar (R.A.)", "Umar (R.A.)", "Ali (R.A.)"],
  },
  {
    q: "Which caliph is known for greatly expanding the Islamic state and establishing the Bait-ul-Mal?",
    correct: "Umar (R.A.)",
    distractors: ["Abubakar (R.A.)", "Uthman (R.A.)", "Ali (R.A.)"],
  },
  {
    q: "What major challenge did Ali (R.A.) face during his caliphate?",
    correct: "Civil strife within the Muslim community, including the Battle of Siffin",
    distractors: ["The Ridda wars against apostasy", "The compilation of the Qur'an for the first time", "The founding of the Bait-ul-Mal"],
  },
  {
    q: "What do Muslims learn from the challenges faced by the Rightly Guided Caliphs?",
    correct: "The importance of justice, wisdom, and steadfast leadership even in times of difficulty",
    distractors: ["That leadership should be abandoned when challenges arise", "That challenges mean a leader has failed", "That only military strength matters in leadership"],
  },
];

export const rightlyGuidedCaliphs: Skill = {
  id: "g8-ire-ih-rightly-guided-caliphs",
  code: "IH.1",
  subjectId: "ire",
  strandId: "g8-ire-ih",
  grade: 8,
  title: "The Rightly Guided Caliphs",
  description: "The leadership, reforms, and challenges of Abubakar, Umar, Uthman, and Ali (R.A.).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const distinctByCaliph = Array.from(new Map(shuffle(rng, FACTS).map((f) => [f.caliph, f])).values());
      const tokens = shuffle(rng, distinctByCaliph.map((f) => ({ id: f.caliph, label: f.fact })));
      const targets = shuffle(rng, distinctByCaliph.map((f) => ({ id: f.caliph, label: f.caliph })));
      const correctMap: Record<string, string> = {};
      for (const f of distinctByCaliph) correctMap[f.caliph] = f.caliph;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each caliph is remembered for distinct reforms and challenges during their rule.",
        explanation: distinctByCaliph.map((f) => `${f.caliph} — ${f.fact.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, FACTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((c) => c.caliph))).map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.fact }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.caliph));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Think about which caliph is linked to the Qur'an's compilation, which to expansion, and which to internal conflict.",
        explanation: chosen.map((c) => `"${c.fact}" — about ${c.caliph}.`).join(" "),
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
        hint: "The order is Abubakar, then Umar, then Uthman, then Ali.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The Rightly Guided Caliph who ordered the Qur'an to be standardised into one official text was",
        after: ".",
        correctAnswer: "Uthman",
        acceptedAnswers: ["uthman (r.a.)", "uthman r.a."],
        inputMode: "text",
        hint: "This caliph also sent official copies of the Qur'an to major cities.",
        explanation: "Uthman (R.A.), the third Rightly Guided Caliph, ordered the Qur'an to be standardised into one official text.",
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
      hint: "Abubakar, Umar, Uthman, and Ali each led the Muslim community through distinct reforms and challenges.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
