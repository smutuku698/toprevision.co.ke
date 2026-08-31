import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HABARI = [
  {
    passage:
      "Mfanyabiashara wa Soko la Marikiti alieleza wateja wake kwamba bei ya nyanya imepanda kwa sababu ya ukame uliopunguza mavuno. Alisisitiza kuwa bei itashuka mvua ikianza kunyesha.",
    hojaKuu: "Bei ya nyanya imepanda kwa sababu ya ukame uliopunguza mavuno",
    maelezoMadogo: "Bei ya nyanya itashuka mvua ikianza kunyesha",
  },
  {
    passage:
      "Kocha wa timu ya mpira wa miguu ya shule aliwaeleza wanafunzi kuwa mazoezi yataongezwa hadi mara nne kwa wiki ili kujiandaa na mashindano ya kaunti. Aliwakumbusha pia kuvaa viatu vinavyofaa uwanjani.",
    hojaKuu: "Mazoezi ya mpira yataongezwa hadi mara nne kwa wiki kwa ajili ya mashindano ya kaunti",
    maelezoMadogo: "Wanafunzi wakumbushwe kuvaa viatu vinavyofaa uwanjani",
  },
  {
    passage:
      "Muuguzi wa zahanati ya Kitui aliwaambia wanakijiji kuwa unawaji mikono kwa sabuni kabla ya kula husaidia kuzuia magonjwa ya tumbo. Aliongeza kuwa maji safi pekee hayatoshi bila sabuni.",
    hojaKuu: "Kunawa mikono kwa sabuni kabla ya kula huzuia magonjwa ya tumbo",
    maelezoMadogo: "Maji safi pekee hayatoshi bila sabuni",
  },
];

const PENGO_UMUHIMU = [
  {
    before: "Kusikiliza kwa makini humwezesha mtu ku",
    after: " ujumbe muhimu bila kuchanganya na maelezo madogo yasiyo ya lazima.",
    sahihi: "tambua",
  },
  {
    before: "Ili kuwasilisha hoja muhimu kwa ufasaha, ni vyema kuzieleza kwa maneno",
    after: " badala ya kunakili kila neno alilosema mzungumzaji.",
    sahihi: "machache",
  },
];

const HATUA_USIKILIZAJI = [
  { id: "tulia", label: "Kutulia na kuepuka usumbufu unaoweza kuvuruga mawazo" },
  { id: "sikiliza-yote", label: "Kusikiliza taarifa yote bila kukatiza mzungumzaji" },
  { id: "tenga", label: "Kutenganisha hoja kuu na maelezo madogo yanayoiunga mkono" },
  { id: "andika", label: "Kuandika kwa ufupi hoja kuu ulizozitambua" },
  { id: "wasilisha", label: "Kuwasilisha hoja hizo kwa maneno machache mwenyewe" },
];

export const kusikilizaKwaMakini: Skill = {
  id: "g7-ksw-kz-kusikiliza-kwa-makini",
  code: "KZ.7",
  subjectId: "kiswahili",
  strandId: "g7-ksw-kz",
  grade: 7,
  title: "Kusikiliza kwa Makini",
  description: "Tambua hoja muhimu katika habari unayosikiliza na uwasilishe hoja hizo kwa maneno machache.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-hoja", "oanisha-hoja", "hoja-vs-maelezo", "pengo-umuhimu", "hatua-usikilizaji"] as const);

    if (branch === "tambua-hoja") {
      const entry = randChoice(rng, HABARI);
      const choices = shuffle(rng, [entry.hojaKuu, entry.maelezoMadogo]);
      return {
        kind: "multiple-choice",
        passage: entry.passage,
        prompt: "Ni ipi kati ya hizi ni hoja muhimu (kuu) katika habari hii?",
        choices,
        correctIndex: choices.indexOf(entry.hojaKuu),
        layout: "list",
        hint: "Hoja kuu ndiyo taarifa ambayo mzungumzaji anataka isikike kwanza; maelezo madogo huiunga mkono tu.",
        explanation: `Hoja muhimu ni: "${entry.hojaKuu}". "${entry.maelezoMadogo}" ni maelezo madogo tu.`,
      };
    }

    if (branch === "oanisha-hoja") {
      const chosen = shuffle(rng, HABARI).slice(0, 3);
      const tokens = shuffle(rng, chosen.map((h, i) => ({ id: `p${i}`, label: h.passage })));
      const targets = shuffle(rng, chosen.map((h, i) => ({ id: `p${i}`, label: h.hojaKuu })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => {
        correctMap[`p${i}`] = `p${i}`;
      });
      return {
        kind: "click-match",
        prompt: "Oanisha kila habari na hoja yake muhimu.",
        tokens,
        targets,
        correctMap,
        hint: "Soma habari kila moja na utafute sentensi ya kwanza inayotoa taarifa kuu.",
        explanation: chosen.map((h) => `Hoja muhimu ya "${h.passage.slice(0, 40)}..." ni "${h.hojaKuu}".`).join(" "),
      };
    }

    if (branch === "hoja-vs-maelezo") {
      const items = HABARI.flatMap((h, i) => [
        { id: `hk${i}`, label: h.hojaKuu, bucket: "Hoja Kuu" },
        { id: `mm${i}`, label: h.maelezoMadogo, bucket: "Maelezo Madogo" },
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kauli katika kundi la Hoja Kuu au Maelezo Madogo.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Hoja Kuu", label: "Hoja Kuu" },
          { id: "Maelezo Madogo", label: "Maelezo Madogo" },
        ],
        correctBucket,
        hint: "Hoja kuu ndiyo taarifa muhimu zaidi; maelezo madogo ni ziada inayoiunga mkono.",
        explanation: HABARI.map((h) => `Hoja kuu: "${h.hojaKuu}". Maelezo madogo: "${h.maelezoMadogo}".`).join(" "),
      };
    }

    if (branch === "pengo-umuhimu") {
      const entry = randChoice(rng, PENGO_UMUHIMU);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Fikiria umuhimu wa kusikiliza kwa makini katika mawasiliano.",
        explanation: `Sentensi kamili ni: "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const items = shuffle(rng, HATUA_USIKILIZAJI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kusikiliza kwa makini na kutambua hoja muhimu kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
      items,
      correctOrder: HATUA_USIKILIZAJI.map((h) => h.id),
      hint: "Anza kwa kutulia na kusikiliza yote, kisha tenga hoja kuu, na hatimaye wasilishe kwa maneno machache.",
      explanation: HATUA_USIKILIZAJI.map((h) => h.label).join(" → "),
    };
  },
};
