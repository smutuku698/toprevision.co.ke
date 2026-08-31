import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Ngeli = "A-WA" | "U-I" | "KI-VI" | "LI-YA";

const NOMINO_NGELI: { neno: string; ngeli: Ngeli }[] = [
  { neno: "mtoto", ngeli: "A-WA" },
  { neno: "watoto", ngeli: "A-WA" },
  { neno: "mwalimu", ngeli: "A-WA" },
  { neno: "mti", ngeli: "U-I" },
  { neno: "miti", ngeli: "U-I" },
  { neno: "mpira", ngeli: "U-I" },
  { neno: "kitabu", ngeli: "KI-VI" },
  { neno: "vitabu", ngeli: "KI-VI" },
  { neno: "kiti", ngeli: "KI-VI" },
  { neno: "tunda", ngeli: "LI-YA" },
  { neno: "matunda", ngeli: "LI-YA" },
  { neno: "yai", ngeli: "LI-YA" },
];

const UPATANISHO: Record<Ngeli, string> = {
  "A-WA": "hutumia kiambishi 'a-' kwa umoja na 'wa-' kwa wingi kwenye kitenzi (mfano: mtoto analia, watoto wanalia)",
  "U-I": "hutumia kiambishi 'u-' kwa umoja na 'i-' kwa wingi kwenye kitenzi (mfano: mti unaanguka, miti inaanguka)",
  "KI-VI": "hutumia kiambishi 'ki-' kwa umoja na 'vi-' kwa wingi kwenye kitenzi (mfano: kitabu kinasomwa, vitabu vinasomwa)",
  "LI-YA": "hutumia kiambishi 'li-' kwa umoja na 'ya-' kwa wingi kwenye kitenzi (mfano: tunda linaiva, matunda yanaiva)",
};

const ICON_NGELI: { icon: "apple" | "ball" | "book"; neno: string; ngeli: Ngeli }[] = [
  { icon: "apple", neno: "Tunda", ngeli: "LI-YA" },
  { icon: "ball", neno: "Mpira", ngeli: "U-I" },
  { icon: "book", neno: "Kitabu", ngeli: "KI-VI" },
];

const SENTENSI_SAHIHI: { nomino: string; ngeli: Ngeli; sahihi: string; makosa: string[] }[] = [
  {
    nomino: "Matunda",
    ngeli: "LI-YA",
    sahihi: "Matunda yanaiva shambani.",
    makosa: ["Matunda linaiva shambani.", "Matunda kinaiva shambani.", "Matunda unaiva shambani."],
  },
  {
    nomino: "Miti",
    ngeli: "U-I",
    sahihi: "Miti inaanguka kwa sababu ya upepo.",
    makosa: ["Miti anaanguka kwa sababu ya upepo.", "Miti linaanguka kwa sababu ya upepo.", "Miti vinaanguka kwa sababu ya upepo."],
  },
  {
    nomino: "Vitabu",
    ngeli: "KI-VI",
    sahihi: "Vitabu vinasomwa na wanafunzi wote.",
    makosa: ["Vitabu yanasomwa na wanafunzi wote.", "Vitabu wanasomwa na wanafunzi wote.", "Vitabu inasomwa na wanafunzi wote."],
  },
  {
    nomino: "Watoto",
    ngeli: "A-WA",
    sahihi: "Watoto wanalia sana wakiwa na njaa.",
    makosa: ["Watoto yanalia sana wakiwa na njaa.", "Watoto inalia sana wakiwa na njaa.", "Watoto vinalia sana wakiwa na njaa."],
  },
];

const AGIZO_KITENZI: { before: string; after: string; sahihi: string; ngeli: Ngeli }[] = [
  { before: "Miti hii", after: " kwa sababu ya upepo mkali.", sahihi: "inaanguka", ngeli: "U-I" },
  { before: "Watoto wale", after: " kwa furaha uwanjani.", sahihi: "wanacheza", ngeli: "A-WA" },
  { before: "Matunda haya", after: " vizuri msimu huu.", sahihi: "yanaiva", ngeli: "LI-YA" },
  { before: "Vitabu vipya", after: " darasani kesho.", sahihi: "vitagawiwa", ngeli: "KI-VI" },
];

export const ngeliUpatanishoWaKisarufi: Skill = {
  id: "g7-ksw-sarufi-ngeli-upatanisho-wa-kisarufi",
  code: "SA.5",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Ngeli na Upatanisho wa Kisarufi",
  description: "Tambua ngeli za nomino (A-WA, U-I, KI-VI, LI-YA) na uzitumie kwa upatanisho sahihi wa kisarufi.",
  generate(rng) {
    const branch = randChoice(rng, ["panga-ngeli", "oanisha-upatanisho", "icon-ngeli", "sentensi-sahihi", "jaza-kitenzi", "panga-maneno"] as const);

    if (branch === "panga-ngeli") {
      const chosen = [
        ...shuffle(rng, NOMINO_NGELI.filter((n) => n.ngeli === "A-WA")).slice(0, 2),
        ...shuffle(rng, NOMINO_NGELI.filter((n) => n.ngeli === "U-I")).slice(0, 2),
        ...shuffle(rng, NOMINO_NGELI.filter((n) => n.ngeli === "KI-VI")).slice(0, 2),
        ...shuffle(rng, NOMINO_NGELI.filter((n) => n.ngeli === "LI-YA")).slice(0, 2),
      ];
      const items = chosen.map((n) => ({ id: n.neno, label: n.neno, bucket: n.ngeli }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila nomino katika ngeli yake sahihi.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "A-WA", label: "A-WA" },
          { id: "U-I", label: "U-I" },
          { id: "KI-VI", label: "KI-VI" },
          { id: "LI-YA", label: "LI-YA" },
        ],
        correctBucket,
        hint: "Fikiria kiambishi kinachotumika kuunganisha nomino hii na kitenzi.",
        explanation: chosen.map((n) => `"${n.neno}" ni ngeli ya ${n.ngeli}.`).join(" "),
      };
    }

    if (branch === "oanisha-upatanisho") {
      const ngeliZote: Ngeli[] = ["A-WA", "U-I", "KI-VI", "LI-YA"];
      const tokens = shuffle(rng, ngeliZote.map((n) => ({ id: n, label: n })));
      const targets = shuffle(rng, ngeliZote.map((n) => ({ id: n, label: UPATANISHO[n] })));
      const correctMap: Record<string, string> = {};
      for (const n of ngeliZote) correctMap[n] = n;
      return {
        kind: "click-match",
        prompt: "Oanisha kila ngeli na maelezo sahihi ya upatanisho wake wa kisarufi.",
        tokens,
        targets,
        correctMap,
        hint: "Kila ngeli ina kiambishi chake maalum cha umoja na wingi.",
        explanation: ngeliZote.map((n) => `Ngeli ${n} ${UPATANISHO[n]}.`).join(" "),
      };
    }

    if (branch === "icon-ngeli") {
      const entry = randChoice(rng, ICON_NGELI);
      const ngeliZote: Ngeli[] = ["A-WA", "U-I", "KI-VI", "LI-YA"];
      const choices = shuffle(rng, ngeliZote);
      return {
        kind: "multiple-choice",
        prompt: `${entry.neno} lililoonyeshwa ni la ngeli gani?`,
        visual: { type: "icon-set", icon: entry.icon, count: 1, color: "#16a34a" },
        choices,
        correctIndex: choices.indexOf(entry.ngeli),
        layout: "row",
        hint: UPATANISHO[entry.ngeli],
        explanation: `"${entry.neno}" ni ngeli ya ${entry.ngeli} — ${UPATANISHO[entry.ngeli]}.`,
      };
    }

    if (branch === "sentensi-sahihi") {
      const entry = randChoice(rng, SENTENSI_SAHIHI);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Ni sentensi ipi yenye upatanisho sahihi wa kisarufi kwa nomino "${entry.nomino}"?`,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: `"${entry.nomino}" ni ngeli ya ${entry.ngeli} — ${UPATANISHO[entry.ngeli]}.`,
        explanation: `Sentensi sahihi ni: "${entry.sahihi}"`,
      };
    }

    if (branch === "jaza-kitenzi") {
      const entry = randChoice(rng, AGIZO_KITENZI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kitenzi chenye upatanisho sahihi wa kisarufi.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: `Nomino hii ni ya ngeli ${entry.ngeli} — ${UPATANISHO[entry.ngeli]}.`,
        explanation: `Sentensi kamili ni: "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, SENTENSI_SAHIHI);
    const words = entry.sahihi.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi yenye upatanisho sahihi wa kisarufi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Nomino "${entry.nomino}" ni ngeli ya ${entry.ngeli}.`,
      explanation: `Sentensi sahihi ni: "${entry.sahihi}"`,
    };
  },
};
