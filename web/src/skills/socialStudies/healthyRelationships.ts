import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SKILLS_BANK: { name: string; description: string }[] = [
  { name: "Effective communication", description: "Clearly expressing thoughts and feelings while genuinely listening to the other person" },
  { name: "Negotiation skills", description: "Finding a solution both people can accept by discussing needs and making fair compromises" },
  { name: "Empathy", description: "Understanding and sharing how another person feels, even when their view differs from yours" },
  { name: "Assertiveness", description: "Expressing your own needs and opinions honestly and respectfully, without being passive or aggressive" },
];

const BARRIER_STRATEGY_ITEMS: { text: string; bucket: "barrier" | "strategy" }[] = [
  { text: "Poor or inconsistent communication between the people involved", bucket: "barrier" },
  { text: "Jealousy that leads to controlling behaviour", bucket: "barrier" },
  { text: "Unresolved conflicts that keep resurfacing", bucket: "barrier" },
  { text: "Broken trust after a past betrayal", bucket: "barrier" },
  { text: "One person ignoring the other's personal boundaries", bucket: "barrier" },
  { text: "An unequal balance of power or control between the people", bucket: "barrier" },
  { text: "Openly and honestly discussing feelings and expectations", bucket: "strategy" },
  { text: "Setting and respecting each other's personal boundaries", bucket: "strategy" },
  { text: "Genuinely apologising and forgiving after a disagreement", bucket: "strategy" },
  { text: "Spending quality time together to strengthen the bond", bucket: "strategy" },
  { text: "Seeking a trusted mediator when a disagreement cannot be resolved alone", bucket: "strategy" },
  { text: "Practising active listening instead of interrupting", bucket: "strategy" },
];

const SCENARIOS: { prompt: string; healthy: boolean; explanation: string }[] = [
  {
    prompt: "Achieng and her friend disagree about a plan, so Achieng listens to her friend's reasons, explains her own view calmly, and they agree on a compromise. How would you judge this relationship behaviour?",
    healthy: true,
    explanation: "Listening, explaining calmly, and compromising are signs of effective communication and negotiation — hallmarks of a healthy relationship.",
  },
  {
    prompt: "Otieno checks his friend's phone messages without permission because he doesn't trust them. How would you judge this relationship behaviour?",
    healthy: false,
    explanation: "Checking someone's messages without permission violates personal boundaries and reflects a lack of trust — a barrier to a healthy relationship.",
  },
  {
    prompt: "Wanjiru tells her sibling honestly that a joke hurt her feelings, and her sibling apologises and stops. How would you judge this relationship behaviour?",
    healthy: true,
    explanation: "Assertively expressing hurt feelings and having the other person respond with genuine apology reflects healthy, respectful communication.",
  },
  {
    prompt: "Kiptoo gives his friend the silent treatment for days instead of explaining what upset him. How would you judge this relationship behaviour?",
    healthy: false,
    explanation: "Silent treatment avoids honest communication and leaves the real issue unresolved — a barrier rather than a healthy strategy.",
  },
  {
    prompt: "Naliaka and her classmate take turns choosing which game to play during break, so both get a fair say. How would you judge this relationship behaviour?",
    healthy: true,
    explanation: "Taking turns and ensuring both people get a fair say reflects negotiation and mutual respect.",
  },
  {
    prompt: "Barasa constantly criticises his friend's choices in front of others to feel more in control. How would you judge this relationship behaviour?",
    healthy: false,
    explanation: "Public criticism used to control someone reflects an unequal power dynamic and disrespect, not empathy or respect.",
  },
];

const REPAIR_STEPS = [
  { id: "acknowledge", label: "Acknowledge that the other person was hurt" },
  { id: "apologise", label: "Apologise sincerely for your part in what happened" },
  { id: "listen", label: "Listen to how the other person actually feels" },
  { id: "agree", label: "Agree on how to prevent the same problem recurring" },
  { id: "rebuild", label: "Rebuild trust over time through consistent, respectful actions" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "Clearly expressing thoughts and feelings while genuinely listening to the other person is called effective ", after: ".", correctAnswer: "communication", accepted: ["communication"], explanation: "Effective communication means clearly expressing thoughts and feelings while genuinely listening to the other person." },
  { before: "Understanding and sharing how another person feels, even when their view differs from yours, is called ", after: ".", correctAnswer: "empathy", accepted: ["empathy"], explanation: "Empathy is understanding and sharing how another person feels, even when you see things differently." },
  { before: "Expressing your own needs and opinions honestly and respectfully, without being passive or aggressive, is called ", after: ".", correctAnswer: "assertiveness", accepted: ["assertiveness", "assertive"], explanation: "Assertiveness means expressing your own needs and opinions honestly and respectfully." },
  { before: "Finding a solution both people can accept by discussing needs and making fair compromises is called ", after: ".", correctAnswer: "negotiation", accepted: ["negotiation"], explanation: "Negotiation is finding a solution both people can accept through discussion and fair compromise." },
  { before: "Limits a person sets on how others may treat them in a relationship are called personal ", after: ".", correctAnswer: "boundaries", accepted: ["boundaries"], explanation: "Personal boundaries are the limits a person sets on how others may treat them, and respecting them supports healthy relationships." },
  { before: "Confidence that another person will act honestly and reliably toward you is called ", after: ".", correctAnswer: "trust", accepted: ["trust"], explanation: "Trust is confidence that another person will act honestly and reliably toward you, and it is essential to a healthy relationship." },
  { before: "Choosing to let go of resentment toward someone after they have wronged you is called ", after: ".", correctAnswer: "forgiveness", accepted: ["forgiveness"], explanation: "Forgiveness is choosing to let go of resentment after being wronged, which helps repair a relationship." },
] as const;

export const healthyRelationships: Skill = {
  id: "ss-pr-healthy-relationships",
  code: "PR.6",
  subjectId: "social-studies",
  strandId: "ss-pr",
  grade: 9,
  title: "Healthy relationships",
  description: "Match each relationship skill to what it means, for sustaining healthy relationships in the community.",
  generate(rng) {
    const hint = "These four skills work together — you need to express yourself honestly while also understanding the other person.";
    const branch = randChoice(rng, ["skills-mc", "match", "barrier-strategy", "scenario", "fill-blank", "repair-order"] as const);

    if (branch === "barrier-strategy") {
      const chosen = shuffle(rng, BARRIER_STRATEGY_ITEMS).slice(0, 6);
      const items = chosen.map((it, i) => ({ id: `b${i}`, label: it.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it, i) => (correctBucket[`b${i}`] = it.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement: is it a barrier to a healthy relationship, or a strategy that helps overcome barriers?",
        items,
        buckets: [
          { id: "barrier", label: "Barrier" },
          { id: "strategy", label: "Strategy to overcome barriers" },
        ],
        correctBucket,
        hint: "Barriers damage trust and communication; strategies actively rebuild and strengthen the relationship.",
        explanation: chosen.map((it) => `"${it.text}" is a ${it.bucket === "barrier" ? "barrier to" : "strategy for"} a healthy relationship.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const s = randChoice(rng, SCENARIOS);
      const choices = shuffle(rng, ["A healthy relationship behaviour", "An unhealthy relationship behaviour"]);
      const correctLabel = s.healthy ? "A healthy relationship behaviour" : "An unhealthy relationship behaviour";
      return {
        kind: "multiple-choice",
        prompt: s.prompt,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "row",
        hint: "Think about whether it involves honest communication, respect, and empathy, or control, avoidance, and disrespect.",
        explanation: s.explanation,
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about healthy relationships.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe relationship skills and values.",
        explanation: fb.explanation,
      };
    }

    if (branch === "repair-order") {
      const items = shuffle(rng, REPAIR_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for repairing a relationship after a conflict, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: REPAIR_STEPS.map((s) => s.id),
        hint: "Acknowledge the hurt before apologising, listen before agreeing on prevention, and trust is rebuilt last, over time.",
        explanation: REPAIR_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "skills-mc") {
      const target = randChoice(rng, SKILLS_BANK);
      const distractors = shuffle(rng, SKILLS_BANK.filter((s) => s.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: `Which relationship skill means: ${target.description}?`,
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "grid",
        hint,
        explanation: `${target.name} — ${target.description.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, SKILLS_BANK);
    const tokens = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.name })));
    const targets = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.description })));
    const correctMap: Record<string, string> = {};
    for (const s of chosen) correctMap[s.name] = s.name;

    return {
      kind: "click-match",
      prompt: "Match each skill to what it means for building healthy relationships.",
      tokens,
      targets,
      correctMap,
      hint: "These four skills work together — you need to express yourself honestly while also understanding the other person.",
      explanation: chosen.map((s) => `${s.name} — ${s.description.toLowerCase()}.`).join(" "),
    };
  },
};
