import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Structure of an expository essay, as parts to sequence/identify.
const ESSAY_PARTS: { id: string; label: string }[] = [
  { id: "intro", label: "Introduction — states the topic and the writer's main point clearly" },
  { id: "body1", label: "Body paragraph 1 — one supporting point with an example or evidence" },
  { id: "body2", label: "Body paragraph 2 — a second supporting point with an example or evidence" },
  { id: "body3", label: "Body paragraph 3 — a third supporting point with an example or evidence" },
  { id: "conclusion", label: "Conclusion — restates the main idea and sums up the argument" },
];

// Term / feature bank for an expository essay.
const TERMS: { term: string; definition: string }[] = [
  { term: "Topic sentence", definition: "the first sentence of a body paragraph, stating the single point that paragraph will explain" },
  { term: "Evidence", definition: "facts, examples, or observations used to support a point in an expository essay" },
  { term: "Thesis statement", definition: "the sentence in the introduction that states the essay's main point on the issue" },
  { term: "Coherence", definition: "the quality of ideas following one another in a clear, logical sequence" },
  { term: "Restatement", definition: "saying the main idea again, in different words, in the conclusion" },
];

// Research steps for gathering information on an issue before writing.
const RESEARCH_STEPS: { id: string; label: string }[] = [
  { id: "choose", label: "Choose the specific issue to research, e.g. gender roles in farming" },
  { id: "gather", label: "Gather information from reliable sources, such as elders, books, or community leaders" },
  { id: "sort", label: "Sort the information into the points it supports" },
  { id: "plan", label: "Plan the order of the points before writing the essay" },
];

// Good vs poor examples of expository writing, for the categorize branch.
const EXAMPLES: { text: string; category: "coherent" | "not-coherent" }[] = [
  { text: "In many Kenyan homes, both boys and girls are now taught to cook and to herd cattle, showing a shift in gender roles.", category: "coherent" },
  { text: "Girls should always fetch water. Also cattle are brown. My uncle likes football.", category: "not-coherent" },
  { text: "This paragraph will explain one reason gender roles are changing: more girls are now attending technical colleges.", category: "coherent" },
  { text: "Roles change. Sometimes. Water is wet and boys can climb trees very fast anyway.", category: "not-coherent" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main purpose of an expository essay?",
    correct: "To explain and give information about a topic clearly and logically",
    distractors: ["To tell an entertaining story with characters", "To persuade the reader using only emotional appeals", "To list random facts with no connection between them"],
  },
  {
    q: "Before writing an expository essay on gender roles, what should a writer do first?",
    correct: "Research the issue to gather accurate, reliable information",
    distractors: ["Write the conclusion before anything else", "Skip planning and write whatever comes to mind", "Copy an essay written by someone else on a different topic"],
  },
  {
    q: "Why is it important to organise ideas into a coherent sequence when writing?",
    correct: "So the reader can follow the writer's points logically from one to the next",
    distractors: ["So the essay looks longer", "Because each paragraph must repeat the previous one", "Because coherence is only needed in poems, not essays"],
  },
  {
    q: "Each body paragraph in an expository essay should mainly do what?",
    correct: "Develop one supporting point with an example or evidence",
    distractors: ["Introduce a brand-new topic unrelated to the essay", "Simply repeat the introduction word for word", "Contain no examples, only opinions"],
  },
];

export const genderRolesEssay: Skill = {
  id: "g8-il-w-gender-roles",
  code: "W.1",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "Gender Roles: Expository essay",
  description: "Research, structure, and organise ideas coherently in an expository essay about gender roles in the community.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "categorize", "fill", "mc"] as const);

    if (branch === "order") {
      const useResearch = rng() < 0.5;
      const source = useResearch ? RESEARCH_STEPS : ESSAY_PARTS;
      const prompt = useResearch
        ? "Arrange the steps of researching an issue for an expository essay in the correct order."
        : "Arrange the parts of an expository essay on gender roles in the correct order.";
      const hint = useResearch
        ? "Research starts with choosing the issue and ends with planning the order of points."
        : "An expository essay opens with the topic, develops points one at a time in the body, then closes by restating the main idea.";
      return {
        kind: "ordering",
        prompt,
        instruction: "Click them in order.",
        items: shuffle(rng, source),
        correctOrder: source.map((s) => s.id),
        hint,
        explanation: source.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each expository essay term to its definition.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each part of an essay does: stating a point, supporting it, or tying ideas together.",
        explanation: TERMS.map((t) => `${t.term} — ${t.definition}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, EXAMPLES);
      const buckets = [
        { id: "coherent", label: "Coherent (ideas flow logically)" },
        { id: "not-coherent", label: "Not coherent (ideas jump around)" },
      ];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each example of writing on gender roles by whether it is coherent or not.",
        items,
        buckets,
        correctBucket,
        hint: "A coherent example sticks to one clear point; a poor example jumps between unrelated ideas.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.category === "coherent" ? "coherent, since it develops one clear point" : "not coherent, since the ideas do not connect"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: "In an expository essay, the introduction should clearly state the topic and the writer's main",
        after: "on the issue, such as gender roles in the community.",
        correctAnswer: "point",
        acceptedAnswers: ["idea", "argument", "thesis", "claim"],
        inputMode: "text",
        hint: "This is the central idea the whole essay will explain and support.",
        explanation: "The introduction of an expository essay should clearly state the topic and the writer's main point, so the reader knows what the essay will explain.",
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "An expository essay explains a topic clearly, using research and logically organised paragraphs.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
