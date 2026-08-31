import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const NYIMBO_WATOTO = ["Nyimbo ya kuhesabu vidole vya mkono", "Bembelezi la kumliza mtoto usingizini", "Nyimbo ya mchezo wa kuruka kamba"];
const NYIMBO_KAZI = ["Wimbo wa wavuvi wanaovuta nyavu", "Wimbo wa wanawake wanaosaga nafaka", "Wimbo wa wakulima wanaopalilia shamba"];
const NYIMBO_DINI = ["Wimbo wa kumsifu Mungu kanisani", "Wimbo wa dua unaoimbwa msikitini", "Wimbo wa shukrani baada ya mavuno"];

const WAHUSIKA_NYIMBO: { neno: string; maelezo: string }[] = [
  { neno: "Mwimbaji", maelezo: "Mtu anayeongoza kuimba wimbo au kutoa mstari wa kwanza" },
  { neno: "Hadhira lengwa", maelezo: "Kikundi cha watu wanaosikiliza au kuitikia wimbo" },
  { neno: "Mhusika anayetajwa", maelezo: "Mtu au kiumbe kinachozungumziwa ndani ya maneno ya wimbo" },
];

const MITINDO_UWASILISHAJI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Ni mtindo upi unaotumika sana katika bembelezi ili kumfariji mtoto na kumsaidia kulala?",
    sahihi: "Urudiaji wa sauti na maneno kwa sauti tulivu na ya taratibu",
    makosa: [
      "Kupiga kelele kwa sauti kubwa sana",
      "Kutumia maneno magumu ya kitaalamu pekee",
      "Kuimba haraka bila kusimama popote",
    ],
  },
  {
    swali: "Nyimbo za watoto mara nyingi huambatanishwa na nini ili kuwafurahisha wanaocheza?",
    sahihi: "Uchezeshaji wa viungo vya mwili kama mikono na miguu",
    makosa: [
      "Kusoma kimya bila sauti yoyote",
      "Kuandika wimbo huo ubaoni pekee",
      "Kukaa bila kutembea au kuchezesha kiungo chochote",
    ],
  },
];

const LUGHA_NYIMBO = [
  {
    before: "Katika wimbo, ku",
    after: " kwa neno moja mara kwa mara husaidia hadhira kukikumbuka kwa urahisi.",
    sahihi: "rudia",
  },
  {
    before: "Maneno kama 'pu-pu-pu' yanayoiga sauti ya injini katika wimbo huitwa",
    after: " za sauti.",
    sahihi: "tanakali",
  },
  {
    before: "Msemo 'mpenzi wangu ni kama asali' katika wimbo ni mfano wa",
    after: ".",
    sahihi: "tashbihi",
  },
];

const MSTARI_WIMBO_KAZI = [
  { id: "kiongozi1", label: "Kiongozi: Twendeni kazi, wenzangu!" },
  { id: "kikundi1", label: "Kikundi: Twende, twende, tumalize!" },
  { id: "kiongozi2", label: "Kiongozi: Vuta nyavu, jamani!" },
  { id: "kikundi2", label: "Kikundi: Tunavuta, tunavuta!" },
];

export const nyimboZaJamii: Skill = {
  id: "g7-ksw-kz-nyimbo-za-jamii",
  code: "KZ.4",
  subjectId: "kiswahili",
  strandId: "g7-ksw-kz",
  grade: 7,
  title: "Nyimbo za Jamii: Watoto, Kazi, Dini, Wahusika na Lugha",
  description: "Tambua aina za nyimbo za jamii, wahusika wake, mitindo ya uwasilishaji, na vipengele vya lugha vinavyotumika.",
  generate(rng) {
    const branch = randChoice(rng, ["panga-aina-nyimbo", "oanisha-wahusika", "mtindo-uwasilishaji", "pengo-lugha", "mstari-wimbo-kazi"] as const);

    if (branch === "panga-aina-nyimbo") {
      const watoto = shuffle(rng, NYIMBO_WATOTO).slice(0, 2);
      const kazi = shuffle(rng, NYIMBO_KAZI).slice(0, 2);
      const dini = shuffle(rng, NYIMBO_DINI).slice(0, 2);
      const items = shuffle(rng, [
        ...watoto.map((n) => ({ id: n, label: n, bucket: "Watoto/Bembelezi" })),
        ...kazi.map((n) => ({ id: n, label: n, bucket: "Kazi" })),
        ...dini.map((n) => ({ id: n, label: n, bucket: "Dini" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila wimbo katika kundi linalofaa: Watoto/Bembelezi, Kazi, au Dini.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Watoto/Bembelezi", label: "Watoto/Bembelezi" },
          { id: "Kazi", label: "Kazi" },
          { id: "Dini", label: "Dini" },
        ],
        correctBucket,
        hint: "Fikiria muktadha ambao kila wimbo huimbwa — je, ni wa kufariji mtoto, wa kufanya kazi, au wa ibada?",
        explanation: `Watoto/Bembelezi: ${watoto.join(", ")}. Kazi: ${kazi.join(", ")}. Dini: ${dini.join(", ")}.`,
      };
    }

    if (branch === "oanisha-wahusika") {
      const tokens = shuffle(rng, WAHUSIKA_NYIMBO.map((w) => ({ id: w.neno, label: w.neno })));
      const targets = shuffle(rng, WAHUSIKA_NYIMBO.map((w) => ({ id: w.neno, label: w.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const w of WAHUSIKA_NYIMBO) correctMap[w.neno] = w.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila mhusika wa wimbo na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria nafasi tofauti watu hushika wanapoimba wimbo pamoja.",
        explanation: WAHUSIKA_NYIMBO.map((w) => `${w.neno} — ${w.maelezo}.`).join(" "),
      };
    }

    if (branch === "mtindo-uwasilishaji") {
      const entry = randChoice(rng, MITINDO_UWASILISHAJI);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Fikiria jinsi wimbo unavyowasilishwa ili kufikia lengo lake kwa hadhira.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    if (branch === "pengo-lugha") {
      const entry = randChoice(rng, LUGHA_NYIMBO);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Fikiria mbinu ya lugha inayoelezwa katika sentensi hiyo.",
        explanation: `Sentensi kamili ni: "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const items = shuffle(rng, MSTARI_WIMBO_KAZI);
    return {
      kind: "ordering",
      prompt: "Panga mistari ya wimbo huu wa kazi (wa mtindo wa kiongozi na kikundi kuitikiana) kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kama unavyoimbwa.",
      items,
      correctOrder: MSTARI_WIMBO_KAZI.map((m) => m.id),
      hint: "Kiongozi huanza mstari, kisha kikundi hujibu, na muundo huo hurudiwa.",
      explanation: MSTARI_WIMBO_KAZI.map((m) => m.label).join(" → "),
    };
  },
};
