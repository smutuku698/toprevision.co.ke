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

type Aina = "udogo" | "ukubwa";

const AINA_MAELEZO: Record<Aina, string> = {
  udogo: "kiambishi 'ki-' (wingi 'vi-') huonyesha udogo wa nomino",
  ukubwa: "kiambishi 'ji-' (wingi 'ma-') huonyesha ukubwa/mzito wa nomino (matumizi machache zaidi kuliko 'ki-', kwa nomino teule tu)",
};

const MABADILIKO: { wastani: string; umbo: string; aina: Aina; maana: string }[] = [
  { wastani: "mtoto", umbo: "kitoto", aina: "udogo", maana: "mtoto mdogo sana" },
  { wastani: "mti", umbo: "kijiti", aina: "udogo", maana: "kijiti kidogo" },
  { wastani: "mlima", umbo: "kilima", aina: "udogo", maana: "mlima mdogo" },
  { wastani: "mto", umbo: "kijito", aina: "udogo", maana: "mto mdogo" },
  { wastani: "ndege", umbo: "kidege", aina: "udogo", maana: "ndege mdogo" },
  { wastani: "gari", umbo: "kigari", aina: "udogo", maana: "gari dogo la kukokotwa" },
  { wastani: "nyumba", umbo: "kijumba", aina: "udogo", maana: "nyumba ndogo" },
  { wastani: "jani", umbo: "kijani", aina: "udogo", maana: "jani dogo" },
  { wastani: "jiko", umbo: "kijiko", aina: "udogo", maana: "kifaa kidogo cha kulia (kijiko)" },
  { wastani: "meza", umbo: "kijimeza", aina: "udogo", maana: "meza ndogo" },
  { wastani: "mtu", umbo: "kijitu", aina: "udogo", maana: "mtu mfupi/mdogo" },
  { wastani: "shamba", umbo: "kishamba", aina: "udogo", maana: "shamba dogo" },
  { wastani: "duka", umbo: "kiduka", aina: "udogo", maana: "duka dogo" },
  { wastani: "sanduku", umbo: "kisanduku", aina: "udogo", maana: "sanduku dogo" },
  { wastani: "soko", umbo: "kisoko", aina: "udogo", maana: "soko dogo" },
  { wastani: "mtu", umbo: "jitu", aina: "ukubwa", maana: "mtu mkubwa mno (jitu/kimo kikubwa)" },
  { wastani: "nyumba", umbo: "jumba", aina: "ukubwa", maana: "nyumba kubwa sana (jumba/kasri)" },
  { wastani: "jiko", umbo: "jijiko", aina: "ukubwa", maana: "chombo kikubwa cha kupikia" },
  { wastani: "jani", umbo: "jijani", aina: "ukubwa", maana: "jani kubwa mno" },
];

export const ukubwaNaUdogoWaNominoKiJi: Skill = {
  id: "g6-ksw-sarufi-ukubwa-na-udogo-wa-nomino-ki-ji",
  code: "SA.19",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Ukubwa na Udogo wa Nomino (ki- na ji-)",
  description: "Tambua na uunde maumbo ya udogo (ki-) na ukubwa (ji-) kutokana na nomino za kawaida.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-umbo", "oanisha-maana", "panga-aina", "jaza-sentensi", "hali-halisi"] as const);

    if (branch === "chagua-umbo") {
      const m = randChoice(rng, MABADILIKO);
      const makosaChanzo = shuffle(rng, MABADILIKO.filter((x) => x.wastani !== m.wastani || x.umbo !== m.umbo)).slice(0, 3).map((x) => x.umbo);
      const choices = shuffle(rng, [m.umbo, ...makosaChanzo]);
      return {
        kind: "multiple-choice",
        prompt: `Ni umbo lipi la ${m.aina} la "${m.wastani}"?`,
        choices,
        correctIndex: choices.indexOf(m.umbo),
        layout: "row",
        hint: AINA_MAELEZO[m.aina],
        explanation: `Umbo la ${m.aina} la "${m.wastani}" ni "${m.umbo}" — ${m.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, MABADILIKO).slice(0, 6);
      const tokens = chosen.map((m) => ({ id: `${m.wastani}-${m.umbo}`, label: m.umbo }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${m.wastani}-${m.umbo}`, label: m.maana }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[`${m.wastani}-${m.umbo}`] = `${m.wastani}-${m.umbo}`;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kama neno hili linaonyesha kitu kidogo (ki-) au kikubwa (ji-).",
        explanation: chosen.map((m) => `"${m.umbo}" maana yake ni ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const chosen = shuffle(rng, MABADILIKO).slice(0, 6);
      const items = chosen.map((m) => ({ id: `${m.wastani}-${m.umbo}`, label: m.umbo, bucket: m.aina }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga maneno haya: je, ni umbo la udogo (ki-) au ukubwa (ji-)?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "udogo", label: "Udogo (ki-)" },
          { id: "ukubwa", label: "Ukubwa (ji-)" },
        ],
        correctBucket,
        hint: "Maneno yenye 'ki-' mwanzoni ni udogo; yenye 'ji-' mwanzoni ni ukubwa.",
        explanation: "Kiambishi 'ki-' huonyesha udogo; kiambishi 'ji-' huonyesha ukubwa.",
      };
    }

    if (branch === "jaza-sentensi") {
      const m = randChoice(rng, MABADILIKO);
      const jina = randChoice(rng, KENYAN_NAMES);
      const mahali = randChoice(rng, KENYAN_PLACES);
      const TEMPLATES = [
        { before: `${jina} wa ${mahali} alionyesha wenzake `, after: ` aliyoipata.` },
        { before: `Katika soko la ${mahali}, ${jina} aliona `, after: ` iliyokuwa ikiuzwa.` },
        { before: `${jina} alisimulia kuhusu `, after: ` aliyoiona huko ${mahali}.` },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `Kamilisha sentensi kwa umbo la ${m.aina} la "${m.wastani}".`,
        before: t.before,
        after: t.after,
        correctAnswer: m.umbo,
        inputMode: "text",
        hint: AINA_MAELEZO[m.aina],
        explanation: `Sentensi kamili: "${t.before}${m.umbo}${t.after}" — ${m.maana}.`,
      };
    }

    const m = randChoice(rng, MABADILIKO);
    const jina = randChoice(rng, KENYAN_NAMES);
    const mahali = randChoice(rng, KENYAN_PLACES);
    const kamili = `${jina} wa ${mahali} aliona ${m.umbo} lisilo la kawaida.`;
    const maneno = kamili.replace(".", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: `Panga maneno haya kuunda sentensi sahihi yenye umbo la ${m.aina}.`,
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: AINA_MAELEZO[m.aina],
      explanation: `Sentensi sahihi ni: "${kamili}" — ${m.maana}.`,
    };
  },
};
