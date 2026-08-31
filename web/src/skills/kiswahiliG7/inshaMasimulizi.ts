import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// ---- 4.3.1: lugha ya kiubunifu, wahusika na mandhari -----------------

const ISTILAHI_WAHUSIKA: { id: string; term: string; maelezo: string }[] = [
  { id: "mhusikamkuu", term: "Mhusika mkuu", maelezo: "Mtu anayehusika zaidi na anayeongoza matukio katika hadithi" },
  { id: "mhusikamsaidizi", term: "Mhusika msaidizi", maelezo: "Mtu mwingine anayemsaidia au kuathiri mhusika mkuu katika hadithi" },
  { id: "mandhari", term: "Mandhari", maelezo: "Mahali na wakati ambapo matukio ya hadithi yanatokea" },
  { id: "lughakiubunifu", term: "Lugha ya kiubunifu", maelezo: "Matumizi ya tashbihi, tashihisi na mbinu nyingine za kifasihi zinazopamba hadithi" },
];

const SENTENSI_KIUBUNIFU = [
  "Moyo wake ulidunda kama ngoma ya arusi alipomwona mwalimu mkuu.",
  "Jua liliota kwa tabasamu likibusu vilele vya milima ya Aberdare.",
  "Upepo uliimba wimbo wake wa huzuni kati ya miti ya mkongoro.",
  "Machozi yake yalitiririka kama mto uliofurika baada ya mvua kubwa.",
];

const SENTENSI_KAWAIDA = [
  "Alienda shuleni asubuhi na kufika saa moja na nusu.",
  "Jua lilichomoza saa kumi na mbili asubuhi.",
  "Upepo ulivuma kidogo mchana huo.",
  "Alilia kwa sababu alikuwa na huzuni.",
];

const KISA_MHUSIKA_MANDHARI =
  "Katika kijiji cha Kapsabet, mvulana mmoja aitwaye Kiplangat alikuwa maarufu kwa ujasiri wake. Siku moja ya mvua kali, alikimbia hadi mtoni kuwaokoa watoto wawili waliokuwa wamezama.";

const MASWALI_WAHUSIKA: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Kwa nini ni muhimu kutambua wahusika na mandhari kabla ya kuandika insha ya masimulizi?",
    sahihi: "Husaidia msomaji kuelewa hadithi vizuri kwa kujua nani anahusika na matukio yanatokea wapi",
    makosa: [
      "Ili insha iwe ndefu zaidi bila sababu ya kimaudhui",
      "Ili kuepuka kutumia lugha ya kiubunifu kabisa",
      "Ili kila aya iwe na urefu sawa",
    ],
  },
  {
    swali: 'Katika kisa: "' + KISA_MHUSIKA_MANDHARI + '" nani ni mhusika mkuu?',
    sahihi: "Kiplangat",
    makosa: ["Watoto wawili", "Mvua kali", "Kijiji cha Kapsabet"],
  },
  {
    swali: 'Katika kisa hicho hicho, mandhari ya tukio ni yapi?',
    sahihi: "Kijiji cha Kapsabet, mtoni, wakati wa mvua kali",
    makosa: ["Mjini Nairobi wakati wa jua kali", "Shuleni wakati wa mtihani", "Sokoni wakati wa jioni"],
  },
  {
    swali: "Ni ipi kati ya sentensi zifuatazo inayoonyesha lugha ya kiubunifu (tashbihi/tashihisi)?",
    sahihi: "Moyo wake ulidunda kama ngoma ya arusi alipomwona mwalimu mkuu.",
    makosa: [
      "Alienda shuleni asubuhi na kufika saa moja na nusu.",
      "Jua lilichomoza saa kumi na mbili asubuhi.",
      "Alilia kwa sababu alikuwa na huzuni.",
    ],
  },
];

// ---- 9.3.1: mada, utangulizi, kati, hitimisho — kukuza wazo katika aya --

const MUUNDO_WAZO: { id: string; label: string; maelezo: string }[] = [
  { id: "mada", label: "Mada", maelezo: "Kichwa kinachoashiria kwa ufupi kile insha ya masimulizi itakachosimulia" },
  { id: "utangulizi", label: "Utangulizi", maelezo: "Aya ya kwanza inayomtambulisha msomaji kwa mhusika, mandhari na tukio la awali" },
  { id: "kati", label: "Kati (mwili wa hadithi)", maelezo: "Aya zinazoendeleza matukio kwa mfuatano hadi kilele cha hadithi" },
  { id: "hitimisho", label: "Hitimisho", maelezo: "Aya ya mwisho inayomalizia hadithi na kutoa mafunzo au matokeo ya tukio" },
];

const HATUA_KUKUZA_WAZO = [
  { id: "chagua", label: "Chagua tukio kuu la aya na wazo unalotaka kulisimulia" },
  { id: "sentensielekezi", label: "Andika sentensi ya kwanza inayoanzisha tukio hilo" },
  { id: "fafanua", label: "Ongeza sentensi za kufafanua zinazosimulia tukio kwa undani na mfuatano" },
  { id: "unganisha", label: "Malizia aya kwa sentensi inayounganisha na aya ifuatayo ya hadithi" },
];

const AYA_YENYE_MFUATANO_MZURI =
  "Kwanza, Wanjiru aliamka mapema na kuandaa mkoba wake. Kisha, alitembea hadi kituo cha basi akiwa na haraka. Baadaye, basi lilichelewa kwa dakika kumi na tano, jambo lililomfanya awe na wasiwasi wa kuchelewa shuleni.";

const AYA_ISIYO_NA_MFUATANO =
  "Wanjiru alikuwa na wasiwasi. Basi lilichelewa. Aliamka mapema. Alitembea hadi kituoni akiwa na haraka.";

const MASWALI_MUUNDO: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Aya ya utangulizi katika insha ya masimulizi inapaswa kufanya nini?",
    sahihi: "Kumtambulisha msomaji kwa mhusika, mandhari na tukio la awali la hadithi",
    makosa: [
      "Kutoa muhtasari wa mafunzo ya hadithi nzima",
      "Kuorodhesha maneno magumu yaliyotumika kwenye hadithi",
      "Kueleza jina la mwandishi na tarehe ya kuandika",
    ],
  },
  {
    swali: "Aya za sehemu ya kati (mwili) wa insha ya masimulizi zinapaswa kufanya nini hasa?",
    sahihi: "Kuendeleza matukio kwa mfuatano wa kimantiki hadi kufikia kilele cha hadithi",
    makosa: [
      "Kurudia tu yale yaliyosemwa katika utangulizi",
      "Kuorodhesha wahusika wote bila maelezo ya matukio",
      "Kuhitimisha hadithi mapema kabla ya kilele",
    ],
  },
  {
    swali: `Soma aya hii: "${AYA_YENYE_MFUATANO_MZURI}" Aya hii inakuza wazo vizuri kwa sababu gani?`,
    sahihi: "Matukio yamepangwa kwa mfuatano ulio wazi kwa kutumia maneno kama kwanza, kisha na baadaye",
    makosa: [
      "Kwa sababu ina wahusika wengi tofauti",
      "Kwa sababu ni fupi mno kueleweka",
      "Kwa sababu haina hisia zozote",
    ],
  },
  {
    swali: `Soma aya hii: "${AYA_ISIYO_NA_MFUATANO}" Tatizo kuu la aya hii ni lipi?`,
    sahihi: "Matukio hayajapangwa kwa mfuatano wa wakati ulio wazi, hivyo msomaji anachanganyikiwa",
    makosa: [
      "Haina mhusika yeyote",
      "Ina maneno mengi ya kiubunifu kupita kiasi",
      "Haitumii lugha sahihi ya Kiswahili",
    ],
  },
];

export const inshaMasimulizi: Skill = {
  id: "g7-ksw-ka-insha-masimulizi",
  code: "KA.4",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Insha za Masimulizi: Lugha, Wahusika na Ujenzi wa Wazo",
  description: "Bainisha lugha ya kiubunifu, wahusika na mandhari, na ujenge wazo la aya kwa mfuatano ufaao katika insha za masimulizi.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["wahusikaMatch", "kiubunifuCategorize", "wahusikaMc", "muundoOrder", "wazoOrder", "muundoFill", "muundoMc"] as const
    );

    if (branch === "wahusikaMatch") {
      const tokens = shuffle(rng, ISTILAHI_WAHUSIKA.map((i) => ({ id: i.id, label: i.maelezo })));
      const targets = shuffle(rng, ISTILAHI_WAHUSIKA.map((i) => ({ id: i.id, label: i.term })));
      const correctMap: Record<string, string> = {};
      for (const i of ISTILAHI_WAHUSIKA) correctMap[i.id] = i.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya insha ya masimulizi na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Mhusika mkuu ndiye anayeongoza hadithi; mandhari ni mahali na wakati wa matukio.",
        explanation: ISTILAHI_WAHUSIKA.map((i) => `${i.term} — ${i.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "kiubunifuCategorize") {
      const kiubunifu = shuffle(rng, SENTENSI_KIUBUNIFU).slice(0, 3);
      const kawaida = shuffle(rng, SENTENSI_KAWAIDA).slice(0, 3);
      const items = shuffle(rng, [
        ...kiubunifu.map((label) => ({ id: `k-${label}`, label, bucket: "kiubunifu" })),
        ...kawaida.map((label) => ({ id: `w-${label}`, label, bucket: "kawaida" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zinatumia lugha ya kiubunifu (tashbihi/tashihisi) au lugha ya kawaida.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kiubunifu", label: "Lugha ya Kiubunifu" },
          { id: "kawaida", label: "Lugha ya Kawaida" },
        ],
        correctBucket,
        hint: "Lugha ya kiubunifu hulinganisha vitu viwili tofauti au huvipa vitu visivyo hai sifa za binadamu.",
        explanation: `Lugha ya kiubunifu: ${kiubunifu.join(" / ")}. Lugha ya kawaida: ${kawaida.join(" / ")}.`,
      };
    }

    if (branch === "wahusikaMc") {
      const entry = randChoice(rng, MASWALI_WAHUSIKA);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Zingatia mhusika mkuu, wahusika wasaidizi, mandhari na lugha ya kiubunifu.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    if (branch === "muundoOrder") {
      const items = shuffle(rng, MUUNDO_WAZO);
      return {
        kind: "ordering",
        prompt: "Panga vipengele vya insha ya masimulizi kwa mpangilio sahihi.",
        instruction: "Bofya kwa mpangilio sahihi, kuanzia mada hadi hitimisho.",
        items,
        correctOrder: MUUNDO_WAZO.map((m) => m.id),
        hint: "Insha ya masimulizi huanza na mada, utangulizi, kati, na kumalizika kwa hitimisho.",
        explanation: MUUNDO_WAZO.map((m) => m.label).join(" → "),
      };
    }

    if (branch === "wazoOrder") {
      const items = shuffle(rng, HATUA_KUKUZA_WAZO);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kukuza wazo moja katika aya ya insha ya masimulizi.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUKUZA_WAZO.map((h) => h.id),
        hint: "Anza kwa kuchagua tukio, andika sentensi elekezi, fafanua kwa undani, kisha unganisha na aya ifuatayo.",
        explanation: HATUA_KUKUZA_WAZO.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "muundoFill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha neno la mfuatano linalokosekana katika aya hii ya masimulizi.",
        before: "___, Wanjiru aliamka mapema na kuandaa mkoba wake.",
        after: " alitembea hadi kituo cha basi akiwa na haraka.",
        correctAnswer: "Kisha",
        acceptedAnswers: ["Kisha", "Baadaye"],
        inputMode: "text",
        hint: "Neno hili linaonyesha tukio linalofuata baada ya lile la kwanza.",
        explanation: "Maneno ya mfuatano kama 'Kisha' au 'Baadaye' huunganisha matukio kwa mpangilio wa kimantiki katika aya.",
      };
    }

    const entry = randChoice(rng, MASWALI_MUUNDO);
    const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
    return {
      kind: "multiple-choice",
      prompt: entry.swali,
      choices,
      correctIndex: choices.indexOf(entry.sahihi),
      layout: "list",
      hint: "Zingatia mada, utangulizi, kati na hitimisho, pamoja na mfuatano wa matukio katika aya.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
