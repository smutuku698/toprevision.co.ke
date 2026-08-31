import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const G_WORDS: { word: string; maana: string }[] = [
  { word: "gari", maana: "Chombo cha usafiri chenye magurudumu" },
  { word: "goti", maana: "Kiungo cha mguu kinachopinda" },
  { word: "dagaa", maana: "Samaki wadogo wanaopatikana majini" },
  { word: "giza", maana: "Hali ya kutokuwa na mwanga" },
  { word: "gawa", maana: "Kutenga kitu katika sehemu kwa wengine" },
  { word: "gonga", maana: "Kupiga kitu kwa nguvu" },
];

const GH_WORDS: { word: string; maana: string }[] = [
  { word: "ghali", maana: "Chenye bei ya juu isiyostahili" },
  { word: "gharama", maana: "Pesa zinazotumika kufanikisha jambo" },
  { word: "ghafula", maana: "Kwa haraka, bila kutazamiwa" },
  { word: "ghadhabu", maana: "Hasira kali" },
  { word: "ghushi", maana: "Kudanganya kwa kutengeneza kitu bandia" },
  { word: "ghala", maana: "Mahali pa kuhifadhi vitu au nafaka" },
];

const ALL_WORDS = [...G_WORDS, ...GH_WORDS];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; maana: string }[] = [
  {
    before: "Bei ya dawa ile mpya ilikuwa juu mno, yaani",
    after: "kupita kiasi kwa familia nyingi.",
    correctAnswer: "ghali",
    maana: "yenye bei ya juu isiyostahili",
  },
  {
    before: "Mgonjwa mahututi alipelekwa hospitalini kwa haraka akiwa ndani ya",
    after: "la wagonjwa.",
    correctAnswer: "gari",
    maana: "chombo cha usafiri",
  },
  {
    before: "Wazazi wa mtoto walijawa na",
    after: "kali baada ya kugundua kliniki iliwauzia dawa za ghushi.",
    correctAnswer: "ghadhabu",
    maana: "hasira kali",
  },
  {
    before: "Baadhi ya wafanyabiashara wasio waaminifu huuza dawa za",
    after: "zinazoweza kudhuru wagonjwa badala ya kuwaponya.",
    correctAnswer: "ghushi",
    maana: "za udanganyifu, si halisi",
  },
  {
    before: "Familia ilijadili",
    after: "za matibabu kabla ya kumnunulia mgonjwa dawa hospitalini.",
    correctAnswer: "gharama",
    maana: "pesa zinazohitajika",
  },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Ni neno lipi kati ya haya lenye sauti /gh/?",
    sahihi: "ghali",
    makosa: ["gari", "goti", "gawa"],
  },
  {
    swali: "Neno 'ghushi' lina maana gani?",
    sahihi: "Kudanganya kwa kutengeneza kitu bandia",
    makosa: [
      "Kutenga kitu katika sehemu kwa wengine",
      "Kupiga kitu kwa nguvu",
      "Kuwa na hasira kali sana",
    ],
  },
  {
    swali: "Mwanafunzi alisema 'Dawa hii ni gali' badala ya 'ghali'. Alikosea wapi kimatamshi?",
    sahihi: "Hakutamka sauti /gh/ ipasavyo — aliacha kutamka koromeoni kama inavyotakikana",
    makosa: [
      "Alitamka sauti /g/ vibaya badala ya /gh/",
      "Hakuna kosa lolote, maneno hayo mawili yanafanana kimaana",
      "Alitumia umoja badala ya wingi",
    ],
  },
  {
    swali: "Sauti /gh/ hutofautianaje na sauti /g/ kimatamshi?",
    sahihi: "Sauti /gh/ hutamkwa kwa kutoa hewa kooni bila kuzuia kabisa mkondo wa hewa, tofauti na /g/",
    makosa: [
      "Sauti /gh/ na /g/ hutamkwa sawa kabisa",
      "Sauti /gh/ hutamkwa kwa midomo pekee bila koo kuhusika",
      "Sauti /gh/ hutumika tu katika maneno ya wingi",
    ],
  },
];

function buildLetterScramble(rng: (() => number), word: string) {
  const letters = word.split("");
  const items = letters.map((ch, i) => ({ id: `${ch}-${i}`, label: ch }));
  const correctOrder = items.map((it) => it.id);
  return { items: shuffle(rng, items), correctOrder };
}

export const sautiGNaGh: Skill = {
  id: "g8-ksw-kz-sauti-g-gh",
  code: "KZ.2",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Kusikiliza kwa Kina (Sauti /g/ na /gh/)",
  description: "Tambua, tamka, na tofautisha maneno yenye sauti /g/ na /gh/ ipasavyo.",
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
        hint: "Zingatia kama neno lina sauti /g/ au /gh/ kabla ya kuchagua maana yake.",
        explanation: chosen.map((w) => `${w.word} — ${w.maana.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const gChosen = shuffle(rng, G_WORDS).slice(0, 3);
      const ghChosen = shuffle(rng, GH_WORDS).slice(0, 3);
      const items = shuffle(rng, [
        ...gChosen.map((w) => ({ id: w.word, label: w.word, bucket: "g" })),
        ...ghChosen.map((w) => ({ id: w.word, label: w.word, bucket: "gh" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila neno kulingana na sauti iliyomo: /g/ au /gh/.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "g", label: "Sauti /g/" },
          { id: "gh", label: "Sauti /gh/" },
        ],
        correctBucket,
        hint: "Neno lenye herufi 'gh' pekee (si 'g' peke yake) huwa na sauti /gh/.",
        explanation: `Sauti /g/: ${gChosen.map((w) => w.word).join(", ")}. Sauti /gh/: ${ghChosen.map((w) => w.word).join(", ")}.`,
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
        hint: "Fikiria kama neno linalofaa lina sauti /g/ au /gh/ kulingana na maana iliyotolewa.",
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
        hint: `Neno hili lina herufi ${entry.word.length} na lina sauti ${entry.word.includes("gh") ? "/gh/" : "/g/"}.`,
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
      hint: "Sauti /gh/ huandikwa kwa herufi 'gh' pamoja, na hutamkwa kooni tofauti na /g/.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
