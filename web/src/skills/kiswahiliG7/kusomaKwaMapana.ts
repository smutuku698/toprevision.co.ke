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
    text: "Kila Jumatano, soko kuu la Kongowea jijini Mombasa hujaa wafanyabiashara wanaouza samaki wabichi, matunda na nguo za mitumba. Wafanyabiashara huanza kuweka bidhaa zao asubuhi na mapema kabla jua halijawa kali. Wanunuzi wengi hupenda kufika mapema ili kupata bidhaa bora kabla hazijaisha. Kufikia adhuhuri, soko huwa limejaa watu wanaonunua na wanaobembeleza bei. Wafanyabiashara wengine huuza bidhaa zao kwa jumla ili wafanyabiashara wadogo wazipeleke mitaani.",
    msamiati: [
      { neno: "kubembeleza", maana: "kujaribu kushawishi mtu kwa maneno laini, hapa ni kupunguza bei" },
      { neno: "jumla", maana: "kiasi kikubwa cha bidhaa kinachouzwa kwa bei ya chini kwa muuzaji mwingine" },
      { neno: "mitumba", maana: "nguo zilizotumika awali kabla ya kuuzwa tena" },
    ],
    ujumbe: {
      prompt: "Ujumbe mkuu wa matini hii ni upi?",
      choices: [
        "Jinsi soko la Kongowea linavyofanya kazi kutoka asubuhi hadi adhuhuri",
        "Historia ya bandari ya Mombasa",
        "Njia za kusafiri kwenda Kongowea",
        "Aina za samaki wanaopatikana baharini pekee",
      ],
      correctIndex: 0,
      explanation: "Matini inaeleza jinsi wafanyabiashara wa Kongowea wanavyoweka bidhaa asubuhi hadi soko linapojaa watu adhuhuri.",
    },
    muhtasariSahihi: "Wafanyabiashara wa Kongowea huweka bidhaa asubuhi na mapema, na soko hujaa wanunuzi wanaobembeleza bei hadi adhuhuri.",
    muhtasariPotovu: [
      "Soko la Kongowea hufunguliwa usiku pekee na huuza vitabu tu.",
      "Hakuna anayenunua chochote sokoni Kongowea.",
      "Wafanyabiashara huuza bidhaa moja tu — samaki — bila kitu kingine.",
    ],
    matumizi: { neno: "kubembeleza", before: "Wateja wengi hujaribu", after: "wafanyabiashara ili bei ipungue." },
  },
  {
    text: "Kila mwaka, Shule ya Upili ya Kapsabet hushiriki katika Tamasha la Muziki na Sanaa la Kitaifa. Wiki mbili kabla ya tamasha, wanafunzi hukusanyika jioni baada ya masomo kufanya mazoezi ya nyimbo za kwaya na ngoma za kimila. Mwalimu wa muziki huwaongoza kwa uvumilivu, akiwarekebisha pale wanapokosea sauti au hatua za ngoma. Siku ya tamasha ilipowadia mwaka jana, kwaya ya shule hiyo iliibuka na tuzo ya kwanza katika kanda, jambo lililowafanya wanafunzi na walimu kufurahi sana.",
    msamiati: [
      { neno: "kwaya", maana: "kikundi cha waimbaji wanaoimba pamoja kwa sauti tofauti" },
      { neno: "uvumilivu", maana: "hali ya kustahimili jambo bila kukata tamaa" },
      { neno: "kanda", maana: "eneo mahususi la kijiografia linaloundwa na kaunti kadhaa kwa madhumuni ya mashindano" },
    ],
    ujumbe: {
      prompt: "Ujumbe mkuu wa matini hii ni upi?",
      choices: [
        "Jinsi wanafunzi wa Kapsabet walivyojiandaa na kufaulu katika Tamasha la Muziki",
        "Historia ya muziki wa kimila nchini Kenya",
        "Sheria za mashindano ya michezo shuleni",
        "Njia za kujenga jumba la sanaa shuleni",
      ],
      correctIndex: 0,
      explanation: "Matini inaeleza jinsi wanafunzi wa Kapsabet walivyofanya mazoezi kwa wiki mbili na kuibuka na tuzo ya kwanza katika kanda.",
    },
    muhtasariSahihi: "Wanafunzi wa Kapsabet walifanya mazoezi ya nyimbo na ngoma kwa wiki mbili na kuibuka na tuzo ya kwanza katika kanda.",
    muhtasariPotovu: [
      "Wanafunzi wa Kapsabet hawakushiriki kamwe katika tamasha hilo.",
      "Mwalimu wa muziki aliwaacha wanafunzi wajitayarishe bila msaada wowote.",
      "Shule hiyo ilishindwa vibaya na kuondolewa kwenye mashindano.",
    ],
    matumizi: { neno: "kwaya", before: "Kikundi cha waimbaji kinachoimba pamoja kwa sauti tofauti kinaitwa", after: "." },
  },
  {
    text: "Familia ya Wanjiru ilisafiri kutoka Nairobi kwenda Hifadhi ya Maasai Mara likizo ya Krismasi iliyopita. Walipofika, mwongozaji wa hifadhi aliwaeleza kuhusu wanyama mbalimbali kama simba, twiga na nyati wanaoishi huko. Familia hiyo ilitumia siku mbili wakiendesha gari maalum la kutazama wanyama, wakipiga picha za wanyama bila kuwadhuru. Jioni, walikaa kwenye kambi wakisikiliza sauti za wanyama pori kutoka mbali. Safari hiyo iliwafunza umuhimu wa kuhifadhi wanyamapori kwa vizazi vijavyo.",
    msamiati: [
      { neno: "mwongozaji", maana: "mtu anayewaelekeza na kuwaeleza wageni kuhusu mahali fulani" },
      { neno: "wanyamapori", maana: "wanyama wanaoishi mwituni bila kufugwa" },
      { neno: "kuhifadhi", maana: "kutunza kitu ili kisiharibike au kutoweka" },
    ],
    ujumbe: {
      prompt: "Ujumbe mkuu wa matini hii ni upi?",
      choices: [
        "Uzoefu wa familia ya Wanjiru katika Hifadhi ya Maasai Mara na fundisho la kuhifadhi wanyamapori",
        "Historia ya ujenzi wa reli nchini Kenya",
        "Aina za magari yanayofaa safari za mjini",
        "Njia za kupika chakula cha safari",
      ],
      correctIndex: 0,
      explanation: "Matini inasimulia jinsi familia ya Wanjiru ilivyotembelea Maasai Mara na kujifunza umuhimu wa kuhifadhi wanyamapori.",
    },
    muhtasariSahihi: "Familia ya Wanjiru ilitembelea Maasai Mara, ikaona wanyama pori na kujifunza umuhimu wa kuwahifadhi.",
    muhtasariPotovu: [
      "Familia ya Wanjiru haikuona mnyama yeyote wakati wa safari yao.",
      "Safari hiyo ilikuwa ya kununua nguo mjini Nairobi.",
      "Mwongozaji wa hifadhi aliwakataza kupiga picha zozote.",
    ],
    matumizi: { neno: "wanyamapori", before: "Wanyama wanaoishi mwituni bila kufugwa huitwa", after: "." },
  },
];

const VIPENGELE_REKODI: { label: string; ndani: boolean }[] = [
  { label: "Kichwa cha matini uliyosoma", ndani: true },
  { label: "Jina la mwandishi wa matini", ndani: true },
  { label: "Ujumbe mkuu ulioupata baada ya kusoma", ndani: true },
  { label: "Maoni yako mafupi kuhusu matini hiyo", ndani: true },
  { label: "Nambari ya simu ya mwandishi", ndani: false },
  { label: "Rangi ya jalada la kitabu", ndani: false },
];

const HATUA = [
  { id: "h1", label: "Chagua matini inayokuvutia kulingana na hamu yako" },
  { id: "h2", label: "Soma matini kwa makini ukibaini msamiati mpya" },
  { id: "h3", label: "Andika muhtasari mfupi wa ujumbe mkuu" },
  { id: "h4", label: "Weka rekodi ya usomaji ikiwa na kichwa, mwandishi na tarehe" },
];

export const kusomaKwaMapana: Skill = {
  id: "g7-ksw-ks-kusoma-kwa-mapana",
  code: "KS.2",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Mapana: Matini ya Kujichagulia",
  description: "Soma matini uliyoichagua kisha utambue msamiati, ueleze ujumbe wake, utoe muhtasari, na uweke rekodi ya usomaji.",
  generate(rng) {
    const branch = randChoice(rng, ["msamiati", "matumizi", "ujumbe", "muhtasari", "rekodi", "hatua"] as const);

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

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA);
      return {
        kind: "ordering",
        prompt: "Panga hatua zifuatazo za kusoma kwa mapana matini uliyoichagua mwenyewe.",
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items,
        correctOrder: HATUA.map((h) => h.id),
        hint: "Anza kwa kuchagua matini, kisha soma, tengeneza muhtasari, kisha weka rekodi.",
        explanation: HATUA.map((h) => h.label).join(" → "),
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
