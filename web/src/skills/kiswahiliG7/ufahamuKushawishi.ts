import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Kifungu {
  text: string;
  thesis: string;
  thesisPotovu: string[];
  hoja: string[]; // in the order presented, "kwanza/pili/tatu"
  hojaPotovu: string; // one wrong reason to distinguish from "hoja"
  mahususiPrompt: string;
  mahususiCorrect: string;
  mahususiPotovu: string[];
  hojaZisizohusiana: string[]; // irrelevant statements not in the passage
  msamiati: { neno: string; maana: string }[];
  matumizi: { neno: string; before: string; after: string };
}

const VIFUNGU: Kifungu[] = [
  {
    text: "Shule zetu zinapaswa kuwataka wanafunzi wote wanaoshiriki michezo kuvaa sare rasmi za timu wakati wa mashindano. Kwanza, sare za pamoja huimarisha umoja na kiburi cha timu, kwani wachezaji hujihisi ni sehemu ya kikundi kimoja badala ya watu binafsi. Pili, sare rasmi huwasaidia waamuzi na watazamaji kutofautisha timu mbili kwa urahisi wakati wa mchezo, hali inayopunguza mkanganyiko uwanjani. Tatu, kuvaa sare rasmi huonyesha nidhamu na taaluma ya shule mbele ya wageni na shule pinzani. Ni dhahiri kuwa uwekezaji mdogo katika sare za michezo huleta faida kubwa kwa sifa na mafanikio ya shule. Kwa hivyo, kila shule inapaswa kuhakikisha timu zake zina sare rasmi kabla ya msimu wa mashindano kuanza.",
    thesis: "Kila shule inapaswa kuhakikisha timu zake zina sare rasmi za michezo",
    thesisPotovu: [
      "Sare za michezo hazina umuhimu wowote kwa shule",
      "Waamuzi peke yao ndio wanaopaswa kuvaa sare rasmi",
      "Shule zinapaswa kuacha kabisa kushiriki mashindano ya michezo",
    ],
    hoja: [
      "Sare za pamoja huimarisha umoja na kiburi cha timu",
      "Sare rasmi husaidia waamuzi na watazamaji kutofautisha timu kwa urahisi",
      "Kuvaa sare rasmi huonyesha nidhamu na taaluma ya shule",
    ],
    hojaPotovu: "Sare rasmi huwafanya wachezaji wakimbie kwa kasi zaidi uwanjani",
    mahususiPrompt: "Kulingana na kifungu, sababu mojawapo ya kuvaa sare rasmi ni ipi?",
    mahususiCorrect: "Husaidia waamuzi na watazamaji kutofautisha timu kwa urahisi",
    mahususiPotovu: [
      "Hufanya wanafunzi wasishiriki michezo kabisa",
      "Huongeza gharama za shule bila faida yoyote",
      "Hupunguza idadi ya wachezaji wanaoshiriki",
    ],
    hojaZisizohusiana: [
      "Timu ya taifa ilishinda kombe la dunia mwaka jana",
      "Bei ya mipira ya miguu imepanda sokoni mwaka huu",
      "Shule ina uwanja mkubwa wa mpira wa vikapu",
    ],
    msamiati: [
      { neno: "kiburi", maana: "hisia za kujivunia jambo fulani kwa njia chanya" },
      { neno: "mkanganyiko", maana: "hali ya kuchanganyikiwa au kutoelewana" },
      { neno: "uwekezaji", maana: "kutumia rasilimali kwa matarajio ya kupata faida baadaye" },
    ],
    matumizi: { neno: "mkanganyiko", before: "Kukosekana kwa sare rasmi kunaweza kusababisha", after: "uwanjani wakati wa mchezo." },
  },
  {
    text: "Ni wakati wa mamlaka za elimu kupiga marufuku uuzaji wa vyakula visivyo na lishe bora karibu na malango ya shule. Kwanza, wafanyabiashara wengi huuza pipi, krisps na vinywaji vyenye sukari nyingi karibu na shule, vitu ambavyo huathiri afya ya wanafunzi kwa muda mrefu. Pili, wanafunzi wanaokula vyakula hivyo mara kwa mara huwa na uzito uliopitiliza na hatari ya kupata ugonjwa wa kisukari wakiwa bado wadogo. Tatu, fedha za pesa za mfukoni ambazo wangetumia kununua chakula bora hupotea kwa vitafunwa visivyo na thamani ya lishe. Kwa sababu hizi, ni wazi kuwa kupiga marufuku uuzaji wa vyakula hivyo karibu na shule kutalinda afya ya kizazi kijacho. Wazazi, walimu na mamlaka za afya wanapaswa kushirikiana kutekeleza sheria hii haraka iwezekanavyo.",
    thesis: "Mamlaka za elimu zinapaswa kupiga marufuku uuzaji wa vyakula visivyo na lishe bora karibu na malango ya shule",
    thesisPotovu: [
      "Wanafunzi wanapaswa kuruhusiwa kula vyakula vyovyote bila kikomo",
      "Wafanyabiashara pekee ndio wanaopaswa kuamua wanachouza",
      "Shule zinapaswa kufungwa mpaka suala hili litatuliwe",
    ],
    hoja: [
      "Vyakula hivyo huathiri afya ya wanafunzi kwa muda mrefu",
      "Wanafunzi wanaweza kupata uzito uliopitiliza na kisukari",
      "Pesa za mfukoni hupotea kwa vitafunwa visivyo na thamani ya lishe",
    ],
    hojaPotovu: "Vyakula visivyo na lishe huwafanya wanafunzi kufaulu mtihani kwa urahisi zaidi",
    mahususiPrompt: "Kulingana na kifungu, hatari gani ya kiafya inayotajwa kwa wanafunzi wanaokula vyakula hivyo mara kwa mara?",
    mahususiCorrect: "Uzito uliopitiliza na hatari ya kisukari",
    mahususiPotovu: [
      "Kuongezeka kwa urefu haraka mno",
      "Kuboreka kwa nguvu za mwili",
      "Kuongezeka kwa akili ya kukumbuka",
    ],
    hojaZisizohusiana: [
      "Shule ina bustani kubwa ya maua mbele ya ofisi",
      "Mabasi ya shule huwasili saa moja asubuhi",
      "Wanafunzi hupenda kucheza mchezo wa kuruka kamba",
    ],
    msamiati: [
      { neno: "kupitiliza", maana: "kuzidi kiasi kinachofaa au cha kawaida" },
      { neno: "marufuku", maana: "katazo rasmi la kufanya jambo fulani" },
      { neno: "vitafunwa", maana: "vyakula vidogo vinavyoliwa kati ya milo mikuu" },
    ],
    matumizi: { neno: "kupitiliza", before: "Ulaji wa sukari usiodhibitiwa unaweza", after: "kiasi kinachofaa mwilini." },
  },
  {
    text: "Kila familia inayoishi katika kiwanja chenye nafasi, hata ndogo, inapaswa kuanzisha bustani ya mboga nyumbani. Kwanza, bustani ndogo ya nyumbani humpatia mtu mboga safi bila kutumia dawa za sumu zinazotumika mashambani makubwa. Pili, familia hupunguza gharama ya kununua mboga sokoni kila wiki, hivyo kubaki na pesa za kutumia kwa mahitaji mengine. Tatu, kulima bustani ndogo huwafunza watoto stadi za kilimo tangu wakiwa wadogo, jambo linalowasaidia kuthamini chakula na kazi ya mikono. Kwa kuzingatia faida hizi zote — afya, uchumi na mafunzo — ni wazi kuwa kila familia inapaswa kutenga muda na nafasi kidogo kwa ajili ya bustani ya mboga nyumbani.",
    thesis: "Kila familia inapaswa kutenga muda na nafasi kidogo kwa ajili ya bustani ya mboga nyumbani",
    thesisPotovu: [
      "Familia hazipaswi kamwe kununua mboga sokoni",
      "Kilimo cha bustani ni kazi ya wakulima wakubwa pekee",
      "Watoto hawapaswi kushiriki kazi za nyumbani kamwe",
    ],
    hoja: [
      "Bustani ndogo humpatia mtu mboga safi bila dawa za sumu",
      "Familia hupunguza gharama ya kununua mboga sokoni",
      "Kulima huwafunza watoto stadi za kilimo tangu wakiwa wadogo",
    ],
    hojaPotovu: "Bustani ya nyumbani huifanya nyumba ionekane kubwa zaidi kuliko ilivyo",
    mahususiPrompt: "Kwa nini mboga za bustani ya nyumbani zinasemekana kuwa bora katika kifungu hiki?",
    mahususiCorrect: "Kwa sababu hazitumii dawa za sumu zinazotumika mashambani makubwa",
    mahususiPotovu: [
      "Kwa sababu ni kubwa zaidi kimo",
      "Kwa sababu huvunwa na wataalamu tu",
      "Kwa sababu hukaushwa kabla ya kuliwa",
    ],
    hojaZisizohusiana: [
      "Nyumba nyingi mjini hazina paa la bati",
      "Bei ya mbegu za maua imeshuka mwaka huu",
      "Familia nyingi hupenda kuangalia runinga jioni",
    ],
    msamiati: [
      { neno: "kutenga", maana: "kuweka kando kwa lengo maalum" },
      { neno: "stadi", maana: "ujuzi wa kufanya jambo fulani vizuri" },
      { neno: "gharama", maana: "pesa zinazotumika kununua au kufanya jambo" },
    ],
    matumizi: { neno: "gharama", before: "Bustani ya nyumbani hupunguza", after: "ya kununua mboga kila wiki." },
  },
];

export const ufahamuKushawishi: Skill = {
  id: "g7-ksw-ks-ufahamu-kushawishi",
  code: "KS.9",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Ufahamu wa Kifungu cha Kushawishi",
  description: "Soma vifungu vya kushawishi kisha udondoe habari mahususi, utambue hoja zinazounga mkono madai makuu, na ueleze maana za msamiati.",
  generate(rng) {
    const kifungu = randChoice(rng, VIFUNGU);
    const branch = randChoice(rng, ["mahususi", "thesis", "mbinu", "msamiati", "matumizi", "order"] as const);
    const hint = "Kifungu cha kushawishi huwasilisha upande mmoja tu, kikitoa hoja zinazounga mkono madai makuu ya mwandishi.";

    if (branch === "order") {
      const items = kifungu.hoja.map((label, i) => ({ id: `h${i}`, label }));
      return {
        kind: "ordering",
        passage: kifungu.text,
        prompt: "Panga hoja zifuatazo kwa mfuatano zinavyowasilishwa katika kifungu (Kwanza, Pili, Tatu).",
        instruction: "Bofya hoja kwa mfuatano sahihi.",
        items: shuffle(rng, items),
        correctOrder: items.map((it) => it.id),
        hint: "Fuatilia maneno 'Kwanza', 'Pili' na 'Tatu' katika kifungu.",
        explanation: kifungu.hoja.join(" → "),
      };
    }

    if (branch === "msamiati") {
      const tokens = shuffle(rng, kifungu.msamiati.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, kifungu.msamiati.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of kifungu.msamiati) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        passage: kifungu.text,
        prompt: "Oanisha kila neno na maana yake kama linavyotumika katika kifungu.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: kifungu.msamiati.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "matumizi") {
      return {
        kind: "fill-blank",
        passage: kifungu.text,
        prompt: "Tumia neno ufaalo kutoka kwa msamiati wa kifungu kukamilisha sentensi hii mpya.",
        before: kifungu.matumizi.before,
        after: kifungu.matumizi.after,
        correctAnswer: kifungu.matumizi.neno,
        inputMode: "text",
        hint: "Fikiria maana ya neno kutoka kwa kifungu, kisha ulitumie katika muktadha huu mpya.",
        explanation: `Neno "${kifungu.matumizi.neno}" ndilo linalofaa hapa kwa maana yake kama ilivyotumika katika kifungu.`,
      };
    }

    if (branch === "mbinu") {
      const items = [
        ...kifungu.hoja.map((h, i) => ({ id: `mk${i}`, label: h, bucket: "kuunga" })),
        ...kifungu.hojaZisizohusiana.map((h, i) => ({ id: `mz${i}`, label: h, bucket: "zisizohusiana" })),
      ];
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        passage: kifungu.text,
        prompt: "Panga kila kauli: je, ni hoja inayounga mkono madai ya mwandishi, au ni wazo lisilotajwa katika kifungu?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kuunga", label: "Hoja Inayounga Mkono" },
          { id: "zisizohusiana", label: "Halijatajwa Katika Kifungu" },
        ],
        correctBucket,
        hint: "Hoja zinazounga mkono zimo moja kwa moja katika kifungu; mengine ni mambo ambayo mwandishi hakuyataja.",
        explanation:
          kifungu.hoja.map((h) => `"${h}" ni hoja inayounga mkono madai ya mwandishi.`).join(" ") +
          " " +
          kifungu.hojaZisizohusiana.map((h) => `"${h}" halijatajwa katika kifungu.`).join(" "),
      };
    }

    if (branch === "thesis") {
      const choices = shuffle(rng, [kifungu.thesis, kifungu.hojaPotovu, ...kifungu.thesisPotovu]);
      return {
        kind: "multiple-choice",
        passage: kifungu.text,
        prompt: "Hoja kuu (madai makuu) ya mwandishi katika kifungu hiki ni ipi?",
        choices,
        correctIndex: choices.indexOf(kifungu.thesis),
        layout: "list",
        hint,
        explanation: `Madai makuu ya mwandishi ni: "${kifungu.thesis}" — hoja zote tatu zinazotolewa zinaunga mkono wazo hili moja.`,
      };
    }

    const choices = shuffle(rng, [kifungu.mahususiCorrect, ...kifungu.mahususiPotovu]);
    return {
      kind: "multiple-choice",
      passage: kifungu.text,
      prompt: kifungu.mahususiPrompt,
      choices,
      correctIndex: choices.indexOf(kifungu.mahususiCorrect),
      layout: "list",
      hint,
      explanation: `Kifungu kinataja moja kwa moja kuwa "${kifungu.mahususiCorrect}".`,
    };
  },
};
