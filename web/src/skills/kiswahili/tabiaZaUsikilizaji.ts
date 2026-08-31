import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const NZURI = [
  "Kudumisha mtazamo wa macho na mzungumzaji",
  "Kutikisa kichwa kuonyesha unaelewa",
  "Kurudia kwa maneno yako yale mzungumzaji amesema",
  "Kuuliza maswali ya kufafanua",
  "Kusubiri mzungumzaji amalize kabla ya kujibu",
  "Kuandika madokezo mafupi ya mambo muhimu",
];

const MBAYA = [
  "Kumkatiza mzungumzaji mara kwa mara",
  "Kuangalia simu wakati mtu anazungumza",
  "Kupanga jibu lako badala ya kusikiliza",
  "Kutazama pande zingine badala ya mzungumzaji",
  "Kumalizia sentensi za mzungumzaji",
  "Kubadilisha mada ghafla",
];

export const tabiaZaUsikilizaji: Skill = {
  id: "kis-ls-usikilizaji",
  code: "KZ.2",
  subjectId: "kiswahili",
  strandId: "kis-kusikiliza",
  grade: 9,
  title: "Tabia nzuri na mbaya za usikilizaji",
  description: "Panga tabia katika makundi ya usikilizaji mzuri na usikilizaji mbaya.",
  generate(rng) {
    const hint = "Tabia nzuri huelekeza fikira kwa mzungumzaji; tabia mbaya huelekeza fikira mahali pengine.";

    if (rng() < 0.5) {
      const pool = [
        ...NZURI.map((label) => ({ label, category: "Usikilizaji Mzuri" })),
        ...MBAYA.map((label) => ({ label, category: "Usikilizaji Mbaya" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Usikilizaji Mzuri", "Usikilizaji Mbaya"]);

      return {
        kind: "multiple-choice",
        prompt: `Je, hii ni tabia ya usikilizaji mzuri au mbaya: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" ni tabia ya ${target.category}.`,
      };
    }

    const nzuri = shuffle(rng, NZURI).slice(0, 3);
    const mbaya = shuffle(rng, MBAYA).slice(0, 3);
    const items = shuffle(rng, [
      ...nzuri.map((label) => ({ id: label, label, bucket: "nzuri" })),
      ...mbaya.map((label) => ({ id: label, label, bucket: "mbaya" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Panga kila tabia katika kundi la Usikilizaji Mzuri au Usikilizaji Mbaya.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "nzuri", label: "Usikilizaji Mzuri" },
        { id: "mbaya", label: "Usikilizaji Mbaya" },
      ],
      correctBucket,
      hint: "Tabia nzuri huelekeza fikira kwa mzungumzaji; tabia mbaya huelekeza fikira mahali pengine.",
      explanation: `Tabia nzuri: ${nzuri.join(" / ")}. Tabia mbaya: ${mbaya.join(" / ")}.`,
    };
  },
};
