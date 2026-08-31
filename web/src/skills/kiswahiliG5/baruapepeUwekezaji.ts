import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Baruapepe (Uwekezaji)" — kuandika baruapepe
// kwa rafiki, mzazi, mwalimu na kuituma; sehemu 7 za baruapepe zikitumika kwa mada ya uwekezaji (kuweka
// akiba ya pesa za mfukoni). Ona curriculum-reference/grade-5/kiswahili.json.

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
  mtajo: "salamu ya kuanzisha baruapepe kwa heshima",
  mwili: "sehemu inayoelezea kwa kina mpango wa uwekezaji au ujumbe wenyewe",
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
  { sentensi: "efrata12@shuleileo.co.ke", kipengele: "anwanipepe-mtumaji" },
  { sentensi: "gideon.m@barua.com", kipengele: "anwanipepe-mtumaji" },
  { sentensi: "mama.efrata@barua.com", kipengele: "anwanipepe-mpokeaji" },
  { sentensi: "baba.gideon@barua.com", kipengele: "anwanipepe-mpokeaji" },
  { sentensi: "YAH: MPANGO WANGU WA KUWEKEZA PESA ZA KIFUNGUA KINYWA", kipengele: "mada" },
  { sentensi: "YAH: KUWEKA AKIBA KWA MALENGO YANGU", kipengele: "mada" },
  { sentensi: "Mpendwa Mama,", kipengele: "mtajo" },
  { sentensi: "Mpendwa Baba,", kipengele: "mtajo" },
  { sentensi: "Ningependa kukueleza mpango wangu wa kuweka akiba ya pesa ninazopewa kila wiki.", kipengele: "mwili" },
  { sentensi: "Nimeamua kuwekeza sehemu ya pesa zangu za zawadi katika akaunti ya benki ya watoto.", kipengele: "mwili" },
  { sentensi: "Ninaomba unisaidie kufungua akaunti ya akiba shuleni.", kipengele: "mwili" },
  { sentensi: "Nimejifunza shuleni kuwa kuwekeza mapema husaidia kufikia malengo makubwa baadaye.", kipengele: "mwili" },
  { sentensi: "Wako mpendwa,", kipengele: "hitimisho" },
  { sentensi: "Wako katika upendo,", kipengele: "hitimisho" },
  { sentensi: "Efrata Wanjiru", kipengele: "jina-la-mwandishi" },
  { sentensi: "Gideon Kiptoo", kipengele: "jina-la-mwandishi" },
];

type Mpokeaji = "rafiki" | "mzazi" | "mwalimu";

const MPOKEAJI_JINA: Record<Mpokeaji, string> = { rafiki: "Rafiki", mzazi: "Mzazi", mwalimu: "Mwalimu" };

const MPOKEAJI_MAELEZO: Record<Mpokeaji, string> = {
  rafiki: "salamu ya kirafiki, isiyo rasmi sana, inayofaa mtu wa rika lako",
  mzazi: "salamu ya heshima na upendo, inayofaa mzazi wako",
  mwalimu: "salamu rasmi ya heshima, inayofaa mwalimu wako",
};

const MPOKEAJI_MFANO: { mpokeaji: Mpokeaji; mtajo: string }[] = [
  { mpokeaji: "rafiki", mtajo: "Habari yako Chiku," },
  { mpokeaji: "rafiki", mtajo: "Vipi Baraka," },
  { mpokeaji: "mzazi", mtajo: "Mpendwa Mama," },
  { mpokeaji: "mzazi", mtajo: "Mpendwa Baba," },
  { mpokeaji: "mwalimu", mtajo: "Ndugu Mwalimu," },
  { mpokeaji: "mwalimu", mtajo: "Mpendwa Mwalimu Daudi," },
];

export const baruapepeUwekezaji: Skill = {
  id: "g5-ksw-ka-baruapepe-uwekezaji",
  code: "KA.11",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Baruapepe (Uwekezaji)",
  description: "Tambua sehemu za baruapepe kuhusu uwekezaji na uandike baruapepe kwa ujumbe, muundo na mtindo ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kipengele", "oanisha-mpokeaji", "panga-kipengele", "jaza-mpango", "panga-mpangilio"] as const);

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

    if (branch === "oanisha-mpokeaji") {
      const wote: Mpokeaji[] = ["rafiki", "mzazi", "mwalimu"];
      const chosenPairs = wote.map((p) => randChoice(rng, MPOKEAJI_MFANO.filter((x) => x.mpokeaji === p)));
      const tokens = wote.map((p) => ({ id: p, label: MPOKEAJI_JINA[p] }));
      const targets = shuffle(rng, chosenPairs).map((c) => ({ id: c.mpokeaji, label: `"${c.mtajo}" — ${MPOKEAJI_MAELEZO[c.mpokeaji]}` }));
      const correctMap: Record<string, string> = {};
      for (const p of wote) correctMap[p] = p;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "mpokeaji wa baruapepe na mtajo/salamu inayomfaa"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kiwango cha heshima kinachofaa kila mpokeaji: rafiki, mzazi au mwalimu.",
        explanation: chosenPairs.map((c) => `${MPOKEAJI_JINA[c.mpokeaji]}: "${c.mtajo}" — ${MPOKEAJI_MAELEZO[c.mpokeaji]}.`).join(" "),
      };
    }

    if (branch === "panga-kipengele") {
      const chosen = shuffle(rng, MIFANO).slice(0, 6);
      const items = chosen.map((m, i) => ({ id: `${i}-${m.sentensi}`, label: m.sentensi, bucket: m.kipengele }));
      const buckets = Array.from(new Set(chosen.map((c) => c.kipengele))).map((k) => ({ id: k, label: KIPENGELE_JINA[k] }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "sehemu ya baruapepe ya uwekezaji inayolingana na mstari huu"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets,
        correctBucket,
        hint: "Fikiria ni sehemu gani ya baruapepe ambapo maandishi haya yangeonekana.",
        explanation: chosen.map((m) => `"${m.sentensi}" ni sehemu ya ${KIPENGELE_JINA[m.kipengele]}.`).join(" "),
      };
    }

    if (branch === "jaza-mpango") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika baruapepe kwa mzazi wake kuhusu mpango wa kuweka "`, after: `" ya pesa za mfukoni.`, jibu: "akiba" },
        { before: `${j} anaomba mzazi wake amsaidie kufungua "`, after: `" ya benki kwa ajili ya akiba.`, jibu: "akaunti" },
        { before: `Katika baruapepe yake, ${j} anaeleza kuwa "`, after: `" mapema husaidia kufikia malengo makubwa.`, jibu: "kuwekeza" },
        { before: `Kabla ya mwili wa baruapepe, ${j} anaandika "`, after: `" inayoonyesha lengo la ujumbe.`, jibu: "mada" },
        { before: `${j} anafunga baruapepe yake kwa "`, after: `" kabla ya kuandika jina lake.`, jibu: "hitimisho" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria msamiati wa uwekezaji (akiba, akaunti, kuwekeza) na muundo wa baruapepe.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const items = MPANGILIO_WA_BARUAPEPE.map((k) => ({ id: k, label: KIPENGELE_JINA[k] }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "sehemu saba za baruapepe ya uwekezaji kutoka juu hadi chini"),
      instruction: "Bofya sehemu kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: MPANGILIO_WA_BARUAPEPE,
      hint: "Baruapepe huanza na anwani za barua pepe na kuishia na jina la mwandishi.",
      explanation: "Mpangilio sahihi: " + MPANGILIO_WA_BARUAPEPE.map((k) => KIPENGELE_JINA[k]).join(" → "),
    };
  },
};
