import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PATHWAYS: { name: string; description: string }[] = [
  { name: "STEM", description: "Science, Technology, Engineering, and Mathematics — for learners strong in sciences and maths" },
  { name: "Social Sciences", description: "Humanities, Languages, and Business Studies tracks — for learners interested in society, people, and commerce" },
  { name: "Arts and Sports Science", description: "Performing arts, visual arts, and sports tracks — for learners talented in creative or sporting activities" },
];

const TRACKS = ["Humanities", "Languages", "Business Studies"];

const CHOICE_STEPS = [
  { id: "reflect", label: "Reflect honestly on your own interests, strengths, and abilities" },
  { id: "research", label: "Research the subject and grade requirements of each pathway and track" },
  { id: "consult", label: "Consult teachers, parents, or career counsellors for guidance" },
  { id: "career", label: "Consider how each pathway connects to your future career goals" },
  { id: "commit", label: "Make an informed choice and commit to working toward it" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A broad stream of study a learner joins in senior school, based on interests and abilities, is called a ", after: ".", correctAnswer: "pathway", accepted: ["pathway"], explanation: "A pathway is a broad stream of study a learner joins in senior school, based on their interests and abilities." },
  { before: "A specific specialisation within a pathway, such as Humanities within Social Sciences, is called a ", after: ".", correctAnswer: "track", accepted: ["track"], explanation: "A track is a specific specialisation within a pathway, such as Humanities within the Social Sciences pathway." },
  { before: "The pathway focused on Science, Technology, Engineering, and Mathematics is called ", after: ".", correctAnswer: "STEM", accepted: ["stem"], explanation: "STEM stands for Science, Technology, Engineering, and Mathematics, one of the three senior school pathways." },
  { before: "A natural talent or ability that makes someone likely to succeed in an area is called an ", after: ".", correctAnswer: "aptitude", accepted: ["aptitude"], explanation: "Aptitude is a natural talent or ability that makes someone likely to succeed in a particular area, worth considering when choosing a pathway." },
  { before: "The level of education a learner joins after junior school, where pathways are chosen, is called ", after: " school.", correctAnswer: "senior", accepted: ["senior"], explanation: "Senior school is the level of education after junior school, where learners choose a pathway and track." },
] as const;

const FACTOR_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which of these should a learner consider FIRST when choosing a senior school pathway?",
    choices: ["Their own interests, abilities, and career goals", "Which pathway their best friend is choosing", "Which pathway has the shortest syllabus", "Which pathway is chosen by the most learners"],
    correctIndex: 0,
    explanation: "A pathway choice should be based on the learner's own interests, abilities, and career goals — not on what is easiest or what peers are doing.",
  },
  {
    prompt: "Why is it important to check a pathway's subject and grade requirements before choosing it?",
    choices: ["So the learner knows whether they can realistically meet what senior school and future careers demand", "Because requirements never change between schools", "Because only STEM has requirements", "So the learner can avoid taking any assessments"],
    correctIndex: 0,
    explanation: "Different pathways and tracks have different subject and performance requirements — checking them helps a learner set a realistic, achievable plan.",
  },
  {
    prompt: "Which track sits within the Social Sciences pathway?",
    choices: ["Business Studies", "Pure Sciences", "Performing Arts", "Engineering"],
    correctIndex: 0,
    explanation: "The Social Sciences pathway is made up of the Humanities, Languages, and Business Studies tracks.",
  },
];

export const pathwayChoices: Skill = {
  id: "ss-scd-pathway-choices",
  code: "SCD.1",
  subjectId: "social-studies",
  strandId: "ss-scd",
  grade: 9,
  title: "Pathway choices",
  description: "Senior school pathways, the Social Sciences tracks, and factors in choosing a pathway.",
  generate(rng) {
    const branch = randChoice(rng, ["pathways", "tracks", "factors", "fill-blank", "choice-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about senior school pathway choices.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe senior school pathways and tracks.",
        explanation: fb.explanation,
      };
    }

    if (branch === "choice-order") {
      const items = shuffle(rng, CHOICE_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for making a well-informed senior school pathway choice, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: CHOICE_STEPS.map((s) => s.id),
        hint: "Understand yourself first, then research options, get advice, connect it to career goals, and finally commit.",
        explanation: CHOICE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "pathways") {
      const chosen = shuffle(rng, PATHWAYS);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.name] = p.name;

      return {
        kind: "click-match",
        prompt: "Match each senior school pathway to its description.",
        tokens,
        targets,
        correctMap,
        hint: "There are three senior school pathways in Kenya's CBC.",
        explanation: chosen.map((p) => `${p.name} — ${p.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "tracks") {
      const decoy = shuffle(rng, ["Pure Sciences", "Applied Sciences", "Sports Science", "Performing Arts"]).slice(0, 2);
      const items = shuffle(rng, [...TRACKS, ...decoy]);
      const correctSet = new Set(TRACKS);

      return {
        kind: "categorize",
        prompt: "Sort each option: is it a track within the Social Sciences pathway, or not?",
        items: items.map((t) => ({ id: t, label: t })),
        buckets: [
          { id: "yes", label: "Social Sciences track" },
          { id: "no", label: "Not a Social Sciences track" },
        ],
        correctBucket: Object.fromEntries(items.map((t) => [t, correctSet.has(t) ? "yes" : "no"])),
        hint: "The Social Sciences pathway has three tracks: Humanities, Languages, and Business Studies.",
        explanation: `The Social Sciences tracks are: ${TRACKS.join(", ")}. Everything else belongs to a different pathway.`,
      };
    }

    const q = randChoice(rng, FACTOR_QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about what actually makes a pathway choice realistic and personally suitable.",
      explanation: q.explanation,
    };
  },
};
