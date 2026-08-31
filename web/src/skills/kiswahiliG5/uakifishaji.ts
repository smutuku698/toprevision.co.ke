import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 3.4.4 Uakifishaji — Herufi Kubwa, Koma, Kikomo, Kiulizi (Mapambo).
// Ona curriculum-reference/grade-5/kiswahili.json.
// Sub-strand ina alama 4 pekee za uakifishaji (herufi kubwa, koma, kikomo, kiulizi) — orodha funge
// kutoka kwenye muundo wa lugha, si upungufu wa uchimbaji data. "Panga-mpangilio" (ordering) haifai
// asili kwa maudhui haya bila kubuni mfuatano usio na msingi, hivyo tawi la tano limeachwa kwa uangalifu
// (matawi 4 badala ya 5), sawa na kanuni iliyowekwa katika usesOfDomesticAnimals.ts (Kilimo Gredi 5).

type Alama = "HERUFI_KUBWA" | "KOMA" | "KIKOMO" | "KIULIZI";

const ALAMA_LABELS: Record<Alama, string> = {
  HERUFI_KUBWA: "Herufi Kubwa",
  KOMA: "Koma (,)",
  KIKOMO: "Kikomo (.)",
  KIULIZI: "Kiulizi (?)",
};

const ALAMA_MATUMIZI: Record<Alama, string> = {
  HERUFI_KUBWA: "hutumiwa mwanzoni mwa sentensi au kwa nomino za pekee",
  KOMA: "hutumiwa kutenganisha vitu au vishazi katika orodha au sentensi ndefu",
  KIKOMO: "hutumiwa mwishoni mwa sentensi ya kawaida (kauli)",
  KIULIZI: "hutumiwa mwishoni mwa sentensi ya swali",
};

const MIFANO: { sentensi: string; alama: Alama }[] = [
  { sentensi: "Kisumu ni mji mkubwa nchini Kenya.", alama: "HERUFI_KUBWA" },
  { sentensi: "Yohana ni rafiki yangu wa karibu.", alama: "HERUFI_KUBWA" },
  { sentensi: "Nilinunua herini, bangili, shanga na taji.", alama: "KOMA" },
  { sentensi: "Baada ya kula, tulienda shuleni.", alama: "KOMA" },
  { sentensi: "Mtoto alicheza mpira baada ya shule.", alama: "KIKOMO" },
  { sentensi: "Mama alipika chakula kizuri jioni.", alama: "KIKOMO" },
  { sentensi: "Je, umenunua vipuli vipya", alama: "KIULIZI" },
  { sentensi: "Unapenda pete gani zaidi", alama: "KIULIZI" },
  { sentensi: "Nairobi ni mji mkuu wa Kenya.", alama: "HERUFI_KUBWA" },
  { sentensi: "Bangili, shanga, hina na kugesi ni mapambo.", alama: "KOMA" },
  { sentensi: "Rafiki yangu alinunua kipini kizuri.", alama: "KIKOMO" },
  { sentensi: "Ni mapambo gani unayoyapenda zaidi", alama: "KIULIZI" },
];

export const uakifishaji: Skill = {
  id: "g5-ksw-sarufi-uakifishaji",
  code: "SA.4",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Uakifishaji — Herufi Kubwa, Koma, Kikomo, Kiulizi (Mapambo)",
  description: "Tambua na utumie alama za uakifishaji: herufi kubwa, koma, kikomo na kiulizi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-alama", "oanisha-matumizi", "panga-swali-kauli", "jaza-alama"] as const);

    if (branch === "tambua-alama") {
      const m = randChoice(rng, MIFANO);
      const alama: Alama[] = ["HERUFI_KUBWA", "KOMA", "KIKOMO", "KIULIZI"];
      const choices = shuffle(rng, alama).map((a) => ALAMA_LABELS[a]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "alama ya uakifishaji inayohitajika zaidi")} Sentensi: "${m.sentensi}"`,
        choices,
        correctIndex: choices.indexOf(ALAMA_LABELS[m.alama]),
        layout: "list",
        hint: ALAMA_MATUMIZI[m.alama],
        explanation: `Sentensi hii inaonyesha matumizi ya ${ALAMA_LABELS[m.alama]}: ${ALAMA_MATUMIZI[m.alama]}.`,
      };
    }

    if (branch === "oanisha-matumizi") {
      const alama: Alama[] = ["HERUFI_KUBWA", "KOMA", "KIKOMO", "KIULIZI"];
      const tokens = alama.map((a) => ({ id: a, label: ALAMA_LABELS[a] }));
      const targets = shuffle(rng, alama).map((a) => ({ id: a, label: ALAMA_MATUMIZI[a] }));
      const correctMap: Record<string, string> = {};
      for (const a of alama) correctMap[a] = a;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "alama ya uakifishaji na matumizi yake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni wapi katika sentensi kila alama hutumika.",
        explanation: alama.map((a) => `${ALAMA_LABELS[a]} ${ALAMA_MATUMIZI[a]}.`).join(" "),
      };
    }

    if (branch === "panga-swali-kauli") {
      const chosen = shuffle(rng, MIFANO.filter((m) => m.alama === "KIKOMO" || m.alama === "KIULIZI")).slice(0, 6);
      const items = chosen.map((m, i) => ({ id: `${i}`, label: m.sentensi.replace(/[.?]$/, "") }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m, i) => (correctBucket[`${i}`] = m.alama === "KIULIZI" ? "SWALI" : "KAULI"));
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi ni swali (kiulizi) au kauli (kikomo)"),
        items,
        buckets: [
          { id: "SWALI", label: "Swali (?)" },
          { id: "KAULI", label: "Kauli (.)" },
        ],
        correctBucket,
        hint: "Swali huuliza jambo; kauli hueleza jambo.",
        explanation: "Sentensi za swali huhitaji kiulizi (?); sentensi za kauli huhitaji kikomo (.).",
      };
    }

    const m = randChoice(rng, MIFANO);
    const bila = m.sentensi.replace(/[.?]$/, "");
    return {
      kind: "fill-blank",
      prompt: kamilishaPrompt(rng),
      before: `Weka alama sahihi mwishoni: "${bila}`,
      after: `"`,
      correctAnswer: m.alama === "KIULIZI" ? "?" : ".",
      inputMode: "text",
      hint: ALAMA_MATUMIZI[m.alama],
      explanation: `Sentensi kamili: "${m.sentensi}"`,
    };
  },
};
