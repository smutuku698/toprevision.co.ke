import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Style = "assertive" | "passive" | "aggressive";

const STYLE_LABELS: Record<Style, string> = {
  assertive: "Assertive",
  passive: "Passive",
  aggressive: "Aggressive",
};

const STATEMENTS: { text: string; style: Style; why: string }[] = [
  {
    text: "\"I feel frustrated when the work isn't shared equally. Can we split the tasks fairly?\"",
    style: "assertive",
    why: "It states a feeling and a clear, respectful request without attacking the other person.",
  },
  {
    text: "\"It's fine, I'll just do all the work myself, don't worry about it...\"",
    style: "passive",
    why: "It hides the speaker's true feelings and avoids stating their needs directly.",
  },
  {
    text: "\"You never do any work! You always leave everything to me!\"",
    style: "aggressive",
    why: "It blames and attacks the other person using 'you never/always' accusations instead of stating a need.",
  },
  {
    text: "\"I'd prefer to sit somewhere quieter — would you mind if we moved?\"",
    style: "assertive",
    why: "It clearly and politely expresses a preference and asks, respecting both people.",
  },
  {
    text: "\"Whatever you want is fine, I don't really mind either way.\" (even though they do mind)",
    style: "passive",
    why: "It avoids expressing a real opinion to prevent conflict, even at the cost of the speaker's own needs.",
  },
  {
    text: "\"Move out of my way, that's a stupid place to stand!\"",
    style: "aggressive",
    why: "It uses insults and demands rather than a calm, respectful request.",
  },
  {
    text: "\"I disagree with this plan. Here's why, and here's what I'd suggest instead.\"",
    style: "assertive",
    why: "It states disagreement directly and respectfully, along with a constructive suggestion.",
  },
  {
    text: "\"I guess I'll just go along with it, even though I don't really agree...\"",
    style: "passive",
    why: "It gives in without voicing the disagreement, avoiding conflict rather than addressing it.",
  },
  {
    text: "\"This plan is ridiculous and only an idiot would suggest it!\"",
    style: "aggressive",
    why: "It attacks the idea and the person harshly instead of explaining the disagreement respectfully.",
  },
  {
    text: "\"I need some quiet time to finish this task — can we talk again in twenty minutes?\"",
    style: "assertive",
    why: "It states a clear need and proposes a respectful, specific solution.",
  },
  {
    text: "\"Sure, take my seat, it doesn't matter...\" (while feeling annoyed and unheard)",
    style: "passive",
    why: "It gives away what the speaker wants while hiding their real feelings.",
  },
  {
    text: "\"Get out of my way right now or you'll regret it!\"",
    style: "aggressive",
    why: "It uses threats and demands instead of a calm, respectful request.",
  },
];

const I_STATEMENT_STEPS = [
  { id: "identify", label: "Notice and identify how you actually feel" },
  { id: "state", label: "State the feeling clearly, starting with \"I feel...\"" },
  { id: "explain", label: "Explain the specific situation that caused the feeling, without blaming" },
  { id: "request", label: "Make a clear, respectful request for what you need" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A communication style that expresses your feelings and needs honestly while still respecting others is called ", after: ".", correctAnswer: "assertive", accepted: ["assertive"], explanation: "Assertive communication expresses your own feelings and needs honestly and respectfully, without avoiding them or attacking others." },
  { before: "A communication style that avoids stating your true feelings or needs, often to prevent conflict, is called ", after: ".", correctAnswer: "passive", accepted: ["passive"], explanation: "Passive communication avoids expressing true feelings or needs, which can leave the speaker's own needs unmet." },
  { before: "A communication style that blames or attacks the other person instead of stating a need is called ", after: ".", correctAnswer: "aggressive", accepted: ["aggressive"], explanation: "Aggressive communication blames or attacks rather than calmly stating a need or feeling." },
  { before: "Starting a sentence with \"I feel...\" instead of \"You always...\" is a technique used in ", after: " communication.", correctAnswer: "assertive", accepted: ["assertive"], explanation: "\"I feel...\" statements are a core technique of assertive communication, focusing on your own feelings rather than blaming the other person." },
  { before: "Understanding and sharing another person's feelings during a conversation is called ", after: ".", correctAnswer: "empathy", accepted: ["empathy"], explanation: "Empathy is understanding and sharing another person's feelings, which supports healthy communication." },
  { before: "Discussing differences and working toward a solution both people can accept is called ", after: ".", correctAnswer: "negotiation", accepted: ["negotiation"], explanation: "Negotiation is discussing differences to reach a solution both sides can accept, a key negotiation skill in healthy relationships." },
  { before: "Communication that clearly and accurately conveys a message so it is understood as intended is called ", after: " communication.", correctAnswer: "effective", accepted: ["effective"], explanation: "Effective communication conveys a message clearly and accurately, so it is understood as intended." },
  { before: "Limits a person sets on how others may treat them are called personal ", after: ".", correctAnswer: "boundaries", accepted: ["boundaries"], explanation: "Personal boundaries are the limits a person sets on how others may treat them, often communicated assertively." },
] as const;

export const communicationStyle: Skill = {
  id: "ss-l-communication-style",
  code: "L.1",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "Assertive, passive, or aggressive?",
  description: "Identify whether a statement is an example of assertive, passive, or aggressive communication.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "sort", "match", "fill-blank", "i-statement-order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, STATEMENTS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s, i) => ({ id: `m${i}`, label: s.text })));
      const targets = shuffle(rng, chosen.map((s, i) => ({ id: `m${i}`, label: s.why })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((s, i) => (correctMap[`m${i}`] = `m${i}`));
      return {
        kind: "click-match",
        prompt: "Match each statement to the reason it shows that communication style.",
        tokens,
        targets,
        correctMap,
        hint: "Look at whether the speaker states their own feelings respectfully, hides them, or attacks the other person.",
        explanation: chosen.map((s) => `"${s.text}" — ${s.why.toLowerCase()}`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about communication styles.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about assertive, passive, and aggressive communication, and the skills that support healthy relationships.",
        explanation: fb.explanation,
      };
    }

    if (branch === "i-statement-order") {
      const items = shuffle(rng, I_STATEMENT_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for making an assertive \"I feel...\" statement, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: I_STATEMENT_STEPS.map((s) => s.id),
        hint: "Notice the feeling first, then name it, explain the situation without blame, and finally make a request.",
        explanation: I_STATEMENT_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, STATEMENTS).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.style));

      return {
        kind: "categorize",
        prompt: "Sort each statement by the communication style it shows.",
        items,
        buckets: (Object.keys(STYLE_LABELS) as Style[]).map((s) => ({ id: s, label: STYLE_LABELS[s] })),
        correctBucket,
        hint: "Assertive is honest and respectful; passive avoids saying what you really feel; aggressive attacks or blames others.",
        explanation: chosen.map((s) => `"${s.text}" is ${STYLE_LABELS[s.style].toLowerCase()} — ${s.why.toLowerCase()}`).join(" "),
      };
    }

    const entry = randChoice(rng, STATEMENTS);
    const choices = shuffle(rng, Object.values(STYLE_LABELS));
    const correctLabel = STYLE_LABELS[entry.style];

    return {
      kind: "multiple-choice",
      prompt: `What communication style does this statement show? ${entry.text}`,
      choices,
      correctIndex: choices.indexOf(correctLabel),
      layout: "row",
      hint: "Assertive is honest and respectful; passive avoids saying what you really feel; aggressive attacks or blames others.",
      explanation: entry.why,
    };
  },
};
