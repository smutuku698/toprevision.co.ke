import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 3.4.1-3 Nomino za Makundi, Ambata na Dhahania (Mapambo).
// Ona curriculum-reference/grade-5/kiswahili.json.

type Aina = "MAKUNDI" | "AMBATA" | "DHAHANIA";

const NOMINO_AMBATA: { neno: string; sehemu: [string, string] }[] = [
  { neno: "askarikanzu", sehemu: ["askari", "kanzu"] },
  { neno: "mbwamwitu", sehemu: ["mbwa", "mwitu"] },
  { neno: "mwanasiasa", sehemu: ["mwana", "siasa"] },
  { neno: "mwananchi", sehemu: ["mwana", "nchi"] },
  { neno: "mwanafunzi", sehemu: ["mwana", "funzi"] },
  { neno: "mwanamichezo", sehemu: ["mwana", "michezo"] },
  { neno: "askarijeshi", sehemu: ["askari", "jeshi"] },
];

const NOMINO_DHAHANIA = [
  "upendo", "uhodari", "ukweli", "uzuri", "uchafu", "ujasiri", "elimu", "amani",
] as const;

const NOMINO_MAKUNDI = [
  "kundi", "kikosi", "jamii", "familia", "kikundi", "umati", "msafara",
] as const;

const AINA_LABELS: Record<Aina, string> = {
  MAKUNDI: "Nomino ya Makundi",
  AMBATA: "Nomino Ambata",
  DHAHANIA: "Nomino ya Dhahania",
};

const SENTENSI_JAZA: { jibu: string; aina: Aina; before: string; after: string }[] = [
  { jibu: "mwananchi", aina: "AMBATA", before: "Kila ", after: " ana wajibu wa kulinda mali ya umma." },
  { jibu: "mwanafunzi", aina: "AMBATA", before: "", after: " huyo ni mwerevu sana darasani." },
  { jibu: "askarikanzu", aina: "AMBATA", before: "", after: " alisimama mlangoni akilinda ofisi." },
  { jibu: "upendo", aina: "DHAHANIA", before: "Familia yao ina ", after: " mkubwa." },
  { jibu: "ukweli", aina: "DHAHANIA", before: "Ni muhimu kusema ", after: " daima." },
  { jibu: "elimu", aina: "DHAHANIA", before: "", after: " ni ufunguo wa maisha bora." },
  { jibu: "amani", aina: "DHAHANIA", before: "Nchi hii inahitaji ", after: " na utulivu." },
  { jibu: "kundi", aina: "MAKUNDI", before: "Tuliona ", after: " kubwa la ndege wakiruka." },
  { jibu: "familia", aina: "MAKUNDI", before: "", after: " yote ilikusanyika Krismasi." },
  { jibu: "msafara", aina: "MAKUNDI", before: "", after: " wa magari ulipita mjini." },
];

export const nominoZaMakundiAmbataDhahania: Skill = {
  id: "g5-ksw-sarufi-nomino-makundi-ambata-dhahania",
  code: "SA.3",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Nomino za Makundi, Ambata na Dhahania (Mapambo)",
  description: "Tambua na utumie nomino za makundi (mfano: kundi), ambata (mfano: mwananchi) na dhahania (mfano: upendo) katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-aina", "oanisha-ambata", "panga-aina", "jaza-neno", "panga-sehemu"] as const);

    if (branch === "tambua-aina") {
      const chagua = randChoice(rng, [
        ...NOMINO_MAKUNDI.map((n) => ({ neno: n, aina: "MAKUNDI" as Aina })),
        ...NOMINO_AMBATA.map((n) => ({ neno: n.neno, aina: "AMBATA" as Aina })),
        ...NOMINO_DHAHANIA.map((n) => ({ neno: n, aina: "DHAHANIA" as Aina })),
      ]);
      const choices = shuffle(rng, ["Nomino ya Makundi", "Nomino Ambata", "Nomino ya Dhahania"]);
      const sahihi = AINA_LABELS[chagua.aina];
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "aina ya nomino")} Neno: "${chagua.neno}".`,
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "list",
        hint: "Nomino ambata huwa na maneno mawili yaliyoungana; nomino za dhahania hutaja hali isiyoshikika; nomino za makundi hutaja kundi la vitu/watu.",
        explanation: `"${chagua.neno}" ni ${sahihi.toLowerCase()}.`,
      };
    }

    if (branch === "oanisha-ambata") {
      const chosen = shuffle(rng, NOMINO_AMBATA).slice(0, 4);
      const tokens = chosen.map((n, i) => ({ id: `${i}`, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: `${chosen.indexOf(n)}`, label: `"${n.sehemu[0]}" + "${n.sehemu[1]}"` }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_n, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nomino ambata na maneno mawili yanayoiunda"),
        tokens,
        targets,
        correctMap,
        hint: "Gawa neno katikati kutafuta maneno mawili yaliyoungana.",
        explanation: chosen.map((n) => `"${n.neno}" limeundwa na "${n.sehemu[0]}" na "${n.sehemu[1]}".`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const makundi = shuffle(rng, NOMINO_MAKUNDI).slice(0, 3).map((n) => ({ id: n, label: n, bucket: "MAKUNDI" as Aina }));
      const ambata = shuffle(rng, NOMINO_AMBATA).slice(0, 3).map((n) => ({ id: n.neno, label: n.neno, bucket: "AMBATA" as Aina }));
      const dhahania = shuffle(rng, NOMINO_DHAHANIA).slice(0, 3).map((n) => ({ id: n, label: n, bucket: "DHAHANIA" as Aina }));
      const items = shuffle(rng, [...makundi, ...ambata, ...dhahania]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "aina ya nomino: makundi, ambata au dhahania"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "MAKUNDI", label: "Nomino ya Makundi" },
          { id: "AMBATA", label: "Nomino Ambata" },
          { id: "DHAHANIA", label: "Nomino ya Dhahania" },
        ],
        correctBucket,
        hint: "Angalia iwapo neno hutaja kundi, limeungana kutoka maneno mawili, au hutaja hali isiyoshikika.",
        explanation: "Nomino hizi zimepangwa kulingana na aina yake: makundi, ambata, au dhahania.",
      };
    }

    if (branch === "jaza-neno") {
      const s = randChoice(rng, SENTENSI_JAZA);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: s.before,
        after: s.after,
        correctAnswer: s.jibu,
        inputMode: "text",
        hint: `Neno linalokosekana ni ${AINA_LABELS[s.aina].toLowerCase()}.`,
        explanation: `Sentensi kamili: "${s.before}${s.jibu}${s.after}"`,
      };
    }

    const n = randChoice(rng, NOMINO_AMBATA);
    const items = [
      { id: "a", label: n.sehemu[0] },
      { id: "b", label: n.sehemu[1] },
    ];
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `maneno mawili ili kuunda nomino ambata "${n.neno}"`),
      instruction: "Bofya maneno mawili kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: ["a", "b"],
      hint: "Fikiria neno gani huja kwanza katika nomino ambata hii.",
      explanation: `"${n.sehemu[0]}" + "${n.sehemu[1]}" = "${n.neno}".`,
    };
  },
};
