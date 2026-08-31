import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KIFUNGU = "Misitu, maji na udongo ni baadhi ya maliasili muhimu zinazotuwezesha kuishi. Je, tunatunzaje maliasili hizi ili zidumu kwa vizazi vijavyo? Wanajamii wanapaswa kupanda miti, kutotia maji sumu, na kulima kwa njia zisizoharibu udongo. Ni jukumu la kila mmoja wetu!";

const VIPENGELE: { neno: string; maana: string }[] = [
  { neno: "Matamshi Bora", maana: "Kutamka kila neno kwa usahihi na kwa uwazi ili msikilizaji aelewe" },
  { neno: "Kasi Ifaayo", maana: "Kusoma kwa mwendo usio wa haraka mno wala wa polepole mno, ukizingatia alama za uakifishaji" },
  { neno: "Sauti Ipasavyo", maana: "Kubadilisha kiimbo na kiasi cha sauti kulingana na maudhui, kama swali au mshangao" },
  { neno: "Ishara Zifaazo", maana: "Kutumia mikono, uso na mwili kuonyesha hisia zinazolingana na kile kinachosomwa" },
];

const MIFANO: { label: string; mzuri: boolean }[] = [
  { label: "Kusimama kidogo alama ya kituo (nukta) inapotokea ili wazo likamilike vyema", mzuri: true },
  { label: "Kutamka kila silabi ya neno gumu polepole na kwa uwazi", mzuri: true },
  { label: "Kuinua sauti kidogo mwishoni mwa sentensi ya kuuliza", mzuri: true },
  { label: "Kuonyesha mshangao kwa sura ya uso wakati wa kusoma sehemu yenye mshangao", mzuri: true },
  { label: "Kusoma haraka mno hadi maneno kuchanganyikana bila kupumzika", mzuri: false },
  { label: "Kutumia sauti moja tambarare bila kujali alama za uakifishaji", mzuri: false },
  { label: "Kupunguza sauti sana hadi wasikilizaji washindwe kusikia", mzuri: false },
  { label: "Kutosimama kabisa hata pale penye vituo vya nukta", mzuri: false },
];

const HATUA = [
  { id: "h1", label: "Soma kifungu kimya kimya kwanza ili kuelewa maudhui yake" },
  { id: "h2", label: "Tambua alama za uakifishaji na mahali pa kupumzika" },
  { id: "h3", label: "Fanya mazoezi ya kusoma kifungu kwa sauti peke yako" },
  { id: "h4", label: "Soma mbele ya wenzako ukizingatia matamshi, kasi, sauti na ishara" },
];

interface Swali {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
  passage?: string;
}

const MASWALI: Swali[] = [
  {
    prompt: "Kusoma kwa ufasaha kuna umuhimu gani hasa?",
    correct: "Humwezesha msikilizaji kuelewa vyema ujumbe unaowasilishwa",
    distractors: ["Humfanya msomaji asome haraka iwezekanavyo bila kujali maana", "Humfanya msomaji aache kutumia alama za uakifishaji", "Hakuna umuhimu wowote zaidi ya kumaliza haraka"],
    explanation: "Ufasaha huunganisha matamshi, kasi, sauti na ishara ili msikilizaji afuatilie na kuelewa vyema kile kinachosomwa.",
  },
  {
    prompt: "Nini maana ya 'kasi ifaayo' katika usomaji wa ufasaha?",
    correct: "Kusoma kwa mwendo unaomruhusu msikilizaji kufuatilia bila haraka wala ucheleweshaji",
    distractors: ["Kusoma haraka iwezekanavyo bila kusimama popote", "Kusoma polepole sana hadi wasikilizaji wachoke", "Kusoma kimya kimya bila kutoa sauti"],
    explanation: "Kasi ifaayo humaanisha mwendo wa wastani unaozingatia alama za uakifishaji, si haraka mno wala polepole mno.",
  },
  {
    prompt: "Alama ya kuuliza (?) mwishoni mwa sentensi katika kifungu 'Je, tunatunzaje maliasili hizi...?' inaonyesha msomaji anapaswa kufanya nini?",
    correct: "Kuinua sauti kidogo kuonyesha ni swali",
    distractors: ["Kupunguza sauti hadi kunyamaza kabisa", "Kusoma haraka zaidi bila kusimama", "Kutabasamu bila kubadilisha sauti"],
    explanation: "Alama ya kuuliza huashiria msomaji apandishe kiimbo cha sauti kidogo mwishoni ili kuonyesha ni swali.",
    passage: KIFUNGU,
  },
  {
    prompt: "Alama ya mshangao (!) mwishoni mwa 'Ni jukumu la kila mmoja wetu!' inamtaka msomaji afanye nini anaposoma?",
    correct: "Kutumia sauti yenye msisitizo na labda ishara ya mwili kuonyesha uzito wa jambo",
    distractors: ["Kupunguza sauti sana ili isisikike", "Kusoma sentensi hiyo kwa haraka bila hisia", "Kuruka sentensi hiyo kabisa"],
    explanation: "Alama ya mshangao huashiria msisitizo — msomaji hutumia sauti yenye nguvu zaidi na anaweza kuambatanisha ishara ifaayo.",
    passage: KIFUNGU,
  },
];

export const kusomaUfasahaI: Skill = {
  id: "g8-ksw-ks-ufasaha-1",
  code: "KS.4",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ks",
  grade: 8,
  title: "Kusoma kwa Ufasaha",
  description: "Jifunze vipengele vya usomaji wa ufasaha — matamshi bora, kasi ifaayo, sauti ipasavyo na ishara zifaazo.",
  generate(rng) {
    const branch = randChoice(rng, ["vipengele", "mifano", "hatua", "fill", "swali"] as const);
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
      const items = MIFANO.map((m, i) => ({ id: `m${i}`, label: m.label, b: m.mzuri ? "mzuri" : "hafifu" }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        prompt: "Panga kila mfano kama tabia ya usomaji wa ufasaha mzuri au hafifu.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "mzuri", label: "Ufasaha Mzuri" },
          { id: "hafifu", label: "Ufasaha Hafifu" },
        ],
        correctBucket,
        hint,
        explanation: MIFANO.map((m) => `"${m.label}" ni mfano wa ufasaha ${m.mzuri ? "mzuri" : "hafifu"}.`).join(" "),
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA);
      return {
        kind: "ordering",
        prompt: "Panga hatua zifuatazo za kujiandaa kusoma kifungu kwa ufasaha mbele ya darasa.",
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items,
        correctOrder: HATUA.map((h) => h.id),
        hint: "Anza kwa kuelewa maudhui, kisha jitayarishe kimya kimya, kabla ya kusoma mbele ya wenzako.",
        explanation: HATUA.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu vipengele vya usomaji wa ufasaha.",
        before: "Kipengele cha ufasaha kinachohusu kutumia mikono na sura ya uso wakati wa kusoma huitwa",
        after: "zifaazo.",
        correctAnswer: "ishara",
        inputMode: "text",
        hint: "Fikiria kipengele kinachohusisha mwili wa msomaji, si sauti wala matamshi.",
        explanation: "Ishara zifaazo ni matumizi ya mikono, uso na mwili kuonyesha hisia zinazolingana na kile kinachosomwa.",
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
