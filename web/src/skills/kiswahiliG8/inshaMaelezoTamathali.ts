import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TAMATHALI: { id: string; jina: string; maelezo: string }[] = [
  { id: "tashbiha", jina: "Tashbiha", maelezo: "Kulinganisha vitu viwili kwa kutumia 'kama' au 'mithili ya' ili kujenga picha dhahiri" },
  { id: "sitiari", jina: "Sitiari", maelezo: "Kulinganisha vitu viwili moja kwa moja bila kutumia 'kama', k.m. 'macho yake ni almasi'" },
  { id: "tashihisi", jina: "Tashihisi", maelezo: "Kukipa kitu kisicho na uhai sifa za binadamu ili kujenga taswira hai" },
  { id: "mubalagha", jina: "Mubalagha", maelezo: "Kutia chumvi maelezo ili kusisitiza ukubwa au uzito wa jambo" },
];

const SENTENSI_TAMATHALI = [
  { sentensi: "Ngozi yake ilikuwa laini kama hariri", mbinu: "tashbiha" },
  { sentensi: "Sauti yake ni asali inayotiririka masikioni", mbinu: "sitiari" },
  { sentensi: "Jua liliamka na kutabasamu juu ya kilima", mbinu: "tashihisi" },
  { sentensi: "Nyumba ile ilikuwa kubwa kiasi cha kufunika anga zima", mbinu: "mubalagha" },
  { sentensi: "Meno yake meupe kama theluji safi", mbinu: "tashbiha" },
  { sentensi: "Maisha yake ni safari ndefu yenye vikwazo vingi", mbinu: "sitiari" },
];

const SENTENSI_YENYE_TAMATHALI = [
  "Mlima ule ulisimama kwa fahari, ukiwatazama wapandaji kwa jicho la kiburi",
  "Maji ya mto yalimeta kama vito vinavyongaa juani",
];

const SENTENSI_KAWAIDA = [
  "Mlima ule ni mrefu na una miti mingi juu yake",
  "Maji ya mto yalikuwa safi na baridi wakati wa asubuhi",
];

const HATUA_MAELEZO = [
  { id: "chagua", label: "Chagua kitu au mahali unachotaka kukielezea" },
  { id: "hisi", label: "Fikiria jinsi kinavyoonekana, kusikika na kunusika" },
  { id: "tamathali", label: "Chagua tamathali za lugha zinazofaa kujenga picha dhahiri" },
  { id: "pitia", label: "Pitia maelezo yako na uboreshe lugha iwe wazi zaidi" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Tamathali za lugha huchangia vipi katika insha ya maelezo?",
    sahihi: "Husaidia kujenga picha dhahiri akilini mwa msomaji kuhusu kitu kinachoelezwa",
    makosa: [
      "Huifanya insha kuwa fupi zaidi",
      "Huondoa haja ya kutumia hisi za mwili",
      "Hutumika tu katika insha za masimulizi",
    ],
  },
  {
    swali: "Tofauti kuu kati ya tashbiha na sitiari ni ipi?",
    sahihi: "Tashbiha hutumia 'kama' au 'mithili ya' wakati sitiari hulinganisha moja kwa moja bila neno hilo",
    makosa: [
      "Tashbiha hutumika kwa watu pekee, sitiari kwa vitu pekee",
      "Sitiari hutumia zaidi maneno kuliko tashbiha",
      "Hakuna tofauti yoyote kati yake",
    ],
  },
  {
    swali: `Soma sentensi hii: "${SENTENSI_TAMATHALI[2].sentensi}" Ni tamathali gani ya lugha iliyotumika?`,
    sahihi: "Tashihisi, kwa sababu jua limepewa uwezo wa kutabasamu kama binadamu",
    makosa: [
      "Tashbiha, kwa sababu inalinganisha jua na binadamu kwa 'kama'",
      "Mubalagha, kwa sababu inatia chumvi joto la jua",
      "Sitiari, kwa sababu haitumii neno 'kama'",
    ],
  },
  {
    swali: `Soma sentensi hizi mbili: (a) "${SENTENSI_YENYE_TAMATHALI[1]}" (b) "${SENTENSI_KAWAIDA[1]}" Ni sentensi ipi inayojenga picha dhahiri zaidi kwa msomaji?`,
    sahihi: "Sentensi (a), kwa sababu inatumia tamathali ya lugha kujenga taswira hai ya maji",
    makosa: [
      "Sentensi (b), kwa sababu ina maelezo mengi zaidi",
      "Zote mbili zinajenga picha dhahiri sawa",
      "Hakuna kati yake inayojenga picha dhahiri",
    ],
  },
];

export const inshaMaelezoTamathali: Skill = {
  id: "g8-ksw-ka-maelezo-tamathali",
  code: "KA.7",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Insha za Kubuni: Maelezo (Tamathali za Lugha)",
  description: "Tumia tamathali mbalimbali za lugha kujenga picha dhahiri katika insha ya maelezo.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, TAMATHALI.map((t) => ({ id: t.id, label: t.maelezo })));
      const targets = shuffle(rng, TAMATHALI.map((t) => ({ id: t.id, label: t.jina })));
      const correctMap: Record<string, string> = {};
      for (const t of TAMATHALI) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila tamathali ya lugha na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Tashbiha hutumia 'kama'; sitiari hulinganisha moja kwa moja; tashihisi hupa uhai; mubalagha hutia chumvi.",
        explanation: TAMATHALI.map((t) => `${t.jina} — ${t.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SENTENSI_TAMATHALI).slice(0, 4);
      const bucketIds = Array.from(new Set(chosen.map((c) => c.mbinu)));
      const buckets = bucketIds.map((id) => ({ id, label: TAMATHALI.find((t) => t.id === id)!.jina }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.sentensi }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.mbinu));
      return {
        kind: "categorize",
        prompt: "Panga kila sentensi kulingana na tamathali ya lugha inayotumika ndani yake.",
        items,
        buckets,
        correctBucket,
        hint: "Angalia kama sentensi inatumia 'kama', inalinganisha moja kwa moja, inapa uhai, au inatia chumvi.",
        explanation: chosen.map((c) => `"${c.sentensi}" — ${TAMATHALI.find((t) => t.id === c.mbinu)!.jina}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_MAELEZO);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kuandika maelezo yenye picha dhahiri kwa kutumia tamathali za lugha.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_MAELEZO.map((h) => h.id),
        hint: "Anza kwa kuchagua kitu, fikiria hisi zako, chagua tamathali, kisha pitia lugha yako.",
        explanation: HATUA_MAELEZO.map((h) => h.label).join(" → "),
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
      hint: "Tamathali za lugha hujenga picha dhahiri kuhusu kitu kinachoelezwa katika insha ya maelezo.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
