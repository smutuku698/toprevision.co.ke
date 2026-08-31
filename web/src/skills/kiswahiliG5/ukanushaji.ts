import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 11.4.1 Ukanushaji — Viambishi vya Wakati li, na, ta (Uwekezaji).
// Ona curriculum-reference/grade-5/kiswahili.json.
// Yakinishi: li (wakati uliopita), na (wakati uliopo), ta (wakati ujao).
// Kanushi: si (kanushi cha nafsi), ku (wakati uliopita hasi), ta (wakati ujao hasi).

type Wakati = "ULIOPITA" | "ULIOPO" | "UJAO";

const WAKATI_LABELS: Record<Wakati, string> = {
  ULIOPITA: "Wakati Uliopita",
  ULIOPO: "Wakati Uliopo",
  UJAO: "Wakati Ujao",
};

const JOZI: { mzizi: string; nafsi: string; wakati: Wakati; yakinishi: string; kanushi: string }[] = [
  { mzizi: "penda", nafsi: "Mtoto", wakati: "ULIOPITA", yakinishi: "alipenda", kanushi: "hakupenda" },
  { mzizi: "penda", nafsi: "Mtoto", wakati: "ULIOPO", yakinishi: "anapenda", kanushi: "hapendi" },
  { mzizi: "penda", nafsi: "Mtoto", wakati: "UJAO", yakinishi: "atapenda", kanushi: "hatapenda" },
  { mzizi: "cheza", nafsi: "Wavulana", wakati: "ULIOPITA", yakinishi: "walicheza", kanushi: "hawakucheza" },
  { mzizi: "cheza", nafsi: "Wavulana", wakati: "ULIOPO", yakinishi: "wanacheza", kanushi: "hawachezi" },
  { mzizi: "cheza", nafsi: "Wavulana", wakati: "UJAO", yakinishi: "watacheza", kanushi: "hawatacheza" },
  { mzizi: "soma", nafsi: "Mimi", wakati: "ULIOPITA", yakinishi: "nilisoma", kanushi: "sikusoma" },
  { mzizi: "soma", nafsi: "Mimi", wakati: "ULIOPO", yakinishi: "ninasoma", kanushi: "sisomi" },
  { mzizi: "soma", nafsi: "Mimi", wakati: "UJAO", yakinishi: "nitasoma", kanushi: "sitasoma" },
  { mzizi: "wekeza", nafsi: "Mama", wakati: "ULIOPITA", yakinishi: "aliwekeza", kanushi: "hakuwekeza" },
  { mzizi: "wekeza", nafsi: "Mama", wakati: "UJAO", yakinishi: "atawekeza", kanushi: "hatawekeza" },
];

export const ukanushaji: Skill = {
  id: "g5-ksw-sarufi-ukanushaji",
  code: "SA.12",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Ukanushaji — Viambishi vya Wakati li, na, ta (Uwekezaji)",
  description: "Tambua viambishi vya wakati (li, na, ta) na ukanushaji wake kwa usahihi katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kanushi", "oanisha-yakinishi-kanushi", "panga-yakinishi-kanushi", "jaza-kanushi", "panga-hatua"] as const);

    if (branch === "tambua-kanushi") {
      const j = randChoice(rng, JOZI);
      const distractors = shuffle(rng, JOZI.filter((x) => x !== j).map((x) => x.kanushi)).slice(0, 3);
      const choices = shuffle(rng, [j.kanushi, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "umbo sahihi la kukanusha")} "${j.nafsi} ${j.yakinishi}" (${WAKATI_LABELS[j.wakati]}).`,
        choices,
        correctIndex: choices.indexOf(j.kanushi),
        layout: "list",
        hint: "Kanusha kwa kutumia si-/ha- pamoja na kiambishi cha wakati kinachofaa.",
        explanation: `Kanushi ya "${j.nafsi} ${j.yakinishi}" ni "${j.nafsi} ${j.kanushi}".`,
      };
    }

    if (branch === "oanisha-yakinishi-kanushi") {
      const chosen = shuffle(rng, JOZI).slice(0, 4);
      const tokens = chosen.map((j, i) => ({ id: `${i}`, label: `${j.nafsi} ${j.yakinishi}` }));
      const targets = shuffle(rng, chosen).map((j) => ({ id: `${chosen.indexOf(j)}`, label: `${j.nafsi} ${j.kanushi}` }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_j, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "sentensi ya yakinishi na kanushi yake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Kila sentensi ya yakinishi ina kanushi moja tu sahihi.",
        explanation: chosen.map((j) => `"${j.nafsi} ${j.yakinishi}" -> "${j.nafsi} ${j.kanushi}".`).join(" "),
      };
    }

    if (branch === "panga-yakinishi-kanushi") {
      const chosen = shuffle(rng, JOZI).slice(0, 4);
      const items = chosen.flatMap((j, i) => [
        { id: `${i}-y`, label: `${j.nafsi} ${j.yakinishi}`, bucket: "YAKINISHI" },
        { id: `${i}-k`, label: `${j.nafsi} ${j.kanushi}`, bucket: "KANUSHI" },
      ]);
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const item of shuffled) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi ni yakinishi au kanushi"),
        items: shuffled.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "YAKINISHI", label: "Yakinishi" },
          { id: "KANUSHI", label: "Kanushi" },
        ],
        correctBucket,
        hint: "Sentensi za kanushi huwa na 'si-' au 'ha-'.",
        explanation: "Sentensi zenye 'si-'/'ha-' ni kanushi; nyingine ni yakinishi.",
      };
    }

    if (branch === "jaza-kanushi") {
      const j = randChoice(rng, JOZI);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: `Kanusha: "${j.nafsi} ${j.yakinishi}" -> "${j.nafsi} `,
        after: `"`,
        correctAnswer: j.kanushi,
        inputMode: "text",
        hint: `Wakati: ${WAKATI_LABELS[j.wakati]}.`,
        explanation: `Kanushi sahihi ni "${j.nafsi} ${j.kanushi}".`,
      };
    }

    const j = randChoice(rng, JOZI);
    const items = [
      { id: "mzizi", label: `ku${j.mzizi}` },
      { id: "yakinishi", label: j.yakinishi },
      { id: "kanushi", label: j.kanushi },
    ];
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `hatua za kukanusha kitenzi "${j.mzizi}"`),
      instruction: "Bofya hatua kwa mpangilio: mzizi, yakinishi, kanushi.",
      items: shuffle(rng, items),
      correctOrder: ["mzizi", "yakinishi", "kanushi"],
      hint: "Anza na mzizi, kisha unda yakinishi, mwishowe kanusha.",
      explanation: `Mzizi "ku${j.mzizi}" -> yakinishi "${j.yakinishi}" -> kanushi "${j.kanushi}".`,
    };
  },
};
