import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;
const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Machakos", "Kericho", "Nyeri", "Kitale", "Malindi",
  "Garissa", "Meru", "Bungoma", "Kakamega", "Naivasha", "Voi", "Kilifi",
] as const;

type Hatua = "utangulizi" | "tukio-la-kwanza" | "tukio-kuu" | "kilele" | "mwisho";

const HATUA_MAELEZO: Record<Hatua, string> = {
  utangulizi: "utangulizi huanzisha hadithi kwa kutaja wahusika, mahali na wakati",
  "tukio-la-kwanza": "tukio la kwanza huanza kuendeleza msuko wa hadithi",
  "tukio-kuu": "tukio kuu huendeleza matukio muhimu ya hadithi",
  kilele: "kilele ni sehemu yenye msisimko mkubwa zaidi wa hadithi",
  mwisho: "mwisho hufunga hadithi kwa jinsi tatizo lilivyotatuliwa",
};

const SENTENSI_MFANO: { sentensi: string; hatua: Hatua }[] = [
  { sentensi: "Ilikuwa Jumamosi ya asubuhi, na Otieno alikuwa uwanjani wa mpira.", hatua: "utangulizi" },
  { sentensi: "Jua lilikuwa likichomoza taratibu huku wachezaji wakijiandaa.", hatua: "utangulizi" },
  { sentensi: "Timu mbili zilikuwa tayari kuanza mashindano ya mpira wa miguu.", hatua: "utangulizi" },
  { sentensi: "Mchezo ulianza kwa kasi, kila timu ikijaribu kufunga bao.", hatua: "tukio-la-kwanza" },
  { sentensi: "Baada ya dakika kumi, mchezaji mmoja alijeruhiwa kidogo.", hatua: "tukio-la-kwanza" },
  { sentensi: "Timu ya kwanza ilifunga bao la kwanza katika dakika ya ishirini.", hatua: "tukio-kuu" },
  { sentensi: "Mashabiki walipiga kelele huku wachezaji wakiendelea kupambana.", hatua: "tukio-kuu" },
  { sentensi: "Katika dakika za mwisho, mabao yalikuwa sawa, kila mmoja akitaka kushinda.", hatua: "tukio-kuu" },
  { sentensi: "Ghafla, mchezaji mmoja alipiga penati iliyoamua mshindi wa mchezo.", hatua: "kilele" },
  { sentensi: "Mpira ulipiga wavu na uwanja wote ukalipuka kwa furaha.", hatua: "kilele" },
  { sentensi: "Timu iliyoshinda ilipewa kombe mbele ya mashabiki wote.", hatua: "mwisho" },
  { sentensi: "Wachezaji walirudi nyumbani wakiwa na furaha ya ushindi.", hatua: "mwisho" },
  { sentensi: "Tukio hilo lilibaki kumbukumbu nzuri kwa wote waliohudhuria.", hatua: "mwisho" },
];

export const inshaZaMasimulizi: Skill = {
  id: "g6-ksw-ka-insha-za-masimulizi",
  code: "KA.2",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ka",
  grade: 6,
  title: "Insha za Masimulizi",
  description: "Tambua muundo wa insha ya masimulizi na upange matukio ya hadithi kwa mpangilio sahihi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-hatua", "oanisha-maelezo", "panga-hatua-vipande", "jaza-mwanzo", "panga-matukio"] as const);

    if (branch === "tambua-hatua") {
      const s = randChoice(rng, SENTENSI_MFANO);
      const wote: Hatua[] = ["utangulizi", "tukio-la-kwanza", "tukio-kuu", "kilele", "mwisho"];
      const choices = shuffle(rng, wote);
      const majinaHatua: Record<Hatua, string> = {
        utangulizi: "Utangulizi",
        "tukio-la-kwanza": "Tukio la Kwanza",
        "tukio-kuu": "Tukio Kuu",
        kilele: "Kilele",
        mwisho: "Mwisho",
      };
      return {
        kind: "multiple-choice",
        prompt: `Sentensi "${s.sentensi}" inafaa katika sehemu gani ya hadithi?`,
        choices: choices.map((c) => majinaHatua[c]),
        correctIndex: choices.indexOf(s.hatua),
        layout: "row",
        hint: HATUA_MAELEZO[s.hatua],
        explanation: `Sentensi hii inafaa katika sehemu ya ${majinaHatua[s.hatua]} — ${HATUA_MAELEZO[s.hatua]}.`,
      };
    }

    if (branch === "oanisha-maelezo") {
      const tokens = (["utangulizi", "tukio-la-kwanza", "tukio-kuu", "kilele", "mwisho"] as const).map((h) => ({ id: h, label: h }));
      const targets = shuffle(rng, ["utangulizi", "tukio-la-kwanza", "tukio-kuu", "kilele", "mwisho"] as const).map((h) => ({
        id: h,
        label: HATUA_MAELEZO[h],
      }));
      const correctMap: Record<string, string> = {
        utangulizi: "utangulizi",
        "tukio-la-kwanza": "tukio-la-kwanza",
        "tukio-kuu": "tukio-kuu",
        kilele: "kilele",
        mwisho: "mwisho",
      };
      return {
        kind: "click-match",
        prompt: "Oanisha kila sehemu ya hadithi na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria mtiririko wa hadithi kutoka mwanzo hadi mwisho.",
        explanation: (["utangulizi", "tukio-la-kwanza", "tukio-kuu", "kilele", "mwisho"] as const).map((h) => `${h}: ${HATUA_MAELEZO[h]}.`).join(" "),
      };
    }

    if (branch === "panga-hatua-vipande") {
      const chosen = shuffle(rng, SENTENSI_MFANO).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `${i}-${s.sentensi}`, label: s.sentensi, bucket: s.hatua }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na sehemu ya hadithi zinazofaa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "utangulizi", label: "Utangulizi" },
          { id: "tukio-la-kwanza", label: "Tukio la Kwanza" },
          { id: "tukio-kuu", label: "Tukio Kuu" },
          { id: "kilele", label: "Kilele" },
          { id: "mwisho", label: "Mwisho" },
        ],
        correctBucket,
        hint: "Fikiria ni wapi katika hadithi sentensi hii ingetokea.",
        explanation: chosen.map((s) => `"${s.sentensi}" inafaa katika sehemu ya ${s.hatua}.`).join(" "),
      };
    }

    if (branch === "jaza-mwanzo") {
      const jina = randChoice(rng, KENYAN_NAMES);
      const mahali = randChoice(rng, KENYAN_PLACES);
      const TEMPLATES = [
        { before: `${jina} anaanza insha yake ya masimulizi kwa sehemu ya "`, after: `" ili kuwatambulisha wahusika na mahali.`, jibu: "utangulizi" },
        { before: `Baada ya utangulizi, ${jina} wa ${mahali} aliandika kuhusu "`, after: `" ambapo msuko wa hadithi ulianza kujengeka.`, jibu: "tukio la kwanza" },
        { before: `Sehemu yenye msisimko mkubwa zaidi wa hadithi ya ${jina} inaitwa "`, after: `".`, jibu: "kilele" },
        { before: `${jina} alimaliza insha yake kwa sehemu ya "`, after: `" ambayo ilieleza jinsi tatizo lilivyotatuliwa.`, jibu: "mwisho" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu muundo wa insha ya masimulizi.",
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria mtiririko wa hadithi: utangulizi, matukio, kilele, mwisho.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const hatuaZote: Hatua[] = ["utangulizi", "tukio-la-kwanza", "tukio-kuu", "kilele", "mwisho"];
    const mmojaKwaHatua = hatuaZote.map((h) => randChoice(rng, SENTENSI_MFANO.filter((s) => s.hatua === h)));
    const items = mmojaKwaHatua.map((s) => ({ id: s.hatua, label: s.sentensi }));
    return {
      kind: "ordering",
      prompt: "Panga matukio haya ya hadithi kwa mpangilio sahihi kutoka mwanzo hadi mwisho.",
      instruction: "Bofya matukio kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: mmojaKwaHatua.map((s) => s.hatua),
      hint: "Fikiria mtiririko wa kawaida wa hadithi: utangulizi → tukio → kilele → mwisho.",
      explanation: "Mpangilio sahihi: " + mmojaKwaHatua.map((s) => s.sentensi).join(" → "),
    };
  },
};
