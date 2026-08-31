import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Kiswahili, Kusoma (KS), mada 3.2.1 (mandhari: Mahusiano) na mada 11.2.1 (mandhari: Ushuru) —
// vipengele vya usomaji wa ufasaha (matamshi bora, kasi ifaayo — kigezo cha maneno 80-85 sahihi kwa dakika,
// sauti ipasavyo, ishara zifaazo) vikichanganywa na msamiati wa mahusiano ya watu (sahibu, rafiki, mwandani,
// mpenzi, mwana, ndugu, jirani, mwenza) na msamiati wa ushuru.

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka",
  "Otieno", "Wanjiru", "Achieng", "Kamau", "Njeri", "Wafula", "Cherono", "Musyoka", "Akinyi", "Kiptoo",
] as const;
const KENYAN_PLACES = [
  "Nyeri", "Nakuru", "Kisumu", "Eldoret", "Machakos", "Kitale", "Kericho", "Kakamega", "Bungoma", "Meru",
  "Embu", "Kitui", "Narok", "Kajiado", "Homa Bay", "Kilifi",
] as const;
function name(rng: RNG): string {
  return randChoice(rng, KENYAN_NAMES);
}
function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}

const KIFUNGU =
  "Katika jamii, kila mtu ana mahusiano mbalimbali: baadhi ni ndugu wa damu, wengine ni marafiki wa dhati au masahibu, na wengine ni majirani tunaoishi nao karibu. Mahusiano haya huimarishwa kwa kuheshimiana na kusaidiana. Kwa upande mwingine, serikali hutegemea ushuru unaolipwa na wananchi ili kuendesha huduma kama shule na hospitali. Mlipakodi anayelipa ushuru kwa wakati husaidia maendeleo ya taifa.";

const VIPENGELE: { neno: string; maana: string }[] = [
  { neno: "Matamshi Bora", maana: "Kutamka kila neno kwa usahihi na kwa uwazi ili msikilizaji aelewe vyema" },
  { neno: "Kasi Ifaayo", maana: "Kusoma kwa mwendo usio wa haraka mno wala wa polepole mno, ukizingatia alama za uakifishaji" },
  { neno: "Sauti Ipasavyo", maana: "Kubadilisha kiwango cha sauti na kiimbo kulingana na maudhui, kama swali au mshangao" },
  { neno: "Ishara Zifaazo", maana: "Kutumia mikono, uso na mwili kuonyesha hisia zinazolingana na kile kinachosomwa, bila kukiuka utamaduni" },
];

const MIFANO: { label: string; mzuri: boolean }[] = [
  { label: "Kupumzika kidogo mahali penye alama ya mkato (koma) kabla ya kuendelea kusoma", mzuri: true },
  { label: "Kutamka kila neno gumu kama 'ushuru' au 'mwandani' kwa uwazi na usahihi", mzuri: true },
  { label: "Kubadilisha sauti kuonyesha swali linapoulizwa katika kifungu", mzuri: true },
  { label: "Kuonyesha sura ya uso yenye huzuni wakati sehemu ya kifungu inaeleza jambo la kusikitisha", mzuri: true },
  { label: "Kusoma kwa mwendo wa kawaida usio wa haraka mno wala wa polepole mno", mzuri: true },
  { label: "Kutumia mkono kuashiria idadi wakati kifungu kinapotaja nambari fulani", mzuri: true },
  { label: "Kuinua sauti kidogo mwishoni mwa sentensi yenye alama ya kuuliza", mzuri: true },
  { label: "Kusoma haraka sana hadi maneno kuchanganyikana bila kueleweka", mzuri: false },
  { label: "Kutamka maneno magumu kwa kubahatisha bila kuyazoeza kwanza", mzuri: false },
  { label: "Kutumia sauti tambarare isiyobadilika kutoka mwanzo hadi mwisho wa kifungu", mzuri: false },
  { label: "Kupunguza sauti sana hadi wasikilizaji washindwe kusikia maneno", mzuri: false },
  { label: "Kutokaa kimya popote hata pale penye alama za uakifishaji", mzuri: false },
  { label: "Kuepuka kabisa matumizi ya mikono au sura ya uso wakati wa kusoma", mzuri: false },
  { label: "Kusoma kwa sauti ya kunong'ona isiyosikika na wasikilizaji", mzuri: false },
];

interface OrderTopic {
  topic: string;
  ngumu: [string, string];
}
const ORDER_TOPICS: OrderTopic[] = [
  { topic: "mahusiano ya kifamilia", ngumu: ["ndugu", "mwenza"] },
  { topic: "ushuru na mapato ya serikali", ngumu: ["ushuru", "mapato"] },
  { topic: "michezo shuleni", ngumu: ["mashindano", "medali"] },
  { topic: "maisha ya wanyamapori", ngumu: ["wanyamapori", "hifadhi"] },
  { topic: "safari za kihistoria", ngumu: ["historia", "utamaduni"] },
];
function buildOrderSteps(t: OrderTopic): { id: string; label: string }[] {
  return [
    { id: "h1", label: `Soma kifungu kuhusu ${t.topic} kimya kimya kwanza ili kuelewa maudhui yake.` },
    { id: "h2", label: `Tambua maneno magumu kama '${t.ngumu[0]}' na '${t.ngumu[1]}', kisha utafute maana zake.` },
    { id: "h3", label: "Fanya mazoezi ya kutamka maneno hayo magumu kwa usahihi mara kadhaa." },
    { id: "h4", label: "Soma kifungu kwa sauti ukizingatia kasi ifaayo, sauti ipasavyo na ishara zifaazo." },
  ];
}

const FILL_BLANKS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Rafiki wa karibu sana anayeaminika huitwa ", after: ".", correctAnswer: "sahibu" },
  { before: "Mtu anayeishi karibu na nyumba yako huitwa ", after: ".", correctAnswer: "jirani" },
  { before: "Mtoto wa mzazi huitwa ", after: ".", correctAnswer: "mwana" },
  { before: "Mtu wa familia yako wa damu huitwa ", after: ".", correctAnswer: "ndugu" },
  { before: "Mshirika wako wa kudumu katika jambo fulani huitwa ", after: ".", correctAnswer: "mwenza" },
  { before: "Malipo ya lazima yanayotolewa kwa serikali huitwa ", after: ".", correctAnswer: "ushuru" },
  { before: "Fedha zinazopatikana kutokana na kazi au biashara huitwa ", after: ".", correctAnswer: "mapato" },
  { before: "Mahali pa kulipa ushuru wa bidhaa zinazoingia au kutoka nchini huitwa ", after: ".", correctAnswer: "forodha" },
  { before: "Mtu anayelipa ushuru kwa serikali huitwa ", after: ".", correctAnswer: "mlipakodi" },
  { before: "Kipengele cha ufasaha kinachohusu kutamka maneno kwa usahihi na uwazi huitwa matamshi ", after: ".", correctAnswer: "bora" },
  { before: "Kipengele cha ufasaha kinachohusu kutumia mikono na uso kuonyesha hisia huitwa ishara ", after: ".", correctAnswer: "zifaazo" },
  { before: "Mwendo wa kusoma usio wa haraka mno wala polepole mno huitwa kasi ", after: ".", correctAnswer: "ifaayo" },
];

interface MC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
  passage?: string;
}
const ELEMENT_MC: MC[] = VIPENGELE.map((v) => ({
  prompt: `Kipengele kipi cha usomaji wa ufasaha kinaelezwa hapa: "${v.maana}"?`,
  correct: v.neno,
  wrong: VIPENGELE.filter((o) => o.neno !== v.neno).map((o) => o.neno),
  explanation: `${v.neno} ndicho kinachoelezwa — ${v.maana}.`,
}));

const MAHUSIANO_WORDS = [
  { neno: "Sahibu", maana: "rafiki wa karibu sana anayeaminika" },
  { neno: "Mwandani", maana: "rafiki wa kudumu unayeshirikiana naye mara kwa mara" },
  { neno: "Mpenzi", maana: "mtu unayempenda kimapenzi" },
  { neno: "Mwana", maana: "mtoto wa mzazi" },
  { neno: "Ndugu", maana: "mtu wa familia yako wa damu" },
  { neno: "Jirani", maana: "mtu anayeishi karibu na nyumba yako" },
  { neno: "Mwenza", maana: "mshirika wako wa kudumu katika jambo fulani" },
];
const USHURU_WORDS = [
  { neno: "Ushuru", maana: "malipo ya lazima yanayotolewa kwa serikali" },
  { neno: "Mapato", maana: "fedha zinazopatikana kutokana na kazi au biashara" },
  { neno: "Forodha", maana: "mahali pa kulipa ushuru wa bidhaa zinazoingia au kutoka nchini" },
  { neno: "Mlipakodi", maana: "mtu anayelipa ushuru kwa serikali" },
];
const VOCAB_MC: MC[] = [
  ...MAHUSIANO_WORDS.map((w) => ({
    prompt: `Neno gani linamaanisha: "${w.maana}"?`,
    correct: w.neno,
    wrong: MAHUSIANO_WORDS.filter((o) => o.neno !== w.neno).map((o) => o.neno).slice(0, 3),
    explanation: `${w.neno} — ${w.maana}.`,
    passage: KIFUNGU,
  })),
  ...USHURU_WORDS.map((w) => ({
    prompt: `Neno gani linamaanisha: "${w.maana}"?`,
    correct: w.neno,
    wrong: USHURU_WORDS.filter((o) => o.neno !== w.neno).map((o) => o.neno),
    explanation: `${w.neno} — ${w.maana}.`,
    passage: KIFUNGU,
  })),
];
const MASWALI: MC[] = [...ELEMENT_MC, ...VOCAB_MC];

export const ufasahaMahusianoNaUshuru: Skill = {
  id: "g6-ksw-ks-kusoma-kwa-ufasaha",
  code: "KS.3",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Ufasaha",
  description: "Jifunze vipengele vya usomaji wa ufasaha (matamshi bora, kasi ifaayo, sauti ipasavyo, ishara zifaazo) ukitumia vifungu vya mahusiano ya watu na ushuru, na uhesabu kasi ya usomaji dhidi ya kigezo cha maneno 80-85 kwa dakika.",
  generate(rng) {
    const branch = randChoice(rng, ["vipengele", "mifano", "hatua", "fill", "kasi", "swali"] as const);
    const hint = "Ufasaha huhusisha matamshi, kasi, sauti na ishara zinazolingana na kile kinachosomwa.";

    if (branch === "vipengele") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.neno, label: v.neno })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.neno, label: v.maana })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.neno] = v.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha ufasaha na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: VIPENGELE.map((v) => `${v.neno} — ${v.maana}.`).join(" "),
      };
    }

    if (branch === "mifano") {
      const chosen = shuffle(rng, MIFANO).slice(0, randInt(rng, 7, 9));
      const items = chosen.map((m, i) => ({ id: `m${i}`, label: m.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m, i) => (correctBucket[`m${i}`] = m.mzuri ? "fasaha" : "sifasaha"));
      return {
        kind: "categorize",
        prompt: "Panga kila tabia ya usomaji kama fasaha au si fasaha.",
        items: shuffle(rng, items),
        buckets: [
          { id: "fasaha", label: "Fasaha" },
          { id: "sifasaha", label: "Si Fasaha" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((m) => `"${m.label}" ni mfano wa usomaji ${m.mzuri ? "fasaha" : "usio fasaha"}.`).join(" "),
      };
    }

    if (branch === "hatua") {
      const t = randChoice(rng, ORDER_TOPICS);
      const steps = buildOrderSteps(t);
      return {
        kind: "ordering",
        prompt: `Panga hatua za kujiandaa kusoma kwa ufasaha kifungu kuhusu ${t.topic}.`,
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items: shuffle(rng, steps),
        correctOrder: steps.map((s) => s.id),
        hint: "Anza kwa kuelewa maudhui, kisha jitayarishe kimya kimya, kabla ya kusoma kwa sauti.",
        explanation: steps.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const fb = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        passage: KIFUNGU,
        prompt: "Kamilisha sentensi kuhusu mahusiano, ushuru, au ufasaha wa kusoma.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
      };
    }

    if (branch === "kasi") {
      const minutes = randChoice(rng, [1, 2, 3, 4] as const);
      const wpm = randInt(rng, 60, 100);
      const words = wpm * minutes;
      const category: "polepole" | "sawa" | "haraka" = wpm < 80 ? "polepole" : wpm > 85 ? "haraka" : "sawa";
      const who = name(rng);
      const texts: Record<"polepole" | "sawa" | "haraka", string> = {
        polepole: `Polepole, kwa sababu ${words} ÷ ${minutes} = ${wpm} maneno kwa dakika, ambayo ni chini ya kigezo cha maneno 80-85 kwa dakika`,
        sawa: `Sawa na kigezo, kwa sababu ${words} ÷ ${minutes} = ${wpm} maneno kwa dakika, ambayo iko ndani ya kigezo cha maneno 80-85 kwa dakika`,
        haraka: `Haraka, kwa sababu ${words} ÷ ${minutes} = ${wpm} maneno kwa dakika, ambayo ni zaidi ya kigezo cha maneno 80-85 kwa dakika`,
      };
      const distractorCats = (["polepole", "sawa", "haraka"] as const).filter((c) => c !== category);
      const choices = shuffle(rng, [
        texts[category],
        texts[distractorCats[0]],
        texts[distractorCats[1]],
        `Haiwezekani kujua bila kusoma mwenyewe, hesabu za dakika hazina umuhimu`,
      ]);
      return {
        kind: "multiple-choice",
        prompt: `${who} alisoma kifungu kuhusu mahusiano ${place(rng)} akitumia maneno ${words} ndani ya dakika ${minutes} wakati wa zoezi la kusoma kwa ufasaha. Kigezo kinachotarajiwa ni maneno 80-85 kwa dakika. Kasi ya ${who} ilikuwaje?`,
        choices,
        correctIndex: choices.indexOf(texts[category]),
        layout: "list",
        hint: "Gawanya jumla ya maneno kwa idadi ya dakika ili kupata kasi kwa dakika moja, kisha ulinganishe na kigezo cha 80-85.",
        explanation: `${words} ÷ ${minutes} = ${wpm} maneno kwa dakika. Kigezo ni maneno 80-85 kwa dakika, hivyo kasi ya ${who} ilikuwa ${category === "sawa" ? "ndani ya kigezo (sawa)" : category}.`,
      };
    }

    const q = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [q.correct, ...q.wrong]);
    return {
      kind: "multiple-choice",
      passage: q.passage,
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint,
      explanation: q.explanation,
    };
  },
};
