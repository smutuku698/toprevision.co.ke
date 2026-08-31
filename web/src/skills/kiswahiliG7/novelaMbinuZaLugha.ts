import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MBINU: { jina: string; maana: string; mfano: string }[] = [
  { jina: "Tashbihi", maana: "Kulinganisha vitu viwili tofauti kwa kutumia neno la kulinganisha kama 'kama' au 'mfano wa'", mfano: "Alikimbia kama sungura." },
  { jina: "Sitiari", maana: "Kulinganisha vitu viwili moja kwa moja bila kutumia neno la kulinganisha kama 'kama'", mfano: "Yeye ni simba wa vita." },
  { jina: "Nahau", maana: "Kifungu cha maneno chenye maana tofauti na maana halisi ya maneno yenyewe", mfano: "Alipiga chenga swali gumu la mwalimu." },
  { jina: "Methali", maana: "Msemo wa kimapokeo wenye hekima au funzo la maisha", mfano: "Haraka haraka haina baraka." },
  { jina: "Tasfida", maana: "Matumizi ya maneno laini badala ya maneno makali au magumu kusikika", mfano: "Amelala usingizi wa milele." },
  { jina: "Tanakali za Sauti", maana: "Maneno yanayoiga sauti halisi za vitu au matendo", mfano: "Mvua ilikuwa ikinyesha shwaa shwaa." },
];

const HATUA = [
  { id: "h1", label: "Soma sentensi kwa makini uelewe maana yake ya juu juu" },
  { id: "h2", label: "Angalia kama kuna neno la kulinganisha kama 'kama' au 'mfano wa'" },
  { id: "h3", label: "Tafakari kama maneno yana maana tofauti na maana yake halisi" },
  { id: "h4", label: "Amua ni mbinu gani ya lugha inayotumika na ueleze umuhimu wake" },
];

interface Swali {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const MASWALI: Swali[] = [
  {
    prompt: "Sentensi 'Alikimbia kama sungura' ina mbinu gani ya lugha?",
    correct: "Tashbihi",
    distractors: ["Sitiari", "Nahau", "Tanakali za Sauti"],
    explanation: "Sentensi hii hulinganisha kasi ya mtu na sungura kwa kutumia neno 'kama', hivyo ni tashbihi.",
  },
  {
    prompt: "Sentensi 'Yeye ni simba wa vita' ina mbinu gani ya lugha?",
    correct: "Sitiari",
    distractors: ["Tashbihi", "Methali", "Tasfida"],
    explanation: "Sentensi hii inamlinganisha mtu na simba moja kwa moja bila kutumia 'kama', hivyo ni sitiari.",
  },
  {
    prompt: "Nahau 'kufa moyo' ina maana gani?",
    correct: "Kukata tamaa",
    distractors: ["Kufariki dunia halisi", "Kuwa na furaha kubwa", "Kuwa na njaa kali"],
    explanation: "Nahau 'kufa moyo' haina maana halisi ya kufa — humaanisha kukata tamaa.",
  },
  {
    prompt: "Methali 'Haraka haraka haina baraka' inatufundisha nini?",
    correct: "Kufanya mambo kwa pupa mara nyingi huleta madhara; ni vyema kuwa mvumilivu",
    distractors: [
      "Ni vyema kufanya kila kitu kwa haraka iwezekanavyo",
      "Baraka hutokana na kufanya mambo haraka",
      "Uvumilivu si muhimu katika maisha",
    ],
    explanation: "Methali hii inafundisha kuwa kufanya mambo kwa haraka mno mara nyingi kunaweza kuleta madhara badala ya faida.",
  },
  {
    prompt: "Ni sentensi ipi kati ya hizi iliyo mfano wa tasfida?",
    correct: "'Amelala usingizi wa milele' badala ya 'amefariki'",
    distractors: [
      "'Alikimbia kama sungura' badala ya 'alikimbia haraka'",
      "'Mvua ilikuwa ikinyesha shwaa shwaa' badala ya 'mvua ilinyesha'",
      "'Ni simba wa vita' badala ya 'ni shujaa'",
    ],
    explanation: "Tasfida ni matumizi ya maneno laini badala ya maneno magumu kusikika — 'amelala usingizi wa milele' hutumika badala ya 'amefariki'.",
  },
  {
    prompt: "Sentensi 'Bunduki ililia \"ta!\"' ina mbinu gani ya lugha?",
    correct: "Tanakali za Sauti",
    distractors: ["Sitiari", "Nahau", "Methali"],
    explanation: "Neno 'ta!' huiga sauti halisi ya bunduki, hivyo ni tanakali za sauti.",
  },
  {
    prompt: "Umuhimu wa methali katika mazungumzo au uandishi ni upi?",
    correct: "Hubeba hekima ya jamii kwa njia fupi na huimarisha ujumbe kwa mfano wa kimapokeo",
    distractors: [
      "Hutumiwa kufanya sentensi ziwe ndefu zaidi bila sababu",
      "Hazina uhusiano wowote na mafunzo ya maisha",
      "Hutumiwa tu na watoto wadogo shuleni",
    ],
    explanation: "Methali hubeba hekima ya kimapokeo ya jamii na huimarisha ujumbe kwa njia fupi na yenye mvuto.",
  },
];

const MFANO_SENTENSI: { sentensi: string; jina: string }[] = [
  { sentensi: "Yeye ni simba wa vita.", jina: "Sitiari" },
  { sentensi: "Alikimbia kama sungura.", jina: "Tashbihi" },
  { sentensi: "Alipiga chenga swali gumu la mwalimu.", jina: "Nahau" },
  { sentensi: "Haraka haraka haina baraka.", jina: "Methali" },
  { sentensi: "Amelala usingizi wa milele.", jina: "Tasfida" },
  { sentensi: "Mvua ilikuwa ikinyesha shwaa shwaa.", jina: "Tanakali za Sauti" },
];

export const novelaMbinuZaLugha: Skill = {
  id: "g7-ksw-ks-novela-mbinu-za-lugha",
  code: "KS.11",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Kina: Mbinu za Lugha",
  description: "Tambua mbinu za lugha — tashbihi, sitiari, nahau, methali, tasfida na tanakali za sauti — na ueleze umuhimu wake katika kazi ya fasihi.",
  generate(rng) {
    const branch = randChoice(rng, ["istilahi", "kategoria", "hatua", "fill", "swali"] as const);
    const hint = "Angalia kama kuna neno la kulinganisha, maana tofauti na maneno halisi, au sauti inayoigwa.";

    if (branch === "istilahi") {
      const tokens = shuffle(rng, MBINU.map((m) => ({ id: m.jina, label: m.jina })));
      const targets = shuffle(rng, MBINU.map((m) => ({ id: m.jina, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of MBINU) correctMap[m.jina] = m.jina;
      return {
        kind: "click-match",
        prompt: "Oanisha kila mbinu ya lugha na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: MBINU.map((m) => `${m.jina} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "kategoria") {
      const items = MFANO_SENTENSI.map((m, i) => ({ id: `f${i}`, label: m.sentensi, b: m.jina }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        prompt: "Panga kila sentensi kulingana na mbinu ya lugha inayotumika ndani yake.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: MBINU.map((m) => ({ id: m.jina, label: m.jina })),
        correctBucket,
        hint,
        explanation: MFANO_SENTENSI.map((m) => `"${m.sentensi}" ni mfano wa ${m.jina}.`).join(" "),
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA);
      return {
        kind: "ordering",
        prompt: "Panga hatua zifuatazo za kutambua mbinu ya lugha katika sentensi.",
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items,
        correctOrder: HATUA.map((h) => h.id),
        hint: "Anza kwa kuelewa maana ya juu juu, kisha uchunguze ishara za mbinu husika.",
        explanation: HATUA.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu mbinu za lugha.",
        before: "Msemo wa kimapokeo wenye hekima au funzo la maisha, kama vile 'Pole pole ndio mwendo', huitwa",
        after: ".",
        correctAnswer: "methali",
        inputMode: "text",
        hint: "Fikiria msemo wa zamani unaobeba hekima ya jamii.",
        explanation: "Methali ni msemo wa kimapokeo wenye hekima au funzo la maisha.",
      };
    }

    const swali = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [swali.correct, ...swali.distractors]);
    return {
      kind: "multiple-choice",
      prompt: swali.prompt,
      choices,
      correctIndex: choices.indexOf(swali.correct),
      layout: "list",
      hint,
      explanation: swali.explanation,
    };
  },
};
