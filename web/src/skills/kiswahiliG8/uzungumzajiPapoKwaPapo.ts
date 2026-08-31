import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { term: string; maelezo: string }[] = [
  { term: "Kutulia na kufikiri haraka", maelezo: "Kujizuia kuhangaika na kupanga mawazo kwa muda mfupi kabla ya kuzungumza" },
  { term: "Kuandaa hoja fupi za msingi", maelezo: "Kutambua nukta kuu mbili au tatu za kuzungumzia badala ya kuzungumza bila mpangilio" },
  { term: "Kutumia mifano halisi", maelezo: "Kutolea mfano wa karibu na mada ili kuimarisha hoja" },
  { term: "Kudhibiti sauti na kasi", maelezo: "Kuzungumza kwa sauti ya wastani, isiyo ya haraka mno wala ya polepole mno" },
  { term: "Kuhitimisha kwa ufupi", maelezo: "Kufunga hoja kwa muhtasari mfupi badala ya kuendelea bila mwisho dhahiri" },
];

const NZURI = [
  "Kuchukua sekunde chache kupanga mawazo kabla ya kuanza",
  "Kuzungumzia nukta moja kwa uwazi kabla ya kuendelea na nyingine",
  "Kutumia mfano halisi kuthibitisha hoja",
  "Kumaliza kwa muhtasari mfupi wa alichosema",
];

const MBAYA = [
  "Kuanza kuzungumza bila kufikiri hata kidogo",
  "Kurudia jambo lile lile mara kwa mara bila hoja mpya",
  "Kupoteza mada na kuzungumzia mambo yasiyohusika",
  "Kuzungumza kwa sauti ya chini isiyosikika na kwa haraka mno",
];

const HATUA = [
  { id: "sikiliza", label: "Sikiliza swali au mada kwa makini" },
  { id: "panga", label: "Chukua sekunde chache kupanga mawazo" },
  { id: "chagua", label: "Chagua nukta kuu mbili au tatu za kuzungumzia" },
  { id: "zungumza", label: "Zungumza kwa sauti ya wastani ukitumia mfano" },
  { id: "hitimisha", label: "Hitimisha kwa muhtasari mfupi" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Kwa nini ni muhimu kuchukua sekunde chache kufikiri kabla ya kuzungumza papo kwa papo?",
    sahihi: "Ili kupanga mawazo na kuepuka kuzungumza bila mpangilio",
    makosa: [
      "Ili kuchelewesha mazungumzo yote",
      "Ili kuwafanya wasikilizaji wachoke",
      "Ili kubadilisha mada ya mazungumzo",
    ],
  },
  {
    swali: "Uzungumzaji wa papo kwa papo hutofautianaje na hotuba iliyoandaliwa mapema?",
    sahihi: "Papo kwa papo hutolewa bila maandalizi ya awali, wakati hotuba iliyoandaliwa huandikwa na kuhifadhiwa kabla",
    makosa: [
      "Hakuna tofauti yoyote kati ya aina hizo mbili",
      "Papo kwa papo huandikwa kwanza kisha kuhifadhiwa kwa wiki",
      "Hotuba iliyoandaliwa hutolewa bila mpangilio wowote",
    ],
  },
  {
    swali: "Mwanafunzi aliulizwa ghafla maoni yake kuhusu uhalifu wa mtandaoni kwenye mkutano wa shule. Alichukua sekunde chache kupanga mawazo, akatoa nukta mbili wazi akiungwa mkono na mfano halisi, kisha akahitimisha kwa muhtasari mfupi. Je, alizingatia vipengele vya uzungumzaji wa papo kwa papo ipasavyo?",
    sahihi: "Ndiyo, kwa sababu alipanga mawazo, alitoa hoja wazi zenye mfano, na akahitimisha vizuri",
    makosa: [
      "Hapana, kwa sababu alichukua muda kufikiri kabla ya kuzungumza",
      "Hapana, kwa sababu alitumia mfano badala ya takwimu",
      "Ndiyo, lakini tu kwa sababu alikuwa mwanafunzi mzuri",
    ],
  },
  {
    swali: "Mwanafunzi mwingine alipoulizwa swali hilohilo kuhusu uhalifu wa mtandaoni, alianza kuzungumza bila kufikiri, akapoteza mada kuhusu mambo yasiyohusika, na hakuhitimisha kabisa. Je, alizingatia vipengele vya uzungumzaji wa papo kwa papo?",
    sahihi: "Hapana, kwa sababu hakupanga mawazo, alipoteza mada, na hakuhitimisha hoja yake",
    makosa: [
      "Ndiyo, kwa sababu alizungumza kwa muda mrefu",
      "Ndiyo, kwa sababu alijibu mara moja bila kusita",
      "Hapana, kwa sababu swali lilikuwa gumu mno",
    ],
  },
];

export const uzungumzajiPapoKwaPapo: Skill = {
  id: "g8-ksw-kz-papo-kwa-papo",
  code: "KZ.8",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Aina za Uzungumzaji: Uzungumzaji wa Papo kwa Papo",
  description: "Tambua vipengele vya uzungumzaji wa papo kwa papo na uvitumie ili kufanikisha mawasiliano.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha", "panga", "hatua", "jaza", "swali"] as const);

    if (branch === "oanisha") {
      const chosen = shuffle(rng, VIPENGELE).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha uzungumzaji wa papo kwa papo na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi mzungumzaji stadi anavyojiandaa kwa muda mfupi kabla ya kuzungumza.",
        explanation: chosen.map((v) => `${v.term} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
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
        prompt: "Panga kila tabia katika kundi la Tabia Nzuri au Tabia Mbaya za uzungumzaji wa papo kwa papo.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "nzuri", label: "Tabia Nzuri" },
          { id: "mbaya", label: "Tabia Mbaya" },
        ],
        correctBucket,
        hint: "Tabia nzuri huonyesha mpangilio wa mawazo; tabia mbaya huonyesha kuchanganyikiwa.",
        explanation: `Tabia nzuri: ${nzuri.join(" / ")}. Tabia mbaya: ${mbaya.join(" / ")}.`,
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kujiandaa kuzungumza papo kwa papo kwa mpangilio unaofaa.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA.map((s) => s.id),
        hint: "Kwanza sikiliza mada, kisha panga mawazo, kabla ya kuzungumza na kuhitimisha.",
        explanation: HATUA.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "jaza") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa maneno yafaayo.",
        before: "Aina ya mazungumzo ambapo mzungumzaji hutoa hoja mara moja bila maandalizi ya awali, akijibu swali au mada iliyotolewa ghafla, huitwa uzungumzaji wa",
        after: ".",
        correctAnswer: "papo kwa papo",
        inputMode: "text",
        hint: "Msemo huu unaonyesha kuwa hakuna wakati wa kujiandaa kabla.",
        explanation: "Mazungumzo kama hayo huitwa uzungumzaji wa papo kwa papo — hutolewa bila maandalizi ya awali.",
      };
    }

    const entry = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
    return {
      kind: "multiple-choice",
      prompt: entry.swali,
      choices,
      correctIndex: choices.indexOf(entry.sahihi),
      layout: "list",
      hint: "Mzungumzaji stadi wa papo kwa papo hupanga mawazo haraka, hutoa hoja wazi zenye mfano, na huhitimisha vizuri.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
