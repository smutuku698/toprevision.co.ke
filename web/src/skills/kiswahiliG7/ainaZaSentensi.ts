import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SAHILI = ["Baraka anacheza mpira.", "Mvua inanyesha.", "Wanafunzi wanasoma vitabu.", "Amina anapika chakula."];

const AMBATANO = [
  "Baraka anacheza mpira na Otieno anaogelea.",
  "Nilitaka kwenda sokoni lakini mvua ilinyesha sana.",
  "Unaweza kunywa chai au unaweza kunywa maziwa.",
  "Alisoma kwa bidii kisha akafaulu mtihani.",
];

const VIUNGANISHI: { neno: string; matumizi: string }[] = [
  { neno: "na", matumizi: "kuongeza wazo lingine linalofanana au kuendana na la kwanza" },
  { neno: "lakini", matumizi: "kuonyesha tofauti au mgongano kati ya mawazo mawili" },
  { neno: "au", matumizi: "kutoa hiari kati ya mambo mawili au zaidi" },
  { neno: "kisha", matumizi: "kuonyesha mfuatano wa matukio kwa wakati" },
];

const UNGANISHO: { sahili1: string; sahili2: string; kiungo: string; sahihi: string; makosa: string[] }[] = [
  {
    sahili1: "Juma anaandika barua.",
    sahili2: "Halima anasoma gazeti.",
    kiungo: "na",
    sahihi: "Juma anaandika barua na Halima anasoma gazeti.",
    makosa: ["Juma anaandika barua lakini Halima anasoma gazeti.", "Juma anaandika barua Halima anasoma gazeti.", "Juma anaandika barua kisha Halima anaandika barua."],
  },
  {
    sahili1: "Tulitaka kwenda mchezoni.",
    sahili2: "Mvua ilianza kunyesha ghafla.",
    kiungo: "lakini",
    sahihi: "Tulitaka kwenda mchezoni lakini mvua ilianza kunyesha ghafla.",
    makosa: ["Tulitaka kwenda mchezoni na mvua ilianza kunyesha ghafla.", "Tulitaka kwenda mchezoni au mvua ilianza kunyesha ghafla.", "Tulitaka kwenda mchezoni mvua ilianza kunyesha ghafla."],
  },
];

const PENGO_KIUNGANISHI = [
  { before: "Tunaweza kusafiri kwa basi", after: " tunaweza kusafiri kwa gari moshi.", sahihi: "au" },
  { before: "Alifika shuleni mapema", after: " akaanza kazi zake za nyumbani.", sahihi: "kisha" },
];

export const ainaZaSentensi: Skill = {
  id: "g7-ksw-sarufi-aina-za-sentensi",
  code: "SA.8",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Aina za Sentensi: Sahili na Ambatano",
  description: "Tambua sentensi sahili na sentensi ambatano, na uunganishe sentensi sahili mbili kuwa sentensi ambatano.",
  generate(rng) {
    const branch = randChoice(rng, ["panga-aina-sentensi", "oanisha-viunganishi", "unganisha-sahihi", "jaza-kiunganishi", "panga-ambatano"] as const);

    if (branch === "panga-aina-sentensi") {
      const chosenSahili = shuffle(rng, SAHILI).slice(0, 3);
      const chosenAmbatano = shuffle(rng, AMBATANO).slice(0, 3);
      const items = [
        ...chosenSahili.map((s) => ({ id: s, label: s, bucket: "Sahili" })),
        ...chosenAmbatano.map((s) => ({ id: s, label: s, bucket: "Ambatano" })),
      ];
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila sentensi kama Sahili (wazo moja) au Ambatano (mawazo mawili yaliyounganishwa).",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Sahili", label: "Sahili" },
          { id: "Ambatano", label: "Ambatano" },
        ],
        correctBucket,
        hint: "Sentensi ambatano huwa na kiunganishi kama 'na', 'lakini', 'au', au 'kisha' kinachounganisha mawazo mawili.",
        explanation: [...chosenSahili.map((s) => `"${s}" ni sahili.`), ...chosenAmbatano.map((s) => `"${s}" ni ambatano.`)].join(" "),
      };
    }

    if (branch === "oanisha-viunganishi") {
      const tokens = shuffle(rng, VIUNGANISHI.map((v) => ({ id: v.neno, label: v.neno })));
      const targets = shuffle(rng, VIUNGANISHI.map((v) => ({ id: v.neno, label: v.matumizi })));
      const correctMap: Record<string, string> = {};
      for (const v of VIUNGANISHI) correctMap[v.neno] = v.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kiunganishi na matumizi yake katika sentensi ambatano.",
        tokens,
        targets,
        correctMap,
        hint: "Kila kiunganishi kina dhima maalum: kuongeza, kutofautisha, kutoa hiari, au kuonyesha mfuatano.",
        explanation: VIUNGANISHI.map((v) => `"${v.neno}" hutumika ${v.matumizi}.`).join(" "),
      };
    }

    if (branch === "unganisha-sahihi") {
      const entry = randChoice(rng, UNGANISHO);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Unganisha sentensi hizi mbili kwa usahihi: "${entry.sahili1}" na "${entry.sahili2}"`,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Fikiria uhusiano wa mantiki kati ya mawazo mawili — je, ni nyongeza, tofauti, au hiari?",
        explanation: `Sentensi ambatano sahihi ni: "${entry.sahihi}"`,
      };
    }

    if (branch === "jaza-kiunganishi") {
      const entry = randChoice(rng, PENGO_KIUNGANISHI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi ambatano kwa kiunganishi kifaacho.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Fikiria uhusiano kati ya sehemu mbili za sentensi hii.",
        explanation: `Sentensi kamili ni: "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, UNGANISHO);
    const words = entry.sahihi.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi ambatano sahihi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Kiunganishi "${entry.kiungo}" hutenganisha sehemu mbili za sentensi hii.`,
      explanation: `Sentensi sahihi ni: "${entry.sahihi}"`,
    };
  },
};
