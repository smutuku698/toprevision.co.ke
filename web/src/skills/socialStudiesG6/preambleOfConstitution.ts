import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

// Key words/phrases and plain-language meanings, transcribed faithfully from the actual preamble of the
// 2010 Constitution of Kenya — not invented text.
const KEYWORDS = [
  { phrase: "sovereign", meaning: "a nation that governs itself and is not ruled by another country" },
  { phrase: "ethnic, cultural and religious diversity", meaning: "Kenya's many different communities, cultures, and religions living together" },
  { phrase: "the rule of law", meaning: "everyone, including leaders, must obey the law" },
  { phrase: "essential unity", meaning: "staying together as one nation despite differences" },
  { phrase: "We, the people of Kenya", meaning: "the Constitution belongs to, and comes from, the people themselves" },
  { phrase: "respectful of the environment", meaning: "valuing and protecting the environment as a heritage for future generations" },
  { phrase: "social justice", meaning: "fairness in how opportunities and resources are shared in society" },
  { phrase: "democracy", meaning: "a system where the people choose their leaders and have a say in government" },
] as const;

const THEME_ORDER = [
  { id: "t1", label: "Acknowledging the supremacy of God" },
  { id: "t2", label: "Honouring those who struggled for freedom and justice" },
  { id: "t3", label: "Being proud of diversity and committed to unity" },
  { id: "t4", label: "Recognising the people's aspirations for rights and democracy" },
  { id: "t5", label: "Exercising the sovereign right to adopt the Constitution" },
] as const;

function meaningMc(rng: () => number): ScenarioMC {
  const k = randChoice(rng, KEYWORDS);
  const others = shuffle(rng, KEYWORDS.filter((o) => o.phrase !== k.phrase)).slice(0, 3);
  return {
    prompt: `In the preamble of the Constitution of Kenya, what does the phrase "${k.phrase}" mean?`,
    correct: k.meaning.charAt(0).toUpperCase() + k.meaning.slice(1),
    wrong: others.map((o) => o.meaning.charAt(0).toUpperCase() + o.meaning.slice(1)),
    explanation: `"${k.phrase}" means ${k.meaning}.`,
  };
}

export const preambleOfConstitution: Skill = {
  id: "g6-ss-gov-preamble-of-constitution",
  code: "G.3",
  subjectId: "social-studies",
  strandId: "g6-ss-governance",
  grade: 6,
  title: "The preamble of the Constitution of Kenya",
  description: "Key words in the preamble of the Constitution of Kenya and their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["meaning-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "meaning-mc") {
      const q = meaningMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about what the word or phrase is really describing about Kenya as a nation.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "A nation that governs itself, and is not ruled by another country, is called", after: ".", correct: "sovereign" }),
        () => ({ before: "The preamble opens with the words 'We, the people of", after: "'.", correct: "Kenya" }),
        () => ({ before: `${name} learns that everyone, including leaders, must obey the law — a principle called the rule of`, after: ".", correct: "law" }),
        () => ({ before: "Staying together as one nation despite differences is called essential", after: ".", correct: "unity" }),
        () => ({ before: "The preamble expresses pride in Kenya's ethnic, cultural, and religious", after: ".", correct: "diversity" }),
        () => ({ before: "Valuing the environment as a heritage for future generations shows Kenyans are", after: "of the environment.", correct: "respectful" }),
        () => ({ before: "A system where the people choose their leaders is called", after: ".", correct: "democracy" }),
        () => ({ before: "Fairness in how opportunities and resources are shared in society is called social", after: ".", correct: "justice" }),
        () => ({ before: "The preamble recognises the people's aspirations for human rights, equality, freedom, democracy, and social", after: ".", correct: "justice" }),
        () => ({ before: "The people of Kenya used their sovereign right to", after: "the Constitution.", correct: "adopt" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about the preamble of the Constitution of Kenya.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the key words and their plain-language meaning.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...KEYWORDS]).slice(0, 6);
      const tokens = chosen.map((k, i) => ({ id: `k${i}`, label: k.phrase }));
      const targets = shuffle(rng, chosen).map((k) => ({ id: `k${chosen.indexOf(k)}`, label: k.meaning.charAt(0).toUpperCase() + k.meaning.slice(1) }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`k${i}`] = `k${i}`));
      return {
        kind: "click-match",
        prompt: "Match each key word or phrase from the preamble to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Read each phrase carefully and think about what it describes.",
        explanation: chosen.map((k) => `"${k.phrase}" means ${k.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const values = ["human rights", "equality", "freedom", "democracy", "social justice", "the rule of law"] as const;
      const nonValues = ["a national football league", "a school timetable", "a weather forecast"] as const;
      const chosen = shuffle(rng, [
        ...shuffle(rng, [...values]).slice(0, 4).map((v) => ({ id: v, label: v.charAt(0).toUpperCase() + v.slice(1), bucket: "named" })),
        ...shuffle(rng, [...nonValues]).slice(0, 2).map((v) => ({ id: v, label: v.charAt(0).toUpperCase() + v.slice(1), bucket: "not-named" })),
      ]);
      const items = chosen.map((c) => ({ id: c.id, label: c.label }));
      const buckets = [
        { id: "named", label: "An essential value named in the preamble" },
        { id: "not-named", label: "Not mentioned in the preamble" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each item: is it one of the essential values the preamble names, or not mentioned at all?",
        items,
        buckets,
        correctBucket,
        hint: "The preamble names human rights, equality, freedom, democracy, social justice, and the rule of law as essential values.",
        explanation: chosen.map((c) => `"${c.label}" is ${c.bucket === "named" ? "an essential value named in the preamble" : "not mentioned in the preamble"}.`).join(" "),
      };
    }

    // ordering — the real preamble's own broad thematic order.
    return {
      kind: "ordering",
      prompt: "Arrange these themes in the order they appear in the preamble of the Constitution of Kenya.",
      items: shuffle(rng, THEME_ORDER),
      correctOrder: THEME_ORDER.map((t) => t.id),
      instruction: "First theme first.",
      hint: "The preamble opens by acknowledging God and honouring the freedom struggle before moving to unity, rights, and finally adopting the Constitution.",
      explanation: `The preamble's themes appear in this order: ${THEME_ORDER.map((t) => t.label).join(" → ")}.`,
    };
  },
};
