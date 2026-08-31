import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KAZI_ZA_ALAMA: { id: string; label: string; mfano: string }[] = [
  {
    id: "mabano-maelezo",
    label: "Mabano kuongeza maelezo ya ziada yasiyo ya lazima kwa maana kuu",
    mfano: "Jomo Kenyatta (rais wa kwanza wa Kenya) alizaliwa Gatundu.",
  },
  {
    id: "mabano-tafsiri",
    label: "Mabano kutoa tafsiri au ufafanuzi mfupi wa neno",
    mfano: "Ugonjwa wa malaria (unaosambazwa na mbu) huathiri watu wengi Kenya.",
  },
  {
    id: "kistari-maneno",
    label: "Kistari kifupi kuunganisha majina mawili yanayohusiana",
    mfano: "Treni ya Nairobi-Mombasa iliondoka saa mbili asubuhi.",
  },
  {
    id: "kistari-mgawanyo",
    label: "Kistari kifupi kugawanya neno refu mwishoni mwa mstari",
    mfano: "Wanafunzi wengi wa dara-\nsa la saba walifaulu mtihani.",
  },
];

const SENTENSI_SAHIHI = [
  "Ziwa Victoria (ziwa kubwa zaidi Afrika) lina samaki wengi.",
  "Mechi ya Kenya-Uganda ilivutia mashabiki wengi uwanjani.",
  "Bw. Mutua (mwalimu wa hesabu) alifundisha darasa la nane.",
  "Barabara ya Nairobi-Nakuru ilikarabatiwa mwaka jana.",
];

const SENTENSI_SI_SAHIHI = [
  "Ziwa Victoria) ziwa kubwa zaidi Afrika lina samaki wengi.",
  "Mechi ya Kenya - - Uganda ilivutia mashabiki wengi uwanjani.",
  "Bw. Mutua (mwalimu wa hesabu alifundisha darasa la nane.",
  "Barabara ya Nairobi -Nakuru- ilikarabatiwa mwaka jana.",
];

const FILL_ITEMS: { kabla: string; baada: string; jibu: string; maelezo: string }[] = [
  {
    kabla: "Wangari Maathai",
    baada: "mshindi wa Tuzo ya Amani ya Nobel) alipanda miti mingi nchini Kenya.",
    jibu: "(",
    maelezo: "Mabano hufungua kabla ya maelezo ya ziada yanayofafanua zaidi kuhusu Wangari Maathai bila kubadilisha maana kuu ya sentensi.",
  },
  {
    kabla: "Basi la njia ya Nairobi",
    baada: "Kisumu liliondoka asubuhi na mapema.",
    jibu: "-",
    maelezo: "Kistari kifupi hutumika kuunganisha majina mawili ya mahali yanayoonyesha njia moja, kama 'Nairobi-Kisumu'.",
  },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Mabano ( ) hutumiwa lini katika sentensi ya Kiswahili?",
    sahihi: "Kuongeza maelezo ya ziada au ufafanuzi ambao si wa lazima kwa maana kuu ya sentensi",
    makosa: [
      "Kuunganisha majina mawili yanayohusiana",
      "Kuonyesha mwisho wa sentensi ya kawaida",
      "Kuonyesha hisia kali za mzungumzaji",
    ],
  },
  {
    swali: "Kistari kifupi (-) hutumika hasa kufanya nini?",
    sahihi: "Kuunganisha maneno au majina mawili yanayohusiana, au kugawanya neno refu mwishoni mwa mstari",
    makosa: [
      "Kuongeza maelezo marefu ya ziada kuhusu jambo",
      "Kuonyesha swali linalohitaji jibu",
      "Kuorodhesha vitu vingi mfululizo",
    ],
  },
  {
    swali: "Katika sentensi 'Daraja la Nyali (lililojengwa mwaka 1980) linaunganisha Mombasa na Kisiwa cha Nyali', mabano yametumika kufanya nini?",
    sahihi: "Kuongeza taarifa ya ziada kuhusu wakati daraja hilo lilijengwa, bila kubadilisha maana kuu ya sentensi",
    makosa: [
      "Kuonyesha kwamba sentensi ina makosa ya kisarufi",
      "Kuunganisha maneno mawili kuunda neno moja",
      "Kuashiria mwisho wa habari nzima",
    ],
  },
  {
    swali: "Ni ipi kati ya sentensi zifuatazo iliyotumia kistari kifupi kwa usahihi?",
    sahihi: "Mechi ya Kenya-Uganda ilivutia mashabiki wengi uwanjani.",
    makosa: [
      "Mechi ya Kenya - - Uganda ilivutia mashabiki wengi uwanjani.",
      "Mechi ya - Kenya Uganda ilivutia mashabiki wengi uwanjani.",
      "Mechi ya Kenya Uganda- ilivutia mashabiki wengi uwanjani.",
    ],
  },
];

const HATUA_KUAMUA_MABANO = [
  { id: "soma", label: "Soma sentensi nzima uelewe maana yake kuu" },
  { id: "tambua", label: "Tambua kama kuna maelezo ya ziada yasiyo ya lazima kwa maana kuu" },
  { id: "funga", label: "Ambatanisha maelezo hayo ya ziada ndani ya mabano" },
  { id: "hakiki", label: "Hakikisha sentensi bado ina maana kamili hata bila maelezo hayo ya ziada" },
];

export const viakifishiMabanoKistari: Skill = {
  id: "g7-ksw-ka-viakifishi-mabano-kistari",
  code: "KA.8",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Viakifishi: Mabano na Kistari Kifupi",
  description: "Tambua na tumia ipasavyo mabano ( ) kuongeza maelezo ya ziada, na kistari kifupi (-) kuunganisha maneno au kugawanya neno refu.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, KAZI_ZA_ALAMA.map((k) => ({ id: k.id, label: k.mfano })));
      const targets = shuffle(rng, KAZI_ZA_ALAMA.map((k) => ({ id: k.id, label: k.label })));
      const correctMap: Record<string, string> = {};
      for (const k of KAZI_ZA_ALAMA) correctMap[k.id] = k.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kazi ya mabano au kistari kifupi na mfano wake katika sentensi.",
        tokens,
        targets,
        correctMap,
        hint: "Mabano huongeza maelezo ya ziada; kistari kifupi huunganisha maneno mawili au hugawanya neno refu.",
        explanation: KAZI_ZA_ALAMA.map((k) => `${k.label} — mfano: "${k.mfano}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const sahihi = shuffle(rng, SENTENSI_SAHIHI).slice(0, 3);
      const siSahihi = shuffle(rng, SENTENSI_SI_SAHIHI).slice(0, 3);
      const items = shuffle(rng, [
        ...sahihi.map((label) => ({ id: `s-${label}`, label, bucket: "sahihi" })),
        ...siSahihi.map((label) => ({ id: `x-${label}`, label, bucket: "sisahihi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zimetumia mabano au kistari kifupi kwa usahihi au la.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Matumizi Sahihi" },
          { id: "sisahihi", label: "Yana Makosa" },
        ],
        correctBucket,
        hint: "Mabano lazima yafunguliwe na kufungwa; kistari kifupi hutumika mara moja tu kuunganisha maneno.",
        explanation: `Sahihi: ${sahihi.join(" / ")}. Zenye makosa: ${siSahihi.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Weka alama ifaayo ya uakifishi inayokosekana katika sentensi hii.",
        before: entry.kabla,
        after: entry.baada,
        correctAnswer: entry.jibu,
        inputMode: "text",
        hint: "Fikiria kama sentensi inahitaji mabano ya maelezo ya ziada au kistari cha kuunganisha majina.",
        explanation: entry.maelezo,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_KUAMUA_MABANO);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kuamua iwapo sentensi inahitaji mabano ya maelezo ya ziada.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUAMUA_MABANO.map((h) => h.id),
        hint: "Anza kwa kusoma sentensi nzima, kisha tambua maelezo ya ziada, yafungie mabano, na hatimaye hakiki.",
        explanation: HATUA_KUAMUA_MABANO.map((h) => h.label).join(" → "),
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
      hint: "Mabano huongeza maelezo ya ziada; kistari kifupi huunganisha maneno mawili yanayohusiana.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
