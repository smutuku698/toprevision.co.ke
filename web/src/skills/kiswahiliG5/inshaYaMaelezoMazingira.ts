import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha ya Maelezo (Elimu ya Mazingira)" —
// mifano 5 ya mada (verbatim): upanzi wa miche, kusafisha darasa, kufua nguo, kuzuia mmomonyoko wa udongo,
// kupanda miti. Urefu si chini ya maneno 150. Ona curriculum-reference/grade-5/kiswahili.json.

type Mada = "upanzi-wa-miche" | "kusafisha-darasa" | "kufua-nguo" | "kuzuia-mmomonyoko" | "kupanda-miti";

const MADA_JINA: Record<Mada, string> = {
  "upanzi-wa-miche": "Upanzi wa Miche",
  "kusafisha-darasa": "Kusafisha Darasa",
  "kufua-nguo": "Kufua Nguo",
  "kuzuia-mmomonyoko": "Kuzuia Mmomonyoko wa Udongo",
  "kupanda-miti": "Kupanda Miti",
};

const SENTENSI_MFANO: { sentensi: string; mada: Mada }[] = [
  { sentensi: "Andaa kitalu chenye udongo laini kabla ya kupanda mbegu.", mada: "upanzi-wa-miche" },
  { sentensi: "Mwagilia mbegu maji kila siku ili ziote vizuri.", mada: "upanzi-wa-miche" },
  { sentensi: "Hamishia miche kwenye mifuko midogo baada ya kuota.", mada: "upanzi-wa-miche" },
  { sentensi: "Ondoa vumbi kwenye madawati kwa kutumia kitambaa safi.", mada: "kusafisha-darasa" },
  { sentensi: "Fagia sakafu ya darasa kila asubuhi kabla ya masomo.", mada: "kusafisha-darasa" },
  { sentensi: "Panga vitabu na vifaa vizuri kwenye rafu baada ya kutumia.", mada: "kusafisha-darasa" },
  { sentensi: "Loweka nguo chafu ndani ya maji yenye sabuni kwa dakika chache.", mada: "kufua-nguo" },
  { sentensi: "Sugua nguo kwa mikono ili kuondoa madoa.", mada: "kufua-nguo" },
  { sentensi: "Anika nguo zilizofuliwa juani ili zikauke.", mada: "kufua-nguo" },
  { sentensi: "Panda miti kando ya mto ili kuimarisha kingo za udongo.", mada: "kuzuia-mmomonyoko" },
  { sentensi: "Jenga matuta kwenye mteremko ili kupunguza mmomonyoko wa udongo.", mada: "kuzuia-mmomonyoko" },
  { sentensi: "Epuka kukata miti hovyo kwenye vilima vyenye mteremko mkali.", mada: "kuzuia-mmomonyoko" },
  { sentensi: "Chimba shimo lenye kina cha kutosha kabla ya kupanda mche.", mada: "kupanda-miti" },
  { sentensi: "Weka mche kwenye shimo na uufunike kwa udongo.", mada: "kupanda-miti" },
  { sentensi: "Mwagilia mche maji mara baada ya kuupanda.", mada: "kupanda-miti" },
];

const HATUA_ZA_KUPANDA_MTI = [
  { id: "1", label: "Chimba shimo lenye kina cha kutosha" },
  { id: "2", label: "Weka mche kwenye shimo" },
  { id: "3", label: "Funika mche kwa udongo" },
  { id: "4", label: "Mwagilia mche maji" },
];

export const inshaYaMaelezoMazingira: Skill = {
  id: "g5-ksw-ka-insha-ya-maelezo-mazingira",
  code: "KA.7",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha ya Maelezo (Elimu ya Mazingira)",
  description: "Tambua insha za maelezo kuhusu shughuli za mazingira na uandike kwa muundo ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-mada", "oanisha-hatua", "panga-mada", "jaza-hatua", "panga-kupanda-mti"] as const);

    if (branch === "tambua-mada") {
      const s = randChoice(rng, SENTENSI_MFANO);
      const wote = Object.keys(MADA_JINA) as Mada[];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "mada ya mazingira inayoelezwa na sentensi hii")} "${s.sentensi}"`,
        choices: choices.map((c) => MADA_JINA[c]),
        correctIndex: choices.indexOf(s.mada),
        layout: "list",
        hint: "Fikiria ni shughuli gani ya mazingira inayohusiana na hatua hii.",
        explanation: `Sentensi hii inaelezea mada ya ${MADA_JINA[s.mada]}.`,
      };
    }

    if (branch === "oanisha-hatua") {
      const wote = Object.keys(MADA_JINA) as Mada[];
      const chosen = shuffle(rng, wote).slice(0, 5);
      const tokens = chosen.map((m) => ({ id: m, label: MADA_JINA[m] }));
      const targets = shuffle(rng, chosen).map((m) => {
        const fact = randChoice(rng, SENTENSI_MFANO.filter((s) => s.mada === m));
        return { id: m, label: fact.sentensi };
      });
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m] = m;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "mada ya mazingira na hatua muhimu inayohusiana nayo"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria hatua zinazohusiana na kila shughuli ya mazingira.",
        explanation: chosen.map((m) => `${MADA_JINA[m]} inahusiana na hatua zake maalum.`).join(" "),
      };
    }

    if (branch === "panga-mada") {
      const wote = Object.keys(MADA_JINA) as Mada[];
      const madaMbili = shuffle(rng, wote).slice(0, 2);
      const chosen = shuffle(rng, SENTENSI_MFANO.filter((s) => madaMbili.includes(s.mada))).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `${i}-${s.sentensi}`, label: s.sentensi, bucket: s.mada }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "mada ya mazingira inayolingana na sentensi hii"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: madaMbili.map((m) => ({ id: m, label: MADA_JINA[m] })),
        correctBucket,
        hint: "Soma kila sentensi kwa makini uibaini shughuli ya mazingira inayohusika.",
        explanation: chosen.map((s) => `"${s.sentensi}" ni sehemu ya mada ya ${MADA_JINA[s.mada]}.`).join(" "),
      };
    }

    if (branch === "jaza-hatua") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika insha kuhusu kufua nguo. Hatua ya kwanza ni kuloweka nguo kwenye maji yenye "`, after: `".`, jibu: "sabuni" },
        { before: `${j} anaeleza kuwa ni muhimu kuchimba "`, after: `" kabla ya kupanda mche wa mti.`, jibu: "shimo" },
        { before: `Ili kuzuia mmomonyoko wa udongo, ${j} anapendekeza kupanda "`, after: `" kando ya mto.`, jibu: "miti" },
        { before: `Kabla ya masomo kuanza, ${j} anafagia "`, after: `" ya darasa.`, jibu: "sakafu" },
        { before: `Baada ya kuota, ${j} anahamishia miche kwenye "`, after: `" midogo.`, jibu: "mifuko" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria msamiati wa shughuli za mazingira zinazofundishwa.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_KUPANDA_MTI);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kupanda mti kwa mpangilio sahihi"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_KUPANDA_MTI.map((h) => h.id),
      hint: "Fikiria mchakato kutoka kuchimba shimo hadi kumwagilia mche.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_KUPANDA_MTI.map((h) => h.label).join(" → "),
    };
  },
};
