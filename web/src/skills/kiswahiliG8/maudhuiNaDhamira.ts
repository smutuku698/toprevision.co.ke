import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DONDOO = "ONYESHO LA PILI\n(Nyumbani. MAMA NYANGWESO anaingia sebuleni akiwa na hasira.)\nMAMA NYANGWESO: Nimekukataza mara nyingi kuacha jiko likiwaka bila mtu wa kulisimamia!\nKEVIN (mwanawe): Samahani mama, nilikuwa nikitazama runinga tu kwa dakika chache.\nMAMA NYANGWESO: Dakika chache zinatosha kusababisha moto mkubwa. Usalama wa nyumbani ni jukumu la kila mmoja wetu.";

const ISTILAHI: { neno: string; maana: string }[] = [
  { neno: "Maudhui", maana: "Mambo au mada makuu yanayojadiliwa katika kazi ya fasihi" },
  { neno: "Dhamira", maana: "Lengo au ujumbe wa ndani ambao mwandishi anataka kuufikisha kupitia kazi yake" },
  { neno: "Mgogoro", maana: "Mvutano au tatizo baina ya wahusika linaloendesha visa vya tamthilia" },
  { neno: "Ujumbe", maana: "Fundisho au funzo analolipata msomaji baada ya kusoma kazi nzima" },
];

const VIPENGELE: { label: string; ni: "maudhui" | "dhamira" }[] = [
  { label: "Usalama nyumbani", ni: "maudhui" },
  { label: "Uzembe na madhara yake", ni: "maudhui" },
  { label: "Mahusiano ya kifamilia", ni: "maudhui" },
  { label: "Mwandishi anataka kuonyesha kuwa uzembe mdogo unaweza kuleta madhara makubwa", ni: "dhamira" },
  { label: "Mwandishi anasisitiza umuhimu wa wazazi kuwaelekeza watoto wao kwa uangalifu", ni: "dhamira" },
  { label: "Mwandishi anataka jamii ithamini mawasiliano ya wazi kati ya wazazi na watoto", ni: "dhamira" },
];

const HATUA = [
  { id: "h1", label: "Soma tamthilia yote kwa makini kuanzia mwanzo hadi mwisho" },
  { id: "h2", label: "Tambua matukio na migogoro inayojirudia mara kwa mara" },
  { id: "h3", label: "Jiulize: ni mambo gani makuu yanayojadiliwa? (hii hukupa maudhui)" },
  { id: "h4", label: "Jiulize: mwandishi anataka kutufunza nini kupitia hayo? (hii hukupa dhamira)" },
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
    prompt: "Maudhui katika kazi ya fasihi ni nini?",
    correct: "Mambo au mada makuu yanayojadiliwa katika kazi hiyo",
    distractors: ["Majina ya wahusika wote katika kazi hiyo", "Idadi ya kurasa za kitabu", "Mahali kazi hiyo ilipochapishwa"],
    explanation: "Maudhui ni mada kuu, kama vile usalama, umaskini au mapenzi, zinazojitokeza katika kazi ya fasihi.",
  },
  {
    prompt: "Dhamira ya mwandishi katika kazi ya fasihi humaanisha nini?",
    correct: "Lengo au ujumbe wa ndani anaotaka kuufikisha kupitia kazi hiyo",
    distractors: ["Jina la mchapishaji wa kitabu", "Idadi ya wahusika waliomo", "Bei ya kitabu hicho sokoni"],
    explanation: "Dhamira ni nia ya ndani ya mwandishi — funzo mahususi analotaka msomaji alipate, tofauti na maudhui ambayo ni mada tu.",
  },
  {
    prompt: "Ni maudhui gani makuu yanayojitokeza katika dondoo hili?",
    correct: "Usalama na uzembe nyumbani",
    distractors: ["Mapenzi ya kimapenzi baina ya vijana", "Michezo ya shuleni", "Safari za nje ya nchi"],
    explanation: "Dondoo linahusu jiko lililoachwa bila kusimamiwa na hatari inayoweza kutokea — hilo ni suala la usalama nyumbani.",
    passage: DONDOO,
  },
  {
    prompt: "Ni dhamira gani ya mwandishi kupitia dondoo hili?",
    correct: "Kuonyesha kuwa uzembe mdogo unaweza kusababisha hatari kubwa, hivyo kila mwanafamilia awe mwangalifu",
    distractors: [
      "Kuonyesha kuwa watoto hawapaswi kamwe kutazama runinga",
      "Kuonyesha kuwa mama hawapaswi kuwakemea watoto wao",
      "Kuonyesha umuhimu wa kupika chakula kizuri",
    ],
    explanation: "Kupitia onyo la mama kuhusu jiko lililoachwa likiwaka, mwandishi anasisitiza kuwa uzembe mdogo unaweza kuleta hatari kubwa nyumbani.",
    passage: DONDOO,
  },
];

export const maudhuiNaDhamira: Skill = {
  id: "g8-ksw-ks-maudhui-dhamira",
  code: "KS.6",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ks",
  grade: 8,
  title: "Kusoma kwa Kina: Maudhui na Dhamira",
  description: "Tambua na ujadili maudhui na dhamira zinazojitokeza katika tamthilia.",
  generate(rng) {
    const branch = randChoice(rng, ["istilahi", "panga", "hatua", "swali"] as const);
    const hint = "Maudhui ni mada kuu inayozungumzwa; dhamira ni funzo au nia ya ndani ya mwandishi.";

    if (branch === "istilahi") {
      const tokens = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of ISTILAHI) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya kifasihi na maana yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ISTILAHI.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const items = VIPENGELE.map((v, i) => ({ id: `v${i}`, label: v.label, b: v.ni }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        passage: DONDOO,
        prompt: "Panga kila kauli: je, ni maudhui (mada) au dhamira (nia ya mwandishi)?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "maudhui", label: "Maudhui" },
          { id: "dhamira", label: "Dhamira" },
        ],
        correctBucket,
        hint: "Maudhui huelezwa kwa maneno machache kama mada; dhamira huelezwa kwa sentensi inayoonyesha nia ya mwandishi.",
        explanation: VIPENGELE.map((v) => `"${v.label}" ni ${v.ni === "maudhui" ? "maudhui" : "dhamira"}.`).join(" "),
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA);
      return {
        kind: "ordering",
        prompt: "Panga hatua zifuatazo za kutambua maudhui na dhamira katika tamthilia.",
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items,
        correctOrder: HATUA.map((h) => h.id),
        hint,
        explanation: HATUA.map((h) => h.label).join(" → "),
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
