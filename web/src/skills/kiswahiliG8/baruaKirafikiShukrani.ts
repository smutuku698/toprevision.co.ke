import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { id: string; label: string; maelezo: string }[] = [
  { id: "anwani", label: "Anwani ya mwandishi", maelezo: "Mahali barua inapoandikiwa na tarehe" },
  { id: "mtajo", label: "Mtajo wa kirafiki", maelezo: "Salamu ya kawaida kama 'Mpendwa rafiki yangu,'" },
  { id: "utangulizi", label: "Aya ya utangulizi", maelezo: "Kumjulisha rafiki kusudi la barua — kutoa shukrani" },
  { id: "kiini", label: "Aya ya kiini", maelezo: "Kueleza kwa kina kile alichokufanyia rafiki na jinsi kilivyokusaidia" },
  { id: "hitimisho", label: "Aya ya hitimisho", maelezo: "Kurudia shukrani na kutamani kuonana tena" },
  { id: "kimalizio", label: "Kimalizio", maelezo: "Maneno ya mwisho ya kirafiki na jina la mwandishi, k.m. 'Rafiki yako,'" },
];

const SABABU_ZA_SHUKRANI = [
  "Rafiki alikusaidia kusoma masomo ulipokuwa mgonjwa nyumbani",
  "Jirani alikupa zawadi ya siku yako ya kuzaliwa",
  "Mwalimu alikuhamasisha ushiriki mashindano ya insha",
  "Rafiki alikutembelea hospitalini na kukupa moyo",
];

const SIO_SHUKRANI = [
  "Kumwomba rafiki apige mswaki kila siku",
  "Kumwambia rafiki bei ya nauli ya basi",
  "Kumwuliza mwalimu ratiba ya mtihani",
  "Kumwambia jirani hali ya hewa ya kesho",
];

const EXCERPT = "Mpendwa Wanjiru,\nAsante sana kwa jinsi ulivyonisaidia kusoma hesabu wiki iliyopita nilipokuwa nimechelewa kuelewa somo hilo. Bila msaada wako, ningeshindwa mtihani wangu.";

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Barua ya kirafiki ya kutoa shukrani huandikwa lini hasa?",
    sahihi: "Mtu anapotaka kumshukuru rafiki au ndugu kwa jambo fulani alilomfanyia",
    makosa: [
      "Mtu anapotaka kuomba kazi kutoka kwa kampuni",
      "Mtu anapotaka kutoa taarifa rasmi kwa halmashauri",
      "Mtu anapotaka kulalamika kuhusu huduma mbaya",
    ],
  },
  {
    swali: "Aya ya kiini katika barua ya kirafiki ya kutoa shukrani inapaswa kuwa na nini?",
    sahihi: "Maelezo ya kina kuhusu kile alichofanyiwa mwandishi na jinsi kilivyomsaidia",
    makosa: [
      "Orodha ya bidhaa za kununua sokoni",
      "Malalamiko kuhusu huduma iliyotolewa",
      "Maagizo rasmi ya kiofisi",
    ],
  },
  {
    swali: "Soma kifungu hiki: \"" + EXCERPT + "\" Ujumbe mkuu wa kifungu hiki ni upi?",
    sahihi: "Mwandishi anamshukuru rafiki yake kwa msaada wa masomo ya hesabu",
    makosa: [
      "Mwandishi anamwomba rafiki amsaidie tena wiki ijayo",
      "Mwandishi analalamika kuhusu mtihani mgumu",
      "Mwandishi anamwalika rafiki nyumbani kwake",
    ],
  },
  {
    swali: "Ni kipengele gani cha kimuundo kinachokosekana katika kifungu hiki: \"" + EXCERPT + "\"?",
    sahihi: "Kimalizio na jina la mwandishi",
    makosa: [
      "Mtajo wa kirafiki",
      "Aya ya utangulizi inayoeleza kusudi la barua",
      "Aya ya kiini yenye maelezo ya shukrani",
    ],
  },
];

export const baruaKirafikiShukrani: Skill = {
  id: "g8-ksw-ka-barua-kirafiki-shukrani",
  code: "KA.2",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Barua ya Kirafiki (ya Kutoa Shukrani)",
  description: "Tambua ujumbe, muundo na lugha ifaayo katika barua ya kirafiki ya kutoa shukrani.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.maelezo })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.label })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha barua ya kirafiki ya kutoa shukrani na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Barua ya kirafiki huanza na anwani na mtajo, kisha kueleza shukrani kwa kina, na kumalizika kwa kimalizio cha kirafiki.",
        explanation: VIPENGELE.map((v) => `${v.label} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, VIPENGELE);
      return {
        kind: "ordering",
        prompt: "Panga vipengele vya barua ya kirafiki ya kutoa shukrani kwa mpangilio sahihi.",
        instruction: "Bofya kwa mpangilio sahihi, kutoka juu hadi chini.",
        items,
        correctOrder: VIPENGELE.map((v) => v.id),
        hint: "Barua huanza na anwani na mtajo, kisha utangulizi, kiini, hitimisho, na kimalizio.",
        explanation: VIPENGELE.map((v) => v.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const shukrani = shuffle(rng, SABABU_ZA_SHUKRANI).slice(0, 3);
      const sio = shuffle(rng, SIO_SHUKRANI).slice(0, 3);
      const items = shuffle(rng, [
        ...shukrani.map((label) => ({ id: label, label, bucket: "shukrani" })),
        ...sio.map((label) => ({ id: label, label, bucket: "sio" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga hali hizi kulingana na kama zinafaa kuandikiwa barua ya kirafiki ya kutoa shukrani au la.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "shukrani", label: "Inafaa Barua ya Shukrani" },
          { id: "sio", label: "Haifai Barua ya Shukrani" },
        ],
        correctBucket,
        hint: "Barua ya shukrani huandikwa mtu anapofanyiwa jambo jema linalostahili kutambuliwa.",
        explanation: `Zinazofaa barua ya shukrani: ${shukrani.join(" / ")}. Hazifai: ${sio.join(" / ")}.`,
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
      hint: "Zingatia ujumbe, muundo (anwani, mtajo, utangulizi, kiini, hitimisho, kimalizio) na lugha ya kirafiki.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
