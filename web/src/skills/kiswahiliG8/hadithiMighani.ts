import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE_UWASILISHAJI: { term: string; maelezo: string }[] = [
  { term: "Sauti inayobadilika", maelezo: "Kubadilisha sauti kulingana na hisia za tukio, kwa mfano sauti ya woga au ushindi" },
  { term: "Ishara za mwili na uso", maelezo: "Kutumia mikono na sura ya uso kuonyesha vitendo vya shujaa" },
  { term: "Kushirikisha wasikilizaji", maelezo: "Kuwauliza wasikilizaji maswali au kuwaomba warudie kauli fulani" },
  { term: "Kurudia sehemu muhimu", maelezo: "Kusisitiza tukio muhimu kwa kulirudia ili wasikilizaji walikumbuke" },
  { term: "Matumizi ya kimya cha kimkakati", maelezo: "Kunyamaza kidogo kabla ya tukio kuu ili kuongeza hamu ya wasikilizaji" },
];

const SIFA_ZA_MIGHANI = [
  "Shujaa mkuu mwenye nguvu au ujuzi wa ajabu kupita watu wa kawaida",
  "Vita dhidi ya maadui wenye nguvu, majitu, au nguvu za maumbile",
  "Matumizi ya mubalagha (kutia chumvi) kuonyesha ukuu wa shujaa",
  "Ujumbe wa maadili kama ushujaa na uvumilivu kwa jamii",
];

const SI_SIFA_ZA_MIGHANI = [
  "Wahusika wakuu ni wanyama wanaozungumza kama binadamu",
  "Hadithi fupi ya kitendawili chenye jibu la neno moja",
  "Masimulizi ya matukio ya kawaida ya kila siku bila ushujaa wowote",
  "Wimbo mfupi wa kumlaza mtoto usingizini",
];

const HATUA_KUSIMULIA = [
  { id: "utangulizi", label: "Kumtambulisha shujaa na mazingira ya hadithi" },
  { id: "tatizo", label: "Kueleza tatizo au adui anayemkabili shujaa" },
  { id: "mapambano", label: "Kusimulia mapambano kwa sauti na ishara zenye msisimko" },
  { id: "ushindi", label: "Kueleza jinsi shujaa alivyoshinda kwa ujasiri au ustadi" },
  { id: "mafunzo", label: "Kutoa mafunzo au ujumbe wa hadithi mwishoni" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Mighani ni nini?",
    sahihi: "Hadithi za kishujaa zinazosimulia matendo ya mashujaa wenye nguvu za ajabu dhidi ya maadui",
    makosa: [
      "Hadithi fupi za wanyama zinazotolea mafunzo pekee",
      "Nyimbo za kulaza watoto usingizini",
      "Vitendawili vinavyofunza msamiati",
    ],
  },
  {
    swali: "Kwa nini wasimulizi wa mighani hutumia mubalagha (kutia chumvi) wanaposimulia matendo ya shujaa?",
    sahihi: "Ili kuonyesha ukuu na nguvu za ajabu za shujaa kwa njia ya kuvutia",
    makosa: [
      "Ili kuficha ukweli wa hadithi kutoka kwa wasikilizaji",
      "Ili kufupisha hadithi iwe fupi zaidi",
      "Ili kuepuka kutumia lugha ya heshima",
    ],
  },
  {
    swali: "Mighani hutofautiana vipi na hurafa za kawaida zenye wanyama wanaozungumza?",
    sahihi: "Mighani huhusu mashujaa wenye sifa za kibinadamu au nusu-miungu wenye nguvu za ajabu, si wanyama",
    makosa: [
      "Mighani huhusu wanyama pekee kama wahusika wakuu",
      "Mighani hazina ujumbe wowote wa maadili",
      "Mighani husimuliwa kwa maandishi pekee, kamwe kwa mdomo",
    ],
  },
  {
    swali: "Msimulizi alisimulia ushindi wa shujaa dhidi ya jitu bila kubadilisha sauti wala kutumia ishara yoyote, na wasikilizaji wakachoka haraka. Je, alizingatia vipengele vya uwasilishaji wa mighani ipasavyo?",
    sahihi: "Hapana, kwa kuwa hakutumia sauti wala ishara kuongeza msisimko wa masimulizi",
    makosa: [
      "Ndiyo, kwa sababu alieleza matukio yote kwa usahihi",
      "Ndiyo, kwa sababu alimaliza hadithi haraka",
      "Hapana, kwa sababu hadithi yenyewe haikuwa na ujumbe",
    ],
  },
];

export const hadithiMighani: Skill = {
  id: "g8-ksw-kz-hadithi-mighani",
  code: "KZ.3",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Hadithi Mighani",
  description: "Tambua maana na sifa za mighani, na jadili vipengele vya uwasilishaji na ujumbe wake.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha", "panga", "hatua", "jaza", "swali"] as const);

    if (branch === "oanisha") {
      const chosen = shuffle(rng, VIPENGELE_UWASILISHAJI).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha uwasilishaji wa mighani na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi msimulizi bora wa mighani anavyotumia sauti, ishara, na wasikilizaji wake.",
        explanation: chosen.map((v) => `${v.term} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const sifa = shuffle(rng, SIFA_ZA_MIGHANI).slice(0, 3);
      const siSifa = shuffle(rng, SI_SIFA_ZA_MIGHANI).slice(0, 3);
      const items = shuffle(rng, [
        ...sifa.map((label) => ({ id: label, label, bucket: "sifa" })),
        ...siSifa.map((label) => ({ id: label, label, bucket: "si-sifa" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kauli katika kundi la Sifa za Mighani au Si Sifa za Mighani.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sifa", label: "Sifa za Mighani" },
          { id: "si-sifa", label: "Si Sifa za Mighani" },
        ],
        correctBucket,
        hint: "Mighani huhusu mashujaa wenye nguvu za ajabu na mapambano, si wanyama wanaozungumza wala vitendawili.",
        explanation: `Sifa za mighani: ${sifa.join(" / ")}. Si sifa za mighani: ${siSifa.join(" / ")}.`,
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA_KUSIMULIA);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kusimulia mighani kwa mpangilio unaofaa wa uwasilishaji.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUSIMULIA.map((s) => s.id),
        hint: "Simulizi nzuri huanza kwa kumtambulisha shujaa na kuishia kwa mafunzo ya hadithi.",
        explanation: HATUA_KUSIMULIA.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "jaza") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: "Mbinu ya kutia chumvi ili kuonyesha ukuu na nguvu za ajabu za shujaa katika mighani huitwa",
        after: ".",
        correctAnswer: "mubalagha",
        inputMode: "text",
        hint: "Mbinu hii huchangia msisimko kwa kukuza matendo ya shujaa zaidi ya uhalisia.",
        explanation: "Mbinu hiyo huitwa mubalagha — kutia chumvi ili kuonyesha ukuu wa shujaa na kuvutia wasikilizaji.",
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
      hint: "Mighani huangazia mashujaa wenye nguvu za ajabu, mapambano makubwa, na ujumbe wa maadili kwa jamii.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
