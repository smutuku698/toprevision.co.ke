import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DIVERSITY_ELEMENTS = [
  { text: "Kenya has over 40 different ethnic communities, each with its own language and customs", bucket: "cultural" },
  { text: "Kenyans practise different religions, including Christianity, Islam, Hinduism, and traditional beliefs", bucket: "cultural" },
  { text: "Different communities have distinct traditional foods, dances, and dress", bucket: "cultural" },
  { text: "Respecting a classmate's religious dietary restrictions during a school event", bucket: "respect" },
  { text: "Learning greetings or a few words from a friend's mother tongue", bucket: "respect" },
  { text: "Including students from all backgrounds when forming a group project team", bucket: "respect" },
] as const;

const BUCKET_LABEL: Record<string, string> = { cultural: "An example of social-cultural diversity in Kenya", respect: "An action that shows respect for diversity" };

const EMOTION_IMPACTS = [
  { emotion: "Anger", impact: "Can lead to saying hurtful things or damaging a relationship if not managed well" },
  { emotion: "Empathy", impact: "Helps you understand and support others, strengthening relationships" },
  { emotion: "Jealousy", impact: "Can create resentment and conflict between friends if left unaddressed" },
  { emotion: "Gratitude", impact: "Builds appreciation and goodwill between people" },
] as const;

const PEER_PRESSURE_SCENARIOS = [
  { situation: "A group of friends dares Chebet to skip class, but she calmly says no and walks to her lesson.", response: "positive" },
  { situation: "Wanted to fit in, Kiptoo joins his friends in bullying a younger student even though it feels wrong.", response: "negative" },
  { situation: "When pressured to cheat on a test, Aisha suggests they form a study group instead.", response: "positive" },
  { situation: "To avoid being mocked, Dennis starts smoking even though he knows it is harmful.", response: "negative" },
] as const;

const MANAGE_STEPS = [
  { id: "recognise", label: "Recognise that you are being pressured to do something you do not want to do" },
  { id: "pause", label: "Pause and think about the possible consequences of giving in" },
  { id: "assert", label: "Assertively say no or suggest an alternative activity" },
  { id: "support", label: "Seek support from a trusted friend, parent, or teacher if the pressure continues" },
];

export const diversityInterpersonalSkills: Skill = {
  id: "g8-ss-pr-diversity-interpersonal",
  code: "PR.5",
  subjectId: "social-studies",
  strandId: "g8-ss-pr",
  grade: 8,
  title: "Diversity and interpersonal skills",
  description: "Social-cultural diversity in Kenya, showing respect for it, how emotions affect self and others, and managing peer pressure in a diverse environment.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "emotion-match", "peer-pressure", "manage-order"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, DIVERSITY_ELEMENTS).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((d) => d.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((d, i) => ({ id: `d${i}`, label: d.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((d, i) => (correctBucket[`d${i}`] = d.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as either an example of Kenya's diversity, or an action that shows respect for it.",
        items,
        buckets,
        correctBucket,
        hint: "Diversity describes what exists; respect describes what people actively do about it.",
        explanation: chosen.map((d) => `"${d.text}" — ${BUCKET_LABEL[d.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "emotion-match") {
      const tokens = shuffle(rng, EMOTION_IMPACTS.map((e) => ({ id: e.emotion, label: e.emotion })));
      const targets = shuffle(rng, EMOTION_IMPACTS.map((e) => ({ id: e.emotion, label: e.impact })));
      const correctMap: Record<string, string> = {};
      for (const e of EMOTION_IMPACTS) correctMap[e.emotion] = e.emotion;
      return {
        kind: "click-match",
        prompt: "Match each emotion to its likely impact on self and others.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the emotion tends to build up or break down a relationship if unmanaged.",
        explanation: EMOTION_IMPACTS.map((e) => `${e.emotion}: ${e.impact}.`).join(" "),
      };
    }

    if (branch === "peer-pressure") {
      const s = randChoice(rng, PEER_PRESSURE_SCENARIOS);
      const label = s.response === "positive" ? "A healthy way of managing peer pressure" : "An example of giving in to negative peer pressure";
      const other = s.response === "positive" ? "An example of giving in to negative peer pressure" : "A healthy way of managing peer pressure";
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: `${s.situation} What does this show?`,
        choices,
        correctIndex: choices.indexOf(label),
        hint: "Look at whether the person stood firm on their own values or went along with the group despite knowing better.",
        explanation: `${s.situation} ${label}.`,
      };
    }

    // manage-order
    const items = shuffle(rng, MANAGE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps for managing peer pressure in a culturally diverse environment in the correct order.",
      instruction: "Drag to reorder from first step to last step.",
      items,
      correctOrder: MANAGE_STEPS.map((s) => s.id),
      hint: "You must first notice the pressure before you can pause, respond assertively, and seek help if needed.",
      explanation: MANAGE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
    };
  },
};
