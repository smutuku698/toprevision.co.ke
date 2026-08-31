import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HADITHI_1 =
  "Fikiria hadithi ifuatayo: Kamau ni mvulana yatima anayeishi na babu yake kijijini. Ingawa hawana pesa za kutosha, babu yake humtia moyo asome kwa bidii shuleni. Kamau hukabiliana na dhihaka kutoka kwa wenzake kwa sababu ya umaskini wake, lakini haachi kujitahidi. Mwishoni mwa hadithi, Kamau anafaulu mtihani wa kitaifa kwa alama za juu na kupata ufadhili wa masomo.";

const HADITHI_2 =
  "Fikiria hadithi nyingine ya kubuni: Wanakijiji wa eneo fulani wanakumbwa na ukame mkali kwa miaka miwili mfululizo. Badala ya kugombana kuhusu maji kidogo yaliyobaki, wazee wa kijiji wanakutana na kupanga zamu ya matumizi ya kisima pekee kilichobaki na maji. Ushirikiano huo unawasaidia kuvuka kipindi kigumu bila mapigano.";

const ISTILAHI: { neno: string; maana: string }[] = [
  { neno: "Maudhui", maana: "Mada kuu inayozungumzwa katika kazi ya fasihi" },
  { neno: "Dhamira", maana: "Lengo au ujumbe wa ndani ambao mwandishi anataka kuufikisha kupitia kazi yake" },
  { neno: "Ujumbe", maana: "Fundisho au funzo analolipata msomaji baada ya kusoma kazi nzima" },
  { neno: "Mgogoro", maana: "Mvutano au tatizo baina ya wahusika linaloendesha visa vya hadithi" },
];

const VIPENGELE: { label: string; ni: "maudhui" | "dhamira" }[] = [
  { label: "Umaskini na elimu", ni: "maudhui" },
  { label: "Ukame na ushirikiano wa kijamii", ni: "maudhui" },
  { label: "Dhihaka dhidi ya watoto yatima", ni: "maudhui" },
  { label: "Mwandishi anaonyesha kuwa bidii na uvumilivu vinaweza kushinda changamoto za umaskini", ni: "dhamira" },
  { label: "Mwandishi anasisitiza kuwa ushirikiano na maelewano vinaweza kuwasaidia watu kuvuka nyakati ngumu badala ya ugomvi", ni: "dhamira" },
  { label: "Mwandishi anataka jamii ithamini elimu hata katika hali ngumu za kifedha", ni: "dhamira" },
];

const HATUA = [
  { id: "h1", label: "Soma hadithi yote kwa makini kuanzia mwanzo hadi mwisho" },
  { id: "h2", label: "Tambua matukio na mgogoro unaojirudia mara kwa mara" },
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
    correct: "Mada kuu inayozungumzwa katika kazi hiyo",
    distractors: ["Majina ya wahusika wote katika kazi hiyo", "Idadi ya kurasa za kitabu", "Mahali kazi hiyo ilipochapishwa"],
    explanation: "Maudhui ni mada kuu, kama vile umaskini, ukame au elimu, zinazojitokeza katika kazi ya fasihi.",
  },
  {
    prompt: "Dhamira ya mwandishi katika kazi ya fasihi humaanisha nini?",
    correct: "Lengo au ujumbe wa ndani anaotaka kuufikisha kupitia kazi hiyo",
    distractors: ["Jina la mchapishaji wa kitabu", "Idadi ya wahusika waliomo", "Bei ya kitabu hicho sokoni"],
    explanation: "Dhamira ni nia ya ndani ya mwandishi — funzo mahususi analotaka msomaji alipate, tofauti na maudhui ambayo ni mada tu.",
  },
  {
    prompt: "Tofauti kuu kati ya maudhui na dhamira ni ipi?",
    correct: "Maudhui ni mada inayozungumzwa, ilhali dhamira ni lengo la ndani analotaka mwandishi kulifikisha",
    distractors: [
      "Maudhui na dhamira ni kitu kimoja tu kilichoitwa majina mawili",
      "Dhamira ni majina ya wahusika, maudhui ni mahali pa hadithi",
      "Maudhui hupatikana mwishoni tu mwa hadithi, dhamira mwanzoni tu",
    ],
    explanation: "Maudhui ni 'nini' kinachojadiliwa (mada), ilhali dhamira ni 'kwa nini' mwandishi ameiandika hivyo (lengo la ndani).",
  },
  {
    prompt: "Ni maudhui gani makuu yanayojitokeza katika hadithi hii?",
    correct: "Umaskini na elimu",
    distractors: ["Mapenzi ya kimapenzi baina ya vijana", "Michezo ya shuleni", "Safari za nje ya nchi"],
    explanation: "Hadithi inahusu Kamau anayekabiliana na umaskini akijitahidi kusoma — hilo ni suala la umaskini na elimu.",
    passage: HADITHI_1,
  },
  {
    prompt: "Ni dhamira gani ya mwandishi kupitia hadithi hii?",
    correct: "Kuonyesha kuwa bidii na uvumilivu vinaweza kushinda changamoto za umaskini",
    distractors: [
      "Kuonyesha kuwa watoto yatima hawawezi kufaulu kamwe",
      "Kuonyesha kuwa babu hapaswi kuwatia watoto moyo",
      "Kuonyesha umuhimu wa kucheza michezo pekee",
    ],
    explanation: "Licha ya umaskini na dhihaka, Kamau anafaulu kwa bidii — mwandishi anasisitiza kuwa bidii inashinda changamoto za kifedha.",
    passage: HADITHI_1,
  },
  {
    prompt: "Ni maudhui gani makuu yanayojitokeza katika hadithi hii?",
    correct: "Ukame na ushirikiano wa kijamii",
    distractors: ["Ujenzi wa barabara mpya", "Mashindano ya muziki", "Biashara ya kimataifa"],
    explanation: "Hadithi inahusu wanakijiji wanaokabiliana na ukame kwa kushirikiana badala ya kugombana — hilo ni ukame na ushirikiano.",
    passage: HADITHI_2,
  },
  {
    prompt: "Ni dhamira gani ya mwandishi kupitia hadithi hii?",
    correct: "Kusisitiza kuwa ushirikiano na maelewano vinaweza kuwasaidia watu kuvuka nyakati ngumu badala ya ugomvi",
    distractors: [
      "Kuonyesha kuwa ukame hauwezi kamwe kushindwa",
      "Kuonyesha kuwa kila mtu ajitafutie maji peke yake",
      "Kuonyesha kuwa wazee hawapaswi kuhusika katika maamuzi ya kijiji",
    ],
    explanation: "Kwa kupanga zamu badala ya kugombana, wanakijiji wanaonyesha jinsi ushirikiano unavyowasaidia kuvuka shida — hilo ndilo funzo la mwandishi.",
    passage: HADITHI_2,
  },
];

export const novelaMaudhuiDhamira: Skill = {
  id: "g7-ksw-ks-novela-maudhui-dhamira",
  code: "KS.6",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Kina: Maudhui na Dhamira",
  description: "Tambua na ujadili maudhui na dhamira zinazojitokeza katika hadithi, ukitofautisha kati ya mada inayozungumzwa na lengo la ndani la mwandishi.",
  generate(rng) {
    const branch = randChoice(rng, ["istilahi", "panga", "hatua", "fill", "swali"] as const);
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
        prompt: "Panga hatua zifuatazo za kutambua maudhui na dhamira katika hadithi.",
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items,
        correctOrder: HATUA.map((h) => h.id),
        hint,
        explanation: HATUA.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu istilahi za kifasihi.",
        before: "Mada kuu inayozungumzwa katika kazi ya fasihi huitwa",
        after: ".",
        correctAnswer: "maudhui",
        inputMode: "text",
        hint: "Fikiria neno linaloelezea 'nini' hadithi inazungumzia, si nia ya ndani ya mwandishi.",
        explanation: "Maudhui ndiyo mada kuu inayozungumzwa katika kazi ya fasihi, tofauti na dhamira ambayo ni lengo la ndani la mwandishi.",
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
