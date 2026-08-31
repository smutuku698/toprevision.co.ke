import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Mapambo, mada ndogo 1.3 Vitendawili — kutega na kutegua
// vitendawili vinavyohusu mapambo na vitu vya kawaida vinavyomzunguka mwanafunzi.
// Ona curriculum-reference/grade-5/kiswahili.json.

const VITENDAWILI: { kitendawili: string; jibu: string; kikundi: string; funguo: string }[] = [
  { kitendawili: "Ninang'aa shingoni bila kutoa mwanga wa taa.", jibu: "Mkufu", kikundi: "mapambo", funguo: "shingoni" },
  { kitendawili: "Ninazunguka mkononi bila kutembea popote.", jibu: "Bangili", kikundi: "mapambo", funguo: "mkononi" },
  { kitendawili: "Ninashikilia masikio bila kuuma.", jibu: "Herini", kikundi: "mapambo", funguo: "masikio" },
  { kitendawili: "Ninang'aa kidoleni lakini sina jua.", jibu: "Pete", kikundi: "mapambo", funguo: "kidoleni" },
  { kitendawili: "Ninafungwa kiunoni bila kuwa mkanda wa gari.", jibu: "Kamba ya shanga", kikundi: "mapambo", funguo: "kiunoni" },
  { kitendawili: "Nyuzi zangu nyingi zimeungana shingoni bila kuwa nywele.", jibu: "Shanga", kikundi: "mapambo", funguo: "nyuzi" },
  { kitendawili: "Ninakaa kichwani bila kuwa nywele wala kofia.", jibu: "Utepe", kikundi: "mapambo", funguo: "kichwani" },
  { kitendawili: "Ninapika bila moto ndani yangu.", jibu: "Jiko", kikundi: "vitu vya nyumbani", funguo: "moto" },
  { kitendawili: "Ninabeba maji bila kuwa na mdomo.", jibu: "Ndoo", kikundi: "vitu vya nyumbani", funguo: "maji" },
  { kitendawili: "Ninakata bila meno.", jibu: "Wembe", kikundi: "vitu vya nyumbani", funguo: "meno" },
  { kitendawili: "Ninaonyesha muda bila kuzungumza.", jibu: "Saa", kikundi: "vitu vya nyumbani", funguo: "muda" },
  { kitendawili: "Ninalinda miguu bila kuwa soksi.", jibu: "Kiatu", kikundi: "mavazi", funguo: "miguu" },
];

const HATUA_ZA_UTEGAJI = [
  { id: "1", label: "Mtu mmoja asema 'Kitendawili!'" },
  { id: "2", label: "Wenzake wajibu 'Tega!'" },
  { id: "3", label: "Mtu wa kwanza atoa kitendawili" },
  { id: "4", label: "Wenzake wajaribu kutegua kitendawili" },
  { id: "5", label: "Wakikosa, mtu wa kwanza atoa jibu na maelezo" },
];

export const vitendawili: Skill = {
  id: "g5-ksw-kz-vitendawili",
  code: "KZ.3",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Vitendawili (Mapambo)",
  description: "Tambua, tega na tegua vitendawili vinavyohusu mapambo na vitu vya kawaida.",
  generate(rng) {
    const branch = randChoice(rng, ["tegua", "oanisha-jibu", "panga-kikundi", "jaza-kitendawili", "panga-utegaji"] as const);

    if (branch === "tegua") {
      const v = randChoice(rng, VITENDAWILI);
      const makosaKikundi = shuffle(rng, VITENDAWILI.filter((x) => x.jibu !== v.jibu && x.kikundi === v.kikundi)).slice(0, 3).map((x) => x.jibu);
      const makosaZote = shuffle(rng, VITENDAWILI.filter((x) => x.jibu !== v.jibu && !makosaKikundi.includes(x.jibu)).map((x) => x.jibu));
      const choices = shuffle(rng, [v.jibu, ...makosaKikundi, ...makosaZote].slice(0, 4));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "jibu la kitendawili hiki")} "${v.kitendawili}"`,
        choices,
        correctIndex: choices.indexOf(v.jibu),
        layout: "row",
        hint: `Fikiria kuhusu ${v.kikundi}.`,
        explanation: `Jibu la kitendawili "${v.kitendawili}" ni "${v.jibu}".`,
      };
    }

    if (branch === "oanisha-jibu") {
      const chosen = shuffle(rng, VITENDAWILI).slice(0, 6);
      const tokens = chosen.map((v, i) => ({ id: `${i}`, label: v.kitendawili }));
      const targets = shuffle(rng, chosen).map((v) => ({ id: `${chosen.indexOf(v)}`, label: v.jibu }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_v, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "kitendawili na jibu lake"),
        tokens,
        targets,
        correctMap,
        hint: "Soma kila kitendawili kwa makini na ufikirie maana yake ya ndani.",
        explanation: chosen.map((v) => `"${v.kitendawili}" = "${v.jibu}".`).join(" "),
      };
    }

    if (branch === "panga-kikundi") {
      const chosen = shuffle(rng, VITENDAWILI).slice(0, 7);
      const items = chosen.map((v, i) => ({ id: `${i}-${v.jibu}`, label: v.jibu, bucket: v.kikundi }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kikundi cha kitu kinachoelezwa na jibu la kitendawili"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "mapambo", label: "Mapambo" },
          { id: "vitu vya nyumbani", label: "Vitu vya Nyumbani" },
          { id: "mavazi", label: "Mavazi" },
        ],
        correctBucket,
        hint: "Fikiria ni aina gani ya kitu jibu hili linahusu.",
        explanation: "Kila jibu la kitendawili limewekwa katika kikundi kinachokifaa.",
      };
    }

    if (branch === "jaza-kitendawili") {
      const v = randChoice(rng, VITENDAWILI);
      const idx = v.kitendawili.toLowerCase().indexOf(v.funguo.toLowerCase());
      const before = v.kitendawili.slice(0, idx);
      const after = v.kitendawili.slice(idx + v.funguo.length);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after,
        correctAnswer: v.funguo,
        inputMode: "text",
        hint: `Jibu la kitendawili hiki ni "${v.jibu}".`,
        explanation: `Kitendawili kamili: "${v.kitendawili}" — Jibu: "${v.jibu}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_UTEGAJI);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za mchezo wa kutega na kutegua vitendawili"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_UTEGAJI.map((h) => h.id),
      hint: `Fikiria jinsi mchezo wa vitendawili unavyoanza hadi unavyomalizika, kwa ${jina(rng)} na wenzake.`,
      explanation: "Mpangilio sahihi: " + HATUA_ZA_UTEGAJI.map((h) => h.label).join(" → "),
    };
  },
};
