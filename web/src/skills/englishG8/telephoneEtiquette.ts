import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASE_FUNCTIONS: { phrase: string; function: string }[] = [
  { phrase: "Good morning, this is Amina speaking.", function: "Greeting the caller and identifying yourself" },
  { phrase: "May I speak to Mr. Kiptoo, please?", function: "Politely asking for the person you want to reach" },
  { phrase: "Who's calling, please?", function: "Politely asking who is on the line" },
  { phrase: "Could you please hold on for a moment?", function: "Politely asking the caller to wait" },
  { phrase: "I'm sorry, she's not available right now.", function: "Politely explaining that someone cannot come to the phone" },
  { phrase: "Could I take a message for you?", function: "Offering to pass on information to the person called" },
  { phrase: "Thank you for calling. Goodbye.", function: "Politely ending the call" },
];

const POLITE_PHRASES = [
  "May I speak to the manager, please?",
  "Could you please repeat that, I didn't quite catch it?",
  "Thank you so much for your help.",
  "I'm sorry, but you have the wrong number.",
  "Would you mind holding for a moment?",
  "I appreciate you calling to report this, how can I help?",
];

const IMPOLITE_PHRASES = [
  "Who's this? What do you want?",
  "She's not here. Call back later.",
  "Speak up, I can't hear you!",
  "I don't have time for this right now.",
  "You've got the wrong number, don't call again.",
  "Hang on.",
];

const CALL_STEPS = [
  { id: "greet", label: "Greet the caller politely (e.g. \"Good morning\")" },
  { id: "identify", label: "Identify yourself so the caller knows who they are speaking to" },
  { id: "purpose", label: "Ask for the person or state the purpose of the call" },
  { id: "respond", label: "Respond appropriately, e.g. connect the call, ask them to hold, or offer to take a message" },
  { id: "close", label: "Close the call politely by thanking the caller and saying goodbye" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Good afternoon,", after: "is Brian speaking. How may I help you?", correctAnswer: "this", acceptedAnswers: ["it"] },
  { before: "", after: "you please hold the line for a moment while I check?", correctAnswer: "Could", acceptedAnswers: ["Would", "Can"] },
  { before: "I'm sorry, she is not", after: "right now, may I take a message?", correctAnswer: "available", acceptedAnswers: ["in", "here"] },
  { before: "", after: "I take a message for you, please?", correctAnswer: "May", acceptedAnswers: ["Could", "Can"] },
  { before: "Thank you for calling, have a", after: "day.", correctAnswer: "good", acceptedAnswers: ["nice", "great", "wonderful"] },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should one be polite when speaking over the telephone?",
    correct: "Because the listener cannot see your face, so your words and tone carry all the meaning",
    distractors: ["Because telephone calls are always recorded", "Because impolite words cost more money to say", "Because politeness is only necessary when speaking to elders"],
  },
  {
    q: "What should you say if the person a caller is asking for is not available?",
    correct: "Apologise politely and offer to take a message",
    distractors: ["Hang up without explaining anything", "Tell the caller to try later without any explanation", "Say the person will never be available"],
  },
  {
    q: "Which of these is the most polite way to ask who is calling?",
    correct: "May I know who is calling, please?",
    distractors: ["Who's this?", "What do you want?", "Speak up, who are you?"],
  },
  {
    q: "How do we ensure politeness in a telephone conversation?",
    correct: "By using courteous words such as \"please\" and \"thank you\" along with a respectful tone of voice",
    distractors: ["By speaking as fast as possible so the call is short", "By keeping every call under one minute no matter what", "By avoiding greetings to save time"],
  },
  {
    q: "A caller phones a children's helpline to report a concern. What is the most appropriate way for the operator to respond?",
    correct: "Greet the caller warmly, listen patiently, and respond with calm, respectful language",
    distractors: ["Ask the caller to call back at a more convenient time", "Interrupt the caller to finish the call quickly", "Tell the caller their concern is not important"],
  },
];

export const telephoneEtiquette: Skill = {
  id: "g8-eng-ls-telephone-etiquette",
  code: "LS.1",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Polite Language: Telephone Etiquette",
  description: "Identify and use polite words and expressions in telephone conversations.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Politeness on the phone comes from courteous words, a respectful tone, and clear turn-taking, since the caller cannot see your face.";

    if (branch === "match") {
      const chosen = shuffle(rng, PHRASE_FUNCTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.function })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;
      return {
        kind: "click-match",
        prompt: "Match each telephone phrase to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.phrase}" — used for ${p.function.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const polite = shuffle(rng, POLITE_PHRASES).slice(0, 3);
      const impolite = shuffle(rng, IMPOLITE_PHRASES).slice(0, 3);
      const items = shuffle(rng, [
        ...polite.map((label) => ({ id: label, label, bucket: "polite" })),
        ...impolite.map((label) => ({ id: label, label, bucket: "impolite" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each expression into Polite or Impolite telephone language.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "polite", label: "Polite" },
          { id: "impolite", label: "Impolite" },
        ],
        correctBucket,
        hint,
        explanation: `Polite: ${polite.join(" / ")}. Impolite: ${impolite.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, CALL_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the stages of a polite telephone conversation in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: CALL_STEPS.map((s) => s.id),
        hint: "A polite call opens with a greeting and identification, moves through its purpose and response, and closes with thanks.",
        explanation: CALL_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing polite word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `A polite telephone line reads: "${[entry.before, entry.correctAnswer, entry.after].filter(Boolean).join(" ")}"`,
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
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
