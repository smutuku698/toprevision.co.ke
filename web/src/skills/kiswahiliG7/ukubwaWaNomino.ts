import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const UKUBWA: { kawaida: string; ukubwa: string }[] = [
  { kawaida: "mtu", ukubwa: "jitu" },
  { kawaida: "nyoka", ukubwa: "joka" },
  { kawaida: "mji", ukubwa: "jiji" },
  { kawaida: "meza", ukubwa: "jimeza" },
  { kawaida: "jiko", ukubwa: "jijiko" },
  { kawaida: "sahani", ukubwa: "jisahani" },
];

const SENTENSI_MUKTADHA: { before: string; after: string; kawaida: string; sahihi: string; makosa: string[] }[] = [
  {
    before: "Wanakijiji walishangaa waliposikia hadithi ya",
    after: " aliyeonekana mtoni Tana.",
    kawaida: "nyoka",
    sahihi: "joka",
    makosa: ["nyoka", "mti", "mtu"],
  },
  {
    before: "Mkulima aliweka mazao yote juu ya",
    after: " kubwa jikoni.",
    kawaida: "meza",
    sahihi: "jimeza",
    makosa: ["meza", "kiti", "sahani"],
  },
];

export const ukubwaWaNomino: Skill = {
  id: "g7-ksw-sarufi-ukubwa-wa-nomino",
  code: "SA.10",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Ukubwa wa Nomino",
  description: "Badilisha nomino za kawaida kuwa hali ya ukubwa (jitu, joka, jiji, na kadhalika) na uzitumie ipasavyo katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha-ukubwa", "panga-kawaida-ukubwa", "icon-ukubwa", "jaza-ukubwa", "sentensi-ukubwa", "panga-sentensi-ukubwa"] as const);

    if (branch === "oanisha-ukubwa") {
      const chosen = shuffle(rng, UKUBWA).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((u) => ({ id: u.kawaida, label: u.kawaida })));
      const targets = shuffle(rng, chosen.map((u) => ({ id: u.kawaida, label: u.ukubwa })));
      const correctMap: Record<string, string> = {};
      for (const u of chosen) correctMap[u.kawaida] = u.kawaida;
      return {
        kind: "click-match",
        prompt: "Oanisha kila nomino ya kawaida na umbo lake la hali ya ukubwa.",
        tokens,
        targets,
        correctMap,
        hint: "Hali ya ukubwa mara nyingi huongeza kiambishi awali 'ji-' kwenye nomino ya kawaida.",
        explanation: chosen.map((u) => `Hali ya ukubwa ya "${u.kawaida}" ni "${u.ukubwa}".`).join(" "),
      };
    }

    if (branch === "panga-kawaida-ukubwa") {
      const chosen = shuffle(rng, UKUBWA).slice(0, 4);
      const items = chosen.flatMap((u) => [
        { id: `k-${u.kawaida}`, label: u.kawaida, bucket: "Kawaida" },
        { id: `u-${u.ukubwa}`, label: u.ukubwa, bucket: "Ukubwa" },
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila nomino kama Kawaida au Hali ya Ukubwa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Kawaida", label: "Kawaida" },
          { id: "Ukubwa", label: "Hali ya Ukubwa" },
        ],
        correctBucket,
        hint: "Maneno yenye kiambishi awali 'ji-' cha ziada mara nyingi huonyesha hali ya ukubwa.",
        explanation: chosen.map((u) => `"${u.kawaida}" ni kawaida; "${u.ukubwa}" ni hali yake ya ukubwa.`).join(" "),
      };
    }

    if (branch === "icon-ukubwa") {
      const entry = randChoice(rng, UKUBWA);
      const distractors = shuffle(rng, UKUBWA.filter((u) => u.kawaida !== entry.kawaida).map((u) => u.ukubwa)).slice(0, 3);
      const choices = shuffle(rng, [entry.ukubwa, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Fikiria kitu kidogo kikibadilika kuwa kikubwa zaidi, kama mchemraba ulioonyeshwa ungeongezeka ukubwa. Ni umbo lipi la hali ya ukubwa la nomino "${entry.kawaida}"?`,
        visual: { type: "icon-set", icon: "cube", count: 1, color: "#7c3aed" },
        choices,
        correctIndex: choices.indexOf(entry.ukubwa),
        layout: "grid",
        hint: "Ongeza kiambishi awali 'ji-' kwenye nomino ya kawaida.",
        explanation: `Hali ya ukubwa ya "${entry.kawaida}" ni "${entry.ukubwa}".`,
      };
    }

    if (branch === "jaza-ukubwa") {
      const entry = randChoice(rng, UKUBWA);
      return {
        kind: "fill-blank",
        prompt: "Andika hali ya ukubwa ya nomino iliyotolewa.",
        before: `Hali ya ukubwa ya "${entry.kawaida}" ni`,
        after: ".",
        correctAnswer: entry.ukubwa,
        inputMode: "text",
        hint: "Ongeza kiambishi awali 'ji-' kwenye nomino ya kawaida.",
        explanation: `Hali ya ukubwa ya "${entry.kawaida}" ni "${entry.ukubwa}".`,
      };
    }

    if (branch === "sentensi-ukubwa") {
      const entry = randChoice(rng, SENTENSI_MUKTADHA);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Chagua neno linalokamilisha sentensi ipasavyo, likionyesha hali ya ukubwa: "${entry.before} ___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: `Nomino ya kawaida hapa ni "${entry.kawaida}" — tafuta hali yake ya ukubwa.`,
        explanation: `Neno sahihi ni "${entry.sahihi}": "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, SENTENSI_MUKTADHA);
    const kamili = `${entry.before} ${entry.sahihi}${entry.after}`.replace(/\.$/, "");
    const words = kamili.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi inayotumia hali ya ukubwa ipasavyo.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Nomino ya kawaida hapa ni "${entry.kawaida}".`,
      explanation: `Sentensi sahihi ni: "${kamili}."`,
    };
  },
};
