import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

type Alama = "nge" | "ngali" | "ki";

const ALAMA_MAELEZO: Record<Alama, string> = {
  nge: "'-nge-' huonyesha sharti linalowezekana lakini si dhahiri kutokea sasa/wakati ujao (mfano: 'Ningelima...')",
  ngali: "'-ngali-' huonyesha sharti la wakati uliopita ambalo halikutimizwa (mfano: 'Ningalisoma...')",
  ki: "'-ki-' huonyesha sharti linalowezekana kwa urahisi au tayari linatokea (mfano: 'Nikifika...')",
};

const MASHARTI: { sharti: string; matokeo: string; alama: Alama }[] = [
  { sharti: "ningelima shambani", matokeo: "ningepata mazao mengi", alama: "nge" },
  { sharti: "ungenunua kalamu", matokeo: "ungeandika vizuri", alama: "nge" },
  { sharti: "angesoma kwa bidii", matokeo: "angefaulu mtihani", alama: "nge" },
  { sharti: "tungeamka mapema", matokeo: "tungefika shuleni kwa wakati", alama: "nge" },
  { sharti: "mngesafisha darasa", matokeo: "mngepongezwa na mwalimu", alama: "nge" },
  { sharti: "wangeshirikiana", matokeo: "wangemaliza kazi haraka", alama: "nge" },
  { sharti: "ningepata pesa", matokeo: "ningenunua baiskeli", alama: "nge" },
  { sharti: "ungeniuliza", matokeo: "ningekueleza ukweli", alama: "nge" },
  { sharti: "ningalisoma kwa bidii", matokeo: "ningalifaulu mtihani", alama: "ngali" },
  { sharti: "ungalinunua tikiti mapema", matokeo: "ungaliketi karibu na jukwaa", alama: "ngali" },
  { sharti: "angalikuja mapema", matokeo: "angaliona onyesho lote", alama: "ngali" },
  { sharti: "tungalitunza mazingira", matokeo: "tungalikuwa na hewa safi zaidi", alama: "ngali" },
  { sharti: "mngalisikiliza maonyo", matokeo: "mngaliepuka hatari", alama: "ngali" },
  { sharti: "wangaliwahi kituoni", matokeo: "wangalipanda basi la kwanza", alama: "ngali" },
  { sharti: "ningalimwambia mapema", matokeo: "ningalimsaidia", alama: "ngali" },
  { sharti: "ungalifunga mlango", matokeo: "ungaliepuka baridi", alama: "ngali" },
  { sharti: "nikifika mapema", matokeo: "nitapata nafasi nzuri", alama: "ki" },
  { sharti: "ukisoma kwa makini", matokeo: "utaelewa somo vizuri", alama: "ki" },
  { sharti: "akifanya bidii", matokeo: "atafaulu mtihani wake", alama: "ki" },
  { sharti: "tukishirikiana", matokeo: "tutamaliza kazi upesi", alama: "ki" },
  { sharti: "mkifika mapema", matokeo: "mtapata viti vizuri", alama: "ki" },
  { sharti: "wakijitahidi", matokeo: "watashinda mashindano", alama: "ki" },
  { sharti: "nikinywa maji ya kutosha", matokeo: "nitakuwa na afya njema", alama: "ki" },
  { sharti: "ukiuliza swali zuri", matokeo: "utapata jibu la kina", alama: "ki" },
];

export const haliYaMasharti: Skill = {
  id: "g6-ksw-sarufi-hali-ya-masharti",
  code: "SA.17",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Hali ya Masharti (nge, ngali na ki)",
  description: "Tambua na utumie viambishi vitatu vya hali ya masharti: -nge- (sharti linalowezekana), -ngali- (sharti la wakati uliopita), na -ki- (sharti la wazi).",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-alama", "oanisha-mfano", "panga-aina", "unganisha-sentensi", "tathmini-sentensi"] as const);

    if (branch === "chagua-alama") {
      const m = randChoice(rng, MASHARTI);
      const wote: Alama[] = ["nge", "ngali", "ki"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `Sentensi "${m.sharti.charAt(0).toUpperCase() + m.sharti.slice(1)}, ${m.matokeo}" inatumia kiambishi kipi cha hali ya masharti?`,
        choices: choices.map((a) => `-${a}-`),
        correctIndex: choices.indexOf(m.alama),
        layout: "row",
        hint: ALAMA_MAELEZO[m.alama],
        explanation: `Sentensi hii inatumia '-${m.alama}-' — ${ALAMA_MAELEZO[m.alama]}.`,
      };
    }

    if (branch === "oanisha-mfano") {
      const kila: { id: Alama; label: string }[] = (["nge", "ngali", "ki"] as const).map((a) => ({
        id: a,
        label: (() => {
          const m = randChoice(rng, MASHARTI.filter((x) => x.alama === a));
          return `${m.sharti.charAt(0).toUpperCase() + m.sharti.slice(1)}, ${m.matokeo}.`;
        })(),
      }));
      const targets = shuffle(rng, ["nge", "ngali", "ki"] as const).map((a) => ({ id: a, label: ALAMA_MAELEZO[a] }));
      const correctMap: Record<string, string> = { nge: "nge", ngali: "ngali", ki: "ki" };
      return {
        kind: "click-match",
        prompt: "Oanisha kila sentensi ya masharti na maelezo sahihi ya kiambishi kilichotumika.",
        tokens: kila,
        targets,
        correctMap,
        hint: "Tazama kiambishi kilichoungana na kitenzi katika sehemu ya sharti.",
        explanation: (["nge", "ngali", "ki"] as const).map((a) => `'-${a}-': ${ALAMA_MAELEZO[a]}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const chosen = shuffle(rng, MASHARTI).slice(0, 6);
      const items = chosen.map((m) => ({
        id: `${m.sharti}-${m.matokeo}`,
        label: `${m.sharti.charAt(0).toUpperCase() + m.sharti.slice(1)}, ${m.matokeo}.`,
        bucket: m.alama,
      }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi za masharti kulingana na kiambishi kinachotumika.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "nge", label: "-nge- (Linalowezekana)" },
          { id: "ngali", label: "-ngali- (Wakati Uliopita)" },
          { id: "ki", label: "-ki- (Wazi)" },
        ],
        correctBucket,
        hint: "Tazama sehemu ya sharti la kila sentensi kwa makini.",
        explanation: chosen.map((m) => `"${m.sharti}" ni hali ya -${m.alama}-.`).join(" "),
      };
    }

    if (branch === "unganisha-sentensi") {
      const m = randChoice(rng, MASHARTI);
      const kamili = `${m.sharti.charAt(0).toUpperCase() + m.sharti.slice(1)}, ${m.matokeo}.`;
      const maneno = kamili.replace(".", "").replace(",", "").split(" ");
      const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: "Panga maneno haya ili kuunda sentensi sahihi ya hali ya masharti.",
        instruction: "Bofya maneno kwa mpangilio sahihi.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: ALAMA_MAELEZO[m.alama],
        explanation: `Sentensi sahihi ni: "${kamili}"`,
      };
    }

    if (branch === "tathmini-sentensi") {
      const m = randChoice(rng, MASHARTI);
      const jina = randChoice(rng, KENYAN_NAMES);
      const kamili = `${jina} alisema: "${m.sharti.charAt(0).toUpperCase() + m.sharti.slice(1)}, ${m.matokeo}."`;
      return {
        kind: "fill-blank",
        prompt: `${jina} anaeleza sharti. Kamilisha sentensi kwa sehemu ya matokeo yanayofaa.`,
        before: `${jina} alisema: "${m.sharti.charAt(0).toUpperCase() + m.sharti.slice(1)}, `,
        after: `."`,
        correctAnswer: m.matokeo,
        inputMode: "text",
        hint: ALAMA_MAELEZO[m.alama],
        explanation: `Sentensi kamili: ${kamili}`,
      };
    }

    const m = randChoice(rng, MASHARTI);
    const jina = randChoice(rng, KENYAN_NAMES);
    return {
      kind: "fill-blank",
      prompt: `Kamilisha sharti la ${jina}.`,
      before: `${jina} alisema: "`,
      after: `, ${m.matokeo}."`,
      correctAnswer: m.sharti,
      inputMode: "text",
      hint: ALAMA_MAELEZO[m.alama],
      explanation: `Sentensi kamili: "${jina} alisema: \\"${m.sharti}, ${m.matokeo}.\\""`,
    };
  },
};
