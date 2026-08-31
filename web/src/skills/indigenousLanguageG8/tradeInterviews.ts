import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRESENTATION_CHARACTERISTICS: { trait: string; description: string }[] = [
  { trait: "Confidence", description: "Speaking without hesitation and maintaining a steady voice" },
  { trait: "Clarity", description: "Using clear, well-organised language that is easy to follow" },
  { trait: "Audience awareness", description: "Adjusting the content and tone to suit who is listening" },
  { trait: "Good eye contact", description: "Looking at the interviewer or audience instead of reading notes constantly" },
  { trait: "Relevant examples", description: "Using real examples, such as describing a local market day, to support a point" },
];

const TURN_TAKING_ITEMS: { text: string; bucket: string }[] = [
  { text: "\"Excuse me, may I ask a follow-up question?\"", bucket: "Polite way to take a turn" },
  { text: "\"If I may add something to that point...\"", bucket: "Polite way to take a turn" },
  { text: "Waiting for the interviewee to finish before asking the next question", bucket: "Polite way to take a turn" },
  { text: "Interrupting the interviewee mid-answer to change the topic abruptly", bucket: "Impolite way to take a turn" },
  { text: "Talking over the interviewee's answer", bucket: "Impolite way to take a turn" },
  { text: "Ignoring the interviewer's question and talking about something unrelated", bucket: "Impolite way to take a turn" },
];

const INTERVIEW_STEPS: { id: string; label: string }[] = [
  { id: "greet", label: "Greet the interviewee and introduce the topic of indigenous trade" },
  { id: "ask", label: "Ask open questions about traditional trade practices" },
  { id: "listen", label: "Listen attentively and take turns politely" },
  { id: "followup", label: "Ask relevant follow-up questions based on the answers given" },
  { id: "close", label: "Thank the interviewee and summarise the key points learnt" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  {
    before: "Adjusting your language and examples to suit who is listening is known as audience",
    after: ".",
    answer: "awareness",
  },
  {
    before: "Saying \"Excuse me, may I ask a follow-up",
    after: "?\" is a polite way to take a turn in an interview.",
    answer: "question",
  },
  {
    before: "A confident interviewee maintains steady eye contact and speaks without unnecessary",
    after: ".",
    answer: "hesitation",
  },
  {
    before: "In traditional Kenyan communities, items such as salt, livestock, and honey were often exchanged through",
    after: ".",
    answer: "barter",
    accepted: ["barter trade", "trade"],
  },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What does 'audience awareness' mean during an oral presentation?",
    correct: "Adjusting your language, tone, and content to suit your listeners",
    distractors: [
      "Speaking the same way regardless of who is listening",
      "Only presenting to people you already know",
      "Avoiding eye contact with the audience",
    ],
  },
  {
    q: "Which of these is a characteristic of a good oral presentation?",
    correct: "Speaking clearly and confidently with organised ideas",
    distractors: [
      "Reading directly from notes without ever looking up",
      "Speaking too fast for the audience to follow",
      "Avoiding eye contact throughout the talk",
    ],
  },
  {
    q: "During a mock interview, which is the most polite way to ask a follow-up question?",
    correct: "\"Excuse me, may I ask a follow-up question?\"",
    distractors: [
      "Interrupting and asking whatever comes to mind",
      "Talking over the interviewee's answer",
      "Waving a hand impatiently until noticed",
    ],
  },
  {
    q: "Why is confidence important during an oral presentation?",
    correct: "It helps the audience trust and stay engaged with the speaker's message",
    distractors: [
      "It allows the speaker to avoid preparing beforehand",
      "It means the speaker never needs examples",
      "It makes the presentation shorter",
    ],
  },
  {
    q: "In traditional indigenous trade, why did communities exchange goods such as salt, livestock, and honey?",
    correct: "Because different communities produced different goods and needed to trade to get what they lacked",
    distractors: [
      "Because money was always used instead of goods",
      "Because trade was banned between neighbouring communities",
      "Because every community produced exactly the same goods",
    ],
  },
];

export const tradeInterviews: Skill = {
  id: "g8-il-ls-trade",
  code: "LS.6",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Indigenous trade: self-expression through interviews",
  description: "Identify characteristics of a good oral presentation and apply audience awareness and polite turn-taking in a mock interview about indigenous trade.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A good interview presentation is confident and clear, suits its audience, and uses polite turn-taking phrases.";

    if (branch === "match") {
      const chosen = shuffle(rng, PRESENTATION_CHARACTERISTICS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.trait, label: c.trait })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.trait, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.trait] = c.trait;
      return {
        kind: "click-match",
        prompt: "Match each characteristic of a good oral presentation to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `${c.trait} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, TURN_TAKING_ITEMS);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "A polite turn asks permission or waits patiently; an impolite one interrupts or talks over the speaker.",
        explanation: chosen.map((c) => `${c.text} — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, INTERVIEW_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of a good mock interview about indigenous trade in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: INTERVIEW_STEPS.map((s) => s.id),
        hint: "Start with a greeting, then ask questions, listen and take turns, follow up, and close with thanks.",
        explanation: INTERVIEW_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
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
