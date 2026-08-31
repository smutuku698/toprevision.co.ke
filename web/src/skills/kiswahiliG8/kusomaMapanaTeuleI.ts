import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Matini {
  text: string;
  msamiati: { neno: string; maana: string }[];
  ujumbe: { prompt: string; choices: string[]; correctIndex: number; explanation: string };
  muhtasariSahihi: string;
  muhtasariPotovu: string[];
  matumizi: { neno: string; before: string; after: string };
}

const MATINI: Matini[] = [
  {
    text: "Kila dawa ina maagizo ya matumizi yaliyoandikwa kwenye kifurushi chake. Ni muhimu kusoma maagizo hayo kabla ya kumeza dawa yoyote, hasa kipimo sahihi na muda wa kutumia dawa hiyo. Dawa nyingi zinapaswa kumezwa baada ya chakula ili kupunguza uwezekano wa kuharibu tumbo. Aidha, dawa zisizotumika kikamilifu haziruhusiwi kutupwa ovyo bali zirudishwe kwenye duka la dawa kwa utupaji salama.",
    msamiati: [
      { neno: "kipimo", maana: "kiasi maalum cha dawa kinachopaswa kutumiwa kwa wakati mmoja" },
      { neno: "kuharibu", maana: "kuathiri vibaya au kuleta madhara kwa kitu" },
      { neno: "utupaji", maana: "kitendo cha kuondoa kitu ambacho hakihitajiki tena" },
    ],
    ujumbe: {
      prompt: "Ujumbe mkuu wa kifungu hiki ni upi?",
      choices: [
        "Umuhimu wa kufuata maagizo na kipimo sahihi wakati wa kutumia dawa",
        "Jinsi ya kutengeneza dawa nyumbani",
        "Historia ya viwanda vya dawa nchini",
        "Bei ya dawa katika maduka mbalimbali",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinasisitiza kusoma maagizo, kufuata kipimo sahihi, na kurudisha dawa dukani kwa utupaji salama.",
    },
    muhtasariSahihi: "Dawa zinapaswa kutumiwa kwa kufuata maagizo na kipimo sahihi, na zisizotumika zirudishwe dukani.",
    muhtasariPotovu: [
      "Dawa zote zinafanana na hazihitaji maagizo maalum.",
      "Dawa hazipaswi kamwe kumezwa baada ya chakula.",
      "Dawa zisizotumika zinapaswa kutupwa popote pale.",
    ],
    matumizi: { neno: "kipimo", before: "Muuguzi alimpa mgonjwa", after: "sahihi cha dawa ili apone haraka." },
  },
  {
    text: "Baadhi ya watu hutumia dawa za kienyeji pamoja na dawa za hospitalini bila kumshauri daktari. Tabia hii inaweza kuwa hatari kwani baadhi ya mimea inaweza kuathiri jinsi dawa za hospitalini zinavyofanya kazi mwilini. Wataalamu wa afya wanashauri mgonjwa kumjulisha daktari kila dawa anayotumia, iwe ya hospitalini au ya kienyeji, ili kuepuka madhara yasiyotarajiwa.",
    msamiati: [
      { neno: "kienyeji", maana: "kinachotokana na desturi za asili za eneo fulani" },
      { neno: "kuathiri", maana: "kuleta mabadiliko, mara nyingi hasi, kwa kitu au mtu" },
      { neno: "kujulisha", maana: "kumpa mtu habari kuhusu jambo fulani" },
    ],
    ujumbe: {
      prompt: "Ujumbe mkuu wa kifungu hiki ni upi?",
      choices: [
        "Umuhimu wa kumjulisha daktari kuhusu dawa zote unazotumia",
        "Faida za dawa za kienyeji pekee",
        "Jinsi hospitali zinavyofanya kazi",
        "Umuhimu wa kutotumia dawa yoyote",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinashauri mgonjwa amjulishe daktari dawa zote anazotumia ili kuepuka madhara yatokanayo na kuchanganya dawa.",
    },
    muhtasariSahihi: "Mgonjwa anapaswa kumjulisha daktari dawa zote anazotumia, za kienyeji na za hospitalini, ili kuepuka madhara.",
    muhtasariPotovu: [
      "Dawa za kienyeji ni salama kila wakati bila masharti yoyote.",
      "Hakuna haja ya kumjulisha daktari kuhusu dawa za kienyeji.",
      "Dawa za hospitalini pekee ndizo zenye madhara.",
    ],
    matumizi: { neno: "kuathiri", before: "Kutokula vizuri kunaweza", after: "afya ya mtu kwa muda mrefu." },
  },
  {
    text: "Ripoti ya hivi majuzi imeonyesha kuongezeka kwa matumizi mabaya ya dawa za maumivu miongoni mwa vijana wanaotaka kupunguza msongo wa mawazo. Wataalamu wanaonya kuwa kumeza dawa hizo bila agizo la daktari kunaweza kusababisha uraibu na madhara ya kudumu kwa afya. Wanapendekeza vijana wenye msongo wa mawazo kutafuta msaada wa kisaikolojia badala ya kujitibu kwa dawa.",
    msamiati: [
      { neno: "msongo wa mawazo", maana: "hali ya wasiwasi au shinikizo la kihisia linalomkabili mtu" },
      { neno: "uraibu", maana: "hali ya kutegemea kitu, kama dawa, kupita kiasi hadi kushindwa kuacha" },
      { neno: "kujitibu", maana: "kujipatia matibabu bila ushauri wa daktari" },
    ],
    ujumbe: {
      prompt: "Ujumbe mkuu wa kifungu hiki ni upi?",
      choices: [
        "Hatari za kutumia dawa za maumivu bila agizo la daktari",
        "Faida za dawa za maumivu kwa vijana",
        "Jinsi ya kutengeneza dawa za maumivu",
        "Historia ya hospitali za vijana",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinaonya kuhusu hatari ya uraibu itokanayo na kutumia dawa za maumivu bila agizo la daktari.",
    },
    muhtasariSahihi: "Kutumia dawa za maumivu bila agizo la daktari kunaweza kusababisha uraibu, hivyo vijana washauriwe kutafuta msaada wa kisaikolojia.",
    muhtasariPotovu: [
      "Dawa za maumivu hazina madhara yoyote kwa vijana.",
      "Vijana wote wanapaswa kutumia dawa za maumivu mara kwa mara.",
      "Msongo wa mawazo hauhusiani na matumizi ya dawa.",
    ],
    matumizi: { neno: "uraibu", before: "Kutumia dawa bila agizo la daktari kunaweza kusababisha", after: "ambao ni vigumu kuuacha." },
  },
];

const VIPENGELE_REKODI: { label: string; ndani: boolean }[] = [
  { label: "Kichwa cha kitabu au makala uliyosoma", ndani: true },
  { label: "Jina la mwandishi wa matini", ndani: true },
  { label: "Tarehe uliposoma matini hiyo", ndani: true },
  { label: "Ujumbe mkuu ulioupata baada ya kusoma", ndani: true },
  { label: "Bei ya duka lililouza kitabu hicho", ndani: false },
  { label: "Rangi ya fulana uliyovaa siku hiyo", ndani: false },
];

export const kusomaMapanaTeuleI: Skill = {
  id: "g8-ksw-ks-mapana-teule-1",
  code: "KS.2",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ks",
  grade: 8,
  title: "Kusoma kwa Mapana: Matini ya Kujichagulia",
  description: "Soma matini uliyoichagua kisha utambue msamiati, ueleze ujumbe wake, utoe muhtasari, na uweke rekodi ya usomaji.",
  generate(rng) {
    const branch = randChoice(rng, ["msamiati", "matumizi", "ujumbe", "muhtasari", "rekodi"] as const);

    if (branch === "rekodi") {
      const items = VIPENGELE_REKODI.map((v, i) => ({ id: `v${i}`, label: v.label, ndani: v.ndani }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.ndani ? "ndani" : "nje";
      return {
        kind: "categorize",
        prompt: "Panga kila kipengele kulingana na kama kinafaa kuandikwa katika rekodi ya usomaji au la.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "ndani", label: "Kinafaa kuwekwa katika rekodi" },
          { id: "nje", label: "Hakihusiani na rekodi ya usomaji" },
        ],
        correctBucket,
        hint: "Rekodi ya usomaji hueleza ulichosoma na ulichojifunza, si mambo yasiyohusiana na matini yenyewe.",
        explanation: VIPENGELE_REKODI.map((v) => `"${v.label}" ${v.ndani ? "hufaa kuwekwa" : "hahusiani"} katika rekodi ya usomaji.`).join(" "),
      };
    }

    const matini = randChoice(rng, MATINI);
    const hint = "Rejelea matini uliyoisoma kwa makini kabla ya kujibu.";

    if (branch === "msamiati") {
      const tokens = shuffle(rng, matini.msamiati.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, matini.msamiati.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of matini.msamiati) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        passage: matini.text,
        prompt: "Oanisha kila neno na maana yake kama linavyotumika katika matini.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: matini.msamiati.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "matumizi") {
      return {
        kind: "fill-blank",
        passage: matini.text,
        prompt: "Tumia neno ufaalo kutoka kwa msamiati wa matini kukamilisha sentensi hii mpya.",
        before: matini.matumizi.before,
        after: matini.matumizi.after,
        correctAnswer: matini.matumizi.neno,
        inputMode: "text",
        hint: "Fikiria maana ya neno kutoka kwa matini uliyosoma, kisha ulitumie katika muktadha huu mpya.",
        explanation: `Neno "${matini.matumizi.neno}" ndilo linalofaa hapa kwa maana yake kama ilivyotumika katika matini.`,
      };
    }

    if (branch === "muhtasari") {
      const choices = shuffle(rng, [matini.muhtasariSahihi, ...matini.muhtasariPotovu]);
      return {
        kind: "multiple-choice",
        passage: matini.text,
        prompt: "Ni muhtasari upi unaowakilisha vyema ujumbe wa matini hii?",
        choices,
        correctIndex: choices.indexOf(matini.muhtasariSahihi),
        layout: "list",
        hint,
        explanation: `Muhtasari bora ni: "${matini.muhtasariSahihi}" — unadondoa hoja kuu bila maelezo ya ziada yasiyo ya lazima.`,
      };
    }

    const choices = shuffle(rng, matini.ujumbe.choices);
    return {
      kind: "multiple-choice",
      passage: matini.text,
      prompt: matini.ujumbe.prompt,
      choices,
      correctIndex: choices.indexOf(matini.ujumbe.choices[matini.ujumbe.correctIndex]),
      layout: "list",
      hint,
      explanation: matini.ujumbe.explanation,
    };
  },
};
