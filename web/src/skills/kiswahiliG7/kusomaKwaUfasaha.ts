import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KIFUNGU = "Mazoezi ya viungo ni muhimu kwa afya ya kila mtu, awe mtoto au mtu mzima. Je, unafahamu kuwa kutembea kwa dakika thelathini kila siku kunaweza kupunguza hatari ya magonjwa mengi? Wanafunzi wanapaswa kucheza michezo shuleni badala ya kukaa tu wakitumia simu. Ni jukumu letu sote kudumisha miili yenye afya!";

const VIPENGELE: { neno: string; maana: string }[] = [
  { neno: "Matamshi Bora", maana: "Kutamka kila neno kwa usahihi na kwa uwazi ili msikilizaji aelewe vyema" },
  { neno: "Kasi Ifaayo", maana: "Kusoma kwa mwendo usio wa haraka mno wala wa polepole mno, ukizingatia alama za uakifishaji" },
  { neno: "Sauti Ipasavyo", maana: "Kubadilisha kiwango cha sauti na kiimbo kulingana na maudhui, kama swali au mshangao" },
  { neno: "Ishara Zifaazo", maana: "Kutumia mikono, uso na mwili kuonyesha hisia zinazolingana na kile kinachosomwa" },
];

const MIFANO: { label: string; mzuri: boolean }[] = [
  { label: "Kusimama kidogo alama ya kituo (nukta) inapotokea ili wazo likamilike vyema", mzuri: true },
  { label: "Kutamka kila silabi ya neno gumu polepole na kwa uwazi", mzuri: true },
  { label: "Kuinua sauti kidogo mwishoni mwa sentensi ya kuuliza", mzuri: true },
  { label: "Kutumia sura ya uso yenye mshangao wakati wa kusoma sehemu yenye alama ya mshangao", mzuri: true },
  { label: "Kusoma haraka mno hadi maneno kuchanganyikana bila kupumzika", mzuri: false },
  { label: "Kutumia sauti moja tambarare bila kujali alama za uakifishaji", mzuri: false },
  { label: "Kupunguza sauti sana hadi wasikilizaji washindwe kusikia", mzuri: false },
  { label: "Kutosimama kabisa hata pale penye vituo vya nukta", mzuri: false },
];

const HATUA = [
  { id: "h1", label: "Soma kifungu kimya kimya kwanza ili kuelewa maudhui yake" },
  { id: "h2", label: "Tambua alama za uakifishaji na mahali pa kupumzika" },
  { id: "h3", label: "Fanya mazoezi ya kusoma kifungu kwa sauti peke yako mara kadhaa" },
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
    prompt: "Kigezo cha 4.2.1 (muhula wa kwanza) kinatarajia mwanafunzi wa Gredi ya 7 asome angalau maneno mangapi kwa dakika moja?",
    correct: "90",
    distractors: ["60", "120", "95"],
    explanation: "Kigezo cha 4.2.1 kinahitaji angalau maneno 90 sahihi kwa dakika, ilhali maneno 95 ni kigezo cha baadaye zaidi (12.2.1).",
  },
  {
    prompt: "Kigezo cha 12.2.1 (muhula wa mwisho) kinatarajia mwanafunzi wa Gredi ya 7 asome angalau maneno mangapi kwa dakika moja?",
    correct: "95",
    distractors: ["70", "90", "100"],
    explanation: "Kigezo cha 12.2.1 kinahitaji angalau maneno 95 kwa dakika — kasi iliyoongezeka kutoka maneno 90 ya kigezo cha 4.2.1.",
  },
  {
    prompt: "Kwa nini kigezo cha 12.2.1 kinatarajia kasi ya juu zaidi kuliko kigezo cha 4.2.1?",
    correct: "Kwa sababu wanafunzi wanatarajiwa kuboresha ufasaha wao wanapoendelea na masomo mwaka mzima",
    distractors: [
      "Kwa sababu vifungu vya 12.2.1 ni vifupi zaidi kuliko vya 4.2.1",
      "Kwa sababu wanafunzi hupewa muda mfupi zaidi wa kusoma katika 12.2.1",
      "Hakuna sababu — vigezo hivyo ni sawa kabisa",
    ],
    explanation: "Kasi inayotarajiwa huongezeka kadiri muhula unavyoendelea, kuonyesha maendeleo ya ufasaha wa mwanafunzi.",
  },
  {
    prompt: "Alama ya kuuliza (?) mwishoni mwa 'Je, unafahamu kuwa kutembea kwa dakika thelathini kila siku kunaweza kupunguza hatari ya magonjwa mengi?' inamtaka msomaji afanye nini?",
    correct: "Kuinua sauti kidogo kuonyesha ni swali",
    distractors: ["Kupunguza sauti hadi kunyamaza kabisa", "Kusoma haraka zaidi bila kusimama", "Kutabasamu bila kubadilisha sauti"],
    explanation: "Alama ya kuuliza huashiria msomaji apandishe kiimbo cha sauti kidogo mwishoni ili kuonyesha ni swali.",
    passage: KIFUNGU,
  },
  {
    prompt: "Alama ya mshangao (!) mwishoni mwa 'Ni jukumu letu sote kudumisha miili yenye afya!' inamtaka msomaji afanye nini anaposoma?",
    correct: "Kutumia sauti yenye msisitizo na labda ishara ya mwili kuonyesha uzito wa jambo",
    distractors: ["Kupunguza sauti sana ili isisikike", "Kusoma sentensi hiyo kwa haraka bila hisia", "Kuruka sentensi hiyo kabisa"],
    explanation: "Alama ya mshangao huashiria msisitizo — msomaji hutumia sauti yenye nguvu zaidi na anaweza kuambatanisha ishara ifaayo.",
    passage: KIFUNGU,
  },
];

export const kusomaKwaUfasaha: Skill = {
  id: "g7-ksw-ks-kusoma-kwa-ufasaha",
  code: "KS.4",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Ufasaha",
  description: "Jifunze vipengele vya usomaji wa ufasaha — matamshi bora, kasi ifaayo, sauti ipasavyo na ishara zifaazo — na uhesabu kasi ya usomaji kwa maneno kwa dakika.",
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

    if (branch === "kasi") {
      const target = randChoice(rng, [90, 95] as const);
      const substrand = target === 90 ? "4.2.1" : "12.2.1";
      const minutes = randChoice(rng, [2, 3, 4] as const);
      const delta = randChoice(rng, [-15, -5, 0, 10, 20] as const);
      const wpm = target + delta;
      const words = wpm * minutes;
      const meets = wpm >= target;
      const choices = shuffle(rng, [
        `Ndiyo, kwa sababu ${words} ÷ ${minutes} = ${wpm} maneno kwa dakika, ambayo ni sawa na au zaidi ya maneno ${target}`,
        `Hapana, kwa sababu ${words} ÷ ${minutes} = ${wpm} maneno kwa dakika, ambayo ni chini ya maneno ${target}`,
        `Ndiyo, kwa sababu alisoma jumla ya maneno ${words} bila kukosea`,
        `Hapana, kwa sababu alitumia dakika nyingi mno kusoma kifungu hicho`,
      ]);
      const correctText =
        meets
          ? `Ndiyo, kwa sababu ${words} ÷ ${minutes} = ${wpm} maneno kwa dakika, ambayo ni sawa na au zaidi ya maneno ${target}`
          : `Hapana, kwa sababu ${words} ÷ ${minutes} = ${wpm} maneno kwa dakika, ambayo ni chini ya maneno ${target}`;
      return {
        kind: "multiple-choice",
        prompt: `Mwanafunzi alisoma maneno ${words} ndani ya dakika ${minutes} wakati wa zoezi la kusoma kwa ufasaha. Kigezo cha ${substrand} kinahitaji angalau maneno ${target} kwa dakika. Je, mwanafunzi alifikia kigezo hicho?`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint: "Gawanya jumla ya maneno kwa idadi ya dakika ili kupata kasi kwa dakika moja, kisha ulinganishe na kigezo.",
        explanation: `${words} ÷ ${minutes} = ${wpm} maneno kwa dakika. Kigezo cha ${substrand} ni angalau maneno ${target} kwa dakika, hivyo mwanafunzi ${meets ? "alifikia" : "hakufikia"} kigezo hicho.`,
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
