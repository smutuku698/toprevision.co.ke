import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { id: string; label: string; maelezo: string }[] = [
  { id: "mada", label: "Mada (Subject)", maelezo: "Mstari mfupi unaoeleza kwa ufupi kile baruapepe inahusu — hakuna kipengele kama hiki katika barua ya karatasi" },
  { id: "salamu", label: "Salamu", maelezo: "Mtajo mfupi wa kirafiki lakini wenye heshima kidogo, k.m. 'Habari Fatuma,'" },
  { id: "mwili", label: "Mwili wa ujumbe", maelezo: "Sehemu kuu inayoeleza ujumbe kwa ufupi na uwazi, ikizingatia muktadha wa kidijitali" },
  { id: "hitimisho", label: "Hitimisho na saini", maelezo: "Maneno ya kuagana na jina la mwandishi tu — hakuna anwani ya posta kama barua ya karatasi" },
];

const MADA_ZINAZOFAA = [
  "Mwaliko wa Sherehe ya Kuzaliwa",
  "Habari za Likizo ya Shule",
  "Kazi ya Mradi wa Sayansi",
  "Mpango wa Kutembelea Wikendi Hii",
];

const MADA_ZISIZOFAA = [
  "Habari",
  "Kitu Fulani",
  "",
  "Ujumbe",
];

const VIPENGELE_BARUAPEPE = [
  "Mstari wa mada unaoeleza baruapepe inahusu nini",
  "Salamu fupi ya kirafiki yenye heshima",
  "Mwili wa ujumbe wenye habari kuu",
  "Jina la mwandishi mwishoni bila anwani ya posta",
];

const VIPENGELE_BARUA_KARATASI = [
  "Anwani ya mwandishi na tarehe iliyoandikwa juu kushoto au kulia",
  "Bahasha yenye stempu ya posta",
  "Anwani ya mpokeaji iliyoandikwa kwenye bahasha",
  "Karatasi iliyokunjwa na kutiwa kwenye bahasha",
];

const EXCERPT =
  "Mada: Mwaliko wa Sherehe ya Kuzaliwa\nHabari Fatuma,\nNatumaini upo salama. Ningependa kukualika kwenye sherehe yangu ya kuzaliwa Jumamosi ijayo saa nane mchana nyumbani kwetu. Tafadhali nijibu haraka ili nijue idadi ya wageni.\nAsante,\nAmina";

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Ni kipengele gani muhimu kinachopatikana katika baruapepe lakini hakipo katika barua ya kirafiki ya karatasi?",
    sahihi: "Mstari wa mada (subject) unaoeleza kwa ufupi baruapepe inahusu nini",
    makosa: [
      "Salamu ya kirafiki mwanzoni",
      "Mwili wa ujumbe wenye habari",
      "Jina la mwandishi mwishoni",
    ],
  },
  {
    swali: "Baruapepe kwa rafiki inapaswa kutumia lugha ya aina gani?",
    sahihi: "Kati ya kirafiki na yenye heshima ipasavyo kwa muktadha wa kidijitali, si rasmi kupita kiasi wala mzaha kupita kiasi",
    makosa: [
      "Lugha rasmi kabisa kama barua ya serikalini",
      "Lugha ya mzaha na vifupisho vingi visivyoeleweka",
      "Lugha ya Kiingereza pekee bila Kiswahili",
    ],
  },
  {
    swali: `Soma baruapepe hii: "${EXCERPT}" Mada iliyoandikwa inafaa kwa sababu gani?`,
    sahihi: "Inaeleza kwa ufupi na uwazi kile baruapepe inahusu — mwaliko wa sherehe ya kuzaliwa",
    makosa: [
      "Ni ndefu na yenye maelezo mengi kama mwili wa ujumbe",
      "Haihitajiki kabisa katika baruapepe",
      "Inaandikwa kwa herufi ndogo pekee",
    ],
  },
  {
    swali: "Kwa nini baruapepe haihitaji anwani ya posta ya mwandishi juu ya ujumbe kama barua ya karatasi?",
    sahihi: "Kwa sababu mfumo wa kidijitali tayari unaonyesha anwani ya baruapepe ya mtumaji na tarehe kiotomatiki",
    makosa: [
      "Kwa sababu baruapepe haihitaji kuwa na mwandishi",
      "Kwa sababu baruapepe haiwezi kutumwa kwa marafiki",
      "Kwa sababu baruapepe haina hitimisho wala saini",
    ],
  },
  {
    swali: `Ni ipi kati ya haya inayofaa zaidi kama mada ya baruapepe, ikilinganishwa na mada dhaifu kama "${MADA_ZISIZOFAA[0]}" au "${MADA_ZISIZOFAA[1]}"?`,
    sahihi: "Mwaliko wa Sherehe ya Kuzaliwa",
    makosa: MADA_ZISIZOFAA.filter((m) => m !== "").slice(0, 3),
  },
];

export const baruapepe: Skill = {
  id: "g7-ksw-ka-baruapepe",
  code: "KA.11",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Kuandika Kidijitali: Baruapepe kwa Rafiki",
  description: "Tambua ujumbe, vipengele vya kimuundo (mada, salamu, mwili, hitimisho) na lugha ifaayo ya baruapepe kwa rafiki.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.maelezo })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.label })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha baruapepe kwa rafiki na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Baruapepe huwa na mada (kipengele cha kipekee), salamu, mwili, na hitimisho lenye saini pekee.",
        explanation: VIPENGELE.map((v) => `${v.label} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, VIPENGELE);
      return {
        kind: "ordering",
        prompt: "Panga vipengele vya baruapepe kwa rafiki kwa mpangilio sahihi.",
        instruction: "Bofya kwa mpangilio sahihi, kutoka juu hadi chini.",
        items,
        correctOrder: VIPENGELE.map((v) => v.id),
        hint: "Baruapepe huanza na mada, kisha salamu, mwili wa ujumbe, na hitimisho lenye saini.",
        explanation: VIPENGELE.map((v) => v.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const vyaBaruapepe = shuffle(rng, VIPENGELE_BARUAPEPE).slice(0, 3);
      const karatasi = shuffle(rng, VIPENGELE_BARUA_KARATASI).slice(0, 3);
      const items = shuffle(rng, [
        ...vyaBaruapepe.map((label) => ({ id: `b-${label}`, label, bucket: "baruapepe" })),
        ...karatasi.map((label) => ({ id: `k-${label}`, label, bucket: "karatasi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga vipengele hivi kulingana na kama vinapatikana katika baruapepe ya kidijitali au katika barua ya karatasi ya kawaida.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "baruapepe", label: "Vya Baruapepe ya Kidijitali" },
          { id: "karatasi", label: "Vya Barua ya Karatasi" },
        ],
        correctBucket,
        hint: "Baruapepe ina mada na haihitaji bahasha wala anwani ya posta iliyoandikwa kwa mkono.",
        explanation: `Vya baruapepe: ${vyaBaruapepe.join(" / ")}. Vya barua ya karatasi: ${karatasi.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const madaSahihi = randChoice(rng, MADA_ZINAZOFAA);
      return {
        kind: "fill-blank",
        prompt: "Amina anataka kumtumia Fatuma baruapepe kumwalika sherehe yake ya kuzaliwa. Andika mada (subject) ifaayo kwa baruapepe hii.",
        before: "Mada: ",
        after: "",
        correctAnswer: madaSahihi,
        acceptedAnswers: MADA_ZINAZOFAA,
        inputMode: "text",
        hint: "Mada inapaswa kueleza kwa ufupi kile baruapepe inahusu.",
        explanation: `Mada ifaayo ni fupi na wazi, mfano "${madaSahihi}" — inaeleza kwa haraka lengo la baruapepe.`,
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
      hint: "Zingatia mada, salamu, mwili, hitimisho na lugha ya kidijitali inayofaa.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
