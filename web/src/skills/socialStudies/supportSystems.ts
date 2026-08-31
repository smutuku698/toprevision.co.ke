import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SYSTEMS: { name: string; description: string }[] = [
  { name: "Psychosocial support", description: "Help with a learner's emotional and social wellbeing, such as counselling for stress or anxiety" },
  { name: "Social support", description: "Encouragement and practical help from family, friends, and community members" },
  { name: "Mentorship/coaching", description: "Guidance from an experienced person who shares knowledge and advice for pre-career growth" },
  { name: "Spiritual support", description: "Guidance and comfort drawn from a learner's faith and religious community" },
  { name: "Career support system", description: "Formal guidance from school career offices, counsellors, or career fairs about pathways and jobs" },
];

const CHALLENGE_SOLUTIONS: { text: string; kind: "challenge" | "solution" }[] = [
  { text: "Not knowing which support system to approach for a specific need", kind: "challenge" },
  { text: "Limited access to trained career counsellors in some schools", kind: "challenge" },
  { text: "Family or community pressure that conflicts with a learner's own interests", kind: "challenge" },
  { text: "A mentor who is unavailable or unresponsive when needed", kind: "challenge" },
  { text: "Cultural or generational gaps that make advice from elders feel disconnected", kind: "challenge" },
  { text: "Cost or distance barriers to reaching formal support services", kind: "challenge" },
  { text: "Seeking guidance from multiple sources instead of relying on just one", kind: "solution" },
  { text: "Building a personal network of trusted mentors and advisers over time", kind: "solution" },
  { text: "Using school career offices or online resources when in-person support is limited", kind: "solution" },
  { text: "Respectfully discussing differing views with family or elders", kind: "solution" },
  { text: "Scheduling regular, planned check-ins with a mentor", kind: "solution" },
  { text: "Advocating for more career guidance resources at school", kind: "solution" },
];

const MAPPING_STEPS = [
  { id: "reflect", label: "Reflect on your own interests, strengths, and values" },
  { id: "identify", label: "Identify the support systems available to you" },
  { id: "seek", label: "Seek guidance from a mentor, counsellor, or trusted adviser" },
  { id: "goals", label: "Set short-term and long-term career-related goals" },
  { id: "revisit", label: "Revisit and adjust the plan regularly as you learn more" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "Guidance from an experienced person who shares knowledge and advice for growth is called ", after: ".", correctAnswer: "mentorship", accepted: ["mentorship"], explanation: "Mentorship is guidance from an experienced person who shares knowledge and advice for a learner's growth." },
  { before: "Support with a learner's emotional and social wellbeing, such as counselling, is called ", after: " support.", correctAnswer: "psychosocial", accepted: ["psychosocial"], explanation: "Psychosocial support addresses a learner's emotional and social wellbeing, such as through counselling." },
  { before: "The people or resources a learner can turn to for pre-career guidance form a ", after: " system.", correctAnswer: "support", accepted: ["support"], explanation: "A support system is the people or resources a learner can turn to for pre-career guidance and help." },
  { before: "Planning your interests, strengths, and goals ahead of choosing a career is called pre-career ", after: ".", correctAnswer: "mapping", accepted: ["mapping"], explanation: "Pre-career mapping is planning your interests, strengths, and goals ahead of choosing a career direction." },
  { before: "Guidance and comfort a learner draws from their faith community is called ", after: " support.", correctAnswer: "spiritual", accepted: ["spiritual"], explanation: "Spiritual support is guidance and comfort a learner draws from their faith and religious community." },
] as const;

export const supportSystems: Skill = {
  id: "ss-scd-support-systems",
  code: "SCD.2",
  subjectId: "social-studies",
  strandId: "ss-scd",
  grade: 9,
  title: "Pre-career support systems",
  description: "Match each type of pre-career support system to what it offers a learner.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "recall", "categorize", "fill-blank", "order"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, CHALLENGE_SOLUTIONS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: "Sort each statement: is it a challenge with pre-career support systems, or a solution to that challenge?",
        items,
        buckets: [
          { id: "challenge", label: "Challenge" },
          { id: "solution", label: "Solution" },
        ],
        correctBucket,
        hint: "Challenges make it harder to access or use support; solutions are deliberate actions that address those challenges.",
        explanation: chosen.map((c) => `"${c.text}" is a ${c.kind === "challenge" ? "challenge with" : "solution to a challenge with"} pre-career support systems.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about pre-career support systems.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe different kinds of pre-career support.",
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, MAPPING_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps of pre-career mapping, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: MAPPING_STEPS.map((s) => s.id),
        hint: "You need self-reflection before you can identify support, seek guidance, set goals, and revisit the plan.",
        explanation: MAPPING_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SYSTEMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.name] = s.name;

      return {
        kind: "click-match",
        prompt: "Match each support system to what it offers a learner preparing for a career.",
        tokens,
        targets,
        correctMap,
        hint: "Learners can draw on people around them — family, mentors, counsellors, and faith communities — for different kinds of support.",
        explanation: chosen.map((s) => `${s.name} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    const target = randChoice(rng, SYSTEMS);
    const distractors = shuffle(rng, SYSTEMS.filter((s) => s.name !== target.name)).slice(0, 3);
    const choices = shuffle(rng, [target, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Which support system offers this: ${target.description.toLowerCase()}?`,
      choices: choices.map((c) => c.name),
      correctIndex: choices.findIndex((c) => c.name === target.name),
      hint: "Learners can draw on people around them — family, mentors, counsellors, and faith communities — for different kinds of support.",
      explanation: `${target.name} — ${target.description.toLowerCase()}.`,
    };
  },
};
