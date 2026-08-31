import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE_KUSIKILIZA: { term: string; maelezo: string }[] = [
  { term: "Kusikiliza swali lote", maelezo: "Kumwacha mhoji amalize swali kabla ya kuanza kujibu" },
  { term: "Kuelewa lengo la swali", maelezo: "Kutambua mhoji anataka kujua nini hasa kabla ya kujibu" },
  { term: "Kuzingatia ishara za mhoji", maelezo: "Kuangalia mkao na sura ya mhoji ili kuelewa mkazo wa swali lake" },
  { term: "Kutofautisha swali funge na swali huru", maelezo: "Kutambua kama swali linahitaji jibu fupi la 'ndiyo/hapana' au maelezo marefu" },
];

const VIPENGELE_KUJIBU: { term: string; maelezo: string }[] = [
  { term: "Kujibu kwa ufupi na uwazi", maelezo: "Kutoa jibu linalolenga swali bila kuzungumzia mambo yasiyohusika" },
  { term: "Kutumia lugha ya heshima", maelezo: "Kutumia maneno ya staha wakati wa kuzungumza na mhoji" },
  { term: "Kuthibitisha jibu kwa mfano", maelezo: "Kutolea mfano halisi unaothibitisha jibu ulilotoa" },
  { term: "Kudumisha mtazamo wa macho", maelezo: "Kumtazama mhoji machoni ili kuonyesha ujasiri na uaminifu" },
];

const NZURI = [
  "Kutulia na kufikiri kabla ya kujibu",
  "Kutoa mifano halisi inayothibitisha jibu",
  "Kutumia sauti ya wastani, isiyo na haraka",
  "Kumshukuru mhoji baada ya mahojiano",
];

const MBAYA = [
  "Kujibu kwa haraka bila kufikiri",
  "Kutoa majibu marefu yasiyohusiana na swali",
  "Kukwepa swali gumu badala ya kulijibu",
  "Kunong'ona kwa sauti isiyosikika vizuri",
];

const HATUA_MAHOJIANO = [
  { id: "salamu", label: "Salamu na utambulisho kati ya mhoji na mhojiwa" },
  { id: "utangulizi", label: "Maswali mepesi ya utangulizi kumtuliza mhojiwa" },
  { id: "makuu", label: "Maswali makuu kuhusu mada husika" },
  { id: "ufafanuzi", label: "Ufafanuzi wa majibu yasiyo wazi" },
  { id: "hitimisho", label: "Hitimisho na shukrani" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Kwa nini ni muhimu kuelewa lengo la swali kabla ya kulijibu katika mahojiano?",
    sahihi: "Ili kutoa jibu linalolenga hasa kile mhoji anachotaka kujua",
    makosa: [
      "Ili kuchukua muda mrefu zaidi wa mahojiano",
      "Ili kuepuka kumtazama mhoji machoni",
      "Ili kubadilisha mada ya mahojiano",
    ],
  },
  {
    swali: "Swali funge katika mahojiano ni lipi kati ya haya?",
    sahihi: "Swali linalohitaji jibu fupi kama 'ndiyo' au 'hapana'",
    makosa: [
      "Swali linalohitaji maelezo marefu na mifano",
      "Swali lisilo na jibu dhahiri kabisa",
      "Swali linalohusu tarehe pekee",
    ],
  },
  {
    swali: "Afisa wa usafi wa mazingira alipohojiwa kuhusu uchafuzi wa vituo vya mabasi, alisikiliza swali lote, akafikiri kidogo, kisha akatoa mfano halisi wa hatua zilizochukuliwa kusafisha vituo hivyo. Je, alizingatia vipengele vya kujibu mahojiano ipasavyo?",
    sahihi: "Ndiyo, kwa sababu alisikiliza swali lote na kuthibitisha jibu lake kwa mfano halisi",
    makosa: [
      "Hapana, kwa sababu alichukua muda kufikiri kabla ya kujibu",
      "Hapana, kwa sababu alitoa mfano badala ya kujibu 'ndiyo' au 'hapana'",
      "Ndiyo, lakini tu kwa sababu alikuwa afisa wa serikali",
    ],
  },
  {
    swali: "Mratibu wa afya ya umma alipohojiwa kuhusu usafi wa soko, alijibu haraka kabla mhoji hajamaliza swali, kisha akazungumzia mada isiyohusiana kabisa na usafi wa soko. Je, alizingatia vipengele vya kusikiliza na kujibu mahojiano ipasavyo?",
    sahihi: "Hapana, kwa sababu hakusikiliza swali lote wala hakujibu kwa ufupi na uwazi",
    makosa: [
      "Ndiyo, kwa sababu alijibu haraka bila kusita",
      "Ndiyo, kwa sababu alizungumza kwa muda mrefu",
      "Hapana, kwa sababu alitumia lugha ya heshima pekee",
    ],
  },
];

export const mahojiano: Skill = {
  id: "g8-ksw-kz-mahojiano",
  code: "KZ.1",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Kusikiliza na Kujibu (Mahojiano)",
  description: "Tambua na tumia vipengele vifaavyo vya kusikiliza na kujibu mahojiano katika miktadha mbalimbali.",
  generate(rng) {
    const branch = randChoice(rng, ["kusikiliza", "kujibu", "tabia", "hatua", "swali"] as const);

    if (branch === "kusikiliza") {
      const tokens = shuffle(rng, VIPENGELE_KUSIKILIZA.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, VIPENGELE_KUSIKILIZA.map((v) => ({ id: v.term, label: v.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE_KUSIKILIZA) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha kusikiliza mahojiano na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kile mhojiwa anachopaswa kufanya kabla na wakati mhoji anapouliza swali.",
        explanation: VIPENGELE_KUSIKILIZA.map((v) => `${v.term} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "kujibu") {
      const tokens = shuffle(rng, VIPENGELE_KUJIBU.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, VIPENGELE_KUJIBU.map((v) => ({ id: v.term, label: v.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE_KUJIBU) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha kujibu mahojiano na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi mhojiwa anavyopaswa kuzungumza na kujiweka wakati wa kujibu maswali.",
        explanation: VIPENGELE_KUJIBU.map((v) => `${v.term} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "tabia") {
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
        prompt: "Panga kila tabia katika kundi la Tabia Nzuri au Tabia Mbaya za kujibu mahojiano.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "nzuri", label: "Tabia Nzuri" },
          { id: "mbaya", label: "Tabia Mbaya" },
        ],
        correctBucket,
        hint: "Tabia nzuri humsaidia mhojiwa kutoa jibu bora; tabia mbaya humzuia mhojiwa kuwasilisha vyema.",
        explanation: `Tabia nzuri: ${nzuri.join(" / ")}. Tabia mbaya: ${mbaya.join(" / ")}.`,
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA_MAHOJIANO);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kikao cha mahojiano kwa mpangilio unaofaa.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_MAHOJIANO.map((s) => s.id),
        hint: "Kikao cha mahojiano huanza kwa salamu na kuishia kwa shukrani.",
        explanation: HATUA_MAHOJIANO.map((s) => s.label).join(" → "),
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
      hint: "Zingatia iwapo mhojiwa alisikiliza swali lote na kutoa jibu linalolenga swali kwa heshima na mifano.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
