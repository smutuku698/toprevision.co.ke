import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ITEMS: { text: string; bucket: "barrier" | "strategy"; why: string }[] = [
  { text: "Poor communication between the parties in conflict", bucket: "barrier", why: "misunderstandings grow when the two sides cannot exchange information clearly" },
  { text: "Deep mistrust built up over past disputes", bucket: "barrier", why: "past hurt makes parties suspicious of each other's motives, blocking cooperation" },
  { text: "Prejudice or stereotyping of the other side", bucket: "barrier", why: "unfair assumptions about the other side prevent a fair, open hearing of their views" },
  { text: "An imbalance of power between the parties", bucket: "barrier", why: "the weaker side may feel unable to negotiate fairly or be heard" },
  { text: "Refusing to acknowledge the other side's feelings", bucket: "barrier", why: "dismissing feelings blocks empathy and keeps both sides defensive" },
  { text: "Rigid, all-or-nothing positions with no willingness to compromise", bucket: "barrier", why: "when neither side will adjust their position, no shared solution can be reached" },
  { text: "Listening actively and managing emotions calmly", bucket: "strategy", why: "calm, attentive listening helps both sides feel heard and think clearly" },
  { text: "Community dialogue and peace agreements", bucket: "strategy", why: "shared, agreed commitments give a community a common way to prevent conflict recurring" },
  { text: "Using a neutral mediator to guide discussion", bucket: "strategy", why: "a mediator with no stake in the outcome helps both sides find common ground fairly" },
  { text: "Practising empathy to understand the other side's view", bucket: "strategy", why: "understanding the other side's perspective builds trust and opens the door to compromise" },
  { text: "Separating the problem from the people involved", bucket: "strategy", why: "focusing on the issue rather than attacking the person keeps the discussion constructive" },
  { text: "Agreeing on ground rules before discussing the issue", bucket: "strategy", why: "clear ground rules (e.g. no interrupting) keep the discussion respectful and fair" },
];

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Why is managing one's emotions important during conflict resolution?",
    choices: ["Calm emotions make it easier to listen, negotiate, and find fair solutions", "Emotions have no effect on how a conflict is resolved", "Showing anger always resolves conflict faster", "It is only useful for the mediator, not the parties in conflict"],
    correctIndex: 0,
    explanation: "Managing emotions helps people communicate clearly and think rationally, which makes it far easier to reach a fair, peaceful resolution.",
  },
  {
    prompt: "What is the value of a peace agreement made at the community level?",
    choices: ["It gives the community a shared, agreed way to prevent conflict from recurring", "It only benefits leaders, not ordinary community members", "It removes the need for future dialogue", "It works only if enforced by the national government"],
    correctIndex: 0,
    explanation: "Community-level peace agreements build shared commitment among neighbours to resolve future disagreements peacefully rather than through violence.",
  },
  {
    prompt: "What is 'negative peace' in the study of peace and conflict?",
    choices: ["The mere absence of war or direct violence, even if injustice remains", "A completely peaceful society with no problems at all", "A peace agreement that has failed", "Violence that is considered acceptable"],
    correctIndex: 0,
    explanation: "Negative peace is simply the absence of direct violence or war — it does not by itself mean justice or harmony exist.",
  },
  {
    prompt: "What is 'positive peace' in the study of peace and conflict?",
    choices: ["The presence of justice, equity, and healthy relationships that prevent conflict from arising", "A peace that only exists during wartime", "A type of peace with no requirements at all", "The complete absence of all disagreement"],
    correctIndex: 0,
    explanation: "Positive peace goes beyond the absence of violence — it means justice, equity, and healthy relationships exist, which prevents conflict from arising in the first place.",
  },
  {
    prompt: "A country has no active war, but deep inequality and injustice remain between groups. Which type of peace best describes this?",
    choices: ["Negative peace, since violence is absent but justice is not yet achieved", "Positive peace, since there is no war at all", "No peace at all, by definition", "Total peace, since fighting has stopped"],
    correctIndex: 0,
    explanation: "Absence of war without justice or equity is negative peace — positive peace requires the underlying causes of conflict to be resolved too.",
  },
  {
    prompt: "Why is emotional intelligence useful in peaceful conflict resolution?",
    choices: ["It helps a person recognise and manage their own and others' emotions during disagreement", "It guarantees that one side will always win the argument", "It replaces the need for any communication between parties", "It only matters for professional mediators, not ordinary people"],
    correctIndex: 0,
    explanation: "Emotional intelligence helps people recognise and manage emotions — their own and others' — which keeps a disagreement from escalating into unmanaged conflict.",
  },
];

const MEDIATION_STEPS = [
  { id: "identify", label: "Identify and clearly name the issue causing the conflict" },
  { id: "share", label: "Let each side share their perspective without interruption" },
  { id: "common-ground", label: "A neutral mediator helps both sides find common ground" },
  { id: "agree", label: "Both sides agree on a fair solution" },
  { id: "follow-up", label: "Follow up later to make sure the agreement is being kept" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A neutral third party who helps two sides in conflict reach an agreement is called a ", after: ".", correctAnswer: "mediator", accepted: ["mediator"], explanation: "A mediator is a neutral third party who helps guide discussion between parties in conflict toward a fair agreement." },
  { before: "Understanding and sharing another person's feelings, especially during a disagreement, is called ", after: ".", correctAnswer: "empathy", accepted: ["empathy"], explanation: "Empathy is understanding and sharing another person's feelings, which helps de-escalate conflict." },
  { before: "The ability to recognise and manage your own and others' emotions is called emotional ", after: ".", correctAnswer: "intelligence", accepted: ["intelligence"], explanation: "Emotional intelligence is the ability to recognise and manage emotions, both your own and other people's, during conflict." },
  { before: "Peace that is simply the absence of war or direct violence is called ", after: " peace.", correctAnswer: "negative", accepted: ["negative"], explanation: "Negative peace is the absence of direct violence, even if underlying injustice remains." },
  { before: "Peace that includes justice, equity, and healthy relationships that prevent conflict is called ", after: " peace.", correctAnswer: "positive", accepted: ["positive"], explanation: "Positive peace includes justice and healthy relationships that prevent conflict from arising, not just the absence of violence." },
  { before: "An open conversation between community members aimed at resolving differences is called community ", after: ".", correctAnswer: "dialogue", accepted: ["dialogue"], explanation: "Community dialogue is an open conversation among members aimed at resolving differences peacefully." },
  { before: "A formal understanding reached between conflicting groups to stop fighting and cooperate is a peace ", after: ".", correctAnswer: "agreement", accepted: ["agreement"], explanation: "A peace agreement is a formal understanding that ends conflict and sets out how parties will cooperate going forward." },
  { before: "Judging someone unfairly based on a fixed idea about their group, rather than as an individual, is called ", after: ".", correctAnswer: "stereotyping", accepted: ["stereotyping", "prejudice"], explanation: "Stereotyping (or prejudice) is judging someone based on a fixed idea about their group rather than who they actually are." },
] as const;

export const conflictResolution: Skill = {
  id: "ss-pr-conflict-resolution",
  code: "PR.5",
  subjectId: "social-studies",
  strandId: "ss-pr",
  grade: 9,
  title: "Peaceful conflict resolution",
  description: "Barriers to resolving conflict peacefully, and strategies that help overcome them.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "why", "match", "fill-blank", "mediation-order"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, ITEMS).slice(0, 6);
      const items = chosen.map((it, i) => ({ id: `i${i}`, label: it.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it, i) => (correctBucket[`i${i}`] = it.bucket));

      return {
        kind: "categorize",
        prompt: "Sort each statement: is it a barrier to peaceful conflict resolution, or a strategy that helps resolve conflict?",
        items,
        buckets: [
          { id: "barrier", label: "Barrier" },
          { id: "strategy", label: "Resolution strategy" },
        ],
        correctBucket,
        hint: "Barriers make conflict worse or harder to solve; strategies actively work toward a peaceful outcome.",
        explanation: chosen.map((it) => `"${it.text}" is a ${it.bucket === "barrier" ? "barrier to" : "strategy for"} peaceful conflict resolution.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ITEMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((it, i) => ({ id: `w${i}`, label: it.text })));
      const targets = shuffle(rng, chosen.map((it, i) => ({ id: `w${i}`, label: it.why.charAt(0).toUpperCase() + it.why.slice(1) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((it, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each statement to the reason it is a barrier or a strategy in conflict resolution.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the statement makes cooperation harder or actively helps both sides reach agreement.",
        explanation: chosen.map((it) => `"${it.text}" — ${it.why}.`).join(" "),
      };
    }

    if (branch === "mediation-order") {
      const items = shuffle(rng, MEDIATION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps of a mediated conflict resolution process in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: MEDIATION_STEPS.map((s) => s.id),
        hint: "Name the issue first, let both sides speak, find common ground, agree on a solution, then follow up.",
        explanation: MEDIATION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about peaceful conflict resolution.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe peace, mediation, and emotional intelligence.",
        explanation: fb.explanation,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about what actually reduces conflict versus what only looks peaceful on the surface.",
      explanation: q.explanation,
    };
  },
};
