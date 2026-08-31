import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE_UWASILISHAJI: { term: string; maelezo: string }[] = [
  { term: "Maneno ya kuanzia ya kimapokeo", maelezo: "Kutumia maneno kama 'Hapo zamani za kale' kuashiria kuwa hadithi ni ya asili ya mbali" },
  { term: "Sauti ya heshima na taadhima", maelezo: "Kutumia sauti tulivu yenye mvuto kuonyesha kuwa hadithi ni takatifu kwa jamii" },
  { term: "Maelezo ya kina ya maumbile", maelezo: "Kueleza kwa undani jinsi kitu cha asili kama mlima au mto kilivyoumbika" },
  { term: "Uhusiano na imani za jamii", maelezo: "Kuunganisha hadithi na imani au desturi za jamii husika" },
];

const SIFA_ZA_VISASILI = [
  "Huelezea chanzo au asili ya kitu, kwa mfano dunia, jua, mlima, au mto",
  "Huhusisha miungu, mizimu, au nguvu za asili zenye uwezo wa ajabu",
  "Huaminika kuwa ni kweli na jamii husika hapo awali",
  "Hutumika kueleza matukio ya kimaumbile kwa njia ya kiimani",
];

const SI_SIFA_ZA_VISASILI = [
  "Maelezo ya kisayansi yenye ushahidi wa kimajaribio",
  "Taarifa ya habari kuhusu tukio la sasa iliyoripotiwa gazetini",
  "Maagizo ya hatua za kufuata kutengeneza kifaa",
  "Mazungumzo ya kawaida kati ya marafiki kuhusu mchezo wa mpira",
];

const HATUA_KISASILI = [
  { id: "wakati", label: "Kuanza kwa wakati wa kale usiojulikana, k.m. 'Hapo zamani za kale'" },
  { id: "hali-kabla", label: "Kueleza hali ilivyokuwa kabla ya tukio la asili" },
  { id: "tendo", label: "Kuingiza tendo la nguvu ya asili au mungu linaloleta mabadiliko" },
  { id: "matokeo", label: "Kueleza matokeo yanayoonekana hadi leo" },
  { id: "maadili", label: "Kuunganisha hadithi na imani au maadili ya jamii ya sasa" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Visasili ni nini?",
    sahihi: "Hadithi za kizushi zinazoeleza chanzo cha vitu vya asili kama milima na mito, mara nyingi zikihusisha miungu",
    makosa: [
      "Ripoti za kisayansi zenye ushahidi wa kimajaribio kuhusu asili ya dunia",
      "Maagizo ya hatua za kutengeneza kifaa cha nyumbani",
      "Nyimbo za kuwaburudisha watoto pekee",
    ],
  },
  {
    swali: "Visasili hutofautianaje na taarifa za kisayansi kuhusu asili ya vitu vya maumbile?",
    sahihi: "Visasili hutumia hadithi za kizushi zenye miungu au nguvu za asili, si ushahidi wa kimajaribio",
    makosa: [
      "Visasili na taarifa za kisayansi ni kitu kimoja kabisa",
      "Visasili hutolewa na wanasayansi tu",
      "Visasili hazihusu asili ya vitu vyovyote",
    ],
  },
  {
    swali: "Kwa nini visasili vilikuwa muhimu kwa jamii za kale?",
    sahihi: "Viliwasaidia kuelewa na kukubaliana na matukio ya kimaumbile waliyoyaona kila siku",
    makosa: [
      "Viliwasaidia kujifunza hesabu za kisasa",
      "Vilikuwa njia pekee ya kuandika barua",
      "Havikuwa na umuhimu wowote kwa jamii",
    ],
  },
  {
    swali: "Mzee mmoja alipoeleza asili ya mlima fulani, alitumia maneno 'Hapo zamani za kale', sauti tulivu yenye heshima, na akaunganisha hadithi na imani za jamii yao. Je, alizingatia vipengele vya kimsingi vya uwasilishaji wa visasili?",
    sahihi: "Ndiyo, kwa sababu alitumia maneno ya kimapokeo, sauti ya taadhima, na kuunganisha na imani za jamii",
    makosa: [
      "Hapana, kwa sababu hakutaja tarehe kamili ya tukio",
      "Hapana, kwa sababu alitumia sauti tulivu badala ya kupiga kelele",
      "Ndiyo, lakini tu kwa sababu alikuwa mzee wa jamii",
    ],
  },
];

export const hadithiVisasili: Skill = {
  id: "g8-ksw-kz-hadithi-visasili",
  code: "KZ.4",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Hadithi Visasili",
  description: "Tambua maana na sifa za visasili, na jadili vipengele vya kimsingi vya uwasilishaji wake.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha", "panga", "hatua", "jaza", "swali"] as const);

    if (branch === "oanisha") {
      const tokens = shuffle(rng, VIPENGELE_UWASILISHAJI.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, VIPENGELE_UWASILISHAJI.map((v) => ({ id: v.term, label: v.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE_UWASILISHAJI) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha uwasilishaji wa visasili na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi msimulizi wa kisasili anavyoonyesha kuwa hadithi ni ya asili takatifu ya jamii.",
        explanation: VIPENGELE_UWASILISHAJI.map((v) => `${v.term} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const sifa = shuffle(rng, SIFA_ZA_VISASILI).slice(0, 3);
      const siSifa = shuffle(rng, SI_SIFA_ZA_VISASILI).slice(0, 3);
      const items = shuffle(rng, [
        ...sifa.map((label) => ({ id: label, label, bucket: "sifa" })),
        ...siSifa.map((label) => ({ id: label, label, bucket: "si-sifa" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kauli katika kundi la Sifa za Visasili au Si Sifa za Visasili.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sifa", label: "Sifa za Visasili" },
          { id: "si-sifa", label: "Si Sifa za Visasili" },
        ],
        correctBucket,
        hint: "Visasili huhusisha miungu au nguvu za asili kueleza chanzo cha vitu, si ushahidi wa kisayansi au maagizo.",
        explanation: `Sifa za visasili: ${sifa.join(" / ")}. Si sifa za visasili: ${siSifa.join(" / ")}.`,
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA_KISASILI);
      return {
        kind: "ordering",
        prompt: "Panga muundo wa masimulizi ya kisasili kwa mpangilio unaofaa.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KISASILI.map((s) => s.id),
        hint: "Kisasili huanza wakati wa kale, kisha hueleza tendo la nguvu ya asili, na huishia kuunganishwa na maadili ya sasa.",
        explanation: HATUA_KISASILI.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "jaza") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: "Hadithi za kizushi zinazoeleza chanzo cha vitu vya asili kama milima na mito, mara nyingi zikihusisha miungu, huitwa",
        after: ".",
        correctAnswer: "visasili",
        inputMode: "text",
        hint: "Hii ni aina ya fasihi simulizi inayohusu asili ya ulimwengu na maumbile.",
        explanation: "Hadithi hizo huitwa visasili — hueleza chanzo cha vitu vya asili kwa njia ya kizushi inayohusisha nguvu za miungu.",
      };
    }

    const entry = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
    return {
      kind: "multiple-choice",
      prompt: entry.swali,
      choices,
      correctIndex: choices.indexOf(entry.sahihi),
      layout: "list",
      hint: "Visasili huelezea asili ya maumbile kwa kutumia miungu na nguvu za asili, ikitofautiana na maelezo ya kisayansi.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
