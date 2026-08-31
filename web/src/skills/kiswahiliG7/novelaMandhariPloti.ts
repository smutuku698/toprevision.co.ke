import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Hadithi {
  text: string;
  mandhari: string;
  mandhariPotovu: string[];
  ploti: { id: string; label: string }[]; // mwanzo -> mzozo -> kilele -> azimio
}

const HADITHI_LIST: Hadithi[] = [
  {
    text: "Fikiria hadithi ifuatayo: Simulizi hii inafanyika katika kijiji kidogo cha uvuvi kando ya Bahari Hindi, karibu na mji wa Lamu, wakati wa msimu wa kiangazi. Mvuvi mmoja, Bwana Rashid, anagundua kuwa samaki wamepungua sana baharini kutokana na uvuvi wa kupindukia uliofanywa na wavuvi wa nje. Anajaribu kuwashawishi wavuvi wenzake kubadili mbinu za uvuvi lakini wanamkataa na kumdhihaki. Baada ya msimu mzima wa samaki wachache, njaa inaanza kuwakumba wavuvi hao na familia zao. Hatimaye, wavuvi wanakubali ushauri wa Bwana Rashid na kuanzisha sheria za uvuvi endelevu kijijini, na hali inaanza kuimarika.",
    mandhari: "Kijiji kidogo cha uvuvi kando ya Bahari Hindi karibu na Lamu, wakati wa msimu wa kiangazi",
    mandhariPotovu: [
      "Jiji kubwa la Nairobi wakati wa msimu wa mvua",
      "Shamba la mifugo kilimani Nyandarua wakati wa baridi kali",
      "Chuo kikuu cha kimataifa nchini nje",
    ],
    ploti: [
      { id: "m1", label: "Mwanzo: Bwana Rashid anagundua samaki wamepungua kutokana na uvuvi wa kupindukia" },
      { id: "m2", label: "Mzozo: Anajaribu kuwashawishi wavuvi wenzake lakini wanamkataa na kumdhihaki" },
      { id: "m3", label: "Kilele: Njaa inaanza kuwakumba wavuvi na familia zao baada ya msimu wa samaki wachache" },
      { id: "m4", label: "Azimio: Wavuvi wanakubali ushauri wa Rashid na kuanzisha sheria za uvuvi endelevu" },
    ],
  },
  {
    text: "Fikiria hadithi nyingine: Hadithi hii inafanyika katika shamba la familia kilimani Nyandarua, mahali penye baridi na ukungu wa asubuhi. Ndugu wawili, Peter na Daniel, wanarithi shamba moja baada ya kifo cha baba yao. Wanaanza kugombana kuhusu jinsi ya kugawanya ardhi hiyo, kila mmoja akidai sehemu kubwa zaidi. Ugomvi wao unafikia kilele wanapoacha kuongea kabisa na kujenga uzio katikati ya shamba. Baada ya mwaka mmoja wa chuki, mzee wa ukoo anawaita pamoja na kuwaonyesha jinsi mgawanyo wa haki unavyoweza kufanywa, na ndugu hao wanapatana tena.",
    mandhari: "Shamba la familia kilimani Nyandarua, mahali penye baridi na ukungu wa asubuhi",
    mandhariPotovu: [
      "Kijiji cha uvuvi kando ya Bahari Hindi",
      "Soko kuu la mjini wakati wa adhuhuri",
      "Kambi ya wanafunzi katika hifadhi ya wanyama",
    ],
    ploti: [
      { id: "m1", label: "Mwanzo: Peter na Daniel wanarithi shamba moja baada ya kifo cha baba yao" },
      { id: "m2", label: "Mzozo: Wanagombana kuhusu jinsi ya kugawanya ardhi, kila mmoja akidai sehemu kubwa zaidi" },
      { id: "m3", label: "Kilele: Wanaacha kuongea kabisa na kujenga uzio katikati ya shamba" },
      { id: "m4", label: "Azimio: Mzee wa ukoo anawapatanisha na kuwaonyesha mgawanyo wa haki" },
    ],
  },
];

const HATUA_MAJINA: { neno: string; maana: string }[] = [
  { neno: "Mwanzo", maana: "Sehemu ya kuanzia ya hadithi inapoanzishwa tatizo au wahusika" },
  { neno: "Mzozo", maana: "Mvutano au tatizo linaloendelea kukua kati ya wahusika" },
  { neno: "Kilele", maana: "Kiwango cha juu zaidi cha mvutano katika hadithi" },
  { neno: "Azimio", maana: "Sehemu ya mwisho ambapo tatizo hutatuliwa" },
];

const VIPENGELE: { label: string; ni: "mandhari" | "ploti" }[] = [
  { label: "Kijiji kidogo cha uvuvi kando ya Bahari Hindi", ni: "mandhari" },
  { label: "Shamba la familia kilimani Nyandarua penye ukungu", ni: "mandhari" },
  { label: "Msimu wa kiangazi ambapo samaki wamepungua", ni: "mandhari" },
  { label: "Rashid anajaribu kuwashawishi wavuvi kubadili mbinu", ni: "ploti" },
  { label: "Ndugu wawili wanagombana kuhusu mgawanyo wa shamba", ni: "ploti" },
  { label: "Mzee wa ukoo anawapatanisha ndugu hao", ni: "ploti" },
];

interface SwaliMoja {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const MASWALI_UMUHIMU: SwaliMoja[] = [
  {
    prompt: "Umuhimu wa mandhari katika kazi ya fasihi ni upi?",
    correct: "Huwapa wasomaji taswira ya mahali na wakati hadithi inapotokea, na huathiri matukio yanayofuata",
    distractors: [
      "Hauna umuhimu wowote kwa hadithi",
      "Huamua tu jina la mwandishi wa kitabu",
      "Hutumika kuhesabu idadi ya wahusika pekee",
    ],
    explanation: "Mandhari humpa msomaji picha ya mahali na wakati wa hadithi, na mara nyingi huathiri jinsi visa vinavyoendelea.",
  },
  {
    prompt: "Ploti ya hadithi ni nini?",
    correct: "Mfuatano wa matukio unaoendesha hadithi kutoka mwanzo hadi azimio",
    distractors: [
      "Mahali hadithi inapotokea pekee",
      "Orodha ya majina ya wahusika wote",
      "Idadi ya kurasa za kitabu",
    ],
    explanation: "Ploti ni mpangilio wa matukio — mwanzo, mzozo, kilele na azimio — unaoendesha hadithi mbele.",
  },
];

export const novelaMandhariPloti: Skill = {
  id: "g7-ksw-ks-novela-mandhari-ploti",
  code: "KS.8",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Kina: Mandhari na Ploti",
  description: "Tambua mandhari na ploti ya hadithi, ufuatilie mfuatano wa ploti kutoka mwanzo hadi azimio, na ujadili umuhimu wake katika kazi ya fasihi.",
  generate(rng) {
    const branch = randChoice(rng, ["mandhari", "ploti", "hatua", "kategoria", "umuhimu", "fill"] as const);
    const hint = "Mandhari ni mahali na wakati hadithi inapotokea; ploti ni mfuatano wa matukio yanayoiendesha.";

    if (branch === "hatua") {
      const tokens = shuffle(rng, HATUA_MAJINA.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, HATUA_MAJINA.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of HATUA_MAJINA) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila hatua ya ploti na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: HATUA_MAJINA.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "kategoria") {
      const items = VIPENGELE.map((v, i) => ({ id: `v${i}`, label: v.label, b: v.ni }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        prompt: "Panga kila maelezo: je, ni mandhari (mahali/wakati) au ploti (tukio linaloendesha hadithi)?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "mandhari", label: "Mandhari" },
          { id: "ploti", label: "Ploti" },
        ],
        correctBucket,
        hint: "Mandhari huelezea mahali au wakati; ploti huelezea kitendo au tukio linaloendesha hadithi.",
        explanation: VIPENGELE.map((v) => `"${v.label}" ni ${v.ni === "mandhari" ? "mandhari" : "ploti"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu ploti ya hadithi.",
        before: "Kipindi cha juu zaidi cha mvutano katika hadithi, kabla ya tatizo kutatuliwa, huitwa",
        after: ".",
        correctAnswer: "kilele",
        inputMode: "text",
        hint: "Fikiria hatua ya ploti yenye mvutano mkubwa zaidi, kabla ya azimio.",
        explanation: "Kilele ni kiwango cha juu zaidi cha mvutano katika hadithi, kabla ya azimio kufikiwa.",
      };
    }

    if (branch === "umuhimu") {
      const swali = randChoice(rng, MASWALI_UMUHIMU);
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
    }

    const hadithi = randChoice(rng, HADITHI_LIST);

    if (branch === "ploti") {
      const items = shuffle(rng, hadithi.ploti);
      return {
        kind: "ordering",
        passage: hadithi.text,
        prompt: "Panga hatua za ploti ya hadithi hii kwa mfuatano sahihi: mwanzo, mzozo, kilele, azimio.",
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items,
        correctOrder: hadithi.ploti.map((p) => p.id),
        hint: "Anza na tatizo linavyoanzishwa, kisha mvutano unavyokua, kisha kiwango cha juu zaidi, kisha ufumbuzi.",
        explanation: hadithi.ploti.map((p) => p.label).join(" → "),
      };
    }

    const choices = shuffle(rng, [hadithi.mandhari, ...hadithi.mandhariPotovu]);
    return {
      kind: "multiple-choice",
      passage: hadithi.text,
      prompt: "Mandhari ya hadithi hii ni ipi?",
      choices,
      correctIndex: choices.indexOf(hadithi.mandhari),
      layout: "list",
      hint,
      explanation: `Mandhari ya hadithi ni: "${hadithi.mandhari}" — hapa ndipo na wakati matukio yanapotokea.`,
    };
  },
};
