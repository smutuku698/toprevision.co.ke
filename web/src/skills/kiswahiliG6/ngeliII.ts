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

const NOUNS_I_I: { neno: string; maana: string }[] = [
  { neno: "chumvi", maana: "salt" },
  { neno: "miwani", maana: "glasses/spectacles" },
  { neno: "sukari", maana: "sugar" },
  { neno: "chai", maana: "tea" },
  { neno: "kahawa", maana: "coffee" },
  { neno: "mirathi", maana: "inheritance" },
  { neno: "asali", maana: "honey" },
  { neno: "sharubati", maana: "a sweet drink/cordial" },
  { neno: "nguvu", maana: "strength" },
  { neno: "heshima", maana: "respect" },
  { neno: "huduma", maana: "service" },
  { neno: "elimu", maana: "education" },
  { neno: "dawa", maana: "medicine" },
  { neno: "safari", maana: "journey" },
  { neno: "habari", maana: "news" },
  { neno: "lugha", maana: "language" },
  { neno: "sauti", maana: "voice/sound" },
  { neno: "kazi", maana: "work" },
  { neno: "ndoto", maana: "dream" },
  { neno: "hasira", maana: "anger" },
  { neno: "amani", maana: "peace" },
  { neno: "furaha", maana: "joy" },
  { neno: "huzuni", maana: "sadness" },
  { neno: "faida", maana: "profit/benefit" },
  { neno: "hasara", maana: "loss" },
  { neno: "gharama", maana: "cost" },
  { neno: "thamani", maana: "value" },
  { neno: "busara", maana: "wisdom" },
  { neno: "hekima", maana: "wisdom" },
  { neno: "nidhamu", maana: "discipline" },
  { neno: "haraka", maana: "hurry" },
  { neno: "radi", maana: "thunder" },
];

const VITENZI = [
  { mzizi: "onja", wakati: "sasa", kiambishi: "na" },
  { mzizi: "hitajika", wakati: "wakati_uliopita", kiambishi: "li" },
  { mzizi: "saidia", wakati: "wakati_ujao", kiambishi: "ta" },
] as const;

const WRONG_PREFIXES = ["ya", "u", "a", "wa", "ki"] as const;

function verbForm(kiambishi: string, mzizi: string) {
  return `i${kiambishi}${mzizi}`;
}

const DISTRACTOR_NOUNS_OTHER_CLASS = [
  { neno: "mtoto", tabaka: "A-WA" },
  { neno: "maji", tabaka: "YA-YA" },
  { neno: "kitabu", tabaka: "KI-VI" },
  { neno: "uhuru", tabaka: "U-U" },
  { neno: "mafuta", tabaka: "YA-YA" },
  { neno: "kiti", tabaka: "KI-VI" },
];

export const ngeliII: Skill = {
  id: "g6-ksw-sarufi-ngeli-i-i",
  code: "SA.13",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Ngeli ya I-I",
  description: "Tambua nomino za ngeli ya I-I (mfano: chumvi, sukari, chai, elimu) na uzitumie kwa upatanisho sahihi wa kisarufi na kitenzi (i-).",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-kitenzi", "oanisha-maana", "panga-ngeli", "jaza-sentensi", "sentensi-sahihi"] as const);

    if (branch === "chagua-kitenzi") {
      const nomino = randChoice(rng, NOUNS_I_I);
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
        hint: `"${nomino.neno}" ni nomino ya ngeli ya I-I — hutumia kiambishi 'i-' kwenye kitenzi.`,
        explanation: `Sahihi ni "${sahihi}" — nomino za ngeli ya I-I kama "${nomino.neno}" hutumia kiambishi 'i-', si 'ya-', 'u-', 'a-' au 'wa-' vinavyotumika kwa ngeli zingine.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, NOUNS_I_I).slice(0, 6);
      const tokens = chosen.map((n) => ({ id: n.neno, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.neno, label: n.maana }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila nomino ya ngeli ya I-I na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Nomino hizi zote hutumia kiambishi 'i-' kwenye vitenzi vyake, umoja na wingi vinafanana.",
        explanation: chosen.map((n) => `"${n.neno}" maana yake ni ${n.maana}.`).join(" "),
      };
    }

    if (branch === "panga-ngeli") {
      const ii = shuffle(rng, NOUNS_I_I).slice(0, 5).map((n) => ({ id: n.neno, label: n.neno, bucket: "I-I" }));
      const nyingine = shuffle(rng, DISTRACTOR_NOUNS_OTHER_CLASS).slice(0, 5).map((n) => ({ id: n.neno, label: n.neno, bucket: "SI-I-I" }));
      const items = shuffle(rng, [...ii, ...nyingine]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga nomino hizi: je, ni za ngeli ya I-I au la?",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "I-I", label: "Ngeli ya I-I" },
          { id: "SI-I-I", label: "Si Ngeli ya I-I" },
        ],
        correctBucket,
        hint: "Nomino za I-I hazibadiliki kati ya umoja na wingi (mfano: chumvi, elimu, kazi).",
        explanation: "Nomino za I-I hutumia kiambishi 'i-' kwenye kitenzi; nomino zingine hutumia viambishi tofauti kulingana na ngeli yake.",
      };
    }

    if (branch === "jaza-sentensi") {
      const nomino = randChoice(rng, NOUNS_I_I);
      const jina = randChoice(rng, KENYAN_NAMES);
      const mahali = randChoice(rng, KENYAN_PLACES);
      const TEMPLATES = [
        { before: `${jina} alisema kwamba ${nomino.neno} `, after: ` inahitajika sana huko ${mahali}.`, kitenzi: "inahitajika" },
        { before: `Wafanyabiashara wa ${mahali} walisema ${nomino.neno} yao `, after: " tayari.", kitenzi: "ipo" },
        { before: `${jina} anaamini ${nomino.neno} `, after: " kwa jamii yote.", kitenzi: "inafaa" },
        { before: `Kila mwaka huko ${mahali}, ${nomino.neno} `, after: " kuongezeka.", kitenzi: "inaanza" },
        { before: `${jina} na wenzake walijadili jinsi ${nomino.neno} `, after: " maishani.", kitenzi: "inavyosaidia" },
        { before: `Ripoti kutoka ${mahali} ilieleza kuwa ${nomino.neno} `, after: " mwaka huu.", kitenzi: "imeongezeka" },
        { before: `Mzee mmoja wa ${mahali} alisimulia jinsi ${nomino.neno} `, after: " zamani.", kitenzi: "ilivyokuwa" },
        { before: `${jina} alishangazwa na jinsi ${nomino.neno} `, after: " haraka hivyo.", kitenzi: "ilivyobadilika" },
        { before: `Katika soko la ${mahali}, wachuuzi walisema ${nomino.neno} `, after: " kwa wateja wote.", kitenzi: "inahusika" },
        { before: `${jina} aliandika kuwa ${nomino.neno} `, after: " kila siku.", kitenzi: "inabadilika" },
        { before: `Watafiti huko ${mahali} waligundua ${nomino.neno} `, after: " kwa kiasi kikubwa.", kitenzi: "iliathiri" },
        { before: `${jina} anatumaini ${nomino.neno} `, after: " hivi karibuni.", kitenzi: "itaboreshwa" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kitenzi chenye upatanisho sahihi wa ngeli ya I-I.",
        before: t.before,
        after: t.after,
        correctAnswer: t.kitenzi,
        inputMode: "text",
        hint: `"${nomino.neno}" ni ngeli ya I-I — kitenzi chake huanza na 'i-'.`,
        explanation: `Sentensi kamili: "${t.before}${t.kitenzi}${t.after}"`,
      };
    }

    const nomino = randChoice(rng, NOUNS_I_I);
    const jina = randChoice(rng, KENYAN_NAMES);
    const kamili = `${jina} alisema ${nomino.neno} nzuri ilikuwa muhimu.`;
    const maneno = kamili.replace(".", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye upatanisho wa ngeli ya I-I.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${nomino.neno}" ni ngeli ya I-I — vivumishi na vitenzi vyake hutumia 'i-'.`,
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
