import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 4.4.1 Ngeli ya I-ZI (Saa na Majira).
// Ona curriculum-reference/grade-5/kiswahili.json.

const NOMINO_IZI = [
  "nguo", "ndizi", "ndoo", "nyumba", "saa", "safari", "siku", "meza", "sufuria", "kalamu",
] as const;

const NOMINO_NJE_YA_IZI: { neno: string; ngeli: string }[] = [
  { neno: "mtoto", ngeli: "A-WA" },
  { neno: "mti", ngeli: "U-I" },
  { neno: "kitabu", ngeli: "KI-VI" },
  { neno: "jicho", ngeli: "JI-MA" },
];

const SENTENSI_IZI: { neno: string; kiambishi: string; before: string; after: string }[] = [
  { neno: "nguo", kiambishi: "i", before: "", after: " hii ni safi." },
  { neno: "nguo", kiambishi: "zi", before: "", after: " hizi ni safi." },
  { neno: "ndizi", kiambishi: "i", before: "", after: " hii imeiva." },
  { neno: "ndizi", kiambishi: "zi", before: "", after: " hizi zimeiva." },
  { neno: "ndoo", kiambishi: "i", before: "", after: " hii imejaa maji." },
  { neno: "nyumba", kiambishi: "zi", before: "", after: " hizi ni kubwa." },
  { neno: "saa", kiambishi: "i", before: "", after: " hii inafanya kazi vizuri." },
  { neno: "safari", kiambishi: "i", before: "", after: " hii itakuwa ndefu." },
  { neno: "siku", kiambishi: "zi", before: "", after: " hizi zimekuwa za joto." },
  { neno: "meza", kiambishi: "i", before: "", after: " hii imetengenezwa vizuri." },
  { neno: "sufuria", kiambishi: "zi", before: "", after: " hizi ni kubwa kwa mapishi." },
  { neno: "kalamu", kiambishi: "i", before: "", after: " hii imekwisha wino." },
];

export const ngeliIZi: Skill = {
  id: "g5-ksw-sarufi-ngeli-i-zi",
  code: "SA.5",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Ngeli ya I-ZI (Saa na Majira)",
  description: "Tambua viambishi vipatanishi vya ngeli ya I-ZI (mfano: nguo-nguo, ndizi-ndizi) katika umoja na wingi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kiambishi", "oanisha-umoja-wingi", "panga-ngeli", "jaza-kiambishi", "panga-siku"] as const);

    if (branch === "tambua-kiambishi") {
      const s = randChoice(rng, SENTENSI_IZI);
      const choices = shuffle(rng, ["i-", "zi-", "a-", "ki-"]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "kiambishi kipatanishi sahihi")} "${s.neno}${s.after}"`,
        choices,
        correctIndex: choices.indexOf(`${s.kiambishi}-`),
        layout: "row",
        hint: "Nomino za ngeli ya I-ZI huchukua kiambishi 'i-' umojani na 'zi-' wingini.",
        explanation: `"${s.neno}" ni nomino ya ngeli ya I-ZI, hivyo huchukua kiambishi '${s.kiambishi}-' hapa.`,
      };
    }

    if (branch === "oanisha-umoja-wingi") {
      const chosen = shuffle(rng, NOMINO_IZI).slice(0, 4);
      const tokens = chosen.map((n, i) => ({ id: `${i}`, label: `${n} moja` }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: `${chosen.indexOf(n)}`, label: `${n} nyingi` }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_n, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nomino ya ngeli ya I-ZI umojani na wingi wake"),
        tokens,
        targets,
        correctMap,
        hint: "Nomino za I-ZI hazibadiliki umbo lake kati ya umoja na wingi — kiambishi tegemezi ndicho kinachobadilika.",
        explanation: chosen.map((n) => `"${n}" umoja na wingi wake ni umbo lilelile, lakini kiambishi hubadilika kutoka i- kwenda zi-.`).join(" "),
      };
    }

    if (branch === "panga-ngeli") {
      const izi = shuffle(rng, NOMINO_IZI).slice(0, 4).map((n) => ({ id: n, label: n, bucket: "IZI" }));
      const nje = shuffle(rng, NOMINO_NJE_YA_IZI).slice(0, 4).map((n) => ({ id: n.neno, label: n.neno, bucket: "NYINGINE" }));
      const items = shuffle(rng, [...izi, ...nje]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo nomino ni ya ngeli ya I-ZI au ngeli nyingine"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "IZI", label: "Ngeli ya I-ZI" },
          { id: "NYINGINE", label: "Ngeli Nyingine" },
        ],
        correctBucket,
        hint: "Nomino za I-ZI huchukua i-/zi- kama viambishi vipatanishi.",
        explanation: "Nomino za ngeli ya I-ZI ni pamoja na nguo, ndizi, ndoo, nyumba, saa, meza na kadhalika.",
      };
    }

    if (branch === "jaza-kiambishi") {
      const s = randChoice(rng, SENTENSI_IZI);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: `${s.neno} `,
        after: s.after.replace(/^ /, " "),
        correctAnswer: s.kiambishi === "i" ? "hii" : "hizi",
        inputMode: "text",
        hint: "Chagua 'hii' kwa umoja au 'hizi' kwa wingi.",
        explanation: `Sentensi kamili: "${s.neno} ${s.kiambishi === "i" ? "hii" : "hizi"}${s.after}"`,
      };
    }

    const nyakati = shuffle(rng, ["saa", "safari", "siku"]).slice(0, 3);
    const items = nyakati.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "nomino hizi za ngeli ya I-ZI kwa mpangilio wa alfabeti"),
      instruction: "Bofya maneno kwa mpangilio wa alfabeti.",
      items: shuffle(rng, items),
      correctOrder: [...items].sort((a, b) => a.label.localeCompare(b.label, "sw")).map((i) => i.id),
      hint: "Linganisha herufi ya kwanza ya kila neno.",
      explanation: `Mpangilio wa alfabeti: ${[...nyakati].sort((a, b) => a.localeCompare(b, "sw")).join(", ")}.`,
    };
  },
};
