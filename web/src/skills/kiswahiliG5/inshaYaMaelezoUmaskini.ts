import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha ya Maelezo (Kukabiliana na Umaskini)" —
// mifano 5 ya mada (verbatim), urefu si chini ya maneno 150. Insha ya maelezo huelezea mchakato/sababu,
// tofauti na masimulizi (hadithi) na wasifu (mtu). Ona curriculum-reference/grade-5/kiswahili.json.

type Aina = "maelezo" | "masimulizi" | "wasifu";

const AINA_JINA: Record<Aina, string> = {
  maelezo: "Insha ya Maelezo",
  masimulizi: "Insha ya Masimulizi",
  wasifu: "Insha ya Wasifu",
};

const MADA_UMASKINI: { mada: string; tuzo: string }[] = [
  { mada: "Jinsi ninavyoweza kuchangia kukabiliana na umaskini nyumbani", tuzo: "mchango binafsi wa kila mwanafamilia nyumbani" },
  { mada: "Maskini alivyogeuka kuwa tajiri", tuzo: "mfano wa mtu aliyebadilika kiuchumi kwa bidii" },
  { mada: "Jinsi elimu ilivyosaidia kumaliza umaskini", tuzo: "elimu kama njia ya kupata kazi na kipato" },
  { mada: "Jinsi matumizi bora ya pesa yanavyosaidia kumaliza umaskini", tuzo: "kuweka akiba na kutumia pesa kwa hekima" },
  { mada: "Jinsi ulipaji ushuru unavyosaidia kukabiliana na umaskini", tuzo: "ushuru unaosaidia serikali kutoa huduma kwa maskini" },
];

const MADA_ZA_AINA: { mada: string; aina: Aina }[] = [
  ...MADA_UMASKINI.map((m) => ({ mada: m.mada, aina: "maelezo" as Aina })),
  { mada: "Kisa cha safari yangu ya kwanza mjini", aina: "masimulizi" },
  { mada: "Tukio la kusisimua shuleni jana", aina: "masimulizi" },
  { mada: "Jinsi nilivyopotea sokoni nikiwa mdogo", aina: "masimulizi" },
  { mada: "Siku niliyokutana na simba mbugani", aina: "masimulizi" },
  { mada: "Jinsi tulivyookoa mtoto aliyezama mtoni", aina: "masimulizi" },
  { mada: "Mwalimu Ninayemheshimu", aina: "wasifu" },
  { mada: "Shujaa wa Jamii Yangu", aina: "wasifu" },
  { mada: "Rais Wetu wa Kwanza", aina: "wasifu" },
  { mada: "Babu Yangu Mpendwa", aina: "wasifu" },
  { mada: "Daktari Aliyenisaidia", aina: "wasifu" },
];

const SENTENSI_MAELEZO: string[] = [
  "Hatua ya kwanza ya kukabiliana na umaskini ni kupata elimu bora.",
  "Kwa sababu ya kuweka akiba, familia nyingi zimeweza kujikwamua kiuchumi.",
  "Kulipa ushuru kwa wakati huisaidia serikali kutoa huduma kwa maskini.",
  "Kwa hivyo, matumizi bora ya pesa huwasaidia watu kuepuka umaskini.",
  "Njia mojawapo ya kumaliza umaskini ni kuwekeza katika biashara ndogo ndogo.",
  "Sababu kuu ya umaskini katika baadhi ya maeneo ni ukosefu wa elimu.",
];

const SENTENSI_MASIMULIZI: string[] = [
  "Siku moja, Baraka aliamka akiwa na wazo la kuanzisha biashara ndogo.",
  "Ghafla, familia ya Chiku ilipata pesa baada ya mavuno mazuri.",
  "Mara tu alipofaulu shuleni, maisha ya Daudi yalibadilika kabisa.",
  "Alipokuwa mdogo, Amina aliishi katika umaskini mkubwa kijijini.",
  "Baada ya miaka mingi ya kazi ngumu, mfanyabiashara huyo alifanikiwa.",
  "Kwa bahati, mzee huyo alipata msaada uliomwezesha kuanzisha duka lake.",
];

const HATUA_ZA_MAELEZO = [
  { id: "1", label: "Taja mada: jinsi elimu inavyosaidia kumaliza umaskini" },
  { id: "2", label: "Toa sababu ya kwanza: elimu huwapa watu ujuzi wa kupata kazi" },
  { id: "3", label: "Toa sababu ya pili: watu wenye elimu huweza kuanzisha biashara zao" },
  { id: "4", label: "Hitimisha kwa muhtasari wa jinsi elimu inavyosaidia kumaliza umaskini" },
];

export const inshaYaMaelezoUmaskini: Skill = {
  id: "g5-ksw-ka-insha-ya-maelezo-umaskini",
  code: "KA.5",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha ya Maelezo (Kukabiliana na Umaskini)",
  description: "Tambua insha za maelezo kuhusu kukabiliana na umaskini na uzitofautishe na aina nyingine za insha.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-aina", "oanisha-mada", "panga-mtindo", "jaza-mkakati", "panga-hatua"] as const);

    if (branch === "tambua-aina") {
      const m = randChoice(rng, MADA_ZA_AINA);
      const wote: Aina[] = ["maelezo", "masimulizi", "wasifu"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "aina ya insha inayolingana na mada hii")} "${m.mada}"`,
        choices: choices.map((c) => AINA_JINA[c]),
        correctIndex: choices.indexOf(m.aina),
        layout: "row",
        hint: "Insha ya maelezo huelezea sababu/mchakato; masimulizi husimulia hadithi; wasifu huelezea mtu.",
        explanation: `"${m.mada}" ni mfano wa ${AINA_JINA[m.aina]}.`,
      };
    }

    if (branch === "oanisha-mada") {
      const chosen = shuffle(rng, MADA_UMASKINI).slice(0, 5);
      const tokens = chosen.map((m, i) => ({ id: `${i}`, label: m.mada }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${chosen.indexOf(m)}`, label: m.tuzo }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_m, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "mada ya insha ya maelezo na mkakati wa kukabiliana na umaskini unaoelezwa"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni mkakati gani unaozungumziwa katika kila mada.",
        explanation: chosen.map((m) => `"${m.mada}" inaelezea ${m.tuzo}.`).join(" "),
      };
    }

    if (branch === "panga-mtindo") {
      const maelezo = shuffle(rng, SENTENSI_MAELEZO).slice(0, 4);
      const masimulizi = shuffle(rng, SENTENSI_MASIMULIZI).slice(0, 4);
      const items = shuffle(rng, [
        ...maelezo.map((s, i) => ({ id: `e${i}-${s}`, label: s, bucket: "maelezo" })),
        ...masimulizi.map((s, i) => ({ id: `n${i}-${s}`, label: s, bucket: "masimulizi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi ina mtindo wa maelezo (kueleza sababu) au masimulizi (kusimulia tukio)"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "maelezo", label: "Mtindo wa Maelezo" },
          { id: "masimulizi", label: "Mtindo wa Masimulizi" },
        ],
        correctBucket,
        hint: "Maelezo hutumia maneno kama 'sababu', 'hatua', 'kwa hivyo'; masimulizi husimulia tukio kwa mfuatano.",
        explanation:
          maelezo.map((s) => `"${s}" ina mtindo wa maelezo.`).join(" ") +
          " " +
          masimulizi.map((s) => `"${s}" ina mtindo wa masimulizi.`).join(" "),
      };
    }

    if (branch === "jaza-mkakati") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika insha ya maelezo kuhusu jinsi "`, after: `" inavyosaidia kumaliza umaskini nyumbani.`, jibu: "elimu" },
        { before: `Katika insha yake, ${j} anaeleza kuwa kuweka "`, after: `" husaidia familia kuepuka umaskini.`, jibu: "akiba" },
        { before: `${j} anaandika kuwa ulipaji wa "`, after: `" husaidia serikali kutoa huduma kwa maskini.`, jibu: "ushuru" },
        { before: `Kulingana na insha ya ${j}, matumizi bora ya "`, after: `" ni njia moja ya kumaliza umaskini.`, jibu: "pesa" },
        { before: `${j} anaeleza kuwa mtu maskini anaweza kugeuka kuwa "`, after: `" kwa bidii na mipango mizuri.`, jibu: "tajiri" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria mikakati ya kukabiliana na umaskini: elimu, akiba, ushuru, matumizi bora ya pesa.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_MAELEZO);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kuandika insha ya maelezo kuhusu jinsi elimu inavyosaidia kumaliza umaskini"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_MAELEZO.map((h) => h.id),
      hint: "Insha ya maelezo huanza na mada, kisha sababu, kisha hitimisho.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_MAELEZO.map((h) => h.label).join(" → "),
    };
  },
};
