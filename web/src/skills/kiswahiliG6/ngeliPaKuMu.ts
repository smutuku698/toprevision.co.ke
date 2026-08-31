import { randChoice, shuffle, type RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

type Alama = "pa" | "ku" | "mu";

const MAHALI: { neno: string; maelezo: string }[] = [
  { neno: "shuleni", maelezo: "school" },
  { neno: "sokoni", maelezo: "market" },
  { neno: "nyumbani", maelezo: "home" },
  { neno: "kanisani", maelezo: "church" },
  { neno: "hospitalini", maelezo: "hospital" },
  { neno: "mjini", maelezo: "town" },
  { neno: "msikitini", maelezo: "mosque" },
  { neno: "dukani", maelezo: "shop" },
  { neno: "uwanjani", maelezo: "playing field" },
  { neno: "bustanini", maelezo: "garden" },
  { neno: "ofisini", maelezo: "office" },
  { neno: "stesheni", maelezo: "station" },
  { neno: "bandarini", maelezo: "port" },
  { neno: "mashambani", maelezo: "the farms" },
  { neno: "hotelini", maelezo: "hotel" },
  { neno: "maktabani", maelezo: "library" },
  { neno: "barabarani", maelezo: "the road" },
  { neno: "mtoni", maelezo: "the river" },
  { neno: "msituni", maelezo: "the forest" },
  { neno: "ziwani", maelezo: "the lake" },
  { neno: "kambini", maelezo: "camp" },
  { neno: "jikoni", maelezo: "kitchen" },
  { neno: "chumbani", maelezo: "the room" },
  { neno: "darasani", maelezo: "classroom" },
  { neno: "kijijini", maelezo: "the village" },
  { neno: "mlimani", maelezo: "the mountain" },
];

const ALAMA_MAELEZO: Record<Alama, string> = {
  pa: "'pa-' hutumika kuonyesha mahali maalum/hususa (mahali fulani dhahiri, panapoonekana au panapotambulika kwa uwazi)",
  ku: "'ku-' hutumika kuonyesha mahali kwa ujumla au mwelekeo (bila kuonyesha sehemu mahususi)",
  mu: "'mu-' hutumika kuonyesha ndani ya eneo lililofungwa (ndani ya jengo, chombo au eneo lenye mipaka)",
};

const VIWAKILISHI: Record<Alama, readonly string[]> = {
  pa: ["hapa", "hapo", "pale"],
  ku: ["huku", "huko", "kule"],
  mu: ["humu", "humo", "mle"],
};

function alamaSentensi(rng: RNG, alama: Alama, mahali: string, jina: string): { kabla: string; baada: string; sahihi: string } {
  const kiwakilishi = randChoice(rng, VIWAKILISHI[alama]);
  if (alama === "pa") {
    return { kabla: `${jina} alisema ${mahali} `, baada: ` ndipo mkutano ulifanyika, mahali maalum palipotajwa.`, sahihi: kiwakilishi };
  }
  if (alama === "ku") {
    return { kabla: `${jina} alisema twende ${mahali} `, baada: ` kesho, bila kubainisha sehemu hususa.`, sahihi: kiwakilishi };
  }
  return { kabla: `${jina} alisema ndani ya ${mahali} `, baada: ` kuna vitu vingi vilivyowekwa humo.`, sahihi: kiwakilishi };
}

export const ngeliPaKuMu: Skill = {
  id: "g6-ksw-sarufi-ngeli-pa-ku-mu",
  code: "SA.14",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Ngeli ya PA-KU-MU",
  description: "Tofautisha viambishi vitatu vya ngeli ya mahali: pa- (mahali maalum), ku- (mahali kwa ujumla) na mu- (ndani ya eneo lililofungwa).",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-kiwakilishi", "oanisha-maelezo", "panga-aina", "jaza-sentensi", "tathmini-sentensi"] as const);

    if (branch === "chagua-kiwakilishi") {
      const alama = randChoice(rng, ["pa", "ku", "mu"] as const);
      const mahali = randChoice(rng, MAHALI);
      const jina = randChoice(rng, KENYAN_NAMES);
      const s = alamaSentensi(rng, alama, mahali.neno, jina);
      const wote = [...VIWAKILISHI.pa, ...VIWAKILISHI.ku, ...VIWAKILISHI.mu];
      const makosa = shuffle(rng, wote.filter((w) => !VIWAKILISHI[alama].includes(w))).slice(0, 3);
      const choices = shuffle(rng, [s.sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${s.kabla}___${s.baada} Ni kiwakilishi kipi kinachofaa?`,
        choices,
        correctIndex: choices.indexOf(s.sahihi),
        layout: "row",
        hint: ALAMA_MAELEZO[alama],
        explanation: `Sahihi ni "${s.sahihi}" — ${ALAMA_MAELEZO[alama]}.`,
      };
    }

    if (branch === "oanisha-maelezo") {
      const tokens = (["pa", "ku", "mu"] as const).map((a) => ({ id: a, label: `Kiambishi '${a}-'` }));
      const targets = shuffle(rng, ["pa", "ku", "mu"] as const).map((a) => ({ id: a, label: ALAMA_MAELEZO[a] }));
      const correctMap: Record<string, string> = { pa: "pa", ku: "ku", mu: "mu" };
      return {
        kind: "click-match",
        prompt: "Oanisha kila kiambishi cha ngeli ya mahali na maelezo yake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Kila kiambishi kina matumizi tofauti: mahali maalum, mahali kwa ujumla, au ndani ya eneo.",
        explanation: (["pa", "ku", "mu"] as const).map((a) => `'${a}-': ${ALAMA_MAELEZO[a]}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const alama = randChoice(rng, ["pa", "ku", "mu"] as const);
      const mahaliChosen = shuffle(rng, MAHALI).slice(0, 6);
      const jina = randChoice(rng, KENYAN_NAMES);
      const items = mahaliChosen.map((m, i) => {
        const a = i % 2 === 0 ? alama : randChoice(rng, (["pa", "ku", "mu"] as const).filter((x) => x !== alama));
        const s = alamaSentensi(rng, a, m.neno, jina);
        return { id: `${m.neno}-${a}`, label: `${s.kabla}${s.sahihi}${s.baada}`, bucket: a };
      });
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na aina ya mahali inayoonyeshwa: maalum (pa-), kwa ujumla (ku-), au ndani (mu-).",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "pa", label: "Mahali Maalum (pa-)" },
          { id: "ku", label: "Mahali kwa Ujumla (ku-)" },
          { id: "mu", label: "Ndani ya Eneo (mu-)" },
        ],
        correctBucket,
        hint: "Tazama kiwakilishi kilichotumika katika kila sentensi (hapa/pale=pa-, huku/kule=ku-, humu/mle=mu-).",
        explanation: "Kila sentensi imepangwa kulingana na kiwakilishi cha mahali kilichotumika ndani yake.",
      };
    }

    if (branch === "jaza-sentensi") {
      const alama = randChoice(rng, ["pa", "ku", "mu"] as const);
      const mahali = randChoice(rng, MAHALI);
      const jina = randChoice(rng, KENYAN_NAMES);
      const s = alamaSentensi(rng, alama, mahali.neno, jina);
      return {
        kind: "fill-blank",
        prompt: `Kamilisha sentensi kwa kiwakilishi sahihi cha mahali (${mahali.maelezo}).`,
        before: s.kabla,
        after: s.baada,
        correctAnswer: s.sahihi,
        acceptedAnswers: [...VIWAKILISHI[alama]],
        inputMode: "text",
        hint: ALAMA_MAELEZO[alama],
        explanation: `Sentensi kamili: "${s.kabla}${s.sahihi}${s.baada}" — ${ALAMA_MAELEZO[alama]}.`,
      };
    }

    const alama = randChoice(rng, ["pa", "ku", "mu"] as const);
    const mahali = randChoice(rng, MAHALI);
    const jina = randChoice(rng, KENYAN_NAMES);
    const s = alamaSentensi(rng, alama, mahali.neno, jina);
    const kamili = `${s.kabla}${s.sahihi}${s.baada}`;
    const maneno = kamili.replace(".", "").replace(",", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kiwakilishi cha mahali.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: ALAMA_MAELEZO[alama],
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
