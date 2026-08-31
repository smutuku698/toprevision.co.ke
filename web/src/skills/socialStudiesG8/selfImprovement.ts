import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const BUILDING_TRAITS = [
  "Honesty", "Empathy", "Cooperation", "Respectfulness", "Discipline", "Resilience", "Kindness", "Patience",
] as const;

const DAMAGING_TRAITS = [
  "Arrogance", "Dishonesty", "Selfishness", "Laziness", "Rudeness", "Jealousy",
] as const;

const VALUES = [
  { value: "Integrity", behaviour: "telling the truth even when no one is watching and admitting your own mistakes" },
  { value: "Responsibility", behaviour: "completing assigned duties on time without needing to be reminded" },
  { value: "Respect", behaviour: "listening to other people's opinions even when you disagree with them" },
  { value: "Perseverance", behaviour: "continuing to work on a difficult task instead of giving up after the first failure" },
  { value: "Self-discipline", behaviour: "sticking to a study timetable instead of only studying when you feel like it" },
  { value: "Gratitude", behaviour: "appreciating the help other people give you and thanking them for it" },
] as const;

const SCENARIOS = [
  { situation: "Amani found a wallet with money in it at school and handed it to the teacher instead of keeping it.", trait: "Honesty" },
  { situation: "When her classmate failed a test, Wanjiru comforted her and helped her revise instead of teasing her.", trait: "Empathy" },
  { situation: "Despite losing the first three matches of the season, the team captain kept training and encouraging his teammates.", trait: "Resilience" },
  { situation: "Juma volunteered to carry the heaviest bags during a class trip without being asked.", trait: "Cooperation" },
  { situation: "During group work, Aisha waited for her turn to speak and did not interrupt others.", trait: "Respectfulness" },
  { situation: "Even though he wanted to play, Otieno finished his homework first every evening.", trait: "Discipline" },
] as const;

const CAREER_PATHS = [
  { career: "Tour guide", link: "explains historical sites, culture, and geography to visitors" },
  { career: "Diplomat", link: "represents Kenya's interests and builds relationships with other countries" },
  { career: "Journalist", link: "researches and reports on social, political, and economic events" },
  { career: "Urban planner", link: "designs how towns and cities use land and resources" },
  { career: "County administrator", link: "manages devolved government services for a community" },
  { career: "Archaeologist", link: "studies historical sites and artefacts to understand the past" },
] as const;

const GOAL_STEPS = [
  { id: "identify", label: "Identify a personal weakness you want to improve" },
  { id: "goal", label: "Set a specific, realistic improvement goal" },
  { id: "plan", label: "Make an action plan with clear steps" },
  { id: "act", label: "Take action on the plan consistently" },
  { id: "review", label: "Reflect on progress and adjust the plan if needed" },
];

export const selfImprovement: Skill = {
  id: "g8-ss-spm-self-improvement",
  code: "SPM.1",
  subjectId: "social-studies",
  strandId: "g8-ss-spm",
  grade: 8,
  title: "Self-improvement",
  description: "Personality traits, values that shape personality, career choices linked to Social Studies, and the process of setting a self-improvement goal.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "values", "scenario", "goal-order", "careers"] as const);

    if (branch === "classify") {
      const chosenGood = shuffle(rng, [...BUILDING_TRAITS]).slice(0, 4);
      const chosenBad = shuffle(rng, [...DAMAGING_TRAITS]).slice(0, 3);
      const items = shuffle(rng, [
        ...chosenGood.map((t) => ({ id: `g-${t}`, label: t, bucket: "build" })),
        ...chosenBad.map((t) => ({ id: `b-${t}`, label: t, bucket: "damage" })),
      ]);
      const buckets = [
        { id: "build", label: "Helps build strong relationships" },
        { id: "damage", label: "Can damage relationships" },
      ];
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each personality trait into the correct group.",
        items: items.map((it) => ({ id: it.id, label: it.label })),
        buckets,
        correctBucket,
        hint: "Traits like honesty, empathy, and respect build trust; traits like arrogance and dishonesty break it down.",
        explanation: [...chosenGood.map((t) => `${t} helps build strong relationships.`), ...chosenBad.map((t) => `${t} can damage relationships.`)].join(" "),
      };
    }

    if (branch === "values") {
      const chosen = shuffle(rng, [...VALUES]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.value, label: v.value })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.value, label: v.behaviour })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.value] = v.value;
      return {
        kind: "click-match",
        prompt: "Match each value to the behaviour that shows it in daily life.",
        tokens,
        targets,
        correctMap,
        hint: "A value is shown through the actual actions or choices a person makes.",
        explanation: chosen.map((v) => `${v.value} is shown by ${v.behaviour}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const s = randChoice(rng, SCENARIOS);
      const others = SCENARIOS.filter((x) => x.trait !== s.trait).map((x) => x.trait);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.trait, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${s.situation} Which personality trait is being demonstrated?`,
        choices,
        correctIndex,
        hint: "Think about what quality is driving the behaviour described.",
        explanation: `This situation shows ${s.trait}: ${s.situation}`,
      };
    }

    if (branch === "goal-order") {
      const items = shuffle(rng, GOAL_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of setting and achieving a self-improvement goal in the correct order.",
        instruction: "Drag to reorder from first step to last step.",
        items,
        correctOrder: GOAL_STEPS.map((s) => s.id),
        hint: "You must first know what to improve before you can plan, act, and then review your progress.",
        explanation: GOAL_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    // careers
    const c = randChoice(rng, CAREER_PATHS);
    const others = CAREER_PATHS.filter((x) => x.career !== c.career).map((x) => x.career);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, c.career, others, 3);
    return {
      kind: "multiple-choice",
      prompt: `Which career choice related to Social Studies mainly ${c.link}?`,
      choices,
      correctIndex,
      hint: "Match the description of the daily work to the job title.",
      explanation: `A ${c.career.toLowerCase()} ${c.link}.`,
    };
  },
};
