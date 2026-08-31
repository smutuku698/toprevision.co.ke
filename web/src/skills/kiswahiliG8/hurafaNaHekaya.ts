import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE_UWASILISHAJI: { term: string; maelezo: string }[] = [
  { term: "Sauti ya kuchekesha au ya kutisha", maelezo: "Kubadilisha sauti kulingana na tabia ya mhusika, k.m. sauti ya kutisha kwa mzuka au sauti ya ujanja kwa mjanja" },
  { term: "Mkao wa mwili unaoonyesha tabia", maelezo: "Kutumia mikono na sura kuonyesha ujanja au woga wa wahusika" },
  { term: "Vituo vya kimkakati", maelezo: "Kusimama kidogo kabla ya tukio la mshangao ili kuongeza hamu ya wasikilizaji" },
  { term: "Marudio ya kimahadhi", maelezo: "Kurudia msemo fulani wa mhusika ili wasikilizaji waukumbuke na kuufurahia" },
];

const SIFA_HURAFA = [
  "Huhusisha mizuka, mapepo, au miujiza isiyowezekana kiuhalisia",
  "Hulenga zaidi kuburudisha au kuogofya wasikilizaji",
  "Mara nyingi haina ujumbe wa maadili ulio wazi",
  "Huweza kuwa na matukio ya kutisha usiku au mahali pa ajabu",
];

const SIFA_HEKAYA = [
  "Humhusisha mhusika mjanja au mpumbavu katika matukio ya kuchekesha",
  "Hulenga kufundisha somo maalum la maadili kupitia kicheko",
  "Huwa na ujumbe wa maadili ulio wazi mwishoni",
  "Huakisi hali halisi za maisha ya kila siku kwa njia ya kuchekesha",
];

const HATUA_KUSIMULIA = [
  { id: "mazingira", label: "Kuanzisha mazingira ya ajabu au ya kawaida ya hadithi" },
  { id: "mhusika", label: "Kumtambulisha mhusika mkuu — mjanja, mpumbavu, au kiumbe cha ajabu" },
  { id: "tukio", label: "Kueleza tukio kuu la kushangaza au la kuchekesha" },
  { id: "kilele", label: "Kufikia kilele cha hadithi kwa mshangao au kicheko" },
  { id: "hitimisho", label: "Kutoa hitimisho au ujumbe wa hadithi" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Hurafa na hekaya hutofautianaje?",
    sahihi: "Hurafa huhusu mambo ya kimiujiza yasiyo na ujumbe dhahiri, wakati hekaya huhusu mhusika mjanja mwenye ujumbe wa maadili wazi",
    makosa: [
      "Hurafa na hekaya ni kitu kimoja tu kinachoitwa kwa majina mawili",
      "Hekaya huhusu mizuka pekee, wakati hurafa huhusu wanyama pekee",
      "Hurafa huwa na ujumbe wa maadili wazi zaidi kuliko hekaya",
    ],
  },
  {
    swali: "Kwa nini hekaya huwa na mvuto kwa wasikilizaji wa rika zote?",
    sahihi: "Kwa kuwa huchanganya kicheko na mafunzo ya maadili kwa wakati mmoja",
    makosa: [
      "Kwa kuwa hazina wahusika wowote",
      "Kwa kuwa hutumia takwimu za kisayansi",
      "Kwa kuwa husimuliwa kwa maandishi pekee",
    ],
  },
  {
    swali: "Msimulizi alisimulia hadithi ya mzuka aliyetokea usiku kijijini akiwaogofya wanakijiji, bila kutoa ujumbe wowote wa maadili mwishoni. Hadithi hii ni ya aina gani?",
    sahihi: "Hurafa, kwa sababu inahusisha kiumbe cha kimiujiza na haina ujumbe wa maadili ulio wazi",
    makosa: [
      "Hekaya, kwa sababu ilikuwa ya kuchekesha",
      "Hekaya, kwa sababu ina mhusika mjanja",
      "Mighani, kwa sababu ina shujaa mwenye nguvu za ajabu",
    ],
  },
  {
    swali: "Ni ipi kati ya hizi ni mfano wa hekaya?",
    sahihi: "Hadithi ya mtu mjanja aliyemshinda mfanyabiashara tapeli kwa akili, ikiishia na somo la kutokuwa mlafi",
    makosa: [
      "Hadithi ya mzuka anayetembea usiku bila kutoa somo lolote la maadili",
      "Ripoti ya habari kuhusu mkutano wa halmashauri ya kijiji",
      "Maagizo ya jinsi ya kuandaa chakula cha jioni",
    ],
  },
];

export const hurafaNaHekaya: Skill = {
  id: "g8-ksw-kz-hurafa-hekaya",
  code: "KZ.10",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Hadithi Hurafa na Hekaya",
  description: "Tofautisha hurafa na hekaya, tambua ujumbe wake, na jadili vipengele vya uwasilishaji wake.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha", "panga", "hatua", "jaza", "swali"] as const);

    if (branch === "oanisha") {
      const tokens = shuffle(rng, VIPENGELE_UWASILISHAJI.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, VIPENGELE_UWASILISHAJI.map((v) => ({ id: v.term, label: v.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE_UWASILISHAJI) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha uwasilishaji wa hurafa na hekaya na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi msimulizi anavyotumia sauti na mwili kuonyesha tabia za wahusika.",
        explanation: VIPENGELE_UWASILISHAJI.map((v) => `${v.term} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const hurafa = shuffle(rng, SIFA_HURAFA).slice(0, 3);
      const hekaya = shuffle(rng, SIFA_HEKAYA).slice(0, 3);
      const items = shuffle(rng, [
        ...hurafa.map((label) => ({ id: label, label, bucket: "hurafa" })),
        ...hekaya.map((label) => ({ id: label, label, bucket: "hekaya" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila sifa katika kundi la Hurafa au Hekaya.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "hurafa", label: "Hurafa" },
          { id: "hekaya", label: "Hekaya" },
        ],
        correctBucket,
        hint: "Hurafa huhusu mambo ya kimiujiza; hekaya huhusu wahusika wajanja wenye ujumbe wa maadili.",
        explanation: `Hurafa: ${hurafa.join(" / ")}. Hekaya: ${hekaya.join(" / ")}.`,
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA_KUSIMULIA);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kusimulia hurafa au hekaya kwa mpangilio unaofaa.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUSIMULIA.map((s) => s.id),
        hint: "Simulizi huanza kwa mazingira na mhusika, na huishia kwa hitimisho au ujumbe.",
        explanation: HATUA_KUSIMULIA.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "jaza") {
      const jinsi = randChoice(rng, ["hurafa", "hekaya"] as const);
      if (jinsi === "hurafa") {
        return {
          kind: "fill-blank",
          prompt: "Kamilisha sentensi kwa neno lifaalo.",
          before: "Hadithi za kubuni zenye mambo yasiyowezekana kiuhalisia, kama mizuka na miujiza, zinazosimuliwa kuburudisha au kuogofya, huitwa",
          after: ".",
          correctAnswer: "hurafa",
          inputMode: "text",
          hint: "Aina hii ya hadithi mara nyingi haina ujumbe wa maadili ulio wazi.",
          explanation: "Hadithi hizo huitwa hurafa — huhusu mambo ya kimiujiza na hulenga kuburudisha au kuogofya.",
        };
      }
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: "Hadithi fupi za kejeli zenye ujumbe wa maadili dhahiri, zikimhusu mhusika mjanja au mpumbavu, huitwa",
        after: ".",
        correctAnswer: "hekaya",
        inputMode: "text",
        hint: "Aina hii ya hadithi huchanganya kicheko na somo la maadili.",
        explanation: "Hadithi hizo huitwa hekaya — huchanganya kicheko na ujumbe wa maadili dhahiri.",
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
      hint: "Hurafa huhusu mambo ya kimiujiza bila ujumbe dhahiri; hekaya huhusu wahusika wajanja wenye somo la maadili.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
