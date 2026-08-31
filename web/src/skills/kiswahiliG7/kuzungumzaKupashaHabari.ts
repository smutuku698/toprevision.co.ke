import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MAANA_KUPASHA: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Kuzungumza ili kupasha habari kunatofautiana vipi na kuzungumza ili kushawishi?",
    sahihi: "Kupasha habari hulenga kutoa taarifa sahihi, ilhali kushawishi hulenga kubadilisha maoni ya msikilizaji",
    makosa: [
      "Kupasha habari hulenga kubuni hadithi za kufurahisha pekee",
      "Kushawishi hulenga kutoa taarifa za kweli pekee bila maoni",
      "Hakuna tofauti yoyote kati ya aina hizi mbili za uzungumzaji",
    ],
  },
  {
    swali: "Ni ipi kati ya haya ni mfano bora wa kuzungumza ili kupasha habari?",
    sahihi: "Kutangaza matokeo ya mechi ya mpira kwenye redio ya shuleni",
    makosa: [
      "Kumshawishi mwenzako achague timu fulani ya mpira",
      "Kusimulia hadithi ya kubuni kuhusu sungura na kobe",
      "Kuomba msamaha kwa rafiki kwa kosa lililotokea",
    ],
  },
];

const AINA_UZUNGUMZAJI: { mfano: string; aina: "Kupasha Habari" | "Kushawishi" | "Kusimulia" }[] = [
  { mfano: "Kutangaza wakati wa mtihani wa muhula", aina: "Kupasha Habari" },
  { mfano: "Kueleza matokeo ya hali ya hewa ya wiki", aina: "Kupasha Habari" },
  { mfano: "Kumsihi mkuu wa shule aongeze muda wa mapumziko", aina: "Kushawishi" },
  { mfano: "Kuwahimiza wanafunzi wapige kura ya kiongozi fulani", aina: "Kushawishi" },
  { mfano: "Kueleza jinsi babu alivyosafiri hadi Mombasa akiwa kijana", aina: "Kusimulia" },
  { mfano: "Kusimulia jinsi timu ilivyoshinda fainali mwaka jana", aina: "Kusimulia" },
];

const VIPENGELE_KUPASHA: { neno: string; maelezo: string }[] = [
  { neno: "Usahihi wa habari", maelezo: "Kuhakikisha taarifa unayotoa ni kweli na iliyothibitishwa" },
  { neno: "Ufupi na uwazi", maelezo: "Kutoa habari kwa lugha fupi isiyo na utata" },
  { neno: "Mpangilio wa habari", maelezo: "Kupanga taarifa kwa mfuatano unaoeleweka kirahisi" },
  { neno: "Ushahidi/vielelezo", maelezo: "Kutumia mifano au takwimu zinazothibitisha taarifa" },
];

const PENGO_KUPASHA = [
  { before: "Kabla ya kutoa taarifa, mzungumzaji anapaswa kuhakikisha", after: " wa habari ili isiwe ya uongo.", sahihi: "usahihi" },
  { before: "Ili taarifa iaminike zaidi, mzungumzaji anaweza kutumia", after: " kama takwimu au mifano halisi.", sahihi: "ushahidi" },
  { before: "Taarifa nzuri ya kupasha habari huwa fupi na", after: ", isiyo na maneno ya ziada yasiyo ya lazima.", sahihi: "wazi" },
];

const HATUA_TANGAZO = [
  { id: "utangulizi", label: "Kuvuta hisia za hadhira kwa utangulizi mfupi wa mada" },
  { id: "taarifa-kuu", label: "Kutoa taarifa kuu kwa uwazi na usahihi" },
  { id: "maelezo", label: "Kuongeza maelezo ya ziada yanayosaidia hadhira kuelewa vyema" },
  { id: "hitimisho", label: "Kuhitimisha kwa muhtasari mfupi wa taarifa iliyotolewa" },
];

export const kuzungumzaKupashaHabari: Skill = {
  id: "g7-ksw-kz-kuzungumza-kupasha-habari",
  code: "KZ.6",
  subjectId: "kiswahili",
  strandId: "g7-ksw-kz",
  grade: 7,
  title: "Kuzungumza ili Kupasha Habari",
  description: "Tambua maana na vipengele vya kuzungumza ili kupasha habari, na uwatofautishe na aina nyingine za uzungumzaji.",
  generate(rng) {
    const branch = randChoice(rng, ["taarifa-hewa-mfano", "maana-kupasha", "panga-aina", "oanisha-vipengele", "jaza-kipengele", "hatua-tangazo"] as const);

    if (branch === "taarifa-hewa-mfano") {
      const days = [
        { label: "Leo", condition: "cloudy" as const },
        { label: "Kesho", condition: "rainy" as const },
      ];
      const sahihi = "Kwa sababu inatoa taarifa fupi, sahihi, na iliyopangwa kuhusu hali ya hewa halisi";
      const makosa = [
        "Kwa sababu inamsihi msikilizaji abadilishe maoni yake kuhusu mvua",
        "Kwa sababu inasimulia hadithi ya kubuni kuhusu hali ya hewa",
        "Kwa sababu haihitaji usahihi wowote wa kisayansi",
      ];
      const choices = shuffle(rng, [sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: "Taarifa ya hali ya hewa iliyoonyeshwa ni mfano mzuri wa kuzungumza ili kupasha habari. Kwa nini?",
        visual: { type: "weather", days },
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "list",
        hint: "Fikiria vipengele vinavyofanya taarifa iwe ya kupasha habari — usahihi, ufupi, na mpangilio.",
        explanation: `Jibu sahihi ni: "${sahihi}".`,
      };
    }

    if (branch === "maana-kupasha") {
      const entry = randChoice(rng, MAANA_KUPASHA);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Kumbuka kuwa kupasha habari kuna lengo tofauti na kushawishi au kusimulia.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    if (branch === "panga-aina") {
      const chosen = shuffle(rng, AINA_UZUNGUMZAJI).slice(0, 6);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.mfano, bucket: a.aina }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila mfano wa uzungumzaji katika kundi linalofaa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Kupasha Habari", label: "Kupasha Habari" },
          { id: "Kushawishi", label: "Kushawishi" },
          { id: "Kusimulia", label: "Kusimulia" },
        ],
        correctBucket,
        hint: "Jiulize: je, lengo kuu ni kutoa taarifa, kubadilisha maoni, au kueleza hadithi?",
        explanation: chosen.map((a) => `"${a.mfano}" ni mfano wa ${a.aina}.`).join(" "),
      };
    }

    if (branch === "oanisha-vipengele") {
      const tokens = shuffle(rng, VIPENGELE_KUPASHA.map((v) => ({ id: v.neno, label: v.neno })));
      const targets = shuffle(rng, VIPENGELE_KUPASHA.map((v) => ({ id: v.neno, label: v.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE_KUPASHA) correctMap[v.neno] = v.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha kuzungumza ili kupasha habari na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Vipengele hivi vyote humsaidia mzungumzaji kutoa taarifa inayoeleweka na kuaminika.",
        explanation: VIPENGELE_KUPASHA.map((v) => `${v.neno} — ${v.maelezo}.`).join(" "),
      };
    }

    if (branch === "jaza-kipengele") {
      const entry = randChoice(rng, PENGO_KUPASHA);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Fikiria kipengele cha kuzungumza ili kupasha habari kinachohusika hapa.",
        explanation: `Sentensi kamili ni: "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const items = shuffle(rng, HATUA_TANGAZO);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kuwasilisha tangazo la kupasha habari shuleni kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
      items,
      correctOrder: HATUA_TANGAZO.map((h) => h.id),
      hint: "Tangazo zuri huanza kwa kuvuta hisia, kisha hutoa taarifa kuu, na kuishia kwa muhtasari.",
      explanation: HATUA_TANGAZO.map((h) => h.label).join(" → "),
    };
  },
};
