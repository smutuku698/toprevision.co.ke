import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 8.4.1 Mnyambuliko wa Vitenzi — Kutendewa, Kutendeka, Kutendana
// (Ndege wa Porini). Ona curriculum-reference/grade-5/kiswahili.json.

type Hali = "TENDEWA" | "TENDEKA" | "TENDANA";

const HALI_LABELS: Record<Hali, string> = {
  TENDEWA: "Kutendewa",
  TENDEKA: "Kutendeka",
  TENDANA: "Kutendana",
};

const HALI_MAANA: Record<Hali, string> = {
  TENDEWA: "kitendo kinafanywa kwa niaba ya mtu au kitu",
  TENDEKA: "kitendo kinawezekana kufanyika",
  TENDANA: "watu au vitu vinafanyiana kitendo",
};

const VITENZI: { mzizi: string; tendewa: string; tendeka: string; tendana: string }[] = [
  { mzizi: "penda", tendewa: "pendwa", tendeka: "pendeka", tendana: "pendana" },
  { mzizi: "saidia", tendewa: "saidiwa", tendeka: "saidika", tendana: "saidiana" },
  { mzizi: "ona", tendewa: "onwa", tendeka: "onekana", tendana: "onana" },
  { mzizi: "tuma", tendewa: "tumwa", tendeka: "tumika", tendana: "tumiana" },
  { mzizi: "piga", tendewa: "pigwa", tendeka: "pigika", tendana: "pigana" },
  { mzizi: "sikia", tendewa: "sikiwa", tendeka: "sikika", tendana: "sikiana" },
  { mzizi: "fuata", tendewa: "fuatwa", tendeka: "fuatika", tendana: "fuatana" },
  { mzizi: "heshimu", tendewa: "heshimiwa", tendeka: "heshimika", tendana: "heshimiana" },
  { mzizi: "fundisha", tendewa: "fundishwa", tendeka: "fundishika", tendana: "fundishana" },
];

export const mnyambulikoWaVitenzi: Skill = {
  id: "g5-ksw-sarufi-mnyambuliko-vitenzi",
  code: "SA.9",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Mnyambuliko wa Vitenzi — Kutendewa, Kutendeka, Kutendana (Ndege wa Porini)",
  description: "Tambua na utumie vitenzi katika hali ya kutendewa, kutendeka na kutendana.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-hali", "oanisha-mzizi-hali", "panga-hali", "jaza-umbo", "panga-mfuatano"] as const);

    if (branch === "tambua-hali") {
      const v = randChoice(rng, VITENZI);
      const hali = randChoice(rng, ["TENDEWA", "TENDEKA", "TENDANA"] as const);
      const umbo = hali === "TENDEWA" ? v.tendewa : hali === "TENDEKA" ? v.tendeka : v.tendana;
      const choices = shuffle(rng, ["Kutendewa", "Kutendeka", "Kutendana"]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "hali ya mnyambuliko")} Kitenzi: "${umbo}" (kutoka mzizi "${v.mzizi}").`,
        choices,
        correctIndex: choices.indexOf(HALI_LABELS[hali]),
        layout: "row",
        hint: HALI_MAANA[hali],
        explanation: `"${umbo}" ni hali ya ${HALI_LABELS[hali].toLowerCase()}: ${HALI_MAANA[hali]}.`,
      };
    }

    if (branch === "oanisha-mzizi-hali") {
      const chosen = shuffle(rng, VITENZI).slice(0, 4);
      const hali = randChoice(rng, ["TENDEWA", "TENDEKA", "TENDANA"] as const);
      const tokens = chosen.map((v) => ({ id: v.mzizi, label: v.mzizi }));
      const targets = shuffle(rng, chosen).map((v) => ({
        id: v.mzizi,
        label: hali === "TENDEWA" ? v.tendewa : hali === "TENDEKA" ? v.tendeka : v.tendana,
      }));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.mzizi] = v.mzizi;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, `mzizi wa kitenzi na umbo lake la ${HALI_LABELS[hali].toLowerCase()}`),
        tokens,
        targets,
        correctMap,
        hint: HALI_MAANA[hali],
        explanation: chosen.map((v) => `"${v.mzizi}" -> "${hali === "TENDEWA" ? v.tendewa : hali === "TENDEKA" ? v.tendeka : v.tendana}".`).join(" "),
      };
    }

    if (branch === "panga-hali") {
      const chosen = shuffle(rng, VITENZI).slice(0, 3);
      const items: { id: string; label: string; bucket: Hali }[] = [];
      for (const v of chosen) {
        items.push({ id: `${v.mzizi}-tendewa`, label: v.tendewa, bucket: "TENDEWA" });
        items.push({ id: `${v.mzizi}-tendeka`, label: v.tendeka, bucket: "TENDEKA" });
        items.push({ id: `${v.mzizi}-tendana`, label: v.tendana, bucket: "TENDANA" });
      }
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const item of shuffled) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "hali ya mnyambuliko: kutendewa, kutendeka au kutendana"),
        items: shuffled.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "TENDEWA", label: "Kutendewa" },
          { id: "TENDEKA", label: "Kutendeka" },
          { id: "TENDANA", label: "Kutendana" },
        ],
        correctBucket,
        hint: "Angalia kiishio cha kitenzi: -wa/-iwa (tendewa), -ika/-eka (tendeka), -ana (tendana).",
        explanation: "Vitenzi vimepangwa kulingana na hali yake ya mnyambuliko.",
      };
    }

    if (branch === "jaza-umbo") {
      const v = randChoice(rng, VITENZI);
      const hali = randChoice(rng, ["TENDEWA", "TENDEKA", "TENDANA"] as const);
      const umbo = hali === "TENDEWA" ? v.tendewa : hali === "TENDEKA" ? v.tendeka : v.tendana;
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: `Umbo la "${v.mzizi}" katika hali ya ${HALI_LABELS[hali].toLowerCase()} ni "`,
        after: `".`,
        correctAnswer: umbo,
        inputMode: "text",
        hint: HALI_MAANA[hali],
        explanation: `"${v.mzizi}" katika hali ya ${HALI_LABELS[hali].toLowerCase()} huwa "${umbo}".`,
      };
    }

    const v = randChoice(rng, VITENZI);
    const items = [
      { id: "mzizi", label: v.mzizi },
      { id: "tendewa", label: v.tendewa },
      { id: "tendeka", label: v.tendeka },
      { id: "tendana", label: v.tendana },
    ];
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `umbo la kitenzi "${v.mzizi}" kutoka mzizi hadi hali zake tatu za mnyambuliko`),
      instruction: "Bofya maumbo kwa mpangilio: mzizi, kutendewa, kutendeka, kutendana.",
      items: shuffle(rng, items),
      correctOrder: ["mzizi", "tendewa", "tendeka", "tendana"],
      hint: "Anza na mzizi wa kawaida kabla ya maumbo yaliyonyambuliwa.",
      explanation: `Mzizi "${v.mzizi}" -> kutendewa "${v.tendewa}" -> kutendeka "${v.tendeka}" -> kutendana "${v.tendana}".`,
    };
  },
};
