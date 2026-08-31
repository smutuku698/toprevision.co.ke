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

const NOUNS_YA_YA: { neno: string; maana: string }[] = [
  { neno: "maji", maana: "water" },
  { neno: "maziwa", maana: "milk" },
  { neno: "mate", maana: "saliva" },
  { neno: "marashi", maana: "perfume" },
  { neno: "maskani", maana: "dwelling/residence" },
  { neno: "mafuta", maana: "oil/fat" },
  { neno: "matope", maana: "mud" },
  { neno: "majivu", maana: "ash" },
  { neno: "machozi", maana: "tears" },
  { neno: "maradhi", maana: "illness" },
  { neno: "mapenzi", maana: "love" },
  { neno: "maarifa", maana: "knowledge" },
  { neno: "maumivu", maana: "pain" },
  { neno: "mazoezi", maana: "exercise" },
  { neno: "mawazo", maana: "thoughts" },
  { neno: "maisha", maana: "life" },
  { neno: "mazungumzo", maana: "conversation" },
  { neno: "maelewano", maana: "mutual understanding" },
  { neno: "maombi", maana: "prayers/requests" },
  { neno: "mavazi", maana: "clothes" },
  { neno: "maandalizi", maana: "preparations" },
  { neno: "maadili", maana: "morals" },
  { neno: "mafanikio", maana: "successes" },
  { neno: "maelezo", maana: "explanations" },
  { neno: "mashaka", maana: "doubts/worries" },
  { neno: "maafa", maana: "disasters" },
  { neno: "mapato", maana: "income" },
  { neno: "matumaini", maana: "hope" },
  { neno: "mahitaji", maana: "needs" },
  { neno: "mavuno", maana: "harvest" },
  { neno: "maadhimisho", maana: "celebrations" },
  { neno: "maslahi", maana: "interests/benefits" },
];

const VITENZI: { mzizi: string; wakati: "sasa" | "wakati_uliopita" | "wakati_ujao"; kiambishi: string }[] = [
  { mzizi: "chemka", wakati: "sasa", kiambishi: "na" },
  { mzizi: "isha", wakati: "wakati_uliopita", kiambishi: "li" },
  { mzizi: "faa", wakati: "wakati_ujao", kiambishi: "ta" },
];

const WRONG_PREFIXES = ["li", "i", "a", "wa", "ki"] as const;

function verbForm(kiambishi: string, mzizi: string) {
  return `ya${kiambishi}${mzizi}`;
}

const DISTRACTOR_NOUNS_OTHER_CLASS = [
  { neno: "mtoto", tabaka: "A-WA" },
  { neno: "mti", tabaka: "U-I" },
  { neno: "kitabu", tabaka: "KI-VI" },
  { neno: "mwalimu", tabaka: "A-WA" },
  { neno: "mpira", tabaka: "U-I" },
  { neno: "kiti", tabaka: "KI-VI" },
];

export const ngeliYaYa: Skill = {
  id: "g6-ksw-sarufi-ngeli-ya-ya",
  code: "SA.11",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Ngeli ya YA-YA",
  description: "Tambua nomino za ngeli ya YA-YA (mfano: maji, maziwa, mafuta) na uzitumie kwa upatanisho sahihi wa kisarufi na kitenzi (ya-).",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-kitenzi", "oanisha-maana", "panga-ngeli", "jaza-sentensi", "hali-ya-mazingira"] as const);

    if (branch === "chagua-kitenzi") {
      const nomino = randChoice(rng, NOUNS_YA_YA);
      const kitenzi = randChoice(rng, VITENZI);
      const sahihi = verbForm(kitenzi.kiambishi, kitenzi.mzizi);
      const makosa = shuffle(rng, WRONG_PREFIXES)
        .slice(0, 3)
        .map((p) => `${p}${kitenzi.kiambishi}${kitenzi.mzizi}`);
      const choices = shuffle(rng, [sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Ni kitenzi kipi chenye upatanisho sahihi wa kisarufi kwa "${nomino.neno}"?`,
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "row",
        hint: `"${nomino.neno}" ni nomino ya ngeli ya YA-YA — hutumia kiambishi 'ya-' kwenye kitenzi.`,
        explanation: `Sahihi ni "${sahihi}" — nomino za ngeli ya YA-YA kama "${nomino.neno}" hutumia kiambishi 'ya-'. Viambishi vingine (kama 'li-', 'a-', 'wa-') ni vya ngeli tofauti.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, NOUNS_YA_YA).slice(0, 6);
      const tokens = chosen.map((n) => ({ id: n.neno, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.neno, label: n.maana }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila nomino ya ngeli ya YA-YA na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Nomino hizi zote hutumia kiambishi 'ya-' kwenye vitenzi vyake.",
        explanation: chosen.map((n) => `"${n.neno}" maana yake ni ${n.maana}.`).join(" "),
      };
    }

    if (branch === "panga-ngeli") {
      const yaYa = shuffle(rng, NOUNS_YA_YA).slice(0, 5).map((n) => ({ id: n.neno, label: n.neno, bucket: "YA-YA" }));
      const nyingine = shuffle(rng, DISTRACTOR_NOUNS_OTHER_CLASS).slice(0, 5).map((n) => ({ id: n.neno, label: n.neno, bucket: "SI-YA-YA" }));
      const items = shuffle(rng, [...yaYa, ...nyingine]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga nomino hizi: je, ni za ngeli ya YA-YA au la?",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "YA-YA", label: "Ngeli ya YA-YA" },
          { id: "SI-YA-YA", label: "Si Ngeli ya YA-YA" },
        ],
        correctBucket,
        hint: "Nomino za YA-YA huanza na 'ma-' na hazina umoja wa kawaida (mfano: maji, mazoezi).",
        explanation: "Nomino za YA-YA hutumia kiambishi 'ya-' kwenye kitenzi; nomino zingine hutumia viambishi tofauti kulingana na ngeli yake.",
      };
    }

    if (branch === "jaza-sentensi") {
      const nomino = randChoice(rng, NOUNS_YA_YA);
      const jina = randChoice(rng, KENYAN_NAMES);
      const mahali = randChoice(rng, KENYAN_PLACES);
      const TEMPLATES = [
        { before: `${jina} alisema kwamba ${nomino.neno} `, after: ` sana huko ${mahali}.`, kitenzi: "yanahitajika" },
        { before: `Watu wa ${mahali} walisema ${nomino.neno} yao `, after: " tayari.", kitenzi: "yako" },
        { before: `${jina} anaamini ${nomino.neno} `, after: " kwa jamii yote.", kitenzi: "yanafaa" },
        { before: `Kila mwaka huko ${mahali}, ${nomino.neno} `, after: " kwa wingi.", kitenzi: "yanaonekana" },
        { before: `${jina} na wenzake walijadili jinsi ${nomino.neno} `, after: " maishani.", kitenzi: "yanavyosaidia" },
        { before: `Ripoti kutoka ${mahali} ilieleza kuwa ${nomino.neno} `, after: " mwaka huu.", kitenzi: "yameongezeka" },
        { before: `Mzee mmoja wa ${mahali} alisimulia jinsi ${nomino.neno} `, after: " zamani.", kitenzi: "yalivyokuwa" },
        { before: `${jina} alishangazwa na jinsi ${nomino.neno} `, after: " haraka hivyo.", kitenzi: "yalivyobadilika" },
        { before: `Katika shule ya ${mahali}, walimu walisema ${nomino.neno} `, after: " kwa wanafunzi wote.", kitenzi: "yanahusika" },
        { before: `${jina} aliandika kuwa ${nomino.neno} `, after: " kila siku.", kitenzi: "yanabadilika" },
        { before: `Watafiti huko ${mahali} waligundua ${nomino.neno} `, after: " kwa kiasi kikubwa.", kitenzi: "yaliathiri" },
        { before: `${jina} anatumaini ${nomino.neno} `, after: " hivi karibuni.", kitenzi: "yataboreshwa" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kitenzi chenye upatanisho sahihi wa ngeli ya YA-YA.",
        before: t.before,
        after: t.after,
        correctAnswer: t.kitenzi,
        inputMode: "text",
        hint: `"${nomino.neno}" ni ngeli ya YA-YA — kitenzi chake huanza na 'ya-'.`,
        explanation: `Sentensi kamili: "${t.before}${t.kitenzi}${t.after}"`,
      };
    }

    const nomino = randChoice(rng, NOUNS_YA_YA);
    const jina = randChoice(rng, KENYAN_NAMES);
    const kamili = `${jina} alisema ${nomino.neno} yale yalikuwa tayari.`;
    const maneno = kamili.replace(".", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye upatanisho wa ngeli ya YA-YA.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${nomino.neno}" ni ngeli ya YA-YA — vivumishi na vitenzi vyake hutumia 'ya-'.`,
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
