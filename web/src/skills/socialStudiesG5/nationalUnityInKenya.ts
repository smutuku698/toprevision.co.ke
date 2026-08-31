import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "National Unity in Kenya" — 3 named categories
// (National Symbols, National Days, National languages), 4 named symbols (coat of arms, national flag,
// national anthem, public seal). See curriculum-reference/grade-5/social-studies.json.

const SYMBOLS: { id: string; symbol: string; meaning: string }[] = [
  { id: "coat", symbol: "the coat of arms", meaning: "Kenya's official emblem, showing shields, lions and a cockerel, representing defence and readiness to protect the country" },
  { id: "flag", symbol: "the national flag", meaning: "black, red, green and white bands with a Maasai shield and spears, symbolising the people, the freedom struggle, natural wealth and peace" },
  { id: "anthem", symbol: "the national anthem", meaning: "Kenya's official song, expressing unity and patriotism" },
  { id: "seal", symbol: "the public seal", meaning: "the official government stamp of authority used on official documents" },
];

const DAYS: { id: string; day: string; month: string; monthNum: number; meaning: string }[] = [
  { id: "madaraka", day: "Madaraka Day", month: "June", monthNum: 6, meaning: "celebrates the day Kenya attained internal self-rule, on 1 June" },
  { id: "mashujaa", day: "Mashujaa Day", month: "October", monthNum: 10, meaning: "honours Kenya's heroes, on 20 October" },
  { id: "jamhuri", day: "Jamhuri Day", month: "December", monthNum: 12, meaning: "celebrates Kenya's independence and becoming a republic, on 12 December" },
];

const CATEGORY_ITEMS: { id: string; label: string; category: "SYMBOL" | "DAY" | "LANGUAGE" }[] = [
  { id: "c1", label: "The national flag", category: "SYMBOL" },
  { id: "c2", label: "The coat of arms", category: "SYMBOL" },
  { id: "c3", label: "The national anthem", category: "SYMBOL" },
  { id: "c4", label: "The public seal", category: "SYMBOL" },
  { id: "c5", label: "Madaraka Day", category: "DAY" },
  { id: "c6", label: "Mashujaa Day", category: "DAY" },
  { id: "c7", label: "Jamhuri Day", category: "DAY" },
  { id: "c8", label: "Kiswahili", category: "LANGUAGE" },
  { id: "c9", label: "English", category: "LANGUAGE" },
];

export const nationalUnityInKenya: Skill = {
  id: "g5-ss-gov-national-unity-in-kenya",
  code: "G.1",
  subjectId: "social-studies",
  strandId: "g5-ss-governance",
  grade: 5,
  title: "National Unity in Kenya",
  description: "Identifying Kenya's national symbols, national days, and national languages, and how they promote unity.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const useDay = randChoice(rng, [true, false]);
      if (useDay) {
        const d = randChoice(rng, DAYS);
        const choices = shuffle(rng, DAYS.map((x) => x.day));
        return {
          kind: "multiple-choice",
          prompt: `${identifyPrompt(rng, "national day")} It ${d.meaning}.`,
          choices,
          correctIndex: choices.indexOf(d.day),
          hint: `${d.day} falls in ${d.month}.`,
          explanation: `${d.day} ${d.meaning}.`,
        };
      }
      const s = randChoice(rng, SYMBOLS);
      const choices = shuffle(rng, SYMBOLS.map((x) => x.symbol));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "national symbol")} It represents: ${s.meaning}.`,
        choices,
        correctIndex: choices.indexOf(s.symbol),
        hint: "Think about which symbol carries that meaning.",
        explanation: `${s.symbol.charAt(0).toUpperCase() + s.symbol.slice(1)} represents ${s.meaning}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = SYMBOLS.map((s) => ({ id: s.id, label: s.symbol.charAt(0).toUpperCase() + s.symbol.slice(1) }));
      const targets = shuffle(rng, SYMBOLS).map((s) => ({ id: s.id, label: s.meaning.charAt(0).toUpperCase() + s.meaning.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const s of SYMBOLS) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "national symbol to what it represents"),
        tokens,
        targets,
        correctMap,
        hint: "Recall what each of Kenya's 4 national symbols represents.",
        explanation: SYMBOLS.map((s) => `${s.symbol}: ${s.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shuffled = shuffle(rng, CATEGORY_ITEMS);
      const correctBucket: Record<string, string> = {};
      for (const item of shuffled) correctBucket[item.id] = item.category;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is a national symbol, a national day, or a national language"),
        items: shuffled.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "SYMBOL", label: "National Symbol" },
          { id: "DAY", label: "National Day" },
          { id: "LANGUAGE", label: "National Language" },
        ],
        correctBucket,
        hint: "Symbols include the flag and coat of arms; days include Madaraka, Mashujaa and Jamhuri; languages include Kiswahili and English.",
        explanation: "Items are sorted into national symbols, national days, and national languages.",
      };
    }

    if (branch === "fill-blank") {
      const d = randChoice(rng, DAYS);
      const templates = [
        () => ({ before: `${d.day} is celebrated in the month of`, after: ".", correct: d.month }),
        () => ({ before: "Kenya's official/national languages are Kiswahili and", after: ".", correct: "English" }),
        () => ({ before: "The Maasai shield and spears appear on Kenya's national", after: ".", correct: "flag" }),
        () => ({ before: "The official government stamp of authority used on official documents is called the public", after: ".", correct: "seal" }),
        () => ({ before: "Kenya's independence and becoming a republic is celebrated on", after: ".", correct: "Jamhuri Day" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall Kenya's national symbols, days and languages.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const items = DAYS.map((d) => ({ id: d.id, label: d.day }));
    const correctOrder = [...DAYS].sort((a, b) => a.monthNum - b.monthNum).map((d) => d.id);
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these national days in the order they occur in the calendar year"),
      instruction: "Arrange the national days from earliest to latest in the year.",
      items: shuffle(rng, items),
      correctOrder,
      hint: "Madaraka Day is in June, Mashujaa Day in October, Jamhuri Day in December.",
      explanation: `In calendar order: ${[...DAYS].sort((a, b) => a.monthNum - b.monthNum).map((d) => `${d.day} (${d.month})`).join(", ")}.`,
    };
  },
};
