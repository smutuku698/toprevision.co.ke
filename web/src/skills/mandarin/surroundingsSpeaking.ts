import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "猫 (māo)", meaning: "Cat" },
  { phrase: "狗 (gǒu)", meaning: "Dog" },
  { phrase: "兔子 (tùzi)", meaning: "Rabbit" },
  { phrase: "牛 (niú)", meaning: "Cow" },
  { phrase: "羊 (yáng)", meaning: "Sheep/goat" },
  { phrase: "狮子 (shīzi)", meaning: "Lion" },
  { phrase: "大象 (dàxiàng)", meaning: "Elephant" },
  { phrase: "长颈鹿 (chángjǐnglù)", meaning: "Giraffe" },
];

const SORT_ITEMS: { label: string; bucket: "pet" | "farm" | "wild" }[] = [
  { label: "猫 (māo)", bucket: "pet" },
  { label: "狗 (gǒu)", bucket: "pet" },
  { label: "兔子 (tùzi)", bucket: "pet" },
  { label: "牛 (niú)", bucket: "farm" },
  { label: "羊 (yáng)", bucket: "farm" },
  { label: "猪 (zhū)", bucket: "farm" },
  { label: "骆驼 (luòtuo)", bucket: "farm" },
  { label: "狮子 (shīzi)", bucket: "wild" },
  { label: "大象 (dàxiàng)", bucket: "wild" },
  { label: "长颈鹿 (chángjǐnglù)", bucket: "wild" },
  { label: "犀牛 (xīniú)", bucket: "wild" },
];

export const surroundingsSpeaking: Skill = {
  id: "ma-ls-surroundings",
  code: "LS.3",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Animals in my surroundings",
  description: "Match Mandarin animal words to their meaning, and sort pets from farm and wild animals.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const pets = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "pet")).slice(0, 2);
      const farm = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "farm")).slice(0, 2);
      const wild = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "wild")).slice(0, 2);
      const items = shuffle(rng, [...pets, ...farm, ...wild]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each animal as a Pet (宠物), Farm Animal (家畜), or Wild Animal (野生动物).",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "pet", label: "Pet (宠物)" },
          { id: "farm", label: "Farm Animal (家畜)" },
          { id: "wild", label: "Wild Animal (野生动物)" },
        ],
        correctBucket,
        hint: "Think about where each animal is usually found: a home, a farm, or the wild.",
        explanation: `Pets: ${pets.map((f) => f.label).join(" / ")}. Farm animals: ${farm.map((f) => f.label).join(" / ")}. Wild animals: ${wild.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each Mandarin animal word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "牛 (niú) is a cow, but 长颈鹿 (chángjǐnglù, literally 'long-neck-deer') is a giraffe.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
