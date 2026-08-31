import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

const VITENDAWILI: { kitendawili: string; jibu: string; kikundi: string }[] = [
  { kitendawili: "Adui mpenzi", jibu: "Moto", kikundi: "vitu vya nyumbani" },
  { kitendawili: "Wanangu watatu daima wako pamoja", jibu: "Mafiga", kikundi: "vitu vya nyumbani" },
  { kitendawili: "Kuku wangu watagia mibani", jibu: "Nanasi", kikundi: "mimea" },
  { kitendawili: "Nyumba yangu haina mlango", jibu: "Yai", kikundi: "wanyama" },
  { kitendawili: "Watoto wangu wote wamevaa nguo nyekundu", jibu: "Pilipili", kikundi: "mimea" },
  { kitendawili: "Ninakwenda safari lakini sisogei mahali pangu", jibu: "Saa", kikundi: "vitu vya nyumbani" },
  { kitendawili: "Ninalia bila kutokwa na machozi", jibu: "Radi", kikundi: "asili" },
  { kitendawili: "Ninavaa kofia lakini sina kichwa", jibu: "Chupa", kikundi: "vitu vya nyumbani" },
  { kitendawili: "Nina meno mengi lakini sili chakula", jibu: "Chana/Sega", kikundi: "vitu vya nyumbani" },
  { kitendawili: "Ninapanda mlima bila miguu", jibu: "Njia", kikundi: "asili" },
  { kitendawili: "Ndugu zangu wote wamesimama safu bila kuchoka", jibu: "Meno", kikundi: "mwili wa binadamu" },
  { kitendawili: "Nina nyumba lakini sikai ndani", jibu: "Kobe", kikundi: "wanyama" },
  { kitendawili: "Watu wote hunipita lakini hawaniwezi kunizuia", jibu: "Wakati", kikundi: "dhahania" },
  { kitendawili: "Ninabeba maji lakini sizami", jibu: "Wingu", kikundi: "asili" },
  { kitendawili: "Ninacheza usiku pekee, mchana silali", jibu: "Nyota", kikundi: "asili" },
  { kitendawili: "Nina rangi nyingi lakini sichori", jibu: "Upinde wa mvua", kikundi: "asili" },
  { kitendawili: "Ninalindwa na askari wengi lakini sina uhai", jibu: "Ngome/Boma", kikundi: "vitu vya nyumbani" },
  { kitendawili: "Ninazaliwa mchanga, ninakufa mzee ndani ya siku moja", jibu: "Jua", kikundi: "asili" },
  { kitendawili: "Nyumba yangu ni ndogo lakini nabeba dunia", jibu: "Kobe", kikundi: "wanyama" },
  { kitendawili: "Ninakua bila kula chakula", jibu: "Mwezi", kikundi: "asili" },
  { kitendawili: "Nina mguu mmoja lakini nasimama imara", jibu: "Uyoga", kikundi: "mimea" },
  { kitendawili: "Ninaruka bila mbawa", jibu: "Moshi", kikundi: "asili" },
  { kitendawili: "Ninavuka mto bila kulowa", jibu: "Kivuli", kikundi: "dhahania" },
  { kitendawili: "Ninaimba bila mdomo", jibu: "Upepo", kikundi: "asili" },
  { kitendawili: "Watoto wangu wote wamevaa sare moja", jibu: "Mahindi kwenye mche", kikundi: "mimea" },
  { kitendawili: "Ninafunga mlango bila mikono", jibu: "Usiku", kikundi: "dhahania" },
  { kitendawili: "Nina taji lakini si mfalme", jibu: "Jogoo", kikundi: "wanyama" },
  { kitendawili: "Ninaandika bila kalamu", jibu: "Konokono", kikundi: "wanyama" },
  { kitendawili: "Ninakufa kila jioni na kuzaliwa kila asubuhi", jibu: "Jua", kikundi: "asili" },
  { kitendawili: "Ninabeba nyumba yangu ninapotembea", jibu: "Konokono", kikundi: "wanyama" },
  { kitendawili: "Ninalia daima lakini sina huzuni", jibu: "Ndege wa aina fulani", kikundi: "wanyama" },
];

const HATUA_ZA_UTEGAJI = [
  { id: "1", label: "Mtu mmoja asema 'Kitendawili!'" },
  { id: "2", label: "Wenzake wajibu 'Tega!'" },
  { id: "3", label: "Mtu wa kwanza atoa kitendawili" },
  { id: "4", label: "Wenzake wajaribu kutegua kitendawili" },
  { id: "5", label: "Wakikosa, mtu wa kwanza atoa jibu na maelezo" },
];

export const vitendawili: Skill = {
  id: "g6-ksw-kz-vitendawili",
  code: "KZ.3",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Vitendawili",
  description: "Tambua, tega na tegua vitendawili mbalimbali kutoka katika jamii.",
  generate(rng) {
    const branch = randChoice(rng, ["tegua", "oanisha-jibu", "panga-kikundi", "jaza-kitendawili", "panga-utegaji"] as const);

    if (branch === "tegua") {
      const v = randChoice(rng, VITENDAWILI);
      const jibuMbadalaKikundi = Array.from(new Set(VITENDAWILI.filter((x) => x.jibu !== v.jibu && x.kikundi === v.kikundi).map((x) => x.jibu)));
      const jibuMbadalaZote = Array.from(new Set(VITENDAWILI.filter((x) => x.jibu !== v.jibu).map((x) => x.jibu)));
      const makosa = shuffle(rng, jibuMbadalaKikundi).slice(0, 3);
      const makosaZiada = shuffle(rng, jibuMbadalaZote.filter((j) => !makosa.includes(j))).slice(0, 3 - makosa.length);
      const choices = shuffle(rng, [v.jibu, ...makosa, ...makosaZiada].slice(0, 4));
      return {
        kind: "multiple-choice",
        prompt: `Tega kitendawili: "${v.kitendawili}."`,
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
        prompt: "Oanisha kila kitendawili na jibu lake.",
        tokens,
        targets,
        correctMap,
        hint: "Soma kila kitendawili kwa makini na ufikirie maana yake ya ndani.",
        explanation: chosen.map((v) => `"${v.kitendawili}" = "${v.jibu}".`).join(" "),
      };
    }

    if (branch === "panga-kikundi") {
      const vikundi = shuffle(rng, Array.from(new Set(VITENDAWILI.map((v) => v.kikundi)))).slice(0, 3);
      const items = vikundi.flatMap((kikundi) => {
        const v = randChoice(rng, VITENDAWILI.filter((x) => x.kikundi === kikundi));
        return [{ id: `${v.kitendawili}`, label: v.jibu, bucket: kikundi }];
      });
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga majibu haya ya vitendawili kulingana na kikundi kinachohusika.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: vikundi.map((k) => ({ id: k, label: k })),
        correctBucket,
        hint: "Fikiria ni aina gani ya kitu jibu hili linahusu.",
        explanation: "Kila jibu la kitendawili limewekwa katika kikundi kinachokifaa.",
      };
    }

    if (branch === "jaza-kitendawili") {
      const jina = randChoice(rng, KENYAN_NAMES);
      return {
        kind: "fill-blank",
        prompt: `${jina} anaanza mchezo wa vitendawili. Kamilisha mwaliko wake.`,
        before: `${jina} alisema: "`,
        after: `!" Wenzake wakajibu: "Tega!"`,
        correctAnswer: "Kitendawili",
        inputMode: "text",
        hint: "Hiki ndicho neno linalotumika kuanzisha mchezo wa vitendawili.",
        explanation: `Mchezo wa vitendawili huanza kwa neno "Kitendawili!" na kujibiwa kwa "Tega!"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_UTEGAJI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za mchezo wa kutega na kutegua vitendawili kwa mpangilio sahihi.",
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_UTEGAJI.map((h) => h.id),
      hint: "Fikiria jinsi mchezo wa vitendawili unavyoanza hadi unavyomalizika.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_UTEGAJI.map((h) => h.label).join(" → "),
    };
  },
};
