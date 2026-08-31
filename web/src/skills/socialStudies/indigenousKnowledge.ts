import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DOMAINS: { domain: string; example: string; use: "material" | "social" }[] = [
  { domain: "Agriculture", example: "Practices like intercropping and crop rotation, passed down to keep soil fertile", use: "material" },
  { domain: "Medicine", example: "Using herbal remedies from local plants to treat illness", use: "material" },
  { domain: "Climate", example: "Reading cloud patterns, wind, and animal behaviour to predict rain and seasons", use: "material" },
  { domain: "Astronomy", example: "Using the position of stars to guide travel and to plan planting seasons", use: "material" },
  { domain: "Environmental Conservation", example: "Protecting sacred forests and groves believed to be home to ancestral spirits", use: "material" },
  { domain: "Technology", example: "Traditional methods of making tools, pottery, and building materials from local resources", use: "material" },
  { domain: "Education", example: "Passing on knowledge and skills through storytelling, proverbs, and apprenticeship", use: "social" },
  { domain: "Arts", example: "Traditional music, dance, and craft passed down to express community identity", use: "social" },
  { domain: "Religion", example: "Beliefs and practices honouring ancestors and a supreme being, guiding community rituals and rites of passage", use: "social" },
];

const USE_LABEL: Record<string, string> = {
  material: "Helps meet practical, material, or survival needs",
  social: "Helps sustain culture, identity, and social life",
};

const DECISION_STEPS = [
  { id: "share", label: "Elders and knowledge holders share a traditional practice" },
  { id: "observe", label: "Community members observe and practise it" },
  { id: "combine", label: "The practice is combined with modern scientific understanding" },
  { id: "document", label: "The combined knowledge is documented and passed on" },
  { id: "apply", label: "It is applied to real decisions, such as farming or conservation" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "Knowledge built up by a community over generations, used for self-identity and daily life, is called ", after: " knowledge.", correctAnswer: "indigenous", accepted: ["indigenous"], explanation: "Indigenous knowledge is knowledge built up by a community over generations, and used for self-identity and daily life." },
  { before: "Growing two or more different crops on the same piece of land at the same time is called ", after: ".", correctAnswer: "intercropping", accepted: ["intercropping"], explanation: "Intercropping is growing two or more different crops on the same land at the same time, an indigenous agricultural practice." },
  { before: "A forest or grove protected because it is believed to be spiritually significant is called a ", after: " forest.", correctAnswer: "sacred", accepted: ["sacred"], explanation: "A sacred forest or grove is protected because of its spiritual significance, which also conserves biodiversity." },
  { before: "Learning a skill or trade by working directly under an experienced practitioner is called an ", after: ".", correctAnswer: "apprenticeship", accepted: ["apprenticeship"], explanation: "An apprenticeship is learning a skill or trade by working directly under an experienced practitioner, a traditional education method." },
  { before: "A treatment made from local plants used to treat illness is called a herbal ", after: ".", correctAnswer: "remedy", accepted: ["remedy"], explanation: "A herbal remedy is a treatment made from local plants, part of indigenous medical knowledge." },
  { before: "Meeting present needs without harming the ability of future generations to meet theirs describes ", after: ".", correctAnswer: "sustainability", accepted: ["sustainability"], explanation: "Sustainability means meeting present needs without compromising future generations' ability to meet their own." },
] as const;

export const indigenousKnowledge: Skill = {
  id: "ss-pr-indigenous-knowledge",
  code: "PR.2",
  subjectId: "social-studies",
  strandId: "ss-pr",
  grade: 9,
  title: "Indigenous knowledge systems in African societies",
  description: "Match each domain of indigenous knowledge to an example of how it was used.",
  generate(rng) {
    const hint = "Indigenous knowledge systems cover almost every area of daily life, built up and passed down over generations.";
    const branch = randChoice(rng, ["which-domain", "match", "use-categorize", "fill-blank", "decision-order"] as const);

    if (branch === "use-categorize") {
      const chosen = shuffle(rng, DOMAINS);
      const items = chosen.map((d) => ({ id: d.domain, label: d.domain }));
      const correctBucket: Record<string, string> = {};
      for (const d of chosen) correctBucket[d.domain] = d.use;
      return {
        kind: "categorize",
        prompt: "Sort each domain of indigenous knowledge by what it mainly helps with.",
        items,
        buckets: [
          { id: "material", label: USE_LABEL.material },
          { id: "social", label: USE_LABEL.social },
        ],
        correctBucket,
        hint: "Some domains mainly meet practical needs (food, health, prediction, tools); others mainly sustain culture and identity.",
        explanation: chosen.map((d) => `${d.domain} — ${USE_LABEL[d.use].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about indigenous knowledge systems.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe indigenous practices and knowledge.",
        explanation: fb.explanation,
      };
    }

    if (branch === "decision-order") {
      const items = shuffle(rng, DECISION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for using indigenous and modern knowledge together in decision-making, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: DECISION_STEPS.map((s) => s.id),
        hint: "Traditional knowledge is shared and practised first, then combined with modern science, then documented and applied.",
        explanation: DECISION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "which-domain") {
      const target = randChoice(rng, DOMAINS);
      const distractors = shuffle(rng, DOMAINS.filter((d) => d.domain !== target.domain)).slice(0, 3);
      const choices = shuffle(rng, [target.domain, ...distractors.map((d) => d.domain)]);

      return {
        kind: "multiple-choice",
        prompt: `Which domain of indigenous knowledge does this describe: "${target.example}"?`,
        choices,
        correctIndex: choices.indexOf(target.domain),
        layout: "grid",
        hint,
        explanation: `${target.domain} — ${target.example.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, DOMAINS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((d) => ({ id: d.domain, label: d.domain })));
    const targets = shuffle(rng, chosen.map((d) => ({ id: d.domain, label: d.example })));
    const correctMap: Record<string, string> = {};
    for (const d of chosen) correctMap[d.domain] = d.domain;

    return {
      kind: "click-match",
      prompt: "Match each domain of indigenous knowledge to an example of how African societies used it.",
      tokens,
      targets,
      correctMap,
      hint: "Indigenous knowledge systems cover almost every area of daily life, built up and passed down over generations.",
      explanation: chosen.map((d) => `${d.domain} — ${d.example.toLowerCase()}.`).join(" "),
    };
  },
};
