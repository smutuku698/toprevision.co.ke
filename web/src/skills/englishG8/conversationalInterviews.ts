import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const INTERVIEW_PHRASES: { phrase: string; purpose: string }[] = [
  { phrase: "Thank you for agreeing to speak with us today.", purpose: "Politely opening the interview and thanking the guest" },
  { phrase: "Could you tell us a little about how you chose your career?", purpose: "Politely asking the guest to share background information" },
  { phrase: "That's a very interesting perspective, could you expand on that?", purpose: "Politely asking the guest to elaborate on their answer" },
  { phrase: "Would you mind if I asked a follow-up question?", purpose: "Politely requesting permission before asking more" },
  { phrase: "I appreciate your time and your insightful answers.", purpose: "Politely thanking the guest at the close of the interview" },
];

const POLITE_PRACTICE = [
  "Thanking the guest for taking the time to be interviewed",
  "Asking permission before asking a follow-up question",
  "Listening without interrupting while the guest is speaking",
  "Acknowledging the guest's opinion, even when you see it differently",
  "Using respectful titles such as \"Mr.\" or \"Dr.\" when addressing the guest",
];

const IMPOLITE_PRACTICE = [
  "Interrupting the guest before they finish an answer",
  "Arguing loudly with the guest's opinion",
  "Asking rude personal questions unrelated to the topic",
  "Not thanking the guest at the end of the interview",
  "Checking your phone while the guest is answering",
];

const INTERVIEW_STEPS = [
  { id: "greet", label: "Greet and thank the guest for joining the interview" },
  { id: "background", label: "Ask opening or background questions" },
  { id: "main", label: "Ask the main questions related to the topic, such as choosing a career" },
  { id: "followup", label: "Ask polite follow-up or clarifying questions" },
  { id: "close", label: "Thank the guest and close the interview" },
];

const FILL_ITEMS = [
  { before: "", after: "you tell us more about how you chose your career in this field?", correctAnswer: "Could", acceptedAnswers: ["Would", "Can"] },
  { before: "That's a very interesting point of view, thank you for", after: "that with us.", correctAnswer: "sharing", acceptedAnswers: [] },
  { before: "I", after: "your time today, and your insightful answers have been very helpful.", correctAnswer: "appreciate", acceptedAnswers: ["value"] },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to use polite language during an interview?",
    correct: "It shows respect for the guest and helps build a comfortable, honest conversation",
    distractors: ["It has no real effect on the interview's outcome", "It only matters when the guest is a stranger", "Polite language slows the interview down unnecessarily"],
  },
  {
    q: "How do we show respect for other people's opinions during an interview?",
    correct: "By listening carefully, acknowledging their view, and responding calmly even when we disagree",
    distractors: ["By interrupting to correct them immediately", "By ignoring opinions that differ from our own", "By ending the interview if we disagree"],
  },
  {
    q: "During a career-day interview, the guest gives an answer you disagree with. What is the polite way to respond?",
    correct: "Acknowledge their view respectfully, then politely share a different perspective if needed",
    distractors: ["Tell them bluntly that they are wrong", "Change the subject without acknowledging their answer", "Stop the interview immediately"],
  },
  {
    q: "What role do interviews play in presenting reality?",
    correct: "They allow the public to hear firsthand accounts and opinions directly from the people involved",
    distractors: ["They are only meant to entertain, not inform", "They always show a completely fictional version of events", "They replace the need for any other source of information"],
  },
];

export const conversationalInterviews: Skill = {
  id: "g8-eng-ls-conversational-interviews",
  code: "LS.11",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Conversational Skills: Interviews",
  description: "Identify and use polite words and expressions when conducting an interview, such as one on choosing a career.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Polite interviewing means greeting and thanking your guest, listening without interrupting, and respectfully asking permission before follow-up questions.";

    if (branch === "match") {
      const tokens = shuffle(rng, INTERVIEW_PHRASES.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, INTERVIEW_PHRASES.map((p) => ({ id: p.phrase, label: p.purpose })));
      const correctMap: Record<string, string> = {};
      for (const p of INTERVIEW_PHRASES) correctMap[p.phrase] = p.phrase;
      return {
        kind: "click-match",
        prompt: "Match each interview phrase to its purpose.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: INTERVIEW_PHRASES.map((p) => `"${p.phrase}" — ${p.purpose.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const polite = shuffle(rng, POLITE_PRACTICE).slice(0, 3);
      const impolite = shuffle(rng, IMPOLITE_PRACTICE).slice(0, 3);
      const items = shuffle(rng, [
        ...polite.map((label) => ({ id: label, label, bucket: "polite" })),
        ...impolite.map((label) => ({ id: label, label, bucket: "impolite" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each behaviour into Polite interview practice or Impolite interview practice.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "polite", label: "Polite interview practice" },
          { id: "impolite", label: "Impolite interview practice" },
        ],
        correctBucket,
        hint,
        explanation: `Polite: ${polite.join(" / ")}. Impolite: ${impolite.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, INTERVIEW_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the stages of a polite career-choice interview in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: INTERVIEW_STEPS.map((s) => s.id),
        hint: "A good interview opens with thanks, moves through background and main questions, and closes politely.",
        explanation: INTERVIEW_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete this polite interview line.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers.length ? entry.acceptedAnswers : undefined,
        inputMode: "text",
        hint,
        explanation: `The complete line reads: "${[entry.before, entry.correctAnswer, entry.after].filter(Boolean).join(" ")}"`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
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
