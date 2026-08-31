import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIKUU_VISAIDIZI: { sentensi: string; kisaidizi: string; kikuu: string }[] = [
  { sentensi: "Juma alikuwa anacheka alipoona mchezo huo.", kisaidizi: "alikuwa", kikuu: "anacheka" },
  { sentensi: "Amina angali anasoma hadi sasa.", kisaidizi: "angali", kikuu: "anasoma" },
  { sentensi: "Otieno aliweza kumaliza kazi kwa wakati.", kisaidizi: "aliweza", kikuu: "kumaliza" },
  { sentensi: "Wanafunzi walikuja kucheza mpira jioni.", kisaidizi: "walikuja", kikuu: "kucheza" },
  { sentensi: "Ilimbidi Halima asome kwa bidii mtihani ukaribiapo.", kisaidizi: "ilimbidi", kikuu: "asome" },
  { sentensi: "Baraka aliwahi kufika kabla ya saa moja.", kisaidizi: "aliwahi", kikuu: "kufika" },
];

const VISHIRIKISHI: { neno: string; sentensi: string; maelezo: string }[] = [
  { neno: "ni", sentensi: "Mimi ni mwanafunzi wa Gredi ya Saba.", maelezo: "hutumika kuunganisha kiima na kiarifu chanya" },
  { neno: "si", sentensi: "Yeye si mwalimu wa hesabu.", maelezo: "hutumika kuunganisha kiima na kiarifu hasi" },
  { neno: "yu", sentensi: "Baba yu shambani sasa hivi.", maelezo: "hutumika kuonyesha uwepo wa mtu mahali fulani" },
  { neno: "ndiye", sentensi: "Yeye ndiye kiongozi wa darasa letu.", maelezo: "hutumika kusisitiza mtu mmoja mahususi" },
  { neno: "ndio", sentensi: "Hao ndio wanafunzi walioshinda tuzo.", maelezo: "hutumika kusisitiza watu au vitu vingi" },
  { neno: "ndipo", sentensi: "Hapa ndipo tulipokutana mara ya kwanza.", maelezo: "hutumika kusisitiza mahali mahususi" },
];

const AINA_VITENZI = [
  { neno: "alikuwa", aina: "Kisaidizi" },
  { neno: "anacheka", aina: "Kikuu" },
  { neno: "aliweza", aina: "Kisaidizi" },
  { neno: "kumaliza", aina: "Kikuu" },
  { neno: "aliwahi", aina: "Kisaidizi" },
  { neno: "kufika", aina: "Kikuu" },
];

export const vitenziVikuuVisaidiziVishirikishi: Skill = {
  id: "g7-ksw-sarufi-vitenzi-vikuu-visaidizi-vishirikishi",
  code: "SA.4",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Vitenzi Vikuu, Visaidizi na Vishirikishi",
  description: "Tambua vitenzi vikuu, vitenzi visaidizi, na vitenzi vishirikishi, na uvitumie ipasavyo katika sentensi.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["panga-vikuu-visaidizi", "oanisha-vishirikishi", "tambua-kisaidizi", "chagua-kishirikishi", "jaza-kisaidizi", "panga-maneno-sentensi"] as const,
    );

    if (branch === "panga-vikuu-visaidizi") {
      const items = AINA_VITENZI.map((v) => ({ id: v.neno, label: v.neno, bucket: v.aina }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila neno kama Kitenzi Kikuu au Kitenzi Kisaidizi, kama linavyotumika katika sentensi zenye vitenzi viwili.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Kikuu", label: "Kitenzi Kikuu" },
          { id: "Kisaidizi", label: "Kitenzi Kisaidizi" },
        ],
        correctBucket,
        hint: "Kitenzi kisaidizi husaidia kubeba wakati au hali; kitenzi kikuu hubeba maana kuu ya tendo.",
        explanation: AINA_VITENZI.map((v) => `"${v.neno}" ni kitenzi ${v.aina.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "oanisha-vishirikishi") {
      const chosen = shuffle(rng, VISHIRIKISHI).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.neno, label: v.neno })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.neno, label: v.sentensi })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.neno] = v.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kitenzi kishirikishi na sentensi inayokitumia kwa usahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Vitenzi vishirikishi huunganisha kiima na kiarifu bila kubeba wakati kama vitenzi vingine.",
        explanation: chosen.map((v) => `"${v.neno}" — ${v.maelezo}: "${v.sentensi}"`).join(" "),
      };
    }

    if (branch === "tambua-kisaidizi") {
      const entry = randChoice(rng, VIKUU_VISAIDIZI);
      const distractors = shuffle(rng, VIKUU_VISAIDIZI.filter((v) => v.kisaidizi !== entry.kisaidizi).map((v) => v.kisaidizi)).slice(0, 3);
      const choices = shuffle(rng, [entry.kisaidizi, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Katika sentensi "${entry.sentensi}", ni neno lipi kitenzi kisaidizi?`,
        choices,
        correctIndex: choices.indexOf(entry.kisaidizi),
        layout: "list",
        hint: `Kitenzi kikuu katika sentensi hii ni "${entry.kikuu}" — kitenzi kisaidizi ni neno linalotangulia.`,
        explanation: `Kitenzi kisaidizi ni "${entry.kisaidizi}", na kitenzi kikuu ni "${entry.kikuu}".`,
      };
    }

    if (branch === "chagua-kishirikishi") {
      const entry = randChoice(rng, VISHIRIKISHI);
      const distractors = shuffle(rng, VISHIRIKISHI.filter((v) => v.neno !== entry.neno).map((v) => v.neno)).slice(0, 3);
      const choices = shuffle(rng, [entry.neno, ...distractors]);
      const pengoSentensi = entry.sentensi.replace(entry.neno, "___");
      return {
        kind: "multiple-choice",
        prompt: `Chagua kitenzi kishirikishi kinachokamilisha sentensi: "${pengoSentensi}"`,
        choices,
        correctIndex: choices.indexOf(entry.neno),
        layout: "grid",
        hint: entry.maelezo,
        explanation: `Neno sahihi ni "${entry.neno}": "${entry.sentensi}"`,
      };
    }

    if (branch === "jaza-kisaidizi") {
      const entry = randChoice(rng, VIKUU_VISAIDIZI);
      const splitAt = entry.sentensi.indexOf(entry.kisaidizi);
      const before = entry.sentensi.slice(0, splitAt).trim();
      const after = entry.sentensi.slice(splitAt + entry.kisaidizi.length);
      return {
        kind: "fill-blank",
        prompt: "Andika kitenzi kisaidizi kinachofaa kukamilisha sentensi.",
        before,
        after,
        correctAnswer: entry.kisaidizi,
        inputMode: "text",
        hint: `Kitenzi kikuu katika sentensi hii ni "${entry.kikuu}".`,
        explanation: `Sentensi kamili ni: "${entry.sentensi}"`,
      };
    }

    const entry = randChoice(rng, VIKUU_VISAIDIZI);
    const words = entry.sentensi.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kitenzi kikuu na kitenzi kisaidizi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Kitenzi kisaidizi hutangulia kitenzi kikuu katika sentensi hii.",
      explanation: `Sentensi sahihi ni: "${entry.sentensi}"`,
    };
  },
};
