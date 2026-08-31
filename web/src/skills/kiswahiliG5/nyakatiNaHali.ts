import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 10.4.1 Nyakati na Hali — Hali ya Mazoea (hu-) na Hali Timilifu (me-)
// (Kudhibiti Itikadi za Kidini na za Kijamii). Ona curriculum-reference/grade-5/kiswahili.json.

type Hali = "MAZOEA" | "TIMILIFU";

const HALI_LABELS: Record<Hali, string> = {
  MAZOEA: "Hali ya Mazoea (hu-)",
  TIMILIFU: "Hali Timilifu (me-)",
};

const HALI_MAANA: Record<Hali, string> = {
  MAZOEA: "kitendo kinachofanyika mara kwa mara, kama desturi",
  TIMILIFU: "kitendo kilichokamilika hivi karibuni",
};

const JOZI: { mzizi: string; nafsi: string; mazoea: string; timilifu: string }[] = [
  { mzizi: "amka", nafsi: "Mtoto", mazoea: "huamka", timilifu: "ameamka" },
  { mzizi: "la", nafsi: "Yeye", mazoea: "hula", timilifu: "amekula" },
  { mzizi: "soma", nafsi: "Mwanafunzi", mazoea: "husoma", timilifu: "amesoma" },
  { mzizi: "cheza", nafsi: "Watoto", mazoea: "hucheza", timilifu: "wamecheza" },
  { mzizi: "oga", nafsi: "Baba", mazoea: "huoga", timilifu: "ameoga" },
  { mzizi: "enda", nafsi: "Mama", mazoea: "huenda", timilifu: "ameenda" },
  { mzizi: "lala", nafsi: "Mtoto", mazoea: "hulala", timilifu: "amelala" },
];

const SENTENSI: { hali: Hali; sentensi: string }[] = JOZI.flatMap((j) => [
  { hali: "MAZOEA" as Hali, sentensi: `${j.nafsi} ${j.mazoea} kila siku.` },
  { hali: "TIMILIFU" as Hali, sentensi: `${j.nafsi} ${j.timilifu} sasa hivi.` },
]);

export const nyakatiNaHali: Skill = {
  id: "g5-ksw-sarufi-nyakati-na-hali",
  code: "SA.11",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Nyakati na Hali — Hali ya Mazoea (hu-) na Hali Timilifu (me-)",
  description: "Tambua na utumie hali ya mazoea (hu-) na hali timilifu (me-) katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-hali", "oanisha-mazoea-timilifu", "panga-hali", "jaza-umbo", "panga-ratiba"] as const);

    if (branch === "tambua-hali") {
      const s = randChoice(rng, SENTENSI);
      const choices = shuffle(rng, ["Hali ya Mazoea (hu-)", "Hali Timilifu (me-)"]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "hali ya kitenzi katika sentensi hii")} "${s.sentensi}"`,
        choices,
        correctIndex: choices.indexOf(HALI_LABELS[s.hali]),
        layout: "row",
        hint: HALI_MAANA[s.hali],
        explanation: `Sentensi hii iko katika ${HALI_LABELS[s.hali].toLowerCase()}: ${HALI_MAANA[s.hali]}.`,
      };
    }

    if (branch === "oanisha-mazoea-timilifu") {
      const chosen = shuffle(rng, JOZI).slice(0, 4);
      const tokens = chosen.map((j) => ({ id: j.mzizi, label: `${j.nafsi} ${j.mazoea}.` }));
      const targets = shuffle(rng, chosen).map((j) => ({ id: j.mzizi, label: `${j.nafsi} ${j.timilifu}.` }));
      const correctMap: Record<string, string> = {};
      for (const j of chosen) correctMap[j.mzizi] = j.mzizi;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "sentensi ya hali ya mazoea na hali timilifu ya kitenzi kilekile"),
        tokens,
        targets,
        correctMap,
        hint: "Tafuta kitenzi kilekile katika hali zote mbili.",
        explanation: chosen.map((j) => `"${j.nafsi} ${j.mazoea}" (mazoea) inalingana na "${j.nafsi} ${j.timilifu}" (timilifu).`).join(" "),
      };
    }

    if (branch === "panga-hali") {
      const chosen = shuffle(rng, SENTENSI).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`${i}`] = s.hali));
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi iko katika hali ya mazoea au hali timilifu"),
        items: chosen.map((s, i) => ({ id: `${i}`, label: s.sentensi })),
        buckets: [
          { id: "MAZOEA", label: "Hali ya Mazoea (hu-)" },
          { id: "TIMILIFU", label: "Hali Timilifu (me-)" },
        ],
        correctBucket,
        hint: "Kiambishi 'hu-' huonyesha mazoea; kiambishi 'me-' huonyesha kitendo kilichokamilika.",
        explanation: "Sentensi zenye 'hu-' ni hali ya mazoea; zenye 'me-' ni hali timilifu.",
      };
    }

    if (branch === "jaza-umbo") {
      const j = randChoice(rng, JOZI);
      const hali = randChoice(rng, ["MAZOEA", "TIMILIFU"] as const);
      const umbo = hali === "MAZOEA" ? j.mazoea : j.timilifu;
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: `${j.nafsi} `,
        after: hali === "MAZOEA" ? " kila siku." : " sasa hivi.",
        correctAnswer: umbo,
        inputMode: "text",
        hint: HALI_MAANA[hali],
        explanation: `Umbo sahihi ni "${umbo}".`,
      };
    }

    const j = randChoice(rng, JOZI);
    const items = [
      { id: "mzizi", label: `ku${j.mzizi}` },
      { id: "mazoea", label: j.mazoea },
      { id: "timilifu", label: j.timilifu },
    ];
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `umbo la kitenzi "${j.mzizi}" kutoka mzizi hadi hali zake mbili`),
      instruction: "Bofya maumbo kwa mpangilio: mzizi, hali ya mazoea, hali timilifu.",
      items: shuffle(rng, items),
      correctOrder: ["mzizi", "mazoea", "timilifu"],
      hint: "Anza na mzizi wa kitenzi kabla ya maumbo yaliyonyambuliwa.",
      explanation: `Mzizi "ku${j.mzizi}" -> mazoea "${j.mazoea}" -> timilifu "${j.timilifu}".`,
    };
  },
};
