import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KAZI_ZA_ALAMA: { kazi: string; mfano: string }[] = [
  { kazi: "Alama za mtajo kuonyesha maneno halisi ya mzungumzaji", mfano: "Polisi alisema, \"Uhalifu wa mtandaoni ni hatari kubwa kwa vijana.\"" },
  { kazi: "Alama za mtajo kuonyesha jina la kitabu au makala", mfano: "Alisoma makala iitwayo \"Hatari za Mtandao kwa Vijana.\"" },
  { kazi: "Mshazari kuonyesha chaguo la 'au'", mfano: "Tuma malalamiko kwa mzazi/mlezi wako mara moja." },
  { kazi: "Mshazari kuonyesha tarehe kwa ufupi", mfano: "Uhalifu ule uliripotiwa tarehe 14/08/2026." },
];

const SENTENSI_SAHIHI = [
  "Mwalimu alisema, \"Msishiriki nywila zenu na mtu yeyote mtandaoni.\"",
  "Piga simu kwa polisi/mzazi endapo utapata ujumbe wa kutisha.",
  "Ripoti hiyo ilichapishwa tarehe 03/07/2026.",
  "Kitabu \"Usalama Mtandaoni kwa Vijana\" kimesambazwa shuleni.",
];

const SENTENSI_SI_SAHIHI = [
  "Mwalimu alisema Msishiriki nywila zenu na mtu yeyote mtandaoni.",
  "Piga simu kwa polisi mzazi endapo utapata ujumbe wa kutisha.",
  "Ripoti hiyo ilichapishwa tarehe 03.07.2026 bila mshazari.",
  "Kitabu Usalama Mtandaoni kwa Vijana kimesambazwa shuleni bila mtajo.",
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Alama za mtajo (\" \") hutumiwa lini katika maandishi?",
    sahihi: "Kuonyesha maneno halisi ya mzungumzaji au jina la kitabu/makala",
    makosa: [
      "Kuonyesha mwisho wa sentensi ya kawaida",
      "Kuunganisha nambari mbili katika tarehe",
      "Kuonyesha kusitisha kwa muda mfupi katikati ya sentensi",
    ],
  },
  {
    swali: "Ni ipi kati ya matumizi haya ni sahihi ya alama ya mshazari (/)?",
    sahihi: "Kuonyesha chaguo kati ya maneno mawili, kama 'mzazi/mlezi'",
    makosa: [
      "Kuonyesha maneno halisi ya mzungumzaji",
      "Kuonyesha mwanzo wa aya mpya",
      "Kuonyesha jina la mtu maalum",
    ],
  },
  {
    swali: "Sentensi ipi kati ya hizi imetumia alama za mtajo kwa usahihi?",
    sahihi: "Afisa alisema, \"Uhalifu wa mtandaoni unapaswa kuripotiwa mara moja.\"",
    makosa: [
      "Afisa alisema Uhalifu wa mtandaoni unapaswa kuripotiwa mara moja.",
      "Afisa, alisema \"uhalifu\", wa, mtandaoni.",
      "Afisa alisema uhalifu \"wa mtandaoni unapaswa\" kuripotiwa.",
    ],
  },
  {
    swali: "Ni sentensi ipi iliyotumia mshazari (/) kwa usahihi kuonyesha tarehe?",
    sahihi: "Tukio hilo la udukuzi liliripotiwa tarehe 21/06/2026.",
    makosa: [
      "Tukio hilo la udukuzi liliripotiwa tarehe 21.06.2026.",
      "Tukio hilo la udukuzi liliripotiwa tarehe 21 06 2026.",
      "Tukio hilo la udukuzi liliripotiwa tarehe/21/06/2026.",
    ],
  },
];

export const viakifishiMtajoMshazari: Skill = {
  id: "g8-ksw-ka-viakifishi-mtajo-mshazari",
  code: "KA.8",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Viakifishi: Alama za Mtajo na Mshazari",
  description: "Tambua na tumia ipasavyo alama za mtajo (\" \") na mshazari (/) katika matini.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const items = KAZI_ZA_ALAMA.map((k, i) => ({ id: `t${i}`, kazi: k.kazi, mfano: k.mfano }));
      const tokens = shuffle(rng, items.map((t) => ({ id: t.id, label: t.mfano })));
      const targets = shuffle(rng, items.map((t) => ({ id: t.id, label: t.kazi })));
      const correctMap: Record<string, string> = {};
      for (const t of items) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kazi ya alama ya uakifishi na mfano wake katika sentensi.",
        tokens,
        targets,
        correctMap,
        hint: "Alama za mtajo huonyesha maneno halisi au majina ya vitabu; mshazari huonyesha chaguo au tarehe.",
        explanation: KAZI_ZA_ALAMA.map((k) => `${k.kazi} — mfano: "${k.mfano}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const sahihi = shuffle(rng, SENTENSI_SAHIHI).slice(0, 3);
      const siSahihi = shuffle(rng, SENTENSI_SI_SAHIHI).slice(0, 3);
      const items = shuffle(rng, [
        ...sahihi.map((label) => ({ id: label, label, bucket: "sahihi" })),
        ...siSahihi.map((label) => ({ id: label, label, bucket: "sisahihi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zimetumia alama za mtajo au mshazari kwa usahihi.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Matumizi Sahihi" },
          { id: "sisahihi", label: "Matumizi Yasiyo Sahihi" },
        ],
        correctBucket,
        hint: "Angalia kama maneno halisi yamewekwa ndani ya alama za mtajo na tarehe/chaguo vimetenganishwa na mshazari.",
        explanation: `Sahihi: ${sahihi.join(" / ")}. Si sahihi: ${siSahihi.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const aina = randChoice(rng, ["mtajo", "mshazari"] as const);
      if (aina === "mtajo") {
        return {
          kind: "fill-blank",
          prompt: "Weka alama ifaayo kabla na baada ya maneno halisi ya mzungumzaji (mfano: kabla weka \", baada weka \").",
          before: "Mwalimu wa TEHAMA alionya akisema",
          after: "Usiwahi kutuma nywila yako kwa mtu asiyemfahamu. kwa wanafunzi wote.",
          correctAnswer: "\"",
          inputMode: "text",
          hint: "Maneno halisi ya mzungumzaji huwekwa ndani ya alama za mtajo.",
          explanation: "Maneno halisi aliyosema mwalimu yanapaswa kuzungukwa na alama za mtajo (\" \").",
        };
      }
      return {
        kind: "fill-blank",
        prompt: "Weka alama ifaayo katikati ya maneno haya yanayotoa chaguo mbili.",
        before: "Ripoti tukio hilo kwa mwalimu",
        after: "mzazi mara moja.",
        correctAnswer: "/",
        inputMode: "text",
        hint: "Mshazari hutumika kuonyesha chaguo kati ya maneno mawili.",
        explanation: "Mshazari (/) hutumika kuunganisha maneno mawili yanayoonyesha chaguo, kama 'mwalimu/mzazi'.",
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
      hint: "Alama za mtajo huonyesha maneno halisi/majina; mshazari huonyesha chaguo au tarehe.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
