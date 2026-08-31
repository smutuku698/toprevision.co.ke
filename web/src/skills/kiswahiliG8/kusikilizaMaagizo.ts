import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MIKTADHA: { term: string; mfano: string }[] = [
  { term: "Nyumbani", mfano: "Mzazi kumwelekeza mtoto jinsi ya kufua nguo" },
  { term: "Shuleni", mfano: "Mwalimu kuwaelekeza wanafunzi jinsi ya kufanya jaribio la sayansi" },
  { term: "Mahali pa kazi", mfano: "Msimamizi kumwelekeza mfanyakazi mpya taratibu za usalama" },
  { term: "Hospitalini", mfano: "Daktari kumwelekeza mgonjwa jinsi ya kutumia dawa" },
  { term: "Sehemu za umma", mfano: "Polisi kuwaelekeza abiria jinsi ya kuvuka barabara kwa usalama" },
];

const MAAGIZO_YANAYOFAA = [
  "Osha mikono kwa sabuni kabla ya kula",
  "Kwanza vaa glavu, kisha chukua chombo cha moto kwa uangalifu",
  "Fuata mistari hii kwa mpangilio ili kukamilisha fomu ipasavyo",
  "Zima jiko kabla ya kuondoka jikoni",
];

const MAAGIZO_YASIYOFAA = [
  "Fanya vizuri tu bila maelezo zaidi",
  "Nenda huko ukafanye kitu, utaelewa mwenyewe",
  "Alitoa maagizo kwa sauti ya chini isiyosikika vizuri",
  "Alitoa hatua nyingi kwa haraka bila mpangilio wowote",
];

const HATUA_KUPOKEA_MAAGIZO = [
  { id: "sikiliza", label: "Sikiliza kwa makini bila kukatiza" },
  { id: "elewa", label: "Elewa madhumuni ya agizo" },
  { id: "uliza", label: "Uliza maswali kama kuna sehemu isiyoeleweka" },
  { id: "rudia", label: "Rudia agizo kwa maneno yako kuhakikisha umeelewa" },
  { id: "tekeleza", label: "Tekeleza agizo kama ulivyoelekezwa" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Kwa nini mtu hupewa maagizo?",
    sahihi: "Ili ayatekeleze majukumu kwa usahihi na kuepuka makosa",
    makosa: [
      "Ili ashindwe kutekeleza jambo hilo",
      "Ili apoteze muda mwingi bila sababu",
      "Ili aache kufanya kazi kabisa",
    ],
  },
  {
    swali: "Ni ipi kati ya hizi ni mfano wa maagizo yasiyofaa?",
    sahihi: "Fanya vizuri tu, bila maelezo zaidi",
    makosa: [
      "Kwanza vaa glavu, kisha chukua chombo cha moto kwa uangalifu",
      "Osha mikono kwa sabuni kabla ya kula",
      "Fuata mistari hii kwa mpangilio ili kukamilisha fomu ipasavyo",
    ],
  },
  {
    swali: "Mama alimwelekeza mtoto wa kiume jinsi ya kupika ugali hatua kwa hatua, kwa sauti wazi, na akamruhusu auliza maswali. Je, maagizo ya mama yalikuwa na sifa za maagizo yafaayo?",
    sahihi: "Ndiyo, kwa sababu yalikuwa wazi, ya hatua kwa hatua, na yaliruhusu maswali",
    makosa: [
      "Hapana, kwa sababu kupika si jukumu la mtoto wa kiume",
      "Hapana, kwa sababu maagizo hayakuwa na hatua",
      "Ndiyo, lakini tu kwa sababu mama ndiye aliyeyatoa",
    ],
  },
  {
    swali: "Baba alimwambia binti yake, 'Wewe ni msichana, huwezi kutengeneza gari,' badala ya kumpa maagizo ya jinsi ya kufanya hivyo. Tatizo kuu la kauli hii ni lipi?",
    sahihi: "Anamnyima binti fursa ya kujifunza kwa kuegemeza uwezo wake kwa jinsia badala ya kumpa maagizo yafaayo",
    makosa: [
      "Hakuna tatizo, kwani hilo ni jukumu la wanaume pekee",
      "Tatizo ni kwamba alizungumza kwa sauti ya chini",
      "Tatizo ni kwamba hakumpa binti chombo cha kufanyia kazi",
    ],
  },
];

export const kusikilizaMaagizo: Skill = {
  id: "g8-ksw-kz-maagizo",
  code: "KZ.5",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Kusikiliza Maagizo",
  description: "Tambua maagizo katika miktadha mbalimbali, na jadili sifa za maagizo yafaayo pamoja na jinsi ya kuyatoa na kuyapokea.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha", "panga", "hatua", "jaza", "swali"] as const);

    if (branch === "oanisha") {
      const chosen = shuffle(rng, MIKTADHA).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.term })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.term, label: v.mfano })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.term] = v.term;
      return {
        kind: "click-match",
        prompt: "Oanisha kila muktadha na mfano wa maagizo yanayotolewa humo.",
        tokens,
        targets,
        correctMap,
        hint: "Maagizo hutolewa mahali tofauti tofauti — nyumbani, shuleni, kazini, hospitalini, na sehemu za umma.",
        explanation: chosen.map((v) => `${v.term} — ${v.mfano.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const yanayofaa = shuffle(rng, MAAGIZO_YANAYOFAA).slice(0, 3);
      const yasiyofaa = shuffle(rng, MAAGIZO_YASIYOFAA).slice(0, 3);
      const items = shuffle(rng, [
        ...yanayofaa.map((label) => ({ id: label, label, bucket: "yanayofaa" })),
        ...yasiyofaa.map((label) => ({ id: label, label, bucket: "yasiyofaa" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila mfano katika kundi la Maagizo Yanayofaa au Maagizo Yasiyofaa.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "yanayofaa", label: "Maagizo Yanayofaa" },
          { id: "yasiyofaa", label: "Maagizo Yasiyofaa" },
        ],
        correctBucket,
        hint: "Maagizo yanayofaa huwa wazi, mafupi, na ya hatua kwa hatua.",
        explanation: `Maagizo yanayofaa: ${yanayofaa.join(" / ")}. Maagizo yasiyofaa: ${yasiyofaa.join(" / ")}.`,
      };
    }

    if (branch === "hatua") {
      const items = shuffle(rng, HATUA_KUPOKEA_MAAGIZO);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kupokea na kufuata maagizo ipasavyo.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUPOKEA_MAAGIZO.map((s) => s.id),
        hint: "Kwanza sikiliza, kisha hakikisha umeelewa, kabla ya kutekeleza.",
        explanation: HATUA_KUPOKEA_MAAGIZO.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "jaza") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: "Maelekezo yanayotolewa kwa mtu ili atekeleze jambo fulani kwa hatua maalum huitwa",
        after: ".",
        correctAnswer: "maagizo",
        inputMode: "text",
        hint: "Neno hili ni jina la kawaida linalotumika kuelezea maelekezo ya jinsi ya kutenda jambo.",
        explanation: "Maelekezo kama hayo huitwa maagizo — hutolewa ili mtu atekeleze jambo kwa hatua maalum.",
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
      hint: "Maagizo yafaayo ni wazi, ya hatua kwa hatua, na hayategemei jinsia ya mpokeaji.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
