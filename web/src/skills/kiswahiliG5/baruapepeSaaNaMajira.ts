import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Baruapepe (Saa na Majira)" — sehemu 7 za
// baruapepe: anwanipepe ya mtumaji, anwanipepe ya mpokeaji, mada, mtajo, mwili, hitimisho, jina la
// mwandishi. Mfano wa mada: baruapepe kuhusu ratiba ya masomo/majira. Ona curriculum-reference/grade-5/kiswahili.json.

type Kipengele =
  | "anwanipepe-mtumaji"
  | "anwanipepe-mpokeaji"
  | "mada"
  | "mtajo"
  | "mwili"
  | "hitimisho"
  | "jina-la-mwandishi";

const KIPENGELE_JINA: Record<Kipengele, string> = {
  "anwanipepe-mtumaji": "Anwanipepe ya Mtumaji",
  "anwanipepe-mpokeaji": "Anwanipepe ya Mpokeaji",
  mada: "Mada",
  mtajo: "Mtajo",
  mwili: "Mwili",
  hitimisho: "Hitimisho",
  "jina-la-mwandishi": "Jina la Mwandishi",
};

const KIPENGELE_MAELEZO: Record<Kipengele, string> = {
  "anwanipepe-mtumaji": "anwani ya barua pepe ya mtu anayetuma ujumbe",
  "anwanipepe-mpokeaji": "anwani ya barua pepe ya mtu anayepokea ujumbe",
  mada: "kifungu kifupi kinachoonyesha lengo la baruapepe",
  mtajo: "salamu ya kuanzisha baruapepe kwa heshima, k.m. Mpendwa/Ndugu",
  mwili: "sehemu inayoelezea kwa kina ujumbe wa mwandishi",
  hitimisho: "maneno ya kufunga baruapepe kwa heshima kabla ya jina",
  "jina-la-mwandishi": "jina la mtu aliyeandika baruapepe, huja mwishoni kabisa",
};

const MPANGILIO_WA_BARUAPEPE: Kipengele[] = [
  "anwanipepe-mtumaji",
  "anwanipepe-mpokeaji",
  "mada",
  "mtajo",
  "mwili",
  "hitimisho",
  "jina-la-mwandishi",
];

const MIFANO: { sentensi: string; kipengele: Kipengele }[] = [
  { sentensi: "amina24@shuleileo.co.ke", kipengele: "anwanipepe-mtumaji" },
  { sentensi: "baraka.otieno@barua.com", kipengele: "anwanipepe-mtumaji" },
  { sentensi: "chiku.rafiki@barua.com", kipengele: "anwanipepe-mpokeaji" },
  { sentensi: "mwalimu.daudi@shule.ac.ke", kipengele: "anwanipepe-mpokeaji" },
  { sentensi: "YAH: RATIBA YA MASOMO MAJIRA HAYA", kipengele: "mada" },
  { sentensi: "YAH: MAJIRA YA MVUA NA MIPANGO YETU", kipengele: "mada" },
  { sentensi: "Mpendwa Chiku,", kipengele: "mtajo" },
  { sentensi: "Ndugu Daudi,", kipengele: "mtajo" },
  { sentensi: "Ninakuandikia ili kukujulisha kuwa saa za shule zimebadilika majira haya ya baridi.", kipengele: "mwili" },
  { sentensi: "Majira ya mvua yamefika, hivyo tutakutana saa tisa badala ya saa nane.", kipengele: "mwili" },
  { sentensi: "Ningependa kujua ni saa ngapi tutaanza mazoezi wakati wa likizo.", kipengele: "mwili" },
  { sentensi: "Kwa sasa ni majira ya kiangazi, hivyo tutakuwa na muda mrefu wa kucheza nje.", kipengele: "mwili" },
  { sentensi: "Wako katika urafiki,", kipengele: "hitimisho" },
  { sentensi: "Wako mtiifu,", kipengele: "hitimisho" },
  { sentensi: "Amina Hassan", kipengele: "jina-la-mwandishi" },
  { sentensi: "Baraka Otieno", kipengele: "jina-la-mwandishi" },
];

export const baruapepeSaaNaMajira: Skill = {
  id: "g5-ksw-ka-baruapepe-saa-na-majira",
  code: "KA.4",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Baruapepe (Saa na Majira)",
  description: "Tambua sehemu saba za baruapepe kuhusu saa na majira, kisha uandike baruapepe kwa muundo sahihi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kipengele", "oanisha-maelezo", "panga-mtajo-mwili-hitimisho", "jaza-sehemu", "panga-mpangilio"] as const);

    if (branch === "tambua-kipengele") {
      const m = randChoice(rng, MIFANO);
      const choices = shuffle(rng, MPANGILIO_WA_BARUAPEPE).slice(0, 4);
      if (!choices.includes(m.kipengele)) choices[0] = m.kipengele;
      const shuffledChoices = shuffle(rng, choices);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "sehemu ya baruapepe inayolingana na haya")} "${m.sentensi}"`,
        choices: shuffledChoices.map((c) => KIPENGELE_JINA[c]),
        correctIndex: shuffledChoices.indexOf(m.kipengele),
        layout: "list",
        hint: KIPENGELE_MAELEZO[m.kipengele],
        explanation: `Hii ni ${KIPENGELE_JINA[m.kipengele]} — ${KIPENGELE_MAELEZO[m.kipengele]}.`,
      };
    }

    if (branch === "oanisha-maelezo") {
      const chosen = shuffle(rng, MPANGILIO_WA_BARUAPEPE).slice(0, 6);
      const tokens = chosen.map((k) => ({ id: k, label: KIPENGELE_JINA[k] }));
      const targets = shuffle(rng, chosen).map((k) => ({ id: k, label: KIPENGELE_MAELEZO[k] }));
      const correctMap: Record<string, string> = {};
      for (const k of chosen) correctMap[k] = k;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "sehemu ya baruapepe na maelezo yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria mpangilio wa baruapepe kutoka juu hadi chini.",
        explanation: chosen.map((k) => `${KIPENGELE_JINA[k]}: ${KIPENGELE_MAELEZO[k]}.`).join(" "),
      };
    }

    if (branch === "panga-mtajo-mwili-hitimisho") {
      const kundi: Kipengele[] = ["mtajo", "mwili", "hitimisho"];
      const chosen = shuffle(
        rng,
        MIFANO.filter((m) => kundi.includes(m.kipengele))
      ).slice(0, 6);
      const items = chosen.map((m, i) => ({ id: `${i}-${m.sentensi}`, label: m.sentensi, bucket: m.kipengele }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo mstari huu wa baruapepe ni mtajo, mwili au hitimisho"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: kundi.map((k) => ({ id: k, label: KIPENGELE_JINA[k] })),
        correctBucket,
        hint: "Mtajo huanzisha, mwili una ujumbe wenyewe, hitimisho hufunga baruapepe.",
        explanation: chosen.map((m) => `"${m.sentensi}" ni sehemu ya ${KIPENGELE_JINA[m.kipengele]}.`).join(" "),
      };
    }

    if (branch === "jaza-sehemu") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika baruapepe. Kabla ya anwani ya mpokeaji, sehemu ya kwanza ni "`, after: `".`, jibu: "anwanipepe ya mtumaji" },
        { before: `Baada ya anwani mbili, ${j} anaandika "`, after: `" ili kuonyesha lengo la baruapepe.`, jibu: "mada" },
        { before: `Kabla ya mwili wa baruapepe, ${j} anaandika salamu inayoitwa "`, after: `".`, jibu: "mtajo" },
        { before: `Baada ya mwili wa baruapepe, ${j} anaandika "`, after: `" kabla ya jina lake.`, jibu: "hitimisho" },
        { before: `Sehemu ya mwisho kabisa ya baruapepe ya ${j} ni "`, after: `".`, jibu: "jina la mwandishi" },
        { before: `Sehemu inayoeleza ujumbe wenyewe kwa kina inaitwa "`, after: `".`, jibu: "mwili" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria mpangilio wa sehemu saba za baruapepe.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const items = MPANGILIO_WA_BARUAPEPE.map((k) => ({ id: k, label: KIPENGELE_JINA[k] }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "sehemu saba za baruapepe kutoka juu hadi chini"),
      instruction: "Bofya sehemu kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: MPANGILIO_WA_BARUAPEPE,
      hint: "Baruapepe huanza na anwani za barua pepe na kuishia na jina la mwandishi.",
      explanation: "Mpangilio sahihi: " + MPANGILIO_WA_BARUAPEPE.map((k) => KIPENGELE_JINA[k]).join(" → "),
    };
  },
};
