import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { id: string; label: string; maelezo: string }[] = [
  { id: "salamu", label: "Salamu kwa hadhira", maelezo: "Kuwatambua na kuwasalimu wote waliopo, k.m. 'Wageni waalikwa, walimu na wanafunzi wenzangu'" },
  { id: "utangulizi", label: "Utangulizi", maelezo: "Kutaja kusudi la hotuba na mada itakayozungumziwa" },
  { id: "kiini", label: "Kiini cha hotuba", maelezo: "Taarifa kuu na ukweli muhimu unaotolewa kwa hadhira kwa mfuatano ulio wazi" },
  { id: "hitimisho", label: "Hitimisho", maelezo: "Muhtasari wa taarifa muhimu zilizotolewa na wito wa kuchukua hatua" },
  { id: "shukrani", label: "Shukrani na kuagana", maelezo: "Kuwashukuru wasikilizaji na kuwaaga kwa heshima" },
];

const MIKTADHA_INAYOFAA = [
  "Kutoa taarifa shuleni kuhusu kampeni ya chanjo dhidi ya malaria",
  "Kuwajulisha wanakijiji kuhusu mradi mpya wa maji safi kijijini",
  "Kuwaeleza wazazi matokeo ya mtihani wa kitaifa wakati wa mkutano wa shule",
  "Kutoa taarifa kwa umma kuhusu hatua za kuzuia mafuriko wakati wa msimu wa mvua",
];

const MIKTADHA_YASIYOFAA = [
  "Kumwomba rafiki radhi kwa faragha baada ya kugombana naye",
  "Kumwandikia rafiki barua ya kumshukuru kwa zawadi ya siku ya kuzaliwa",
  "Kuandika kumbukumbu ya faragha kuhusu ndoto uliyoota usiku",
  "Kutuma baruapepe ya kibinafsi kumwalika rafiki nyumbani",
];

const HOTUBA_MFANO =
  "Wageni waalikwa, walimu na wanafunzi wenzangu, hamjambo? Leo nimesimama mbele yenu kuwapasha habari kuhusu kampeni ya chanjo dhidi ya malaria itakayofanyika shuleni wiki ijayo. Wataalamu wa afya watafika Jumatatu asubuhi kutoa chanjo bila malipo yoyote.";

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Hotuba ya kupasha habari ina maana gani hasa?",
    sahihi: "Ni hotuba inayolenga kuwapa hadhira taarifa muhimu kuhusu jambo fulani wanalohitaji kufahamu",
    makosa: [
      "Ni hotuba inayolenga kuomba msamaha mbele ya hadhira",
      "Ni hotuba inayosimulia hadithi za kubuni pekee",
      "Ni hotuba inayolenga kumshawishi mtu binafsi faraghani",
    ],
  },
  {
    swali: "Hotuba nzuri ya kupasha habari inapaswa kuanza vipi?",
    sahihi: "Kwa kuwasalimu na kuwatambua wasikilizaji wote waliohudhuria",
    makosa: [
      "Kwa kutoa hitimisho la habari mara moja",
      "Kwa kuomba radhi kwa muda uliochukuliwa",
      "Kwa kuuliza maswali magumu kwa hadhira",
    ],
  },
  {
    swali: `Soma sehemu ya hotuba hii: "${HOTUBA_MFANO}" Ni kipengele gani cha hotuba kinachoonekana wazi hapa?`,
    sahihi: "Salamu kwa hadhira ikifuatiwa na utangulizi unaotaja kusudi la hotuba",
    makosa: [
      "Hitimisho na wito wa kuchukua hatua",
      "Shukrani za mwisho kwa wasikilizaji",
      "Maelezo ya kina ya utaratibu wa chanjo",
    ],
  },
  {
    swali: "Ni ipi kati ya miktadha ifuatayo inayofaa zaidi kutolewa kama hotuba ya kupasha habari?",
    sahihi: "Kuwajulisha wanakijiji kuhusu mradi mpya wa maji safi kijijini",
    makosa: [
      "Kumwomba rafiki radhi kwa faragha baada ya kugombana naye",
      "Kuandika kumbukumbu ya faragha kuhusu ndoto uliyoota usiku",
      "Kutuma baruapepe ya kibinafsi kumwalika rafiki nyumbani",
    ],
  },
];

export const hotubaKupashaHabari: Skill = {
  id: "g7-ksw-ka-hotuba-kupasha-habari",
  code: "KA.10",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Hotuba ya Kupasha Habari",
  description: "Tambua muundo, lugha na miktadha ifaayo ya hotuba ya kupasha habari kwa hadhira.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.maelezo })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.label })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha hotuba ya kupasha habari na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Hotuba huanza na salamu, ikafuatwa na utangulizi, kiini, hitimisho, na shukrani ya kuagana.",
        explanation: VIPENGELE.map((v) => `${v.label} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, VIPENGELE);
      return {
        kind: "ordering",
        prompt: "Panga vipengele vya hotuba ya kupasha habari kwa mpangilio sahihi wa kuzungumza mbele ya hadhira.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: VIPENGELE.map((v) => v.id),
        hint: "Anza kwa salamu, kisha utangulizi, kiini cha taarifa, hitimisho, na mwishoni shukrani.",
        explanation: VIPENGELE.map((v) => v.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const yanafaa = shuffle(rng, MIKTADHA_INAYOFAA).slice(0, 3);
      const hayafai = shuffle(rng, MIKTADHA_YASIYOFAA).slice(0, 3);
      const items = shuffle(rng, [
        ...yanafaa.map((label) => ({ id: `y-${label}`, label, bucket: "yanafaa" })),
        ...hayafai.map((label) => ({ id: `h-${label}`, label, bucket: "hayafai" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga miktadha hii kulingana na kama inafaa kutolewa kama hotuba ya kupasha habari mbele ya hadhira au la.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "yanafaa", label: "Inafaa Hotuba ya Kupasha Habari" },
          { id: "hayafai", label: "Haifai — Ni Muktadha wa Faragha" },
        ],
        correctBucket,
        hint: "Hotuba ya kupasha habari hutolewa mbele ya hadhira kuhusu jambo la manufaa kwa umma, si mambo ya faragha.",
        explanation: `Inafaa hotuba: ${yanafaa.join(" / ")}. Ni ya faragha, haifai hotuba: ${hayafai.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha neno linalokosekana katika mwanzo huu wa hotuba ya kupasha habari.",
        before: "Wageni",
        after: ", walimu na wanafunzi wenzangu, hamjambo?",
        correctAnswer: "waalikwa",
        inputMode: "text",
        hint: "Fikiria neno linalotambulisha wageni waliohudhuria kwa heshima.",
        explanation: "Hotuba nzuri huanza kwa kuwatambua wasikilizaji wote, mfano 'Wageni waalikwa, walimu na wanafunzi wenzangu'.",
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
      hint: "Zingatia muundo (salamu, utangulizi, kiini, hitimisho, shukrani) na miktadha inayofaa hotuba ya kupasha habari.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
