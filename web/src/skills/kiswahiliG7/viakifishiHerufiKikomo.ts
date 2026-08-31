import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KAZI_ZA_HERUFI_KIKOMO: { id: string; label: string; mfano: string }[] = [
  { id: "mwanzo", label: "Herufi kubwa mwanzoni mwa sentensi", mfano: "Watoto walicheza mpira baada ya shule." },
  { id: "jinamtu", label: "Herufi kubwa kwa jina la mtu", mfano: "Wanjiku alifika shuleni mapema kuliko wenzake." },
  { id: "jinamahali", label: "Herufi kubwa kwa jina la mahali au taasisi", mfano: "Familia yangu inaishi karibu na Ziwa Victoria." },
  { id: "kikomo", label: "Kikomo (.) mwishoni mwa sentensi ya kawaida", mfano: "Mvua ilinyesha sana jana usiku." },
];

const SENTENSI_SAHIHI = [
  "Juma na Amina walienda sokoni Mombasa jana.",
  "Mto Tana ni mrefu sana nchini Kenya.",
  "Bw. Otieno alifundisha somo la hesabu darasa la saba.",
  "Shule yetu iko karibu na Mlima Kenya.",
  "Nasimiyu alishinda mbio za mita mia shuleni.",
];

const SENTENSI_SI_SAHIHI = [
  "juma alikwenda shuleni mapema kila siku",
  "mto tana ni mrefu sana nchini kenya",
  "bw otieno alifundisha hesabu darasa la saba",
  "shule yetu iko karibu na mlima kenya",
  "nasimiyu alishinda mbio za mita mia shuleni",
];

const FILL_HERUFI: { kabla: string; baada: string; jibu: string; maelezo: string }[] = [
  {
    kabla: "",
    baada: " alienda sokoni jioni kununua mboga.",
    jibu: "Wanjiru",
    maelezo: "Jina la mtu 'Wanjiru' ni nomino mahususi, hivyo huanza kwa herufi kubwa popote linapotokea, hasa mwanzoni mwa sentensi.",
  },
  {
    kabla: "",
    baada: " ni mji mkuu wa Kenya na una wakazi wengi.",
    jibu: "Nairobi",
    maelezo: "Majina ya miji na maeneo kama 'Nairobi' ni nomino mahususi zinazoandikwa kwa herufi kubwa, hasa mwanzoni mwa sentensi.",
  },
];

const FILL_KIKOMO: { kabla: string; baada: string; jibu: string; maelezo: string }[] = [
  {
    kabla: "Mvua ilinyesha sana jana usiku",
    baada: "",
    jibu: ".",
    maelezo: "Hii ni sentensi ya kawaida inayotoa taarifa, hivyo inahitaji kikomo (.) mwishoni ili kuonyesha imekamilika.",
  },
  {
    kabla: "Wanafunzi wa Shule ya Msingi Mwangaza walifanya mtihani wa Kiswahili wiki iliyopita",
    baada: "",
    jibu: ".",
    maelezo: "Sentensi hii inaeleza taarifa kamili, hivyo inahitaji kikomo mwishoni kuashiria mwisho wake.",
  },
];

const HATUA_KUANGALIA_SENTENSI = [
  { id: "mwanzo", label: "Angalia herufi ya kwanza kabisa ya sentensi ili kuhakikisha ni herufi kubwa" },
  { id: "kati", label: "Fuatilia maneno ya kati ya sentensi ukitambua majina mahususi ya watu au mahali" },
  { id: "mwisho", label: "Fika sehemu ya mwisho ya sentensi na uhakikishe kuna kikomo (.)" },
  { id: "kagua", label: "Soma sentensi nzima tena ili kuhakikisha imesahihika kabisa" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Herufi kubwa hutumiwa lini mwanzoni mwa neno katika sentensi ya Kiswahili?",
    sahihi: "Mwanzoni mwa kila sentensi mpya na kwa majina mahususi ya watu, mahali au taasisi",
    makosa: [
      "Kwa kila neno katika sentensi bila ubaguzi",
      "Tu kwenye maneno marefu yenye silabi nyingi",
      "Kwa vitenzi vyote vinavyoonyesha wakati uliopita",
    ],
  },
  {
    swali: "Ni ipi kati ya sentensi zifuatazo iliyoandikwa kwa usahihi wa herufi kubwa na kikomo?",
    sahihi: "Kiptoo alisafiri kutoka Eldoret hadi Kisumu kwa basi.",
    makosa: [
      "kiptoo alisafiri kutoka eldoret hadi kisumu kwa basi",
      "Kiptoo alisafiri kutoka eldoret hadi kisumu kwa basi",
      "kiptoo Alisafiri Kutoka Eldoret Hadi Kisumu Kwa Basi.",
    ],
  },
  {
    swali: "Katika sentensi 'Mwalimu mkuu wa shule yetu ni Bi. Chebet', kwa nini 'Chebet' imeandikwa kwa herufi kubwa?",
    sahihi: "Kwa sababu ni jina mahususi la mtu, na majina ya watu huandikwa kwa herufi kubwa daima",
    makosa: [
      "Kwa sababu neno hilo liko mwishoni mwa sentensi",
      "Kwa sababu neno hilo lina herufi nne pekee",
      "Kwa sababu neno hilo ni kivumishi",
    ],
  },
  {
    swali: "Mwanafunzi aliandika: 'wanafunzi walitembelea bustani ya wanyama nairobi' Ni makosa gani yanayoonekana hapa?",
    sahihi: "Neno la kwanza na jina la mahali 'nairobi' havikuanza kwa herufi kubwa, wala hakuna kikomo mwishoni",
    makosa: [
      "Sentensi ina maneno mengi kupita kiasi",
      "Sentensi haina kitenzi kabisa",
      "Sentensi imeandikwa kwa lugha isiyo ya Kiswahili",
    ],
  },
  {
    swali: "Kikomo (.) hutumika hasa kuonyesha nini mwishoni mwa sentensi?",
    sahihi: "Kwamba wazo au taarifa iliyotolewa katika sentensi hiyo imekamilika",
    makosa: [
      "Kwamba sentensi inayofuata itakuwa swali",
      "Kwamba mzungumzaji ana hisia kali za mshangao",
      "Kwamba sentensi ina makosa ya kisarufi",
    ],
  },
];

export const viakifishiHerufiKikomo: Skill = {
  id: "g7-ksw-ka-viakifishi-herufi-kikomo",
  code: "KA.1",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Viakifishi: Herufi Kubwa na Kikomo",
  description: "Tambua na tumia ipasavyo herufi kubwa mwanzoni mwa sentensi na kwa majina mahususi, pamoja na kikomo mwishoni mwa sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fillHerufi", "fillKikomo", "order", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, KAZI_ZA_HERUFI_KIKOMO.map((k) => ({ id: k.id, label: k.mfano })));
      const targets = shuffle(rng, KAZI_ZA_HERUFI_KIKOMO.map((k) => ({ id: k.id, label: k.label })));
      const correctMap: Record<string, string> = {};
      for (const k of KAZI_ZA_HERUFI_KIKOMO) correctMap[k.id] = k.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kanuni ya herufi kubwa au kikomo na mfano wake katika sentensi.",
        tokens,
        targets,
        correctMap,
        hint: "Herufi kubwa hutumika mwanzoni mwa sentensi na kwa majina mahususi; kikomo huweka mwisho wa sentensi.",
        explanation: KAZI_ZA_HERUFI_KIKOMO.map((k) => `${k.label} — mfano: "${k.mfano}".`).join(" "),
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
        prompt: "Panga sentensi hizi kulingana na kama zimeandikwa kwa usahihi wa herufi kubwa na kikomo au la.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Herufi Kubwa na Kikomo Sahihi" },
          { id: "sisahihi", label: "Zina Makosa" },
        ],
        correctBucket,
        hint: "Angalia herufi ya kwanza ya sentensi, majina mahususi ndani yake, na kikomo mwishoni.",
        explanation: `Sahihi: ${sahihi.join(" / ")}. Zenye makosa: ${siSahihi.join(" / ")}.`,
      };
    }

    if (branch === "fillHerufi") {
      const entry = randChoice(rng, FILL_HERUFI);
      return {
        kind: "fill-blank",
        prompt: "Andika neno linalokosekana likianza kwa herufi kubwa ipasavyo.",
        before: entry.kabla,
        after: entry.baada,
        correctAnswer: entry.jibu,
        inputMode: "text",
        hint: "Jina mahususi la mtu au mahali huandikwa kwa herufi kubwa, hasa likiwa neno la kwanza la sentensi.",
        explanation: entry.maelezo,
      };
    }

    if (branch === "fillKikomo") {
      const entry = randChoice(rng, FILL_KIKOMO);
      return {
        kind: "fill-blank",
        prompt: "Weka alama ifaayo ya uakifishi mwishoni mwa sentensi hii.",
        before: entry.kabla,
        after: entry.baada,
        correctAnswer: entry.jibu,
        inputMode: "text",
        hint: "Sentensi hii ni taarifa ya kawaida, hivyo inahitaji kikomo.",
        explanation: entry.maelezo,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_KUANGALIA_SENTENSI);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kukagua sentensi ili kuhakikisha herufi kubwa na kikomo vimetumika sawasawa.",
        instruction: "Bofya kwa mpangilio sahihi, kuanzia mwanzo hadi mwisho.",
        items,
        correctOrder: HATUA_KUANGALIA_SENTENSI.map((h) => h.id),
        hint: "Anza kwa mwanzo wa sentensi, endelea kati kati, kisha mwisho, na mwishoni soma tena.",
        explanation: HATUA_KUANGALIA_SENTENSI.map((h) => h.label).join(" → "),
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
      hint: "Zingatia herufi ya kwanza ya sentensi, majina mahususi, na kikomo mwishoni.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
