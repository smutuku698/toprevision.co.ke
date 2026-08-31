import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GOOD_PRACTICES: string[] = [
  "Kevin researched the scholarship programme beforehand and could explain exactly why he wanted to become an engineer.",
  "Amina made eye contact with each panel member and answered every question calmly.",
  "Brian arrived twenty minutes early, dressed neatly in his school uniform.",
  "When Faith did not understand a question, she politely asked, \"Could you please clarify what you mean?\"",
];

const POOR_PRACTICES: string[] = [
  "Otieno arrived fifteen minutes late and blamed the matatu for his own poor planning.",
  "Njeri answered every question with a single word, without any explanation.",
  "Musa interrupted the panel members before they had finished asking their questions.",
  "Wanjiru guessed wildly at a question she did not understand instead of asking for clarification.",
];

const CLARIFICATION_PHRASES: { phrase: string; purpose: string }[] = [
  { phrase: "Could you please repeat the question?", purpose: "Used when you did not hear the question clearly the first time" },
  { phrase: "I'm sorry, could you clarify what you mean by that?", purpose: "Used when a question's meaning is unclear or could be understood in more than one way" },
  { phrase: "Would you mind rephrasing the question, please?", purpose: "A polite way to ask the interviewer to say the question differently" },
  { phrase: "So, are you asking about my experience inside the classroom or outside it?", purpose: "Used to confirm exactly which part of a broad question the interviewer wants answered" },
  { phrase: "Thank you, that makes the question much clearer.", purpose: "A polite way to acknowledge the interviewer after they have clarified something" },
];

const ORDER_STEPS = [
  { id: "research", label: "Research the school or scholarship programme and think about why you want the opportunity" },
  { id: "documents", label: "Gather and organise all required documents, such as certificates and recommendation letters" },
  { id: "dress", label: "Dress neatly and appropriately, and plan how you will travel to arrive on time" },
  { id: "listen", label: "Listen carefully to each question before answering" },
  { id: "clarify", label: "Politely seek clarification if a question is unclear, rather than guessing" },
  { id: "thank", label: "Thank the panel for their time before leaving" },
];

const SCENARIO_RESPONSES: { question: string; correct: string; distractors: string[] }[] = [
  {
    question: "Why do you want to join this scholarship programme in veterinary medicine?",
    correct: "I have volunteered at our local animal clinic for two years, and I want this scholarship to become a qualified veterinarian who can serve farmers in my community.",
    distractors: [
      "I don't know, my parents told me to apply.",
      "Because scholarships are free and I need the money.",
      "I'm not sure, maybe I'll decide later what I want to study.",
    ],
  },
  {
    question: "What makes you a good candidate for this school's aviation club and eventual pilot-training scholarship?",
    correct: "I have been building and flying model aircraft since Grade 5, and I always double-check every detail before a flight, which shows the discipline pilots need.",
    distractors: [
      "I just think planes are cool.",
      "I haven't really thought about it, but I like the idea.",
      "My friend is applying too, so I thought I would join him.",
    ],
  },
  {
    question: "Why should we select you for this teaching bursary?",
    correct: "I have tutored younger pupils in mathematics every Saturday for a year, and I have seen how patient explanation helps them improve, which is why I want to become a teacher.",
    distractors: [
      "I like being around children sometimes.",
      "Teaching seems like an easy job with long holidays.",
      "I couldn't think of anything else to apply for.",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "", after: " you please repeat the question? I did not hear it clearly.", correctAnswer: "Could", acceptedAnswers: ["Would"] },
  { before: "I'm sorry, could you ", after: " what you mean by that question?", correctAnswer: "clarify", acceptedAnswers: ["explain"] },
  { before: "One important reason schools and scholarship boards conduct interviews is to assess a candidate's ", after: ", which a written application form cannot always show.", correctAnswer: "communication skills", acceptedAnswers: ["confidence", "communication"] },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why are interviews important for getting school placement or a scholarship?",
    correct: "They let panels assess qualities like communication, confidence, and motivation that a written application cannot fully show",
    distractors: ["They are only used to make the application process take longer", "They exist mainly to test how fast a candidate can talk", "They have no real effect on the final decision"],
  },
  {
    q: "What is one good reason to ask an interviewer to clarify a confusing question, rather than guessing at an answer?",
    correct: "Answering the actual question asked shows the panel that you listen carefully and think before responding",
    distractors: ["It shows the panel that you did not prepare at all", "It is considered rude and should always be avoided", "It wastes the panel's time and lowers your chances"],
  },
  {
    q: "Which quality do interview panels most want to see when a candidate answers a difficult question?",
    correct: "Calm, clear, and confident communication, even if the candidate needs a moment to think",
    distractors: ["Speaking as fast as possible to fill the silence", "Giving the shortest possible answer to save time", "Repeating the question back word for word without answering it"],
  },
];

export const interviews: Skill = {
  id: "g7-eng-ls-interviews",
  code: "LS.11",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Interviews: School Placement and Scholarships",
  description: "Identify reasons for sitting an interview, respond confidently and seek clarification when needed, and appreciate the role of interviews in gaining school placement and scholarships.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "order", "scenario", "fill", "concept"] as const);
    const hint = "A strong interview answer is confident, clear, and specific — and it is always fine to politely ask for a question to be clarified rather than guessing.";

    if (branch === "categorize") {
      const good = shuffle(rng, GOOD_PRACTICES).slice(0, 4);
      const poor = shuffle(rng, POOR_PRACTICES).slice(0, 4);
      const items = shuffle(rng, [
        ...good.map((label) => ({ id: label, label, bucket: "good" })),
        ...poor.map((label) => ({ id: label, label, bucket: "poor" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each candidate's behaviour into Good interview practice or Poor interview practice.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "good", label: "Good interview practice" },
          { id: "poor", label: "Poor interview practice" },
        ],
        correctBucket,
        hint,
        explanation: `Good practice: ${good.join(" / ")}. Poor practice: ${poor.join(" / ")}.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CLARIFICATION_PHRASES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.phrase, label: c.phrase })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.phrase, label: c.purpose })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.phrase] = c.phrase;
      return {
        kind: "click-match",
        prompt: "Match each polite way of seeking clarification during an interview to when it would be used.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `"${c.phrase}" — ${c.purpose.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of preparing for and attending a placement or scholarship interview in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Preparation starts well before the interview day, moves through the interview itself, and ends with a polite close.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIO_RESPONSES);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `An interviewer asks: "${entry.question}" Which response shows the most confident and clear answer?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "A confident answer gives a specific reason or example, rather than a vague or uncertain reply.",
        explanation: `The strongest answer is specific and shows genuine motivation: "${entry.correct}"`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word or phrase.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${[entry.before, entry.correctAnswer, entry.after].filter(Boolean).join(" ")}"`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
