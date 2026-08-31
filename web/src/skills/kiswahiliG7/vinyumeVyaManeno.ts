import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIVUMISHI: { neno: string; kinyume: string }[] = [
  { neno: "kubwa", kinyume: "dogo" },
  { neno: "nzuri", kinyume: "mbaya" },
  { neno: "refu", kinyume: "fupi" },
  { neno: "nyeupe", kinyume: "nyeusi" },
  { neno: "tajiri", kinyume: "maskini" },
  { neno: "safi", kinyume: "chafu" },
];

const NOMINO_KINYUME: { neno: string; kinyume: string }[] = [
  { neno: "furaha", kinyume: "huzuni" },
  { neno: "amani", kinyume: "vita" },
  { neno: "upendo", kinyume: "chuki" },
  { neno: "ushindi", kinyume: "kushindwa" },
];

const YOTE = [...VIVUMISHI.map((v) => ({ ...v, aina: "Kivumishi" as const })), ...NOMINO_KINYUME.map((n) => ({ ...n, aina: "Nomino" as const }))];

const SENTENSI_MUKTADHA: { before: string; after: string; neno: string; kinyume: string; sahihi: string; makosa: string[] }[] = [
  {
    before: "Nyumba ya Bwana Kamau ni kubwa, lakini nyumba ya jirani yake ni",
    after: ".",
    neno: "kubwa",
    kinyume: "dogo",
    sahihi: "dogo",
    makosa: ["kubwa", "refu", "safi"],
  },
  {
    before: "Baada ya kushinda mashindano, wanafunzi walijawa na furaha, ilhali walioshindwa walijawa na",
    after: ".",
    neno: "furaha",
    kinyume: "huzuni",
    sahihi: "huzuni",
    makosa: ["amani", "upendo", "ushindi"],
  },
];

export const vinyumeVyaManeno: Skill = {
  id: "g7-ksw-sarufi-vinyume-vya-maneno",
  code: "SA.6",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Vinyume vya Maneno",
  description: "Tambua na utumie ipasavyo vinyume vya nomino na vivumishi katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha-kinyume", "panga-aina-neno", "chagua-kinyume", "jaza-kinyume", "sentensi-muktadha", "panga-sentensi"] as const);

    if (branch === "oanisha-kinyume") {
      const chosen = shuffle(rng, YOTE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.neno, label: v.neno })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.neno, label: v.kinyume })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.neno] = v.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno na kinyume chake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria maana kinyume kabisa cha kila neno.",
        explanation: chosen.map((v) => `Kinyume cha "${v.neno}" ni "${v.kinyume}".`).join(" "),
      };
    }

    if (branch === "panga-aina-neno") {
      const chosen = [...shuffle(rng, VIVUMISHI).slice(0, 3), ...shuffle(rng, NOMINO_KINYUME).slice(0, 3)];
      const items = chosen.map((v) => ({
        id: v.neno,
        label: v.neno,
        bucket: VIVUMISHI.includes(v as (typeof VIVUMISHI)[number]) ? "Kivumishi" : "Nomino",
      }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila neno kama Kivumishi (kinachoeleza sifa) au Nomino (kinachotaja kitu/hali).",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Kivumishi", label: "Kivumishi" },
          { id: "Nomino", label: "Nomino" },
        ],
        correctBucket,
        hint: "Kivumishi hueleza sifa ya nomino; nomino hutaja kitu, mtu, au hali.",
        explanation: chosen
          .map((v) => `"${v.neno}" ni ${VIVUMISHI.includes(v as (typeof VIVUMISHI)[number]) ? "kivumishi" : "nomino"}.`)
          .join(" "),
      };
    }

    if (branch === "chagua-kinyume") {
      const entry = randChoice(rng, YOTE);
      const distractors = shuffle(rng, YOTE.filter((v) => v.neno !== entry.neno).map((v) => v.kinyume)).slice(0, 3);
      const choices = shuffle(rng, [entry.kinyume, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Kinyume cha neno "${entry.neno}" ni kipi?`,
        choices,
        correctIndex: choices.indexOf(entry.kinyume),
        layout: "grid",
        hint: `Fikiria maana kinyume kabisa cha "${entry.neno}".`,
        explanation: `Kinyume cha "${entry.neno}" ni "${entry.kinyume}".`,
      };
    }

    if (branch === "jaza-kinyume") {
      const entry = randChoice(rng, YOTE);
      return {
        kind: "fill-blank",
        prompt: "Andika kinyume sahihi cha neno lililotolewa.",
        before: `Kinyume cha "${entry.neno}" ni`,
        after: ".",
        correctAnswer: entry.kinyume,
        inputMode: "text",
        hint: `Fikiria maana kinyume kabisa cha "${entry.neno}".`,
        explanation: `Kinyume cha "${entry.neno}" ni "${entry.kinyume}".`,
      };
    }

    if (branch === "sentensi-muktadha") {
      const entry = randChoice(rng, SENTENSI_MUKTADHA);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Chagua neno linalokamilisha sentensi ipasavyo: "${entry.before} ___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: `Sentensi hii inaonyesha ulinganisho wa kinyume — fikiria kinyume cha "${entry.neno}".`,
        explanation: `Neno sahihi ni "${entry.sahihi}": "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, SENTENSI_MUKTADHA);
    const kamili = `${entry.before} ${entry.sahihi}${entry.after}`.replace(/\.$/, "");
    const words = kamili.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi inayotumia vinyume vya maneno ipasavyo.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Soma maneno kwa makini na uwaze maana kamili ya sentensi.",
      explanation: `Sentensi sahihi ni: "${kamili}."`,
    };
  },
};
