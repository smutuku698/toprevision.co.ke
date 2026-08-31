import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.5 Kusoma kwa Ufahamu — Ushairi (Kukabiliana na Umaskini). Vipengele:
// vina, mizani, ubeti, mshororo, ujumbe. Ona curriculum-reference/grade-5/kiswahili.json.

const TERMS: { neno: string; maana: string }[] = [
  { neno: "vina", maana: "mwisho wa mistari ya shairi unaofanana kimatamshi" },
  { neno: "mizani", maana: "idadi ya silabi (mapigo ya sauti) katika kila mstari wa shairi" },
  { neno: "ubeti", maana: "kikundi cha mistari kinachounda sehemu moja ya shairi" },
  { neno: "mshororo", maana: "mstari mmoja wa shairi" },
  { neno: "ujumbe", maana: "fundisho au maana kuu inayowasilishwa na shairi" },
];

const VINA_JOZI: { id: string; mstariA: string; mstariB: string; vina: boolean }[] = [
  { id: "v1", mstariA: "Umaskini waumiza jamii yetu,", mstariB: "Twahitaji mikono yote kuusaidia wetu,", vina: true },
  { id: "v2", mstariA: "Njaa na dhiki ni mzigo mkubwa kwetu,", mstariB: "Elimu ndiyo njia ya kutokomeza kwetu,", vina: true },
  { id: "v3", mstariA: "Watoto wengi hawaendi shuleni kwetu,", mstariB: "Kwa sababu ya umaskini uliokithiri kwetu,", vina: true },
  { id: "v4", mstariA: "Serikali na wananchi washirikiane pamoja,", mstariB: "Kuondoa umaskini ni kazi ya kila mmoja,", vina: true },
  { id: "h1", mstariA: "Umaskini ni changamoto kubwa nchini,", mstariB: "Tunahitaji mipango bora ya kiuchumi.", vina: false },
  { id: "h2", mstariA: "Watu wengi wanaishi kwa shida kila siku,", mstariB: "Elimu na kazi ni ufumbuzi wa tatizo hili.", vina: false },
  { id: "h3", mstariA: "Jamii inapaswa kushirikiana kupambana na umaskini,", mstariB: "Maendeleo huja kwa bidii na uvumilivu.", vina: false },
  { id: "h4", mstariA: "Kila mtu ana wajibu wa kusaidia wenzake,", mstariB: "Mabadiliko chanya huanzia kwa mtu mmoja.", vina: false },
];

const VINA_KAMILISHA: { mstariwaKwanza: string; before: string; after: string; neno: string; mwishoA: string }[] = [
  { mstariwaKwanza: "Umaskini waumiza jamii yetu,", before: "Twahitaji mikono yote kuusaidia", after: ".", neno: "wetu", mwishoA: "yetu" },
  { mstariwaKwanza: "Njaa na dhiki ni mzigo mkubwa kwetu,", before: "Elimu ndiyo njia ya kutokomeza", after: ".", neno: "kwetu", mwishoA: "kwetu" },
  { mstariwaKwanza: "Watoto wengi hawaendi shuleni kwetu,", before: "Kwa sababu ya umaskini uliokithiri", after: ".", neno: "kwetu", mwishoA: "kwetu" },
  { mstariwaKwanza: "Serikali na wananchi washirikiane pamoja,", before: "Kuondoa umaskini ni kazi ya kila", after: ".", neno: "mmoja", mwishoA: "pamoja" },
];

const MASHAIRI: string[][] = [
  [
    "Umaskini ni tatizo linalotukabili sote,",
    "Twahitaji mikakati ya kuutokomeza mapema,",
    "Elimu na kazi ni njia bora za kujikwamua,",
    "Tushirikiane wote kujenga taifa lenye neema.",
  ],
  [
    "Njaa na ukosefu wa mavazi ni dalili za umaskini,",
    "Watoto wengi hukosa nafasi ya kusoma shuleni,",
    "Jamii ikiungana mkono kusaidiana kwa dhati,",
    "Umaskini utaondoka na maisha yatakuwa mazuri kweli.",
  ],
];

export const kusomaKwaUfahamuUshairi: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-ufahamu-ushairi",
  code: "KS.5",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Ufahamu — Ushairi (Kukabiliana na Umaskini)",
  description: "Tambua vina na mizani katika shairi kuhusu kukabiliana na umaskini, na usome shairi ukizingatia ujumbe wake.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-vina", "oanisha-istilahi", "panga-vina", "kamilisha-vina", "panga-shairi"] as const);

    if (branch === "tambua-vina") {
      const p = randChoice(rng, VINA_JOZI);
      const choices = shuffle(rng, ["Ndiyo, ina vina", "La, haina vina"]);
      const jibu = p.vina ? "Ndiyo, ina vina" : "La, haina vina";
      return {
        kind: "multiple-choice",
        prompt: tambuaPrompt(rng, "kama mistari hii miwili ina vina (mwisho unaofanana kimatamshi) au la"),
        passage: `${p.mstariA}\n${p.mstariB}`,
        choices,
        correctIndex: choices.indexOf(jibu),
        layout: "row",
        hint: "Sikiliza mwisho wa kila mstari — je, unafanana kimatamshi?",
        explanation: p.vina
          ? `Mistari hii ina vina kwa sababu inaishia kwa sauti inayofanana.`
          : `Mistari hii haina vina kwa sababu inaishia kwa sauti tofauti.`,
      };
    }

    if (branch === "oanisha-istilahi") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = chosen.map((t) => ({ id: t.neno, label: t.neno }));
      const targets = shuffle(rng, chosen).map((t) => ({ id: t.neno, label: t.maana }));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.neno] = t.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "istilahi ya ushairi na maana yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Fikiria kila istilahi inahusu sehemu gani ya shairi.",
        explanation: chosen.map((t) => `"${t.neno}" ni ${t.maana}.`).join(" "),
      };
    }

    if (branch === "panga-vina") {
      const chosen = shuffle(rng, VINA_JOZI).slice(0, 6);
      const items = chosen.map((p) => ({ id: p.id, label: `"${p.mstariA}" / "${p.mstariB}"` }));
      const correctBucket: Record<string, string> = {};
      for (const p of chosen) correctBucket[p.id] = p.vina ? "zina" : "hazina";
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama jozi ya mistari ina vina au haina vina"),
        items: shuffle(rng, items),
        buckets: [
          { id: "zina", label: "Zina Vina" },
          { id: "hazina", label: "Hazina Vina" },
        ],
        correctBucket,
        hint: "Angalia mwisho wa kila mstari kwenye jozi.",
        explanation: chosen.map((p) => `"${p.mstariA}" na "${p.mstariB}" ${p.vina ? "zina vina" : "hazina vina"}.`).join(" "),
      };
    }

    if (branch === "kamilisha-vina") {
      const v = randChoice(rng, VINA_KAMILISHA);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        passage: v.mstariwaKwanza,
        before: v.before,
        after: v.after,
        correctAnswer: v.neno,
        inputMode: "text",
        hint: `Mstari huu unapaswa kuwa na vina yanayofanana na "${v.mwishoA}".`,
        explanation: `Mstari kamili: "${v.before} ${v.neno}${v.after}" — vina yake yanafanana na mstari wa kwanza.`,
      };
    }

    const shairi = randChoice(rng, MASHAIRI);
    const items = shairi.map((m, i) => ({ id: `${i}-mstari`, label: m }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "mistari hii ya shairi kuhusu umaskini kwa mpangilio sahihi"),
      instruction: "Bofya mistari kwa mpangilio sahihi wa shairi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria ni mstari upi unaofaa kuanza ujumbe wa shairi.",
      explanation: `Mpangilio sahihi wa shairi: ${shairi.join(" ")}`,
    };
  },
};
