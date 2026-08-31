import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ISTILAHI: { neno: string; maana: string }[] = [
  { neno: "Tamthilia", maana: "Kazi ya kifasihi iliyoandikwa kwa njia ya mazungumzo ili ionyeshwe jukwaani au isomwe kama maandishi" },
  { neno: "Jukwaa", maana: "Mahali maalum ambapo tamthilia huigizwa mbele ya hadhira" },
  { neno: "Maelekezo ya Jukwaani", maana: "Maagizo yaliyoandikwa na mtunzi kuonyesha jinsi wahusika wanavyopaswa kutenda au kusogea jukwaani" },
  { neno: "Dayalojia", maana: "Maongezi baina ya wahusika wawili au zaidi yanayosukuma hadithi mbele" },
  { neno: "Onyesho", maana: "Sehemu kuu ya tamthilia inayogawanya matukio kulingana na mahali au wakati" },
];

const SIFA: { label: string; tamthilia: boolean }[] = [
  { label: "Imeandikwa hasa kwa njia ya mazungumzo ya wahusika", tamthilia: true },
  { label: "Ina maelekezo ya jukwaani kuongoza waigizaji", tamthilia: true },
  { label: "Hukusudiwa hasa kuigizwa mbele ya hadhira jukwaani", tamthilia: true },
  { label: "Mwandishi husimulia hadithi kwa masimulizi ya nafsi ya tatu", tamthilia: false },
  { label: "Huwa na maelezo marefu ya mawazo ya ndani ya mhusika badala ya mazungumzo pekee", tamthilia: false },
  { label: "Kwa kawaida husomwa peke yake bila kuigizwa", tamthilia: false },
];

const MUUNDO = [
  { id: "m1", label: "Mtunzi huanzisha wahusika na mandhari kupitia maelekezo ya jukwaani" },
  { id: "m2", label: "Wahusika huanza mazungumzo yanayoonyesha mgogoro unaojitokeza" },
  { id: "m3", label: "Mgogoro huongezeka kadri visa vinavyoendelea katika maonyesho tofauti" },
  { id: "m4", label: "Tamthilia humalizika kwa azimio la mgogoro huo" },
];

const DONDOO = "ONYESHO LA KWANZA\n(Ndani ya zizi la ng'ombe. MZEE KAMAU anasimama akitazama ng'ombe wake aliyekonda.)\nMZEE KAMAU: (kwa huzuni) Ng'ombe huyu amedhoofika kwa wiki tatu sasa. Sina uhakika kama ana ugonjwa au njaa tu.\nJUMA (mwanawe, akiingia haraka): Baba, daktari wa mifugo amefika lango kuu!\nMZEE KAMAU (akitulia kidogo): Alhamdulillahi. Mwite haraka kabla hali haijazidi kuwa mbaya.";

interface Swali {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
  passage?: string;
}

const MASWALI: Swali[] = [
  {
    prompt: "Tamthilia ni nini?",
    correct: "Kazi ya kifasihi iliyoandikwa kwa njia ya mazungumzo ili ionyeshwe jukwaani",
    distractors: ["Shairi lenye mishororo minne", "Hadithi fupi isiyokuwa na wahusika wowote", "Kitabu cha kumbukumbu za historia"],
    explanation: "Tamthilia hutofautiana na tanzu nyingine kwa kuwa imeandikwa hasa kwa njia ya mazungumzo yanayokusudiwa kuigizwa jukwaani.",
  },
  {
    prompt: "Ni kipengele gani hasa hupambanua tamthilia na tanzu nyingine za fasihi andishi?",
    correct: "Matumizi makubwa ya mazungumzo na maelekezo ya jukwaani",
    distractors: ["Matumizi ya mishororo na vina", "Kutokuwa na wahusika wowote", "Kuandikwa kwa lugha ya kigeni pekee"],
    explanation: "Tamthilia hujengwa hasa kwa dayalojia baina ya wahusika, ikiongozwa na maelekezo ya jukwaani, tofauti na riwaya au ushairi.",
  },
  {
    prompt: "Kwa nini maelekezo ya jukwaani ni muhimu katika tamthilia?",
    correct: "Huwaongoza waigizaji jinsi ya kutenda na kusogea jukwaani",
    distractors: ["Husomwa na hadhira kama sehemu ya mazungumzo ya wahusika", "Hayana umuhimu wowote kwa mwigizaji", "Hutumika kubadilisha jina la mhusika"],
    explanation: "Maelekezo ya jukwaani (yanayoandikwa kwenye mabano) humwelekeza mwigizaji hisia, mwendo, na matendo yanayofaa wakati wa onyesho.",
  },
  {
    prompt: "Ni sehemu zipi za dondoo hili zinaonyesha wazi kuwa ni tamthilia na si hadithi ya kawaida?",
    correct: "Maelekezo ya jukwaani yaliyowekwa kwenye mabano na majina ya wahusika kabla ya mazungumzo yao",
    distractors: ["Kutokuwepo kwa wahusika wowote", "Maelezo marefu ya nafsi ya tatu bila mazungumzo", "Matumizi ya beti na mishororo"],
    explanation: "Dondoo hili lina jina la onyesho, maelekezo ya jukwaani kwenye mabano, na majina ya wahusika kabla ya kila mazungumzo — vipengele vya kipekee vya tamthilia.",
    passage: DONDOO,
  },
];

export const kusomaKinaTamthilia: Skill = {
  id: "g8-ksw-ks-tamthilia",
  code: "KS.3",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ks",
  grade: 8,
  title: "Kusoma kwa Kina: Tamthilia",
  description: "Elewa maana ya tamthilia, sifa zake kama utanzu wa fasihi andishi, na jinsi inavyotofautiana na tanzu nyingine.",
  generate(rng) {
    const branch = randChoice(rng, ["istilahi", "sifa", "muundo", "swali"] as const);
    const hint = "Fikiria vipengele vinavyofanya tamthilia iwe tofauti na hadithi au shairi la kawaida.";

    if (branch === "istilahi") {
      const tokens = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of ISTILAHI) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya tamthilia na maana yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ISTILAHI.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "sifa") {
      const items = SIFA.map((s, i) => ({ id: `s${i}`, label: s.label, b: s.tamthilia ? "tamthilia" : "nyingine" }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        prompt: "Panga kila sifa: je, ni sifa ya tamthilia au ya riwaya/hadithi fupi?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "tamthilia", label: "Sifa ya Tamthilia" },
          { id: "nyingine", label: "Sifa ya Riwaya/Hadithi Fupi" },
        ],
        correctBucket,
        hint,
        explanation: SIFA.map((s) => `"${s.label}" ni sifa ya ${s.tamthilia ? "tamthilia" : "riwaya/hadithi fupi"}.`).join(" "),
      };
    }

    if (branch === "muundo") {
      const items = shuffle(rng, MUUNDO);
      return {
        kind: "ordering",
        prompt: "Panga hatua zifuatazo za kawaida katika ukuzi wa tamthilia kwa mfuatano sahihi.",
        instruction: "Bofya hatua kwa mfuatano.",
        items,
        correctOrder: MUUNDO.map((m) => m.id),
        hint: "Tamthilia huanza kwa kuanzisha wahusika, kisha mgogoro hujitokeza na kuongezeka, na hatimaye kumalizika kwa azimio.",
        explanation: MUUNDO.map((m) => m.label).join(" → "),
      };
    }

    const swali = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [swali.correct, ...swali.distractors]);
    return {
      kind: "multiple-choice",
      passage: swali.passage,
      prompt: swali.prompt,
      choices,
      correctIndex: choices.indexOf(swali.correct),
      layout: "list",
      hint,
      explanation: swali.explanation,
    };
  },
};
