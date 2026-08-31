import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { id: string; label: string; maelezo: string }[] = [
  { id: "anwani", label: "Anwani", maelezo: "Kichwa kinachoeleza kwa ufupi kile kitakachoelekezwa, k.m. 'Jinsi ya Kupanda Mti'" },
  { id: "vifaa", label: "Vifaa vinavyohitajika", maelezo: "Orodha ya vitu vinavyotakiwa kabla ya kuanza kazi husika" },
  { id: "hatua", label: "Hatua kwa hatua", maelezo: "Maelezo ya kila hatua kwa mpangilio unaofuatana" },
  { id: "mfuatano", label: "Maneno ya mfuatano", maelezo: "Maneno kama 'kwanza, kisha, baadaye, mwishoni' yanayoonyesha mpangilio wa hatua" },
  { id: "amri", label: "Lugha ya amri", maelezo: "Matumizi ya vitenzi vya amri kama 'chimba, weka, funga'" },
];

const HATUA_KUPANDA_MTI = [
  { id: "shimo", label: "Chimba shimo lenye kina cha kutosha" },
  { id: "mbolea", label: "Weka mbolea ya asili ndani ya shimo" },
  { id: "mche", label: "Panda mche wa mti katikati ya shimo" },
  { id: "maji", label: "Mwagilia maji ya kutosha kila siku" },
];

const LUGHA_AMRI = [
  "Chimba shimo lenye kina cha sentimita thelathini.",
  "Funga geti baada ya kuingia ndani.",
  "Osha mikono kabla ya kuandaa chakula.",
  "Weka vifaa vyote mahali salama.",
];

const LUGHA_SI_AMRI = [
  "Nilipanda mti wangu jana asubuhi.",
  "Bustani yetu ina miti mingi mizuri.",
  "Wanafunzi walifurahia kupanda miche.",
  "Mvua ilinyesha vizuri wiki iliyopita.",
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Anwani ya insha ya maelekezo inapaswa kuwa na sifa gani?",
    sahihi: "Ieleze kwa ufupi na uwazi kile kinachoelekezwa",
    makosa: [
      "Iwe ndefu na yenye maelezo mengi",
      "Isiwe na uhusiano wowote na maudhui ya insha",
      "Iandikwe mwishoni mwa insha",
    ],
  },
  {
    swali: "Kwa nini maneno ya mfuatano kama 'kwanza, kisha, mwishoni' ni muhimu katika insha ya maelekezo?",
    sahihi: "Husaidia msomaji kufuata hatua kwa mpangilio sahihi bila kuchanganyikiwa",
    makosa: [
      "Huifanya insha kuwa ndefu zaidi",
      "Huondoa haja ya kutumia lugha ya amri",
      "Hutumika tu mwanzoni mwa insha",
    ],
  },
  {
    swali: "Anwani 'Jinsi ya Kutunza Mazingira Safi' inafaa kuandamana na insha gani?",
    sahihi: "Insha inayoeleza hatua za kutunza mazingira kwa mpangilio",
    makosa: [
      "Insha ya masimulizi kuhusu likizo",
      "Barua ya kuomba msaada wa fedha",
      "Hotuba ya kushukuru wageni",
    ],
  },
  {
    swali: "Mwanafunzi aliandika insha ya maelekezo yenye anwani 'Jinsi ya Kuosha Mikono' lakini akaanza kwa kusimulia jinsi alivyokuwa mchafu utotoni. Je, hii ni sahihi?",
    sahihi: "Hapana, kwa sababu insha ya maelekezo inapaswa kuanza moja kwa moja na vifaa au hatua, si masimulizi",
    makosa: [
      "Ndiyo, kwa sababu masimulizi hufanya insha ivutie",
      "Ndiyo, ikiwa masimulizi ni mafupi",
      "Hapana, lakini tu ikiwa insha ni ndefu",
    ],
  },
];

export const inshaMaelekeziI: Skill = {
  id: "g8-ksw-ka-maelekezo-1",
  code: "KA.5",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Insha ya Maelekezo",
  description: "Tambua sifa za insha ya maelekezo na uandike ukizingatia anwani na mpangilio ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.maelezo })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.label })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha insha ya maelekezo na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Insha ya maelekezo huwa na anwani, vifaa, hatua kwa hatua, maneno ya mfuatano, na lugha ya amri.",
        explanation: VIPENGELE.map((v) => `${v.label} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_KUPANDA_MTI);
      return {
        kind: "ordering",
        prompt: "Panga hatua za 'Jinsi ya Kupanda Mti' kwa mpangilio sahihi.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUPANDA_MTI.map((h) => h.id),
        hint: "Kwanza chimba shimo, kisha weka mbolea, panda mche, na mwishoni mwagilia maji.",
        explanation: HATUA_KUPANDA_MTI.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const amri = shuffle(rng, LUGHA_AMRI).slice(0, 3);
      const siAmri = shuffle(rng, LUGHA_SI_AMRI).slice(0, 3);
      const items = shuffle(rng, [
        ...amri.map((label) => ({ id: label, label, bucket: "amri" })),
        ...siAmri.map((label) => ({ id: label, label, bucket: "siamri" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zinatumia lugha ya amri inayofaa insha ya maelekezo.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "amri", label: "Lugha ya Amri" },
          { id: "siamri", label: "Si Lugha ya Amri" },
        ],
        correctBucket,
        hint: "Lugha ya amri hutumia vitenzi vinavyomwelekeza msomaji afanye jambo moja kwa moja.",
        explanation: `Lugha ya amri: ${amri.join(" / ")}. Si lugha ya amri: ${siAmri.join(" / ")}.`,
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
      hint: "Zingatia anwani, vifaa, hatua kwa hatua, na lugha ya amri katika insha ya maelekezo.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
