import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

type Alama = "nge" | "ngali" | "ki";

const ALAMA_MAELEZO: Record<Alama, string> = {
  nge: "kanusho la '-nge-' hutumia '-singe-' (mfano: Ningelima → Nisingelima)",
  ngali: "kanusho la '-ngali-' hutumia '-singali-' (mfano: Ningalisoma → Nisingalisoma)",
  ki: "kanusho la '-ki-' hutumia '-sipo-' (mfano: Nikifika → Nisipofika)",
};

const JOZI: { chanya: string; kanushi: string; alama: Alama; matokeo: string }[] = [
  { chanya: "ningelima shambani", kanushi: "nisingelima shambani", alama: "nge", matokeo: "nisingepata mazao" },
  { chanya: "ungenunua kalamu", kanushi: "usingenunua kalamu", alama: "nge", matokeo: "usingeandika vizuri" },
  { chanya: "angesoma kwa bidii", kanushi: "asingesoma kwa bidii", alama: "nge", matokeo: "asingefaulu mtihani" },
  { chanya: "tungeamka mapema", kanushi: "tusingeamka mapema", alama: "nge", matokeo: "tusingefika shuleni kwa wakati" },
  { chanya: "mngesafisha darasa", kanushi: "msingesafisha darasa", alama: "nge", matokeo: "msingepongezwa" },
  { chanya: "wangeshirikiana", kanushi: "wasingeshirikiana", alama: "nge", matokeo: "wasingemaliza kazi haraka" },
  { chanya: "ningepata pesa", kanushi: "nisingepata pesa", alama: "nge", matokeo: "nisingenunua baiskeli" },
  { chanya: "ungeniuliza", kanushi: "usingeniuliza", alama: "nge", matokeo: "usingejua ukweli" },
  { chanya: "ningalisoma kwa bidii", kanushi: "nisingalisoma kwa bidii", alama: "ngali", matokeo: "nisingalifaulu mtihani" },
  { chanya: "ungalinunua tikiti mapema", kanushi: "usingalinunua tikiti mapema", alama: "ngali", matokeo: "usingaliketi karibu na jukwaa" },
  { chanya: "angalikuja mapema", kanushi: "asingalikuja mapema", alama: "ngali", matokeo: "asingaliona onyesho lote" },
  { chanya: "tungalitunza mazingira", kanushi: "tusingalitunza mazingira", alama: "ngali", matokeo: "tusingalikuwa na hewa safi" },
  { chanya: "mngalisikiliza maonyo", kanushi: "msingalisikiliza maonyo", alama: "ngali", matokeo: "msingaliepuka hatari" },
  { chanya: "wangaliwahi kituoni", kanushi: "wasingaliwahi kituoni", alama: "ngali", matokeo: "wasingalipanda basi la kwanza" },
  { chanya: "ningalimwambia mapema", kanushi: "nisingalimwambia mapema", alama: "ngali", matokeo: "nisingalimsaidia" },
  { chanya: "ungalifunga mlango", kanushi: "usingalifunga mlango", alama: "ngali", matokeo: "usingaliepuka baridi" },
  { chanya: "nikifika mapema", kanushi: "nisipofika mapema", alama: "ki", matokeo: "sitapata nafasi nzuri" },
  { chanya: "ukisoma kwa makini", kanushi: "usiposoma kwa makini", alama: "ki", matokeo: "hutaelewa somo vizuri" },
  { chanya: "akifanya bidii", kanushi: "asipofanya bidii", alama: "ki", matokeo: "hatafaulu mtihani wake" },
  { chanya: "tukishirikiana", kanushi: "tusiposhirikiana", alama: "ki", matokeo: "hatutamaliza kazi upesi" },
  { chanya: "mkifika mapema", kanushi: "msipofika mapema", alama: "ki", matokeo: "hamtapata viti vizuri" },
  { chanya: "wakijitahidi", kanushi: "wasipojitahidi", alama: "ki", matokeo: "hawatashinda mashindano" },
  { chanya: "nikinywa maji ya kutosha", kanushi: "nisipokunywa maji ya kutosha", alama: "ki", matokeo: "sitakuwa na afya njema" },
  { chanya: "ukiuliza swali zuri", kanushi: "usipouliza swali zuri", alama: "ki", matokeo: "hutapata jibu la kina" },
];

export const ukanushajiWaHaliYaMasharti: Skill = {
  id: "g6-ksw-sarufi-ukanushaji-wa-hali-ya-masharti",
  code: "SA.18",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Ukanushaji wa Hali ya Masharti",
  description: "Kanusha viambishi vitatu vya hali ya masharti: -singe- (kanusho la -nge-), -singali- (kanusho la -ngali-), na -sipo- (kanusho la -ki-).",
  generate(rng) {
    const branch = randChoice(rng, ["kanusha", "oanisha-jozi", "panga-aina", "jaza-kanushi", "tathmini-makosa"] as const);

    if (branch === "kanusha") {
      const j = randChoice(rng, JOZI);
      const chanyaSentensi = j.chanya.charAt(0).toUpperCase() + j.chanya.slice(1);
      const makosa = shuffle(rng, JOZI.filter((x) => x.alama !== j.alama)).slice(0, 3).map((x) => x.kanushi);
      const choices = shuffle(rng, [j.kanushi, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Ni upi umbo sahihi la ukanushaji wa "${chanyaSentensi}"?`,
        choices,
        correctIndex: choices.indexOf(j.kanushi),
        layout: "row",
        hint: ALAMA_MAELEZO[j.alama],
        explanation: `Kanusho sahihi ni "${j.kanushi}" — ${ALAMA_MAELEZO[j.alama]}.`,
      };
    }

    if (branch === "oanisha-jozi") {
      const chosen = shuffle(rng, JOZI).slice(0, 6);
      const tokens = chosen.map((j) => ({ id: j.chanya, label: j.chanya.charAt(0).toUpperCase() + j.chanya.slice(1) }));
      const targets = shuffle(rng, chosen).map((j) => ({ id: j.chanya, label: j.kanushi.charAt(0).toUpperCase() + j.kanushi.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const j of chosen) correctMap[j.chanya] = j.chanya;
      return {
        kind: "click-match",
        prompt: "Oanisha kila sentensi ya masharti na umbo lake la ukanushaji.",
        tokens,
        targets,
        correctMap,
        hint: "Tazama ni kiambishi kipi cha masharti kilichotumika kabla ya kukanusha.",
        explanation: chosen.map((j) => `Kanusho la "${j.chanya}" ni "${j.kanushi}".`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const chosen = shuffle(rng, JOZI).slice(0, 6);
      const items = chosen.map((j) => ({ id: j.chanya, label: j.kanushi.charAt(0).toUpperCase() + j.kanushi.slice(1), bucket: j.alama }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kanushi kulingana na aina ya sharti linalokanushwa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "nge", label: "Kanusho la -nge-" },
          { id: "ngali", label: "Kanusho la -ngali-" },
          { id: "ki", label: "Kanusho la -ki-" },
        ],
        correctBucket,
        hint: "'-singe-' na '-singali-' hufanana lakini '-sipo-' hutumika kwa hali ya -ki- pekee.",
        explanation: chosen.map((j) => `"${j.kanushi}" ni kanusho la hali ya -${j.alama}-.`).join(" "),
      };
    }

    if (branch === "jaza-kanushi") {
      const j = randChoice(rng, JOZI);
      const jina = randChoice(rng, KENYAN_NAMES);
      return {
        kind: "fill-blank",
        prompt: `${jina} anaeleza jambo ambalo halikutimizwa/haliwezi kutimia. Kamilisha sentensi kwa umbo la ukanushaji.`,
        before: `${jina} alisema: "`,
        after: `, ${j.matokeo}."`,
        correctAnswer: j.kanushi,
        inputMode: "text",
        hint: ALAMA_MAELEZO[j.alama],
        explanation: `Sentensi kamili: "${jina} alisema: \\"${j.kanushi}, ${j.matokeo}.\\""`,
      };
    }

    const j = randChoice(rng, JOZI);
    const jina = randChoice(rng, KENYAN_NAMES);
    const kamili = `${jina} alisema: ${j.kanushi.charAt(0).toUpperCase() + j.kanushi.slice(1)}, ${j.matokeo}.`;
    const maneno = kamili.replace(".", "").replace(":", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi ya ukanushaji wa hali ya masharti.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: ALAMA_MAELEZO[j.alama],
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
