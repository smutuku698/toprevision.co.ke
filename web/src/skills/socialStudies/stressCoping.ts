import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HEALTHY = [
  "Talking to a trusted friend or family member about how you feel",
  "Doing regular physical exercise",
  "Practicing deep breathing or relaxation techniques",
  "Breaking a big task into smaller, manageable steps",
  "Getting enough sleep",
  "Making time for a hobby you enjoy",
];

const UNHEALTHY = [
  "Bottling up feelings and refusing to talk about them",
  "Skipping meals or sleep for long periods",
  "Withdrawing completely from friends and family",
  "Taking out frustration on others by shouting or being harsh",
  "Avoiding the problem indefinitely instead of dealing with it",
  "Constantly comparing yourself negatively to others",
];

const REASONS: { text: string; kind: "healthy" | "unhealthy"; why: string }[] = [
  { text: "Talking to a trusted friend or family member about how you feel", kind: "healthy", why: "sharing feelings with someone you trust relieves pressure and can bring helpful support" },
  { text: "Doing regular physical exercise", kind: "healthy", why: "exercise reduces stress hormones and improves mood naturally" },
  { text: "Practicing deep breathing or relaxation techniques", kind: "healthy", why: "controlled breathing calms the body's stress response in the moment" },
  { text: "Breaking a big task into smaller, manageable steps", kind: "healthy", why: "smaller steps feel achievable and reduce the sense of being overwhelmed" },
  { text: "Getting enough sleep", kind: "healthy", why: "rest restores the body and mind's ability to handle stress" },
  { text: "Bottling up feelings and refusing to talk about them", kind: "unhealthy", why: "unexpressed feelings tend to build up and can worsen over time" },
  { text: "Skipping meals or sleep for long periods", kind: "unhealthy", why: "neglecting basic needs weakens the body's ability to cope with stress" },
  { text: "Withdrawing completely from friends and family", kind: "unhealthy", why: "isolation removes the support that could actually help reduce stress" },
  { text: "Taking out frustration on others by shouting or being harsh", kind: "unhealthy", why: "it harms relationships and does not address the real source of stress" },
  { text: "Avoiding the problem indefinitely instead of dealing with it", kind: "unhealthy", why: "the underlying source of stress remains unresolved and often grows" },
];

const COPING_STEPS = [
  { id: "notice", label: "Notice the signs that you are feeling stressed" },
  { id: "identify", label: "Identify what is actually causing the stress" },
  { id: "choose", label: "Choose a healthy coping strategy suited to the situation" },
  { id: "apply", label: "Apply the strategy, such as exercise, talking, or breaking the task down" },
  { id: "support", label: "Seek support from someone you trust if the stress continues" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A feeling of pressure or strain caused by a demanding situation is called ", after: ".", correctAnswer: "stress", accepted: ["stress"], explanation: "Stress is a feeling of pressure or strain caused by a demanding situation." },
  { before: "A way of dealing with stress or a difficult situation is called a ", after: " mechanism.", correctAnswer: "coping", accepted: ["coping"], explanation: "A coping mechanism is a way of dealing with stress or a difficult situation." },
  { before: "The ability to recover quickly from difficulty or stress is called ", after: ".", correctAnswer: "resilience", accepted: ["resilience"], explanation: "Resilience is the ability to recover quickly from difficulty or stress." },
  { before: "Deliberately taking time to care for your own physical and emotional wellbeing is called ", after: ".", correctAnswer: "self-care", accepted: ["self-care", "self care"], explanation: "Self-care is deliberately taking time to care for your own physical and emotional wellbeing." },
  { before: "People or resources a person can turn to for help during stressful times form a ", after: " system.", correctAnswer: "support", accepted: ["support"], explanation: "A support system is the people or resources a person can turn to for help during stressful times." },
] as const;

export const stressCoping: Skill = {
  id: "ss-l-stress-coping",
  code: "L.2",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "Healthy vs. unhealthy ways to cope with stress",
  description: "Sort coping behaviors into healthy and unhealthy ways of managing stress.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, REASONS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((r, i) => ({ id: `w${i}`, label: r.text })));
      const targets = shuffle(rng, chosen.map((r, i) => ({ id: `w${i}`, label: r.why.charAt(0).toUpperCase() + r.why.slice(1) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((r, i) => (correctMap[`w${i}`] = `w${i}`));
      return {
        kind: "click-match",
        prompt: "Match each coping behavior to why it helps or harms someone managing stress.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the behaviour addresses the real source of stress or just avoids/worsens it.",
        explanation: chosen.map((r) => `"${r.text}" — ${r.why}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about coping with stress.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe stress, coping, and support.",
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, COPING_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for healthily managing a stressful situation, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: COPING_STEPS.map((s) => s.id),
        hint: "You must notice and identify the stress before you can choose, apply, and (if needed) get support for a strategy.",
        explanation: COPING_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const askHealthy = rng() < 0.5;
      const correct = randChoice(rng, askHealthy ? HEALTHY : UNHEALTHY);
      const distractors = shuffle(rng, askHealthy ? UNHEALTHY : HEALTHY).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Which of these is a ${askHealthy ? "healthy" : "unhealthy"} way to cope with stress?`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: "Healthy coping addresses the stress directly and cares for the body and mind; unhealthy coping avoids or worsens it.",
        explanation: `"${correct}" is ${askHealthy ? "a healthy" : "an unhealthy"} way to cope with stress.`,
      };
    }

    const healthy = shuffle(rng, HEALTHY).slice(0, 3);
    const unhealthy = shuffle(rng, UNHEALTHY).slice(0, 3);
    const items = shuffle(rng, [
      ...healthy.map((label) => ({ id: label, label, bucket: "healthy" })),
      ...unhealthy.map((label) => ({ id: label, label, bucket: "unhealthy" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each behavior into Healthy Coping or Unhealthy Coping.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "healthy", label: "Healthy Coping" },
        { id: "unhealthy", label: "Unhealthy Coping" },
      ],
      correctBucket,
      hint: "Healthy coping addresses the stress directly and cares for the body and mind; unhealthy coping avoids or worsens it.",
      explanation: `Healthy: ${healthy.join(" / ")}. Unhealthy: ${unhealthy.join(" / ")}.`,
    };
  },
};
