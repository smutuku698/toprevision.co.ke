import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 11.4.2-3 Ukubwa na Udogo wa Nomino — Kiambishi m- na n-
// (Uwekezaji). Ona curriculum-reference/grade-5/kiswahili.json.

type Hali = "WASTANI" | "UKUBWA" | "UDOGO";

const HALI_LABELS: Record<Hali, string> = {
  WASTANI: "Hali ya Wastani",
  UKUBWA: "Hali ya Ukubwa",
  UDOGO: "Hali ya Udogo",
};

// Ukubwa: nomino za m- zenye mzizi wa silabi mbili huhamia ngeli ya JI-MA kwa kuondoa "m-"
// (mtoto -> toto, mlango -> lango, mkate -> kate — kama design inavyoonyesha: "mtoto (toto-kitoto)");
// mzizi wa silabi moja huchukua "ji-" (mtu -> jitu, mti -> jiti, mto -> jito). Udogo: "ki-" + mzizi.
const NOMINO: { wastani: string; ukubwa: string; udogo: string }[] = [
  { wastani: "mtoto", ukubwa: "toto", udogo: "kitoto" },
  { wastani: "mlango", ukubwa: "lango", udogo: "kilango" },
  { wastani: "mkate", ukubwa: "kate", udogo: "kikate" },
  { wastani: "mkono", ukubwa: "kono", udogo: "kikono" },
  { wastani: "mguu", ukubwa: "guu", udogo: "kiguu" },
  { wastani: "mlima", ukubwa: "lima", udogo: "kilima" },
  { wastani: "mfuko", ukubwa: "fuko", udogo: "kifuko" },
  { wastani: "mtu", ukubwa: "jitu", udogo: "kijitu" },
  { wastani: "mti", ukubwa: "jiti", udogo: "kijiti" },
  { wastani: "mto", ukubwa: "jito", udogo: "kijito" },
];

export const ukubwaNaUdogoWaNomino: Skill = {
  id: "g5-ksw-sarufi-ukubwa-udogo-nomino",
  code: "SA.13",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Ukubwa na Udogo wa Nomino — Kiambishi m- na n- (Uwekezaji)",
  description: "Tambua na ubadilishe nomino kutoka hali ya wastani kwenda ukubwa na udogo (mfano: mtoto-jitoto-kitoto).",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-hali", "oanisha-udogo", "panga-hali", "jaza-umbo", "panga-mfuatano"] as const);

    if (branch === "tambua-hali") {
      const n = randChoice(rng, NOMINO);
      const hali = randChoice(rng, ["WASTANI", "UKUBWA", "UDOGO"] as const);
      const umbo = hali === "WASTANI" ? n.wastani : hali === "UKUBWA" ? n.ukubwa : n.udogo;
      const choices = shuffle(rng, ["Hali ya Wastani", "Hali ya Ukubwa", "Hali ya Udogo"]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "hali ya nomino hii")} "${umbo}" (kutoka "${n.wastani}").`,
        choices,
        correctIndex: choices.indexOf(HALI_LABELS[hali]),
        layout: "row",
        hint: "Hali ya udogo huanza kwa 'ki-'; hali ya ukubwa huondoa 'm-' (au huchukua 'ji-' kwa mzizi mfupi).",
        explanation: `"${umbo}" ni ${HALI_LABELS[hali].toLowerCase()} ya "${n.wastani}".`,
      };
    }

    if (branch === "oanisha-udogo") {
      const chosen = shuffle(rng, NOMINO).slice(0, 4);
      const tokens = chosen.map((n) => ({ id: n.wastani, label: n.wastani }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.wastani, label: n.udogo }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.wastani] = n.wastani;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nomino ya wastani na umbo lake la udogo"),
        tokens,
        targets,
        correctMap,
        hint: "Nomino za udogo huanza kwa kiambishi 'ki-'.",
        explanation: chosen.map((n) => `"${n.wastani}" katika hali ya udogo ni "${n.udogo}".`).join(" "),
      };
    }

    if (branch === "panga-hali") {
      const chosen = shuffle(rng, NOMINO).slice(0, 3);
      const items = chosen.flatMap((n, i) => [
        { id: `${i}-w`, label: n.wastani, bucket: "WASTANI" },
        { id: `${i}-u`, label: n.ukubwa, bucket: "UKUBWA" },
        { id: `${i}-d`, label: n.udogo, bucket: "UDOGO" },
      ]);
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const item of shuffled) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "hali ya nomino: wastani, ukubwa au udogo"),
        items: shuffled.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "WASTANI", label: "Hali ya Wastani" },
          { id: "UKUBWA", label: "Hali ya Ukubwa" },
          { id: "UDOGO", label: "Hali ya Udogo" },
        ],
        correctBucket,
        hint: "Wastani huanza kwa 'm-'; udogo huanza kwa 'ki-'; ukubwa huondoa 'm-' (au huchukua 'ji-').",
        explanation: "Nomino zimepangwa kulingana na hali yake ya ukubwa, udogo au wastani.",
      };
    }

    if (branch === "jaza-umbo") {
      const n = randChoice(rng, NOMINO);
      const hali = randChoice(rng, ["UKUBWA", "UDOGO"] as const);
      const umbo = hali === "UKUBWA" ? n.ukubwa : n.udogo;
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: `Umbo la "${n.wastani}" katika ${HALI_LABELS[hali].toLowerCase()} ni "`,
        after: `".`,
        correctAnswer: umbo,
        inputMode: "text",
        hint: hali === "UKUBWA" ? "Hali ya ukubwa huondoa 'm-' (mtoto -> toto); mzizi mfupi huchukua 'ji-' (mtu -> jitu)." : "Hali ya udogo huanza kwa 'ki-'.",
        explanation: `"${n.wastani}" katika ${HALI_LABELS[hali].toLowerCase()} huwa "${umbo}".`,
      };
    }

    const n = randChoice(rng, NOMINO);
    const items = [
      { id: "wastani", label: n.wastani },
      { id: "ukubwa", label: n.ukubwa },
      { id: "udogo", label: n.udogo },
    ];
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `umbo la nomino "${n.wastani}" kutoka wastani, ukubwa, kisha udogo`),
      instruction: "Bofya maumbo kwa mpangilio: wastani, ukubwa, udogo.",
      items: shuffle(rng, items),
      correctOrder: ["wastani", "ukubwa", "udogo"],
      hint: "Wastani ndio umbo la kawaida kabla ya kubadilishwa.",
      explanation: `Wastani "${n.wastani}" -> ukubwa "${n.ukubwa}" -> udogo "${n.udogo}".`,
    };
  },
};
