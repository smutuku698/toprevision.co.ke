import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KAZI_ZA_ALAMA: { kazi: string; mfano: string }[] = [
  { kazi: "Alama ya hisi kuonyesha mshangao mkubwa", mfano: "Ajabu! Soko limesafishwa vizuri kiasi hiki!" },
  { kazi: "Alama ya hisi kuonyesha amri kali", mfano: "Tupa taka pipani sasa hivi!" },
  { kazi: "Ritifaa kuonyesha kudondoshwa kwa herufi katika ushairi", mfano: "Nimekwend' sokoni kuuza mboga" },
  { kazi: "Ritifaa kuonyesha ufupisho wa tarehe", mfano: "Kampeni ya usafi ilianza mwaka wa '99" },
];

const SENTENSI_SAHIHI = [
  "Moto! Kimbieni haraka kutoka sokoni!",
  "Usitupe taka ovyo hapa!",
  "Hongera kwa kazi nzuri ya kusafisha kituo cha mabasi!",
  "Simama pale pale usisogee!",
];

const SENTENSI_SI_SAHIHI = [
  "Kesho tutakwenda sokoni.",
  "Wanafunzi walikusanya taka kila siku.",
  "Afisa wa usafi alipita kukagua vituo vya mabasi.",
  "Halmashauri ilipanga kusafisha soko wiki ijayo.",
];

const FILL_ITEMS: { kabla: string; baada: string; jibu: string; maelezo: string }[] = [
  {
    kabla: "Tazama gari linakuja",
    baada: "",
    jibu: "!",
    maelezo: "Sentensi hii inaonyesha onyo la ghafla lenye hisia kali, hivyo hutumia alama ya hisi (!).",
  },
  {
    kabla: "Wananchi walipiga vigelegele wakisema Hongera",
    baada: "kwa kusafisha soko letu!",
    jibu: "!",
    maelezo: "Furaha kali ya wananchi inaonyeshwa kwa alama ya hisi mwishoni mwa sentensi.",
  },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Alama ya hisi (!) hutumiwa lini katika maandishi?",
    sahihi: "Inapoonyeshwa mshangao au hisia kali kama furaha, hasira au mshtuko",
    makosa: [
      "Inapoorodheshwa vitu vingi mfululizo",
      "Mwishoni mwa kila sentensi bila ubaguzi",
      "Inapoonyeshwa swali linalohitaji jibu",
    ],
  },
  {
    swali: "Ni ipi kati ya kazi zifuatazo za ritifaa (') katika Kiswahili?",
    sahihi: "Kuonyesha kudondoshwa kwa herufi, hasa katika mashairi",
    makosa: [
      "Kutenganisha vitu viwili au zaidi katika orodha",
      "Kuonyesha mwisho wa sentensi ya kawaida",
      "Kuonyesha mazungumzo halisi ya mzungumzaji",
    ],
  },
  {
    swali: "Katika sentensi 'Usichafue mazingira yetu!', alama ya hisi imetumika kuonyesha nini?",
    sahihi: "Amri kali inayosisitizwa kwa nguvu dhidi ya uchafuzi wa mazingira",
    makosa: [
      "Swali linalohitaji jibu la ndiyo au hapana",
      "Orodha ya mambo ya kufanya",
      "Maelezo ya kawaida yasiyo na msisitizo",
    ],
  },
  {
    swali: "Wanafunzi wa Shule ya Msingi Mwangaza waliandika ubaoni: 'Weka taka mahali pafaapo!' Je, matumizi ya alama ya hisi hapa ni sahihi?",
    sahihi: "Ndiyo, kwa sababu ni amri kali inayosisitiza umuhimu wa usafi wa maeneo ya umma",
    makosa: [
      "Hapana, kwa sababu sentensi hiyo ni swali",
      "Hapana, kwa sababu alama ya hisi haitumiki katika amri",
      "Ndiyo, lakini tu kwenye mashairi",
    ],
  },
];

export const viakifishiHisiRitifaa: Skill = {
  id: "g8-ksw-ka-viakifishi-hisi-ritifaa",
  code: "KA.1",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Viakifishi: Alama ya Hisi na Ritifaa",
  description: "Tambua na tumia ipasavyo alama ya hisi (!) na ritifaa (') katika matini mbalimbali.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const items = KAZI_ZA_ALAMA.map((k, i) => ({ id: `t${i}`, kazi: k.kazi, mfano: k.mfano }));
      const tokens = shuffle(rng, items.map((t) => ({ id: t.id, label: t.mfano })));
      const targets = shuffle(rng, items.map((t) => ({ id: t.id, label: t.kazi })));
      const correctMap: Record<string, string> = {};
      for (const t of items) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kazi ya alama ya uakifishi na mfano wake katika sentensi.",
        tokens,
        targets,
        correctMap,
        hint: "Alama ya hisi huonyesha hisia kali au amri; ritifaa huonyesha herufi iliyodondoshwa.",
        explanation: KAZI_ZA_ALAMA.map((k) => `${k.kazi} — mfano: "${k.mfano}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const sahihi = shuffle(rng, SENTENSI_SAHIHI).slice(0, 3);
      const siSahihi = shuffle(rng, SENTENSI_SI_SAHIHI).slice(0, 3);
      const items = shuffle(rng, [
        ...sahihi.map((label) => ({ id: label, label, bucket: "sahihi" })),
        ...siSahihi.map((label) => ({ id: label, label, bucket: "sisahihi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zinahitaji alama ya hisi (!) au hazihitaji.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Inahitaji Alama ya Hisi" },
          { id: "sisahihi", label: "Haihitaji Alama ya Hisi" },
        ],
        correctBucket,
        hint: "Sentensi zenye hisia kali, mshangao au amri ya nguvu huhitaji alama ya hisi; taarifa za kawaida hazihitaji.",
        explanation: `Zinazohitaji alama ya hisi: ${sahihi.join(" / ")}. Taarifa za kawaida: ${siSahihi.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Weka alama ifaayo ya uakifishi mwishoni mwa sentensi hii.",
        before: entry.kabla,
        after: entry.baada,
        correctAnswer: entry.jibu,
        inputMode: "text",
        hint: "Sentensi hii inaonyesha hisia kali au onyo la ghafla.",
        explanation: entry.maelezo,
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
      hint: "Alama ya hisi huonyesha hisia kali/amri; ritifaa huonyesha herufi iliyodondoshwa.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
