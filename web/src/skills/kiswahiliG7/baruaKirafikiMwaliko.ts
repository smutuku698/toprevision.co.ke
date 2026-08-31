import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { id: string; label: string; maelezo: string }[] = [
  { id: "anwani", label: "Anwani ya mwandishi na tarehe", maelezo: "Mahali barua inapoandikiwa na tarehe, kwenye kona ya juu kulia" },
  { id: "mtajo", label: "Mtajo wa kirafiki", maelezo: "Salamu ya kawaida na ya joto kama 'Mpendwa Achieng,'" },
  { id: "utangulizi", label: "Aya ya utangulizi", maelezo: "Kumjulisha rafiki kusudi la barua — kumwalika kwenye tukio fulani" },
  { id: "kiini", label: "Aya ya kiini", maelezo: "Maelezo ya tukio — mahali, tarehe, saa, na kwa nini rafiki akaribishwe" },
  { id: "hitimisho", label: "Aya ya hitimisho", maelezo: "Kusisitiza mwaliko na kuonyesha shauku ya kumwona rafiki huko" },
  { id: "kimalizio", label: "Kimalizio la kirafiki", maelezo: "Maneno ya mwisho ya kirafiki na jina la mwandishi, k.m. 'Rafiki yako,'" },
];

const LUGHA_KIRAFIKI = [
  "Nakualika kwa dhati uje kwenye sherehe yangu ya kuzaliwa Jumamosi hii.",
  "Nategemea sana uje, itakuwa raha kukutana nawe tena baada ya muda mrefu.",
  "Njoo tuwe pamoja, tucheze na tule keki kama zamani!",
  "Wazazi wangu wamekubali unaweza kulala nyumbani baada ya sherehe.",
];

const LUGHA_RASMI_ISIYOFAA = [
  "Kwa heshima kubwa, ninaandika barua hii kuwasilisha ombi rasmi la mwaliko.",
  "Nawasilisha shukrani zangu za dhati kwa kuzingatia mwaliko huu ipasavyo.",
  "Naomba mchukue hatua zinazofaa kuhusiana na tukio litakalofanyika.",
  "Ninatumaini kwamba mtazingatia ombi hili kwa umakini unaostahili.",
];

const FILL_ITEMS: { kabla: string; baada: string; jibu: string; maelezo: string }[] = [
  {
    kabla: "",
    baada: " Achieng, Nakualika kwenye sherehe yangu ya kuzaliwa Jumamosi ijayo.",
    jibu: "Mpendwa",
    maelezo: "Barua ya kirafiki huanza kwa mtajo wa kirafiki kama 'Mpendwa' unaofuatiwa na jina la rafiki, si mtajo rasmi kama 'Ndugu' au 'Mheshimiwa'.",
  },
  {
    kabla: "Nitafurahi sana ukija kwenye tamasha letu la muziki.\n",
    baada: " yako,\nKiptoo",
    jibu: "Rafiki",
    maelezo: "Barua ya kirafiki humalizika kwa kimalizio cha kirafiki kama 'Rafiki yako,' kabla ya jina la mwandishi — si kimalizio rasmi kama 'Wako mtiifu,'.",
  },
];

const EXCERPT =
  "Mpendwa Naliaka,\nHabari za huko Kitale? Ninakuandikia kukualika kwenye tamasha la muziki litakalofanyika shuleni kwetu Jumamosi ijayo. Tutaimba, tutacheza, na kuna zawadi za washindi!";

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Barua ya kirafiki ya kutoa mwaliko huandikwa lini hasa?",
    sahihi: "Mtu anapotaka kumkaribisha rafiki au ndugu kwenye tukio fulani kwa njia ya kirafiki",
    makosa: [
      "Mtu anapotaka kuomba kazi kutoka kwa kampuni",
      "Mtu anapotaka kuwasilisha malalamiko rasmi shuleni",
      "Mtu anapotaka kutoa taarifa ya hali ya hewa",
    ],
  },
  {
    swali: "Aya ya kiini katika barua ya kirafiki ya kutoa mwaliko inapaswa kuwa na nini?",
    sahihi: "Maelezo ya tukio — mahali, tarehe, saa na sababu ya kumkaribisha rafiki",
    makosa: [
      "Orodha ya bidhaa za kununua sokoni",
      "Malalamiko kuhusu tabia ya rafiki",
      "Maagizo rasmi ya kiofisi kutoka kwa mwalimu mkuu",
    ],
  },
  {
    swali: 'Soma kifungu hiki: "' + EXCERPT + '" Ujumbe mkuu wa kifungu hiki ni upi?',
    sahihi: "Mwandishi anamwalika Naliaka kwenye tamasha la muziki shuleni",
    makosa: [
      "Mwandishi anamwomba Naliaka msaada wa kazi za shule",
      "Mwandishi analalamika kuhusu tamasha lililoshindwa",
      "Mwandishi anamjulisha Naliaka matokeo ya mtihani",
    ],
  },
  {
    swali: "Ni ipi kati ya sentensi zifuatazo inayofaa zaidi lugha ya barua ya kirafiki ya kutoa mwaliko?",
    sahihi: "Njoo tuwe pamoja, tucheze na tule keki kama zamani!",
    makosa: [
      "Kwa heshima kubwa, ninaandika barua hii kuwasilisha ombi rasmi la mwaliko.",
      "Naomba mchukue hatua zinazofaa kuhusiana na tukio litakalofanyika.",
      "Ninatumaini kwamba mtazingatia ombi hili kwa umakini unaostahili.",
    ],
  },
];

export const baruaKirafikiMwaliko: Skill = {
  id: "g7-ksw-ka-barua-kirafiki-mwaliko",
  code: "KA.2",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Barua ya Kirafiki (ya Kutoa Mwaliko)",
  description: "Tambua umuhimu, ujumbe, muundo na lugha ya kirafiki inayofaa katika barua ya kutoa mwaliko.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.maelezo })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.label })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha barua ya kirafiki ya kutoa mwaliko na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Barua ya kirafiki huanza na anwani na mtajo, kisha kueleza mwaliko kwa kina, na kumalizika kwa kimalizio cha kirafiki.",
        explanation: VIPENGELE.map((v) => `${v.label} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, VIPENGELE);
      return {
        kind: "ordering",
        prompt: "Panga vipengele vya barua ya kirafiki ya kutoa mwaliko kwa mpangilio sahihi.",
        instruction: "Bofya kwa mpangilio sahihi, kutoka juu hadi chini.",
        items,
        correctOrder: VIPENGELE.map((v) => v.id),
        hint: "Barua huanza na anwani na mtajo, kisha utangulizi, kiini, hitimisho, na kimalizio.",
        explanation: VIPENGELE.map((v) => v.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const kirafiki = shuffle(rng, LUGHA_KIRAFIKI).slice(0, 3);
      const rasmi = shuffle(rng, LUGHA_RASMI_ISIYOFAA).slice(0, 3);
      const items = shuffle(rng, [
        ...kirafiki.map((label) => ({ id: `k-${label}`, label, bucket: "kirafiki" })),
        ...rasmi.map((label) => ({ id: `r-${label}`, label, bucket: "rasmi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zinafaa lugha ya kirafiki ya barua ya mwaliko kwa rafiki, au ni rasmi mno kwa mwaliko wa kirafiki.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kirafiki", label: "Lugha ya Kirafiki Inayofaa" },
          { id: "rasmi", label: "Rasmi Mno kwa Rafiki" },
        ],
        correctBucket,
        hint: "Barua ya mwaliko kwa rafiki hutumia lugha ya joto na ya kawaida, si lugha ya kiofisi.",
        explanation: `Lugha ya kirafiki inayofaa: ${kirafiki.join(" / ")}. Rasmi mno kwa rafiki: ${rasmi.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sehemu inayokosekana ya barua hii ya kirafiki ya kutoa mwaliko.",
        before: entry.kabla,
        after: entry.baada,
        correctAnswer: entry.jibu,
        inputMode: "text",
        hint: "Fikiria kuhusu mtajo na kimalizio vinavyofaa barua ya kirafiki, si barua rasmi.",
        explanation: entry.maelezo,
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
      hint: "Zingatia ujumbe, muundo (anwani, mtajo, utangulizi, kiini, hitimisho, kimalizio) na lugha ya kirafiki isiyo rasmi.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
