import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { term: string; maelezo: string }[] = [
  { term: "Kuonyesha huruma na uelewa", maelezo: "Kutambua hisia za mzungumzaji na kuzionyesha kwa maneno au sura" },
  { term: "Kutokuhukumu haraka", maelezo: "Kumpa mzungumzaji nafasi ya kueleza bila kumkatiza wala kumlaumu" },
  { term: "Kutumia lugha ya mwili chanya", maelezo: "Kuinamisha kichwa, kutabasamu, na kudumisha mtazamo wa macho ili kuonyesha ukaribu" },
  { term: "Kuuliza maswali ya kufafanua kwa upole", maelezo: "Kumsaidia mzungumzaji kueleza zaidi bila kumfanya ajihisi vibaya" },
  { term: "Kutoa mrejesho unaomtia moyo", maelezo: "Kumjibu mzungumzaji kwa maneno yanayomhakikishia unamsikiliza" },
];

const NZURI = [
  "Kumpa mtu mwenye ulemavu wa kusikia muda wa kutosha wa kuwasiliana kwa ishara",
  "Kumsikiliza kwa subira mtu mwenye changamoto ya kuongea bila kumkimbiza",
  "Kuuliza kwa heshima jinsi ya kumsaidia mtu mwenye mahitaji maalumu",
  "Kuzungumza moja kwa moja na mtu mwenye mahitaji maalumu, si na mlezi wake pekee",
];

const MBAYA = [
  "Kumkatiza mtu mwenye changamoto ya kuongea kabla hajamaliza",
  "Kuzungumza na mlezi pekee badala ya mtu mwenye mahitaji maalumu mwenyewe",
  "Kuonyesha huzuni kupita kiasi mbele ya mtu mwenye ulemavu",
  "Kupuuza matakwa aliyoyaeleza mtu mwenye mahitaji maalumu",
];

const HATUA = [
  { id: "karibisha", label: "Mkaribishe mzungumzaji kwa moyo mkunjufu" },
  { id: "sikiliza", label: "Msikilize kwa makini bila kukatiza" },
  { id: "onyesha", label: "Onyesha kuwa unaelewa hisia zake kwa maneno au ishara" },
  { id: "uliza", label: "Uliza maswali ya kufafanua kwa upole" },
  { id: "mrejesho", label: "Toa mrejesho unaomtia moyo na kuonyesha kujali" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Usikilizaji husishi hutofautianaje na usikilizaji wa kawaida?",
    sahihi: "Huzingatia hisia na mahitaji ya mzungumzaji na kuonyesha kujali, si kusikia maneno tu",
    makosa: [
      "Hauhitaji mtu kumtazama mzungumzaji",
      "Hutumika tu wakati wa mahojiano rasmi",
      "Hauhusiani na hisia za mzungumzaji hata kidogo",
    ],
  },
  {
    swali: "Kwa nini usikilizaji husishi ni muhimu wakati wa kuhudumia watu wenye mahitaji maalumu?",
    sahihi: "Huwasaidia kujisikia kuheshimiwa na kueleweka, hivyo kujenga uhusiano mwema",
    makosa: [
      "Huwafanya wategemee wengine kufanya kila kitu badala yao",
      "Hauna umuhimu wowote kwa watu wenye mahitaji maalumu",
      "Hutumika tu kwa watu wasio na ulemavu",
    ],
  },
  {
    swali: "Mwalimu alipokutana na mwanafunzi mwenye changamoto ya kuongea, alimpa muda wa kutosha kueleza, hakumkatiza, na akauliza kwa upole jinsi anavyoweza kumsaidia. Je, mwalimu alizingatia usikilizaji husishi ipasavyo?",
    sahihi: "Ndiyo, kwa sababu alisubiri kwa subira na kuuliza kwa heshima jinsi ya kumsaidia",
    makosa: [
      "Hapana, kwa sababu alichukua muda mrefu kumsikiliza",
      "Hapana, kwa sababu aliuliza maswali badala ya kutoa maagizo",
      "Ndiyo, lakini tu kwa sababu ni mwalimu",
    ],
  },
  {
    swali: "Kijana mmoja alipomsikia rafiki yake mwenye mahitaji maalumu akieleza changamoto zake, alimkatiza mara kwa mara na kumwambia 'si tatizo kubwa hilo'. Je, alizingatia usikilizaji husishi?",
    sahihi: "Hapana, kwa sababu alimkatiza na kupuuza hisia za rafiki yake",
    makosa: [
      "Ndiyo, kwa sababu alijibu haraka",
      "Ndiyo, kwa sababu alionyesha kuwa hakuna tatizo",
      "Hapana, kwa sababu hawakuwa marafiki wa karibu",
    ],
  },
];

export const usikilizajiHusishi: Skill = {
  id: "g8-ksw-kz-usikilizaji-husishi",
  code: "KZ.7",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Usikilizaji Husishi",
  description: "Tambua maana na vipengele vya usikilizaji husishi, hasa unapowahudumia watu wenye mahitaji maalumu.",
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
        prompt: "Oanisha kila kipengele cha usikilizaji husishi na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi msikilizaji anavyoonyesha kujali hisia za mzungumzaji.",
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
        prompt: "Panga kila tabia katika kundi la Tabia Njema au Tabia Mbaya za kuhudumia wenye mahitaji maalumu.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "nzuri", label: "Tabia Njema" },
          { id: "mbaya", label: "Tabia Mbaya" },
        ],
        correctBucket,
        hint: "Tabia njema humheshimu na kumsikiliza mtu mwenye mahitaji maalumu moja kwa moja.",
        explanation: `Tabia njema: ${nzuri.join(" / ")}. Tabia mbaya: ${mbaya.join(" / ")}.`,
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA);
      return {
        kind: "ordering",
        prompt: "Panga hatua za mazungumzo yanayozingatia usikilizaji husishi.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA.map((s) => s.id),
        hint: "Mazungumzo mazuri huanza kwa ukaribisho na kuishia kwa mrejesho unaotia moyo.",
        explanation: HATUA.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "jaza") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa maneno yafaayo.",
        before: "Aina ya usikilizaji unaozingatia hisia na mahitaji ya mzungumzaji, ambapo msikilizaji hushiriki kikamilifu kwa kuonyesha uelewa na kujali, huitwa usikilizaji",
        after: ".",
        correctAnswer: "husishi",
        inputMode: "text",
        hint: "Neno hili huonyesha kuwa msikilizaji anajihusisha kikamilifu na hisia za mzungumzaji.",
        explanation: "Aina hii ya usikilizaji huitwa usikilizaji husishi — msikilizaji hushiriki kikamilifu kwa kuonyesha uelewa na kujali.",
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
      hint: "Usikilizaji husishi huzingatia hisia za mzungumzaji na kujenga uhusiano mwema kwa kumheshimu.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
