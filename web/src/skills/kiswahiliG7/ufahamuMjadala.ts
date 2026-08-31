import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Mtazamo {
  jina: string;
  hoja: string;
}

interface Mjadala {
  text: string;
  mitazamo: [Mtazamo, Mtazamo];
  msamiati: { neno: string; maana: string }[];
  matumizi: { neno: string; before: string; after: string };
  tofautiItems: { label: string; kundi: 0 | 1 }[];
}

const MIJADALA: Mjadala[] = [
  {
    text: "Shuleni Bidii, walimu na wazazi wamekuwa wakijadili suala la kuruhusu wanafunzi kubeba simu za mkononi shuleni. Upande mmoja, baadhi ya wazazi wanasema simu ni muhimu kwa usalama, kwani huwawezesha kuwasiliana na watoto wao haraka iwapo dharura itatokea njiani au shuleni. Wanaongeza kuwa simu huwasaidia wanafunzi kutafuta habari za ziada kwa masomo yao. Upande mwingine, walimu wengi wanapinga wazo hilo, wakisema simu huvuruga umakini wa wanafunzi darasani na kuwafanya wajishughulishe na mitandao ya kijamii badala ya kusoma. Wanaongeza kuwa simu zinaweza kutumika kudanganya wakati wa mitihani. Baraza la shule bado halijafikia uamuzi wa mwisho kuhusu suala hili.",
    mitazamo: [
      { jina: "Wazazi Wanaounga Mkono", hoja: "Simu ni muhimu kwa usalama na kupata habari za ziada za masomo" },
      { jina: "Walimu Wanaopinga", hoja: "Simu huvuruga umakini darasani na zinaweza kutumika kudanganya mitihanini" },
    ],
    msamiati: [
      { neno: "kuvuruga", maana: "kuharibu mpangilio mzuri wa jambo, hapa ni kuvuruga umakini" },
      { neno: "dharura", maana: "hali ya hatari isiyotarajiwa inayohitaji hatua za haraka" },
      { neno: "kudanganya", maana: "kutenda kwa udanganyifu, hapa ni kukiuka sheria za mtihani" },
    ],
    matumizi: { neno: "kuvuruga", before: "Wazazi wanahofia kuwa matumizi ya simu bila udhibiti yanaweza", after: "umakini wa wanafunzi darasani." },
    tofautiItems: [
      { label: "Simu husaidia kuwasiliana wakati wa dharura", kundi: 0 },
      { label: "Simu husaidia kutafuta habari za ziada za masomo", kundi: 0 },
      { label: "Simu huvuruga umakini wa wanafunzi darasani", kundi: 1 },
      { label: "Simu zinaweza kutumika kudanganya wakati wa mitihani", kundi: 1 },
    ],
  },
  {
    text: "Wanafunzi wa shule za upili mara nyingi hupewa pesa za mfukoni na wazazi wao kila wiki. Kuna mjadala kuhusu jinsi vijana wanavyopaswa kutumia pesa hizo. Baadhi ya wataalamu wa fedha wanasema vijana wanapaswa kuweka akiba sehemu kubwa ya pesa hizo ili kujenga tabia nzuri ya kuhifadhi fedha tangu wakiwa wadogo. Wanasema kununua vitafunwa kila siku ni upotevu wa pesa ambazo zingeweza kuwekwa akiba. Kwa upande mwingine, baadhi ya wanasaikolojia wa watoto wanasema vijana wanapaswa kuruhusiwa kutumia sehemu ya pesa zao kwa starehe ndogo ndogo kama vitafunwa au michezo, kwani hilo huwafunza kufanya maamuzi yao wenyewe na kujifunza kutokana na makosa madogo wanapokuwa bado wachanga.",
    mitazamo: [
      { jina: "Wataalamu wa Fedha", hoja: "Vijana wanapaswa kuweka akiba sehemu kubwa ya pesa zao badala ya kununua vitafunwa" },
      { jina: "Wanasaikolojia wa Watoto", hoja: "Vijana wanapaswa kuruhusiwa kutumia sehemu ya pesa kwa starehe ili kujifunza kufanya maamuzi" },
    ],
    msamiati: [
      { neno: "akiba", maana: "pesa au kitu kinachohifadhiwa kwa matumizi ya baadaye" },
      { neno: "starehe", maana: "furaha au raha ndogo anazojipatia mtu" },
      { neno: "upotevu", maana: "kupoteza kitu bila faida yoyote" },
    ],
    matumizi: { neno: "akiba", before: "Ni vyema kuweka sehemu ya pesa za mfukoni kama", after: "kwa ajili ya mahitaji ya baadaye." },
    tofautiItems: [
      { label: "Vijana wanapaswa kuweka akiba sehemu kubwa ya pesa zao", kundi: 0 },
      { label: "Kununua vitafunwa kila siku ni upotevu wa pesa", kundi: 0 },
      { label: "Vijana wanapaswa kuruhusiwa kutumia pesa kwa starehe ndogo ndogo", kundi: 1 },
      { label: "Kutumia pesa kidogo kwa starehe huwafunza vijana kufanya maamuzi", kundi: 1 },
    ],
  },
  {
    text: "Jamii imegawanyika kuhusu iwapo vijana wa shule za upili wanapaswa kutumia mitandao ya kijamii kama Instagram na TikTok. Wafuasi wa mitandao hiyo wanasema inawasaidia vijana kuunganika na marafiki, kujifunza mambo mapya, na hata kuonyesha vipaji vyao kama muziki au sanaa kwa hadhira kubwa. Wanaopinga matumizi hayo, hasa wataalamu wa afya ya akili, wanasema mitandao ya kijamii huweza kusababisha wasiwasi na kujilinganisha vibaya na wenzao, hasa vijana wanaotumia muda mwingi mno kuitazama badala ya kusoma au kulala vizuri. Wanashauri vijana kuweka mipaka ya muda wa kutumia mitandao hiyo kila siku.",
    mitazamo: [
      { jina: "Wafuasi wa Mitandao ya Kijamii", hoja: "Mitandao huwasaidia vijana kuunganika, kujifunza na kuonyesha vipaji vyao" },
      { jina: "Wataalamu wa Afya ya Akili", hoja: "Mitandao inaweza kusababisha wasiwasi na kujilinganisha vibaya, hivyo vijana wawekewe mipaka ya muda" },
    ],
    msamiati: [
      { neno: "kujilinganisha", maana: "kutathmini maisha yako kwa kuyafananisha na ya wengine" },
      { neno: "mipaka", maana: "kikomo kinachowekwa ili kudhibiti jambo" },
      { neno: "wasiwasi", maana: "hali ya hofu au mashaka kuhusu jambo fulani" },
    ],
    matumizi: { neno: "mipaka", before: "Wataalamu wanashauri vijana kuweka", after: "ya muda wa kutumia mitandao ya kijamii kila siku." },
    tofautiItems: [
      { label: "Mitandao huwasaidia vijana kuunganika na marafiki", kundi: 0 },
      { label: "Mitandao huwapa vijana nafasi ya kuonyesha vipaji vyao", kundi: 0 },
      { label: "Mitandao inaweza kusababisha wasiwasi na kujilinganisha vibaya", kundi: 1 },
      { label: "Vijana wanapaswa kuweka mipaka ya muda wa kutumia mitandao", kundi: 1 },
    ],
  },
];

const BAJETI_MJADALA = MIJADALA[1];

interface SwaliJumla {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const SWALI_JUMLA: SwaliJumla = {
  prompt: "Kifungu cha mjadala hutofautiana vipi na kifungu cha kushawishi?",
  correct: "Kifungu cha mjadala huwasilisha mitazamo miwili au zaidi inayopingana, ilhali cha kushawishi huwasilisha upande mmoja tu ukijaribu kumshawishi msomaji",
  distractors: [
    "Havitofautiani kwa vyovyote — ni kitu kimoja tu",
    "Kifungu cha mjadala huwa hadithi ya kubuni, ilhali cha kushawishi huwa kweli",
    "Kifungu cha kushawishi huwa kifupi zaidi kila wakati kuliko cha mjadala",
  ],
  explanation: "Tofauti kuu ni kuwa mjadala huonyesha pande mbili au zaidi za suala, ilhali kushawishi huegemea upande mmoja pekee kwa nia ya kumshawishi msomaji.",
};

export const ufahamuMjadala: Skill = {
  id: "g7-ksw-ks-ufahamu-mjadala",
  code: "KS.12",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Ufahamu wa Kifungu cha Mjadala",
  description: "Soma vifungu vya mjadala kisha udondoe habari mahususi, utambue msamiati mpya, uandike habari kwa ufupi, na uchambue mitazamo tofauti inayowasilishwa.",
  generate(rng) {
    const branch = randChoice(rng, ["mtazamo", "tofauti", "msamiati", "matumizi", "muundo", "bajeti", "jumla"] as const);
    const hint = "Kifungu cha mjadala huwasilisha mitazamo miwili au zaidi inayopingana kuhusu suala moja.";

    if (branch === "jumla") {
      const choices = shuffle(rng, [SWALI_JUMLA.correct, ...SWALI_JUMLA.distractors]);
      return {
        kind: "multiple-choice",
        prompt: SWALI_JUMLA.prompt,
        choices,
        correctIndex: choices.indexOf(SWALI_JUMLA.correct),
        layout: "list",
        hint,
        explanation: SWALI_JUMLA.explanation,
      };
    }

    if (branch === "muundo") {
      const HATUA = [
        { id: "h1", label: "Suala linalojadiliwa linatambulishwa" },
        { id: "h2", label: "Mtazamo wa kwanza unawasilishwa pamoja na hoja zake" },
        { id: "h3", label: "Mtazamo unaopingana unawasilishwa pamoja na hoja zake" },
        { id: "h4", label: "Hitimisho au uamuzi (kama upo) unatolewa" },
      ];
      return {
        kind: "ordering",
        prompt: "Panga muundo ufuatao wa kawaida wa kifungu cha mjadala kwa mfuatano sahihi.",
        instruction: "Bofya vipengele kwa mfuatano sahihi.",
        items: shuffle(rng, HATUA),
        correctOrder: HATUA.map((h) => h.id),
        hint: "Mjadala huanza kwa kutambulisha suala, kisha huwasilisha mtazamo mmoja, kisha mwingine, kisha hitimisho.",
        explanation: HATUA.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "bajeti") {
      const bajetiChoices = shuffle(rng, ["Akiba", "Vitafunwa", "Usafiri", "Vifaa vya Shule"]);
      return {
        kind: "multiple-choice",
        passage: BAJETI_MJADALA.text,
        prompt: "Angalia chati ifuatayo inayoonyesha mfano wa mgawanyo wa pesa za mfukoni za mwanafunzi kwa wiki. Ni sehemu gani inayochukua asilimia kubwa zaidi?",
        visual: {
          type: "pie-chart",
          slices: [
            { label: "Akiba", value: 40 },
            { label: "Vitafunwa", value: 30 },
            { label: "Usafiri", value: 20 },
            { label: "Vifaa vya Shule", value: 10 },
          ],
        },
        choices: bajetiChoices,
        correctIndex: bajetiChoices.indexOf("Akiba"),
        layout: "row",
        hint: "Angalia ni sehemu gani ya chati iliyo kubwa zaidi kwa asilimia.",
        explanation: "Akiba inachukua asilimia 40, ambayo ni kubwa kuliko Vitafunwa (30%), Usafiri (20%) na Vifaa vya Shule (10%).",
      };
    }

    const mjadala = randChoice(rng, MIJADALA);

    if (branch === "msamiati") {
      const tokens = shuffle(rng, mjadala.msamiati.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, mjadala.msamiati.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of mjadala.msamiati) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        passage: mjadala.text,
        prompt: "Oanisha kila neno na maana yake kama linavyotumika katika kifungu.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: mjadala.msamiati.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "matumizi") {
      return {
        kind: "fill-blank",
        passage: mjadala.text,
        prompt: "Tumia neno ufaalo kutoka kwa msamiati wa kifungu kukamilisha sentensi hii mpya.",
        before: mjadala.matumizi.before,
        after: mjadala.matumizi.after,
        correctAnswer: mjadala.matumizi.neno,
        inputMode: "text",
        hint: "Fikiria maana ya neno kutoka kwa kifungu, kisha ulitumie katika muktadha huu mpya.",
        explanation: `Neno "${mjadala.matumizi.neno}" ndilo linalofaa hapa kwa maana yake kama ilivyotumika katika kifungu.`,
      };
    }

    if (branch === "tofauti") {
      const items = mjadala.tofautiItems.map((t, i) => ({ id: `t${i}`, label: t.label, b: mjadala.mitazamo[t.kundi].jina }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        passage: mjadala.text,
        prompt: "Panga kila hoja kulingana na mtazamo unaoiwasilisha.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: mjadala.mitazamo.map((m) => ({ id: m.jina, label: m.jina })),
        correctBucket,
        hint: "Rejelea kila mtazamo kando na uangalie ni hoja zipi zinazoutetea.",
        explanation: mjadala.tofautiItems.map((t) => `"${t.label}" ni hoja ya ${mjadala.mitazamo[t.kundi].jina}.`).join(" "),
      };
    }

    const kundiIndex = randChoice(rng, [0, 1] as const);
    const sahihi = mjadala.mitazamo[kundiIndex];
    const mwingine = mjadala.mitazamo[1 - kundiIndex];
    const choices = shuffle(rng, [
      sahihi.hoja,
      mwingine.hoja,
      "Suala hili halijawahi kujadiliwa na mtu yeyote",
      "Pande zote mbili zinakubaliana kikamilifu bila mzozo wowote",
    ]);
    return {
      kind: "multiple-choice",
      passage: mjadala.text,
      prompt: `Ni hoja gani inayowasilishwa na kikundi cha "${sahihi.jina}" kuhusu suala hili?`,
      choices,
      correctIndex: choices.indexOf(sahihi.hoja),
      layout: "list",
      hint,
      explanation: `Kulingana na kifungu, "${sahihi.jina}" wanasema: "${sahihi.hoja}".`,
    };
  },
};
