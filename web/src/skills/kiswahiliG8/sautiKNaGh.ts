import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const K_WORDS: { word: string; maana: string }[] = [
  { word: "kiasi", maana: "Idadi au wingi wa kitu, kwa mfano bei au uzito" },
  { word: "kikapu", maana: "Chombo cha kubebea bidhaa dukani" },
  { word: "kadi", maana: "Kipande kidogo cha plastiki kinachotumika kulipia bidhaa" },
  { word: "kanuni", maana: "Sheria au utaratibu unaopaswa kufuatwa" },
  { word: "kioski", maana: "Duka dogo la kuuzia bidhaa" },
];

const GH_WORDS: { word: string; maana: string }[] = [
  { word: "ghali", maana: "Chenye bei ya juu isiyostahili" },
  { word: "gharama", maana: "Pesa zinazotumika kununua bidhaa au huduma" },
  { word: "ghushi", maana: "Bidhaa ya udanganyifu isiyo halisi" },
  { word: "ghafula", maana: "Kwa haraka, bila kutazamiwa" },
];

const ALL_WORDS = [...K_WORDS, ...GH_WORDS];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; maana: string }[] = [
  {
    before: "Mnunuzi mwenye busara hupenda",
    after: "bidhaa kwa makini kabla ya kuzinunua.",
    correctAnswer: "kukagua",
    maana: "kuchunguza bidhaa kwa makini",
  },
  {
    before: "Baadhi ya wafanyabiashara wasio waaminifu huuza bidhaa za",
    after: "zinazofanana na za kampuni maarufu lakini si halisi.",
    correctAnswer: "ghushi",
    maana: "bidhaa ya udanganyifu",
  },
  {
    before: "Mnunuzi anapaswa kuuliza bei kamili ili asije akalipa bei",
    after: "isiyostahili.",
    correctAnswer: "ghali",
    maana: "yenye bei ya juu isiyostahili",
  },
  {
    before: "Mfanyabiashara alimhakikishia mteja kuwa atapunguza",
    after: "za usafirishaji wa bidhaa.",
    correctAnswer: "gharama",
    maana: "pesa zinazotumika",
  },
  {
    before: "Ni muhimu mnunuzi kubeba bidhaa zake dukani ndani ya",
    after: "safi badala ya mfuko wa plastiki.",
    correctAnswer: "kikapu",
    maana: "chombo cha kubebea bidhaa",
  },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Ni neno lipi kati ya haya lenye sauti /gh/?",
    sahihi: "ghushi",
    makosa: ["kiasi", "kadi", "kanuni"],
  },
  {
    swali: "Neno 'ghushi' katika muktadha wa ununuzi lina maana gani?",
    sahihi: "Bidhaa ya udanganyifu isiyo halisi",
    makosa: [
      "Bidhaa yenye bei ya chini sana",
      "Chombo cha kubebea mizigo dukani",
      "Sheria za soko zinazopaswa kufuatwa",
    ],
  },
  {
    swali: "Mnunuzi alisema, 'Nataka kununua bidhaa ya kali,' badala ya 'bidhaa ya ghali'. Alikosea nini kimatamshi?",
    sahihi: "Aliacha kutamka sauti /gh/ ipasavyo, akatamka sauti /k/ badala yake",
    makosa: [
      "Hakuna kosa, maneno hayo mawili yana maana sawa",
      "Alitamka sauti ya wingi badala ya umoja",
      "Alitumia lugha ya heshima isiyofaa",
    ],
  },
  {
    swali: "Sauti /k/ na /gh/ hutofautianaje kimatamshi?",
    sahihi: "Zote hutamkwa nyuma ya kinywa karibu na koo, lakini /k/ huzuia mkondo wa hewa kabisa wakati /gh/ haukuzuii kabisa",
    makosa: [
      "Sauti /k/ na /gh/ hutamkwa kwa midomo pekee",
      "Sauti /k/ na /gh/ hutamkwa sawa kabisa bila tofauti",
      "Sauti /gh/ hutumika tu mwanzoni mwa sentensi",
    ],
  },
];

function buildLetterScramble(rng: (() => number), word: string) {
  const letters = word.split("");
  const items = letters.map((ch, i) => ({ id: `${ch}-${i}`, label: ch }));
  const correctOrder = items.map((it) => it.id);
  return { items: shuffle(rng, items), correctOrder };
}

export const sautiKNaGh: Skill = {
  id: "g8-ksw-kz-sauti-k-gh",
  code: "KZ.9",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Kusikiliza kwa Kina (Sauti /k/ na /gh/)",
  description: "Tambua, tamka, na tofautisha maneno yenye sauti /k/ na /gh/ katika muktadha wa majukumu ya mnunuzi.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha", "panga", "jaza", "tunga", "swali"] as const);

    if (branch === "oanisha") {
      const chosen = shuffle(rng, ALL_WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.maana })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Zingatia kama neno lina sauti /k/ au /gh/ kabla ya kuchagua maana yake.",
        explanation: chosen.map((w) => `${w.word} — ${w.maana.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const kChosen = shuffle(rng, K_WORDS).slice(0, 3);
      const ghChosen = shuffle(rng, GH_WORDS).slice(0, 3);
      const items = shuffle(rng, [
        ...kChosen.map((w) => ({ id: w.word, label: w.word, bucket: "k" })),
        ...ghChosen.map((w) => ({ id: w.word, label: w.word, bucket: "gh" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila neno kulingana na sauti iliyomo: /k/ au /gh/.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "k", label: "Sauti /k/" },
          { id: "gh", label: "Sauti /gh/" },
        ],
        correctBucket,
        hint: "Neno lenye herufi 'gh' pamoja huwa na sauti /gh/; neno lenye 'k' pekee huwa na sauti /k/.",
        explanation: `Sauti /k/: ${kChosen.map((w) => w.word).join(", ")}. Sauti /gh/: ${ghChosen.map((w) => w.word).join(", ")}.`,
      };
    }

    if (branch === "jaza") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: `Kamilisha sentensi kwa neno lifaalo (maana: ${entry.maana}).`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Fikiria kama neno linalofaa lina sauti /k/ au /gh/ kulingana na maana iliyotolewa.",
        explanation: `Neno sahihi ni "${entry.correctAnswer}", lenye maana ya "${entry.maana}".`,
      };
    }

    if (branch === "tunga") {
      const entry = randChoice(rng, ALL_WORDS);
      const { items, correctOrder } = buildLetterScramble(rng, entry.word);
      return {
        kind: "ordering",
        prompt: `Panga herufi hizi ili kuunda neno lenye maana: "${entry.maana}".`,
        instruction: "Bofya herufi kwa mpangilio sahihi.",
        items,
        correctOrder,
        hint: `Neno hili lina herufi ${entry.word.length} na lina sauti ${entry.word.includes("gh") ? "/gh/" : "/k/"}.`,
        explanation: `Neno sahihi ni "${entry.word}", lenye maana ya "${entry.maana}".`,
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
      hint: "Sauti /gh/ huandikwa kwa herufi 'gh' pamoja na hutamkwa bila kuzuia hewa kabisa, tofauti na /k/.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
