import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Machakos", "Kericho", "Nyeri", "Kitale", "Malindi",
  "Garissa", "Meru", "Bungoma", "Kakamega", "Naivasha", "Voi", "Kilifi",
] as const;
const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

const NOUNS_U_U: { neno: string; maana: string }[] = [
  { neno: "uji", maana: "porridge" },
  { neno: "ugali", maana: "a staple maize dish" },
  { neno: "uhuru", maana: "freedom" },
  { neno: "ujanja", maana: "cunning/cleverness" },
  { neno: "urafiki", maana: "friendship" },
  { neno: "uzuri", maana: "beauty" },
  { neno: "ukweli", maana: "truth" },
  { neno: "upendo", maana: "love" },
  { neno: "umoja", maana: "unity" },
  { neno: "ushirikiano", maana: "cooperation" },
  { neno: "ujinga", maana: "foolishness" },
  { neno: "uvivu", maana: "laziness" },
  { neno: "ukarimu", maana: "generosity" },
  { neno: "uadilifu", maana: "integrity" },
  { neno: "umaskini", maana: "poverty" },
  { neno: "utajiri", maana: "wealth" },
  { neno: "ustawi", maana: "wellbeing" },
  { neno: "ukatili", maana: "cruelty" },
  { neno: "ubinafsi", maana: "selfishness" },
  { neno: "udhaifu", maana: "weakness" },
  { neno: "ushujaa", maana: "bravery" },
  { neno: "uongozi", maana: "leadership" },
  { neno: "uzalendo", maana: "patriotism" },
  { neno: "uchoyo", maana: "greed" },
  { neno: "uaminifu", maana: "honesty" },
  { neno: "unyenyekevu", maana: "humility" },
  { neno: "uvumilivu", maana: "patience" },
  { neno: "uwajibikaji", maana: "responsibility" },
  { neno: "usalama", maana: "safety" },
  { neno: "utu", maana: "humanity/humaneness" },
  { neno: "umri", maana: "age" },
];

const VITENZI = [
  { mzizi: "saidia", wakati: "sasa", kiambishi: "na" },
  { mzizi: "hitajika", wakati: "wakati_uliopita", kiambishi: "li" },
  { mzizi: "kua", wakati: "wakati_ujao", kiambishi: "ta" },
] as const;

const WRONG_PREFIXES = ["ya", "i", "a", "wa", "ki"] as const;

function verbForm(kiambishi: string, mzizi: string) {
  return `u${kiambishi}${mzizi}`;
}

const DISTRACTOR_NOUNS_OTHER_CLASS = [
  { neno: "mtoto", tabaka: "A-WA" },
  { neno: "maji", tabaka: "YA-YA" },
  { neno: "kitabu", tabaka: "KI-VI" },
  { neno: "mwalimu", tabaka: "A-WA" },
  { neno: "mafuta", tabaka: "YA-YA" },
  { neno: "kiti", tabaka: "KI-VI" },
];

export const ngeliUU: Skill = {
  id: "g6-ksw-sarufi-ngeli-u-u",
  code: "SA.12",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Ngeli ya U-U",
  description: "Tambua nomino za ngeli ya U-U (mfano: uji, ugali, uhuru) — nomino nyingi dhahania — na uzitumie kwa upatanisho sahihi wa kisarufi na kitenzi (u-).",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-kitenzi", "oanisha-maana", "panga-ngeli", "jaza-sentensi", "sentensi-sahihi"] as const);

    if (branch === "chagua-kitenzi") {
      const nomino = randChoice(rng, NOUNS_U_U);
      const kitenzi = randChoice(rng, VITENZI);
      const sahihi = verbForm(kitenzi.kiambishi, kitenzi.mzizi);
      const makosa = shuffle(rng, WRONG_PREFIXES).slice(0, 3).map((p) => `${p}${kitenzi.kiambishi}${kitenzi.mzizi}`);
      const choices = shuffle(rng, [sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Ni kitenzi kipi chenye upatanisho sahihi wa kisarufi kwa "${nomino.neno}"?`,
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "row",
        hint: `"${nomino.neno}" ni nomino ya ngeli ya U-U — hutumia kiambishi 'u-' kwenye kitenzi.`,
        explanation: `Sahihi ni "${sahihi}" — nomino dhahania za ngeli ya U-U kama "${nomino.neno}" hutumia kiambishi 'u-', si 'ya-', 'i-', 'a-' au 'wa-' vinavyotumika kwa ngeli zingine.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, NOUNS_U_U).slice(0, 6);
      const tokens = chosen.map((n) => ({ id: n.neno, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.neno, label: n.maana }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila nomino ya ngeli ya U-U na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Nomino hizi nyingi ni dhahania (haziguswi) na huanza na 'u-'.",
        explanation: chosen.map((n) => `"${n.neno}" maana yake ni ${n.maana}.`).join(" "),
      };
    }

    if (branch === "panga-ngeli") {
      const uu = shuffle(rng, NOUNS_U_U).slice(0, 5).map((n) => ({ id: n.neno, label: n.neno, bucket: "U-U" }));
      const nyingine = shuffle(rng, DISTRACTOR_NOUNS_OTHER_CLASS).slice(0, 5).map((n) => ({ id: n.neno, label: n.neno, bucket: "SI-U-U" }));
      const items = shuffle(rng, [...uu, ...nyingine]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga nomino hizi: je, ni za ngeli ya U-U au la?",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "U-U", label: "Ngeli ya U-U" },
          { id: "SI-U-U", label: "Si Ngeli ya U-U" },
        ],
        correctBucket,
        hint: "Nomino za U-U huanza na 'u-' na mara nyingi ni dhahania (mfano: uhuru, umoja).",
        explanation: "Nomino za U-U hutumia kiambishi 'u-' kwenye kitenzi; nomino zingine hutumia viambishi tofauti kulingana na ngeli yake.",
      };
    }

    if (branch === "jaza-sentensi") {
      const nomino = randChoice(rng, NOUNS_U_U);
      const jina = randChoice(rng, KENYAN_NAMES);
      const mahali = randChoice(rng, KENYAN_PLACES);
      const TEMPLATES = [
        { before: `${jina} alisema kwamba ${nomino.neno} `, after: ` unahitajika sana huko ${mahali}.`, kitenzi: "unahitajika" },
        { before: `Wazee wa ${mahali} walisema ${nomino.neno} wao `, after: " tayari.", kitenzi: "upo" },
        { before: `${jina} anaamini ${nomino.neno} `, after: " kwa jamii yote.", kitenzi: "unafaa" },
        { before: `Kila mwaka huko ${mahali}, ${nomino.neno} `, after: " kuonekana zaidi.", kitenzi: "unaanza" },
        { before: `${jina} na wenzake walijadili jinsi ${nomino.neno} `, after: " maishani.", kitenzi: "unavyosaidia" },
        { before: `Ripoti kutoka ${mahali} ilieleza kuwa ${nomino.neno} `, after: " mwaka huu.", kitenzi: "umeongezeka" },
        { before: `Mzee mmoja wa ${mahali} alisimulia jinsi ${nomino.neno} `, after: " zamani.", kitenzi: "ulivyokuwa" },
        { before: `${jina} alishangazwa na jinsi ${nomino.neno} `, after: " haraka hivyo.", kitenzi: "ulivyobadilika" },
        { before: `Katika shule ya ${mahali}, walimu walisema ${nomino.neno} `, after: " kwa wanafunzi wote.", kitenzi: "unahusika" },
        { before: `${jina} aliandika kuwa ${nomino.neno} `, after: " kila siku.", kitenzi: "unabadilika" },
        { before: `Watafiti huko ${mahali} waligundua ${nomino.neno} `, after: " kwa kiasi kikubwa.", kitenzi: "uliathiri" },
        { before: `${jina} anatumaini ${nomino.neno} `, after: " hivi karibuni.", kitenzi: "utaboreshwa" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kitenzi chenye upatanisho sahihi wa ngeli ya U-U.",
        before: t.before,
        after: t.after,
        correctAnswer: t.kitenzi,
        inputMode: "text",
        hint: `"${nomino.neno}" ni ngeli ya U-U — kitenzi chake huanza na 'u-'.`,
        explanation: `Sentensi kamili: "${t.before}${t.kitenzi}${t.after}"`,
      };
    }

    const nomino = randChoice(rng, NOUNS_U_U);
    const jina = randChoice(rng, KENYAN_NAMES);
    const kamili = `${jina} alisema ${nomino.neno} wake ulikuwa mkubwa.`;
    const maneno = kamili.replace(".", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye upatanisho wa ngeli ya U-U.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${nomino.neno}" ni ngeli ya U-U — vivumishi na vitenzi vyake hutumia 'u-'.`,
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
