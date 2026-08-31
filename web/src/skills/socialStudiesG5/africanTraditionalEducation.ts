import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "African Traditional Education" — 5 named
// methods of instruction (narratives, stories, songs, riddles, proverbs). See
// curriculum-reference/grade-5/social-studies.json.

type Method = "narratives" | "stories" | "songs" | "riddles" | "proverbs";

const METHOD_FACTS: { method: Method; description: string; example: string }[] = [
  { method: "narratives", description: "narratives passed down community history and important events from one generation to the next", example: "an elder recounting how the community settled in a certain area" },
  { method: "stories", description: "stories taught moral lessons through characters and events children could relate to", example: "a story about a lazy hare and a hardworking tortoise" },
  { method: "songs", description: "songs reinforced communal values and cultural identity, often sung during work or ceremonies", example: "a work song sung while harvesting together" },
  { method: "riddles", description: "riddles sharpened children's thinking and problem-solving skills through playful puzzles", example: "'What has a mouth but never eats?' (a river)" },
  { method: "proverbs", description: "proverbs conveyed wisdom and life lessons in short, memorable sayings", example: "'Haraka haraka haina baraka' (hurrying brings no blessing)" },
];

const VALUES_PROMOTED = [
  "respect", "honesty", "hard work", "community responsibility", "wisdom", "patience", "cooperation", "courage",
] as const;

export const africanTraditionalEducation: Skill = {
  id: "g5-ss-people-african-traditional-education",
  code: "P.3",
  subjectId: "social-studies",
  strandId: "g5-ss-people",
  grade: 5,
  title: "African Traditional Education",
  description: "Identifying methods of instruction (narratives, stories, songs, riddles, proverbs) used in African traditional education and the values they promoted.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const m = randChoice(rng, METHOD_FACTS);
      const choices = shuffle(rng, METHOD_FACTS.map((x) => x.method));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "method of instruction")} Example: ${m.example}.`,
        choices,
        correctIndex: choices.indexOf(m.method),
        hint: m.description,
        explanation: `This is an example of ${m.method}: ${m.description}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = METHOD_FACTS.map((m) => ({ id: m.method, label: m.method.charAt(0).toUpperCase() + m.method.slice(1) }));
      const targets = shuffle(rng, METHOD_FACTS).map((m) => ({ id: m.method, label: m.description.charAt(0).toUpperCase() + m.description.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const m of METHOD_FACTS) correctMap[m.method] = m.method;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "method of instruction to how it taught values"),
        tokens,
        targets,
        correctMap,
        hint: "Think about how each method taught a lesson differently.",
        explanation: METHOD_FACTS.map((m) => `${m.method}: ${m.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = METHOD_FACTS.map((m) => ({ id: m.method, label: m.example }));
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const m of METHOD_FACTS) correctBucket[m.method] = m.method;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which method of instruction each example shows"),
        items: shuffled,
        buckets: METHOD_FACTS.map((m) => ({ id: m.method, label: m.method.charAt(0).toUpperCase() + m.method.slice(1) })),
        correctBucket,
        hint: "Match each example to narratives, stories, songs, riddles or proverbs.",
        explanation: METHOD_FACTS.map((m) => `"${m.example}" is an example of ${m.method}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const v = randChoice(rng, VALUES_PROMOTED);
      const m = randChoice(rng, METHOD_FACTS);
      const templates = [
        () => ({ before: "Puzzles like 'What has a mouth but never eats?' are examples of", after: ".", correct: "riddles" }),
        () => ({ before: "Short, memorable sayings like 'Haraka haraka haina baraka' are called", after: ".", correct: "proverbs" }),
        () => ({ before: `A method used in African traditional education to reinforce ${v} was`, after: `, among others.`, correct: m.method }),
        () => ({ before: "Community history and important events were often passed down through", after: ".", correct: "narratives" }),
        () => ({ before: "Moral lessons were often taught to children through", after: " featuring relatable characters.", correct: "stories" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the 5 methods: narratives, stories, songs, riddles, proverbs.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "gather", label: "Elders gather the children together" },
      { id: "tell", label: "An elder tells a story or poses a riddle" },
      { id: "respond", label: "The children respond or discuss the meaning" },
      { id: "explain", label: "The elder explains the lesson or value" },
    ]);
    const correctOrder = ["gather", "tell", "respond", "explain"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps of a traditional teaching session"),
      instruction: "Arrange the steps in a sensible order.",
      items: steps,
      correctOrder,
      hint: "It starts with gathering the children and ends with explaining the lesson.",
      explanation: "A traditional teaching session gathers the children, tells a story or riddle, lets children respond, then explains the lesson.",
    };
  },
};
