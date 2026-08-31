import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type NgeliQ = "WA" | "MI" | "VI" | "MA" | "N";
type QKey = "ingi" | "chache" | "tatu" | "nne" | "tano" | "kumi";

const QKEYS: QKey[] = ["ingi", "chache", "tatu", "nne", "tano", "kumi"];
const EXACT_KEYS: QKey[] = ["tatu", "nne", "tano", "kumi"];
const VAGUE_KEYS: QKey[] = ["ingi", "chache"];

const CLASS_DATA: Record<NgeliQ, { nomino: string; verbMarker: string; forms: Record<QKey, string> }> = {
  WA: { nomino: "Watoto", verbMarker: "wa", forms: { ingi: "wengi", chache: "wachache", tatu: "watatu", nne: "wanne", tano: "watano", kumi: "kumi" } },
  MI: { nomino: "Miti", verbMarker: "i", forms: { ingi: "mingi", chache: "michache", tatu: "mitatu", nne: "minne", tano: "mitano", kumi: "kumi" } },
  VI: { nomino: "Vitabu", verbMarker: "vi", forms: { ingi: "vingi", chache: "vichache", tatu: "vitatu", nne: "vinne", tano: "vitano", kumi: "kumi" } },
  MA: { nomino: "Matunda", verbMarker: "ya", forms: { ingi: "mengi", chache: "machache", tatu: "matatu", nne: "manne", tano: "matano", kumi: "kumi" } },
  N: { nomino: "Ndizi", verbMarker: "zi", forms: { ingi: "nyingi", chache: "chache", tatu: "tatu", nne: "nne", tano: "tano", kumi: "kumi" } },
};

const NGELI_LIST: NgeliQ[] = ["WA", "MI", "VI", "MA", "N"];

const QMEANING: Record<QKey, string> = {
  ingi: "kiasi kikubwa kisicho na idadi kamili iliyotajwa (wingi usiobainika)",
  chache: "kiasi kidogo kisicho na idadi kamili iliyotajwa",
  tatu: "idadi kamili ya vitu vitatu",
  nne: "idadi kamili ya vitu vinne",
  tano: "idadi kamili ya vitu vitano",
  kumi: "idadi kamili ya vitu kumi",
};

const QLABEL: Record<QKey, string> = {
  ingi: "nyingi", chache: "chache", tatu: "tatu", nne: "nne", tano: "tano", kumi: "kumi",
};

function pastKuwa(marker: string): string {
  return `${marker}likuwa`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const LOCATIONS = [
  "mezani", "sokoni", "shuleni", "nyumbani", "dukani", "shambani", "jikoni",
  "bustanini", "maktabani", "ofisini", "darasani", "gharini", "kitandani", "gatuni",
];

const KENYAN_MAJINA = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
];

const ARITHMETIC: { minus: number; key: QKey }[] = [
  { minus: 7, key: "tatu" },
  { minus: 6, key: "nne" },
  { minus: 5, key: "tano" },
];

export const viwakilishiVyaIdadi: Skill = {
  id: "g6-ksw-sarufi-viwakilishi-vya-idadi",
  code: "SA.9",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Viwakilishi vya Idadi",
  description: "Tambua na tumia viwakilishi vya idadi (chache, nyingi, tatu, kumi na nambari nyingine) badala ya kurudia nomino iliyotajwa.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["mc-recall", "click-match", "categorize", "fill-blank", "mc-scenario", "ordering"] as const
    );

    if (branch === "mc-recall") {
      const c = randChoice(rng, NGELI_LIST);
      const k = randChoice(rng, QKEYS);
      const correct = CLASS_DATA[c].forms[k];
      // Cross-class forms for the same key (e.g. "kumi" is invariant across all classes,
      // so it never yields distinct distractors) — fall back to other-key forms of the
      // same class whenever the cross-class pool doesn't give 3 distinct wrong answers.
      const crossClassPool = Array.from(
        new Set(NGELI_LIST.filter((x) => x !== c).map((x) => CLASS_DATA[x].forms[k]))
      ).filter((v) => v !== correct);
      const sameClassPool = Array.from(
        new Set(QKEYS.filter((kk) => kk !== k).map((kk) => CLASS_DATA[c].forms[kk]))
      ).filter((v) => v !== correct);
      const distractorPool = Array.from(new Set([...crossClassPool, ...sameClassPool]));
      const distractors = shuffle(rng, distractorPool).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Ni kiwakilishi gani sahihi cha idadi kinachoonyesha "${QMEANING[k]}" kwa nomino kama "${CLASS_DATA[c].nomino.toLowerCase()}"?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "row",
        hint: `Nomino "${CLASS_DATA[c].nomino.toLowerCase()}" iko katika ngeli ${c}, hivyo kiwakilishi cha idadi lazima kipatane nayo kisarufi.`,
        explanation: `Jibu sahihi ni "${correct}" — nomino za ngeli ${c} hutumia umbo hili kuonyesha ${QMEANING[k]}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = shuffle(rng, QKEYS.map((k) => ({ id: k, label: QLABEL[k] })));
      const targets = shuffle(rng, QKEYS.map((k) => ({ id: k, label: cap(QMEANING[k]) })));
      const correctMap: Record<string, string> = {};
      for (const k of QKEYS) correctMap[k] = k;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kiwakilishi cha idadi na maana yake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Baadhi ya viwakilishi vinaonyesha idadi kamili, vingine vinaonyesha kiasi kisicho dhahiri.",
        explanation: QKEYS.map((k) => `"${QLABEL[k]}" — ${QMEANING[k]}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(
        rng,
        QKEYS.map((k) => ({ id: k, label: QLABEL[k], bucket: EXACT_KEYS.includes(k) ? "kamili" : "wastani" }))
      );
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga viwakilishi hivi vya idadi kulingana na kama vinaonyesha idadi kamili au kiasi kisicho dhahiri.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kamili", label: "Idadi Kamili" },
          { id: "wastani", label: "Kiasi Kisicho Dhahiri" },
        ],
        correctBucket,
        hint: "Nambari mahususi kama 'tatu' na 'kumi' ni idadi kamili; 'chache' na 'nyingi' ni kiasi cha wastani.",
        explanation: `Idadi kamili: ${EXACT_KEYS.map((k) => QLABEL[k]).join(", ")}. Kiasi kisicho dhahiri: ${VAGUE_KEYS.map((k) => QLABEL[k]).join(", ")}.`,
      };
    }

    if (branch === "fill-blank") {
      const c = randChoice(rng, NGELI_LIST);
      const [k1, k2] = shuffle(rng, QKEYS).slice(0, 2);
      const [loc1, loc2] = shuffle(rng, LOCATIONS).slice(0, 2);
      const cd = CLASS_DATA[c];
      const kuwa = pastKuwa(cd.verbMarker);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi ya pili kwa kiwakilishi sahihi cha idadi, bila kurudia nomino.",
        before: `${cd.nomino} ${cd.forms[k1]} ${kuwa} ${loc1}; `,
        after: ` ${kuwa} ${loc2}.`,
        correctAnswer: cd.forms[k2],
        inputMode: "text",
        hint: `Sentensi ya pili haitaji tena neno "${cd.nomino.toLowerCase()}" — kiwakilishi cha idadi pekee kinatosha, kikipatana na ngeli ${c}.`,
        explanation: `Sentensi kamili ni: "${cd.nomino} ${cd.forms[k1]} ${kuwa} ${loc1}; ${cd.forms[k2]} ${kuwa} ${loc2}." — "${cd.forms[k2]}" kinawakilisha "${cd.nomino.toLowerCase()} ${QLABEL[k2]}" bila kurudia nomino.`,
      };
    }

    if (branch === "mc-scenario") {
      const useArithmetic = rng() > 0.5;
      const c = randChoice(rng, NGELI_LIST);
      const cd = CLASS_DATA[c];
      const nomLower = cd.nomino.toLowerCase();
      const [n0, n1] = shuffle(rng, KENYAN_MAJINA).slice(0, 2);
      const choices = shuffle(rng, QKEYS.map((k) => cd.forms[k]));

      if (useArithmetic) {
        const entry = randChoice(rng, ARITHMETIC);
        const correct = cd.forms[entry.key];
        return {
          kind: "multiple-choice",
          prompt: `${n0} alikuwa na ${nomLower} kumi. Alimpa ${n1} ${entry.minus}, akabakiwa na kiasi fulani tu. Bila kurudia neno "${nomLower}", ni kiwakilishi kipi sahihi cha kutaja idadi iliyobaki?`,
          choices,
          correctIndex: choices.indexOf(correct),
          layout: "row",
          hint: `Hesabu kwanza idadi iliyobaki (kumi - ${entry.minus}), kisha tafuta umbo linalopatana na ngeli ya "${nomLower}".`,
          explanation: `Kumi - ${entry.minus} = ${10 - entry.minus}; kwa nomino za ngeli hii, idadi hiyo huonyeshwa kama "${correct}".`,
        };
      }

      const vagueKey = randChoice(rng, VAGUE_KEYS);
      const descriptive =
        vagueKey === "ingi"
          ? "idadi kubwa isiyohesabika hasa"
          : "idadi ndogo tu, isiyohesabika hasa";
      const correct = cd.forms[vagueKey];
      return {
        kind: "multiple-choice",
        prompt: `${n0} alipanda ${nomLower} shambani msimu huu. Wakati wa mavuno, ${descriptive} zilipatikana. Bila kurudia neno "${nomLower}", ni kiwakilishi kipi sahihi cha idadi cha kutumia?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "row",
        hint: `Fikiria kama maelezo yanaonyesha kiasi kikubwa au kidogo, kisha tafuta umbo linalopatana na ngeli ya "${nomLower}".`,
        explanation: `Maelezo yanaonyesha ${QMEANING[vagueKey]}; kwa nomino za ngeli hii, hiyo huonyeshwa kama "${correct}".`,
      };
    }

    const c = randChoice(rng, NGELI_LIST);
    const k = randChoice(rng, QKEYS);
    const loc = randChoice(rng, LOCATIONS);
    const cd = CLASS_DATA[c];
    const sentence = `${cd.nomino} ${cd.forms[k]} ${pastKuwa(cd.verbMarker)} ${loc}.`;
    const words = sentence.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kiwakilishi cha idadi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Nomino huanza sentensi, ikifuatiwa na kiwakilishi cha idadi kinachopatana nayo kisarufi.`,
      explanation: `Sentensi sahihi ni: "${sentence}"`,
    };
  },
};
