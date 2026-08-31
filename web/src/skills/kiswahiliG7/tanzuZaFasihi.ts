import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TUNGO_SIMULIZI = ["Hadithi za wanyama", "Nyimbo za jadi", "Methali", "Vitendawili", "Nahau"];
const TUNGO_ANDISHI = ["Riwaya", "Novela", "Tamthilia iliyoandikwa", "Shairi lililochapishwa"];

const SIFA: { utanzu: "Fasihi Simulizi" | "Fasihi Andishi"; maelezo: string }[] = [
  { utanzu: "Fasihi Simulizi", maelezo: "Hupitishwa kwa mdomo kutoka kizazi kimoja hadi kingine" },
  { utanzu: "Fasihi Simulizi", maelezo: "Mara nyingi haina mwandishi mahususi anayejulikana" },
  { utanzu: "Fasihi Simulizi", maelezo: "Huweza kubadilika kidogo kila inapowasilishwa na msimulizi tofauti" },
  { utanzu: "Fasihi Andishi", maelezo: "Imeandikwa na kuchapishwa katika kitabu au gazeti" },
  { utanzu: "Fasihi Andishi", maelezo: "Ina mwandishi anayejulikana ambaye jina lake huambatanishwa na kazi" },
  { utanzu: "Fasihi Andishi", maelezo: "Maandishi yake hayabadiliki kila mtu anaposoma nakala hiyo hiyo" },
];

const ISTILAHI: { neno: string; maelezo: string }[] = [
  { neno: "Fasihi", maelezo: "Sanaa ya lugha inayotumiwa kueleza tajriba na maadili ya jamii kwa njia ya kisanaa" },
  { neno: "Fasihi Simulizi", maelezo: "Utanzu wa fasihi unaowasilishwa kwa mdomo na kupitishwa kutoka kizazi hadi kizazi" },
  { neno: "Fasihi Andishi", maelezo: "Utanzu wa fasihi ulioandikwa na kuchapishwa katika kitabu au gazeti" },
  { neno: "Utanzu", maelezo: "Kundi kuu la kazi za fasihi zenye sifa zinazofanana" },
];

const MAANA_FASIHI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Fasihi ni nini kwa ujumla katika jamii?",
    sahihi: "Sanaa ya lugha inayotumiwa kueleza tajriba, hisia, na maadili ya jamii kwa njia ya kisanaa",
    makosa: [
      "Orodha ya sheria za kisarufi zinazopaswa kufuatwa shuleni",
      "Aina ya hesabu inayotumika kupima umbali kati ya maeneo",
      "Njia ya kutuma barua pepe kwa haraka",
    ],
  },
  {
    swali: "Ni ipi kati ya hizi ni sifa ya msingi inayotofautisha fasihi andishi na fasihi simulizi?",
    sahihi: "Fasihi andishi huwa na maandishi ya kudumu yasiyobadilika, ilhali fasihi simulizi hubadilika kila inapowasilishwa",
    makosa: [
      "Fasihi andishi pekee ndiyo inayohusisha maadili ya jamii",
      "Fasihi simulizi pekee ndiyo inayotumia lugha ya Kiswahili",
      "Fasihi andishi haihitaji mwandishi yeyote",
    ],
  },
];

const PENGO_SIFA = [
  {
    before: "Fasihi simulizi mara nyingi huwasilishwa mbele ya",
    after: " inayoshiriki kwa kuitikia au kucheka.",
    sahihi: "hadhira",
  },
  {
    before: "Kabla ya kusomwa na wengi, kazi ya fasihi andishi huhitaji",
    after: " katika kitabu au gazeti.",
    sahihi: "kuchapishwa",
  },
  { before: "Kila riwaya au novela huwa na", after: " anayejulikana kwa jina.", sahihi: "mwandishi" },
];

const HATUA_UWASILISHAJI = [
  { id: "chagua", label: "Kuchagua hadithi au utungo unaofaa hadhira lengwa" },
  { id: "jiandae", label: "Kujiandaa kwa kuzoea mtiririko wa masimulizi" },
  { id: "wasilisha", label: "Kuwasilisha kwa sauti, ishara, na kiimbo kinachofaa" },
  { id: "shirikisha", label: "Kushirikisha hadhira kwa kuwauliza maswali au kuwaitisha kuitikia" },
  { id: "maoni", label: "Kupokea maoni ya hadhira baada ya uwasilishaji" },
];

export const tanzuZaFasihi: Skill = {
  id: "g7-ksw-kz-tanzu-za-fasihi",
  code: "KZ.3",
  subjectId: "kiswahili",
  strandId: "g7-ksw-kz",
  grade: 7,
  title: "Tanzu za Fasihi: Simulizi na Andishi",
  description: "Tambua maana ya fasihi na utofautishe kati ya fasihi simulizi na fasihi andishi kwa sifa na mifano yake.",
  generate(rng) {
    const branch = randChoice(rng, ["panga-tungo", "panga-sifa", "oanisha-istilahi", "maana-fasihi", "pengo-sifa", "hatua-uwasilishaji"] as const);

    if (branch === "panga-tungo") {
      const simulizi = shuffle(rng, TUNGO_SIMULIZI).slice(0, 3);
      const andishi = shuffle(rng, TUNGO_ANDISHI).slice(0, 3);
      const items = shuffle(rng, [
        ...simulizi.map((t) => ({ id: t, label: t, bucket: "Fasihi Simulizi" })),
        ...andishi.map((t) => ({ id: t, label: t, bucket: "Fasihi Andishi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila tungo katika kundi la Fasihi Simulizi au Fasihi Andishi.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Fasihi Simulizi", label: "Fasihi Simulizi" },
          { id: "Fasihi Andishi", label: "Fasihi Andishi" },
        ],
        correctBucket,
        hint: "Jiulize: je, tungo hii huwasilishwa kwa mdomo pekee, au huandikwa na kuchapishwa?",
        explanation: `Fasihi Simulizi: ${simulizi.join(", ")}. Fasihi Andishi: ${andishi.join(", ")}.`,
      };
    }

    if (branch === "panga-sifa") {
      const chosen = shuffle(rng, SIFA).slice(0, 5);
      const items = chosen.map((s, i) => ({ id: `sifa${i}`, label: s.maelezo, bucket: s.utanzu }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila sifa katika utanzu wa fasihi unaohusika.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Fasihi Simulizi", label: "Fasihi Simulizi" },
          { id: "Fasihi Andishi", label: "Fasihi Andishi" },
        ],
        correctBucket,
        hint: "Zingatia kama sifa hiyo inahusu jinsi kazi inavyowasilishwa au jinsi inavyohifadhiwa.",
        explanation: chosen.map((s) => `"${s.maelezo}" ni sifa ya ${s.utanzu}.`).join(" "),
      };
    }

    if (branch === "oanisha-istilahi") {
      const tokens = shuffle(rng, ISTILAHI.map((s) => ({ id: s.neno, label: s.neno })));
      const targets = shuffle(rng, ISTILAHI.map((s) => ({ id: s.neno, label: s.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const s of ISTILAHI) correctMap[s.neno] = s.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya fasihi na maelezo yake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria tofauti kati ya fasihi kwa ujumla, tanzu zake mbili kuu, na dhana ya utanzu.",
        explanation: ISTILAHI.map((s) => `"${s.neno}" — ${s.maelezo}.`).join(" "),
      };
    }

    if (branch === "maana-fasihi") {
      const entry = randChoice(rng, MAANA_FASIHI);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Fikiria dhima ya fasihi katika kuhifadhi na kuwasilisha maadili na tajriba za jamii.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    if (branch === "pengo-sifa") {
      const entry = randChoice(rng, PENGO_SIFA);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Soma sentensi nzima ili kujua ni neno gani linalofaa pengoni.",
        explanation: `Sentensi kamili ni: "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const items = shuffle(rng, HATUA_UWASILISHAJI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kuwasilisha utungo wa fasihi simulizi mbele ya hadhira kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
      items,
      correctOrder: HATUA_UWASILISHAJI.map((h) => h.id),
      hint: "Anza kwa kuchagua na kujiandaa, kisha wasilisha, na hatimaye pokea maoni.",
      explanation: HATUA_UWASILISHAJI.map((h) => h.label).join(" → "),
    };
  },
};
