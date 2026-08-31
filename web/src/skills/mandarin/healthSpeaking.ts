import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "头疼 (tóuténg)", meaning: "Headache" },
  { phrase: "发烧 (fāshāo)", meaning: "Fever" },
  { phrase: "咳嗽 (késou)", meaning: "Cough" },
  { phrase: "胃疼 (wèiténg)", meaning: "Stomachache" },
  { phrase: "牙疼 (yáténg)", meaning: "Toothache" },
  { phrase: "医生 (yīshēng)", meaning: "Doctor" },
  { phrase: "护士 (hùshi)", meaning: "Nurse" },
  { phrase: "吃药 (chī yào)", meaning: "Take medicine" },
];

const SORT_ITEMS: { label: string; bucket: "symptom" | "clinic" }[] = [
  { label: "头疼 (tóuténg)", bucket: "symptom" },
  { label: "发烧 (fāshāo)", bucket: "symptom" },
  { label: "咳嗽 (késou)", bucket: "symptom" },
  { label: "胃疼 (wèiténg)", bucket: "symptom" },
  { label: "恶心 (ěxin)", bucket: "symptom" },
  { label: "医生 (yīshēng)", bucket: "clinic" },
  { label: "护士 (hùshi)", bucket: "clinic" },
  { label: "吃药 (chī yào)", bucket: "clinic" },
  { label: "看病 (kànbìng)", bucket: "clinic" },
];

export const healthSpeaking: Skill = {
  id: "ma-ls-health",
  code: "LS.7",
  subjectId: "mandarin",
  strandId: "ma-listening-speaking",
  grade: 9,
  title: "At the doctor's",
  description: "Match Mandarin health words to their meaning, and sort symptoms from clinic people/actions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const symptoms = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "symptom")).slice(0, 3);
      const clinic = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "clinic")).slice(0, 3);
      const items = shuffle(rng, [...symptoms, ...clinic]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Symptom or a Clinic Person/Action.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "symptom", label: "Symptom" },
          { id: "clinic", label: "Clinic Person/Action" },
        ],
        correctBucket,
        hint: "Symptoms are how you feel; clinic words describe who you see or what you do about it.",
        explanation: `Symptoms: ${symptoms.map((f) => f.label).join(" / ")}. Clinic: ${clinic.map((f) => f.label).join(" / ")}.`,
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
      hint: "疼 (téng) means 'ache/pain' — 头疼, 胃疼, and 牙疼 all end with it.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
