import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const SIGNS = [
  { text: "Accepting compliments and believing you deserve them", bucket: "healthy" },
  { text: "Trying new activities without fear of failing", bucket: "healthy" },
  { text: "Standing up for your opinion even if others disagree", bucket: "healthy" },
  { text: "Accepting mistakes as a chance to learn and improve", bucket: "healthy" },
  { text: "Constantly seeking approval from others before making decisions", bucket: "unhealthy" },
  { text: "Putting yourself down or comparing yourself negatively to others", bucket: "unhealthy" },
  { text: "Avoiding new challenges out of fear of being judged", bucket: "unhealthy" },
  { text: "Struggling to accept compliments or believing you don't deserve praise", bucket: "unhealthy" },
] as const;

const EFFECTS = [
  { effect: "Difficulty forming and keeping healthy friendships", cause: "Unhealthy self-esteem" },
  { effect: "Increased vulnerability to negative peer pressure", cause: "Unhealthy self-esteem" },
  { effect: "Poor performance in school due to fear of failure", cause: "Unhealthy self-esteem" },
  { effect: "Confidence to try new activities and take on leadership roles", cause: "Healthy self-esteem" },
  { effect: "Ability to handle criticism without feeling worthless", cause: "Healthy self-esteem" },
  { effect: "Setting and pursuing ambitious personal goals", cause: "Healthy self-esteem" },
] as const;

const STRATEGIES = [
  "Recognise and celebrate your own strengths and achievements",
  "Set realistic, achievable personal goals",
  "Surround yourself with supportive, encouraging people",
  "Practise positive self-talk instead of self-criticism",
  "Accept that making mistakes is part of learning",
  "Avoid constantly comparing yourself to others",
] as const;

const SCENARIOS = [
  { situation: "After failing a maths test, Kevin tells himself 'I'm just bad at everything' and stops trying in class.", assessment: "unhealthy" },
  { situation: "After failing a maths test, Nia reviews her mistakes, asks the teacher for help, and keeps working hard.", assessment: "healthy" },
  { situation: "Fatuma joined the debate club even though she was nervous, because she believed she could improve.", assessment: "healthy" },
  { situation: "Because his friends teased him once, Brian now refuses to answer any question in class.", assessment: "unhealthy" },
] as const;

const ASSESSMENT_LABEL: Record<string, string> = { healthy: "Shows healthy self-esteem", unhealthy: "Shows unhealthy self-esteem" };

const TERMS = [
  { term: "Self-esteem", clue: "your overall sense of your own worth and value as a person" },
  { term: "Self-confidence", clue: "trust in your own abilities to succeed at a specific task" },
  { term: "Self-concept", clue: "the overall picture or belief you hold about who you are" },
] as const;

export const selfEsteemAssessment: Skill = {
  id: "g8-ss-spm-self-esteem",
  code: "SPM.2",
  subjectId: "social-studies",
  strandId: "g8-ss-spm",
  grade: 8,
  title: "Self-esteem assessment",
  description: "Recognising healthy versus unhealthy self-esteem, its effects on holistic development, assessing self-esteem in social situations, and strategies for improving it.",
  generate(rng) {
    const branch = randChoice(rng, ["signs", "effects", "assess", "strategy", "term"] as const);

    if (branch === "signs") {
      const chosen = shuffle(rng, SIGNS).slice(0, 6);
      const buckets = [
        { id: "healthy", label: "Healthy self-esteem" },
        { id: "unhealthy", label: "Unhealthy self-esteem" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each behaviour into healthy or unhealthy self-esteem.",
        items,
        buckets,
        correctBucket,
        hint: "Healthy self-esteem accepts both praise and mistakes calmly; unhealthy self-esteem avoids challenges or constantly seeks approval.",
        explanation: chosen.map((s) => `"${s.text}" is a sign of ${s.bucket} self-esteem.`).join(" "),
      };
    }

    if (branch === "effects") {
      const chosen = shuffle(rng, [...EFFECTS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((e, i) => ({ id: `e${i}`, label: e.effect })));
      const targets = shuffle(rng, chosen.map((e, i) => ({ id: `e${i}`, label: e.cause })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((e, i) => (correctMap[`e${i}`] = `e${i}`));
      return {
        kind: "click-match",
        prompt: "Match each effect on holistic development to whether it results from healthy or unhealthy self-esteem.",
        tokens,
        targets,
        correctMap,
        hint: "Healthy self-esteem builds confidence and resilience; unhealthy self-esteem creates fear and avoidance.",
        explanation: chosen.map((e) => `${e.effect} — caused by ${e.cause.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "assess") {
      const s = randChoice(rng, SCENARIOS);
      const label = ASSESSMENT_LABEL[s.assessment];
      const other = s.assessment === "healthy" ? ASSESSMENT_LABEL["unhealthy"] : ASSESSMENT_LABEL["healthy"];
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: `${s.situation} What does this reaction show?`,
        choices,
        correctIndex: choices.indexOf(label),
        hint: "Look at how the person responds to failure or a challenge — do they give up and self-criticise, or push forward calmly?",
        explanation: `${s.situation} ${label} because of how the person responded to the setback or challenge.`,
      };
    }

    if (branch === "strategy") {
      const correct = randChoice(rng, STRATEGIES);
      const others = STRATEGIES.filter((s) => s !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these is a good strategy for improving personal self-esteem?",
        choices,
        correctIndex,
        hint: "A good strategy builds you up instead of relying on others' opinions or avoiding difficulty.",
        explanation: `${correct} is a healthy strategy for building self-esteem for personal productivity.`,
      };
    }

    // term
    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: `___ describes ${t.clue}.`,
      before: "",
      after: "",
      correctAnswer: t.term,
      inputMode: "text",
      hint: "Think about which of self-esteem, self-confidence, or self-concept best matches this description.",
      explanation: `${t.term} describes ${t.clue}.`,
    };
  },
};
