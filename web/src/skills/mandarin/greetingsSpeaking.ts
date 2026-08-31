import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "您好 (nín hǎo)", meaning: "Hello (formal)" },
  { phrase: "早上好 (zǎoshang hǎo)", meaning: "Good morning" },
  { phrase: "下午好 (xiàwǔ hǎo)", meaning: "Good afternoon" },
  { phrase: "晚上好 (wǎnshang hǎo)", meaning: "Good evening" },
  { phrase: "您贵姓？(nín guì xìng?)", meaning: "What is your (honourable) surname?" },
  { phrase: "你是哪国人？(nǐ shì nǎ guó rén?)", meaning: "What country are you from?" },
  { phrase: "你家有几口人？(nǐ jiā yǒu jǐ kǒu rén?)", meaning: "How many people are in your family?" },
  { phrase: "幸会！(xìnghuì!)", meaning: "Pleased to meet you!" },
];

const SORT_ITEMS: { label: string; bucket: "greeting" | "question" }[] = [
  { label: "您好 (nín hǎo)", bucket: "greeting" },
  { label: "早上好 (zǎoshang hǎo)", bucket: "greeting" },
  { label: "下午好 (xiàwǔ hǎo)", bucket: "greeting" },
  { label: "晚上好 (wǎnshang hǎo)", bucket: "greeting" },
  { label: "幸会！(xìnghuì!)", bucket: "greeting" },
  { label: "您贵姓？(nín guì xìng?)", bucket: "question" },
  { label: "你是哪国人？(nǐ shì nǎ guó rén?)", bucket: "question" },
  { label: "你家有几口人？(nǐ jiā yǒu jǐ kǒu rén?)", bucket: "question" },
  { label: "你怎么称呼？(nǐ zěnme chēnghu?)", bucket: "question" },
];

export const greetingsSpeaking: Skill = {
  id: "ma-ls-greetings",
  code: "LS.1",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Formal greetings and introductions",
  description: "Match Mandarin greeting expressions to their meaning, and sort greetings from personal questions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const greetings = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "greeting")).slice(0, 3);
      const questions = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "question")).slice(0, 3);
      const items = shuffle(rng, [...greetings, ...questions]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each expression as a Greeting or a Personal Question.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "question", label: "Personal Question" },
        ],
        correctBucket,
        hint: "Greetings are said on meeting someone; questions ask for information back.",
        explanation: `Greetings: ${greetings.map((f) => f.label).join(" / ")}. Questions: ${questions.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each Mandarin greeting expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'您贵姓？' and '你是哪国人？' are both questions, but they ask for very different information.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
