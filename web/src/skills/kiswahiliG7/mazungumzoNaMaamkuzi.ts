import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MAAMKUZI: { swali: string; jibu: string }[] = [
  { swali: "Habari za asubuhi?", jibu: "Njema" },
  { swali: "Habari za mchana?", jibu: "Njema" },
  { swali: "Habari za jioni?", jibu: "Njema" },
  { swali: "Sabalkheri", jibu: "Aheri" },
  { swali: "Hujambo?", jibu: "Sijambo" },
  { swali: "Shikamoo", jibu: "Marahaba" },
];

const MAAGANO: { swali: string; jibu: string }[] = [
  { swali: "Kwaheri", jibu: "Ya kuonana" },
  { swali: "Alamsiki", jibu: "Binuru" },
  { swali: "Tuonane kesho", jibu: "Sawa, tuonane" },
  { swali: "Lala salama", jibu: "Naam, wewe pia" },
];

const VIPENGELE_KUSIKILIZA = [
  {
    before: "Ili kuelewa vyema ujumbe wa mzungumzaji, ni muhimu ku",
    after: " kwa makini kabla ya kujibu.",
    sahihi: "sikiliza",
  },
  {
    before: "Mwanafunzi mzuri humwacha mzungumzaji a",
    after: " kauli yake kabla ya kuingilia kati.",
    sahihi: "malize",
  },
  {
    before: "Katika mazungumzo, ni muhimu kutumia lugha ya",
    after: " hata unapokosa kukubaliana na mzungumzaji.",
    sahihi: "heshima",
  },
];

type Segment = "asubuhi" | "mchana" | "jioni" | "usiku";

function segmentOf(hour: number): Segment {
  if (hour >= 5 && hour <= 11) return "asubuhi";
  if (hour >= 12 && hour <= 15) return "mchana";
  if (hour >= 16 && hour <= 18) return "jioni";
  return "usiku";
}

const SEGMENT_MAAMKUZI: Record<Segment, string> = {
  asubuhi: "Habari za asubuhi?",
  mchana: "Habari za mchana?",
  jioni: "Habari za jioni?",
  usiku: "Habari za usiku?",
};

const VITENDO_ISHARA: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali:
      "Amina anamweleza mgeni jinsi ya kutayarisha chai. Ni vitendo vipi vinavyofaa kuambatanishwa na maelezo yake ili mgeni aelewe vyema?",
    sahihi: "Kuonyesha kwa mikono jinsi ya kumimina maji na kukoroga sukari huku akizungumza",
    makosa: [
      "Kuangalia simu yake wakati anazungumza na mgeni",
      "Kukaa kimya bila kutumia mikono au sura yoyote",
      "Kugeuza uso mbali na mgeni anapoelezea hatua",
    ],
  },
  {
    swali:
      "Baraka anamwelekeza mtoto mgeni njia ya kwenda sokoni la Gikomba. Ni ishara ipi inayofaa kuambatanishwa na maelezo yake?",
    sahihi: "Kunyoosha mkono kuelekea upande wa soko huku akitaja alama za njia",
    makosa: [
      "Kutingisha kichwa bila kuelekeza upande wowote",
      "Kutazama chini bila kumtazama mgeni",
      "Kuzungumza kwa sauti ya chini asiyosikika",
    ],
  },
];

export const mazungumzoNaMaamkuzi: Skill = {
  id: "g7-ksw-kz-mazungumzo-na-maamkuzi",
  code: "KZ.1",
  subjectId: "kiswahili",
  strandId: "g7-ksw-kz",
  grade: 7,
  title: "Mazungumzo, Maamkuzi na Maagano",
  description: "Sikiliza na ujibu mazungumzo ipasavyo, tumia maamkuzi na maagano yafaayo, na uzungumze ukiambatanisha vitendo/ishara.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["oanisha-maamkuzi", "panga-aina", "saa-maamkuzi", "pengo-usikilizaji", "hatua-simu", "vitendo-ishara"] as const,
    );

    if (branch === "oanisha-maamkuzi") {
      const chosen = shuffle(rng, [...MAAMKUZI, ...MAAGANO]).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.swali, label: p.swali })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.swali, label: p.jibu })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.swali] = p.swali;
      return {
        kind: "click-match",
        prompt: "Oanisha kila maamkuzi au maagano na jibu lake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Kumbuka kuwa 'Sabalkheri' na 'Alamsiki' ni maamkuzi ya asili ya Kiarabu yanayotumika Pwani.",
        explanation: chosen.map((p) => `"${p.swali}" hujibiwa kwa "${p.jibu}".`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const chosenAmkuzi = shuffle(rng, MAAMKUZI).slice(0, 3);
      const chosenAgano = shuffle(rng, MAAGANO).slice(0, 3);
      const items = shuffle(rng, [
        ...chosenAmkuzi.map((p) => ({ id: p.swali, label: p.swali, bucket: "Maamkuzi" })),
        ...chosenAgano.map((p) => ({ id: p.swali, label: p.swali, bucket: "Maagano" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kauli katika kundi la Maamkuzi (mwanzo wa mazungumzo) au Maagano (mwisho wa mazungumzo).",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Maamkuzi", label: "Maamkuzi" },
          { id: "Maagano", label: "Maagano" },
        ],
        correctBucket,
        hint: "Maamkuzi hutumika tunapokutana na mtu; maagano hutumika tunapoagana naye.",
        explanation: `Maamkuzi: ${chosenAmkuzi.map((p) => p.swali).join(", ")}. Maagano: ${chosenAgano.map((p) => p.swali).join(", ")}.`,
      };
    }

    if (branch === "saa-maamkuzi") {
      const hour = 5 + Math.floor(rng() * 18); // 5..22
      const minute = randChoice(rng, [0, 15, 30, 45]);
      const segment = segmentOf(hour);
      const correct = SEGMENT_MAAMKUZI[segment];
      const otherSegments = (Object.keys(SEGMENT_MAAMKUZI) as Segment[]).filter((s) => s !== segment);
      const distractors = shuffle(rng, otherSegments)
        .slice(0, 3)
        .map((s) => SEGMENT_MAAMKUZI[s]);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: "Saa iliyoonyeshwa inaonyesha wakati gani wa siku. Ni maamkuzi yapi yanayofaa wakati huu?",
        visual: { type: "clock", hour, minute },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Saa 5-11 asubuhi ni 'asubuhi', saa 12-15 ni 'mchana', saa 16-18 ni 'jioni', na baada ya hapo ni 'usiku'.",
        explanation: `Saa iliyoonyeshwa (${hour}:${minute.toString().padStart(2, "0")}) ni wakati wa ${segment}, hivyo maamkuzi yafaayo ni "${correct}".`,
      };
    }

    if (branch === "pengo-usikilizaji") {
      const entry = randChoice(rng, VIPENGELE_KUSIKILIZA);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Fikiria kipengele muhimu cha kusikiliza mazungumzo kwa umakini.",
        explanation: `Sentensi kamili ni: "${entry.before}${entry.sahihi}${entry.after}"`,
      };
    }

    if (branch === "hatua-simu") {
      const hatua = [
        { id: "salamu", label: "Kutoa maamkuzi mwanzoni mwa mazungumzo ya simu" },
        { id: "utambulisho", label: "Kujitambulisha kwa mzungumzaji mwenzako" },
        { id: "sababu", label: "Kueleza sababu ya kupiga simu" },
        { id: "majibizano", label: "Kujadiliana na kujibizana kuhusu jambo lililotajwa" },
        { id: "maagano", label: "Kuagana kwa kutumia maagano yafaayo" },
      ];
      const items = shuffle(rng, hatua);
      return {
        kind: "ordering",
        prompt: "Panga hatua za mazungumzo ya simu kwa mpangilio unaofaa.",
        instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
        items,
        correctOrder: hatua.map((h) => h.id),
        hint: "Mazungumzo ya simu huanza kwa salamu na kuishia kwa maagano.",
        explanation: hatua.map((h) => h.label).join(" → "),
      };
    }

    const entry = randChoice(rng, VITENDO_ISHARA);
    const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
    return {
      kind: "multiple-choice",
      prompt: entry.swali,
      choices,
      correctIndex: choices.indexOf(entry.sahihi),
      layout: "list",
      hint: "Vitendo na ishara zifaazo humsaidia msikilizaji kupata picha kamili ya kile kinachoelezwa.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}" — hii huambatanisha maelezo ya mdomo na kitendo kinachoonekana.`,
    };
  },
};
