import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "叔叔 (shūshu)", meaning: "Paternal uncle (father's younger brother)" },
  { phrase: "姑姑 (gūgu)", meaning: "Paternal aunt (father's sister)" },
  { phrase: "表哥 (biǎogē)", meaning: "Older male cousin" },
  { phrase: "堂妹 (tángmèi)", meaning: "Younger paternal cousin (female)" },
  { phrase: "爸爸 (bàba)", meaning: "Dad" },
  { phrase: "妈妈 (māma)", meaning: "Mom" },
  { phrase: "老师 (lǎoshī)", meaning: "Teacher" },
  { phrase: "医生 (yīshēng)", meaning: "Doctor" },
];

const SORT_ITEMS: { label: string; bucket: "nuclear" | "extended" }[] = [
  { label: "爸爸 (bàba)", bucket: "nuclear" },
  { label: "妈妈 (māma)", bucket: "nuclear" },
  { label: "叔叔 (shūshu)", bucket: "extended" },
  { label: "姑姑 (gūgu)", bucket: "extended" },
  { label: "表哥 (biǎogē)", bucket: "extended" },
  { label: "堂妹 (tángmèi)", bucket: "extended" },
];

export const familySpeaking: Skill = {
  id: "ma-ls-family",
  code: "LS.2",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "Family members",
  description: "Match Mandarin family and profession words to their meaning, and sort nuclear from extended family members.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const nuclear = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "nuclear"));
      const extended = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "extended")).slice(0, 3);
      const items = shuffle(rng, [...nuclear, ...extended]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each family member as Nuclear Family or Extended Family.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "nuclear", label: "Nuclear Family" },
          { id: "extended", label: "Extended Family" },
        ],
        correctBucket,
        hint: "Nuclear family is your parents; extended family is uncles, aunts, and cousins.",
        explanation: `Nuclear: ${nuclear.map((f) => f.label).join(" / ")}. Extended: ${extended.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each Mandarin word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "堂 (táng) marks a paternal-side cousin; 表 (biǎo) marks a maternal-side or cross cousin.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
